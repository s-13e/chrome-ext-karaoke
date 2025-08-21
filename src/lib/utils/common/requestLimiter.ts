// src/lib/utils/common/requestLimiter.ts
type PendingRequest<T = unknown> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason: unknown) => void;
  fn: () => Promise<T>;
};

export class RequestLimiter {
  private maxConcurrent: number;
  private runningCount: number;
  private queue: PendingRequest[];

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent;
    this.runningCount = 0;
    this.queue = [];
  }

  public async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // 타입 단언으로 queue에 넣을 때 타입 불일치 해소
      const request = { resolve, reject, fn } as PendingRequest<unknown>;
      this.queue.push(request);
      this.runNext();
    });
  }

  private runNext() {
    if (this.runningCount >= this.maxConcurrent) return;
    const request = this.queue.shift();
    if (!request) return;

    this.runningCount++;
    request
      .fn()
      .then((result) => {
        request.resolve(result);
      })
      .catch((err) => {
        request.reject(err);
      })
      .finally(() => {
        this.runningCount--;
        this.runNext();
      });
  }
}

// 싱글톤 인스턴스 생성 예시
export const defaultRequestLimiter = new RequestLimiter(5);
