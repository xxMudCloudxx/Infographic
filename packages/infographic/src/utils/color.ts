export function hasColor(fill: string | null): boolean {
  if (!fill) return false;
  const normalizedFill = fill.trim().toLowerCase();
  if (
    normalizedFill === 'none' ||
    normalizedFill === 'transparent' ||
    normalizedFill === ''
  ) {
    return false;
  }
  return true;
}
