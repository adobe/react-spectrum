import {AriaTagProps} from '@react-types/tag';
import {ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent} from 'react';
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface TagAria {
  tagProps: HTMLAttributes<HTMLElement>,
  clearButtonProps: ButtonHTMLAttributes<HTMLButtonElement>
}

export function useTag(props: AriaTagProps): TagAria {
  const {
    isRemovable,
    isDisabled,
    onRemove,
    children,
    selected,
    role
  } = props;
  const formatMessage = useMessageFormatter(intlMessages);
  const removeString = formatMessage('remove');

  function onKeyDown(e: KeyboardEvent<HTMLElement>) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      onRemove(children, e);
      e.preventDefault();
    }
  }
  const pressProps = {
    onPress: e => onRemove(children, e)
  };
  return {
    tagProps: {
      'aria-selected': role === 'gridcell' ? undefined : !isDisabled && selected,
      onKeyDown: !isDisabled && isRemovable ? onKeyDown : null,
      role,
      tabIndex: isDisabled ? -1 : 0
    },
    clearButtonProps: mergeProps(pressProps, {
      'aria-label': children ? `${removeString}: ${children}` : removeString,
      title: removeString,
      isDisabled
    })
  };
}
