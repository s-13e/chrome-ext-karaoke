// recordingManager.ts
// 녹음 기능 싱글톤 매니저 — 하단바/사이드바 탭 전환에도 상태 유지
// 기존 AcapellaRecording.tsx의 핵심 로직을 추출하여 UI와 분리

import { RECORDING_CONFIG, RECORDING_FILE_CONFIG, AUDIO_STREAM_CONFIG } from '@constants/recordingConfig';
import { STORAGE_KEYS } from '@constants/storageKeys';

/** 녹음 상태 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'recorded';

/** 저장된 녹음 아이템 */
export interface RecordingItem {
  id: string;
  filename: string;
  timestamp: number;
  duration: number;
  audioData: string;
  /** 비교 재생용 메타데이터 — 녹음 시점의 영상 정보 */
  videoId?: string;
  videoStartTime?: number; // 녹음 시작 시 영상의 currentTime (초)
}

/** 매니저 상태 */
interface ManagerState {
  state: RecordingState;
  recordingTime: number;
  audioLevel: number;
  recordedAudioUrl: string | null;
  selectedMicId: string;
}

// 녹음 시작 시 영상 currentTime 저장 (비교 재생용)
let recordingVideoStartTime = 0;

// 싱글톤 상태
let currentState: ManagerState = {
  state: 'idle',
  recordingTime: 0,
  audioLevel: 0,
  recordedAudioUrl: null,
  selectedMicId: '',
};

let mediaRecorder: MediaRecorder | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let levelInterval: ReturnType<typeof setInterval> | null = null;
let audioStream: MediaStream | null = null;
let listeners: Array<() => void> = [];

/** 상태 변경 리스너 */
export function subscribeRecording(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notify() {
  listeners.forEach((l) => l());
}

/** 현재 상태 조회 */
export function getRecordingState(): ManagerState {
  return { ...currentState };
}

/** 타이머 시작 */
function startTimer() {
  stopTimer();
  currentState.recordingTime = 0;
  timerInterval = setInterval(() => {
    currentState.recordingTime += 1;
    notify();
  }, RECORDING_CONFIG.TIMER_INTERVAL);
}

/** 타이머 정지 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/** 오디오 레벨 모니터링 시작 */
function startLevelMonitor() {
  stopLevelMonitor();
  if (!analyser) return;
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  levelInterval = setInterval(() => {
    if (!analyser) return;
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    currentState.audioLevel = average / 255;
    notify();
  }, RECORDING_CONFIG.AUDIO_LEVEL_INTERVAL);
}

/** 오디오 레벨 모니터링 정지 */
function stopLevelMonitor() {
  if (levelInterval) {
    clearInterval(levelInterval);
    levelInterval = null;
  }
  currentState.audioLevel = 0;
}

/** 마이크 권한 확인 + 기기 목록 반환 */
export async function checkMicrophonePermission(): Promise<{
  granted: boolean;
  devices: Array<{ deviceId: string; label: string }>;
}> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());

    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices
      .filter((d) => d.kind === 'audioinput')
      .map((d) => ({
        deviceId: d.deviceId,
        label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`,
      }));

    // 기본 마이크 선택
    if (mics.length > 0 && !currentState.selectedMicId && mics[0]) {
      currentState.selectedMicId = mics[0].deviceId;
    }

    return { granted: true, devices: mics };
  } catch {
    return { granted: false, devices: [] };
  }
}

/** 마이크 선택 */
export function selectMicrophone(deviceId: string): void {
  currentState.selectedMicId = deviceId;
}

/** 녹음 시작 */
export async function startRecording(): Promise<boolean> {
  if (currentState.state === 'recording') return false;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: currentState.selectedMicId ? { exact: currentState.selectedMicId } : undefined,
        echoCancellation: AUDIO_STREAM_CONFIG.ECHO_CANCELLATION,
        noiseSuppression: AUDIO_STREAM_CONFIG.NOISE_SUPPRESSION,
        autoGainControl: AUDIO_STREAM_CONFIG.AUTO_GAIN_CONTROL,
      },
    });
    audioStream = stream;

    // 오디오 레벨 분석
    const ctx = new AudioContext();
    audioContext = ctx;
    const analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = RECORDING_CONFIG.FFT_SIZE;
    analyser = analyserNode;
    const mic = ctx.createMediaStreamSource(stream);
    mic.connect(analyserNode);

    // MediaRecorder
    const recorder = new MediaRecorder(stream, {
      mimeType: RECORDING_FILE_CONFIG.MIME_TYPE,
    });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: RECORDING_FILE_CONFIG.MIME_TYPE });
      const url = URL.createObjectURL(blob);
      currentState.recordedAudioUrl = url;
      currentState.state = 'recorded';
      stopTimer();
      stopLevelMonitor();
      stream.getTracks().forEach((track) => track.stop());
      ctx.close().catch(() => {});
      audioContext = null;
      analyser = null;
      audioStream = null;
      notify();
    };

    // 비교 재생용: 녹음 시작 시점의 영상 currentTime 저장
    const videoEl = document.querySelector<HTMLVideoElement>('video.html5-main-video');
    recordingVideoStartTime = videoEl ? videoEl.currentTime : 0;

    recorder.start();
    mediaRecorder = recorder;
    currentState.state = 'recording';
    currentState.recordedAudioUrl = null;
    startTimer();
    startLevelMonitor();
    notify();

    // 전역 이벤트 (사이드바 아이콘 등에서 상태 확인용)
    window.dispatchEvent(new CustomEvent('recording-state-change', { detail: { state: 'recording' } }));

    return true;
  } catch (error) {
    console.error('[RecordingManager] 녹음 시작 실패:', error);
    return false;
  }
}

/** 녹음 중지 */
export function stopRecording(): void {
  if (!mediaRecorder || mediaRecorder.state === 'inactive') return;
  mediaRecorder.stop();
  mediaRecorder = null;
  window.dispatchEvent(new CustomEvent('recording-state-change', { detail: { state: 'stopped' } }));
}

/** 녹음 일시정지 */
export function pauseRecording(): void {
  if (!mediaRecorder || mediaRecorder.state !== 'recording') return;
  mediaRecorder.pause();
  currentState.state = 'paused';
  stopTimer();
  stopLevelMonitor();
  notify();
}

/** 녹음 재개 */
export function resumeRecording(): void {
  if (!mediaRecorder || mediaRecorder.state !== 'paused') return;
  mediaRecorder.resume();
  currentState.state = 'recording';

  // 타이머 재개 (기존 시간부터 이어서)
  timerInterval = setInterval(() => {
    currentState.recordingTime += 1;
    notify();
  }, RECORDING_CONFIG.TIMER_INTERVAL);

  startLevelMonitor();
  notify();
}

/** 녹음 결과를 Chrome Storage에 저장 */
export async function saveRecording(): Promise<boolean> {
  if (!currentState.recordedAudioUrl) return false;

  try {
    const response = await fetch(currentState.recordedAudioUrl);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // 파일명 생성
        const now = new Date();
        const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

        const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
        const videoTitle = titleEl?.textContent?.trim() ?? 'Unknown';
        const sanitized = videoTitle
          .replace(/[^\p{L}\p{N}\s-]/gu, '')
          .substring(0, RECORDING_CONFIG.MAX_FILENAME_LENGTH);
        const filename = sanitized
          ? `${sanitized}_${dateStr}${RECORDING_FILE_CONFIG.FILE_EXTENSION}`
          : `${RECORDING_FILE_CONFIG.DEFAULT_FILENAME_PREFIX}${dateStr}${RECORDING_FILE_CONFIG.FILE_EXTENSION}`;

        // 비교 재생용 메타데이터
        const video = document.querySelector<HTMLVideoElement>('video.html5-main-video');
        const urlParams = new URLSearchParams(window.location.search);
        const videoId = urlParams.get('v') ?? undefined;
        const videoStartTime = video ? recordingVideoStartTime : undefined;

        const newItem: RecordingItem = {
          id: now.getTime().toString(),
          filename,
          timestamp: now.getTime(),
          duration: currentState.recordingTime,
          audioData: base64data,
          videoId,
          videoStartTime,
        };

        // 기존 목록에 추가
        const result = await chrome.storage.local.get(STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST);
        const existing = (result[STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST] as RecordingItem[]) ?? [];
        const updated = [...existing, newItem].slice(-RECORDING_CONFIG.MAX_RECORDINGS_STORED);
        await chrome.storage.local.set({ [STORAGE_KEYS.ACAPELLA_RECORDINGS_LIST]: updated });

        console.log('[RecordingManager] 녹음 저장 완료:', filename);
        resolve(true);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[RecordingManager] 저장 실패:', error);
    return false;
  }
}

/** 녹음 결과 버리기 */
export function discardRecording(): void {
  if (currentState.recordedAudioUrl) {
    URL.revokeObjectURL(currentState.recordedAudioUrl);
  }
  currentState.recordedAudioUrl = null;
  currentState.state = 'idle';
  currentState.recordingTime = 0;
  currentState.audioLevel = 0;
  notify();
}

/** 녹음 토글 (하단바 버튼용) — idle→recording, recording→stop */
export async function toggleRecording(): Promise<void> {
  switch (currentState.state) {
    case 'idle': {
      const { granted } = await checkMicrophonePermission();
      if (!granted) {
        console.warn('[RecordingManager] 마이크 권한 없음');
        return;
      }
      await startRecording();
      break;
    }
    case 'recording':
      stopRecording();
      break;
    case 'paused':
      resumeRecording();
      break;
    case 'recorded':
      // 이미 녹음 완료 → 새 녹음 시작
      discardRecording();
      await startRecording();
      break;
  }
}

/** 전체 정리 (페이지 전환 시) */
export function destroyRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  stopTimer();
  stopLevelMonitor();
  if (audioStream) {
    audioStream.getTracks().forEach((track) => track.stop());
  }
  if (audioContext) {
    audioContext.close().catch(() => {});
  }
  if (currentState.recordedAudioUrl) {
    URL.revokeObjectURL(currentState.recordedAudioUrl);
  }
  mediaRecorder = null;
  audioContext = null;
  analyser = null;
  audioStream = null;
  currentState = {
    state: 'idle',
    recordingTime: 0,
    audioLevel: 0,
    recordedAudioUrl: null,
    selectedMicId: '',
  };
}
