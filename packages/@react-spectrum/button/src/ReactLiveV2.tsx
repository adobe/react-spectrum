import {Button} from '@react-spectrum/button';
import {
  Compiler,
  Knobs,
  Editor,
  Error,
  ActionButtons,
  Placeholder,
  PropTypes,
  useView,
  View,
} from 'react-view';
import React from 'react';

export function ReactLiveV2() {
  const params = useView({
    componentName: 'Button',
    props: {
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
      disabled: {
        value: false,
        type: PropTypes.Boolean,
        description: 'Indicates that the button is disabled',
      },
    },
    scope: {
      Button,
    },
    imports: {
      'your-button-component': {
        named: ['Button'],
      },
    },
  });

  return (
    <div style={{ maxWidth: "600px", margin: "0px auto" }}>
      <Compiler
        {...params.compilerProps}
        minHeight={62}
        placeholder={Placeholder} />
      <Error msg={params.errorProps.msg} isPopup />
      <Knobs {...params.knobProps} />
      <Editor {...params.editorProps} />
      Error<Error {...params.errorProps} />Error
      <ActionButtons {...params.actions} />
    </div>
  );
}
