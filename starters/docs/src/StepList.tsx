'use client';
import {
  StepList as RACStepList,
  type StepListProps,
  StepListItem as RACStepListItem,
  type StepListItemProps as RACStepListItemProps,
  StepListItemContent,
  type StepListItemContentProps
} from 'react-aria-components/StepList';
import {Check} from 'lucide-react';
import {createContext, type ReactNode, useContext} from 'react';
import './StepList.css';

const RenderLinkContext = createContext<StepListItemContentProps['render']>(undefined);

export function StepList<T>({
  renderLink,
  ...props
}: StepListProps<T> & {renderLink?: StepListItemContentProps['render']}) {
  return (
    <RenderLinkContext.Provider value={renderLink}>
      <RACStepList {...props} />
    </RenderLinkContext.Provider>
  );
}

export interface StepListItemProps extends Omit<RACStepListItemProps, 'children'> {
  children?: ReactNode;
  href?: string;
}

export function StepListItem({children, href, ...props}: StepListItemProps) {
  let renderLink = useContext(RenderLinkContext);
  return (
    <RACStepListItem {...props}>
      {({isCompleted, stepNumber}) => {
        // Only completed steps are links, so users can go back but not skip ahead.
        let isLink = isCompleted && href != null;
        return (
          <StepListItemContent
            href={isLink ? href : undefined}
            render={isLink ? renderLink : undefined}>
            <span className="marker" aria-hidden>
              {isCompleted ? <Check size={14} /> : stepNumber}
            </span>
            {children}
          </StepListItemContent>
        );
      }}
    </RACStepListItem>
  );
}
