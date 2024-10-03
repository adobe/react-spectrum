
import {Button, SpectrumButtonProps} from './Button';
import ButtonStories from '../stories/Button.stories';
import {Checkbox} from '@react-spectrum/checkbox';
import {Flex} from '@react-spectrum/layout';
import {groupProps} from '@react-spectrum/docs/src';
import {Item, Picker} from '@react-spectrum/picker';
import React, {useState} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {Well} from '@react-spectrum/well';

type PropKeys = keyof SpectrumButtonProps;

interface ComponentTypes {
  default?: boolean | string,
  description: string,
  indexType?: any,
  name: string,
  optional: boolean,
  type: 'property',
  value: {
    type: 'string' | 'boolean' | 'union' | 'identifier',
    elements?: [{
      type: 'string',
      value: string
    }],
    name?: string
  }
}

interface StorybookArgTypes {
  control?: 'string' | {
    type?: 'select' | 'boolean' | 'text' | 'radio' | 'number' | 'color',
    options?: (null | string)[],
    disable?: boolean
  },
  options?: (null | string)[]
}

export function LiveButton({component}) {
  console.log('ButtonStories.argTypes', ButtonStories.argTypes);
  const typeButtonProps = groupProps(component.props.properties)[0];
  const [buttonProps, setButtonProps] = useState<SpectrumButtonProps>(getDefaultButtonProps(typeButtonProps));

  const handleChange = (key: PropKeys, value: any) => {
    setButtonProps({
      ...buttonProps,
      [key]: value
    });
  };

  // merge PropKeys and typeButtonProps
  // typeButtonProps needs to be transformed into an object that is the same as PropKeys
  const mergedControls = {...convertToStorybookArgTypes(typeButtonProps), ...ButtonStories.argTypes};

  // filter out some keys that we don't want to show in the controls
  const filteredControls = Object.keys(mergedControls).reduce((acc, key) => {
    if (!['ref', 'elementType'].includes(key)) {
      acc[key] = mergedControls[key];
    }
    return acc;
  }, {});

  console.log('mergedControls', mergedControls);

  // console.log('LiveButton(): component', component);

  const renderControls = (key: PropKeys) => {
    // const argType: StorybookArgTypes = ButtonStories.argTypes[key];
    const argType: StorybookArgTypes = filteredControls[key];
    const value = buttonProps[key];
  
    // console.log('renderControls(): key, argType, value', key, argType, value);

    if (!argType || !argType.control) {
      console.log('no argType or no argType.control with', argType);
      return null;
    }

    // console.log('argType.control', argType.control);
    switch (typeof argType.control === 'string' ? argType.control : argType.control?.type) {
      case 'boolean':
        return (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Checkbox width="size-2400" isSelected={value} onChange={(e) => handleChange(key, e)}><>{key}</></Checkbox>
          </div>
        );
      case 'text':
        return (
          <TextField
            label={<>{key}</>}
            value={value}
            onChange={(e) => handleChange(key, e)} />
        );
      case 'select':
        // console.log('switch case "select" for argType:', argType);
        let options = argType.options || argType.control?.options || [];
        return (
          <Picker label={<>{key}</>} selectedKey={value} onSelectionChange={(e) => handleChange(key, e)}>
            {options.map((option: string) => (
              <Item key={option}>{option}</Item>
            ))}
          </Picker>
        );
      // Add more cases as needed
      default:
        console.log('switch didn\'t handle');
        return null;
    }
  };

  return (
    <div>
      <h2>Live Button Example</h2>
      <Flex direction="row" gap="size-300" wrap>
        {Object.keys(filteredControls).map((key) => renderControls(key as PropKeys))}
      </Flex>
      <br />
      <Button {...buttonProps}>Click Me</Button>
      <Well>
        {`<Button ${Object.keys(filteredControls).map((key) => buttonProps[key] ? `${key}={${buttonProps[key]}}` : '').join(' ')}>Click Me</Button>`}
      </Well>
    </div>
  );
};

const convertToStorybookArgTypes = (componentTypes: ComponentTypes): StorybookArgTypes => {
  const storybookArgTypes: StorybookArgTypes = {};

  //  console.log('convertToStorybookArgTypes(): componentTypes', componentTypes);

  for (const key in componentTypes) {
    if (componentTypes[key]?.value?.type === 'boolean') {
      storybookArgTypes[key] = {
        control: {
          type: 'boolean'
        }
      };
    } else if (componentTypes[key]?.value?.type === 'string') {
      storybookArgTypes[key] = {
        control: {
          type: 'text'
        },
      };
    } else if (Array.isArray(componentTypes[key]?.value?.elements)) {
      storybookArgTypes[key] = {
        control: {
          type: 'select',
          options: componentTypes[key]?.value?.elements?.map((element) => element.value),
        },
      };
    }
    // Add more type checks and mappings as needed
  }

  // console.log('convertToStorybookArgTypes(): storybookArgTypes', storybookArgTypes);
  return storybookArgTypes;
};

const removeQuotes = (hasQuotes: string): string => {
  if (hasQuotes.startsWith("'") && hasQuotes.endsWith("'")) {
    return hasQuotes.slice(1, -1);
  }
  return hasQuotes;
};

const getDefaultButtonProps = (typeButtonProps: ComponentTypes): SpectrumButtonProps => {
  const defaultProps: Partial<SpectrumButtonProps> = {};

  // console.log('getDefaultButtonProps():start defaultProps', defaultProps);

  // const propTypes: { [key in keyof SpectrumButtonProps]: any } = {};

  // replace `const proptypes` with a similar object of boolean values and string values based on the defaults in typeButtonProps, all bolleans should be false is not defaulted and string values empty.
  for (const key in typeButtonProps) {
    const propType = typeButtonProps[key];
    // console.log('getDefaultButtonProps(): key, propTypes', key, propType);
    if (propType?.value?.type === 'boolean') {
      defaultProps[key] = propType.default;
    } else if (propType?.value?.type === 'string') {
      defaultProps[key] = propType?.default ? removeQuotes(propType?.default) : '';
    } else if (propType?.value?.type === 'union') {
      defaultProps[key] = propType?.default ? removeQuotes(propType?.default) : '';
    }
  }

  return defaultProps as SpectrumButtonProps;
};
