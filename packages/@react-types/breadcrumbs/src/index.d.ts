import {DOMProps, PressEvents, StyleProps} from '@react-types/shared';
import {ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps extends PressEvents {
  isCurrent?: boolean,
  isHeading?: boolean,
  isDisabled?: boolean,
  headingAriaLevel?: number,
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean | 'true' | 'false',
  children: ReactNode
}

export interface BreadcrumbsProps {
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[],
  maxVisibleItems?: 'auto' | number
}

export interface SpectrumBreadcrumbsProps extends BreadcrumbsProps, DOMProps, StyleProps {
  size?: 'S' | 'M' | 'L',
  isHeading?: boolean,
  headingAriaLevel?: number,
  showRoot?: boolean,
  isDisabled?: boolean
}
