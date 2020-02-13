/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
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
