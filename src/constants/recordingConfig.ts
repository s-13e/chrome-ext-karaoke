/**
 * 무반주 녹음 기능 관련 설정 상수
 */

/**
 * 녹음 설정
 */
export const RECORDING_CONFIG = {
  /** 파일명에 포함할 최대 제목 길이 */
  MAX_FILENAME_LENGTH: 50,
  /** Storage에 저장할 최대 녹음 개수 */
  MAX_RECORDINGS_STORED: 10,
  /** 카운트다운 지속 시간 (초) */
  COUNTDOWN_DURATION: 4,
  /** FFT 크기 (오디오 분석용) */
  FFT_SIZE: 256,
  /** 녹음 시간 타이머 갱신 간격 (밀리초) */
  TIMER_INTERVAL: 1000,
  /** 오디오 레벨 갱신 간격 (밀리초) */
  AUDIO_LEVEL_INTERVAL: 50,
  /** 녹음 저장 전 지연 시간 (밀리초) */
  SAVE_DELAY: 100,
  /** 재생 시간 업데이트 간격 (밀리초) */
  PLAYBACK_UPDATE_INTERVAL: 100,
} as const;

/**
 * 녹음 파일 설정
 */
export const RECORDING_FILE_CONFIG = {
  /** 기본 파일명 접두사 */
  DEFAULT_FILENAME_PREFIX: 'acapella-recording-',
  /** 파일 확장자 */
  FILE_EXTENSION: '.webm',
  /** MIME 타입 */
  MIME_TYPE: 'audio/webm',
} as const;

/**
 * 오디오 기기 감지 키워드
 * 다국어 지원 (영어, 한국어, 일본어, 중국어 간체/번체, 스페인어, 포르투갈어)
 */
export const AUDIO_DEVICE_KEYWORDS = {
  /** 헤드셋/이어폰 감지 키워드 */
  HEADSET: [
    // 영어
    'headset',
    'headphone',
    'earphone',
    'earbud',
    // 한국어
    '헤드셋',
    '헤드폰',
    '이어폰',
  ],

  /** 스피커 감지 키워드 */
  SPEAKER: [
    // 영어
    'speaker',
    'internal',
    'built-in',
    // 한국어
    '스피커',
    '내장',
    // 일본어
    'スピーカー',
    '内蔵',
    // 중국어 간체
    '扬声器',
    '内置',
    // 중국어 번체
    '揚聲器',
    '內建',
    // 스페인어
    'altavoz',
    'integrado',
    // 포르투갈어
    'alto-falante',
    'integrado',
  ],
} as const;

/**
 * 오디오 스트림 설정
 */
export const AUDIO_STREAM_CONFIG = {
  /** 에코 제거 활성화 */
  ECHO_CANCELLATION: true,
  /** 노이즈 억제 활성화 */
  NOISE_SUPPRESSION: true,
  /** 자동 게인 조절 활성화 */
  AUTO_GAIN_CONTROL: true,
} as const;

/**
 * 기기 레이블 생성용 상수
 */
export const DEVICE_LABEL_CONFIG = {
  /** 마이크 레이블 접두사 */
  MICROPHONE_PREFIX: '마이크',
  /** 스피커 레이블 접두사 */
  SPEAKER_PREFIX: '스피커',
  /** 장치 ID 표시 길이 */
  DEVICE_ID_DISPLAY_LENGTH: 5,
} as const;
