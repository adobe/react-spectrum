export type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

export interface PositionProps {
  placement?: Placement,
  containerPadding?: number,
  offset?: number,
  crossOffset?: number,
  shouldFlip?: boolean,
  boundaryElement?: Element,
  isOpen?: boolean
}
