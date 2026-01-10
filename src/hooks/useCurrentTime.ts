// YouTube 비디오의 현재 재생 시간을 React 상태로 실시간 추적하여,
// 가사 오버레이, 전체 가사 하이라이트 등에서 재사용할 수 있도록 합니다.
//
// 메모리 최적화: CurrentTimeContext를 사용하여 중복 이벤트 리스너 방지

export { useCurrentTime } from './CurrentTimeContext';
