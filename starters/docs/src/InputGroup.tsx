'use client';
import {composeRenderProps, Group, GroupProps, InputContext} from 'react-aria-components';
import {useId} from 'react';
import './InputGroup.css';

interface InputGroupProps extends GroupProps {
  label?: string
}

export function InputGroup(props: InputGroupProps) {
  let id = useId();
  return (
    <div className="input-group">
      {props.label && <span id={id}>{props.label}</span>}
      <Group {...props} aria-labelledby={id}>
        {composeRenderProps(props.children, (children, renderProps) => (
          <InputContext.Provider value={{disabled: renderProps.isDisabled}}>
            {children}
          </InputContext.Provider>
        ))}
      </Group>
    </div>
  );
}
