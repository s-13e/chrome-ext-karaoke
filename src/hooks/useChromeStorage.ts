// src/hooks/useChromeStorage.ts
import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 값 불러오기 + 다른 컨텍스트(popup 등)의 storage 변경 실시간 반영
  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      const storedValue = (result[key] as T | undefined) ?? defaultValue;
      setValue(storedValue);
      setIsLoading(false);
    });

    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'sync') return;
      const change = changes[key];
      if (!change) return;
      setValue((change.newValue as T | undefined) ?? defaultValue);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key, defaultValue]);

  // 값 저장하기
  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, setStoredValue, isLoading] as const;
}
