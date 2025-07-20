// src/lib/utils/listenerManager.ts

type UnregisterFn = () => void;

class ListenerManager {
  private unregisterFns: UnregisterFn[] = [];

  /**
   * 리스너 등록 함수
   * @param register 등록 함수 (리스너 등록 시 호출, 해제 함수 반환)
   */
  public add(register: () => UnregisterFn): void {
    const unregister = register();
    this.unregisterFns.push(unregister);
  }

  /**
   * 모든 리스너 해제 (cleanup)
   */
  public removeAll(): void {
    this.unregisterFns.forEach((unregister) => {
      try {
        unregister();
      } catch {
        // 해제 중 에러 무시
      }
    });
    this.unregisterFns = [];
  }
}

// 싱글 인스턴스 export (프로젝트 전체에서 공유)
export const listenerManager = new ListenerManager();
