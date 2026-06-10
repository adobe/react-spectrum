'use client';
import {useSeparator, type SeparatorProps} from 'react-aria/useSeparator';
import './Separator.css';

export function Separator(props: SeparatorProps) {
  // useSeparator exposes the divider to assistive technology with the correct role/orientation.
  let {separatorProps} = useSeparator(props);

  return (
    <div
      {...separatorProps}
      className="react-aria-Separator"
      data-orientation={props.orientation || 'horizontal'}
    />
  );
}
