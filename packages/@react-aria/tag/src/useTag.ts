import {ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent, ReactNode} from 'react';
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import {Removable} from '@react-types/shared';
import {useMessageFormatter} from '@react-aria/i18n';


export interface AriaTagProps extends Removable<ReactNode, void> {
  children?: ReactNode,
  isDisabled?: boolean,
  validationState?: 'invalid' | 'valid',
  isSelected?: boolean,
  role?: string
}

export interface TagAria {
  tagProps: HTMLAttributes<HTMLElement>,
  labelProps: HTMLAttributes<HTMLElement>,
  clearButtonProps: ButtonHTMLAttributes<HTMLButtonElement>
}

export function useTag(props: AriaTagProps): TagAria {
  const {
    isDisabled,
    validationState,
    isRemovable,
    isSelected,
    onRemove,
    children,
    role
  } = props;
  const formatMessage = useMessageFormatter(intlMessages);
  const removeString = formatMessage('remove');
  const tagId = useId();
  const buttonId = useId();

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
      'aria-selected': !isDisabled && isSelected,
      'aria-invalid': validationState === 'invalid' || undefined,
      onKeyDown: !isDisabled && isRemovable ? onKeyDown : null,
      role: role === 'gridcell' ? 'row' : null,
      tabIndex: isDisabled ? -1 : 0
    },
    labelProps: {
      id: tagId,
      role
    },
    clearButtonProps: mergeProps(pressProps, {
      'aria-label': removeString,
      'aria-labelledby': `${buttonId} ${tagId}`,
      id: buttonId,
      title: removeString,
      isDisabled,
      role
    })
  };
}
