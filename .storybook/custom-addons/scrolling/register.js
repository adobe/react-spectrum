import {addons, types} from '@storybook/manager-api';
import {getQueryParams} from '@storybook/preview-api';
import React, {useEffect, useState} from 'react';

const ScrollingToolbar = ({api}) => {
  let channel = addons.getChannel();
  let [isScrolling, setScrolling] = useState(getQueryParams()?.scrolling === 'true' || false);
  let onChange = () => {
    setScrolling((old) => {
      channel.emit('scrolling/updated', !old);
      return !old;
    })
  };

  useEffect(() => {
    api.setQueryParams({
      'scrolling': isScrolling
    });
  });

  return (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="scrolling">Scrolling:
          <input type="checkbox" id="scrolling" name="scrolling" checked={isScrolling} onChange={onChange} />
        </label>
      </div>
    </div>
  );
};

addons.register('ScrollingSwitcher', (api) => {
  addons.add('ScrollingSwitcher', {
    title: 'Scrolling switcher',
    type: types.TOOL,
    //👇 Shows the Toolbar UI element if either the Canvas or Docs tab is active
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => <ScrollingToolbar api={api} />
  });
});
