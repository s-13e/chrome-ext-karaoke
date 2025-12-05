/**
 * Centralized logging system for youtube-karaoke extension
 * Handles log level filtering, environment-based behavior, and console output formatting
 *
 * youtube-karaoke 확장 프로그램의 중앙화된 로깅 시스템
 * 로그 레벨 필터링, 환경별 동작, 콘솔 출력 포맷팅 처리
 */

import type { LogContext, LogLevel, LogMetadata, LoggerConfig } from './types';
import { LogLevel as LogLevelEnum } from './types';

/**
 * Sensitive keys that should be redacted from logs
 * 로그에서 제거해야 하는 민감 정보 키 목록
 */
const SENSITIVE_KEYS = [
  'apikey',
  'api_key',
  'token',
  'password',
  'secret',
  'videoid',
  'userid',
  'sessionid',
  'auth',
  'cookie',
  'credentials',
];

/**
 * Default logger configuration
 * 기본 Logger 설정
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'development' ? LogLevelEnum.DEBUG : LogLevelEnum.WARN,
  maxStoredLogs: 100,
  enableConsole: true,
  sanitizeSensitiveData: true,
};

/**
 * Centralized logger class
 * 중앙화된 Logger 클래스
 */
class Logger {
  private config: LoggerConfig;
  private context: LogContext;

  constructor(context: LogContext, config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check if a log level should be processed
   * 로그 레벨이 처리되어야 하는지 확인
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.minLevel;
  }

  /**
   * Sanitize sensitive data from an object
   * 객체에서 민감 데이터 제거
   */
  private sanitize(data: unknown): unknown {
    if (!this.config.sanitizeSensitiveData) {
      return data;
    }

    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const keyLower = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) => keyLower.includes(sensitiveKey));

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Format log message for console output
   * 콘솔 출력용 로그 메시지 포맷팅
   */
  private formatConsoleMessage(level: LogLevel, message: string, metadata?: LogMetadata): void {
    if (!this.config.enableConsole) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevelEnum[level];
    const prefix = `[${timestamp}] [${this.context}] [${levelName}]`;

    const sanitizedMetadata = metadata ? this.sanitize(metadata) : undefined;

    switch (level) {
      case LogLevelEnum.DEBUG:
        console.debug(prefix, message, sanitizedMetadata);
        break;
      case LogLevelEnum.INFO:
        console.info(prefix, message, sanitizedMetadata);
        break;
      case LogLevelEnum.WARN:
        console.warn(prefix, message, sanitizedMetadata);
        break;
      case LogLevelEnum.ERROR:
      case LogLevelEnum.FATAL:
        if (process.env.NODE_ENV === 'development') {
          console.group(`🔴 ${prefix}`);
          console.error(message);
          if (sanitizedMetadata) {
            console.table(sanitizedMetadata);
          }
          console.groupEnd();
        } else {
          console.error(prefix, message, sanitizedMetadata);
        }
        break;
    }
  }

  /**
   * Log a debug message (dev only)
   * 디버그 메시지 로깅 (개발 환경에서만)
   */
  debug(message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(LogLevelEnum.DEBUG)) {
      return;
    }

    this.formatConsoleMessage(LogLevelEnum.DEBUG, message, metadata);
  }

  /**
   * Log an informational message
   * 일반 정보 메시지 로깅
   */
  info(message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(LogLevelEnum.INFO)) {
      return;
    }

    this.formatConsoleMessage(LogLevelEnum.INFO, message, metadata);
  }

  /**
   * Log a warning message
   * 경고 메시지 로깅
   */
  warn(message: string, metadata?: LogMetadata): void {
    if (!this.shouldLog(LogLevelEnum.WARN)) {
      return;
    }

    this.formatConsoleMessage(LogLevelEnum.WARN, message, metadata);
  }

  /**
   * Log an error message (delegates to ErrorTracker for storage)
   * 에러 메시지 로깅 (저장은 ErrorTracker에서 처리)
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    if (!this.shouldLog(LogLevelEnum.ERROR)) {
      return;
    }

    this.formatConsoleMessage(LogLevelEnum.ERROR, message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }

  /**
   * Log a fatal error message (delegates to ErrorTracker for storage)
   * 치명적 에러 메시지 로깅 (저장은 ErrorTracker에서 처리)
   */
  fatal(message: string, error?: Error, metadata?: LogMetadata): void {
    if (!this.shouldLog(LogLevelEnum.FATAL)) {
      return;
    }

    this.formatConsoleMessage(LogLevelEnum.FATAL, message, {
      ...metadata,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    });
  }

  /**
   * Create a new logger instance for a different context
   * 다른 컨텍스트용 Logger 인스턴스 생성
   */
  createChild(context: LogContext): Logger {
    return new Logger(context, this.config);
  }

  /**
   * Update logger configuration
   * Logger 설정 업데이트
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instances for each context
// 각 컨텍스트별 싱글톤 인스턴스 export
export const backgroundLogger = new Logger('background');
export const contentLogger = new Logger('content');
export const popupLogger = new Logger('popup');
export const optionsLogger = new Logger('options');

// Export the Logger class for custom instances
// 커스텀 인스턴스를 위한 Logger 클래스 export
export { Logger };
