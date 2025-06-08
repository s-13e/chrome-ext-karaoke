import { MESSAGE_TYPES } from '@constants/messageTypes';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed!');
});

// background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === MESSAGE_TYPES.TOGGLE_CONTENT) {
    console.log('Toggle received:', message.enabled);
    return true; // 비동기 처리 활성화
  }
});

// 특정 페이지에서만 툴바의 아이콘(버튼)이 보이도록 하려함
