import {AllHTMLAttributes, RefObject} from 'react';
import {chain} from '@react-aria/utils';
import intlMessages from './intl/*.json';
import {SearchFieldProps} from '@react-types/searchfield';
import {SearchFieldState} from '@react-stately/searchfield';
import {useMessageFormatter} from '@react-aria/i18n';

interface SearchFieldAria {
  inputProps: AllHTMLAttributes<HTMLInputElement>,
  clearButtonProps: any // TODO: Replace any with AriaButtonProps from useButton when buttons is added to react-types
}

export function useSearchField(
  props: SearchFieldProps,
  state: SearchFieldState,
  searchFieldRef: RefObject<HTMLInputElement>
): SearchFieldAria {
  let formatMessage = useMessageFormatter(intlMessages);
  let {
    isDisabled,
    onSubmit = () => {},
    onClear,
    role = undefined,
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
    inputProps: {
      role,
      value: state.value,
      onKeyDown: chain(props.onKeyDown, onKeyDown),
      type
    },
    clearButtonProps: {
      'aria-label': formatMessage('Clear search'),
      isDisabled,
      onPress: chain(onClearButtonClick, props.onClear)
    }
  };
}
