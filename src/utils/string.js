export function isUrl(string) {
  return string && !!string.match(/\/|:|\./g);
}
