/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Label} from '../src/Label';

import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {Slider, SliderMark, SliderOutput, SliderThumb, SliderTrack} from '../src/Slider';
import styles from '../example/index.css';
import './styles.css';

export default {
  title: 'React Aria Components/Slider',
  component: Slider
} as Meta<typeof Slider>;

export type SliderStory = StoryFn<typeof Slider>;

export const SliderExample: SliderStory = () => {
  const [value, setValue] = React.useState([30, 60]);
  return (
    <div>
      <Slider<number[]>
        data-testid="slider-example"
        value={value}
        onChange={setValue}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: 300
        }}>
        <div style={{display: 'flex', alignSelf: 'stretch'}}>
          <Label>Test</Label>
          <SliderOutput style={{flex: '1 0 auto', textAlign: 'end'}}>
            {({state}) => `${state.getThumbValueLabel(0)} - ${state.getThumbValueLabel(1)}`}
          </SliderOutput>
        </div>
        <SliderTrack
          style={{
            position: 'relative',
            height: 30,
            width: '100%'
          }}>
          <div
            style={{
              position: 'absolute',
              backgroundColor: 'gray',
              height: 3,
              top: 13,
              width: '100%'
            }}
          />
          <CustomThumb index={0}>
            <Label>A</Label>
          </CustomThumb>
          <CustomThumb index={1}>
            <Label>B</Label>
          </CustomThumb>
        </SliderTrack>
      </Slider>
      <button onClick={() => setValue([0, 100])}>reset</button>
    </div>
  );
};

export const SliderCSS: SliderStory = props => (
  <Slider {...props} defaultValue={30} className={styles.slider}>
    <div className={styles.label}>
      <Label>Test</Label>
      <SliderOutput />
    </div>
    <SliderTrack className={styles.track}>
      <SliderThumb className={styles.thumb} />
    </SliderTrack>
  </Slider>
);

SliderCSS.args = {
  orientation: 'horizontal',
  isDisabled: false,
  minValue: 0,
  maxValue: 100,
  step: 1
};

SliderCSS.argTypes = {
  orientation: {
    control: {
      type: 'inline-radio',
      options: ['horizontal', 'vertical']
    }
  }
};

// Seven ticks over six intervals, matching the macOS Sound output volume slider that
// https://github.com/adobe/react-spectrum/issues/8285 asks for.
const VOLUME_TICKS = [0, 100 / 6, 200 / 6, 50, 400 / 6, 500 / 6, 100];

export const SliderMarks: SliderStory = props => (
  <Slider
    {...props}
    aria-label="Volume"
    defaultValue={70}
    snapPoints={VOLUME_TICKS}
    style={{display: 'flex', alignItems: 'center', gap: 10, width: 360}}>
    <SliderTrack
      style={{position: 'relative', flex: 1, height: 22, display: 'flex', alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 4,
          background: '#d4d4d4',
          borderRadius: 2
        }}
      />
      {VOLUME_TICKS.map((value, i) => (
        <SliderMark key={i} value={value}>
          {({isHovered}) => (
            <div
              style={{
                width: 2,
                height: 11,
                borderRadius: 1,
                background: isHovered ? '#8a8a8a' : '#bdbdbd'
              }}
            />
          )}
        </SliderMark>
      ))}
      <SliderThumb
        style={({isDragging}) => ({
          width: 11,
          height: 22,
          top: '50%',
          borderRadius: 5.5,
          // The thumb goes translucent while dragging, as the macOS slider does.
          background: isDragging ? 'rgba(255, 255, 255, 0.45)' : '#fff',
          boxShadow: isDragging
            ? '0 0 0 0.5px rgba(0, 0, 0, 0.09)'
            : '0 0 0 0.5px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.28)'
        })}
      />
    </SliderTrack>
    <SliderOutput style={{width: 40, textAlign: 'end', fontVariantNumeric: 'tabular-nums'}} />
  </Slider>
);

SliderMarks.args = {
  isDisabled: false,
  snapThreshold: 0.02
};

const LABELLED_MARKS = [-100, -50, 0, 50, 100];

export const SliderMarksWithLabels: SliderStory = props => (
  <Slider
    {...props}
    aria-label="Balance"
    defaultValue={0}
    minValue={-100}
    maxValue={100}
    snapPoints={LABELLED_MARKS}
    style={{position: 'relative', width: 300}}>
    <SliderOutput />
    <SliderTrack style={{position: 'relative', height: 30, width: '100%'}}>
      <div
        style={{position: 'absolute', backgroundColor: 'gray', height: 3, top: 13, width: '100%'}}
      />
      {LABELLED_MARKS.map(value => (
        <SliderMark key={value} value={value} style={{top: 14}}>
          {({isHovered}) => (
            <>
              <div style={{width: 2, height: 10, backgroundColor: 'gray'}} />
              <span
                style={{
                  position: 'absolute',
                  top: 12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 12,
                  textDecoration: isHovered ? 'underline' : undefined
                }}>
                {value}
              </span>
            </>
          )}
        </SliderMark>
      ))}
      <CustomThumb index={0} />
    </SliderTrack>
  </Slider>
);

SliderMarksWithLabels.args = {
  isDisabled: false,
  snapThreshold: 0.03
};

const CustomThumb = ({index, children}: {index: number; children?: React.ReactNode}) => {
  return (
    <SliderThumb
      index={index}
      style={({isDragging, isFocusVisible}) => ({
        width: 20,
        height: 20,
        borderRadius: '50%',
        top: '50%',
        // eslint-disable-next-line
        backgroundColor: isFocusVisible ? 'orange' : isDragging ? 'dimgrey' : 'gray'
      })}>
      {children}
    </SliderThumb>
  );
};
