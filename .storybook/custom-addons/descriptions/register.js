
import {addons, types} from '@storybook/manager-api';
import { AddonPanel } from '@storybook/components';
import React from 'react';
import { useParameter } from '@storybook/api';

const ADDON_ID = 'descriptionAddon';
const PANEL_ID = `${ADDON_ID}/panel`;

const PARAM_KEY = 'description';

const MyPanel = () => {
  const value = useParameter(PARAM_KEY, null);
  const item = value ? value.data : 'No description for this story.';
  return <div style={{margin: '15px'}}>{item}</div>;
};

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Description',
    render: ({ active }) => (
      <AddonPanel active={active}>
        <MyPanel />
      </AddonPanel>
    ),
  });
});
