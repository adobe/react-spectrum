import {DOMProps} from '@react-types/shared';
import {PressEvent} from '@react-aria/interactions';
import {ReactElement, ReactNode} from 'react';

export interface BreadcrumbItemProps extends DOMProps {
  isCurrent?: boolean,
  onPress?: (e: PressEvent) => void,
  className?: string,
  children: ReactNode
}

export interface BreadcrumbsProps extends DOMProps {
  className? : string
  children: ReactElement<BreadcrumbItemProps> | ReactElement<BreadcrumbItemProps>[]
}
