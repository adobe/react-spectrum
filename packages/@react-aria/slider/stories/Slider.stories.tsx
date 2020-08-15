import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {StoryMultiSlider, StoryThumb} from './StoryMultiSlider';
import {StoryRangeSlider} from './StoryRangeSlider';
import {StorySlider} from './StorySlider';


storiesOf('Slider', module)
  .add(
    'single',
    () => <StorySlider label="Size" onChange={action('onChange')} onChangeEnd={action('onChangeEnd')} />
  )
  .add(
    'single with big steps',
    () => <StorySlider label="Size" onChange={action('onChange')} onChangeEnd={action('onChangeEnd')} step={10} />
  )
  .add(
    'single with origin',
    () => <StorySlider label="Exposure" origin={0} minValue={-5} maxValue={5} step={0.1} onChange={action('onChange')} onChangeEnd={action('onChangeEnd')} />
  )
  .add(
    'single with aria label',
    () => <StorySlider aria-label="Size" onChange={action('onChange')} onChangeEnd={action('onChangeEnd')} />
  )
  .add(
    'range',
    () => (<StoryRangeSlider 
      label="Temperature" 
      defaultValue={[25, 75]} 
      onChange={action('onChange')} 
      onChangeEnd={action('onChangeEnd')} 
      formatOptions={{
        style: 'unit',
        unit: 'celsius',
        unitDisplay: 'narrow'
      } as any} />)
  )
  .add(
    'range with aria-label',
    () => (<StoryRangeSlider 
      aria-label="Temperature"
      defaultValue={[25, 75]} 
      onChange={action('onChange')} 
      onChangeEnd={action('onChangeEnd')} 
      formatOptions={{
        style: 'unit',
        unit: 'celsius',
        unitDisplay: 'narrow'
      } as any} />)
  )
  .add(
    '3 thumbs',
    () => (
      <StoryMultiSlider 
        label="Ticks" 
        onChange={action('onChange')} 
        onChangeEnd={action('onChangeEnd')}
        defaultValue={[10, 40, 80]}>
        <StoryThumb label="A" />
        <StoryThumb label="B" />
        <StoryThumb label="C" />
      </StoryMultiSlider>
    )
  )
  .add(
    '3 thumbs with disabled',
    () => (
      <StoryMultiSlider 
        label="Ticks" 
        onChange={action('onChange')} 
        onChangeEnd={action('onChangeEnd')}
        defaultValue={[10, 40, 80]}>
        <StoryThumb label="A" />
        <StoryThumb label="B" isDisabled />
        <StoryThumb label="C" />
      </StoryMultiSlider>
    )
  )
  .add(
    '3 thumbs with aria-label',
    () => (
      <StoryMultiSlider 
        aria-label="Ticks"
        onChange={action('onChange')} 
        onChangeEnd={action('onChangeEnd')}
        defaultValue={[10, 40, 80]}>
        <StoryThumb aria-label="A" />
        <StoryThumb aria-label="B" />
        <StoryThumb aria-label="C" />
      </StoryMultiSlider>
    )
  )
  ;
