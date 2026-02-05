/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  // TypeScript 지원
  preset: 'ts-jest',

  testEnvironment: 'jsdom',

  // Setup file for Chrome API mocks
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 소스 코드 위치 (src 폴더 내에서만 테스트)
  roots: ['<rootDir>/src'],

  // 테스트 파일 패턴
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],

  // 지원 파일 확장자
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Path aliases (webpack alias와 동일하게 설정)
  moduleNameMapper: {
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@background/(.*)$': '<rootDir>/src/background/$1',
    '^@content/(.*)$': '<rootDir>/src/content/$1',
    '^@popup/(.*)$': '<rootDir>/src/popup/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
  },

  // 커버리지 리포트 옵션
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // TypeScript 설정 파일 경로
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {}], // ✅ `.tsx?`를 정확히 매칭
    '^.+\\.[jt]sx?$': 'babel-jest', // .js, .jsx, .ts, .tsx 파일은 babel-jest로 변환
  },
  // ESM 모듈 변환 허용
  transformIgnorePatterns: ['node_modules/(?!(@dehoist/romanize-thai|arabic-transliterate)/)'],
};
