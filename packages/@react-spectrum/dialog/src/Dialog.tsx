import {classNames, filterDOMProps, useStyleProps} from '@react-spectrum/utils';
import {DialogContext, DialogContextValue} from './context';
import {FocusScope} from '@react-aria/focus';
import {Grid} from '@react-spectrum/layout';
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
      mergeProps(
        filterDOMProps(otherProps),
        contextProps
      ),
      styleProps
    ),
    {className: classNames(styles, {'spectrum-Dialog--dismissable': otherProps.isDismissable})}
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
        <Grid slots={{
          container: styles['spectrum-Dialog-grid'],
          hero: styles['spectrum-Dialog-hero'],
          header: styles['spectrum-Dialog-header'],
          title: styles['spectrum-Dialog-title'],
          divider: styles['spectrum-Dialog-divider'],
          content: styles['spectrum-Dialog-content'],
          footer: styles['spectrum-Dialog-footer'],
          closeButton: styles['spectrum-Dialog-closeButton']
        }}>
          {children}
        </Grid>
      </div>
    </FocusScope>
  );
}
