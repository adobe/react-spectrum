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

export default function configureTypekit(typeKitId) {
  const config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    const h = document.getElementsByTagName('html')[0];
    h.className += ' wf-loading';

    const t = setTimeout(() => {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, ' ');
      h.className += ' wf-inactive';
    }, config.scriptTimeout);

    const tk = document.createElement('script');
    let d = false;

    tk.src = `https://use.typekit.net/${config.kitId}.js`;
    tk.type = 'text/javascript';
    tk.async = 'true';
    tk.onload = tk.onreadystatechange = function onload() {
      const a = this.readyState;
      if (d || a && a !== 'complete' && a !== 'loaded') {
        return;
      }
      d = true;
      clearTimeout(t);
      try {
        window.Typekit.load(config);
      } catch (b) { /* empty */ }
    };

    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(tk, s);
  }
}
