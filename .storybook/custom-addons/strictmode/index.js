import {addons, makeDecorator} from '@storybook/preview-api';
import React, {StrictMode, useEffect, useState} from 'react';

function StrictModeDecorator(props) {
  let {children} = props;
  let params = new URLSearchParams(document.location.search);
  let strictParam = params.get("strict") || undefined;
  let [isStrict, setStrict] = useState(strictParam !== 'false');

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
