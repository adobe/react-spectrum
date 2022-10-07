import themeGlobal from '@adobe/spectrum-css-temp/vars/spectrum-global.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light.css';
import themeLightest from '@adobe/spectrum-css-temp/vars/spectrum-lightest.css';
import themeDark from '@adobe/spectrum-css-temp/vars/spectrum-dark.css';
import themeDarkest from '@adobe/spectrum-css-temp/vars/spectrum-darkest.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium.css';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large.css';
import express from '@adobe/spectrum-css-temp/vars/express.css';

const THEME = {
  global: themeGlobal,
  light: themeLight,
  lightest: themeLightest,
  dark: themeDark,
  darkest: themeDarkest
};

export const scales = {
  medium: scaleMedium,
  large: scaleLarge
};

export let defaultTheme = {
  global: THEME.global,
  light: THEME.light,
  dark: THEME.darkest,
  medium: scales.medium,
  large: scales.large
};

export let altTheme = {
  global: THEME.global,
  light: THEME.lightest,
  dark: THEME.dark,
  medium: scales.medium,
  large: scales.large
};

export let themes = {
  light: defaultTheme,
  dark: altTheme,
  lightest: altTheme,
  darkest: defaultTheme
};

export let expressThemes = {};
for (let key in themes) {
  expressThemes[key] = {
    ...themes[key],
    global: {
      ...themes[key].global,
      express: express.express
    },
    medium: {
      ...themes[key].medium,
      express: express.medium
    },
    large: {
      ...themes[key].large,
      express: express.large
    }
  };
}

console.log(expressThemes)

// Based on https://adobe.sharepoint.com/sites/global/SitePages/Languages%20Supported.aspx
export let locales = [
  {label: 'Auto', value: ''},
  // Tier 1
  {label: 'French (France)', value: 'fr-FR'},
  {label: 'French (Canada)', value: 'fr-CA'},
  {label: 'German (Germany)', value: 'de-DE'},
  {label: 'English (Great Britain)', value: 'en-GB'},
  {label: 'English (United States)', value: 'en-US'},
  {label: 'Japanese (Japan)', value: 'ja-JP'},
  // // Tier 2
  {label: 'Danish (Denmark)', value: 'da-DK'},
  {label: 'Dutch (Netherlands)', value: 'nl-NL'},
  {label: 'Finnish (Finland)', value: 'fi-FI'},
  {label: 'Italian (Italy)', value: 'it-IT'},
  {label: 'Norwegian (Norway)', value: 'nb-NO'},
  {label: 'Spanish (Spain)', value: 'es-ES'},
  {label: 'Swedish (Sweden)', value: 'sv-SE'},
  {label: 'Portuguese (Brazil)', value: 'pt-BR'},
  // // Tier 3
  {label: 'Chinese (Simplified)', value: 'zh-CN'},
  {label: 'Chinese (Traditional)', value: 'zh-TW'},
  {label: 'Korean (Korea)', value: 'ko-KR'},
  // // Tier 4
  {label: 'Bulgarian (Bulgaria)', value: 'bg-BG'},
  {label: 'Croatian (Croatia)', value: 'hr-HR'},
  {label: 'Czech (Czech Republic)', value: 'cs-CZ'},
  {label: 'Estonian (Estonia)', value: 'et-EE'},
  {label: 'Hungarian (Hungary)', value: 'hu-HU'},
  {label: 'Latvian (Latvia)', value: 'lv-LV'},
  {label: 'Lithuanian (Lithuania)', value: 'lt-LT'},
  {label: 'Polish (Poland)', value: 'pl-PL'},
  {label: 'Romanian (Romania)', value: 'ro-RO'},
  {label: 'Russian (Russia)', value: 'ru-RU'},
  {label: 'Serbian (Serbia)', value: 'sr-SP'},
  {label: 'Slovakian (Slovakia)', value: 'sk-SK'},
  {label: 'Slovenian (Slovenia)', value: 'sl-SI'},
  {label: 'Turkish (Turkey)', value: 'tr-TR'},
  {label: 'Ukrainian (Ukraine)', value: 'uk-UA'},
  // // Tier 5
  {label: 'Arabic (United Arab Emirates)', value: 'ar-AE'}, // ar-SA??
  {label: 'Greek (Greece)', value: 'el-GR'},
  {label: 'Hebrew (Israel)', value: 'he-IL'}
];
