import { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({
  error,
  resetErrorBoundary, // 필수 프로퍼티 추가
}: FallbackProps) {
  return (
    <div>
      <p>{error instanceof Error ? error.message : String(error)}</p>
      <button onClick={resetErrorBoundary}>재시도</button>
    </div>
  );
}
