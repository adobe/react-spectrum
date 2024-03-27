import React from 'react';
import { Button, Text } from '@react/experimental-s2';
import '@react/experimental-s2/page.css';
import {style} from '@react/experimental-s2/style' with {type: 'macro'};
import GlobeGrid from '@react/experimental-s2/icons/GlobeGrid';


export const App = () => {
  return (
    <main>
      <Button 
        styles={style({
          marginStart: 16
        })}
      >
        <GlobeGrid />
        <Text>Hello World</Text>
      </Button>
    </main>
  );
};
