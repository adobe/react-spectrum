import {mergeStyles} from '../style-macro/runtime';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {keyframes} from '../style-macro/style-macro' with {type: 'macro'};
import {
  ProgressBar as AriaProgressBar,
  ProgressBarProps as AriaProgressBarProps
} from 'react-aria-components';
import {FieldLabel} from './Field';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

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
  label?: string // TODO: string or ReactNode?
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
    default: 48
  },
  minWidth: 12, // progress-bar-minimum-width
  maxWidth: '[768px]', // progress-bar-maximum-width
  isolation: 'isolate',
  height: 'control',
  '--field-gap': {
    type: 'rowGap',
    value: '[calc((self(height) - 1lh) / 2 + .25rem)]'
  },
  columnGap: 3 // spacing-200
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
  height: {
    default: 1.5,
    size: {
      S: 1, // progress-bar-thickness-small
      M: 1.5, // progress-bar-thickness-medium
      L: 2, // progress-bar-thickness-large
      XL: 2.5 // progress-bar-thickness-extra-large
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
  animationTimingFunction: '[cubic-bezier(.45, 0, .40, 1)]',
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
