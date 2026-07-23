'use client';
import {useSeparator, type SeparatorProps} from 'react-aria/useSeparator';
import './Separator.css';

export function Separator(props: SeparatorProps) {
  let {separatorProps} = useSeparator(props);

  return (
    <div
      {...separatorProps}
      className="react-aria-Separator"
      data-orientation={props.orientation || 'horizontal'}
    />
  );
}
