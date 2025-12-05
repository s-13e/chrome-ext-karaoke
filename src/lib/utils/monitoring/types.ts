/**
 * Monitoring and logging type definitions for youtube-karaoke extension
 * 모니터링 및 로깅 시스템 타입 정의
 */

/**
 * Log severity levels
 * 로그 심각도 레벨
 */
export enum LogLevel {
  DEBUG = 0, // 상세 디버깅 정보 (개발 환경에서만)
  INFO = 1, // 일반 정보성 메시지
  WARN = 2, // 잠재적 문제 상황 경고
  ERROR = 3, // 에러 발생
  FATAL = 4, // 확장 기능 작동 중단을 일으키는 치명적 에러
}

/**
 * Execution context where the log originated
 * 로그가 발생한 실행 컨텍스트
 */
export type LogContext = 'background' | 'content' | 'popup' | 'options';

/**
 * Environment information captured at log time
 * 로그 수집 시점의 환경 정보
 */
export interface EnvironmentInfo {
  extensionVersion: string; // 확장 프로그램 버전
  manifestVersion: number; // Manifest 버전
  browserVersion: string; // 브라우저 정보
  platform: string; // 운영체제 플랫폼
  language: string; // 브라우저 언어
}

/**
 * Additional metadata for log entries
 * 로그 엔트리에 추가할 메타데이터
 */
export interface LogMetadata {
  [key: string]: unknown;
}

/**
 * Base log entry structure
 * 기본 로그 엔트리 구조
 */
export interface LogEntry {
  timestamp: number; // 로그 발생 시각 (Unix timestamp)
  level: LogLevel; // 로그 레벨
  context: LogContext; // 실행 컨텍스트
  message: string; // 로그 메시지
  metadata?: LogMetadata; // 추가 메타데이터
}

/**
 * Error log entry with stack trace
 * Stack trace를 포함하는 에러 로그 엔트리
 */
export interface ErrorLog extends LogEntry {
  level: LogLevel.ERROR | LogLevel.FATAL;
  error: {
    name: string; // 에러 이름
    message: string; // 에러 메시지
    stack?: string; // Stack trace (절대 경로 제거됨)
  };
  environment: EnvironmentInfo; // 환경 정보
}

/**
 * Storage structure for persisted logs
 * Chrome Storage에 저장되는 로그 구조
 */
export interface LogStorage {
  errorLogs: ErrorLog[]; // 에러 로그 배열
  lastUpdated: number; // 마지막 업데이트 시각
}

/**
 * Configuration for logger behavior
 * Logger 동작 설정
 */
export interface LoggerConfig {
  minLevel: LogLevel; // 최소 로그 레벨 (이보다 낮은 레벨은 무시)
  maxStoredLogs: number; // 저장할 최대 로그 개수
  enableConsole: boolean; // 콘솔 출력 활성화 여부
  sanitizeSensitiveData: boolean; // 민감 데이터 필터링 활성화 여부
}
