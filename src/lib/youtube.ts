/** Extract an 11-char YouTube video id from common URL shapes. */
export function youtubeId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/
  );
  return m ? m[1] : null;
}
