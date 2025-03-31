// This script is to run over all of our supported locales and numbering systems
// and check for the decimal and group separators so we can find
// non-standard keyboard characters such as the French group separator, narrow non-breaking whitespace.
// This way we can special case to be more permissive in NumberParser.


const NUMBERING_SYSTEMS = ['latn', 'arab', 'hanidec', 'deva', 'beng'];
let locales = [
  {label: 'French (France)', value: 'fr-FR'},
  {label: 'French (Canada)', value: 'fr-CA'},
  {label: 'German (Germany)', value: 'de-DE'},
  {label: 'English (Great Britain)', value: 'en-GB'},
  {label: 'English (United States)', value: 'en-US'},
  {label: 'Japanese (Japan)', value: 'ja-JP'},
  {label: 'Danish (Denmark)', value: 'da-DK'},
  {label: 'Dutch (Netherlands)', value: 'nl-NL'},
  {label: 'Finnish (Finland)', value: 'fi-FI'},
  {label: 'Italian (Italy)', value: 'it-IT'},
  {label: 'Norwegian (Norway)', value: 'nb-NO'},
  {label: 'Spanish (Spain)', value: 'es-ES'},
  {label: 'Swedish (Sweden)', value: 'sv-SE'},
  {label: 'Portuguese (Brazil)', value: 'pt-BR'},
  {label: 'Chinese (Simplified)', value: 'zh-CN'},
  {label: 'Chinese (Traditional)', value: 'zh-TW'},
  {label: 'Korean (Korea)', value: 'ko-KR'},
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
  {label: 'Arabic (United Arab Emirates)', value: 'ar-AE'}, // ar-SA??
  {label: 'Greek (Greece)', value: 'el-GR'},
  {label: 'Hebrew (Israel)', value: 'he-IL'}
];

let separators = new Map();
for (let nums of NUMBERING_SYSTEMS) {
  for (let locale of locales) {
    let formatter = new Intl.NumberFormat(locale.value + '-u-nu-' + nums, {});
    let parts = formatter.formatToParts(10000000000);
    let separator = parts.find(p => p.type === 'group')?.value;
    if (separators.has(separator)) {
      separators.set(separator, [...separators.get(separator), locale.value + '-u-nu-' + nums])
    } else {
      separators.set(separator, [separator.charCodeAt(0), locale.value + '-u-nu-' + nums]);
    }
  }
}
console.log(separators);

let decimals = new Map();
for (let nums of NUMBERING_SYSTEMS) {
  for (let locale of locales) {
    let formatter = new Intl.NumberFormat(locale.value + '-u-nu-' + nums, {minimumFractionDigits: 2});
    let parts = formatter.formatToParts(10000.0000001);
    let decimal = parts.find(p => p.type === 'decimal')?.value;
    if (decimals.has(decimal)) {
      decimals.set(decimal, [...decimals.get(decimal), locale.value + '-u-nu-' + nums])
    } else {
      decimals.set(decimal, [decimal.charCodeAt(0), locale.value + '-u-nu-' + nums]);
    }
  }
}
console.log(decimals);
