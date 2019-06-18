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

import {Component} from 'react';

/**
 * Creates a proxy object containing all of the methods of the input object
 * bound to that object, such that calling them still applies to the input
 * object. This allows combining the methods of two objects without mutating
 * either one.
 */
export default function proxy(obj) {
  let res = {};
  if (!obj) {
    return res;
  }

  for (let key of getAllPropertyNames(obj)) {
    if (typeof obj[key] === 'function') {
      res[key] = obj[key].bind(obj);
    }
  }

  return res;
}

function getAllPropertyNames(obj) {
  var props = [];

  do {
    props = props.concat(Object.getOwnPropertyNames(obj));
  } while ((obj = Object.getPrototypeOf(obj)) && obj !== Object.prototype && obj !== Component.prototype);

  return props;
}
