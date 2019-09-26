import themeLight from '@spectrum-css/vars/dist/spectrum-light-unique.css';
import themeLightest from '@spectrum-css/vars/dist/spectrum-lightest-unique.css';
import themeDark from '@spectrum-css/vars/dist/spectrum-dark-unique.css';
import themeDarkest from '@spectrum-css/vars/dist/spectrum-darkest-unique.css';
import scaleMedium from '@spectrum-css/vars/dist/spectrum-medium-unique.css';
import scaleLarge from '@spectrum-css/vars/dist/spectrum-large-unique.css';

const THEME = {
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
  light: THEME.light,
  dark: THEME.dark,
  medium: scales.medium,
  large: scales.large
};

export let altTheme = {
  light: THEME.lightest,
  dark: THEME.darkest,
  medium: scales.medium,
  large: scales.large
};

export let themes = {
  light: defaultTheme,
  dark: defaultTheme,
  lightest: altTheme,
  darkest: altTheme
};

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
