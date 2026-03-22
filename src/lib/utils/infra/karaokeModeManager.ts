/**
 * 카라오케 모드 상태 관리 및 제어 매니저
 * 영화관 모드 전환, 녹음 상태 추적, 가라오케 UI 토글 등을 담당
 */

import { Line } from '@lib/types/lyrics';
import { enableTheaterMode, disableTheaterMode } from '@lib/utils/platform/theaterMode';
import { saveCaptionStateAndDisable, restoreCaptionState } from '@lib/utils/platform/captionControl';
import { STORAGE_KEYS } from '@constants/storageKeys';
import i18next from 'i18next';

type RecordingState = 'idle' | 'recording' | 'paused';

interface KaraokeModeManagerCallbacks {
  onShowToast?: (message: string) => void;
  onModeChanged?: (isVisible: boolean) => void;
  onLyricsChanged?: (lyrics: Line[]) => void;
  onSongInfoChanged?: (title: string, artist: string) => void;
}

/**
 * 카라오케 모드 매니저 클래스
 * 싱글톤 패턴으로 전역에서 하나의 인스턴스만 사용
 */
export class KaraokeModeManager {
  private isKaraokeModeVisible: boolean = false;
  private lyrics: Line[] = [];
  private songTitle: string = '';
  private songArtist: string = '';
  private recordingState: RecordingState = 'idle';
  private callbacks: KaraokeModeManagerCallbacks = {};

  constructor(callbacks?: KaraokeModeManagerCallbacks) {
    this.callbacks = callbacks || {};
    this.setupRecordingStateListener();
  }

  /**
   * 녹음 상태 변경 이벤트 리스너 등록
   */
  private setupRecordingStateListener(): void {
    window.addEventListener('acapella-recording-state-change', (event: Event) => {
      const customEvent = event as CustomEvent<{ recordingState: string; recordedAudioUrl: string | null }>;
      this.recordingState = customEvent.detail.recordingState as RecordingState;
      console.log(`[KaraokeModeManager] 녹음 상태 변경: ${this.recordingState}`);
    });
  }

  /**
   * 현재 가라오케 모드 활성화 여부 반환
   */
  public isVisible(): boolean {
    return this.isKaraokeModeVisible;
  }

  /**
   * 현재 가사 데이터 반환
   */
  public getLyrics(): Line[] {
    return this.lyrics;
  }

  /**
   * 가사 데이터 설정
   */
  public setLyrics(lyrics: Line[]): void {
    this.lyrics = lyrics;
    this.callbacks.onLyricsChanged?.(lyrics);
    console.log(`[KaraokeModeManager] 가사 데이터 업데이트: ${lyrics.length}줄`);
  }

  /**
   * 현재 곡 정보 반환
   */
  public getSongTitle(): string {
    return this.songTitle;
  }

  public getSongArtist(): string {
    return this.songArtist;
  }

  /**
   * 곡 정보 설정 (사이드바 헤더에 표시)
   */
  public setSongInfo(title: string, artist: string): void {
    this.songTitle = title;
    this.songArtist = artist;
    this.callbacks.onSongInfoChanged?.(title, artist);
    console.log(`[KaraokeModeManager] 곡 정보 업데이트: ${artist} - ${title}`);
  }

  /**
   * 카라오케 모드 토글 (활성화/비활성화)
   * @param skipTheaterModeRestore - true면 해제 시 영화관 모드 복원 생략 (모드 버튼으로 해제할 때)
   */
  public async toggleKaraokeMode(skipTheaterModeRestore: boolean = false): Promise<void> {
    // 가라오케 모드를 켜려고 할 때만 확장 활성화 상태 확인
    if (!this.isKaraokeModeVisible) {
      const result = await chrome.storage.sync.get([STORAGE_KEYS.CONTENT_ENABLED]);
      const isExtensionEnabled = result[STORAGE_KEYS.CONTENT_ENABLED] ?? false;

      if (!isExtensionEnabled) {
        // 확장이 비활성화되어 있으면 토스트 메시지 표시 후 차단
        this.callbacks.onShowToast?.('확장 프로그램을 먼저 활성화해주세요 (우측 상단 확장 아이콘 클릭)');
        return;
      }

      enableTheaterMode();
      // YouTube 자막 상태 저장 후 비활성화
      saveCaptionStateAndDisable();
    } else {
      // 가라오케 모드를 끄려고 할 때 녹음 중이면 확인
      if (this.recordingState === 'recording' || this.recordingState === 'paused') {
        // 녹음 중이면 자동 일시정지
        if (this.recordingState === 'recording') {
          window.dispatchEvent(new CustomEvent('acapella-pause-recording'));
        }

        const userChoice = window.confirm(i18next.t('extAcapellaSaveAndLeaveConfirm'));

        if (userChoice) {
          // 확인 클릭: 저장 요청 이벤트 발생
          window.dispatchEvent(new CustomEvent('acapella-save-and-close'));
          // 저장 완료까지 대기 (간단한 딜레이)
          await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
          // 취소 클릭: 저장하지 않고 나가기
          window.dispatchEvent(new CustomEvent('acapella-discard-and-close'));
        }
      }
    }

    // 가라오케 모드 토글
    this.isKaraokeModeVisible = !this.isKaraokeModeVisible;
    console.log(`[KaraokeModeManager] 가라오케 모드 ${this.isKaraokeModeVisible ? '활성화' : '비활성화'}`);

    // 콜백 호출 (KaraokeModeContainer cleanup 먼저 실행)
    this.callbacks.onModeChanged?.(this.isKaraokeModeVisible);

    // 카라오케 모드 비활성화 완료 후 모드 복원 처리 (cleanup 이후 실행)
    if (!this.isKaraokeModeVisible && !skipTheaterModeRestore) {
      // musicNoteButton 클릭 또는 기타 이유로 해제: 무조건 기본 모드로 전환
      // cleanup이 완료된 후 실행되도록 setTimeout 사용
      setTimeout(() => {
        disableTheaterMode();
        // YouTube 자막 상태 복원
        restoreCaptionState();
        console.log('[KaraokeModeManager] 카라오케 모드 비활성화 - 기본 모드로 복원');
      }, 100);
    } else if (!this.isKaraokeModeVisible) {
      // 모드 버튼 클릭으로 해제: 모드 전환 생략 (이미 사용자가 모드 변경함)
      // YouTube 자막 상태 복원
      restoreCaptionState();
      console.log('[KaraokeModeManager] 카라오케 모드 비활성화 - 모드 전환 생략 (사용자가 이미 변경함)');
    }
  }

  /**
   * 콜백 함수 등록
   */
  public setCallbacks(callbacks: KaraokeModeManagerCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
}
