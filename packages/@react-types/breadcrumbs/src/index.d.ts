import {PressEvent} from '@react-aria/interactions';
import {ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps {
  isCurrent?: boolean,
  isHeading?: boolean,
  isDisabled?: boolean,
  headingAriaLevel?: number,
  href?: string,
  onPress?: (e: PressEvent) => void,
  children: ReactNode
}

export interface BreadcrumbsProps {
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[]
}
