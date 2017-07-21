import './style/index.styl';
import configureTypekit from '../utils/configureTypekit';

if (process.browser) {
  configureTypekit('ruf7eed');
  if (!/coral--/.test(document.body.className)) {
    document.body.classList.add('coral--light');
    document.body.classList.add('spectrum');
    document.body.classList.add('spectrum--light');
  }
}
