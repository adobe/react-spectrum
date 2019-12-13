import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DialogContext, DialogContextValue} from './context';
import {FocusScope} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {HTMLAttributes, useContext, useRef} from 'react';
import {SpectrumDialogProps} from '@react-types/dialog';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog, useModalDialog} from '@react-aria/dialog';

export function Dialog(props: SpectrumDialogProps) {
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
          'spectrum-Dialog',
          otherProps.className
        )}
        ref={ref}>
        {children}
      </div>
    </FocusScope>
  );
}
