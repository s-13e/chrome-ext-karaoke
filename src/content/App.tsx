// src/content/App.tsx
import React from 'react';

export function App() {
  React.useEffect(() => {
    // 콘텐츠 스크립트 동작
    console.log('콘텐츠 스크립트가 실행됨!');
    document.body.style.border = '5px solid red';
  }, []);

  return null;
}
