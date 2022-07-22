import React, { useCallback } from 'react';
import {FORCE_RE_RENDER} from '@storybook/core-events';
import {useGlobals} from '@storybook/api';
import {addons, types} from '@storybook/addons';

const ExampleToolbar = () => {
  const [globals, updateGlobals] = useGlobals();
  const isChecked = globals['strictMode'] || false;

  // Function that will update the global value and trigger a UI refresh.
  const refreshAndUpdateGlobal = () => {
    // Updates Storybook global value
    updateGlobals({
      ['strictMode']: !isChecked,
    }),
      // Invokes Storybook's addon API method (with the FORCE_RE_RENDER) event to trigger a UI refresh
      addons.getChannel().emit(FORCE_RE_RENDER);
  };

  const toggle = useCallback(() => refreshAndUpdateGlobal(), [isChecked]);

  return (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="strictmode">StrictMode:
          <input style={{verticalAlign: 'center'}} type="checkbox" id="strictmode" name="strictmode" checked={isChecked} onChange={toggle}></input>
        </label>
      </div>
    </div>
  );
};

addons.register('StrictModeSwitcher', () => {
  addons.add('StrictModeSwitcher', {
    title: 'Strict mode switcher',
    type: types.TOOL,
    //👇 Shows the Toolbar UI element if either the Canvas or Docs tab is active
    match: ({ viewMode }) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => (
      <ExampleToolbar />
    ),
  });
});
