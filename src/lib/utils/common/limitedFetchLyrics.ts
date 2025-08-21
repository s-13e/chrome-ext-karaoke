// limitedFetchLyrics.ts (또는 utils/limitedFetchLyrics.ts)
import { createConcurrencyLimiter } from './concurrencyLimiter';

export const limitedFetchLyrics = createConcurrencyLimiter(5);
