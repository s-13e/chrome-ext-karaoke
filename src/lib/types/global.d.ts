// src/types/global.d.ts
interface Window {
  [key: string]: unknown;
  ytPlayer?: YT.Player;
  __LYRICS_OVERLAY_INITED?: boolean;
}
