import {ButtonHTMLAttributes, InputHTMLAttributes, RefObject} from 'react';
import {chain} from '@react-aria/utils';
import intlMessages from '../intl/*.json';
import {PressProps} from '@react-aria/interactions';
import {SearchFieldProps} from '@react-types/searchfield';
import {SearchFieldState} from '@react-stately/searchfield';
import {TextInputDOMProps} from '@react-types/shared';
import {useMessageFormatter} from '@react-aria/i18n';

interface SearchFieldAria {
  searchFieldProps: InputHTMLAttributes<HTMLInputElement>,
  clearButtonProps: ButtonHTMLAttributes<HTMLButtonElement> & PressProps
}

export function useSearchField(
  props: SearchFieldProps & TextInputDOMProps,
  state: SearchFieldState,
  searchFieldRef: RefObject<HTMLInputElement & HTMLTextAreaElement>
): SearchFieldAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let {
    isDisabled,
    onSubmit = () => {},
    onClear,
    type = 'search'
  } = props;

  let onKeyDown = (e) => {
    const key = e.key;

    if (key === 'Enter' || key === 'Escape') {
      e.preventDefault();
    }

    if (isDisabled) {
      return;
    }

    if (key === 'Enter') {
      onSubmit(state.value);
    }

    if (key === 'Escape') {
      state.setValue('', e);
      if (onClear) {
        onClear(e);
      }
    }
  };

  let onClearButtonClick = (e) => {
    state.setValue('', e);
    searchFieldRef.current.focus();
  };

  return {
    searchFieldProps: {
      value: state.value,
      onKeyDown,
      type
    },
    clearButtonProps: {
      'aria-label': formatMessage('Clear search'),
      onPress: chain(onClearButtonClick, props.onClear)
    }
  };
}
