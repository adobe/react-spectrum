'use client';
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {Group, type GroupProps} from 'react-aria-components/Group';
import {InputContext} from 'react-aria-components/Input';
import {Label} from './Form';
import {useId} from 'react';
import './InputGroup.css';

interface InputGroupProps extends GroupProps {
  label?: string;
}

export function InputGroup(props: InputGroupProps) {
  let id = useId();
  return (
    <div className="input-group">
      {props.label && (
        <Label elementType="span" id={id}>
          {props.label}
        </Label>
      )}
      <Group {...props} aria-labelledby={id} className="react-aria-Group inset">
        {composeRenderProps(props.children, (children, renderProps) => (
          <InputContext.Provider value={{disabled: renderProps.isDisabled}}>
            {children}
          </InputContext.Provider>
        ))}
      </Group>
    </div>
  );
}
