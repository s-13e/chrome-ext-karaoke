// src/components/common/ErrorFallback.tsx
// import React from 'react';

type Props = {
  error: Error;
  resetErrorBoundary: () => void;
};

export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div>
      <p>에러: {error.message}</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}
