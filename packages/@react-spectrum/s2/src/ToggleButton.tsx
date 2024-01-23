import {ToggleButton as RACToggleButton, ToggleButtonProps as RACToggleButtonProps} from 'react-aria-components';
import {pressScale} from './pressScale';
import {useRef} from 'react';
import {ActionButtonStyleProps, styles} from './ActionButton';

interface ToggleButtonProps extends RACToggleButtonProps, ActionButtonStyleProps {
  isEmphasized?: boolean
}

export function ToggleButton(props: ToggleButtonProps) {
  let ref = useRef(null);
  return (
    <RACToggleButton 
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={renderProps => styles({
        ...renderProps,
        staticColor: props.staticColor,
        size: props.size,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized
      })} />
  );
}
