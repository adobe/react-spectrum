import {mergeStyles} from '../style-macro/runtime';
import {size, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {keyframes} from '../style-macro/style-macro' with {type: 'macro'};
import {
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps
} from 'react-aria-components';
import {FieldLabel} from './Field';
import {StyleProps, centerPadding, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {ReactNode} from 'react';

interface ProgressBarStyleProps {
  /**
   * How thick the bar should be.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether presentation is indeterminate when progress isn't known.
   */
  isIndeterminate?: boolean,
  /** The static color style to apply. Useful when the button appears over a color background. */
  staticColor?: 'white' | 'black' // TODO: Is there a black static color in S2?
}

interface ProgressBarProps extends Omit<AriaProgressBarProps, 'children' | 'className' | 'style'>, ProgressBarStyleProps, StyleProps {
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
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gridTemplateAreas: [
    'label value',
    'bar bar'
  ],
  width: {
    default: 192
  },
  minWidth: 48, // progress-bar-minimum-width
  maxWidth: '[768px]', // progress-bar-maximum-width
  isolation: 'isolate',
  minHeight: 'control',
  '--field-gap': {
    type: 'rowGap',
    value: centerPadding()
  },
  columnGap: 12 // spacing-200
}, getAllowedOverrides());

const labelStyles = style({
  gridArea: 'label'
});

const valueStyles = style({
  gridArea: 'value'
});

const track = style<ProgressBarStyleProps>({
  gridArea: 'bar',
  overflow: 'hidden',
  marginTop: 4,
  height: {
    default: size(6),
    size: {
      S: 4, // progress-bar-thickness-small
      M: size(6), // progress-bar-thickness-medium
      L: 8, // progress-bar-thickness-large
      XL: size(10) // progress-bar-thickness-extra-large
    }
  },
  borderRadius: 'full',
  backgroundColor: {
    default: 'gray-100',
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

export function ProgressBar(props: ProgressBarProps) {
  let {label, UNSAFE_style, UNSAFE_className = ''} = props;
  return (
    <AriaProgressBar
      {...props}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({...props, size: props.size || 'M'}, props.css)}>
      {({percentage, valueText}) => (
        <>
          <FieldLabel size={props.size || 'M'} labelAlign="start" labelPosition="top" staticColor={props.staticColor} css={labelStyles}>{label}</FieldLabel>
          {/* TODO: this cannot be a label because they will both receive context */}
          <FieldLabel size={props.size || 'M'} labelAlign="end" staticColor={props.staticColor} css={valueStyles}>{valueText}</FieldLabel>
          <div className={track({...props})}>
            <div
              className={mergeStyles(fill({...props, staticColor: props.staticColor}), (props.isIndeterminate ? indeterminateAnimation : null))}
              style={{width: props.isIndeterminate ? `${100 * (136 / 192)}%` : percentage + '%'}} />
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}
