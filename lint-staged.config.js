// lint-staged.config.js
module.exports = {
  '*.{js,ts,tsx}': [
    'eslint --config ./eslint/eslint.config.dev.mjs --fix', // 커밋 시 개발용 규칙 사용
    'prettier --write', // Prettier로 포맷팅
  ],
  '*.md': ['prettier --write'], // 마크다운 파일 포맷팅
};
