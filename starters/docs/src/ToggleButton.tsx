'use client';
import {ToggleButton as RACToggleButton, ToggleButtonProps} from 'react-aria-components';
import './ToggleButton.css';

export function ToggleButton(props: ToggleButtonProps) {
  return <RACToggleButton {...props} />;
}
