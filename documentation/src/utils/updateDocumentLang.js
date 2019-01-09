import {getLocale} from '@react/react-spectrum/utils/intl';

export default function updateDocumentLang(lang) {
  if (document && !document.documentElement.language) {
    document.documentElement.lang = lang || getLocale();
  }
}
