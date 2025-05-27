import './popup.css';

export function App() {
  // 설정 버튼 클릭 시 옵션 페이지 열기
  const handleOpenOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // 구버전 브라우저 호환
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  return (
    <div className="popup-header">
      <h1>Hello, Chrome popup page!</h1>
      <button id="go-to-options" className="icon-button" onClick={handleOpenOptions}>
        <img src="../assets/icons/setting.png" alt="설정" width={24} height={24} />
      </button>
    </div>
  );
}
