/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton} from '@react-spectrum/button';
import {Checkbox} from '@react-spectrum/checkbox';
import Copy from '@spectrum-icons/workflow/Copy';
import {Flex} from '@react-spectrum/layout';
import {groupProps} from '@react-spectrum/docs/src';
import {Item, Picker} from '@react-spectrum/picker';
import React, {useState} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
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

// TODO: Find the existing storybook type
type StroybookComponentTypes = 'select' | 'boolean' | 'text' | 'radio' | 'number' | 'color'; // These are from Stroybook. We aren't supporting number of color.
interface StorybookArgTypes {
  type?: StroybookComponentTypes,
  control?: 'string' | {
    type?: StroybookComponentTypes,
    options?: (null | string)[],
    disable?: boolean
  },
  options?: (null | string)[]
}

export function InteractiveExample<T>(props) {
  type PropKeys = keyof T;

  // TODO: Replace otherProps with an object variable of props to place on the component
  let {
    LiveComponent,
    componentName,
    children,
    childrenString,
    componentProps,
    componentArgTypes,
    label,
    ...otherProps
  } = props;

  // Run the component props through groupProps(), a helper of the props table.
  // Grabbing the first array item gives the props table, groupProps() sorts the
  // other props into the other categories you see below the props table in disclosures.
  let typeComponentProps = groupProps(componentProps.props.properties)[0];
  // Declare a state variable to hold the component props that will be live updated.
  // TODO: add label into this initialization
  let [controlProps, setControlProps] = useState<Record<PropKeys, any>>(getDefaultComponentProps(typeComponentProps, label, otherProps) as Record<PropKeys, any>);

  // TODO: Do we need to include a string type for children? Maybe options additional props in storybook format?
  // Wrapper on setControlProps to update the state variable with the new value used by all the input fields.
  let handleChange = (key: PropKeys, value: any) => {
    setControlProps({
      ...controlProps,
      [key]: value
    });
  };

  // typeButtonProps needs to be transformed into an object that is the same as PropKeys
  let typedPropsAsStorybookType = convertToStorybookArgTypes(typeComponentProps);

  // merge componentArgTypes (storybook controls) and typeButtonProps (typescript props)
  let mergedControls = {...typedPropsAsStorybookType, ...componentArgTypes};

  // many of our storybook stories disable the label, so we need to add it back in
  if (label) {
    mergedControls['label'] = typedPropsAsStorybookType['label'] ? typedPropsAsStorybookType['label'] : {control: 'text'};
  }


  // filter out keys that we don't want to show in the controls
  // <PropKeys, StorybookArgTypes>
  let filteredControls: Record<PropKeys, StorybookArgTypes> = Object.keys(mergedControls).reduce((acc, key) => {
    // TODO: What about not showing autoFocus?
    if (!['ref', 'elementType', 'defaultSelectedKeys', 'defaultSelected'].includes(key)) {
      acc[key] = mergedControls[key];
    }
    return acc;
  }, {}) as Record<PropKeys, StorybookArgTypes>;

  let renderControls = (key: PropKeys) => {
    let argType: StorybookArgTypes = filteredControls[key];
    let value = controlProps[key];
  
    // if (!argType || !argType.type || !argType.control) {
    if (!argType || (typeof argType.control === 'object' && !argType.control?.type)) {
      // debugging to learn more, only catching type "table" so far
      console.log('no argType or no argType.control with', argType);
      return null;
    }

    let controlType;
    if (typeof argType.control === 'string') {
      controlType = argType.control;
    } else if (argType.type) {
      controlType = argType.type;
    } else {
      controlType = argType.control?.type;
    }

    // convert the props to the appropriate control, everything is covered by boolean, text, and select
    switch (controlType) {
      case 'boolean':
        return (
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Checkbox width="size-2400" isSelected={value} onChange={(e) => handleChange(key, e)}><>{key}</></Checkbox>
          </div>
        );
      case 'number': // TODO: should this be a numberfield?
      case 'text':
        return (
          <TextField
            label={<>{key}</>}
            value={key === 'label' ? label : value}
            onChange={(e) => handleChange(key, e)} />
        );
      case 'select': {
        // TODO: do we want a default selected value? Seems to add noise to the examples.
        // TODO: should we always have a blank option?
        // if the control is a radio or select, we normalize it to a picker, by checking if options exist
        let options: string[] = argType.options || (typeof argType.control === 'object' && argType.control?.options) || [];
        return (
          <Picker label={<>{key}</>} selectedKey={value} onSelectionChange={(e) => handleChange(key, e)}>
            {options.map((option: string) => (
              <Item key={option}>{option}</Item>
            ))}
          </Picker>
        );
      }
      // Add more cases as needed
      default:
        // TODO: remove debugging which helps identify missed cases
        console.log('switch didn\'t handle:', argType);
        return null;
    }
  };

  // Props should have strings in quotes and booleans as keys and everything else in curly braces
  let propStringTyping = (key, value) => {
    if (typeof value === 'string') {
      return `${key}="${value}"`;
    } else if (typeof value === 'boolean') {
      return `${key}`;
    } else {
      return `${key}={${value}}`;
    }
  };

  // Convert the control props to a string to display in the example
  // Replace multiple spaces with a single space and remove leading and trailing whitespace
  let propString = ' ' + Object.keys({...otherProps, ...filteredControls}).map((key) => controlProps[key] ? `${propStringTyping(key, controlProps[key])}` : '').join(' ').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
  let componentString = `<${componentName}${propString}${!(childrenString || children) ? ' />' : `>${childrenString ? childrenString : children}</${componentName}>`}`;

  return (
    <div style={{overflow: 'wrap'}}>
      <Flex justifyContent="center">
        <LiveComponent {...controlProps}>{children}</LiveComponent>
      </Flex>
      <br />
      <Flex direction="row" gap="size-100" width="100%">
        {/* @ts-ignore // textWrap doesn't exist for some reason */}
        <Well flex UNSAFE_style={{whiteSpace: 'pre', textWrap: 'wrap'}}>
          {componentString}
        </Well>
        <TooltipTrigger>
          <ActionButton aria-label="Copy to clipboard" onPress={() => {navigator.clipboard.writeText(componentString);}}>
            <Copy />
          </ActionButton>
          <Tooltip>Copy to clipboard</Tooltip>
        </TooltipTrigger>
      </Flex>
      <br />
      <h3>Controls</h3>
      <Flex direction="row" gap="size-300" wrap>
        {Object.keys(filteredControls).map((key) => renderControls(key as PropKeys))}
      </Flex>
    </div>
  );
}

/**
 * Normalize typescript props to storybook controls.
 * The typescript props format is what is used for the props table.
 */
function convertToStorybookArgTypes(componentTypes: ComponentTypes): StorybookArgTypes {
  let storybookArgTypes: StorybookArgTypes = {};

  // Only three input fileds are supported for now: boolean, text, and select
  for (let key in componentTypes) {
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
        }
      };
    } else if (Array.isArray(componentTypes[key]?.value?.elements)) {
      storybookArgTypes[key] = {
        control: {
          type: 'select',
          options: componentTypes[key]?.value?.elements?.map((element) => element.value)
        }
      };
    }
  }

  return storybookArgTypes;
}

// Props with string values have quotes around them.
function removeQuotes(hasQuotes: string): string {
  if (hasQuotes.startsWith("'") && hasQuotes.endsWith("'")) {
    return hasQuotes.slice(1, -1);
  }
  return hasQuotes;
}

/**
 * Use the components typescript definition to set the default props for the
 * useState hook making this interactive.
 *
 * TODO: Is setting defaults causing more problems then it adds value?
 */
function getDefaultComponentProps(typeButtonProps: ComponentTypes, label: string | undefined, otherProps: Record<any, string>): Record<any, any> {
  let defaultProps = otherProps || {};

  // TODO: should we not set defaults?
  // replace `let proptypes` with a similar object of boolean values and string values based
  // on the defaults in typeButtonProps, all bolleans should be false is not defaulted and string values empty.
  // other ignored options are link, function, identifier (when not label), application,
  for (let key in typeButtonProps) {
    // preventing components from being controlled by default
    if (key === 'value' || key === 'isSelected' || key === 'isOpen') {
      defaultProps[key] = undefined;
      continue;
    }
    // for icon in SearchField
    if (key === 'icon') {
      defaultProps[key] = undefined;
      continue;
    }
    let propType = typeButtonProps[key];
    if (propType?.value?.type === 'boolean' || propType?.value?.type === 'number') {
      defaultProps[key] = propType.default;
    } else if (propType?.value?.type === 'string') {
      defaultProps[key] = propType?.default ? removeQuotes(propType?.default) : '';
    } else if (propType?.value?.type === 'union') {
      defaultProps[key] = propType?.default ? removeQuotes(propType?.default) : '';
    } else if (propType?.value?.type === 'identifier' && key === 'label') {
      defaultProps[key] = label;
    }
  }

  return defaultProps;
}
