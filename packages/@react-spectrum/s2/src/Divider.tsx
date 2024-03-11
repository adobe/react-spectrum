import {forwardRef} from 'react';
import {Separator as RACSeparator, SeparatorProps as RACSeparatorProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

/*
 * Adding as it's own type to deal with size being a part of the theme so we
 * can type style() and it's parameters.
 */
interface DividerSpectrumProps {
  /**
   * How thick the Divider should be.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /**
   * How thick the Divider should be.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical',
  staticColor?: 'white' | 'black'
}

// TODO: allow overriding height (only when orientation is vertical)??
interface DividerProps extends DividerSpectrumProps, Omit<RACSeparatorProps, 'className' | 'style'>, StyleProps {}

const divider = style<DividerSpectrumProps>({
  alignSelf: 'stretch',
  backgroundColor: {
    default: 'gray-200',
    size: {
      L: 'gray-800'
    },
    staticColor: {
      white: {
        default: 'transparent-white-200',
        size: {
          L: 'transparent-white-800'
        }
      },
      black: {
        default: 'transparent-black-200',
        size: {
          L: 'transparent-black-800'
        }
      }
    },
    forcedColors: 'ButtonBorder'
  },
  borderStyle: 'none',
  borderRadius: 'full',
  margin: 0,
  height: {
    orientation: {
      horizontal: {
        // These should be px not rems, because we're emulating a border.
        default: '[4px]',
        size: {
          S: '[1px]',
          M: '[2px]'
        }
      }
    }
  },
  width: {
    orientation: {
      vertical: {
        default: '[4px]',
        size: {
          S: '[1px]',
          M: '[2px]'
        }
      }
    }
  }
}, getAllowedOverrides());

function Divider(props: DividerProps, ref: DOMRef) {
  let domRef = useDOMRef(ref);

  return (
    <RACSeparator
      {...props}
      ref={domRef}
      style={props.UNSAFE_style}
      className={(props.UNSAFE_className || '') + divider({
        size: props.size || 'M',
        orientation: props.orientation || 'horizontal',
        staticColor: props.staticColor
      }, props.css)} />
  );
}

let _Divider = forwardRef(Divider);
export {_Divider as Divider};
