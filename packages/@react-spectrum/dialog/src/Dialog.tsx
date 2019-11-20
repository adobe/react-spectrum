import {classNames, filterDOMProps} from '@react-spectrum/utils';
import {DialogContext} from './context';
import {DOMProps} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {ReactNode, RefObject, useContext, useRef} from 'react';
import {StyleProps, useStyleProps} from '@react-spectrum/view';
import styles from '@adobe/spectrum-css-temp/components/dialog/vars.css';
import {useDialog, useModalDialog} from '@react-aria/dialog';

interface DialogProps extends DOMProps, StyleProps {
  children: ReactNode
}

export const Dialog = React.forwardRef((props: DialogProps, ref: RefObject<HTMLDivElement>) => {
  let {
    type = 'popover',
    ...contextProps
  } = useContext(DialogContext) || {};
  if (type === 'popover') {
    return <BaseDialog {...mergeProps(contextProps, props)} ref={ref} />;
  } else {
    return <ModalDialog {...mergeProps(contextProps, props)} ref={ref} />;
  }
});

const ModalDialog = React.forwardRef((props: DialogProps, ref: RefObject<HTMLDivElement>) => {
  let {modalProps} = useModalDialog();
  return <BaseDialog {...mergeProps(props, modalProps)} ref={ref} />;
});

const BaseDialog = React.forwardRef(({children, ...otherProps}: DialogProps, ref: RefObject<HTMLDivElement>) => {
  ref = ref || useRef();
  let {dialogProps} = useDialog({ref});
  let {styleProps} = useStyleProps(otherProps);

  return (
    <FocusScope contain restoreFocus autoFocus>
      <div
        {...mergeProps(filterDOMProps(otherProps), dialogProps)}
        {...styleProps}
        className={classNames(
          styles,
          'spectrum-Dialog',
          styleProps.className
        )}
        ref={ref}>
        {children}
      </div>
    </FocusScope>
  );
});
