export function clamp(value: number, min: number = -Infinity, max: number = Infinity): number {
  return Math.min(Math.max(value, min), max);
}
