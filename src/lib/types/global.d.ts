// src/types/global.d.ts
interface Window {
  [key: string]: unknown;
  ytPlayer?: YT.Player;
  __LYRICS_OVERLAY_INITED?: boolean;
}

declare var __webpack_public_path__: string;
