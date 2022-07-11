const {parse, TYPE} = require('@formatjs/icu-messageformat-parser');

function compile(message) {
  let parts = parse(message);
  return compileParts(parts);
}

module.exports = compile;

function compileParts(parts, inline = false, pluralValue = '') {
  let hasArgs = false;
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
        break;
      }
      case TYPE.select:
        res += '${formatter.select(' + compileOptions(part.options, pluralValue) + ', args.' + part.value + ')}';
        break;
      case TYPE.pound:
        res += '${formatter.number(' + pluralValue + ')}';
        break;
      default:
        throw new Error('Unsupported message type: ' + part.type);
    }
  }

  res += '`';

  if (hasArgs) {
    res = (inline ? '() => ' : '(formatter, args) => ') + res;
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
