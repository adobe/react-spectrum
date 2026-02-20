import ReactDOM from 'react-dom';
import {ReactNode, version as ReactVersion, useEffect, useMemo, useRef} from 'react';
import {useLocale} from 'react-aria';
import './font-faces.css';

// Typekit ids for each CJK locale. These use dynamic subsetting, so cannot be loaded as CSS.
// Because of the large size of the JS, we only download the script for the locale that is used.
// Each of these kits includes regular, bold, extra bold, and black weights. Spectrum 2 does not use any lighter weights.
let scripts = {
  ja: 'pyb4hbv',
  ko: 'pux4zom',
  'zh-Hans': 'qwy0qqd',
  'zh-CN': 'qwy0qqd',
  'zh-SG': 'qwy0qqd',
  'zh-HK': 'wrf0dsa',
  'zh-Hant': 'twr1oiz',
  zh: 'twr1oiz'
};

// Font URLs from fonts.css to preload for each locale.
let preloads = {
  // Currently no preloads for arabic and hebrew, because we don't know which weights will be used ahead of time.
  // Browsers will emit warnings for unused preloads.
  // ar: [
    // 'https://use.typekit.net/af/dfb464/00000000000000007735a2f9/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n7&v=3',
    // 'https://use.typekit.net/af/560a53/00000000000000007735a300/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n4&v=3',
    // 'https://use.typekit.net/af/0f9162/00000000000000007735a307/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n6&v=3',
    // 'https://use.typekit.net/af/ab2792/00000000000000007735a309/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n9&v=3'
    // 'https://use.typekit.net/af/560a53/00000000000000007735a300/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n4&v=3'
  // ],
  // he: [
    // 'https://use.typekit.net/af/ffca46/00000000000000007735a30a/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n7&v=3',
    // 'https://use.typekit.net/af/e90860/00000000000000007735a313/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n4&v=3',
    // 'https://use.typekit.net/af/619974/00000000000000007735a31f/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n6&v=3'
    // 'https://use.typekit.net/af/e90860/00000000000000007735a313/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n4&v=3'
  // ],
  en: [
    // Preload Adobe Clean Spectrum VF.
    'https://use.typekit.net/af/ca4cba/0000000000000000775c55a1/31/l?primer=f592e0a4b9356877842506ce344308576437e4f677d7c9b78ca2162e6cad991a&fvd=n1&v=3'
  ]
};

export function Fonts(): ReactNode {
  let {locale: localeString} = useLocale();
  let locale = useMemo(() => new Intl.Locale(localeString), [localeString]);
  let languageAndRegion = locale.language + (locale.region ? '-' + locale.region : '');
  let languageAndScript = locale.language + (locale.script ? '-' + locale.script : '');

  // Load script tag for CJK font
  let typekitId = scripts[locale.baseName] || scripts[languageAndRegion] || scripts[languageAndScript] || scripts[locale.language];
  let script = typekitId ? `https://use.typekit.net/${typekitId}.js` : null;

  let scriptRef = useRef<HTMLScriptElement | null>(null);
  useEffect(() => {
    let scriptEl = scriptRef.current;

    // In older React versions, we must manually insert scripts into the <head>.
    // Scripts rendered by React are never executed.
    if (script && parseInt(ReactVersion, 10) < 19) {
      scriptEl = Array.from(document.scripts).find(s => s.src === script) || null;
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.async = true;
        scriptEl.src = script;
        document.head.appendChild(scriptEl);
      }
    }

    if (scriptEl) {
      scriptEl.onload = () => {
        if (typeof window['Typekit'] !== 'undefined' && typeof window['Typekit'].load === 'function') {
          window['Typekit'].load();
        }
      };
    }
  }, [scriptRef, script]);

  // When using React 19, async scripts are automatically deduped and hoisted into the <head>.
  // This also works during SSR.
  if (script && parseInt(ReactVersion, 10) >= 19) {
    return <script async src={script} key={script} ref={scriptRef} />;
  }

  // Preload fonts referenced by CSS file using React 19's preloading mechanism (when available).
  // This will insert a <link rel="preload"> tag in the <head>, which is useful during SSR to start
  // font loading before the CSS downloads.
  let preloadUrls = preloads[locale.language] || preloads.en;
  if (preloadUrls && typeof ReactDOM['preload'] === 'function') {
    for (let url of preloadUrls) {
      ReactDOM.preload(url, {
        as: 'font',
        type: 'font/woff2',
        crossOrigin: ''
      });
    }
  }

  return null;
}
