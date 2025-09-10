const STYLE_ID = 'custom-cinema-style';
const MODE_CLASS = 'custom-cinema-mode';

export function injectCinemaModeStyle() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${MODE_CLASS} #masthead-container {
      background: #111 !important;
      height: 100vh !important;
    }
    .${MODE_CLASS} .html5-video-player {
      width: 80vw !important;
      max-width: 100vw !important;
      margin: 0 auto !important;
      position: relative;
      z-index: 1010;
    }
    .${MODE_CLASS} #columns {
      background: #000 !important;
    }
  `;
  document.head.appendChild(style);
}

export function enableCinemaMode() {
  injectCinemaModeStyle();
  document.body.classList.add(MODE_CLASS);
}

export function disableCinemaMode() {
  document.body.classList.remove(MODE_CLASS);
}

export function setupCinemaScrollDisable(threshold = 80) {
  window.addEventListener('scroll', () => {
    if (document.body.classList.contains(MODE_CLASS) && window.scrollY > threshold) {
      disableCinemaMode();
    }
  });
}
