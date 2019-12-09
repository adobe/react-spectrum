import {Button} from '@react-spectrum/button';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {View} from '../';

storiesOf('View', module)
  .add(
    'name me',
    () => (
      <div style={{display: 'flex'}}>
        <View 
          backgroundColor="negative"
          width="single-line-width"
          height="size-500"
          elementType="span" />
        <View 
          backgroundColor="positive"
          width="size-500"
          height="size-500"
          marginStart="size-250"
          borderColor="default"
          borderWidth="thin" />
        <Button marginStart="size-250">Test</Button>
      </div>
    )
  );
