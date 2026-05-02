/**
 * 영상별 가사 숨김 상태 관리 유틸리티
 *
 * 사용자가 잘못된 가사를 신고했을 때 해당 영상의 그 LRCLib ID를 영구 차단한다.
 *
 * 정책: rejectedLrclibIds만 사용 (영구 보관).
 * - 24시간 TTL 같은 시한부 차단은 두지 않는다.
 * - LRCLib에 새 가사가 등록되면 새 ID로 매칭되고, 거절 목록에 없으니 자동으로 표시된다.
 *   → 이게 "dev가 가사 추가하기 전까지만 차단"의 자연스러운 회복 트리거.
 * - 사용자가 명시적으로 회복하고 싶을 땐 unhideVideoLyrics(videoId) 호출로 거절 목록 비우고
 *   페이지 새로고침으로 재매칭 트리거.
 */

const STORAGE_KEY = 'hiddenLyrics';

export interface HiddenLyricsEntry {
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
 * 특정 LRCLib ID가 이 영상에서 사용자에 의해 거절된 적 있는지
 */
export async function isLrclibIdRejected(videoId: string, lrclibId: number): Promise<boolean> {
  if (!Number.isFinite(lrclibId) || lrclibId <= 0) return false;
  const map = await getHiddenLyricsMap();
  const entry = map[videoId];
  return !!entry?.rejectedLrclibIds.includes(lrclibId);
}

/**
 * 영상의 가사를 숨김 처리 — 주어진 lrclibId를 거절 목록에 추가한다 (중복 방지).
 *
 * @returns 새로 추가된 거절 ID (이미 있던 ID거나 lrclibId가 없으면 undefined). 호출부의 "되돌리기" 처리에 사용.
 */
export async function hideVideoLyrics(
  videoId: string,
  lrclibId?: number,
): Promise<{ addedLrclibId: number | undefined }> {
  if (lrclibId === undefined || !Number.isFinite(lrclibId) || lrclibId <= 0) {
    return { addedLrclibId: undefined };
  }

  const map = await getHiddenLyricsMap();
  const existing = map[videoId];
  const rejectedLrclibIds = existing?.rejectedLrclibIds ? [...existing.rejectedLrclibIds] : [];

  let addedLrclibId: number | undefined;
  if (!rejectedLrclibIds.includes(lrclibId)) {
    rejectedLrclibIds.push(lrclibId);
    addedLrclibId = lrclibId;
  }

  map[videoId] = { rejectedLrclibIds };
  await setHiddenLyricsMap(map);
  return { addedLrclibId };
}

/**
 * 영상의 가사 숨김을 해제
 * - removeLrclibId가 주어지면 그 ID만 제거 (토스트 "되돌리기"용 — 방금 추가한 ID 회수)
 * - 주어지지 않으면 영상의 거절 목록 전체를 비움 ("숨긴 가사 다시 표시" 액션용)
 * - 거절 목록이 비면 entry 자체를 정리
 */
export async function unhideVideoLyrics(videoId: string, removeLrclibId?: number): Promise<void> {
  const map = await getHiddenLyricsMap();
  const existing = map[videoId];
  if (!existing) return;

  const rejectedLrclibIds =
    removeLrclibId !== undefined ? existing.rejectedLrclibIds.filter((id) => id !== removeLrclibId) : [];

  if (rejectedLrclibIds.length === 0) {
    delete map[videoId];
  } else {
    map[videoId] = { rejectedLrclibIds };
  }
  await setHiddenLyricsMap(map);
}

/**
 * 영상에 거절된 LRCLib ID가 하나라도 있는지 — UI에서 "이 영상은 한 번이라도 사용자가 신고했음"
 * 표시 같은 데 사용. 다만 차단 자체의 정확한 판정은 isLrclibIdRejected(videoId, currentLrclibId)
 * 호출이 정확하다 (LRCLib가 새 ID로 갱신된 경우 false가 나와야 정확).
 */
export async function hasAnyRejection(videoId: string): Promise<boolean> {
  const map = await getHiddenLyricsMap();
  return !!map[videoId]?.rejectedLrclibIds.length;
}
