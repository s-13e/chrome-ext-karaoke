// AcapellaRecording.tsx
// 무반주 녹음 컴포넌트
import React, { useState, useEffect, useCallback } from 'react';
import {
  MdMic,
  MdStop,
  MdPlayArrow,
  MdDownload,
  MdFiberManualRecord,
  MdHeadset,
  MdWarning,
  MdPause,
  MdReplay,
  MdArrowBackIosNew,
} from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import styles from './AcapellaRecording.module.css';
import { STORAGE_KEYS } from '@constants/storageKeys';
import {
  RECORDING_CONFIG,
  RECORDING_FILE_CONFIG,
  AUDIO_DEVICE_KEYWORDS,
  AUDIO_STREAM_CONFIG,
  DEVICE_LABEL_CONFIG,
} from '@constants/recordingConfig';
import { Line } from '@lib/types/lyrics';
import { ConfirmModal } from './ConfirmModal';

interface AcapellaRecordingProps {
  onBack: () => void;
  lyrics?: Line[];
}

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface MediaRecorderWithTimer extends MediaRecorder {
  timerId?: number;
}

interface RecordingItem {
  id: string;
  filename: string;
  timestamp: number;
  duration: number;
  audioData: string;
}

/**
 * 무반주 녹음 컴포넌트
 * - 마이크 권한 확인
 * - 오디오 출력 기기 감지 (헤드셋/이어폰)
 * - 녹음 시작/중지
 * - 녹음 재생
 * - 파일 저장
 */
export const AcapellaRecording: React.FC<AcapellaRecordingProps> = ({ onBack, lyrics = [] }) => {
  const { t } = useTranslation();
  const [recordingState, setRecordingState] = useState<
    'idle' | 'checking' | 'device-check' | 'ready' | 'countdown' | 'recording' | 'paused' | 'recorded'
  >('idle');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [hasHeadsetConnected, setHasHeadsetConnected] = useState<boolean>(false);
  const [hasAcceptedLegalNotice, setHasAcceptedLegalNotice] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0); // 녹음 시작 시점 저장
  const [countdownStartTime, setCountdownStartTime] = useState<number>(0); // 카운트다운 시작 시점
  const [, setVideoCurrentTime] = useState<number>(0); // 비디오 현재 시간 (카운트다운용)

  /**
   * 녹음 상태 변경 시 전역 이벤트 발생
   */
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('acapella-recording-state-change', {
        detail: { recordingState, recordedAudioUrl },
      }),
    );
  }, [recordingState, recordedAudioUrl]);

  /**
   * 녹음 중지
   */
  const handleStopRecording = useCallback(() => {
    console.log('[AcapellaRecording] 녹음 중지');

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      // 타이머 정리
      const recorderWithTimer = mediaRecorder as MediaRecorderWithTimer & { levelIntervalId?: number };
      if (recorderWithTimer.timerId) {
        clearInterval(recorderWithTimer.timerId);
      }
      if (recorderWithTimer.levelIntervalId) {
        clearInterval(recorderWithTimer.levelIntervalId);
      }

      mediaRecorder.stop();
      setMediaRecorder(null);
      setRecordingState('recorded');
      setAudioLevel(0);

      // YouTube 비디오 일시정지
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video) {
        video.pause();
      }
    }
  }, [mediaRecorder]);

  /**
   * 파일 저장 (Chrome Storage에만 저장)
   */
  const handleSaveToStorage = useCallback(async () => {
    console.log('[AcapellaRecording] 파일 저장');

    if (recordedAudioUrl) {
      const timestamp = new Date().getTime();
      // YouTube 제목을 파일명에 포함 (모든 언어의 문자, 숫자, 공백, 하이픈 허용)
      const sanitizedTitle = videoTitle
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .substring(0, RECORDING_CONFIG.MAX_FILENAME_LENGTH);
      const filename = sanitizedTitle
        ? `${sanitizedTitle}-${timestamp}${RECORDING_FILE_CONFIG.FILE_EXTENSION}`
        : `${RECORDING_FILE_CONFIG.DEFAULT_FILENAME_PREFIX}${timestamp}${RECORDING_FILE_CONFIG.FILE_EXTENSION}`;

      try {
        // Blob을 Base64로 변환
        const response = await fetch(recordedAudioUrl);
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onloadend = async () => {
          const base64data = reader.result as string;

          // 기존 녹음 목록 가져오기
          const result = await chrome.storage.local.get(STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST);
          const existingRecordings = (result[STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST] as RecordingItem[]) || [];

          // 새 녹음 추가
          const newRecording: RecordingItem = {
            id: timestamp.toString(),
            filename,
            timestamp,
            duration: recordingTime,
            audioData: base64data,
          };

          const updatedRecordings = [...existingRecordings, newRecording];

          // Storage에 저장 (최대 설정된 개수만 유지)
          const limitedRecordings = updatedRecordings.slice(-RECORDING_CONFIG.MAX_RECORDINGS_STORED);
          await chrome.storage.local.set({ [STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST]: limitedRecordings });

          console.log('[AcapellaRecording] 녹음 파일이 저장되었습니다:', filename);
          alert(t('extAcapellaSaveSuccess'));
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('[AcapellaRecording] Storage 저장 오류:', error);
        alert(t('extAcapellaSaveError'));
      }
    }
  }, [recordedAudioUrl, videoTitle, recordingTime, t]);

  /**
   * 녹음 중단 및 현재 녹음 저장
   */
  const handleStopAndSaveRecording = useCallback(async (): Promise<void> => {
    return new Promise((resolve) => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        // 녹음 중지 이벤트 리스너 추가
        const handleStop = async () => {
          mediaRecorder.removeEventListener('stop', handleStop);
          // 약간의 지연을 주어 recordedAudioUrl이 설정될 시간 확보
          setTimeout(async () => {
            if (recordedAudioUrl) {
              await handleSaveToStorage();
            }
            resolve();
          }, RECORDING_CONFIG.SAVE_DELAY);
        };

        mediaRecorder.addEventListener('stop', handleStop);
        handleStopRecording();
      } else if (recordedAudioUrl) {
        // 이미 녹음이 완료된 경우
        handleSaveToStorage().then(resolve);
      } else {
        resolve();
      }
    });
  }, [mediaRecorder, recordedAudioUrl, handleStopRecording, handleSaveToStorage]);

  /**
   * 녹음 일시정지
   */
  const handlePauseRecording = useCallback(() => {
    console.log('[AcapellaRecording] 녹음 일시정지');

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setRecordingState('paused');

      // 타이머 일시정지
      const recorderWithTimer = mediaRecorder as MediaRecorderWithTimer & { levelIntervalId?: number };
      if (recorderWithTimer.timerId) {
        clearInterval(recorderWithTimer.timerId);
      }
      if (recorderWithTimer.levelIntervalId) {
        clearInterval(recorderWithTimer.levelIntervalId);
      }

      // YouTube 비디오 일시정지
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video) {
        video.pause();
      }
    }
  }, [mediaRecorder]);

  /**
   * 가라오케 모드 해제 시 저장/삭제/일시정지 이벤트 수신
   */
  useEffect(() => {
    const handlePauseRecordingEvent = () => {
      console.log('[AcapellaRecording] 일시정지 이벤트 수신');
      handlePauseRecording();
    };

    const handleSaveAndClose = async () => {
      console.log('[AcapellaRecording] 저장하고 닫기 이벤트 수신');
      await handleStopAndSaveRecording();
    };

    const handleDiscardAndClose = () => {
      console.log('[AcapellaRecording] 저장하지 않고 닫기 이벤트 수신');
      // 녹음 중이면 중지
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        handleStopRecording();
      }
      // URL 정리
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };

    window.addEventListener('acapella-pause-recording', handlePauseRecordingEvent);
    window.addEventListener('acapella-save-and-close', handleSaveAndClose);
    window.addEventListener('acapella-discard-and-close', handleDiscardAndClose);

    return () => {
      window.removeEventListener('acapella-pause-recording', handlePauseRecordingEvent);
      window.removeEventListener('acapella-save-and-close', handleSaveAndClose);
      window.removeEventListener('acapella-discard-and-close', handleDiscardAndClose);
    };
  }, [mediaRecorder, recordedAudioUrl, handleStopRecording, handleStopAndSaveRecording, handlePauseRecording]);

  /**
   * 법적 고지 동의 여부 확인 및 YouTube 영상 제목 가져오기
   */
  useEffect(() => {
    chrome.storage.sync.get(STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED, (result) => {
      const accepted = result[STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED] as boolean | undefined;
      if (accepted) {
        setHasAcceptedLegalNotice(true);
      }
    });

    // YouTube 영상 제목 가져오기
    const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
    if (titleElement) {
      const title = titleElement.textContent || 'Unknown';
      setVideoTitle(title.trim());
    }
  }, []);

  /**
   * 실제 녹음 시작 로직
   */
  const startRecording = useCallback(async () => {
    try {
      // 마이크 스트림 가져오기
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: AUDIO_STREAM_CONFIG.ECHO_CANCELLATION,
          noiseSuppression: AUDIO_STREAM_CONFIG.NOISE_SUPPRESSION,
          autoGainControl: AUDIO_STREAM_CONFIG.AUTO_GAIN_CONTROL,
        },
      });

      // 오디오 레벨 모니터링 설정
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = RECORDING_CONFIG.FFT_SIZE;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const recorder = new MediaRecorder(stream, {
        mimeType: RECORDING_FILE_CONFIG.MIME_TYPE,
      });

      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: RECORDING_FILE_CONFIG.MIME_TYPE });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingState('recording');
      setRecordingTime(0);

      // 녹음 시간 타이머 시작
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, RECORDING_CONFIG.TIMER_INTERVAL) as unknown as number;

      // 오디오 레벨 모니터링
      const levelInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255); // 0-1 범위로 정규화
      }, RECORDING_CONFIG.AUDIO_LEVEL_INTERVAL) as unknown as number;

      // 타이머 ID 저장 (정리용)
      (recorder as MediaRecorderWithTimer).timerId = timer;
      (recorder as MediaRecorderWithTimer & { levelIntervalId?: number }).levelIntervalId = levelInterval;
    } catch (error) {
      console.error('[AcapellaRecording] 녹음 시작 오류:', error);
      alert(t('extAcapellaRecordingStartError'));
    }
  }, [selectedMicrophone, t]);

  /**
   * 카운트다운 중 비디오 시간 추적 및 녹음 자동 시작
   */
  useEffect(() => {
    if (recordingState !== 'countdown') return;

    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) return;

    const handleTimeUpdate = () => {
      setVideoCurrentTime(video.currentTime);

      // 카운트다운 종료 시점(녹음 시작 시점)에 도달하면 녹음 시작
      if (video.currentTime >= countdownStartTime) {
        console.log('[AcapellaRecording] 카운트다운 종료 - 녹음 시작');

        // 카운트다운 종료 이벤트 발생
        window.dispatchEvent(new CustomEvent('acapella-countdown-end'));

        startRecording();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [recordingState, countdownStartTime, startRecording]);

  /**
   * 법적 고지 다이얼로그 표시 (HTML 스타일 적용)
   */
  const showLegalNoticeDialog = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const notAllowed = t('extAcapellaLegalNotAllowed');
      const allowed = t('extAcapellaLegalAllowed');
      const content = t('extAcapellaLegalNoticeContent', { notAllowed, allowed });
      const title = t('extAcapellaLegalNoticeTitle');

      const result = window.confirm(`${title}\n\n${content}`);
      resolve(result);
    });
  };

  /**
   * 오디오 기기 목록 가져오기
   */
  const getAudioDevices = async (): Promise<void> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      // 입력 기기 (마이크)
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label:
            device.label ||
            `${t('extAcapellaMicrophoneDevice')} ${device.deviceId.slice(0, DEVICE_LABEL_CONFIG.DEVICE_ID_DISPLAY_LENGTH)}`,
          kind: device.kind,
        }));

      // 출력 기기 (스피커/헤드셋)
      const audioOutputs = devices
        .filter((device) => device.kind === 'audiooutput')
        .map((device) => ({
          deviceId: device.deviceId,
          label:
            device.label ||
            `${t('extAcapellaSpeakerDevice')} ${device.deviceId.slice(0, DEVICE_LABEL_CONFIG.DEVICE_ID_DISPLAY_LENGTH)}`,
          kind: device.kind,
        }));

      setAudioDevices(audioInputs);
      setOutputDevices(audioOutputs);

      // 기본 마이크 선택
      if (audioInputs.length > 0 && !selectedMicrophone && audioInputs[0]) {
        setSelectedMicrophone(audioInputs[0].deviceId);
      }

      // 헤드셋/이어폰 연결 여부 확인
      const hasHeadset = audioOutputs.some((device) => {
        const label = device.label.toLowerCase();
        return (
          // 헤드셋 키워드 검사
          AUDIO_DEVICE_KEYWORDS.HEADSET.some((keyword) => label.includes(keyword.toLowerCase())) ||
          // 기본 출력이 아니고 스피커가 아닌 경우 헤드셋으로 간주
          (device.deviceId !== 'default' &&
            !AUDIO_DEVICE_KEYWORDS.SPEAKER.some((keyword) => label.includes(keyword.toLowerCase())))
        );
      });

      setHasHeadsetConnected(hasHeadset);
      console.log('[AcapellaRecording] 오디오 입력 기기:', audioInputs);
      console.log('[AcapellaRecording] 오디오 출력 기기:', audioOutputs);
      console.log('[AcapellaRecording] 헤드셋 연결 여부:', hasHeadset);
    } catch (error) {
      console.error('[AcapellaRecording] 오디오 기기 조회 오류:', error);
    }
  };

  /**
   * 마이크 권한 확인 및 오디오 기기 검사
   */
  const handleCheckMicrophone = async () => {
    setRecordingState('checking');
    try {
      // 1. 마이크 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[AcapellaRecording] 마이크 권한 획득 성공');
      setHasPermission(true);

      // 권한 확인 후 스트림 정리
      stream.getTracks().forEach((track) => track.stop());

      // 2. 오디오 기기 목록 가져오기
      await getAudioDevices();

      // 3. 기기 확인 화면으로 전환
      setRecordingState('device-check');
    } catch (error) {
      console.error('[AcapellaRecording] 마이크 권한 오류:', error);
      alert(t('extAcapellaPermissionDenied'));
      setRecordingState('idle');
    }
  };

  /**
   * 오디오 기기 변경 감지
   */
  useEffect(() => {
    if (hasPermission) {
      const handleDeviceChange = () => {
        console.log('[AcapellaRecording] 오디오 기기 변경 감지');
        getAudioDevices();
      };

      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [hasPermission]);

  /**
   * 기기 확인 완료 및 녹음 준비
   */
  const handleConfirmDevices = async () => {
    // 1. 스피커만 있는 경우 차단 (다국어 키워드 지원)
    const hasSpeakerOnly =
      outputDevices.length > 0 &&
      outputDevices.every((device) => {
        const label = device.label.toLowerCase();
        return (
          AUDIO_DEVICE_KEYWORDS.SPEAKER.some((keyword) => label.includes(keyword.toLowerCase())) ||
          device.deviceId === 'default'
        );
      });

    if (hasSpeakerOnly) {
      alert('⚠️ ' + t('extAcapellaHeadsetNotConnected') + '\n\n' + t('extAcapellaHeadsetWarning'));
      return;
    }

    // 2. 헤드셋이 감지되지 않은 경우 경고
    if (!hasHeadsetConnected) {
      const proceed = window.confirm(
        '⚠️ ' + t('extAcapellaHeadsetNotConnected') + '\n\n' + t('extAcapellaHeadsetWarning'),
      );
      if (!proceed) {
        return;
      }
    }

    // 3. 스피커와 헤드셋이 모두 있는 경우 추가 경고
    const hasBothSpeakerAndHeadset =
      outputDevices.some((device) => {
        const label = device.label.toLowerCase();
        return AUDIO_DEVICE_KEYWORDS.SPEAKER.some((keyword) => label.includes(keyword.toLowerCase()));
      }) && hasHeadsetConnected;

    if (hasBothSpeakerAndHeadset) {
      const confirmed = window.confirm(
        '⚠️ ' + t('extAcapellaHeadsetConnected') + '\n\n' + t('extAcapellaHeadsetCheckConfirm'),
      );
      if (!confirmed) {
        return;
      }
    }

    // 4. 법적 고지 동의 (이미 동의한 경우 건너뛰기)
    if (!hasAcceptedLegalNotice) {
      const legalAgreement = await showLegalNoticeDialog();

      if (!legalAgreement) {
        return;
      }

      // 동의 여부를 storage에 저장
      await chrome.storage.sync.set({ [STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED]: true });
      setHasAcceptedLegalNotice(true);
    }

    setRecordingState('ready');
  };

  /**
   * 녹음 시작 (처음부터)
   */
  const handleStartRecordingFromBeginning = async () => {
    console.log('[AcapellaRecording] 녹음 시작 (처음부터)');

    // YouTube 비디오를 처음으로 되돌리고 재생
    const video = document.querySelector('video') as HTMLVideoElement;
    if (video) {
      video.currentTime = 0;
      await video.play();
    }

    // 녹음 시작 시점 저장 (0초)
    setRecordingStartTime(0);
    startRecording();
  };

  /**
   * 녹음 시작 (현재 가사 타임스탬프부터)
   * - 현재 가사의 타임스탬프를 찾아서 4초 전으로 이동
   * - 카운트다운(4321) 후 녹음 시작
   */
  const handleStartRecordingFromCurrent = async () => {
    console.log('[AcapellaRecording] 녹음 시작 (현재 가사부터)');

    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) {
      console.error('[AcapellaRecording] 비디오 엘리먼트를 찾을 수 없습니다.');
      return;
    }

    // 현재 재생 중인 가사 찾기 (현재 시간 이전의 가장 마지막 가사)
    const currentVideoTime = video.currentTime;
    let targetLyricTime = currentVideoTime;

    if (lyrics && lyrics.length > 0) {
      // 현재 시간 이전의 가장 마지막 가사 찾기 (현재 재생 중인 가사)
      const currentLyricIndex = lyrics.findLastIndex((line) => line.time <= currentVideoTime);

      if (currentLyricIndex >= 0 && lyrics[currentLyricIndex]) {
        targetLyricTime = lyrics[currentLyricIndex].time;
        console.log('[AcapellaRecording] 현재 가사 타임스탬프:', targetLyricTime, '초');
      } else {
        // 현재 가사가 없으면 첫 번째 가사 사용
        if (lyrics[0]) {
          targetLyricTime = lyrics[0].time;
          console.log('[AcapellaRecording] 첫 번째 가사 사용:', targetLyricTime, '초');
        } else {
          console.log('[AcapellaRecording] 가사 없음, 현재 시간 사용:', currentVideoTime, '초');
        }
      }
    }

    // 녹음 시작 시점 = 가사 타임스탬프
    setRecordingStartTime(targetLyricTime);

    // 카운트다운 시작 시점 = 가사 타임스탬프 - 카운트다운 지속 시간
    const countdownStart = Math.max(0, targetLyricTime - RECORDING_CONFIG.COUNTDOWN_DURATION);
    setCountdownStartTime(targetLyricTime);

    // 비디오를 카운트다운 시작 시점으로 이동
    video.currentTime = countdownStart;
    video.pause(); // 일시정지 상태로 설정

    // 카운트다운 상태로 전환
    setRecordingState('countdown');

    // 카운트다운 이벤트 발생 (가사 컴포넌트에 전달)
    window.dispatchEvent(
      new CustomEvent('acapella-countdown-start', {
        detail: {
          startTime: targetLyricTime,
          currentTime: countdownStart,
        },
      }),
    );

    // 비디오 재생 시작
    await video.play();

    console.log('[AcapellaRecording] 카운트다운 시작:', countdownStart, '→', targetLyricTime);
  };

  /**
   * 녹음 재개
   */
  const handleResumeRecording = () => {
    console.log('[AcapellaRecording] 녹음 재개');

    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setRecordingState('recording');

      // 타이머 재개
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, RECORDING_CONFIG.TIMER_INTERVAL) as unknown as number;

      // 오디오 레벨 모니터링 재개
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const stream = mediaRecorder.stream;
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = RECORDING_CONFIG.FFT_SIZE;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const levelInterval = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }, RECORDING_CONFIG.AUDIO_LEVEL_INTERVAL) as unknown as number;

      (mediaRecorder as MediaRecorderWithTimer).timerId = timer;
      (mediaRecorder as MediaRecorderWithTimer & { levelIntervalId?: number }).levelIntervalId = levelInterval;

      // YouTube 비디오 재생
      const video = document.querySelector('video') as HTMLVideoElement;
      if (video) {
        video.play();
      }
    }
  };

  /**
   * 다시 녹음 (저장된 시작 시점으로 돌아가기)
   * - 저장된 녹음 시작 시점의 4초 전으로 이동
   * - 카운트다운(4321) 후 녹음 시작
   */
  const handleRestartRecording = async () => {
    console.log('[AcapellaRecording] 다시 녹음 (시작 시점:', recordingStartTime, '초)');

    // 현재 녹음 중지
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      const recorderWithTimer = mediaRecorder as MediaRecorderWithTimer & { levelIntervalId?: number };
      if (recorderWithTimer.timerId) {
        clearInterval(recorderWithTimer.timerId);
      }
      if (recorderWithTimer.levelIntervalId) {
        clearInterval(recorderWithTimer.levelIntervalId);
      }
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    // YouTube 비디오를 카운트다운 시작 시점(4초 전)으로 이동
    const video = document.querySelector('video') as HTMLVideoElement;
    if (!video) {
      console.error('[AcapellaRecording] 비디오 엘리먼트를 찾을 수 없습니다.');
      return;
    }

    // 카운트다운 시작 시점 = 녹음 시작 시점 - 카운트다운 지속 시간
    const countdownStart = Math.max(0, recordingStartTime - RECORDING_CONFIG.COUNTDOWN_DURATION);
    setCountdownStartTime(recordingStartTime);

    video.currentTime = countdownStart;
    video.pause();

    // 카운트다운 상태로 전환
    setRecordingState('countdown');
    setRecordingTime(0);
    setAudioLevel(0);

    // 카운트다운 이벤트 발생 (가사 컴포넌트에 전달)
    window.dispatchEvent(
      new CustomEvent('acapella-countdown-start', {
        detail: {
          startTime: recordingStartTime,
          currentTime: countdownStart,
        },
      }),
    );

    // 비디오 재생 시작
    await video.play();

    console.log('[AcapellaRecording] 카운트다운 시작 (다시 녹음):', countdownStart, '→', recordingStartTime);
  };

  /**
   * 녹음 재생
   */
  const handlePlayRecording = () => {
    console.log('[AcapellaRecording] 녹음 재생');

    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);

      setPlaybackTime(0);
      setIsPlaying(true);

      // 재생 시간 업데이트
      const playbackInterval = setInterval(() => {
        setPlaybackTime(audio.currentTime);
      }, RECORDING_CONFIG.PLAYBACK_UPDATE_INTERVAL);

      audio.onended = () => {
        clearInterval(playbackInterval);
        setIsPlaying(false);
        setPlaybackTime(0);
      };

      audio.play();
    }
  };

  /**
   * 녹음 중 이탈 방지 (뒤로가기 또는 가라오케 모드 해제 시)
   */
  const handleBackWithRecordingCheck = () => {
    // 녹음 중인 경우 자동으로 일시정지
    if (recordingState === 'recording') {
      handlePauseRecording();
      setShowConfirmModal(true);
    } else if (recordingState === 'paused') {
      setShowConfirmModal(true);
    } else {
      // 녹음 중이 아니면 바로 뒤로가기
      onBack();
    }
  };

  /**
   * 모달 확인 핸들러
   */
  const handleModalCancel = () => {
    setShowConfirmModal(false);
  };

  const handleModalDiscardAndLeave = () => {
    setShowConfirmModal(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      handleStopRecording();
    }
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    onBack();
  };

  const handleModalSaveAndLeave = async () => {
    setShowConfirmModal(false);
    await handleStopAndSaveRecording();
    onBack();
  };

  /**
   * 새로운 녹음 시작
   */
  const handleNewRecording = () => {
    // 이전 녹음 URL 정리
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }

    setRecordingState('ready');
    setRecordingTime(0);
  };

  /**
   * 법적 고지 동의 초기화 (테스트용)
   */
  const handleResetLegalAgreement = async () => {
    await chrome.storage.sync.remove(STORAGE_KEYS.ACAPELLA_LEGAL_AGREEMENT_ACCEPTED);
    setHasAcceptedLegalNotice(false);
    alert('법적 고지 동의가 초기화되었습니다.');
  };

  return (
    <div className={styles.container}>
      {/* 헤더: 뒤로가기 버튼 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={handleBackWithRecordingCheck} aria-label={t('extBack')}>
          <MdArrowBackIosNew />
        </button>
        <h2 className={styles.title}>{t('extAcapellaRecordingTitle')}</h2>
      </div>

      {/* 컨텐츠 영역 */}
      <div className={styles.content}>
        {/* 상태: 초기 (마이크 권한 확인 필요) */}
        {recordingState === 'idle' && (
          <div className={styles.initialState}>
            <MdMic size={64} color="#ffffff" />
            <p className={styles.description}>{t('extAcapellaInitialDescription')}</p>
            <p className={styles.hint}>{t('extAcapellaInitialHint')}</p>
            <button className={styles.primaryButton} onClick={handleCheckMicrophone}>
              {t('extAcapellaCheckMicButton')}
            </button>
          </div>
        )}

        {/* 상태: 권한 확인 중 */}
        {recordingState === 'checking' && (
          <div className={styles.checkingState}>
            <MdMic size={64} color="#ffffff" />
            <p className={styles.description}>{t('extAcapellaCheckingDescription')}</p>
          </div>
        )}

        {/* 상태: 오디오 기기 확인 */}
        {recordingState === 'device-check' && (
          <div className={styles.deviceCheckState}>
            <MdHeadset size={64} color={hasHeadsetConnected ? '#4CAF50' : '#FF9800'} />
            <h3 className={styles.subtitle}>{t('extAcapellaDeviceCheckTitle')}</h3>

            {/* 헤드셋 연결 상태 */}
            <div className={styles.deviceStatus}>
              {hasHeadsetConnected ? (
                <div className={styles.statusSuccess}>
                  <MdHeadset size={24} color="#4CAF50" />
                  <span>{t('extAcapellaHeadsetConnected')}</span>
                </div>
              ) : (
                <div className={styles.statusWarning}>
                  <MdWarning size={24} color="#FF9800" />
                  <span>{t('extAcapellaHeadsetNotConnected')}</span>
                  <p className={styles.warningText}>{t('extAcapellaHeadsetWarning')}</p>
                </div>
              )}
            </div>

            {/* 마이크 선택 */}
            <div className={styles.deviceSelector}>
              <label className={styles.deviceLabel}>{t('extAcapellaMicrophoneLabel')}</label>
              <select
                className={styles.deviceSelect}
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
              >
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 출력 기기 목록 */}
            <div className={styles.deviceList}>
              <label className={styles.deviceLabel}>{t('extAcapellaOutputDeviceLabel')}</label>
              <ul className={styles.deviceItems}>
                {outputDevices.length > 0 ? (
                  outputDevices.map((device) => (
                    <li key={device.deviceId} className={styles.deviceItem}>
                      {device.label}
                    </li>
                  ))
                ) : (
                  <li className={styles.deviceItem}>{t('extAcapellaNoOutputDevices')}</li>
                )}
              </ul>
            </div>

            <button className={styles.primaryButton} onClick={handleConfirmDevices}>
              {t('extAcapellaConfirmButton')}
            </button>
          </div>
        )}

        {/* 상태: 녹음 준비 완료 */}
        {recordingState === 'ready' && (
          <div className={styles.readyState}>
            <MdMic size={64} color="#4CAF50" />
            <p className={styles.description}>{t('extAcapellaReadyDescription')}</p>
            <p className={styles.hint}>{t('extAcapellaReadyHint')}</p>
            <div className={styles.actionButtons}>
              <button className={styles.recordButton} onClick={handleStartRecordingFromBeginning}>
                <MdFiberManualRecord size={24} />
                {t('extAcapellaStartRecordingFromBeginning')}
              </button>
              <button className={styles.secondaryButton} onClick={handleStartRecordingFromCurrent}>
                <MdFiberManualRecord size={24} />
                {t('extAcapellaStartRecordingFromCurrent')}
              </button>
            </div>
          </div>
        )}

        {/* 상태: 카운트다운 중 */}
        {recordingState === 'countdown' && (
          <div className={styles.countdownState}>
            <p className={styles.countdownText}>{t('extAcapellaCountdownPreparingText')}</p>
            <p className={styles.hint}>{t('extAcapellaCountdownHint')}</p>
            <p className={styles.hint}>{t('extAcapellaCountdownLocationHint')}</p>
          </div>
        )}

        {/* 상태: 녹음 중 */}
        {recordingState === 'recording' && (
          <div className={styles.recordingState}>
            <div className={styles.recordingIndicator}>
              <MdFiberManualRecord size={64} color="#f44336" className={styles.pulse} />
            </div>
            <p className={styles.recordingText}>{t('extAcapellaRecordingText')}</p>
            <p className={styles.timer}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </p>
            {/* 오디오 레벨 표시 */}
            <div className={styles.audioLevelContainer}>
              <div className={styles.audioLevelBar} style={{ width: `${audioLevel * 100}%` }} />
            </div>
            <div className={styles.iconButtons}>
              <button className={styles.iconButton} onClick={handleRestartRecording} aria-label="Restart recording">
                <MdReplay size={28} />
              </button>
              <button className={styles.iconButton} onClick={handlePauseRecording} aria-label="Pause recording">
                <MdPause size={28} />
              </button>
              <button className={styles.iconButton} onClick={handleStopRecording} aria-label="Stop recording">
                <MdStop size={28} />
              </button>
            </div>
          </div>
        )}

        {/* 상태: 녹음 일시정지 */}
        {recordingState === 'paused' && (
          <div className={styles.recordingState}>
            <div className={styles.recordingIndicator}>
              <MdPause size={64} color="#FF9800" />
            </div>
            <p className={styles.recordingText}>{t('extAcapellaPausedText')}</p>
            <p className={styles.timer}>
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </p>
            <div className={styles.iconButtons}>
              <button className={styles.iconButton} onClick={handleRestartRecording} aria-label="Restart recording">
                <MdReplay size={28} />
              </button>
              <button className={styles.iconButton} onClick={handleResumeRecording} aria-label="Resume recording">
                <MdFiberManualRecord size={28} color="#ff0000ff" />
              </button>
              <button className={styles.iconButton} onClick={handleStopRecording} aria-label="Stop recording">
                <MdStop size={28} />
              </button>
            </div>
          </div>
        )}

        {/* 상태: 녹음 완료 */}
        {recordingState === 'recorded' && (
          <div className={styles.recordedState}>
            <MdMic size={64} color="#2196F3" />
            <p className={styles.description}>{t('extAcapellaRecordedDescription')}</p>
            {/* 재생 시간 표시 */}
            {isPlaying && (
              <p className={styles.timer}>
                {Math.floor(playbackTime / 60)}:
                {Math.floor(playbackTime % 60)
                  .toString()
                  .padStart(2, '0')}
              </p>
            )}
            <div className={styles.actionButtons}>
              <button className={styles.secondaryButton} onClick={handlePlayRecording}>
                <MdPlayArrow size={24} />
                {t('extPlay')}
              </button>
              <button className={styles.primaryButton} onClick={handleSaveToStorage}>
                <MdDownload size={24} />
                {t('extSave')}
              </button>
              <button className={styles.secondaryButton} onClick={handleNewRecording}>
                <MdFiberManualRecord size={24} />
                {t('extAcapellaNewRecordingButton')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 테스트용 초기화 버튼 */}
      <div className={styles.testSection}>
        <button onClick={handleResetLegalAgreement} className={styles.testButton}>
          녹음 법적 고지 초기화
        </button>
      </div>

      {/* 녹음 저장 확인 모달 */}
      {showConfirmModal && (
        <ConfirmModal
          onCancel={handleModalCancel}
          onDiscardAndLeave={handleModalDiscardAndLeave}
          onSaveAndLeave={handleModalSaveAndLeave}
        />
      )}
    </div>
  );
};
