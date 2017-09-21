import React from 'react';
import Transition from 'react-transition-group/Transition';

const OPEN_STATES = {
  entering: true,
  entered: true
};

export default function OpenTransition(props) {
  return (
    <Transition timeout={125} {...props}>
      {(state) => React.cloneElement(props.children, {open: !!OPEN_STATES[state]})}
    </Transition>
  );
}
