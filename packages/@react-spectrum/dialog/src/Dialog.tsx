import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DialogContext} from './context';
import {DOMProps} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import React, {ReactNode, RefObject, useContext, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog, useModalDialog} from '@react-aria/dialog';

interface DialogProps extends DOMProps {
  children: ReactNode
}

export const Dialog = React.forwardRef((props: DialogProps, ref: RefObject<HTMLDivElement>) => {
  let context = useContext(DialogContext);
  if (!context || context.type === 'popover') {
    return <BaseDialog {...props} ref={ref} />;
  } else {
    return <ModalDialog {...props} ref={ref} />;
  }
});

const ModalDialog = React.forwardRef((props: DialogProps, ref: RefObject<HTMLDivElement>) => {
  let {modalProps} = useModalDialog();
  return <BaseDialog {...props} {...modalProps} ref={ref} />;
});

const BaseDialog = React.forwardRef(({children, className, ...otherProps}: DialogProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {dialogProps} = useDialog({ref});

  return (
    <FocusScope contain restoreFocus autoFocus>
      <div
        className={classNames(
          styles,
          'spectrum-Dialog',
          className
        )}
        ref={ref}
        {...filterDOMProps(otherProps)}
        {...dialogProps}>
        {children}
      </div>
    </FocusScope>
  );
});
