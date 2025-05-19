// lint-staged.config.js
module.exports = {
  '*.{js,ts,tsx}': [
    'eslint --fix', // ESLint로 코드 수정
    'prettier --write', // Prettier로 포맷팅
  ],
  '*.md': ['prettier --write'], // 마크다운 파일 포맷팅
};
