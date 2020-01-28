import {ValueBase} from '@react-types/shared';

export interface PaginationBase extends ValueBase<Number> {
  maxValue?: number,
  onPrevious?: (value: number, e: Event) => void,
  onNext?: (value: number, e: Event) => void
}

export interface PaginationProps {
  value?: any,
  maxValue?: number,
  defaultValue?: number | Number,
  onChange?: (val: Number) => void
}
