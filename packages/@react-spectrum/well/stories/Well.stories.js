import React from 'react';
import {storiesOf} from '@storybook/react';
import {Well} from '../src';

storiesOf('Well', module)
  .add(
    'Default',
    () => render()
  );

function render() {
  return (<Well>This is a React Spectrum Well</Well>);
}
