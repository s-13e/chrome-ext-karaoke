// // components/lyrics/KaraokePlayerContainer/index.tsx
// import { useEffect, useRef } from 'react';
// import styles from './styles.module.css';

// const KARAOKE_STYLES = `
//   ytd-app { padding-top: 0 !important; }
//   ytd-watch-flexy {
//     width: 75% !important;
//     height: calc(100vh - var(--header-height, 56px)) !important; /* 헤더 높이 고려 */
//     position: fixed !important;
//     top: var(--header-height, 56px) !important; /* 헤더 아래 시작 */
//     left: 0 !important;
//     z-index: 1000 !important;
//     margin: 0 !important;
//     padding: 0 !important;
//   }

//   #movie_player {
//     width: 100% !important;
//     height: 100% !important;
//     position: relative !important;
//   }
//   #secondary { display: none !important; }
//   body { overflow: hidden !important; }
// `;

// export const KaraokePlayerContainer = () => {
//   const styleRef = useRef<HTMLStyleElement | null>(null);

//   useEffect(() => {
//     // 1. 기존 스타일 제거 (중복 주입 방지)
//     if (styleRef.current) {
//       document.head.removeChild(styleRef.current);
//     }

//     // 2. 새 스타일 요소 생성
//     const style = document.createElement('style');
//     style.id = 'karaoke-player-styles';
//     style.textContent = KARAOKE_STYLES;
//     document.head.appendChild(style);
//     styleRef.current = style;

//     // 3. YouTube DOM 변경 감지 (SPA 대응)
//     const observer = new MutationObserver(() => {
//       if (!document.querySelector('ytd-watch-flexy')) return;

//       // 스타일 재주입
//       if (style.parentNode !== document.head) {
//         document.head.appendChild(style);
//       }
//     });

//     observer.observe(document.body, {
//       childList: true,
//       subtree: true,
//     });

//     return () => {
//       // 4. 정리 함수에서 스타일 제거 및 관찰 중지
//       if (styleRef.current) {
//         document.head.removeChild(styleRef.current);
//       }
//       observer.disconnect();
//     };
//   }, []);

//   return <div className={styles.lyricsContainer}>가사 컨테이너</div>;
// };
