/**
 * Error tracking and storage system for youtube-karaoke extension
 * Captures errors with environment context and stores them in Chrome Storage
 *
 * youtube-karaoke 확장 프로그램의 에러 추적 및 저장 시스템
 * 환경 정보와 함께 에러를 수집하고 Chrome Storage에 저장
 */

import type { ErrorLog, EnvironmentInfo, LogContext, LogMetadata, LogStorage } from './types';
import { LogLevel } from './types';

/**
 * Maximum number of error logs to store
 * 저장할 최대 에러 로그 개수
 */
const MAX_ERROR_LOGS = 100;

/**
 * Storage key for error logs
 * 에러 로그 저장 키
 */
const STORAGE_KEY = 'errorLogs';

/**
 * Get current environment information
 * 현재 환경 정보 가져오기
 */
function getEnvironmentInfo(): EnvironmentInfo {
  const manifest = chrome.runtime.getManifest();

  return {
    extensionVersion: manifest.version,
    manifestVersion: manifest.manifest_version,
    browserVersion: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
}

/**
 * Sanitize stack trace to remove local file paths
 * Stack trace에서 로컬 파일 경로 제거
 */
function sanitizeStackTrace(stack?: string): string | undefined {
  if (!stack) {
    return undefined;
  }

  // Remove absolute file paths, keep only relative paths and line numbers
  // 절대 경로 제거, 상대 경로와 라인 번호만 유지
  return stack
    .split('\n')
    .map((line) => {
      // Remove chrome-extension:// URLs with full paths
      return line.replace(/chrome-extension:\/\/[^/]+\//, '');
    })
    .join('\n');
}

/**
 * Error tracker class for capturing and storing errors
 * 에러 수집 및 저장을 담당하는 클래스
 */
class ErrorTracker {
  private context: LogContext;

  constructor(context: LogContext) {
    this.context = context;
  }

  /**
   * Capture an error and store it in Chrome Storage
   * 에러를 수집하여 Chrome Storage에 저장
   */
  async captureError(
    error: Error,
    message: string,
    level: LogLevel.ERROR | LogLevel.FATAL = LogLevel.ERROR,
    metadata?: LogMetadata,
  ): Promise<void> {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      level,
      context: this.context,
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: sanitizeStackTrace(error.stack),
      },
      environment: getEnvironmentInfo(),
      metadata: metadata || {},
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracker]', errorLog);
    }

    // Store in Chrome Storage
    await this.storeErrorLog(errorLog);
  }

  /**
   * Store error log in Chrome Storage
   * Chrome Storage에 에러 로그 저장
   */
  private async storeErrorLog(errorLog: ErrorLog): Promise<void> {
    try {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      const existingLogs = (result[STORAGE_KEY] || []) as ErrorLog[];

      // Add new log and keep only the most recent MAX_ERROR_LOGS entries
      const updatedLogs = [...existingLogs, errorLog].slice(-MAX_ERROR_LOGS);

      await chrome.storage.local.set({
        [STORAGE_KEY]: updatedLogs,
      });
    } catch (storageError) {
      // If storage fails, at least log to console
      console.error('[ErrorTracker] Failed to store error log:', storageError);
    }
  }

  /**
   * Retrieve all stored error logs
   * 저장된 모든 에러 로그 가져오기
   */
  static async getAllLogs(): Promise<ErrorLog[]> {
    try {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      return (result[STORAGE_KEY] || []) as ErrorLog[];
    } catch (error) {
      console.error('[ErrorTracker] Failed to retrieve error logs:', error);
      return [];
    }
  }

  /**
   * Export error logs as formatted JSON string
   * 에러 로그를 포맷된 JSON 문자열로 export
   */
  static async exportLogs(): Promise<string> {
    const logs = await ErrorTracker.getAllLogs();

    const exportData: LogStorage = {
      errorLogs: logs,
      lastUpdated: Date.now(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Clear all stored error logs
   * 저장된 모든 에러 로그 삭제
   */
  static async clearLogs(): Promise<void> {
    try {
      await chrome.storage.local.remove([STORAGE_KEY]);
    } catch (error) {
      console.error('[ErrorTracker] Failed to clear error logs:', error);
    }
  }

  /**
   * Get count of stored error logs
   * 저장된 에러 로그 개수 가져오기
   */
  static async getLogCount(): Promise<number> {
    const logs = await ErrorTracker.getAllLogs();
    return logs.length;
  }

  /**
   * Get logs filtered by level
   * 로그 레벨로 필터링된 로그 가져오기
   */
  static async getLogsByLevel(level: LogLevel): Promise<ErrorLog[]> {
    const logs = await ErrorTracker.getAllLogs();
    return logs.filter((log) => log.level === level);
  }

  /**
   * Get logs filtered by context
   * 컨텍스트로 필터링된 로그 가져오기
   */
  static async getLogsByContext(context: LogContext): Promise<ErrorLog[]> {
    const logs = await ErrorTracker.getAllLogs();
    return logs.filter((log) => log.context === context);
  }

  /**
   * Get logs within a time range
   * 특정 시간 범위 내의 로그 가져오기
   */
  static async getLogsByTimeRange(startTime: number, endTime: number): Promise<ErrorLog[]> {
    const logs = await ErrorTracker.getAllLogs();
    return logs.filter((log) => log.timestamp >= startTime && log.timestamp <= endTime);
  }
}

// Export singleton instances for each context
// 각 컨텍스트별 싱글톤 인스턴스 export
export const backgroundErrorTracker = new ErrorTracker('background');
export const contentErrorTracker = new ErrorTracker('content');
export const popupErrorTracker = new ErrorTracker('popup');
export const optionsErrorTracker = new ErrorTracker('options');

// Export the ErrorTracker class and static methods
// ErrorTracker 클래스 및 static 메서드 export
export { ErrorTracker };
