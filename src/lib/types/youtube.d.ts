// src/types/youtube.d.ts (또는 global.d.ts에 추가)
declare namespace YT {
  interface Player {
    getCurrentTime(): number;
    seekTo(seconds: number, allowSeekAhead?: boolean): void;
    playVideo(): void;
    pauseVideo(): void;

    // YouTubePlayer 타입의 메서드 추가
    getPlayerState(): PlayerState;
    addEventListener?(event: string, listener: () => void): void;
    removeEventListener?(event: string, listener: () => void): void;
  }
}

type PlayerState = 'unstarted' | 'ended' | 'playing' | 'paused' | 'buffering' | 'cued';
