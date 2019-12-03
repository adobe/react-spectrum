import {DOMProps} from '@react-types/shared';
import {PressEvent} from '@react-aria/interactions';
import {ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps extends DOMProps {
  isCurrent?: boolean,
  isHeading?: boolean,
  isDisabled?: boolean,
  headingAriaLevel?: number,
  onPress?: (e: PressEvent) => void,
  children: ReactNode
}

export interface BreadcrumbsProps extends DOMProps {
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[]
}
