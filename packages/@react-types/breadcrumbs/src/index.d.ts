import {PressEvent} from '@react-aria/interactions';
import {ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps {
  isCurrent?: boolean,
  isHeading?: boolean,
  isDisabled?: boolean,
  headingAriaLevel?: number,
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean | 'true' | 'false',
  onPress?: (e: PressEvent) => void,
  children: ReactNode
}

export interface BreadcrumbsProps {
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[]
}
