import {ActionButton} from '@react-spectrum/button';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames} from '@react-spectrum/utils';
import intlMessages from '../intl';
import React from 'react';
import styles from '@adobe/spectrum-css-temp/components/pagination/vars.css';
import Textfield from '@react/react-spectrum/Textfield';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useMessageFormatter} from '@react-aria/i18n';
import {usePagination} from '@react-aria/pagination';
import {usePaginationState} from '@react-stately/pagination';
import {useProviderProps} from '@react-spectrum/provider';
import {ValueBase} from '@react-types/shared';

export interface PaginationBase extends ValueBase<Number>   {
  maxValue?: number,
  onPrevious?: (value: number, e: Event) => void,
  onNext?: (value: number, e: Event) => void
}

export function PaginationInput(props: PaginationBase) {
  props = Object.assign({}, {defaultValue: 1}, props);
  props = useProviderProps(props);
  let state = usePaginationState(props);
  let {prevButtonProps, nextButtonProps, textProps} = usePagination(props, state);
  let formatMessage = useMessageFormatter(intlMessages);
  const {maxValue} = props;

  return (
    <nav
      className={classNames(styles, 'spectrum-Pagination', 'spectrum-Pagination--explicit')}>
      <ActionButton
        {...prevButtonProps}
        isQuiet>
        <ChevronLeftMedium />
      </ActionButton>
      <Textfield
        {...textProps}
        value={state.value}
        onChange={state.onChange}
        className={classNames(styles, 'spectrum-Pagination-input')} />
      <span
        className={classNames(typographyStyles, 'spectrum-Body--secondary', classNames(styles, 'spectrum-Pagination-counter'))}>
        {formatMessage('page_count', {n: maxValue})}
      </span>
      <ActionButton
        {...nextButtonProps}
        isQuiet>
        <ChevronRightMedium />
      </ActionButton>
    </nav>
  );
}
