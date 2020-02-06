import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface SpectrumStatusLightProps extends DOMProps, StyleProps {
  /** The content to display as the label */
  children: ReactNode,
  /**
   * The variant changes the color of the status light
   * When status lights have a semantic meaning, they should use the variant for semantic colors.
   */
  variant: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  /**
   * Whether the status light is disabled or not.
   * Shows that an element exists, but is not available in that circumstance.
   */
  isDisabled?: boolean
}
