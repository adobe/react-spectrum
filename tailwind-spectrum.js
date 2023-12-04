let plugin = require('tailwindcss/plugin');
// let flattenColorPalette = require('tailwindcss/lib/util/flattenColorPalette.js').default;

let colors = {
  current: 'currentColor',
  white: 'white',
  black: 'black',
  transparent: 'transparent',
  gray: {
    background: 'var(--spectrum-gray-background-color-default)',
    visual: 'var(--spectrum-gray-visual-color)',
    25: 'var(--spectrum-gray-25)',
    50: 'var(--spectrum-gray-50)',
    75: 'var(--spectrum-gray-75)',
    100: 'var(--spectrum-gray-100)',
    200: 'var(--spectrum-gray-200)',
    300: 'var(--spectrum-gray-300)',
    400: 'var(--spectrum-gray-400)',
    500: 'var(--spectrum-gray-500)',
    600: 'var(--spectrum-gray-600)',
    700: 'var(--spectrum-gray-700)',
    800: 'var(--spectrum-gray-800)',
    900: 'var(--spectrum-gray-900)',
    1000: 'var(--spectrum-gray-1000)'
  },
  blue: {
    background: 'var(--spectrum-blue-background-color-default)',
    visual: 'var(--spectrum-blue-visual-color)',
    100: 'var(--spectrum-blue-100)',
    200: 'var(--spectrum-blue-200)',
    300: 'var(--spectrum-blue-300)',
    400: 'var(--spectrum-blue-400)',
    500: 'var(--spectrum-blue-500)',
    600: 'var(--spectrum-blue-600)',
    700: 'var(--spectrum-blue-700)',
    800: 'var(--spectrum-blue-800)',
    900: 'var(--spectrum-blue-900)',
    1000: 'var(--spectrum-blue-1000)',
    1100: 'var(--spectrum-blue-1100)',
    1200: 'var(--spectrum-blue-1200)',
    1300: 'var(--spectrum-blue-1300)',
    1400: 'var(--spectrum-blue-1400)',
    1500: 'var(--spectrum-blue-1500)',
    1600: 'var(--spectrum-blue-1600)'
  },
  green: {
    background: 'var(--spectrum-green-background-color-default)',
    visual: 'var(--spectrum-green-visual-color)',
    100: 'var(--spectrum-green-100)',
    200: 'var(--spectrum-green-200)',
    300: 'var(--spectrum-green-300)',
    400: 'var(--spectrum-green-400)',
    500: 'var(--spectrum-green-500)',
    600: 'var(--spectrum-green-600)',
    700: 'var(--spectrum-green-700)',
    800: 'var(--spectrum-green-800)',
    900: 'var(--spectrum-green-900)',
    1000: 'var(--spectrum-green-1000)',
    1100: 'var(--spectrum-green-1100)',
    1200: 'var(--spectrum-green-1200)',
    1300: 'var(--spectrum-green-1300)',
    1400: 'var(--spectrum-green-1400)',
    1500: 'var(--spectrum-green-1500)',
    1600: 'var(--spectrum-green-1600)'
  },
  orange: {
    background: 'var(--spectrum-orange-background-color-default)',
    visual: 'var(--spectrum-orange-visual-color)',
    100: 'var(--spectrum-orange-100)',
    200: 'var(--spectrum-orange-200)',
    300: 'var(--spectrum-orange-300)',
    400: 'var(--spectrum-orange-400)',
    500: 'var(--spectrum-orange-500)',
    600: 'var(--spectrum-orange-600)',
    700: 'var(--spectrum-orange-700)',
    800: 'var(--spectrum-orange-800)',
    900: 'var(--spectrum-orange-900)',
    1000: 'var(--spectrum-orange-1000)',
    1100: 'var(--spectrum-orange-1100)',
    1200: 'var(--spectrum-orange-1200)',
    1300: 'var(--spectrum-orange-1300)',
    1400: 'var(--spectrum-orange-1400)',
    1500: 'var(--spectrum-orange-1500)',
    1600: 'var(--spectrum-orange-1600)'
  },
  red: {
    background: 'var(--spectrum-red-background-color-default)',
    visual: 'var(--spectrum-red-visual-color)',
    100: 'var(--spectrum-red-100)',
    200: 'var(--spectrum-red-200)',
    300: 'var(--spectrum-red-300)',
    400: 'var(--spectrum-red-400)',
    500: 'var(--spectrum-red-500)',
    600: 'var(--spectrum-red-600)',
    700: 'var(--spectrum-red-700)',
    800: 'var(--spectrum-red-800)',
    900: 'var(--spectrum-red-900)',
    1000: 'var(--spectrum-red-1000)',
    1100: 'var(--spectrum-red-1100)',
    1200: 'var(--spectrum-red-1200)',
    1300: 'var(--spectrum-red-1300)',
    1400: 'var(--spectrum-red-1400)',
    1500: 'var(--spectrum-red-1500)',
    1600: 'var(--spectrum-red-1600)'
  },
  celery: {
    background: 'var(--spectrum-celery-background-color-default)',
    visual: 'var(--spectrum-celery-visual-color)',
    100: 'var(--spectrum-celery-100)',
    200: 'var(--spectrum-celery-200)',
    300: 'var(--spectrum-celery-300)',
    400: 'var(--spectrum-celery-400)',
    500: 'var(--spectrum-celery-500)',
    600: 'var(--spectrum-celery-600)',
    700: 'var(--spectrum-celery-700)',
    800: 'var(--spectrum-celery-800)',
    900: 'var(--spectrum-celery-900)',
    1000: 'var(--spectrum-celery-1000)',
    1100: 'var(--spectrum-celery-1100)',
    1200: 'var(--spectrum-celery-1200)',
    1300: 'var(--spectrum-celery-1300)',
    1400: 'var(--spectrum-celery-1400)',
    1500: 'var(--spectrum-celery-1500)',
    1600: 'var(--spectrum-celery-1600)'
  },
  chartreuse: {
    background: 'var(--spectrum-chartreuse-background-color-default)',
    visual: 'var(--spectrum-chartreuse-visual-color)',
    100: 'var(--spectrum-chartreuse-100)',
    200: 'var(--spectrum-chartreuse-200)',
    300: 'var(--spectrum-chartreuse-300)',
    400: 'var(--spectrum-chartreuse-400)',
    500: 'var(--spectrum-chartreuse-500)',
    600: 'var(--spectrum-chartreuse-600)',
    700: 'var(--spectrum-chartreuse-700)',
    800: 'var(--spectrum-chartreuse-800)',
    900: 'var(--spectrum-chartreuse-900)',
    1000: 'var(--spectrum-chartreuse-1000)',
    1100: 'var(--spectrum-chartreuse-1100)',
    1200: 'var(--spectrum-chartreuse-1200)',
    1300: 'var(--spectrum-chartreuse-1300)',
    1400: 'var(--spectrum-chartreuse-1400)',
    1500: 'var(--spectrum-chartreuse-1500)',
    1600: 'var(--spectrum-chartreuse-1600)'
  },
  cyan: {
    background: 'var(--spectrum-cyan-background-color-default)',
    visual: 'var(--spectrum-cyan-visual-color)',
    100: 'var(--spectrum-cyan-100)',
    200: 'var(--spectrum-cyan-200)',
    300: 'var(--spectrum-cyan-300)',
    400: 'var(--spectrum-cyan-400)',
    500: 'var(--spectrum-cyan-500)',
    600: 'var(--spectrum-cyan-600)',
    700: 'var(--spectrum-cyan-700)',
    800: 'var(--spectrum-cyan-800)',
    900: 'var(--spectrum-cyan-900)',
    1000: 'var(--spectrum-cyan-1000)',
    1100: 'var(--spectrum-cyan-1100)',
    1200: 'var(--spectrum-cyan-1200)',
    1300: 'var(--spectrum-cyan-1300)',
    1400: 'var(--spectrum-cyan-1400)',
    1500: 'var(--spectrum-cyan-1500)',
    1600: 'var(--spectrum-cyan-1600)'
  },
  fuchsia: {
    background: 'var(--spectrum-fuchsia-background-color-default)',
    visual: 'var(--spectrum-fuchsia-visual-color)',
    100: 'var(--spectrum-fuchsia-100)',
    200: 'var(--spectrum-fuchsia-200)',
    300: 'var(--spectrum-fuchsia-300)',
    400: 'var(--spectrum-fuchsia-400)',
    500: 'var(--spectrum-fuchsia-500)',
    600: 'var(--spectrum-fuchsia-600)',
    700: 'var(--spectrum-fuchsia-700)',
    800: 'var(--spectrum-fuchsia-800)',
    900: 'var(--spectrum-fuchsia-900)',
    1000: 'var(--spectrum-fuchsia-1000)',
    1100: 'var(--spectrum-fuchsia-1100)',
    1200: 'var(--spectrum-fuchsia-1200)',
    1300: 'var(--spectrum-fuchsia-1300)',
    1400: 'var(--spectrum-fuchsia-1400)',
    1500: 'var(--spectrum-fuchsia-1500)',
    1600: 'var(--spectrum-fuchsia-1600)'
  },
  indigo: {
    background: 'var(--spectrum-indigo-background-color-default)',
    visual: 'var(--spectrum-indigo-visual-color)',
    100: 'var(--spectrum-indigo-100)',
    200: 'var(--spectrum-indigo-200)',
    300: 'var(--spectrum-indigo-300)',
    400: 'var(--spectrum-indigo-400)',
    500: 'var(--spectrum-indigo-500)',
    600: 'var(--spectrum-indigo-600)',
    700: 'var(--spectrum-indigo-700)',
    800: 'var(--spectrum-indigo-800)',
    900: 'var(--spectrum-indigo-900)',
    1000: 'var(--spectrum-indigo-1000)',
    1100: 'var(--spectrum-indigo-1100)',
    1200: 'var(--spectrum-indigo-1200)',
    1300: 'var(--spectrum-indigo-1300)',
    1400: 'var(--spectrum-indigo-1400)',
    1500: 'var(--spectrum-indigo-1500)',
    1600: 'var(--spectrum-indigo-1600)'
  },
  magenta: {
    background: 'var(--spectrum-magenta-background-color-default)',
    visual: 'var(--spectrum-magenta-visual-color)',
    100: 'var(--spectrum-magenta-100)',
    200: 'var(--spectrum-magenta-200)',
    300: 'var(--spectrum-magenta-300)',
    400: 'var(--spectrum-magenta-400)',
    500: 'var(--spectrum-magenta-500)',
    600: 'var(--spectrum-magenta-600)',
    700: 'var(--spectrum-magenta-700)',
    800: 'var(--spectrum-magenta-800)',
    900: 'var(--spectrum-magenta-900)',
    1000: 'var(--spectrum-magenta-1000)',
    1100: 'var(--spectrum-magenta-1100)',
    1200: 'var(--spectrum-magenta-1200)',
    1300: 'var(--spectrum-magenta-1300)',
    1400: 'var(--spectrum-magenta-1400)',
    1500: 'var(--spectrum-magenta-1500)',
    1600: 'var(--spectrum-magenta-1600)'
  },
  purple: {
    background: 'var(--spectrum-purple-background-color-default)',
    visual: 'var(--spectrum-purple-visual-color)',
    100: 'var(--spectrum-purple-100)',
    200: 'var(--spectrum-purple-200)',
    300: 'var(--spectrum-purple-300)',
    400: 'var(--spectrum-purple-400)',
    500: 'var(--spectrum-purple-500)',
    600: 'var(--spectrum-purple-600)',
    700: 'var(--spectrum-purple-700)',
    800: 'var(--spectrum-purple-800)',
    900: 'var(--spectrum-purple-900)',
    1000: 'var(--spectrum-purple-1000)',
    1100: 'var(--spectrum-purple-1100)',
    1200: 'var(--spectrum-purple-1200)',
    1300: 'var(--spectrum-purple-1300)',
    1400: 'var(--spectrum-purple-1400)',
    1500: 'var(--spectrum-purple-1500)',
    1600: 'var(--spectrum-purple-1600)'
  },
  seafoam: {
    background: 'var(--spectrum-seafoam-background-color-default)',
    visual: 'var(--spectrum-seafoam-visual-color)',
    100: 'var(--spectrum-seafoam-100)',
    200: 'var(--spectrum-seafoam-200)',
    300: 'var(--spectrum-seafoam-300)',
    400: 'var(--spectrum-seafoam-400)',
    500: 'var(--spectrum-seafoam-500)',
    600: 'var(--spectrum-seafoam-600)',
    700: 'var(--spectrum-seafoam-700)',
    800: 'var(--spectrum-seafoam-800)',
    900: 'var(--spectrum-seafoam-900)',
    1000: 'var(--spectrum-seafoam-1000)',
    1100: 'var(--spectrum-seafoam-1100)',
    1200: 'var(--spectrum-seafoam-1200)',
    1300: 'var(--spectrum-seafoam-1300)',
    1400: 'var(--spectrum-seafoam-1400)',
    1500: 'var(--spectrum-seafoam-1500)',
    1600: 'var(--spectrum-seafoam-1600)'
  },
  yellow: {
    background: 'var(--spectrum-yellow-background-color-default)',
    visual: 'var(--spectrum-yellow-visual-color)',
    100: 'var(--spectrum-yellow-100)',
    200: 'var(--spectrum-yellow-200)',
    300: 'var(--spectrum-yellow-300)',
    400: 'var(--spectrum-yellow-400)',
    500: 'var(--spectrum-yellow-500)',
    600: 'var(--spectrum-yellow-600)',
    700: 'var(--spectrum-yellow-700)',
    800: 'var(--spectrum-yellow-800)',
    900: 'var(--spectrum-yellow-900)',
    1000: 'var(--spectrum-yellow-1000)',
    1100: 'var(--spectrum-yellow-1100)',
    1200: 'var(--spectrum-yellow-1200)',
    1300: 'var(--spectrum-yellow-1300)',
    1400: 'var(--spectrum-yellow-1400)',
    1500: 'var(--spectrum-yellow-1500)',
    1600: 'var(--spectrum-yellow-1600)'
  },
  negative: {
    visual: 'var(--spectrum-negative-visual-color)',
    100: 'var(--spectrum-negative-color-100)',
    200: 'var(--spectrum-negative-color-200)',
    300: 'var(--spectrum-negative-color-300)',
    400: 'var(--spectrum-negative-color-400)',
    500: 'var(--spectrum-negative-color-500)',
    600: 'var(--spectrum-negative-color-600)',
    700: 'var(--spectrum-negative-color-700)',
    800: 'var(--spectrum-negative-color-800)',
    900: 'var(--spectrum-negative-color-900)',
    1000: 'var(--spectrum-negative-color-1000)',
    1100: 'var(--spectrum-negative-color-1100)',
    1200: 'var(--spectrum-negative-color-1200)',
    1300: 'var(--spectrum-negative-color-1300)',
    1400: 'var(--spectrum-negative-color-1400)',
    1500: 'var(--spectrum-negative-color-1500)',
    1600: 'var(--spectrum-negative-color-1600)'
  },
  notice: {
    background: 'var(--spectrum-notice-background-color-default)',
    visual: 'var(--spectrum-notice-visual-color)',
    100: 'var(--spectrum-notice-color-100)',
    200: 'var(--spectrum-notice-color-200)',
    300: 'var(--spectrum-notice-color-300)',
    400: 'var(--spectrum-notice-color-400)',
    500: 'var(--spectrum-notice-color-500)',
    600: 'var(--spectrum-notice-color-600)',
    700: 'var(--spectrum-notice-color-700)',
    800: 'var(--spectrum-notice-color-800)',
    900: 'var(--spectrum-notice-color-900)',
    1000: 'var(--spectrum-notice-color-1000)',
    1100: 'var(--spectrum-notice-color-1100)',
    1200: 'var(--spectrum-notice-color-1200)',
    1300: 'var(--spectrum-notice-color-1300)',
    1400: 'var(--spectrum-notice-color-1400)',
    1500: 'var(--spectrum-notice-color-1500)',
    1600: 'var(--spectrum-notice-color-1600)'
  },
  positive: {
    visual: 'var(--spectrum-positive-visual-color)',
    100: 'var(--spectrum-positive-color-100)',
    200: 'var(--spectrum-positive-color-200)',
    300: 'var(--spectrum-positive-color-300)',
    400: 'var(--spectrum-positive-color-400)',
    500: 'var(--spectrum-positive-color-500)',
    600: 'var(--spectrum-positive-color-600)',
    700: 'var(--spectrum-positive-color-700)',
    800: 'var(--spectrum-positive-color-800)',
    900: 'var(--spectrum-positive-color-900)',
    1000: 'var(--spectrum-positive-color-1000)',
    1100: 'var(--spectrum-positive-color-1100)',
    1200: 'var(--spectrum-positive-color-1200)',
    1300: 'var(--spectrum-positive-color-1300)',
    1400: 'var(--spectrum-positive-color-1400)',
    1500: 'var(--spectrum-positive-color-1500)',
    1600: 'var(--spectrum-positive-color-1600)'
  },
  informative: {
    visual: 'var(--spectrum-informative-visual-color)',
    100: 'var(--spectrum-informative-color-100)',
    200: 'var(--spectrum-informative-color-200)',
    300: 'var(--spectrum-informative-color-300)',
    400: 'var(--spectrum-informative-color-400)',
    500: 'var(--spectrum-informative-color-500)',
    600: 'var(--spectrum-informative-color-600)',
    700: 'var(--spectrum-informative-color-700)',
    800: 'var(--spectrum-informative-color-800)',
    900: 'var(--spectrum-informative-color-900)',
    1000: 'var(--spectrum-informative-color-1000)',
    1100: 'var(--spectrum-informative-color-1100)',
    1200: 'var(--spectrum-informative-color-1200)',
    1300: 'var(--spectrum-informative-color-1300)',
    1400: 'var(--spectrum-informative-color-1400)',
    1500: 'var(--spectrum-informative-color-1500)',
    1600: 'var(--spectrum-informative-color-1600)'
  },
  accent: {
    visual: 'var(--spectrum-accent-visual-color)',
    100: 'var(--spectrum-accent-color-100)',
    200: 'var(--spectrum-accent-color-200)',
    300: 'var(--spectrum-accent-color-300)',
    400: 'var(--spectrum-accent-color-400)',
    500: 'var(--spectrum-accent-color-500)',
    600: 'var(--spectrum-accent-color-600)',
    700: 'var(--spectrum-accent-color-700)',
    800: 'var(--spectrum-accent-color-800)',
    900: 'var(--spectrum-accent-color-900)',
    1000: 'var(--spectrum-accent-color-1000)',
    1100: 'var(--spectrum-accent-color-1100)',
    1200: 'var(--spectrum-accent-color-1200)',
    1300: 'var(--spectrum-accent-color-1300)',
    1400: 'var(--spectrum-accent-color-1400)',
    1500: 'var(--spectrum-accent-color-1500)',
    1600: 'var(--spectrum-accent-color-1600)'
  },
  neutral: {
    100: 'var(--spectrum-gray-100)',
    200: 'var(--spectrum-gray-200)',
    300: 'var(--spectrum-gray-300)',
    400: 'var(--spectrum-gray-400)',
    500: 'var(--spectrum-gray-500)',
    600: 'var(--spectrum-gray-600)',
    700: 'var(--spectrum-gray-700)',
    800: 'var(--spectrum-gray-800)',
    900: 'var(--spectrum-gray-900)',
    1000: 'var(--spectrum-gray-1000)',
    1100: 'var(--spectrum-gray-1100)',
    1200: 'var(--spectrum-gray-1200)',
    1300: 'var(--spectrum-gray-1300)',
    1400: 'var(--spectrum-gray-1400)'

  },
  'transparent-white': {
    25: 'var(--spectrum-transparent-white-25)',
    50: 'var(--spectrum-transparent-white-50)',
    75: 'var(--spectrum-transparent-white-75)',
    100: 'var(--spectrum-transparent-white-100)',
    200: 'var(--spectrum-transparent-white-200)',
    300: 'var(--spectrum-transparent-white-300)',
    400: 'var(--spectrum-transparent-white-400)',
    500: 'var(--spectrum-transparent-white-500)',
    600: 'var(--spectrum-transparent-white-600)',
    700: 'var(--spectrum-transparent-white-700)',
    800: 'var(--spectrum-transparent-white-800)',
    900: 'var(--spectrum-transparent-white-900)',
    1000: 'var(--spectrum-transparent-white-1000)'
  },
  'transparent-black': {
    25: 'var(--spectrum-transparent-black-25)',
    50: 'var(--spectrum-transparent-black-50)',
    75: 'var(--spectrum-transparent-black-75)',
    100: 'var(--spectrum-transparent-black-100)',
    200: 'var(--spectrum-transparent-black-200)',
    300: 'var(--spectrum-transparent-black-300)',
    400: 'var(--spectrum-transparent-black-400)',
    500: 'var(--spectrum-transparent-black-500)',
    600: 'var(--spectrum-transparent-black-600)',
    700: 'var(--spectrum-transparent-black-700)',
    800: 'var(--spectrum-transparent-black-800)',
    900: 'var(--spectrum-transparent-black-900)',
    1000: 'var(--spectrum-transparent-black-1000)'
  }
    // text: {
    //   DEFAULT: 'var(--spectrum-alias-text-color)',
    //   hover: 'var(--spectrum-alias-text-color-hover)',
    //   down: 'var(--spectrum-alias-text-color-down)',
    //   'key-focus': 'var(--spectrum-alias-text-color-key-focus)',
    //   'mouse-focus': 'var(--spectrum-alias-text-color-mouse-focus)',
    //   disabled: 'var(--spectrum-alias-text-color-disabled)',
    //   invalid: 'var(--spectrum-alias-text-color-invalid)',
    //   selected: 'var(--spectrum-alias-text-color-selected)',
    //   'selected-neutral': 'var(--spectrum-alias-text-color-selected-neutral)'
    // },
    // border: {
    //   DEFAULT: 'var(--spectrum-alias-border-color)',
    //   hover: 'var(--spectrum-alias-border-color-hover)',
    //   down: 'var(--spectrum-alias-border-color-down)',
    //   focus: 'var(--spectrum-alias-border-color-focus)',
    //   'mouse-focus': 'var(--spectrum-alias-border-color-mouse-focus)',
    //   disabled: 'var(--spectrum-alias-border-color-disabled)',
    //   extralight: 'var(--spectrum-alias-border-color-extralight)',
    //   light: 'var(--spectrum-alias-border-color-light)',
    //   mid: 'var(--spectrum-alias-border-color-mid)',
    //   dark: 'var(--spectrum-alias-border-color-dark)',
    //   transparent: 'var(--spectrum-alias-border-color-transparent)',
    //   'translucent-dark':
    //     'var(--spectrum-alias-border-color-translucent-dark)',
    //   'translucent-darker':
    //     'var(--spectrum-alias-border-color-transparent-darker)'
    // },
    // focus: {
    //   DEFAULT: 'var(--spectrum-alias-focus-color)'
    // },
    // 'focus-ring': {
    //   DEFAULT: 'var(--spectrum-alias-focus-ring-color)'
    // },
    // icon: {
    //   DEFAULT: 'var(--spectrum-alias-icon-color)',
    //   'over-background': 'var(--spectrum-alias-icon-color-over-background)',
    //   hover: 'var(--spectrum-alias-icon-color-hover)',
    //   down: 'var(--spectrum-alias-icon-color-down)',
    //   focus: 'var(--spectrum-alias-icon-color-focus)',
    //   disabled: 'var(--spectrum-alias-icon-color-disabled)',
    //   'selected-neutral': 'var(--spectrum-alias-icon-color-selected-neutral)',
    //   selected: 'var(--spectrum-alias-icon-color-selected)',
    //   'selected-hover': 'var(--spectrum-alias-icon-color-selected-hover)',
    //   'selected-down': 'var(--spectrum-alias-icon-color-selected-down)',
    //   'selected-focus': 'var(--spectrum-alias-icon-color-selected-focus)',
    //   error: 'var(--spectrum-alias-icon-color-error)'
    // }
};

let dimensions = {
  0: 'var(--spectrum-global-dimension-size-0)',
  10: 'var(--spectrum-global-dimension-size-10)',
  25: 'var(--spectrum-global-dimension-size-25)',
  40: 'var(--spectrum-global-dimension-size-40)',
  50: 'var(--spectrum-global-dimension-size-50)',
  65: 'var(--spectrum-global-dimension-size-65)',
  75: 'var(--spectrum-global-dimension-size-75)',
  85: 'var(--spectrum-global-dimension-size-85)',
  100: 'var(--spectrum-global-dimension-size-100)',
  115: 'var(--spectrum-global-dimension-size-115)',
  125: 'var(--spectrum-global-dimension-size-125)',
  130: 'var(--spectrum-global-dimension-size-130)',
  150: 'var(--spectrum-global-dimension-size-150)',
  160: 'var(--spectrum-global-dimension-size-160)',
  175: 'var(--spectrum-global-dimension-size-175)',
  200: 'var(--spectrum-global-dimension-size-200)',
  225: 'var(--spectrum-global-dimension-size-225)',
  250: 'var(--spectrum-global-dimension-size-250)',
  275: 'var(--spectrum-global-dimension-size-275)',
  300: 'var(--spectrum-global-dimension-size-300)',
  325: 'var(--spectrum-global-dimension-size-325)',
  350: 'var(--spectrum-global-dimension-size-350)',
  400: 'var(--spectrum-global-dimension-size-400)',
  450: 'var(--spectrum-global-dimension-size-450)',
  500: 'var(--spectrum-global-dimension-size-500)',
  550: 'var(--spectrum-global-dimension-size-550)',
  600: 'var(--spectrum-global-dimension-size-600)',
  675: 'var(--spectrum-global-dimension-size-675)',
  700: 'var(--spectrum-global-dimension-size-700)',
  800: 'var(--spectrum-global-dimension-size-800)',
  900: 'var(--spectrum-global-dimension-size-900)',
  1000: 'var(--spectrum-global-dimension-size-1000)',
  1200: 'var(--spectrum-global-dimension-size-1200)',
  1250: 'var(--spectrum-global-dimension-size-1250)',
  1600: 'var(--spectrum-global-dimension-size-1600)',
  1700: 'var(--spectrum-global-dimension-size-1700)',
  2000: 'var(--spectrum-global-dimension-size-2000)',
  2400: 'var(--spectrum-global-dimension-size-2400)',
  3000: 'var(--spectrum-global-dimension-size-3000)',
  3400: 'var(--spectrum-global-dimension-size-3400)',
  3600: 'var( --spectrum-global-dimension-size-3600)',
  4600: 'var(--spectrum-global-dimension-size-4600)',
  5000: 'var(--spectrum-global-dimension-size-5000)',
  6000: 'var(--spectrum-global-dimension-size-6000)'
};

let height = {
  ...dimensions,

  'c-50': 'var(--spectrum-component-height-50)',
  'c-75': 'var(--spectrum-component-height-75)',
  'c-100': 'var(--spectrum-component-height-100)',
  'c-200': 'var(--spectrum-component-height-200)',
  'c-300': 'var(--spectrum-component-height-300)',
  'c-400': 'var(--spectrum-component-height-400)',
  'c-500': 'var(--spectrum-component-height-500)',

  full: '100%'
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false
  },
  content: [
    'src/**/*.tsx',
    'stories/**/*.tsx',
  ],
  future: {
    respectDefaultRingColorOpacity: true
  },
  darkMode: ['class', '[style*="color-scheme: dark;"]'],
  theme: {
    extend: {
      ringOffsetWidth: {
        DEFAULT: 'var(--spectrum-focus-indicator-gap)'
      },
      textColor: {
        DEFAULT: 'var(--spectrum-alias-text-color)'
      },
      ringOffsetColor: {
        DEFAULT: 'var(--spectrum-alias-background-color-default)'
      }
    },
    screens: {
      xs: '304px',
      sm: '768px',
      md: '1280px',
      lg: '1768px',
      xl: '2160px'
    },
        /** https://spectrum.adobe.com/page/color-system/ */
    colors,
    backgroundColor: {
      ...colors,
      DEFAULT: 'var(--spectrum-background-layer-2-color)',
      base: 'var(--spectrum-background-base-color)',
      'layer-1': 'var(--spectrum-background-layer-1-color)',
      'layer-2': 'var(--spectrum-background-layer-2-color)',
      disabled: 'var(--spectrum-disabled-background-color)',
      'disabled-content': 'var(--spectrum-disabled-content-color)',
      accent: {
        ...colors.accent,
        DEFAULT: 'var(--spectrum-accent-background-color-default)',
        hover: 'var(--spectrum-accent-background-color-hover)',
        down: 'var(--spectrum-accent-background-color-down)',
        focus: 'var(--spectrum-accent-background-color-key-focus)'
      },
      negative: {
        ...colors.negative,
        DEFAULT: 'var(--spectrum-negative-background-color-default)',
        hover: 'var(--spectrum-negative-background-color-hover)',
        down: 'var(--spectrum-negative-background-color-down)',
        focus: 'var(--spectrum-negative-background-color-key-focus)'
      },
      positive: {
        ...colors.positive,
        DEFAULT: 'var(--spectrum-positive-background-color-default)',
        hover: 'var(--spectrum-positive-background-color-hover)',
        down: 'var(--spectrum-positive-background-color-down)',
        focus: 'var(--spectrum-positive-background-color-key-focus)'
      },
      informative: {
        ...colors.informative,
        DEFAULT: 'var(--spectrum-informative-background-color-default)',
        hover: 'var(--spectrum-informative-background-color-hover)',
        down: 'var(--spectrum-informative-background-color-down)',
        focus: 'var(--spectrum-informative-background-color-key-focus)'
      },
      neutral: {
        ...colors.neutral,
        DEFAULT: 'var(--spectrum-neutral-background-color-default)',
        hover: 'var(--spectrum-neutral-background-color-hover)',
        down: 'var(--spectrum-neutral-background-color-down)',
        focus: 'var(--spectrum-neutral-background-color-key-focus)'
      },
      'neutral-subdued': {
        DEFAULT: 'var(--spectrum-neutral-subdued-background-color-default)',
        hover: 'var(--spectrum-neutral-subdued-background-color-hover)',
        down: 'var(--spectrum-neutral-subdued-background-color-down)',
        focus: 'var(--spectrum-neutral-subdued-background-color-key-focus)'
      },
      'transparent-white': {
        ...colors['transparent-white'],
        disabled: 'var(--spectrum-disabled-static-white-background-color)'
      },
      'transparent-black': {
        ...colors['transparent-black'],
        disabled: 'var(--spectrum-disabled-static-black-background-color)'
      }
    },
        /** https://spectrum.adobe.com/page/states/#Keyboard-focus */
    ringColor: {
      DEFAULT: 'var(--spectrum-focus-indicator-color)',
      black: 'black',
      white: 'white'
    },
    ringOpacity: {
      DEFAULT: '1'
    },
    ringWidth: {
      DEFAULT: 'var(--spectrum-focus-indicator-thickness)',
            /** For use when next to existing blue border. */
      half: 'calc(var(--spectrum-focus-indicator-thickness) / 2)'
    },
        /** https://spectrum.adobe.com/page/object-styles/#Drop-shadow */
    dropShadow: {
      DEFAULT:
                'var(--spectrum-drop-shadow-x) var(--spectrum-drop-shadow-y) var(--spectrum-drop-shadow-blur) var(--spectrum-drop-shadow-color)'
    },
    borderColor: {
      ...colors,
      disabled: 'var(--spectrum-disabled-border-color)',
      'disabled-content': 'var(--spectrum-disabled-content-color)',
      accent: {
        ...colors.accent,
        DEFAULT: 'var(--spectrum-accent-background-color-default)',
        hover: 'var(--spectrum-accent-background-color-hover)',
        down: 'var(--spectrum-accent-background-color-down)',
        focus: 'var(--spectrum-accent-background-color-key-focus)'
      },
      negative: {
        ...colors.negative,
        DEFAULT: 'var(--spectrum-negative-border-color-default)',
        hover: 'var(--spectrum-negative-border-color-hover)',
        down: 'var(--spectrum-negative-border-color-down)',
        focus: 'var(--spectrum-negative-border-color-key-focus)'
      },
      'transparent-white': {
        ...colors['transparent-white'],
        disabled: 'var(--spectrum-disabled-static-white-border-color)'
      },
      'transparent-black': {
        ...colors['transparent-black'],
        disabled: 'var(--spectrum-disabled-static-black-border-color)'
      }
    },
        /** https://spectrum.adobe.com/page/object-styles/#Border-width */
    borderWidth: {
      DEFAULT: 'var(--spectrum-border-width-100)',
      none: '0',
      100: 'var(--spectrum-border-width-100)',
      200: 'var(--spectrum-border-width-200)',
      400: 'var(--spectrum-border-width-400)'
    },
        /** https://spectrum.adobe.com/page/object-styles/#Rounding */
    borderRadius: {
            /* These values aren't defined in tokens yet. Change over when those are updated. */
      DEFAULT: '10px',
      50: '4px',
      75: '8px',
      100: '10px',
      200: '16px',
      full: '9999px'
    },
    textColor: {
      ...colors,
      disabled: 'var(--spectrum-disabled-content-color)',
      accent: {
        ...colors.accent,
        DEFAULT: 'var(--spectrum-accent-content-color-default)',
        hover: 'var(--spectrum-accent-content-color-hover)',
        down: 'var(--spectrum-accent-content-color-down)',
        focus: 'var(--spectrum-accent-content-color-key-focus)',
        selected: 'var(--spectrum-accent-content-color-selected)'
      },
      negative: {
        ...colors.negative,
        DEFAULT: 'var(--spectrum-negative-content-color-default)',
        hover: 'var(--spectrum-negative-content-color-hover)',
        down: 'var(--spectrum-negative-content-color-down)',
        focus: 'var(--spectrum-negative-content-color-key-focus)'
      },
      neutral: {
        ...colors.neutral,
        DEFAULT: 'var(--spectrum-neutral-content-color-default)',
        hover: 'var(--spectrum-neutral-content-color-hover)',
        down: 'var(--spectrum-neutral-content-color-down)',
        focus: 'var(--spectrum-neutral-content-color-key-focus)'
      },
      'neutral-subdued': {
        DEFAULT: 'var(--spectrum-neutral-subdued-content-color-default)',
        hover: 'var(--spectrum-neutral-subdued-content-color-hover)',
        down: 'var(--spectrum-neutral-subdued-content-color-down)',
        focus: 'var(--spectrum-neutral-subdued-content-color-key-focus)'
      },
      'transparent-white': {
        ...colors['transparent-white'],
        content: 'black',
        disabled: 'var(--spectrum-disabled-static-white-content-color)'
      },
      'transparent-black': {
        ...colors['transparent-black'],
        content: 'white',
        disabled: 'var(--spectrum-disabled-static-black-content-color)'
      }
    },
        /** https://spectrum.adobe.com/page/typography/#Font-sizes */
    fontSize: {
      DEFAULT: 'var(--spectrum-body-size-m)',
            /// ???
      50: 'var(--spectrum-font-size-50)',
      75: 'var(--spectrum-font-size-75)',
      100: 'var(--spectrum-font-size-100)',
      200: 'var(--spectrum-font-size-200)',
      300: 'var(--spectrum-font-size-300)',
      400: 'var(--spectrum-font-size-400)',
      500: 'var(--spectrum-font-size-500)',
      600: 'var(--spectrum-font-size-600)',
      700: 'var(--spectrum-font-size-700)',
      800: 'var(--spectrum-font-size-800)',
      900: 'var(--spectrum-font-size-900)',
      1000: 'var(--spectrum-font-size-1000)',
      1100: 'var(--spectrum-font-size-1100)',
      1200: 'var(--spectrum-font-size-1200)',
      1300: 'var(--spectrum-font-size-1300)'

            // base: 'var(--spectrum-body-size-s)',

            // 'body-xxxl': 'var(--spectrum-body-size-xxxl)',
            // 'body-xxl': 'var(--spectrum-body-size-xxl)',
            // 'body-xl': 'var(--spectrum-body-size-xl)',
            // 'body-l': 'var(--spectrum-body-size-l)',
            // 'body-m': 'var(--spectrum-body-size-m)',
            // 'body-s': 'var(--spectrum-body-size-s)',
            // 'body-xs': 'var(--spectrum-body-size-xs)',

            // 'heading-xxxl': 'var(--spectrum-heading-size-xxxl)',
            // 'heading-xxl': 'var(--spectrum-heading-size-xxl)',
            // 'heading-xl': 'var(--spectrum-heading-size-xl)',
            // 'heading-l': 'var(--spectrum-heading-size-l)',
            // 'heading-m': 'var(--spectrum-heading-size-m)',
            // 'heading-s': 'var(--spectrum-heading-size-s)',
            // 'heading-xs': 'var(--spectrum-heading-size-xs)',
            // 'heading-xxs': 'var(--spectrum-heading-size-xxs)',
    },
    fontWeight: {
      DEFAULT: 'var(--spectrum-regular-font-weight)',
      light: 'var(--spectrum-light-font-weight)',
      regular: 'var(--spectrum-regular-font-weight)',
      medium: 'var(--spectrum-medium-font-weight)',
      bold: 'var(--spectrum-bold-font-weight)',
      black: 'var(--spectrum-black-font-weight)'
    },
    letterSpacing: {
            // DEFAULT: 'var(--spectrum-global-font-letter-spacing-medium)',
            // none: 'var(--spectrum-global-font-letter-spacing-none)',
            // small: 'var(--spectrum-global-font-letter-spacing-small)',
            // hand: 'var(--spectrum-global-font-letter-spacing-han)',
            // medium: 'var(--spectrum-global-font-letter-spacing-medium)'
    },
    lineHeight: {
      DEFAULT: 'var(--spectrum-line-height-100)', // ??
      100: 'var(--spectrum-line-height-100)',
      200: 'var(--spectrum-line-height-200)'
    },
        /** https://spectrum.adobe.com/page/motion/ */
    transitionTimingFunction: {
            // ??
      'ease-in-out': 'cubic-bezier(.45, 0, .40, 1)',
      'ease-in': 'cubic-bezier(.50, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.40, 1)',
      linear: 'cubic-bezier(0, 0, 1, 1)'
    },
    transitionDuration: {
      DEFAULT: '130ms',
      none: '0ms',
            // These don't exist anymore?
      0: '0ms',
      100: '130ms',
      200: '160ms',
      300: '190ms',
      400: '220ms',
      500: '250ms',
      600: '300ms',
      700: '350ms',
      800: '400ms',
      900: '450ms',
      1000: '500ms',
      2000: '1000ms',
      4000: '2000ms'
    },
    spacing: {
      ...dimensions,

            // These are static.
            // 0: '0px',
      'static-50': 'var(--spectrum-spacing-50)',
      'static-75': 'var(--spectrum-spacing-75)',
      'static-100': 'var(--spectrum-spacing-100)',
            // 200: 'var(--spectrum-spacing-200)',
            // 300: 'var(--spectrum-spacing-300)',
            // 400: 'var(--spectrum-spacing-400)',
            // 500: 'var(--spectrum-spacing-500)',
            // 600: 'var(--spectrum-spacing-600)',
            // 700: 'var(--spectrum-spacing-700)',
            // 800: 'var(--spectrum-spacing-800)',
            // 900: 'var(--spectrum-spacing-900)',
            // 1000: 'var(--spectrum-spacing-1000)',

            // These scale.
      'ttv-50': 'var(--spectrum-text-to-visual-50)',
      'ttv-75': 'var(--spectrum-text-to-visual-75)',
      'ttv-100': 'var(--spectrum-text-to-visual-100)',
      'ttv-200': 'var(--spectrum-text-to-visual-200)',
      'ttv-300': 'var(--spectrum-text-to-visual-300)',

      'ptv-75': 'var(--spectrum-component-pill-edge-to-visual-75)',
      'ptv-100': 'var(--spectrum-component-pill-edge-to-visual-100)',
      'ptv-200': 'var(--spectrum-component-pill-edge-to-visual-200)',
      'ptv-300': 'var(--spectrum-component-pill-edge-to-visual-300)',

      'ptvo-75': 'var(--spectrum-component-pill-edge-to-visual-only-75)',
      'ptvo-100': 'var(--spectrum-component-pill-edge-to-visual-only-100)',
      'ptvo-200': 'var(--spectrum-component-pill-edge-to-visual-only-200)',
      'ptvo-300': 'var(--spectrum-component-pill-edge-to-visual-only-300)',

      'ptt-75': 'var(--spectrum-component-pill-edge-to-text-75)',
      'ptt-100': 'var(--spectrum-component-pill-edge-to-text-100)',
      'ptt-200': 'var(--spectrum-component-pill-edge-to-text-200)',
      'ptt-300': 'var(--spectrum-component-pill-edge-to-text-300)',

      'ttc-75': 'var(--spectrum-text-to-control-75)',
      'ttc-100': 'var(--spectrum-text-to-control-100)',
      'ttc-200': 'var(--spectrum-text-to-control-200)',
      'ttc-300': 'var(--spectrum-text-to-control-300)',

      'ett-75': 'var(--spectrum-component-edge-to-text-75)',
      'ett-100': 'var(--spectrum-component-edge-to-text-100)',
      'ett-200': 'var(--spectrum-component-edge-to-text-200)',
      'ett-300': 'var(--spectrum-component-edge-to-text-300)'
    },
    opacity: {
      100: '1',
      90: '0.9',
      80: '0.8',
      60: '0.6',
      50: '0.5',
      42: '0.42',
      40: '0.4',
      30: '0.3',
      25: '0.25',
      20: '0.2',
      15: '0.15',
      10: '0.1',
      8: '0.08',
      7: '0.07',
      6: '0.06',
      5: '0.05',
      4: '0.04'
    },
    height: height,
    minHeight: height,
    width: {
      ...dimensions,
      'field': 'var(--spectrum-field-width)'
    }
  },
  plugins: [
    require('tailwindcss-react-aria-components'),
    require('tailwindcss-animate'),
    plugin(({addUtilities, matchUtilities, theme, addBase}) => {
            // colors.tint = tint;
      let tintValues = {};
      for (let [prefix, property, themeProperty] of [['bg', 'backgroundColor'], ['border', 'borderColor'], ['outline', 'outlineColor'], ['text', 'color', 'textColor']]) {
        let colors = theme(themeProperty || property) ?? theme('colors');
        let tint = {};
        for (let key of [...Object.keys(colors.gray), ...Object.keys(colors.red)]) {
          if (key > 900) {
            tint[key] = `var(--tint-${key}, var(--tint-900))`;
          } else {
            tint[key] = `var(--tint-${key})`;
          }
        }
        tint.DEFAULT = `var(--default-tint-DEFAULT, var(--tint-${prefix}-DEFAULT))`;
        tint.hover = `var(--default-tint-hover, var(--tint-${prefix}-hover))`;
        tint.focus = `var(--default-tint-focus, var(--tint-${prefix}-focus))`;
        tint.down = `var(--default-tint-down, var(--tint-${prefix}-down))`;
        tint.disabled = `var(--default-tint-disabled, var(--tint-${prefix}-disabled))`;
        tint.content = `var(--tint-${prefix}-disabled)`;
        colors.tint = tint;

        let colorValues = {};
        let hoverColorValues = {};
        for (let color in colors) {
          if (colors[color].hover) {
            colorValues[color] = colors[color];
            hoverColorValues[color] = colors[color];
          }

          if (colors[color][100]) {
            let keys = Object.keys(colors[color]).filter(k => !isNaN(k)).map(k => Number(k)).sort((a, b) => a - b);
            keys.forEach((index, i) => {
              colorValues[`${color}-${index}`] = {
                DEFAULT: colors[color][index],
                hover: colors[color][keys[i + 1]] || colors[color][index],
                focus: colors[color][keys[i + 1]] || colors[color][index],
                down: colors[color][keys[i + 1]] || colors[color][index]
                                // down: colors[color][keys[i + 2]] || colors[color][keys[i + 1]] || colors[color][index]
              };

              hoverColorValues[`${color}-${index}`] = {
                DEFAULT: 'transparent',
                hover: colors[color][index],
                focus: colors[color][index],
                down: colors[color][index]
              };
            });
          }

          tintValues[color] ??= {};
          for (let key of ['DEFAULT', 'hover', 'focus', 'down', 'disabled', 'content']) {
            if (colors[color][key]) {
              tintValues[color][`${prefix}-${key}`] = colors[color][key];
            }
          }
        }

        matchUtilities({
          [`${prefix}-base`]: (value) => ({
            [property]: value.DEFAULT,
            '&[data-hovered]': {
              [property]: value.hover
            },
            '&[data-focus-visible]': {
              [property]: value.focus
            },
            '&[data-pressed]': {
              [property]: value.down
            }
          }),
          [`group-${prefix}-base`]: (value) => ({
            [property]: value.DEFAULT,
            '&:is(.group[data-hovered] *)': {
              [property]: value.hover
            },
            '&:is(.group[data-focus-visible] *)': {
              [property]: value.focus
            },
            '&:is(.group[data-pressed] *)': {
              [property]: value.down
            }
          })
        }, {type: 'color', values: colorValues});
        matchUtilities({
          [`${prefix}-hover`]: (value) => ({
            [property]: 'transparent',
            '&[data-hovered]': {
              [property]: value.hover
            },
            '&[data-focus-visible]': {
              [property]: value.focus
            },
            '&[data-pressed]': {
              [property]: value.down
            }
          }),
          [`group-${prefix}-hover`]: (value) => ({
            [property]: 'transparent',
            '&:is(.group[data-hovered] *)': {
              [property]: value.hover
            },
            '&:is(.group[data-focus-visible] *)': {
              [property]: value.focus
            },
            '&:is(.group[data-pressed] *)': {
              [property]: value.down
            }
          })
        }, {type: 'color', values: hoverColorValues});
        matchUtilities({
          [`${prefix}-tint`]: (value) => ({
            [property]: value
          })
        }, {type: 'color', values: tint});
      }

      for (let color in colors) {
        tintValues[color] ??= {};
        Object.assign(tintValues[color], colors[color]);
        if (colors[color][100]) {
          let keys = Object.keys(colors[color]);
          keys.forEach((index, i) => {
            if (isNaN(index)) {return;}
            tintValues[`${color}-${index}`] = colors[color];
          });
        }
      }

      matchUtilities({
        tint: (value, {modifier}) => {
          let res = {};
          for (let key in value) {
            res[`--tint-${key}`] = value[key];
          }
          if (modifier) {
            let keys = Object.keys(value);
            let i = keys.indexOf(modifier);
            res['--default-tint-DEFAULT'] = `var(--tint-${modifier})`;
            res['--default-tint-hover'] = res['--default-tint-focus'] = res['--default-tint-down'] = `var(--tint-${keys[i + 1] || modifier})`;
          }
          return res;
        }
      }, {type: 'color', values: tintValues, modifiers: 'any'});

      addUtilities({
        '.center-baseline': {
          display: 'flex',
          alignItems: 'center',
          '&::before': {
            content: '"x"',
            width: 0,
            visibility: 'hidden'
          }
        },
        '.dir': {
          '--dir': '1',
          '&:dir(rtl)': {
            '--dir': '-1'
          }
        }
      });

      addBase({
        '.reset-border': {
          borderWidth: 0,
          borderStyle: 'solid'
        }
      });
    })
  ]
};
