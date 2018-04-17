import '../focus-ring-polyfill';
import './style/index.styl';
import configureTypekit from '../utils/configureTypekit';

export {setLocale} from '../utils/intl';

if (process.browser) {
  configureTypekit('ruf7eed');
  if (!/coral--/.test(document.body.className)) {
    document.body.classList.add('coral--light');
    document.body.classList.add('spectrum');
    document.body.classList.add('spectrum--light');
  }
}

console.warn(
  'react-spectrum/page is deprecated and will be removed in the next major version. ' +
  'Please wrap your app in a <Provider> component instead. ' +
  'See https://git.corp.adobe.com/React/react-spectrum/releases/tag/v2.6.0'
);
