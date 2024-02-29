import {ToggleButton as RACToggleButton, ToggleButtonProps as RACToggleButtonProps} from 'react-aria-components';
import {pressScale} from './pressScale';
import {forwardRef} from 'react';
import {ActionButtonStyleProps, styles} from './ActionButton';
import {FocusableRef} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';

interface ToggleButtonProps extends RACToggleButtonProps, ActionButtonStyleProps {
  isEmphasized?: boolean
}

function ToggleButton(props: ToggleButtonProps, ref: FocusableRef<HTMLButtonElement>) {
  let domRef = useFocusableRef(ref);
  return (
    <RACToggleButton 
      {...props}
      ref={domRef}
      style={pressScale(domRef)}
      className={renderProps => styles({
        ...renderProps,
        staticColor: props.staticColor,
        size: props.size,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized
      })} />
  );
}

let _ToggleButton = forwardRef(ToggleButton);
export {_ToggleButton as ToggleButton};

