import pLimit from 'p-limit';

export function createConcurrencyLimiter(concurrency: number) {
  const limit = pLimit(concurrency);

  return async function limitedConcurrency<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
    const tasks = items.map((item) => limit(() => fn(item)));
    return Promise.all(tasks);
  };
}
