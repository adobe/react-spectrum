import {action} from '@storybook/addon-actions';
import {ErrorBoundary} from '@react-spectrum/story-utils';
import React, {JSX} from 'react';
import {StoryFn} from '@storybook/react';
import {StoryMultiSlider, StoryThumb} from './StoryMultiSlider';
import {StoryRangeSlider} from './StoryRangeSlider';
import {StorySlider} from './StorySlider';

let message = 'Your browser may not support this set of format options.';

export default {
  title: 'Slider (hooks)',
  decorators: [(story: any): JSX.Element => <ErrorBoundary message={message}>{story()}</ErrorBoundary>] as const
};

export type SliderStory = StoryFn<typeof StorySlider>;

export const Single: SliderStory = () => (
  <StorySlider
    label="Size"
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    showTip />
);

Single.story = {
  name: 'single'
};

export const SingleWithBigSteps: SliderStory = () => (
  <StorySlider
    label="Size"
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    step={10}
    showTip />
);

SingleWithBigSteps.story = {
  name: 'single with big steps'
};

export const SingleWithOrigin: SliderStory = () => (
  <StorySlider
    label="Exposure"
    origin={0}
    minValue={-5}
    maxValue={5}
    step={0.1}
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    showTip />
);

SingleWithOrigin.story = {
  name: 'single with origin'
};

export const SingleWithAriaLabel: SliderStory = () => (
  <StorySlider
    aria-label="Size"
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    showTip />
);

SingleWithAriaLabel.story = {
  name: 'single with aria label'
};

export const Range: SliderStory = () => (
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
   } />
);

Range.story = {
  name: 'range'
};

export const RangeWithAriaLabel: SliderStory = () => (
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
    } />
);

RangeWithAriaLabel.story = {
  name: 'range with aria-label'
};

export const _3Thumbs: SliderStory = () => (
  <StoryMultiSlider
    label="Three thumbs"
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    defaultValue={[10, 40, 80]}>
    <StoryThumb label="A" />
    <StoryThumb label="B" />
    <StoryThumb label="C" />
  </StoryMultiSlider>
);

_3Thumbs.story = {
  name: '3 thumbs'
};

export const _3ThumbsWithDisabled: SliderStory = () => (
  <StoryMultiSlider
    label="Three thumbs"
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    defaultValue={[10, 40, 80]}>
    <StoryThumb label="A" />
    <StoryThumb label="B" isDisabled />
    <StoryThumb label="C" />
  </StoryMultiSlider>
);

_3ThumbsWithDisabled.story = {
  name: '3 thumbs with disabled'
};

export const _8ThumbsWithDisabled: SliderStory = () => (
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
);

_8ThumbsWithDisabled.story = {
  name: '8 thumbs with disabled'
};

export const _3ThumbsWithAriaLabel: SliderStory = () => (
  <StoryMultiSlider
    aria-label="Three thumbs"
    onChange={action('onChange')}
    onChangeEnd={action('onChangeEnd')}
    defaultValue={[10, 40, 80]}>
    <StoryThumb aria-label="A" />
    <StoryThumb aria-label="B" />
    <StoryThumb aria-label="C" />
  </StoryMultiSlider>
);

_3ThumbsWithAriaLabel.story = {
  name: '3 thumbs with aria-label'
};
