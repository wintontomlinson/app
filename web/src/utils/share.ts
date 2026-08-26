export async function shareMusic(path: string, title: string) {
  const url = new URL(path, window.location.origin).toString();
  if (navigator.share) {
    await navigator.share({ title: `${title} · Sonora Music`, url });
    return 'Shared';
  }
  await navigator.clipboard.writeText(url);
  return 'Link copied';
}
