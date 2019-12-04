import {ActionButton} from '@react-spectrum/button/src';
import {Divider} from '../';
import Properties from '@spectrum-icons/workflow/Properties';
import React from 'react';
import Select from '@spectrum-icons/workflow/Select';
import {storiesOf} from '@storybook/react';

storiesOf('Divider', module)
  .add('Large (Default)',
    () => (
      <section>
        <h1>Large</h1>
        <Divider />
        <p>Page or Section Titles.</p>
      </section>
    )
  )
  .add('Medium',
    () => (
      <section>
        <h1>Medium</h1>
        <Divider size="M" />
        <p>Divide subsections, or divide different groups of elements (between panels, rails, etc.)</p>
      </section>
    )
  )
  .add('Small',
    () => (
      <section>
        <h1>Small</h1>
        <Divider size="S" />
        <p>Divide like-elements (tables, tool groups, elements within a panel, etc.)</p>
      </section>
    )
  )
  .add('Vertical, Large (Default), Buttons',
    () => renderVerticalDividerBetweenButtons(),
  )
  .add('Vertical, Medium, Buttons',
    () => renderVerticalDividerBetweenButtons({size: 'M'})
  )
  .add('Vertical, Small, Buttons',
    () => renderVerticalDividerBetweenButtons({size: 'S'})
  ).add('Vertical, Large (Default), Text',
    () => renderVerticalDividerBetweenText(),
  )
  .add('Vertical, Medium, Text',
    () => renderVerticalDividerBetweenText({size: 'M'})
  )
  .add('Vertical, Small, Text',
    () => renderVerticalDividerBetweenText({size: 'S'})
  );

function renderVerticalDividerBetweenButtons(props = {}) {
  return (
    <section style={{display: 'flex', flexDirection: 'row', height: '32px'}}>
      <ActionButton icon={<Properties />} isQuiet />
      <Divider orientation="vertical" {...props} />
      <ActionButton icon={<Select />} isQuiet />
    </section>
  );
}

function renderVerticalDividerBetweenText(props = {}) {
  return (
    <section style={{display: 'flex', flexDirection: 'row', height: '62px'}}>
      <h1 style={{padding: 5}}>Sample Heading</h1>
      <Divider orientation="vertical" {...props} />
      <p style={{padding: 5}}>Sample Text</p>
    </section>
  );
}
