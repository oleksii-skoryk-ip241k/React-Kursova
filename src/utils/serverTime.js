export function formatTimeOnline(joinedAt) {
  const diff = Math.floor((Date.now() - joinedAt) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}г ${m}хв`;
  return `${m}хв`;
}

export function formatUptime(startedAt) {
  if (!startedAt) return '—';
  const diff = Math.floor((Date.now() - startedAt) / 1000);
  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (d > 0) return `${d}д ${h}г ${m}хв`;
  if (h > 0) return `${h}г ${m}хв`;
  return `${m}хв`;
}
