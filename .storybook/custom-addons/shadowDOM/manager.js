import {addons, types} from 'storybook/manager-api';
import React, {useState} from 'react';

const ShadowDOMToolBar = ({api}) => {
  let shadowDOMParam = api.getQueryParam('shadowDOM');
  let [isShadowDOM] = useState(shadowDOMParam === 'true');
  let onChange = () => {
    let params = new URLSearchParams(window.location.search);
    params.set('shadowDOM', String(!isShadowDOM));
    // The enableShadowDOM flag is global and can only be set True, so reload the page to
    // sync it and so that false can be set.
    window.location.search = params.toString();
  };

  return (
    <div style={{display: 'flex', alignItems: 'center', fontSize: '12px'}}>
      <div style={{marginRight: '10px'}}>
        <label htmlFor="shadowDOM">
          ShadowDOM:
          <input
            type="checkbox"
            id="shadowDOM"
            name="shadowDOM"
            checked={isShadowDOM}
            onChange={onChange}
          />
        </label>
      </div>
    </div>
  );
};

addons.register('ShadowDOMSwitcher', api => {
  addons.add('ShadowDOMSwitcher', {
    title: 'Shadow DOM switcher',
    type: types.TOOL,
    match: ({viewMode}) => !!(viewMode && viewMode.match(/^(story|docs)$/)),
    render: () => <ShadowDOMToolBar api={api} />
  });
});
