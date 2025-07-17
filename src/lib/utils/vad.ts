// import { VAD } from '@ricky0123/vad';

// let vadInstance: VAD | null = null;

// // 음성 구간을 프레임(30ms) 단위로 감지하여 결과(음성: true/무음: false) 배열을 반환
// export async function runVAD(audioBuffer: Float32Array): Promise<boolean[]> {
//   if (!vadInstance) {
//     vadInstance = new VAD();
//     await vadInstance.init();
//   }

//   const sampleRate = 16000; // 표준 VAD 입력 샘플레이트
//   const frameDurationMs = 30;
//   const frameSize = (sampleRate * frameDurationMs) / 1000; // 480개 샘플 (30ms @16kHz)

//   const vadResults: boolean[] = [];
//   const totalFrames = Math.floor(audioBuffer.length / frameSize);

//   for (let i = 0; i < totalFrames; i++) {
//     const start = i * frameSize;
//     const end = start + frameSize;
//     const frame = audioBuffer.subarray(start, end);
//     // VAD가 이 프레임에서 음성이 감지되면 true 반환
//     const isSpeech = await vadInstance.isSpeech(frame as Float32Array);
//     vadResults.push(isSpeech);
//   }
//   return vadResults;
// }
