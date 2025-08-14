import { detectScript } from './languageDetectorSimple';

export type ScriptSpan = {
  lang: string | null;
  text: string;
};

export function splitByScript(text: string): ScriptSpan[] {
  const spans: ScriptSpan[] = [];
  let buffer = '';
  let currentLang: string | null = null;

  for (const char of text) {
    const lang = detectScript(char);
    if (lang !== currentLang) {
      if (buffer) spans.push({ lang: currentLang, text: buffer });
      buffer = char;
      currentLang = lang;
    } else {
      buffer += char;
    }
  }
  if (buffer) spans.push({ lang: currentLang, text: buffer });
  return spans;
}
