// src/lib/utils/uiResourceManager.ts
type RemovableElement = HTMLElement | HTMLStyleElement;

export class UIResourceManager {
  private elements: RemovableElement[] = [];

  register(el: RemovableElement) {
    this.elements.push(el);
  }

  cleanup() {
    this.elements.forEach((el) => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    this.elements = [];
  }
}
