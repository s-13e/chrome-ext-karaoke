// src/hooks/useChromeStorage.ts
import { useState, useEffect } from 'react';

export function useChromeStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 값 불러오기
  useEffect(() => {
    chrome.storage.sync.get([key], (result) => {
      const storedValue = (result[key] as T | undefined) ?? defaultValue;
      setValue(storedValue);
      setIsLoading(false);
    });
  }, [key, defaultValue]);

  // 값 저장하기
  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    chrome.storage.sync.set({ [key]: newValue });
  };

  return [value, setStoredValue, isLoading] as const;
}
