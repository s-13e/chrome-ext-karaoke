import { useMemo } from 'react';

import styles from './DiscoBall.module.css';
import { generateDiscoBallTiles } from './useDiscoBallTiles';

interface Props {
  enabled: boolean;
  onToggle: () => void;
}

export function DiscoBall({ enabled, onToggle }: Props) {
  // ✅ 위치/랜덤 고정
  const tiles = useMemo(() => generateDiscoBallTiles(), []);

  return (
    <button
      className={`${styles.wrapper} ${enabled ? styles.on : styles.off}`}
      onClick={onToggle}
      aria-pressed={enabled}
    >
      <div className={styles.stage}>
        {enabled && <div className={styles.light} />}

        {/* ✅ 항상 회전 */}
        <div className={styles.discoBall}>
          <div className={styles.discoBallMiddle} />

          {tiles.map((tile, i) => (
            <div
              key={i}
              className={styles.square}
              style={{
                transform: `
                  translateX(${tile.x}px)
                  translateY(${tile.y}px)
                  translateZ(${tile.z}px)
                `,
              }}
            >
              <div
                className={styles.tile}
                style={{
                  width: '6.5px',
                  height: '6.5px',
                  animationDelay: `${tile.delay}s`,
                  backgroundColor: enabled ? neonColor(tile.isBrightZone) : silverColor(tile.isBrightZone),
                  transform: tile.rotate,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

function silverColor(bright: boolean) {
  const c = bright ? rand(130, 255) : rand(110, 190);
  return `rgb(${c}, ${c}, ${c})`;
}

function neonColor(bright: boolean) {
  return bright ? `hsl(${rand(200, 320)}, 100%, 70%)` : `hsl(${rand(200, 320)}, 80%, 55%)`;
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
