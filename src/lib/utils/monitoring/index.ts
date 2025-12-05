/**
 * Centralized monitoring system exports
 * 중앙화된 모니터링 시스템 export
 *
 * Usage:
 *
 * import { contentLogger, contentErrorTracker, LogLevelEnum } from '@lib/utils/monitoring';
 *
 * // 일반 로깅 (콘솔 출력)
 * contentLogger.info('Video detected', { videoId: '...' });
 * contentLogger.warn('Lyrics sync drift detected', { drift: 2.5 });
 *
 * // 에러 추적 (Chrome Storage 저장)
 * contentErrorTracker.captureError(
 *   error,
 *   'Failed to fetch lyrics',
 *   LogLevelEnum.ERROR,
 *   { source: 'lrclib' }
 * );
 */

// Export types
// 타입 export
export type {
  LogLevel,
  LogContext,
  EnvironmentInfo,
  LogMetadata,
  LogEntry,
  ErrorLog,
  LogStorage,
  LoggerConfig,
} from './types';

export { LogLevel as LogLevelEnum } from './types';

// Export logger instances
// Logger 인스턴스 export
export { Logger, backgroundLogger, contentLogger, popupLogger, optionsLogger } from './logger';

// Export error tracker instances
// ErrorTracker 인스턴스 export
export {
  ErrorTracker,
  backgroundErrorTracker,
  contentErrorTracker,
  popupErrorTracker,
  optionsErrorTracker,
} from './errorTracker';
