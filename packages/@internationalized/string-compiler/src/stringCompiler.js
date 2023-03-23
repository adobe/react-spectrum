/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {parse, TYPE} = require('@formatjs/icu-messageformat-parser');

function compileStrings(messages) {
  let res = 'module.exports = {';
  for (let key in messages) {
    res += '  ' + JSON.stringify(key) + ': ' + compileString(messages[key]) + ',\n';
  }

  res += '}';
  return res;
}

exports.compileStrings = compileStrings;

function compileString(message) {
  let parts = parse(message);
  return compileParts(parts);
}

exports.compileString = compileString;

function compileParts(parts, inline = false, pluralValue = '') {
  let hasArgs = false;
  let usesFormatter = false;
  let res = '`';
  for (let part of parts) {
    if (part.type !== TYPE.literal) {
      hasArgs = true;
    }

    switch (part.type) {
      case TYPE.literal:
        res += escape(part.value);
        break;
      case TYPE.argument:
        res += '${args.' + part.value + '}';
        break;
      case TYPE.plural: {
        let pluralValue = 'args.' + part.value + (part.offset ? ' - ' + part.offset : '');
        res += '${formatter.plural('
          + pluralValue
          + ', ' + compileOptions(part.options, pluralValue)
          + (part.pluralType !== 'cardinal' ? ', "ordinal"' : '')
          + ')}';
        usesFormatter = true;
        break;
      }
      case TYPE.select:
        res += '${formatter.select(' + compileOptions(part.options, pluralValue) + ', args.' + part.value + ')}';
        usesFormatter = true;
        break;
      case TYPE.pound:
        res += '${formatter.number(' + pluralValue + ')}';
        usesFormatter = true;
        break;
      case TYPE.number:
        // TODO: Eventually this will need to support the formatting options that are possible here.
        //  They're in part.parsedOptions. Would require changes to the formatter to support it though.
        res += '${formatter.number(args.' + part.value + ')}';
        usesFormatter = true;
        break;
      default:
        throw new Error('Unsupported message type: ' + part.type);
    }
  }

  res += '`';

  if (hasArgs) {
    res = (inline ? '() => ' : '(args' + (usesFormatter ? ', formatter' : '') + ') => ') + res;
  }

  return res;
}

function compileOptions(options, pluralValue) {
  let res = '{';
  let keys = Object.keys(options);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    res += key.startsWith('=') ? JSON.stringify(key) : key;
    res += ': ' + compileParts(options[key].value, true, pluralValue);
    if (i < keys.length - 1) {
      res += ', ';
    }
  }
  res += '}';
  return res;
}

function escape(string) {
  return string.replace(/([$`])/g, '\\$1');
}
