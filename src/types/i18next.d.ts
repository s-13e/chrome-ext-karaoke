// src/types/i18next.d.ts
import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    resources: typeof import('@locales/en.json');
  }

  interface i18n {
    initializePromise?: Promise<boolean>;
  }
}
