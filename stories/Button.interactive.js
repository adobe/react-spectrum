/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import Bell from '../src/Icon/Bell';
import {boolean, optionsKnob as options, select, text, withKnobs} from '@storybook/addon-knobs';
import Brush from '../src/Icon/Brush';
import Button from '../src/Button';
import React from 'react';
import {storiesOf} from '@storybook/react';

/**
 * The following stories are used for showcasing the different props of the component.
 * The user can tweak the different values for the props and observe how the component responds in real time.
 */
storiesOf('Button/interactive', module)
  .addDecorator(withKnobs)
  .add(
    'Regular Button',
    () => renderRegularButton()
  )
  .add(
    'CTA Button',
    () => renderCtaButton()
  )
  .add(
    'Button over background',
    () => renderOverBackgroundButton()
  )
  .add(
    'Action button',
    () => renderActionButton()
  )
  .add(
    'Tool button',
    () => renderToolButton()
  )
  .add(
    'Logic button',
    () => renderLogicButton()
  )
  .add(
    'Button rendered in custom element',
    () => renderCustomElementButton()
  )
  .add(
    'shift focus on mouseDown',
    () => renderMouseDownScenario(),
    {info: 'In Safari, buttons don\'t receive focus following mousedown/mouseup events. React-spectrum provides a workaround for this issue so that components like the ButtonGroup will be navigable using the keyboard after receiving focus with the mouse. This story tests whether it is still possible to shift focus on mousedown without using preventDefault to prevent focus from being reclaimed by the button being clicked.'}
  );

function renderBasicButton(props = {}, hideLabel = false) {
  let newProps = Object.assign({
    variant: 'cta',
    disabled: boolean('disabled', false),
    onClick: action('click')
  }, props);
  // In some examples we want to add the default label prop only when there is no custom label prop - there seems to be an issue with Storybook, where the label knob is displayed even if overridden by another label key.
  // In some examples don't want to display the label knob, when hideLabel is set to true.
  if (newProps.hasOwnProperty('label') === false && hideLabel === false) {
    newProps.label = text('label', 'React');
  }
  return (
    <Button {...newProps} />
  );
}

const buttonVariantSelect = {
  'primary': 'primary',
  'secondary': 'secondary',
  'warning': 'warning'
};
  
function renderRegularButton() {
  function renderButton(props = {}) {
    let newProps = Object.assign({
      variant: select('variant', buttonVariantSelect, 'primary'),
      quiet: boolean('quiet', false)
    }, props);
    return renderBasicButton(newProps);
  }

  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {renderButton()}
      {renderButton({icon: <Bell />})}
    </div>
  );
}

function renderCtaButton() {
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
      {renderBasicButton()}
      {renderBasicButton({icon: <Bell />})}
    </div>
  );
}

function renderOverBackgroundButton() {
  function renderButton(props = {}) {
    let newProps = Object.assign({
      variant: 'overBackground',
      quiet: boolean('quiet', false)
    }, props);
    return renderBasicButton(newProps);
  }
  return (
    <div style={{backgroundColor: '#12805C', alignItems: 'center', padding: '15px 20px', display: 'inline-block'}}>
      {renderButton()}
      {renderButton({icon: <Bell />})}
    </div>
  );
}

function renderActionButton() {
  function renderButton(props = {}) {
    let newProps = Object.assign({
      variant: 'action',
      holdAffordance: boolean('holdAffordance', true),
      quiet: boolean('quiet', false),
      selected: boolean('selected', false)
    }, props);
    return renderBasicButton(newProps);
  }

  return (
    <div>
      {renderButton()}
      {renderButton({icon: <Bell />})}
    </div>
  );
}

function renderToolButton() {
  return (
    <div>
      {renderBasicButton(
        {
          variant: 'tool',
          holdAffordance: boolean('holdAffordance', true),
          selected: boolean('selected', false),
          icon: <Brush />
        },
        true
      )}
    </div>
  );
}

function renderLogicButton() {
  const valuesVariant = {
    and: 'and',
    or: 'or'
  };
  const optionVariant = options('Variant', valuesVariant, 'and', {display: 'inline-radio'});
  return (
    <div>
      {renderBasicButton(
        {
          logic: true,
          label: optionVariant,
          variant: optionVariant
        }
      )}
    </div>
  );
}

function renderCustomElementButton() {
  return (
    <div>
      {renderBasicButton({
        element: 'a', href: 'http://example.com', 
        variant: 'secondary',
        quiet: boolean('quiet', false)
      })}
    </div>
  );
}

function renderMouseDownScenario() {
  const buttons = [];
  return (
    <div>
      {renderBasicButton(
        {
          variant: 'primary',
          label: 'Focus next button',
          ref: b => buttons.push(b),
          onMouseDown: e => {e.preventDefault(); buttons[1].focus();}
        }
      )}
      {renderBasicButton(
        {
          variant: 'primary',
          label: 'Focus previous button',
          ref: b => buttons.push(b),
          onMouseDown: e => {e.preventDefault(); buttons[0].focus();}
        }
      )}
      {renderBasicButton(
        {
          variant: 'primary',
          label: 'preventDefault',
          ref: b => buttons.push(b),
          onMouseDown: e => e.preventDefault()
        }
      )}
    </div>
  );
}
