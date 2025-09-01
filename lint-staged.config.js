// lint-staged.config.js
module.exports = {
  '*{js,ts,tsx}': ['eslint --fix', 'prettier --write'],

  '*.md': ['prettier --write'], // 마크다운 파일 포맷팅
};
