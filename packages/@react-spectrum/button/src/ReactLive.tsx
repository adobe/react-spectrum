import {Button} from '@react-spectrum/button';
import {PropTypes, View} from 'react-view';
import React from 'react';

export function ReactLive() {
  return (
    <div style={{ maxWidth: "600px", margin: "0px auto" }}>
      <View
        componentName="Button"
        props={{
          children: {
            value: 'Hello',
            type: PropTypes.ReactNode,
            description: 'Visible label.',
          },
          onClick: {
            value: '() => alert("click")',
            type: PropTypes.Function,
            description: 'Function called when button is clicked.',
          },
          isDisabled: {
            value: false,
            type: PropTypes.Boolean,
            description: 'Indicates that the button is disabled',
          },
        }}
        scope={{
          Button,
        }}
        imports={{
          '@react-spectrum/button': {
            named: ['Button'],
          },
        }}
      />
    </div>
  );
}
