// src/lib/utils/infra/overlayManager.ts
import { createRoot, Root } from 'react-dom/client';
import { injectLyricsOverlayRoot } from '@content/components/lyrics/infra/LyricsOverlayRoot';
import { ReactNode } from 'react';

/**
 * OverlayManager는 가사 오버레이, 노래 정보 오버레이 등
 * 여러 React Root 및 관련 DOM 컨테이너를 중앙에서 관리하는 싱글톤 클래스입니다.
 * 내부 DOM 엘리먼트 및 Root 중복생성 방지, 상태 확인, 렌더, 클린업 기능을 제공합니다.
 *
 * 낮은 수준의 DOM 생성/조작은 필요하면 src/lib/utils/dom 등으로 위임할 수 있습니다.
 */
export type OverlayType = 'lyrics' | 'songInfo' | string;

export interface OverlayInstance {
  root: Root;
  container: HTMLElement;
}

class OverlayManager {
  private overlays: Map<OverlayType, OverlayInstance> = new Map();
  private isInitializedFlags: Map<OverlayType, boolean> = new Map();

  // 내부: 타입별 컨테이너 생성 - 필요시 외부 API 호출
  private createContainer(type: OverlayType): HTMLElement {
    let container: HTMLElement | null = null;

    if (type === 'lyrics') {
      container = injectLyricsOverlayRoot();
      if (!container) {
        // 재시도 또는 기본 생성 시도 로직 추가 가능
        container = document.createElement('div');
        container.id = 'lyrics-cc-overlay';
        document.body.appendChild(container);
        console.warn('[OverlayManager] fallback: 기본 overlay container 생성');
      }
      console.log('[OverlayManager] lyrics container connected to DOM?', document.body.contains(container));
    } else if (type === 'songInfo') {
      container = document.getElementById('song-info-overlay-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'song-info-overlay-container';
        container.style.width = '100%';
        container.style.height = '100%';

        const lyricsOverlayRoot = document.getElementById('lyrics-cc-overlay');
        if (!lyricsOverlayRoot) {
          throw new Error('[OverlayManager] Lyrics overlay root not found');
        }
        lyricsOverlayRoot.appendChild(container);
      }
    } else {
      container = document.getElementById(`${type}-overlay-container`);
      if (!container) {
        container = document.createElement('div');
        container.id = `${type}-overlay-container`;

        document.body.appendChild(container);
        console.log(`[OverlayManager] created and appended container for type ${type}`);
      }
      console.log(`[OverlayManager] container connected to DOM?`, document.body.contains(container));
    }

    // 가시성 보장
    container.style.visibility = 'visible';
    console.log(`[OverlayManager] returning container for type ${type}:`, container);
    return container;
  }

  /**
   * Overlay React Root 생성 및 초기 마운트
   * 중복 생성 방지
   */
  public createOverlayRoot(type: OverlayType): Root {
    if (this.overlays.has(type)) {
      return this.overlays.get(type)!.root;
    }

    const container = this.createContainer(type);
    const root = createRoot(container);

    this.overlays.set(type, { root, container });
    this.isInitializedFlags.set(type, true);

    return root;
  }

  /** 특정 타입 Overlay React Root가 마운트되었는지 확인 */
  public isOverlayMounted(type: OverlayType): boolean {
    if (!this.overlays.has(type)) return false;
    const instance = this.overlays.get(type)!;
    return document.body.contains(instance.container);
  }

  /** 특정 타입 Overlay React Root에 렌더링 수행 */
  public renderOverlay(type: OverlayType, element: ReactNode): void {
    if (!this.overlays.has(type)) {
      this.createOverlayRoot(type);
    }
    this.overlays.get(type)?.root.render(element);
  }

  /** 특정 타입 Overlay 클린업 (React Root unmount + DOM 제거) */
  public cleanupOverlay(type: OverlayType): void {
    if (!this.overlays.has(type)) return;
    const { root, container } = this.overlays.get(type)!;
    try {
      root.unmount();
    } catch (e) {
      console.warn(`[OverlayManager] unmount error for ${type}:`, e);
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    this.overlays.delete(type);
    this.isInitializedFlags.delete(type);
  }

  /** 모든 관리 중인 오버레이 일괄 클린업 */
  public cleanupAll(): void {
    this.overlays.forEach((_instance, type) => {
      this.cleanupOverlay(type);
    });
  }

  /** 특정 타입 Overlay container 반환(없으면 null) */
  public getContainer(type: OverlayType): HTMLElement | null {
    return this.overlays.get(type)?.container || null;
  }

  /** 오버레이 타입별 초기화 상태 반환 */
  public isInitialized(type: OverlayType): boolean {
    return this.isInitializedFlags.get(type) ?? false;
  }

  /** 특정 타입 Overlay container visibility 조절 */
  public setVisibility(type: OverlayType, visible: boolean): void {
    const container = this.getContainer(type);
    if (!container) return;
    container.style.display = visible ? '' : 'none';
  }

  // 싱글톤 인스턴스
  private static instance: OverlayManager;

  public static getInstance(): OverlayManager {
    if (!OverlayManager.instance) {
      OverlayManager.instance = new OverlayManager();
    }
    return OverlayManager.instance;
  }
}

// 싱글톤 객체 export
export const overlayManager = OverlayManager.getInstance();
