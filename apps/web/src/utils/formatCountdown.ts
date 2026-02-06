export function formatCountdown(expiresAt: string | Date | null): string {
  if (!expiresAt) return 'n/a';
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'EXPIRED';
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
