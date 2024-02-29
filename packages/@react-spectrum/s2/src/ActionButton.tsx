import {ButtonProps, ButtonRenderProps, Button as RACButton} from 'react-aria-components';
import {baseColor, style} from '../style-macro/spectrum-theme' with { type: 'macro' };
import {pressScale} from './pressScale';
import {focusRing} from './style-utils' with { type: 'macro' };
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';
import {forwardRef} from 'react';

export interface ActionButtonStyleProps {
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  staticColor?: 'black' | 'white',
  isQuiet?: boolean
}

interface ToggleButtonStyleProps {
  isSelected?: boolean,
  isEmphasized?: boolean
}

interface ActionButtonProps extends ButtonProps, ActionButtonStyleProps {}

// These styles handle both ActionButton and ToggleButton
export const styles = style<ButtonRenderProps & ActionButtonStyleProps & ToggleButtonStyleProps>({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: 'text-to-visual',
  fontFamily: 'sans',
  fontWeight: 'medium',
  fontSize: 'control',
  userSelect: 'none',
  height: 'control',
  transition: 'default',
  forcedColorAdjust: 'none',
  backgroundColor: {
    default: {
      ...baseColor('gray-100'),
      default: {
        default: 'gray-100',
        isQuiet: 'transparent'
      }
    },
    isSelected: {
      default: 'neutral',
      isEmphasized: 'accent',
      isDisabled: {
        default: 'gray-100',
        isQuiet: 'transparent'
      }
    },
    staticColor: {
      white: {
        ...baseColor('transparent-white-100'),
        default: {
          default: 'transparent-white-100',
          isQuiet: 'transparent'
        },
        isSelected: {
          default: baseColor('transparent-white-800'),
          isDisabled: {
            default: 'transparent-white-100',
            isQuiet: 'transparent'
          }
        }
      },
      black: {
        ...baseColor('transparent-black-100'),
        default: {
          default: 'transparent-black-100',
          isQuiet: 'transparent'
        },
        isSelected: {
          default: baseColor('transparent-black-800'),
          isDisabled: {
            default: 'transparent-black-100',
            isQuiet: 'transparent'
          }
        }
      }
    },
    forcedColors: {
      default: 'ButtonFace',
      isSelected: {
        default: 'Highlight',
        isDisabled: 'ButtonFace'
      }
    }
  },
  color: {
    default: 'neutral',
    isSelected: {
      default: 'gray-25',
      isEmphasized: 'white'
    },
    isDisabled: 'disabled',
    staticColor: {
      white: {
        default: baseColor('transparent-white-800'),
        isSelected: 'black',
        isDisabled: 'transparent-white-400'
      },
      black: {
        default: baseColor('transparent-black-800'),
        isSelected: 'white',
        isDisabled: 'transparent-black-400'
      }
    },
    forcedColors: {
      default: 'ButtonText',
      isSelected: 'HighlightText',
      isDisabled: {
        default: 'GrayText'
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    staticColor: {
      white: 'white',
      black: 'black'
    },
    forcedColors: 'Highlight'
  },
  borderStyle: 'none',
  paddingX: {
    default: 'edge-to-text',
    ':has([slot=icon]:only-child)': 0
  },
  paddingY: 0,
  borderRadius: 'control',
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: '[calc(-2 / 14 * 1em)]',
      ':has([slot=icon]:only-child)': 0
    }
  },
  aspectRatio: {
    ':has([slot=icon]:only-child)': 'square'
  }
});

function ActionButton(props: ActionButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);

  return (
    <RACButton
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.style)}
      className={renderProps => styles({
        ...renderProps,
        staticColor: props.staticColor,
        size: props.size,
        isQuiet: props.isQuiet
      })} />
  );
}

let _ActionButton = forwardRef(ActionButton);
export {_ActionButton as ActionButton};
