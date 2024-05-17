import {addons, types} from '@storybook/manager-api';
import {getQueryParams} from '@storybook/preview-api';
import React, {useEffect, useState} from 'react';

const StrictModeToolBar = ({api}) => {
  let channel = addons.getChannel();
  let [isStrict, setStrict] = useState(getQueryParams()?.strict !== 'false');
  let onChange = () => {
    setStrict((old) => {
      channel.emit('strict/updated', !old);
      return !old;
    })
  };

  useEffect(() => {
    api.setQueryParams({
      'strict': isStrict
    });
  });

  return (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="strictmode">StrictMode:
          <input type="checkbox" id="strictmode" name="strictmode" checked={isStrict} onChange={onChange} />
        </label>
      </div>
    </div>
  );
};

if (process.env.NODE_ENV !== 'production') {
  addons.register('StrictModeSwitcher', (api) => {
    addons.add('StrictModeSwitcher', {
      title: 'Strict mode switcher',
      type: types.TOOL,
      //👇 Shows the Toolbar UI element if either the Canvas or Docs tab is active
      match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
      render: () => <StrictModeToolBar api={api} />
    });
  });
}
