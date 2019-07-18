import Icon3DMaterials from '../3DMaterials';
import Add from '../Add';
import Bell from '../Bell';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Workflow', module)
  .add(
    'icon: Add',
    () => <Add alt="Add" />
  )
  .add(
    'icon: bell',
    () => <Bell alt="Bell" />
  )
  .add(
    'icon: _3DMaterials',
    () => <Icon3DMaterials alt="3D Materials" />
  );

