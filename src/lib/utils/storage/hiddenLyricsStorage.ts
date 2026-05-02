/**
 * 영상별 가사 숨김 상태 관리 유틸리티
 *
 * 사용자가 잘못된 가사를 신고하거나 수동 검색에서 가사를 못 찾았을 때,
 * 해당 영상의 가사 표시를 일시 차단한다.
 *
 * 데이터 정책:
 * - hiddenAt: 24시간 TTL — 만료되면 자동 매칭이 다시 시도된다.
 * - rejectedLrclibIds: 영구 보관 — 한 번 잘못이라 본 가사 ID는 다시 매칭돼도 차단한다.
 *   (24시간 후 재시도에서 같은 ID가 또 잡혔을 때 무한 루프를 방지하기 위함)
 */

const STORAGE_KEY = 'hiddenLyrics';
const HIDDEN_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

export interface HiddenLyricsEntry {
  /** 가사 숨김이 시작된 시각 (ms epoch). 없으면 hidden 상태 아님. */
  hiddenAt?: number;
  /** 사용자가 거절한 LRCLib ID 목록 (영구 보관). */
  rejectedLrclibIds: number[];
}

export interface HiddenLyricsMap {
  [videoId: string]: HiddenLyricsEntry;
}

/**
 * 전체 숨김 상태 맵 조회
 */
async function getHiddenLyricsMap(): Promise<HiddenLyricsMap> {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return (result[STORAGE_KEY] as HiddenLyricsMap | undefined) ?? {};
  } catch (error) {
    console.error('[HiddenLyrics] 조회 실패:', error);
    return {};
  }
}

/**
 * 전체 숨김 상태 맵 저장
 */
async function setHiddenLyricsMap(map: HiddenLyricsMap): Promise<void> {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: map });
  } catch (error) {
    console.error('[HiddenLyrics] 저장 실패:', error);
  }
}

/**
 * 영상의 hiddenAt이 24시간 TTL 안에 있는지 판정
 */
function isHiddenWithinTtl(entry: HiddenLyricsEntry | undefined): boolean {
  if (!entry?.hiddenAt) return false;
  return Date.now() - entry.hiddenAt < HIDDEN_TTL_MS;
}

/**
 * 영상이 현재 가사 숨김 상태인지 (24h TTL 적용)
 */
export async function isVideoLyricsHidden(videoId: string): Promise<boolean> {
  const map = await getHiddenLyricsMap();
  return isHiddenWithinTtl(map[videoId]);
}

/**
 * 특정 LRCLib ID가 이 영상에서 사용자에 의해 거절된 적 있는지 (영구 체크, TTL 무관)
 */
export async function isLrclibIdRejected(videoId: string, lrclibId: number): Promise<boolean> {
  if (!Number.isFinite(lrclibId) || lrclibId <= 0) return false;
  const map = await getHiddenLyricsMap();
  const entry = map[videoId];
  return !!entry?.rejectedLrclibIds.includes(lrclibId);
}

/**
 * 영상의 가사를 숨김 처리
 * - hiddenAt을 현재 시각으로 갱신해 24h TTL 시작
 * - lrclibId가 주어지면 영구 거절 목록에도 추가 (중복 방지)
 *
 * @returns 새로 추가된 거절 ID (이미 있던 ID거나 lrclibId가 없으면 undefined). 호출부의 "되돌리기" 처리에 사용.
 */
export async function hideVideoLyrics(
  videoId: string,
  lrclibId?: number,
): Promise<{ addedLrclibId: number | undefined }> {
  const map = await getHiddenLyricsMap();
  const existing = map[videoId];
  const rejectedLrclibIds = existing?.rejectedLrclibIds ? [...existing.rejectedLrclibIds] : [];

  let addedLrclibId: number | undefined;
  if (lrclibId !== undefined && Number.isFinite(lrclibId) && lrclibId > 0 && !rejectedLrclibIds.includes(lrclibId)) {
    rejectedLrclibIds.push(lrclibId);
    addedLrclibId = lrclibId;
  }

  map[videoId] = {
    hiddenAt: Date.now(),
    rejectedLrclibIds,
  };
  await setHiddenLyricsMap(map);
  return { addedLrclibId };
}

/**
 * 영상의 가사 숨김을 해제
 * - hiddenAt을 제거 (다시 보기)
 * - removeLrclibId가 주어지면 그 ID도 거절 목록에서 제거 (토스트 "되돌리기"에서 방금 추가한 ID 회수용)
 * - 거절 목록이 비고 hiddenAt도 없으면 entry 자체를 정리
 */
export async function unhideVideoLyrics(videoId: string, removeLrclibId?: number): Promise<void> {
  const map = await getHiddenLyricsMap();
  const existing = map[videoId];
  if (!existing) return;

  const rejectedLrclibIds =
    removeLrclibId !== undefined
      ? existing.rejectedLrclibIds.filter((id) => id !== removeLrclibId)
      : existing.rejectedLrclibIds;

  if (rejectedLrclibIds.length === 0) {
    delete map[videoId];
  } else {
    map[videoId] = { rejectedLrclibIds };
  }
  await setHiddenLyricsMap(map);
}

/**
 * 만료된 hiddenAt을 정리 (영상 진입 시점 등에서 호출).
 * - hiddenAt이 24h를 넘으면 hiddenAt만 삭제 (rejectedLrclibIds는 유지 — 재매칭 시 같은 잘못된 가사 재차단)
 * - 정리 후 entry가 빈 상태(거절 ID도 없음)면 entry 자체 삭제
 */
export async function cleanupExpiredHidden(): Promise<void> {
  const map = await getHiddenLyricsMap();
  let mutated = false;

  for (const [videoId, entry] of Object.entries(map)) {
    if (entry.hiddenAt && Date.now() - entry.hiddenAt >= HIDDEN_TTL_MS) {
      mutated = true;
      if (entry.rejectedLrclibIds.length === 0) {
        delete map[videoId];
      } else {
        map[videoId] = { rejectedLrclibIds: entry.rejectedLrclibIds };
      }
    }
  }

  if (mutated) {
    await setHiddenLyricsMap(map);
  }
}
