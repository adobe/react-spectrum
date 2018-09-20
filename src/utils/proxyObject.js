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

  for (let key of getAllPropertyNames(Object.getPrototypeOf(obj))) {
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
