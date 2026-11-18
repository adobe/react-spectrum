'use client';
import {
  ProgressList as RACProgressList,
  type ProgressListProps,
  ProgressListItem as RACProgressListItem,
  type ProgressListItemProps as RACProgressListItemProps,
  ProgressListItemContent,
  type ProgressListItemContentProps
} from 'react-aria-components/ProgressList';
import {Check} from 'lucide-react';
import {createContext, type ReactNode, useContext} from 'react';
import './ProgressList.css';

const RenderLinkContext = createContext<ProgressListItemContentProps['render']>(undefined);

export function ProgressList<T>({
  renderLink,
  ...props
}: ProgressListProps<T> & {renderLink?: ProgressListItemContentProps['render']}) {
  return (
    <RenderLinkContext.Provider value={renderLink}>
      <RACProgressList {...props} />
    </RenderLinkContext.Provider>
  );
}

export interface ProgressListItemProps extends Omit<RACProgressListItemProps, 'children'> {
  children?: ReactNode;
  href?: string;
}

export function ProgressListItem({children, href, ...props}: ProgressListItemProps) {
  let renderLink = useContext(RenderLinkContext);
  return (
    <RACProgressListItem {...props}>
      {({isCompleted, stepNumber}) => {
        // Only completed steps are links, so users can go back but not skip ahead.
        let isLink = isCompleted && href != null;
        return (
          <ProgressListItemContent
            href={isLink ? href : undefined}
            render={isLink ? renderLink : undefined}>
            <span className="marker" aria-hidden>
              {isCompleted ? <Check size={14} /> : stepNumber}
            </span>
            {children}
          </ProgressListItemContent>
        );
      }}
    </RACProgressListItem>
  );
}
