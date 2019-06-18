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

import '../focus-ring-polyfill';
import './style/index.styl';
import configureTypekit from '../utils/configureTypekit';

export {setLocale} from '../utils/intl';

importSpectrumCSS('page');
importSpectrumCSS('typography');

if (process.browser) {
  configureTypekit('ruf7eed');
  if (!/coral--/.test(document.body && document.body.className)) {
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
