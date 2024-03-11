import {ReactNode, forwardRef} from 'react';
import {size, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {filterDOMProps} from '@react-aria/utils';
import {AriaLabelingProps, DOMProps, DOMRef} from '@react-types/shared';
import {CenterBaseline} from './CenterBaseline';
import {useDOMRef} from '@react-spectrum/utils';
import {StyleProps, getAllowedOverrides} from './style-utils' with {type: 'macro'};

interface StatusLightStyleProps {
  /**
   * The variant changes the color of the status light.
   * When status lights have a semantic meaning, they should use the variant for semantic colors.
   */
  variant: 'informative' | 'neutral' | 'positive' | 'notice' | 'negative' | 'celery' | 'chartreuse' | 'cyan' | 'fuchsia' | 'purple' | 'magenta' | 'indigo' | 'seafoam' | 'yellow' | 'pink' | 'turquoise' | 'cinnamon' | 'brown' | 'silver',
  /** The size of the status light. */
  size?: 'S' | 'M' | 'L' | 'XL'
}

export interface StatusLightProps extends StatusLightStyleProps, DOMProps, AriaLabelingProps, StyleProps {
  /** The content to display as the label. */
  children?: ReactNode,
  /**
   * An accessibility role for the status light. Should be set when the status
   * can change at runtime, and no more than one status light will update simultaneously.
   * For cases where multiple statuses can change at the same time, use a Toast instead.
   */
  role?: 'status',
  // TODO temp until css prop
  className?: string
}

const wrapper = style<StatusLightStyleProps>({
  display: 'flex',
  gap: 'text-to-visual',
  alignItems: 'baseline',
  width: 'fit',
  fontFamily: 'sans',
  fontSize: 'control',
  color: {
    default: 'neutral',
    variant: {
      neutral: 'gray-600'
    }
  }
}, getAllowedOverrides());

const light = style<StatusLightStyleProps>({
  size: {
    size: {
      S: 8,
      M: size(10),
      L: 12,
      XL: size(14)
    }
  },
  fill: {
    variant: {
      informative: 'informative',
      neutral: 'neutral',
      positive: 'positive',
      notice: 'notice',
      negative: 'negative',
      celery: 'celery',
      chartreuse: 'chartreuse',
      cyan: 'cyan',
      fuchsia: 'fuchsia',
      purple: 'purple',
      magenta: 'magenta',
      indigo: 'indigo',
      seafoam: 'seafoam',
      yellow: 'yellow',
      pink: 'pink',
      turquoise: 'turquoise',
      cinnamon: 'cinnamon',
      brown: 'brown',
      silver: 'silver'
    }
  }
});

function StatusLight(props: StatusLightProps, ref: DOMRef<HTMLDivElement>) {
  let {children, size = 'M', variant, role, UNSAFE_className = '', UNSAFE_style, css} = props;
  let domRef = useDOMRef(ref);

  if (!children && !props['aria-label']) {
    console.warn('If no children are provided, an aria-label must be specified');
  }

  if (!role && (props['aria-label'] || props['aria-labelledby'])) {
    console.warn('A labelled StatusLight must have a role.');
  }
  
  return (
    <div
      {...filterDOMProps(props, {labelable: !!role})}
      ref={domRef}
      role={role}
      style={UNSAFE_style}
      className={UNSAFE_className + wrapper({size, variant}, css)}>
      <CenterBaseline>
        <svg className={light({size, variant})} aria-hidden="true">
          <circle r="50%" cx="50%" cy="50%" />
        </svg>
      </CenterBaseline>
      {children}
    </div>
  );
}

/**
 * Status lights are used to color code categories and labels commonly found in data visualization.
 * When status lights have a semantic meaning, they should use semantic variant colors.
 */
let _StatusLight = forwardRef(StatusLight);
export {_StatusLight as StatusLight};
