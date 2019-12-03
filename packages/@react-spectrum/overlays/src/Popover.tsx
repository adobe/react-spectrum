import {classNames} from '@react-spectrum/utils';
import overrideStyles from './overlays.css';
import React, {HTMLAttributes, ReactNode, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/popover/vars.css';
import {useOverlay} from '@react-aria/overlays';

type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

interface PopoverProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode,
  placement?: Placement,
  arrowProps?: HTMLAttributes<HTMLElement>,
  hideArrow?: boolean,
  isOpen?: boolean,
  onClose?: () => void
}

export const Popover = React.forwardRef((props: PopoverProps, ref: RefObject<HTMLDivElement>) => {
  let {style, children, placement = 'bottom', arrowProps, isOpen, onClose, hideArrow, ...otherProps} = props;
  ref = ref || useRef();
  let {overlayProps} = useOverlay({ref, onClose, isOpen});

  return (
    <div
      {...otherProps}
      style={style}
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Popover',
          `spectrum-Popover--${placement.split(' ')[0]}`,
          {
            'spectrum-Popover--withTip': !hideArrow,
            'is-open': isOpen
          },
          classNames(
            overrideStyles,
            'spectrum-Popover',
            'react-spectrum-Popover'
          )
        )
      }
      role="presentation"
      data-testid="popover"
      {...overlayProps}>
      {children}
      {hideArrow ? null : <div className={classNames(styles, 'spectrum-Popover-tip')} {...arrowProps} data-testid="tip" />}
    </div>
  );
});
