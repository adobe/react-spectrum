import {ValueBase} from '@react-types/shared';

export interface PaginationBase extends ValueBase<Number> {
  maxValue?: number,
  onPrevious?: (value: number, e: Event) => void,
  onNext?: (value: number, e: Event) => void
}

export interface PaginationProps {
  value?: any, // not sure why typescript doesn't like string, number, combo of both or any of the above from a ValueBase extension
  maxValue?: number,
  defaultValue?: number | Number,
  onChange?: (val: Number) => void
}
