import {ActionButton} from '@react-spectrum/button';
import {AriaButtonProps} from '@react-types/button';
import ChevronDownSmall from '@spectrum-icons/ui/ChevronDownSmall';
import ChevronUpSmall from '@spectrum-icons/ui/ChevronUpSmall';
import {classNames} from '@react-spectrum/utils';
import {PressResponder, useHover} from '@react-aria/interactions';
import React from 'react';
import stepperStyle from '@adobe/spectrum-css-temp/components/stepper/vars.css';

interface StepButtonProps extends AriaButtonProps {
  isQuiet: boolean,
  direction: 'up' | 'down'
}

export const StepButton:React.FC<StepButtonProps> = ({isQuiet, direction, ...props}) => {
  let {hoverProps, isHovered} = useHover({});
  return (
    <PressResponder {...hoverProps}>
      <ActionButton
        UNSAFE_className={
          classNames(
            stepperStyle,
            'spectrum-ActionButton',
            {
              'spectrum-Stepper-stepUp': direction === 'up',
              'spectrum-Stepper-stepDown': direction === 'down',
              'is-hovered': isHovered
            }
          )
        }
        {...props}
        isQuiet={isQuiet}>
        {direction === 'up' && <ChevronUpSmall UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-stepUpIcon')} />}
        {direction === 'down' && <ChevronDownSmall UNSAFE_className={classNames(stepperStyle, 'spectrum-Stepper-stepDownIcon')} />}
      </ActionButton>
    </PressResponder>
  );
};

export default StepButton;
