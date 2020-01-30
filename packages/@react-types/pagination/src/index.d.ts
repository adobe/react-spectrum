import {ValueBase} from '@react-types/shared';

export interface PaginationBase extends ValueBase<number> {
  maxValue?: number,
  onPrevious?: (value: number, e: Event) => void,
  onNext?: (value: number, e: Event) => void
}

export interface PaginationProps {
  value?: any,
  maxValue?: number,
  defaultValue?: number,
  onChange?: (val: number) => void
}
