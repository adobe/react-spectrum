import {ToggleButton as RACToggleButton, ToggleButtonProps as RACToggleButtonProps} from 'react-aria-components';
import {pressScale} from './pressScale';
import {ReactNode, forwardRef} from 'react';
import {ActionButtonStyleProps, styles} from './ActionButton';
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';
import {StyleProps} from './style-utils';

interface ToggleButtonProps extends Omit<RACToggleButtonProps, 'className' | 'style' | 'children'>, StyleProps, ActionButtonStyleProps {
  children?: ReactNode,
  isEmphasized?: boolean
}

function ToggleButton(props: ToggleButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);
  return (
    <RACToggleButton 
      {...props}
      ref={domRef}
      style={pressScale(domRef, props.UNSAFE_style)}
      className={renderProps => (props.UNSAFE_className || '') + styles({
        ...renderProps,
        staticColor: props.staticColor,
        size: props.size,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized
      }, props.css)} />
  );
}

let _ToggleButton = forwardRef(ToggleButton);
export {_ToggleButton as ToggleButton};

