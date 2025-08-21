/**
 * SPA 네비 및 URL 변경 감지용
 * @param currentUrl 현재 URL
 * @param lastUrl 이전 URL
 * @returns boolean URL 변경 여부
 */
export function hasUrlChanged(currentUrl: string, lastUrl: string): boolean {
  console.log(`[hasUrlChanged] current Url: ${currentUrl}, last Url: ${lastUrl}`);
  return currentUrl !== lastUrl;
}
