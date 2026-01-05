/**
 * 영상별 오프셋 저장 관리 유틸리티
 *
 * Chrome Storage Sync에 YouTube 영상별 가사 오프셋을 저장/조회/삭제하는 함수들
 */

/**
 * 영상 오프셋 데이터 구조
 */
export interface VideoOffsetData {
  videoId: string; // YouTube video ID (고유 식별자)
  title: string; // 영상 제목 (표시용)
  artist?: string; // 아티스트 (있으면)
  offset: number; // 오프셋 값 (초)
  thumbnail?: string; // 썸네일 URL (선택)
  lastModified: number; // 마지막 수정 시간 (timestamp)
}

const STORAGE_KEY = 'videoOffsets';

/**
 * 모든 영상 오프셋 조회
 */
export async function getAllVideoOffsets(): Promise<Record<string, VideoOffsetData>> {
  try {
    const result = await chrome.storage.sync.get([STORAGE_KEY]);
    return (result[STORAGE_KEY] as Record<string, VideoOffsetData>) || {};
  } catch (error) {
    console.error('[VideoOffset] 전체 오프셋 조회 실패:', error);
    return {};
  }
}

/**
 * 특정 영상의 오프셋 조회
 * @param videoId YouTube video ID
 * @returns 오프셋 데이터 또는 null
 */
export async function getVideoOffset(videoId: string): Promise<VideoOffsetData | null> {
  try {
    const allOffsets = await getAllVideoOffsets();
    return allOffsets[videoId] || null;
  } catch (error) {
    console.error(`[VideoOffset] 오프셋 조회 실패 (videoId: ${videoId}):`, error);
    return null;
  }
}

/**
 * 영상 오프셋 저장
 * @param data 저장할 오프셋 데이터
 */
export async function saveVideoOffset(data: VideoOffsetData): Promise<void> {
  try {
    const allOffsets = await getAllVideoOffsets();
    allOffsets[data.videoId] = {
      ...data,
      lastModified: Date.now(),
    };
    await chrome.storage.sync.set({ [STORAGE_KEY]: allOffsets });
    console.log(`[VideoOffset] 오프셋 저장 완료 (videoId: ${data.videoId}, offset: ${data.offset}초)`);
  } catch (error) {
    console.error(`[VideoOffset] 오프셋 저장 실패 (videoId: ${data.videoId}):`, error);
  }
}

/**
 * 영상 오프셋 업데이트 (오프셋 값만 변경)
 * @param videoId YouTube video ID
 * @param offset 새로운 오프셋 값
 */
export async function updateVideoOffset(videoId: string, offset: number): Promise<void> {
  try {
    const existingData = await getVideoOffset(videoId);
    if (!existingData) {
      console.warn(`[VideoOffset] 업데이트 실패: videoId "${videoId}"가 존재하지 않음`);
      return;
    }

    const updatedData: VideoOffsetData = {
      ...existingData,
      offset,
      lastModified: Date.now(),
    };

    await saveVideoOffset(updatedData);
    console.log(`[VideoOffset] 오프셋 업데이트 완료 (videoId: ${videoId}, offset: ${offset}초)`);
  } catch (error) {
    console.error(`[VideoOffset] 오프셋 업데이트 실패 (videoId: ${videoId}):`, error);
  }
}

/**
 * 영상 오프셋 삭제
 * @param videoId YouTube video ID
 */
export async function deleteVideoOffset(videoId: string): Promise<void> {
  try {
    const allOffsets = await getAllVideoOffsets();
    if (!allOffsets[videoId]) {
      console.warn(`[VideoOffset] 삭제 실패: videoId "${videoId}"가 존재하지 않음`);
      return;
    }

    delete allOffsets[videoId];
    await chrome.storage.sync.set({ [STORAGE_KEY]: allOffsets });
    console.log(`[VideoOffset] 오프셋 삭제 완료 (videoId: ${videoId})`);
  } catch (error) {
    console.error(`[VideoOffset] 오프셋 삭제 실패 (videoId: ${videoId}):`, error);
  }
}

/**
 * 모든 영상 오프셋 삭제 (초기화)
 */
export async function clearAllVideoOffsets(): Promise<void> {
  try {
    await chrome.storage.sync.set({ [STORAGE_KEY]: {} });
    console.log('[VideoOffset] 모든 오프셋 삭제 완료');
  } catch (error) {
    console.error('[VideoOffset] 전체 오프셋 삭제 실패:', error);
  }
}

/**
 * 영상 오프셋 개수 조회
 */
export async function getVideoOffsetCount(): Promise<number> {
  try {
    const allOffsets = await getAllVideoOffsets();
    return Object.keys(allOffsets).length;
  } catch (error) {
    console.error('[VideoOffset] 개수 조회 실패:', error);
    return 0;
  }
}
