import {action} from '@storybook/addon-actions';
import {Grid, GridProps} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Grid', module)
  .add(
    'name me',
    () => render({})
  );

function render(props:GridProps = {}) {
  return (
    <Grid {...props}>
    </Grid>
  );
}
