import {classNames} from '@react-spectrum/utils/src/classNames';
import {DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-spectrum/utils';
import overrideStyles from './overlays.css';
import React, {ReactNode, RefObject, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/popover/vars.css';
import {useOverlay} from '@react-aria/overlays';

type Placement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

interface PopoverProps extends DOMProps {
  children: ReactNode,
  placement?: Placement,
  arrowProps?: DOMProps,
  isOpen?: boolean,
  onClose?: () => void
}

export const Popover = React.forwardRef((props: PopoverProps, ref: RefObject<HTMLDivElement>) => {
  let {className, children, placement = 'bottom', arrowProps, isOpen, onClose, ...otherProps} = props;
  ref = ref || useRef();
  let {overlayProps} = useOverlay({ref, onClose, isOpen});
  
  return (
    <div
      ref={ref}
      className={
        classNames(
          styles,
          'spectrum-Popover',
          `spectrum-Popover--${placement.split(' ')[0]}`,
          'spectrum-Popover--withTip',
          {
            'is-open': isOpen
          },
          classNames(
            overrideStyles,
            'spectrum-Popover',
            'react-spectrum-Popover'
          ),
          className
        )
      }
      role="presentation"
      data-testid="popover"
      {...filterDOMProps(otherProps)}
      {...overlayProps}>
      {children}
      <div className={classNames(styles, 'spectrum-Popover-tip')} {...arrowProps} data-testid="tip" />
    </div>
  );
});
