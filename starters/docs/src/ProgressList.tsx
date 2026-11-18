'use client';
import {
  ProgressList as RACProgressList,
  type ProgressListProps,
  ProgressListItem as RACProgressListItem,
  type ProgressListItemProps as RACProgressListItemProps,
  ProgressListItemContent
} from 'react-aria-components/ProgressList';
import {Check} from 'lucide-react';
import {type ReactNode} from 'react';
import './ProgressList.css';

export function ProgressList<T>(props: ProgressListProps<T>) {
  return <RACProgressList {...props} />;
}

export interface ProgressListItemProps extends Omit<RACProgressListItemProps, 'children'> {
  children?: ReactNode;
}

export function ProgressListItem({children, ...props}: ProgressListItemProps) {
  return (
    <RACProgressListItem {...props}>
      {({isCompleted, stepNumber}) => (
        <ProgressListItemContent>
          <span className="marker" aria-hidden>
            {isCompleted ? <Check size={14} /> : stepNumber}
          </span>
          {children}
        </ProgressListItemContent>
      )}
    </RACProgressListItem>
  );
}
