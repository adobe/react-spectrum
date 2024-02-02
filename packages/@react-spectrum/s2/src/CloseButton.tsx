import {Button, ButtonProps} from 'react-aria-components';
import {baseColor, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {focusRing} from './style-utils' with {type: 'macro'};
import CrossIcon from '../ui-icons/S2_CrossSize300.svg';
import {pressScale} from './pressScale';
import {useRef} from 'react';
import {mergeStyles} from '../style-macro/runtime';

interface CloseButtonProps extends Omit<ButtonProps, 'className'> {
  className?: string,
  size?: 'S' | 'M' | 'L' | 'XL',
  staticColor?: 'white' | 'black'
}

const hoverBackground = {
  default: 'gray-100',
  staticColor: {
    white: 'transparent-white-100',
    black: 'transparent-black-100'
  }
} as const;

const styles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: 'control',
  borderRadius: 'full',
  padding: 0,
  borderStyle: 'none',
  transition: 'default',
  backgroundColor: {
    default: 'transparent',
    isHovered: hoverBackground,
    isFocusVisible: hoverBackground,
    isPressed: hoverBackground
  },
  '--iconPrimary': {
    type: 'color',
    value: {
      default: 'neutral',
      isDisabled: 'disabled',
      staticColor: {
        white: {
          default: baseColor('transparent-white-800'),
          isDisabled: 'transparent-white-400'
        },
        black: {
          default: baseColor('transparent-black-800'),
          isDisabled: 'transparent-black-400'
        }
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
  }
});

export function CloseButton(props: CloseButtonProps) {
  let ref = useRef(null);
  return (
    <Button
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={renderProps => mergeStyles(styles(renderProps), props.className)}>
      <CrossIcon
        className={style({
          size: {
            S: 2.5,
            M: 3,
            L: 3,
            XL: 3.5
          }
        })({size: props.size || 'M'})} />
    </Button>
  );
}
