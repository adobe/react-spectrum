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

import classNames from 'classnames';

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];

function extractValue(data, size) {
  if (Array.isArray(data)) {
    return data[sizes.indexOf(size)];
  }

  if (typeof data === 'object') {
    return data[size];
  }

  return data;
}

export default function responsive(template, data) {
  return classNames(sizes.map((size) => {
    let value = extractValue(data, size);
    if (value == null || value === false) {
      return '';
    }

    if (data === 'auto') {
      return template.replace(/#size.*$/, size);
    }

    return template.replace('#size', size).replace('#value', value);
  }));
}
