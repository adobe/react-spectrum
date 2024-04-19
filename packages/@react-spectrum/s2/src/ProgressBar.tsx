import {bar, track} from './bar-utils'  with {type: 'macro'};
import {mergeStyles} from '../style/runtime';
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {keyframes} from '../style/style-macro' with {type: 'macro'};
import {
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps
} from 'react-aria-components';
import {FieldLabel} from './Field';
import {ReactNode, forwardRef} from 'react';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';

interface ProgressBarStyleProps {
  /**
   * The size of the ProgressBar.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean,
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'white' | 'black'
}

export interface ProgressBarProps extends Omit<AriaProgressBarProps, 'children' | 'className' | 'style'>, ProgressBarStyleProps, StyleProps {
  /** The content to display as the label. */
  label?: ReactNode
}

// TODO:
// var(--spectrum-global-dimension-size-1700) -> 136px
// var(--spectrum-global-dimension-size-2400) -> 192px
const indeterminate = keyframes(`
  from {
    transform: translate(calc(136px * -1));
  }

  to {
    transform: translate(192px);
  }
`);

const wrapper = style<ProgressBarStyleProps>({
  ...bar(),
  width: {
    default: 192
  }
}, getAllowedOverrides());

const valueStyles = style({
  gridArea: 'value'
});

const trackStyles = style({
  ...track(),
  height: {
    default: size(6),
    size: {
      S: 4, // progress-bar-thickness-small
      M: size(6), // progress-bar-thickness-medium
      L: 8, // progress-bar-thickness-large
      XL: size(10) // progress-bar-thickness-extra-large
    }
  }
});

const fill = style<ProgressBarStyleProps>({
  height: 'full',
  borderStyle: 'none',
  backgroundColor: {
    default: 'accent',
    staticColor: {
      white: {
        default: 'transparent-white-900'
      },
      // TODO: Is there a black static color in S2?
      black: {
        default: 'transparent-black-900'
      }
    },
    forcedColors: 'ButtonText'
  },
  transition: '[width]',
  transitionDuration: 1000
});

const indeterminateAnimation = style({
  animation: indeterminate,
  animationDuration: 1000,
  animationIterationCount: 'infinite',
  animationTimingFunction: 'in-out',
  willChange: 'transform',
  position: 'relative'
});

function ProgressBar(props: ProgressBarProps, ref: DOMRef<HTMLDivElement>) {
  let {label, size = 'M', staticColor, isIndeterminate, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);
  return (
    <AriaProgressBar
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({...props, size}, props.styles)}>
      {({percentage, valueText}) => (
        <>
          <FieldLabel size={size} labelAlign="start" labelPosition="top" staticColor={staticColor}>{label}</FieldLabel>
          {/* TODO: this cannot be a label because they will both receive context */}
          <FieldLabel size={size} labelAlign="end" staticColor={staticColor} styles={valueStyles}>{valueText}</FieldLabel>
          <div className={trackStyles({...props})}>
            <div
              className={mergeStyles(fill({...props, staticColor}), (isIndeterminate ? indeterminateAnimation : null))}
              style={{width: isIndeterminate ? `${100 * (136 / 192)}%` : percentage + '%'}} />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}

/**
 * ProgressBars show the progression of a system operation: downloading, uploading, processing, etc., in a visual way.
 * They can represent either determinate or indeterminate progress.
 */
const _ProgressBar = /*#__PURE__*/ forwardRef(ProgressBar);
export {_ProgressBar as ProgressBar};

