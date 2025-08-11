// 가사 싱크
// src/components/karaoke-player-settings/LyricsOffsetMenuMenu.tsx
import { BackButton } from '@components/common/BackButton';
import React, { useEffect, useRef, useState } from 'react';
import styles from './MainMenu.module.css';
import { LyricsOffsetControl } from './LyricsOffsetControl';
import { Line } from '@lib/types/lyrics';
import { applyOffsetToLyrics } from '@lib/utils/lyrics/lyricsOffset';
import { SingleLineLyrics } from '@components/lyrics/SingleLineLyrics/SingleLineLyrics';

interface LyricsOffsetMenuProps {
  originalLyrics: Line[];
  offset: number;
  onBack: () => void;
  onOffsetChange?: (offset: number, offsetLyrics: Line[]) => void;
  currentTime?: number;
}

export const LyricsOffsetMenu: React.FC<LyricsOffsetMenuProps> = ({
  originalLyrics, // baseLyrics가 전달됨
  offset: initialOffset,
  onBack,
  onOffsetChange,
  currentTime = 0,
}) => {
  const [offset, setOffset] = useState(initialOffset ?? 0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [offsetLyrics, setOffsetLyrics] = useState<Line[]>(originalLyrics);
  const videoRef = useRef<HTMLVideoElement>(null); // 부모에서 비디오 엘리먼트 ref를 props로 전달받거나 별도 관리 필요
  // const lastCommittedOffset = useRef<number | null>(null);

  useEffect(() => {
    setOffset(initialOffset ?? 0);
    setOffsetLyrics(applyOffsetToLyrics(originalLyrics, initialOffset ?? 0, 0));
  }, [initialOffset, originalLyrics]);

  // 현재 video 요소 가져오기
  useEffect(() => {
    const vid = document.querySelector('video');
    if (vid instanceof HTMLVideoElement) {
      videoRef.current = vid;
      console.log('[LyricsOffsetMenu] video element 참조 성공:', vid);
    } else {
      console.warn('[LyricsOffsetMenu] video element를 찾지 못했습니다.');
    }
  }, []);
  /*
  // 슬라이더 드래그 끝났을 때 — 자동 재생 테스트
  const handleOffsetCommit = async (finalOffset: number) => {
    if (!videoRef.current || isAutoPlaying) return;

    const appliedLyrics = applyOffsetToLyrics(originalLyrics, finalOffset, 0);
    setOffset(finalOffset);
    setOffsetLyrics(appliedLyrics);

    // 부모 콜백 호출
    onOffsetChange?.(finalOffset, appliedLyrics);
    setIsAutoPlaying(true);

    // YouTube IFrame API player 객체 얻기 (content script에서 전역 YT 플레이어 참조)
    const rawPlayerElement = document.querySelector('#movie_player');
    const getPlayerMethod =
      rawPlayerElement &&
      typeof (rawPlayerElement as unknown as { getPlayer?: () => YT.Player }).getPlayer === 'function'
        ? (rawPlayerElement as unknown as { getPlayer: () => YT.Player }).getPlayer
        : undefined;

    const player: YT.Player | undefined =
      window.ytPlayer ?? (getPlayerMethod ? getPlayerMethod.call(rawPlayerElement) : undefined);

    try {
      if (player) {
        console.log('[LyricsOffsetMenu] IFrame API player 사용');
        // 현재 시간에서 가장 가까운 가사 찾기
        const adjCurrentTime = player.getCurrentTime() - finalOffset;

        let currentIndex = appliedLyrics.findIndex((line, idx) => {
          const next = appliedLyrics[idx + 1];
          return adjCurrentTime >= line.time && (!next || adjCurrentTime < next.time);
        });
        if (currentIndex === -1) currentIndex = 0;

        const currentLine = appliedLyrics[currentIndex];
        const nextLine = appliedLyrics[currentIndex + 1];
        if (!currentLine) return;

        const segmentStart = currentLine.time + finalOffset;
        const segmentEnd = nextLine ? Math.min(nextLine.time + finalOffset, segmentStart + 5) : segmentStart + 2;

        await skipPreviewSegment(player, segmentStart, segmentEnd, 5);
      } else {
        console.warn('[LyricsOffsetMenu] IFrame API player 없음 → video element 사용');
        await playOffsetTestSegment(
          videoRef,
          appliedLyrics,
          finalOffset,
          () => setIsAutoPlaying(false), // 재생 종료 시점
          5,
        );
      }
    } catch (e) {
      console.warn('[handleOffsetCommit] 자동재생 실패:', e);
    } finally {
      setIsAutoPlaying(false);
    }
  };
*/

  /** 적용 버튼 — 영상 위치는 그대로 두고 가사만 offset 반영 */
  const handleApplyOffset = () => {
    // 항상 원본(originalLyrics) 기준으로 적용
    const appliedLyrics = applyOffsetToLyrics(originalLyrics, offset, 0);
    setOffsetLyrics(appliedLyrics);

    // 부모에게 적용된 값 알림
    onOffsetChange?.(offset, appliedLyrics);

    // content script에 메시지 전송하여 즉시 반영
    chrome.runtime.sendMessage(
      {
        type: 'APPLY_OFFSET_LYRICS',
        payload: { offset, lyrics: appliedLyrics },
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[LyricsOffsetMenu] APPLY_OFFSET_LYRICS 전송 오류:', chrome.runtime.lastError.message);
        } else {
          console.log('[LyricsOffsetMenu] APPLY_OFFSET_LYRICS 전송 완료');
        }
      },
    );

    setIsAutoPlaying(false);
  };
  // 미세 조정 버튼
  /*
  const adjustOffset = (delta: number) => {
    const newOffset = parseFloat((offset + delta).toFixed(2));
    handleOffsetCommit(newOffset);
  };
  */

  return (
    <div className="submenuContainer">
      <div className={styles.horizontalHeader}>
        <BackButton onClick={onBack} />
        <h2 className={styles.menuTitle}>가사 오프셋 설정</h2>
      </div>
      <hr className={styles.divider} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px', // 버튼과 슬라이더 간 간격
          margin: '20px 0',
        }}
      >
        <LyricsOffsetControl
          initialOffset={offset}
          min={-15}
          max={15}
          step={1}
          onChange={(val) => setOffset(val)}
          onCommit={(val) => setOffset(val)}
        />
        <button
          onClick={handleApplyOffset}
          style={{
            height: '36px',
            marginLeft: 'auto', // 오른쪽에 붙이기 원할 때 사용
          }}
        >
          적용
        </button>
      </div>

      {isAutoPlaying && (
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          <SingleLineLyrics
            lyrics={offsetLyrics} // 최신 offset 적용된 가사
            offset={0} // ✅ offsetLyrics에 이미 offset 적용됨
            currentTime={videoRef.current?.currentTime ?? currentTime}
            fontColor="#fff"
          />
        </div>
      )}

      <hr className={styles.divider} />
      <p style={{ padding: '12px 16px', color: '#ccc', fontSize: 14 }}>
        가사 자막의 타이밍이 맞지 않을 때, 여기서 미세 조절하세요.
      </p>
    </div>
  );
};
