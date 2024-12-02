import {addons, makeDecorator} from '@storybook/preview-api';
import {getQueryParams} from '@storybook/preview-api';
import React, {StrictMode, useEffect, useState} from 'react';

function StrictModeDecorator(props) {
  let {children} = props;
  let [isStrict, setStrict] = useState(getQueryParams()?.strict !== 'false');

  useEffect(() => {
    let channel = addons.getChannel();
    let updateStrict = (val) => {
      setStrict(val);
    };
    channel.on('strict/updated', updateStrict);
    return () => {
      channel.removeListener('strict/updated', updateStrict);
    };
  }, []);

  return isStrict ? (
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
      <StrictModeDecorator>
        {getStory(context)}
      </StrictModeDecorator>
    );
  }
});
