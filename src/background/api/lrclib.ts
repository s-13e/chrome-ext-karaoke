// background/api/lrclib.ts
export async function fetchLrclibLyrics(artist: string, title: string): Promise<string | null> {
  const endpoint = `https://lrclib.net/api/get?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}`;
  const res = await fetch(endpoint);
  if (!res.ok) return null;
  const data = await res.json();
  return data?.syncedLyrics || data?.plainLyrics || null;
}
