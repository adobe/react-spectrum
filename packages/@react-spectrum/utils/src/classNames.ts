import _classNames from 'classnames';

export let shouldKeepSpectrumClassNames = false;

export function keepSpectrumClassNames() {
  shouldKeepSpectrumClassNames = true;
  console.warn(
    'Legacy spectrum-prefixed class names enabled for backward compatibility. ' +
    'We recommend replacing instances of CSS overrides targeting spectrum selectors ' +
    'in your app with custom class names of your own, and disabling this flag.'
  );
}

const spectrumRegex = /^(spectrum|react-spectrum)/;

export function classNames(cssModule: {[key: string]: string}, ...values: Array<string | Object>): string {
  let classes = [];
  for (let value of values) {
    if (typeof value === 'object' && value) {
      let mapped = {};
      for (let key in value) {
        if (cssModule[key]) {
          mapped[cssModule[key]] = value[key];
        }

        if (shouldKeepSpectrumClassNames || !cssModule[key]) {
          mapped[key] = value[key];
        }
      }

      classes.push(mapped);
    } else if (typeof value === 'string') {
      if (cssModule[value]) {
        classes.push(cssModule[value]);
      }

      if (shouldKeepSpectrumClassNames || !cssModule[value]) {
        classes.push(value);
      }
    } else {
      classes.push(value);
    }
  }

  return _classNames(...classes);
}
