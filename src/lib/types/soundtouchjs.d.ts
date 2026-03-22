// Type declarations for soundtouchjs
// SoundTouch audio processing library

declare module 'soundtouchjs' {
  export class SoundTouch {
    pitchSemitones: number;
    tempo: number;
    rate: number;
    inputBuffer: FifoSampleBuffer;
    outputBuffer: FifoSampleBuffer;
    process(): void;
    clear(): void;
  }

  export class FifoSampleBuffer {
    frameCount: number;
    putSamples(samples: Float32Array, position?: number, numFrames?: number): void;
    receiveSamples(output: Float32Array, numFrames?: number): number;
    clear(): void;
  }
}
