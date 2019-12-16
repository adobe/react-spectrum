import {DOMProps, StyleProps} from '@react-types/shared';
import {ReactNode} from 'react';

export interface SpectrumStatusLightProps extends DOMProps, StyleProps {
  children: ReactNode,
  variant: 'positive' | 'negative' | 'notice' | 'info' | 'neutral' | 'celery' | 'chartreuse' | 'yellow' | 'magenta' | 'fuchsia' | 'purple' | 'indigo' | 'seafoam',
  isDisabled?: boolean
}
