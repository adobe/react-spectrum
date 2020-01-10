import {createEventHandler} from './createEventHandler';
import {HTMLAttributes} from 'react';
import {KeyboardEvents} from '@react-types/shared';

export interface KeyboardProps extends KeyboardEvents {
  isDisabled?: boolean
}

interface KeyboardResult {
  keyboardProps: HTMLAttributes<HTMLElement>
}

export function useKeyboard(props: KeyboardProps): KeyboardResult {
  return {
    keyboardProps: props.isDisabled ? {} : {
      onKeyDown: createEventHandler(props.onKeyDown),
      onKeyUp: createEventHandler(props.onKeyUp)
    }
  };
}
