export function isUrl(string) {
  return !!string.match(/\/|:|\./g);
}
