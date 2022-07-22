import {Checkbox} from '@react-spectrum/checkbox';
import {defaultTheme} from './constants';
import {makeDecorator} from '@storybook/addons';
import {Provider} from '@react-spectrum/provider';
import React, {StrictMode, useState} from 'react';

function StrictModeDecorator(props) {
  let {children} = props;
  let [selected, setSelected] = useState(false);
  let wrapper = selected ? (
    <StrictMode>
      {children}
    </StrictMode>
  ) : children;

  return (
    <Provider theme={defaultTheme}>
      <Checkbox
        marginTop={10}
        isSelected={selected}
        onChange={() => setSelected(selected => !selected)}>
        Toggle strict mode
      </Checkbox>
      {wrapper}
    </Provider>
  );
}

export const withStrictModeSwitcher = makeDecorator({
  name: 'withStrictModeSwitcher',
  parameterName: 'strictModeSwitcher',
  wrapper: (getStory, context) => {
    return (
      <StrictModeDecorator>
        {getStory(context)}
      </StrictModeDecorator>
    );
  }
});
