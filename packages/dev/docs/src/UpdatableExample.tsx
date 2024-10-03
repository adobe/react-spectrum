
// import {Button, SpectrumButtonProps} from '@react-spectrum/button';
import {Checkbox} from '@react-spectrum/checkbox';
import {Flex} from '@react-spectrum/layout';
import {groupProps} from '@react-spectrum/docs/src';
import {Item, Picker} from '@react-spectrum/picker';
import React, {useState} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {Well} from '@react-spectrum/well';

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

export function UpdatableExample<T>(props) {
  type PropKeys = keyof T;

  const {
    LiveComponent,
    componentName,
    childrenString,
    componentProps,
    componentArgTypes,
    key
  } = props;
  console.log('componentArgTypes', componentArgTypes);

  // Run the component props through groupProps(), a helper of the props table.
  // Grabbing the first array item gives the props table, groupProps() sorts the
  // other props into the other categories you see below the props table in disclosures.
  const typeButtonProps = groupProps(componentProps.props.properties)[0];
  // Declare a state variable to hold the component props that will be live updated.
  // TODO: what about this typing?
  const [controlProps, setControlProps] = useState<T>(getDefaultButtonProps(typeButtonProps));

  // TODO: Do we need to include a string type for children? Maybe options additional props in storybook format?
  // Wrapper on setControlProps to update the state variable with the new value used by all the input fields.
  const handleChange = (key: PropKeys, value: any) => {
    setControlProps({
      ...controlProps,
      [key]: value
    });
  };

  // merge componentArgTypes (storybook controls) and typeButtonProps (typescript props)
  // typeButtonProps needs to be transformed into an object that is the same as PropKeys
  const mergedControls = {...convertToStorybookArgTypes(typeButtonProps), ...componentArgTypes};

  // filter out keys that we don't want to show in the controls
  const filteredControls = Object.keys(mergedControls).reduce((acc, key) => {
    if (!['ref', 'elementType'].includes(key)) {
      acc[key] = mergedControls[key];
    }
    return acc;
  }, {});

  // console.log('mergedControls', mergedControls);

  // console.log('LiveButton(): component', component);

  const renderControls = (key: PropKeys) => {
    const argType: StorybookArgTypes = filteredControls[key];
    const value = controlProps[key];
  
    if (!argType || !argType.control) {
      // debugging to learn more, only catching type "table" so far
      console.log('no argType or no argType.control with', argType);
      return null;
    }

    // console.log('argType.control', argType.control);
    // convert the props to the appropriate control, everything is covered by boolean, text, and select
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
        // if the control is a radio or select, we normalize it to a picker, by checking if options exist
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
        // TODO: remove debugging which helps identify missed cases
        console.log('switch didn\'t handle');
        return null;
    }
  };

  return (
    <div key={key}>
      <h2>Live Example</h2>
      <Flex direction="row" gap="size-300" wrap>
        {Object.keys(filteredControls).map((key) => renderControls(key as PropKeys))}
      </Flex>
      <br />
      <LiveComponent {...controlProps}>{childrenString}</LiveComponent>
      <Well>
        {`<${componentName} ${Object.keys(filteredControls).map((key) => controlProps[key] ? `${key}={${controlProps[key]}}` : '').join(' ')}>${childrenString}</${componentName}>`}
      </Well>
    </div>
  );
};

/**
 * Normalize typescript props to storybook controls.
 * The typescript props format is what is used for the props table.
 */
const convertToStorybookArgTypes = (componentTypes: ComponentTypes): StorybookArgTypes => {
  const storybookArgTypes: StorybookArgTypes = {};

  //  console.log('convertToStorybookArgTypes(): componentTypes', componentTypes);

  // Only three input fileds are supported for now: boolean, text, and select
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

// TODO: replace SpectrumButtonProps
const getDefaultButtonProps = (typeButtonProps: ComponentTypes) => {
  const defaultProps = {};

  // replace `const proptypes` with a similar object of boolean values and string values based
  // on the defaults in typeButtonProps, all bolleans should be false is not defaulted and string values empty.
  for (const key in typeButtonProps) {
    const propType = typeButtonProps[key];
    if (propType?.value?.type === 'boolean') {
      defaultProps[key] = propType.default;
    } else if (propType?.value?.type === 'string') {
      defaultProps[key] = propType?.default ? removeQuotes(propType?.default) : '';
    } else if (propType?.value?.type === 'union') {
      defaultProps[key] = propType?.default ? removeQuotes(propType?.default) : '';
    }
  }

  return defaultProps;
};
