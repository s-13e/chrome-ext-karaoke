import Meyda, { MeydaFeaturesObject } from 'meyda';
import { getSharedAudioContext } from './audioUtils';

/**
 * 고수준 오디오 특징 분석 – Meyda 기반, Worklet 싱글톤 관리 및 예외/자원 처리 반영
 */
export async function analyzeAudioFeatures(
  videoEl: HTMLMediaElement,
  options: { durationSec?: number; bufferSize?: number; threshold?: number } = {},
) {
  const { durationSec = 15, bufferSize = 1024, threshold = 0.04 } = options;
  const audioContext = getSharedAudioContext();
  let source: MediaElementAudioSourceNode | null = null;
  let analyzer: ReturnType<typeof Meyda.createMeydaAnalyzer> | null = null;

  try {
    source = audioContext.createMediaElementSource(videoEl);

    const rms: number[] = [];
    const spectralCentroid: number[] = [];
    const timestamps: number[] = [];

    analyzer = Meyda.createMeydaAnalyzer({
      audioContext,
      source,
      bufferSize,
      featureExtractors: ['rms', 'spectralCentroid'],
      callback: (features: MeydaFeaturesObject) => {
        rms.push(features.rms ?? 0);
        spectralCentroid.push(features.spectralCentroid ?? 0);
        timestamps.push(videoEl.currentTime);
      },
    });

    // 영상상태 백업 및 play
    const wasPaused = videoEl.paused;
    const prevTime = videoEl.currentTime;
    if (wasPaused) await videoEl.play();
    analyzer.start();

    // 분석 타임아웃 및 자원 정리만 실행 (싱글톤 audioContext는 close하지 않음)
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        try {
          analyzer?.stop();
        } catch {
          // console.warn('뭔 오류남');
        }
        if (source) {
          try {
            source.disconnect();
          } catch {
            // console.warn('뭔 오류남');
          }
        }
        resolve();
      }, durationSec * 1000);
    });

    // 영상상태 복구
    if (wasPaused) videoEl.pause();
    videoEl.currentTime = prevTime;

    // threshold 값 기준으로 onset index 탐색
    const onsetIdx = rms.findIndex((value) => value > threshold);

    return {
      rms,
      spectralCentroid,
      rmsTimestamps: timestamps,
      centroidTimestamps: timestamps,
      onsetTime: onsetIdx !== -1 ? timestamps[onsetIdx] : undefined,
    };
  } catch (error) {
    // 분석 실패 및 자원 안전 정리
    console.error('오디오 분석 중 오류 발생:', error);
    try {
      analyzer?.stop();
    } catch {
      // console.warn('뭔 오류남');
    }
    if (source) {
      try {
        source.disconnect();
      } catch {
        // console.warn('뭔 오류남');
      }
    }
    // audioContext는 싱글톤이라 close하지 않음
    return null;
  }
}
