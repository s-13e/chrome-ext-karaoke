// background/api/youtube.ts
export async function fetchYouTubeVideoMeta(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.items && data.items.length > 0) {
    const snippet = data.items[0].snippet;
    return {
      categoryId: snippet.categoryId,
      title: snippet.title,
      description: snippet.description,
      tags: snippet.tags,
      channelTitle: snippet.channelTitle,
      // duration은 videos.list에서 part=contentDetails 추가로 받아야 함
    };
  }
  return null;
}
