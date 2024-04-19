import {centerPadding} from './style-utils' with {type: 'macro'};

export const bar = () => ({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gridTemplateAreas: [
    'label value',
    'bar bar'
  ],
  isolation: 'isolate',
  minWidth: 48, // progress-bar-minimum-width
  maxWidth: '[768px]', // progress-bar-maximum-width
  minHeight: 'control',
  '--field-gap': {
    type: 'rowGap',
    value: centerPadding()
  },
  columnGap: 12 // spacing-200
} as const);

export const track = () => ({
  gridArea: 'bar',
  overflow: 'hidden',
  marginTop: 4,
  borderRadius: 'full',
  backgroundColor: {
    default: 'gray-300',
    staticColor: {
      white: {
        default: 'transparent-white-100'
      },
      // TODO: Is there a black static color in S2?
      black: {
        default: 'transparent-black-400'
      }
    },
    forcedColors: 'ButtonFace'
  },
  outlineWidth: {
    default: 0,
    forcedColors: 1
  },
  outlineStyle: {
    default: 'none',
    forcedColors: 'solid'
  },
  outlineColor: {
    default: 'transparent',
    forcedColors: 'ButtonText'
  },
  zIndex: 1 // to fix a weird webkit bug with rounded corners and masking
} as const);
