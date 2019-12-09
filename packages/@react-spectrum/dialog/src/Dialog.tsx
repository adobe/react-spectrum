import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DialogContext, DialogContextValue} from './context';
import {DOMProps} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, ReactNode, useContext, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog, useModalDialog} from '@react-aria/dialog';

interface DialogProps extends DOMProps, StyleProps {
  children: ReactNode
}

export function Dialog(props: DialogProps) {
  let {
    type = 'popover',
    ...contextProps
  } = useContext(DialogContext) || {} as DialogContextValue;
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let allProps = mergeProps(
    mergeProps(
      filterDOMProps(otherProps),
      contextProps
    ),
    styleProps
  );

  if (type === 'popover') {
    return <BaseDialog {...allProps}>{children}</BaseDialog>;
  } else {
    return <ModalDialog {...allProps}>{children}</ModalDialog>;
  }
}

function ModalDialog(props: HTMLAttributes<HTMLElement>) {
  let {modalProps} = useModalDialog();
  return <BaseDialog {...mergeProps(props, modalProps)} />;
}

function BaseDialog({children, ...otherProps}: HTMLAttributes<HTMLElement>) {
  let ref = useRef();
  let {dialogProps} = useDialog({ref});

  return (
    <FocusScope contain restoreFocus autoFocus>
      <div
        {...mergeProps(otherProps, dialogProps)}
        className={classNames(
          styles,
          'spectrum-Dialog'
        )}
        ref={ref}>
        {children}
      </div>
    </FocusScope>
  );
}
