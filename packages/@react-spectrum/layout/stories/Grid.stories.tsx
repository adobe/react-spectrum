import {Grid, GridProps} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

// TODO: make some stories, live a little
storiesOf('Grid', module)
  .add(
    'name me',
    () => render({slots: {'label': 'label-classname'}, children: null})
  );

function render(props:GridProps) {
  return (
    <Grid {...props} />
  );
}
