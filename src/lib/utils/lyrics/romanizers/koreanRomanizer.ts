import { romanize } from '@daun_jung/korean-romanizer';

export function koreanRomanizer(text: string): string {
  return romanize(text);
}
