import intlMessages from '../intl';
import {PaginationState} from '@react-stately/pagination';
import {useMessageFormatter} from '@react-aria/i18n';

interface PaginationAriaProps {
  value?: any,
  onPrevious?: (value: number, ...args: any) => void,
  onNext?: (value: number, ...args: any) => void
}

export function usePagination(props: PaginationAriaProps, state: PaginationState) {
  let formatMessage = useMessageFormatter(intlMessages);

  let onPrevious = () => {
    state.onDecrement();
    if (props.onPrevious) {
      props.onPrevious(state.ref.current);
    }
  };

  let onNext = () => {
    state.onIncrement();
    if (props.onNext) {
      props.onNext(state.ref.current);
    }
  };

  let onKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'Up':
        state.onIncrement();
        break;
      case 'ArrowDown':
      case 'Down':
        state.onDecrement();
        break;
      case 'Enter':
      case ' ':
        break;
      default:
    }
  };

  return {
    prevButtonProps: {
      ...props,
      'aria-label': formatMessage('previous'),
      onPress: onPrevious
    },
    nextButtonProps: {
      ...props,
      'aria-label': formatMessage('next'),
      onPress: onNext
    },
    textProps: {
      ...props,
      onKeyDown: onKeyDown
    }
  };
}
