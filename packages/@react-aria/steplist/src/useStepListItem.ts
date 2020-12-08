import {HtmlHTMLAttributes} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {StepListItemAria, StepListItemProps} from '@react-types/steplist';
import {useMessageFormatter} from '@react-aria/i18n';

export function useStepListItem(props: StepListItemProps & { isFocused: boolean }): StepListItemAria {
  const {isComplete, isCurrent, isDisabled, isFocused, isNavigable} = props;
  const linkProps: HtmlHTMLAttributes<HTMLElement> = {
    role: 'link'
  };
  let stepStateText = '';
  const formatMessage = useMessageFormatter(intlMessages);
  if (isCurrent) {
    linkProps['aria-current'] = 'step';
    stepStateText = formatMessage('current');
  } else if (isComplete) {
    stepStateText = formatMessage('completed');
  } else {
    stepStateText = formatMessage('notCompleted');
  }
  if (isNavigable) {
    linkProps.tabIndex = 0;
  }
  if (isDisabled) {
    linkProps['aria-disabled'] = 'true';
  }
  if (isFocused) {
    linkProps['aria-live'] = 'assertive';
    linkProps['aria-atomic'] = 'true';
    linkProps['aria-relevant'] = 'text';
  }

  return {
    linkProps,
    stepStateText,
    stepStateProps: {}
  };

}
