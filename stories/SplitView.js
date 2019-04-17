import {action} from '@storybook/addon-actions';
import React from 'react';
import SplitView from '../src/SplitView';
import {storiesOf} from '@storybook/react';
import './SplitView.styl';

storiesOf('SplitView', module)
  .add(
    'Default',
    () => (
      <SplitView>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Collapsible',
    () => (
      <SplitView collapsible>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Non-resizable',
    () => (
      <SplitView resizable={false}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Primary right',
    () => (
      <SplitView primaryPane={1} collapsible>
        <div>Secondary</div>
        <div>Primary</div>
      </SplitView>
    )
  )
  .add(
    'Custom sizes',
    () => (
      <SplitView primaryMin={50} primaryMax={500} primaryDefault={400} secondaryMin={50}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Vertical orientation',
    () => (
      <SplitView orientation="vertical" primaryMin={50} primaryDefault={100} secondaryMin={50} collapsible>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Nested',
    () => (
      <SplitView>
        <div>Left</div>
        <SplitView orientation="vertical" primaryMin={50} primaryDefault={100} secondaryMin={50}>
          <div>Top</div>
          <div>Bottom</div>
        </SplitView>
      </SplitView>
    )
  )
  .add(
    'onResize and onResizeEnd',
    () => (
      <SplitView onResize={action('onResize')} onResizeEnd={action('onResizeEnd')}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'primarySize: 0',
    () => (
      <SplitView collapsible primarySize={0}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'primarySize: 400',
    () => (
      <SplitView primarySize={400}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'onMouseDown',
    () => (
      <SplitView onMouseDown={action('onMouseDown')}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  );
