/**
 * Jest Setup File
 * Chrome Extension API mocks for testing environment
 */

// Mock chrome.runtime.getURL for tests that use Chrome Extension APIs
global.chrome = {
  runtime: {
    getURL: (path) => `chrome-extension://mock-extension-id/${path}`,
  },
};
