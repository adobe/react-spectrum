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
