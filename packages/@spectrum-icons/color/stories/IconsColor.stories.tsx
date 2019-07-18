import AdobeAnalyticsColor from '../AdobeAnalyticsColor';
import {Icon} from '@react-spectrum/icon';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Color', module)
  .add(
    'Color icon',
    () => <AdobeAnalyticsColor alt="Adobe Analytics Color" />
  );
