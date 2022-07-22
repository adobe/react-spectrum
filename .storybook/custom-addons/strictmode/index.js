import {makeDecorator} from '@storybook/addons';
import React, {StrictMode} from 'react';

function StrictModeDecorator(props) {
  let {children, strictMode} = props;
  return strictMode ? (
    <StrictMode>
      {children}
    </StrictMode>
  ) : children;
}

export const withStrictModeSwitcher = makeDecorator({
  name: 'withStrictModeSwitcher',
  parameterName: 'strictModeSwitcher',
  wrapper: (getStory, context) => {
    return (
      <StrictModeDecorator strictMode={context.globals.strictMode}>
        {getStory(context)}
      </StrictModeDecorator>
    );
  }
});
