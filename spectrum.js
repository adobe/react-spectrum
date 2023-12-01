import s_large from './spectrum-css-temp/vars/spectrum-large.css';
// import light from '@adobe/spectrum-css-temp/vars/s2-light.css';
import s_medium from './spectrum-css-temp/vars/spectrum-medium.css';
import s2 from './spectrum-css-temp/vars/s2.css';
import dark from './dist/css/dark-vars.css';
import global from './dist/css/global-vars.css';
import large from './dist/css/large-vars.css';
import light from './dist/css/light-vars.css';
import medium from './dist/css/medium-vars.css';
import './src/tailwind.css';
console.log(s2);

export let theme = {
  global: {
    ...global,
    s2: s2.s2
  },
  light,
  dark,
  medium: {
    ...medium,
    medium: s_medium['spectrum--medium']
    // express: s2.medium
  },
  large: {
    ...large,
    large: s_large['spectrum--large']
    // express: s2.large
  }
};
