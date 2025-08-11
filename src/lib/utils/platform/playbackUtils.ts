// videoRef는 비디오 엘리먼트, currentTime은 현재 재생시간 상태,
// offsetLyrics: offset된 가사 리스트, offset: 보정값, onAutoPlayEnd: 종료 콜백

import { Line } from '@lib/types/lyrics';
import { RefObject } from 'react';

export async function playOffsetTestSegment(
  videoRef: RefObject<HTMLVideoElement | null>,
  offsetLyrics: Line[],
  offset: number,
  onAutoPlayEnd?: () => void,
  maxDurationSec = 5,
) {
  const video = videoRef.current;
  console.log('[playOffsetTestSegment] 시작');
  if (!video) {
    console.warn('[playOffsetTestSegment] videoRef.current가 없습니다.');
    return;
  }

  if (offsetLyrics.length === 0) {
    console.warn('[playOffsetTestSegment] offsetLyrics가 비어 있습니다.');
    return;
  }
  console.log('[playOffsetTestSegment] 현재 video.currentTime:', video.currentTime, 'offset:', offset);

  // 현재 영상 상태 저장
  const wasPlaying = !video.paused;
  const originalTime = video.currentTime;
  let isInternalSeek = false; // 내부 자동 재생 시크 여부 플래그

  // 현재 가사 찾기 (offset 적용된 시간 기준)
  const adjustedTime = video.currentTime - offset;

  let currentIndex = offsetLyrics.findIndex((line, idx) => {
    const next = offsetLyrics[idx + 1];
    return adjustedTime >= line.time && (!next || adjustedTime < next.time);
  });

  if (currentIndex === -1) currentIndex = 0;

  const currentLine = offsetLyrics[currentIndex];
  if (!currentLine) return; // ✅ 안전 처리

  // 구간 재생 시작 시간 (offset 적용된 가사 기준)
  const segmentStart = currentLine.time + offset;
  const nextLine = offsetLyrics[currentIndex + 1];

  // 구간 종료 시간 (다음 가사 등장 전)
  const segmentEnd = nextLine
    ? Math.min(nextLine.time + offset, segmentStart + maxDurationSec)
    : segmentStart + Math.min(2, maxDurationSec);

  // 자동 재생 구간이 음수이거나 기존 시간보다 뒤에 있으면 보정
  const playStartTime = Math.max(segmentStart, 0);

  // 영상 일시정지 + 재생 위치 이동
  if (wasPlaying) {
    video.pause();
  }
  video.currentTime = playStartTime;

  // 자동 재생 완료를 Promise로 대기
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      video.pause();
      isInternalSeek = true; // 내부 seek로 표시
      video.currentTime = originalTime; // 원래 위치로 돌아가기
      if (wasPlaying) {
        video.play().catch((err) => console.warn('[playOffsetTestSegment] 재생 복원 실패:', err));
      }
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onSeeking);
      onAutoPlayEnd?.();
    };

    const onTimeUpdate = () => {
      if (video.currentTime >= segmentEnd) {
        cleanup();
        resolve();
      }
    };

    const onSeeking = () => {
      if (isInternalSeek) {
        // 내부 이동은 무시, 플래그 되돌림
        // isInternalSeek = false;
        return;
      }
      console.warn('[playOffsetTestSegment] 사용자 시크 감지 → 조기 종료');
      cleanup();
      reject(new Error('사용자가 영상 위치를 변경함'));
    };

    isInternalSeek = true;
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeking', onSeeking);

    video.pause();
    video.currentTime = segmentStart;

    // 위치 이동 후 일정 시간 후에 플래그 해제 (예: 1초 후)
    setTimeout(() => {
      isInternalSeek = false;
    }, 1000);

    video.play().catch((err) => {
      cleanup();
      reject(err);
    });
  });
}
