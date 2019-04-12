import {action, storiesOf} from '@storybook/react';
import React from 'react';
import SplitView from '../src/SplitView';
import {VerticalCenter} from '../.storybook/layout';
import './SplitView.styl';

storiesOf('SplitView', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <SplitView>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Collapsible',
    () => (
      <SplitView collapsible>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Non-resizable',
    () => (
      <SplitView resizable={false}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Primary right',
    () => (
      <SplitView primaryPane={1} collapsible>
        <div>Secondary</div>
        <div>Primary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Custom sizes',
    () => (
      <SplitView primaryMin={50} primaryMax={500} primaryDefault={400} secondaryMin={50}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Vertical orientation',
    () => (
      <SplitView orientation="vertical" primaryMin={50} primaryDefault={100} secondaryMin={50} collapsible>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'Nested',
    () => (
      <SplitView>
        <div>Left</div>
        <SplitView orientation="vertical" primaryMin={50} primaryDefault={100} secondaryMin={50}>
          <div>Top</div>
          <div>Bottom</div>
        </SplitView>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'onResize and onResizeEnd',
    () => (
      <SplitView onResize={action('onResize')} onResizeEnd={action('onResizeEnd')}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'primarySize: 0',
    () => (
      <SplitView collapsible primarySize={0}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'primarySize: 400',
    () => (
      <SplitView primarySize={400}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  )
  .addWithInfo(
    'onMouseDown',
    () => (
      <SplitView onMouseDown={action('onMouseDown')}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    ),
    {inline: true}
  );
