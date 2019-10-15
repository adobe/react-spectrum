import {Icon} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Custom', module)
  .add(
    'exciting square',
    () => <Icon><svg viewBox="0 0 25 25"><rect x="0" y="0" width="25" height="25" /></svg></Icon>
  );
