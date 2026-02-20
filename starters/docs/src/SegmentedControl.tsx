'use client';
import {ToggleButtonGroup as RACToggleButtonGroup, SelectionIndicator, ToggleButton, ToggleButtonProps, ToggleButtonGroupProps, composeRenderProps} from 'react-aria-components';
import './SegmentedControl.css';

export function SegmentedControl(props: ToggleButtonGroupProps) {
  return <RACToggleButtonGroup {...props} className="segmented-control button-base" data-variant="secondary" />;
}

export function SegmentedControlItem(props: ToggleButtonProps) {
  return (
    <ToggleButton {...props} className="segmented-control-item">
      {composeRenderProps(props.children, children => (<>
        <SelectionIndicator className="react-aria-SelectionIndicator button-base" data-selected />
        <span>{children}</span>
      </>))}
    </ToggleButton>
  );
}
