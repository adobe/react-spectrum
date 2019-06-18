/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

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

/** adapted from https://github.com/rwu823/react-addons-text-content */
export function getTextFromReact(reactChild) {
  let result = '';

  const addChildTextToResult = (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      result = `${result} ${child}`;
    } else if (Array.isArray(child)) {
      child.forEach(c => addChildTextToResult(c));
    } else if (child && child.props) {
      const {children} = child.props;
      if (Array.isArray(children)) {
        children.forEach(c => addChildTextToResult(c));
      } else {
        addChildTextToResult(children);
      }
    }
  };

  addChildTextToResult(reactChild);

  // clean up adjacent whitespace in result
  const adjacentWhitespaceRegex = /(\s)(?:\s+)/g;
  return result.trim().replace(adjacentWhitespaceRegex, '$1');
}
