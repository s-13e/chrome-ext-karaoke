import React from 'react';
import { LyricsError } from '@lib/types/lyricsError';
import { useTranslation } from 'react-i18next';

interface LyricsErrorDisplayProps {
  error: LyricsError;
  onRetry?: () => void;
  onManualSearch?: () => void;
  onIgnore?: () => void;
  className?: string;
}

export const LyricsErrorDisplay: React.FC<LyricsErrorDisplayProps> = ({
  error,
  onRetry,
  onManualSearch,
  onIgnore,
  className = '',
}) => {
  const { t } = useTranslation();

  // 타입 가드 함수
  const isStringOrNumber = (value: unknown): value is string | number => {
    return typeof value === 'string' || typeof value === 'number';
  };

  const getContextValue = (key: string): string | null => {
    if (!error.context || typeof error.context !== 'object') return null;
    const value = (error.context as Record<string, unknown>)[key];
    return isStringOrNumber(value) ? String(value) : null;
  };

  const contextArtist = getContextValue('artist');
  const contextTitle = getContextValue('title');

  // 3001 에러에서 artist/title이 메시지에 포함되는지 여부
  const hasInfoInMessage = error.code === 3001 && contextArtist !== null && contextTitle !== null;
  // 3001 에러에서 보조 힌트 표시 여부
  const showNotFoundHint = error.code === 3001 && hasInfoInMessage;

  // 에러 코드를 번역 키로 매핑
  const getErrorMessageKey = (code: number): string => {
    switch (code) {
      case 1001:
        return 'extLyricsErrorVideoInfoMissing';
      case 1002:
        return 'extLyricsErrorArtistTitleExtractFailed';
      case 1003:
        return 'extLyricsErrorInvalidVideoDuration';
      case 2001:
        return 'extLyricsErrorNetworkError';
      case 2002:
        return 'extLyricsErrorApiTimeout';
      case 2003:
        return 'extLyricsErrorApiRateLimited';
      case 2004:
        return 'extLyricsErrorApiServerError';
      case 3001:
        return hasInfoInMessage ? 'extLyricsErrorLrclibNotFoundWithInfo' : 'extLyricsErrorLrclibNotFound';
      case 3002:
        return 'extLyricsErrorMusicbrainzNotFound';
      case 3003:
        return 'extLyricsErrorInvalidResponse';
      case 3004:
        return 'extLyricsErrorEmptySearchResults';
      case 4001:
        return 'extLyricsErrorLyricsParseError';
      case 4002:
        return 'extLyricsErrorLyricsSyncInvalid';
      case 4003:
        return 'extLyricsErrorLyricsEmpty';
      case 4004:
        return 'extLyricsErrorLyricsFormatUnsupported';
      case 5001:
        return 'extLyricsErrorCacheReadError';
      case 5002:
        return 'extLyricsErrorCacheWriteError';
      default:
        return 'extLyricsErrorUnknownError';
    }
  };

  // 액션 타입을 번역 키로 매핑
  const getActionKey = (actionType: string): string => {
    switch (actionType) {
      case 'retry':
        return 'extLyricsActionRetry';
      case 'manual_search':
        return 'extLyricsActionManualSearch';
      case 'ignore':
        return 'extLyricsActionIgnore';
      default:
        return 'extLyricsActionRetry';
    }
  };

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'retry':
        onRetry?.();
        break;
      case 'manual_search':
        onManualSearch?.();
        break;
      case 'ignore':
        onIgnore?.();
        break;
    }
  };

  const getErrorIcon = () => {
    switch (true) {
      case error.code >= 2000 && error.code < 3000:
        return '🌐'; // 네트워크 관련
      case error.code >= 3000 && error.code < 4000:
        return '🔍'; // API 응답 관련
      case error.code >= 4000 && error.code < 5000:
        return '📝'; // 가사 처리 관련
      case error.code >= 5000 && error.code < 6000:
        return '💾'; // 캐시 관련
      default:
        return '⚠️'; // 기타
    }
  };

  const actions = error.actions;

  // i18next interpolation 값 (3001 WithInfo 키에서 사용)
  const interpolationValues = hasInfoInMessage ? { artist: contextArtist, title: contextTitle } : undefined;

  return (
    <div className={`lyrics-error-display ${className}`}>
      <div className="error-header">
        <span className="error-icon">{getErrorIcon()}</span>
        <div className="error-message-wrap">
          <span className="error-message">{t(getErrorMessageKey(error.code), interpolationValues)}</span>
          {showNotFoundHint && <span className="error-hint">{t('extLyricsErrorLrclibNotFoundHint')}</span>}
        </div>
      </div>

      {actions.length > 0 && (
        <div className="error-actions">
          {actions.map((action, index) => (
            <button key={index} className={`error-action-btn ${action.type}`} onClick={() => handleAction(action.type)}>
              {t(getActionKey(action.type))}
            </button>
          ))}
        </div>
      )}

      {error.context && !hasInfoInMessage && (contextArtist || contextTitle) && (
        <div className="error-details">
          <details>
            <summary>{t('extLyricsDetailsToggle')}</summary>
            <div className="error-context">
              {contextArtist && (
                <div>
                  {t('extArtist')}: {contextArtist}
                </div>
              )}
              {contextTitle && (
                <div>
                  {t('extSongs')}: {contextTitle}
                </div>
              )}
            </div>
          </details>
        </div>
      )}

      <style>{`
        .lyrics-error-display {
          background: rgba(0, 0, 0, 0.85);
          border: 1px solid rgba(255, 107, 107, 0.5);
          border-radius: 12px;
          padding: 20px 24px;
          color: #fff;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 400px;
          pointer-events: auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .error-header {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 16px;
        }

        .error-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .error-message-wrap {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .error-message {
          font-weight: 500;
          font-size: 14px;
          line-height: 1.4;
        }

        .error-hint {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.4;
        }

        .error-details {
          margin-bottom: 12px;
        }

        .error-details summary {
          cursor: pointer;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 4px;
        }

        .error-context {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          background: rgba(0, 0, 0, 0.2);
          padding: 8px;
          border-radius: 4px;
          margin-top: 4px;
        }

        .error-context div {
          margin-bottom: 2px;
        }

        .error-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .error-action-btn {
          flex: 1;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .error-action-btn.retry {
          background: #00d4aa;
          color: #0f0f0f;
        }

        .error-action-btn.retry:hover {
          background: #00bfa5;
        }

        .error-action-btn.manual_search {
          background: #00d4aa;
          color: #0f0f0f;
        }

        .error-action-btn.manual_search:hover {
          background: #00bfa5;
        }

        .error-action-btn.ignore {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .error-action-btn.ignore:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
};
