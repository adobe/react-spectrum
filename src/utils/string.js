export function isUrl(string) {
  return string && !!string.match(/\/|:|\./g);
}

export function normalize(string = '', normalizationForm = 'NFC') {
  if ('normalize' in String.prototype) {
    string = string.normalize(normalizationForm);
  }
  return string;
}

export function removeDiacritics(string = '', normalizationForm = 'NFD') {
  return normalize(string, normalizationForm.replace('C', 'D')).replace(/[\u0300-\u036f]/g, '');
}
