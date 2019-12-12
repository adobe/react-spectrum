import {action} from '@storybook/addon-actions';
import React from 'react';
import {SplitView} from '../';
import {storiesOf} from '@storybook/react';
import svStyles from './SplitView.css';

let styles = {
  width: '900px'
};
const CenterDecorator = storyFn => <div style={styles}>{storyFn()}</div>;

storiesOf('SplitView', module)
  .addDecorator(CenterDecorator)
  .add(
    'Default',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Collapsible',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} allowsCollapsing>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Not resizable',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} allowsResizing={false}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Primary right',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} primaryPane={1}>
        <div>Secondary</div>
        <div>Primary</div>
      </SplitView>
    )
  )
  .add(
    'Primary right, collapsible',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} primaryPane={1} allowsCollapsing>
        <div>Secondary</div>
        <div>Primary</div>
      </SplitView>
    )
  )
  .add(
    'Primary right, Not resizable',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} primaryPane={1} allowsResizing={false}>
        <div>Secondary</div>
        <div>Primary</div>
      </SplitView>
    )
  )
  .add(
    'Custom sizes',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} primaryMinSize={50} primaryMaxSize={500} defaultPrimarySize={400} secondaryMinSize={50}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Vertical orientation',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} orientation="vertical" primaryMinSize={50} defaultPrimarySize={100} secondaryMinSize={50} allowsCollapsing>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'Nested',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']}>
        <div>Left</div>
        <SplitView UNSAFE_className={svStyles['storybook-SplitView']} orientation="vertical" primaryMinSize={50} defaultPrimarySize={100} secondaryMinSize={50}>
          <div>Top</div>
          <div>Bottom</div>
        </SplitView>
      </SplitView>
    )
  )
  .add(
    'onResize and onResizeEnd',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} onResize={action('onResize')} onResizeEnd={action('onResizeEnd')} allowsCollapsing>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'primarySize: 0',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} allowsCollapsing primarySize={0}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'primarySize: 400',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} primarySize={400}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'onMouseDown',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} onMouseDown={action('onMouseDown')}>
        <div>Primary</div>
        <div>Secondary</div>
      </SplitView>
    )
  )
  .add(
    'with scrolling content',
    () => (
      <SplitView UNSAFE_className={svStyles['storybook-SplitView']} onMouseDown={action('onMouseDown')}>
        <div style={{height: '100%', overflow: 'auto'}}><div style={{height: '400px', display: 'flex', flexDirection: 'column'}}><div style={{'flex': '1 0 auto'}}>Primary</div><div>end</div></div></div>
        <div>Secondary</div>
      </SplitView>
    )
  );
