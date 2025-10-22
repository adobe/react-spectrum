'use client';
import {Checkbox as AriaCheckbox, CheckboxProps} from 'react-aria-components';

import './Checkbox.css';

export function Checkbox(
  { children, ...props }: Omit<CheckboxProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  return (
    (
      <AriaCheckbox {...props}>
        {({ isIndeterminate }) => (
          <>
            <div className="indicator">
              <svg viewBox="0 0 18 18" aria-hidden="true" key={isIndeterminate ? 'indeterminate' : 'check'}>
                {isIndeterminate
                  ? <rect x={1} y={7.5} width={16} height={3} />
                  : <polyline points="2 9 7 14 16 4" />}
              </svg>
            </div>
            {children}
          </>
        )}
      </AriaCheckbox>
    )
  );
}
