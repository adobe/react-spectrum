import {action} from 'storybook/actions';
import {ErrorBoundary} from '@react-spectrum/story-utils';
import React, {JSX} from 'react';
import {StoryMultiSlider, StoryThumb} from './StoryMultiSlider';
import {StoryObj} from '@storybook/react';
import {StoryRangeSlider} from './StoryRangeSlider';
import {StorySlider} from './StorySlider';

let message = 'Your browser may not support this set of format options.';

export default {
  title: 'Slider (hooks)',
  decorators: [
    (story: any): JSX.Element => <ErrorBoundary message={message}>{story()}</ErrorBoundary>
  ] as const
};

export type SliderStory = StoryObj<typeof StorySlider>;

export const Single: SliderStory = {
  render: () => (
    <StorySlider
      label="Size"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      showTip
    />
  ),
  name: 'single'
};

export const SingleWithBigSteps: SliderStory = {
  render: () => (
    <StorySlider
      label="Size"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      step={10}
      showTip
    />
  ),
  name: 'single with big steps'
};

export const SingleWithOrigin: SliderStory = {
  render: () => (
    <StorySlider
      label="Exposure"
      origin={0}
      minValue={-5}
      maxValue={5}
      step={0.1}
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      showTip
    />
  ),
  name: 'single with origin'
};

export const SingleWithAriaLabel: SliderStory = {
  render: () => (
    <StorySlider
      aria-label="Size"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      showTip
    />
  ),
  name: 'single with aria label'
};

export const Range: SliderStory = {
  render: () => (
    <StoryRangeSlider
      label="Temperature"
      defaultValue={[25, 75]}
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      showTip
      formatOptions={
        {
          style: 'unit',
          unit: 'celsius',
          unitDisplay: 'narrow'
        } as any
      }
    />
  ),
  name: 'range'
};

export const RangeWithAriaLabel: SliderStory = {
  render: () => (
    <StoryRangeSlider
      aria-label="Temperature"
      defaultValue={[25, 75]}
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      showTip
      formatOptions={
        {
          style: 'unit',
          unit: 'celsius',
          unitDisplay: 'narrow'
        } as any
      }
    />
  ),
  name: 'range with aria-label'
};

export const _3Thumbs: SliderStory = {
  render: () => (
    <StoryMultiSlider
      label="Three thumbs"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      defaultValue={[10, 40, 80]}>
      <StoryThumb label="A" />
      <StoryThumb label="B" />
      <StoryThumb label="C" />
    </StoryMultiSlider>
  ),
  name: '3 thumbs'
};

export const _3ThumbsWithDisabled: SliderStory = {
  render: () => (
    <StoryMultiSlider
      label="Three thumbs"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      defaultValue={[10, 40, 80]}>
      <StoryThumb label="A" />
      <StoryThumb label="B" isDisabled />
      <StoryThumb label="C" />
    </StoryMultiSlider>
  ),
  name: '3 thumbs with disabled'
};

export const _8ThumbsWithDisabled: SliderStory = {
  render: () => (
    <StoryMultiSlider
      label="9 thumbs - 5 disabled"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      defaultValue={[5, 10, 15, 30, 35, 40, 50, 75, 90]}>
      <StoryThumb label="A" isDisabled />
      <StoryThumb label="B" />
      <StoryThumb label="C" />
      <StoryThumb label="D" isDisabled />
      <StoryThumb label="E" isDisabled />
      <StoryThumb label="F" />
      <StoryThumb label="G" />
      <StoryThumb label="H" isDisabled />
      <StoryThumb label="I" isDisabled />
    </StoryMultiSlider>
  ),
  name: '8 thumbs with disabled'
};

export const _3ThumbsWithAriaLabel: SliderStory = {
  render: () => (
    <StoryMultiSlider
      aria-label="Three thumbs"
      onChange={action('onChange')}
      onChangeEnd={action('onChangeEnd')}
      defaultValue={[10, 40, 80]}>
      <StoryThumb aria-label="A" />
      <StoryThumb aria-label="B" />
      <StoryThumb aria-label="C" />
    </StoryMultiSlider>
  ),
  name: '3 thumbs with aria-label'
};
