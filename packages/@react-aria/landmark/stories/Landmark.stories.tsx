/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Landmark, useLandmark} from '../';
import {Meta, Story} from '@storybook/react';
import React, {useRef} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {Checkbox} from '@react-spectrum/checkbox';


interface StoryProps {
  usePortal: boolean
}

const meta: Meta<StoryProps> = {
  title: 'Landmark',
  component: Landmark
};

export default meta;

const Template = (): Story<StoryProps> => (props) => <Example {...props} />;
const NestedTemplate = (): Story<StoryProps> => (props) => <NestedExample {...props} />;


function Main(props) {
  let ref = useRef();
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref);
  return <main ref={ref} {...landmarkProps}>{props.children}</main>;
}

function Navigation(props) {
  let ref = useRef();
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref);
  return <nav ref={ref} {...landmarkProps}>{props.children}</nav>;
}

function Region(props) {
  let ref = useRef();
  let {landmarkProps} = useLandmark({...props, role: 'region'}, ref);
  return <article ref={ref} {...landmarkProps}>{props.children}</article>;
}

function Example(props: StoryProps) {
  return (
    <div>
      <Navigation>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Main>
        <TextField label="First Name" />
      </Main>
    </div>
  );
}

function NestedExample(props: StoryProps) {
  return (
    <div>
      <Main>
        <TextField label="First Name" />

        <Region>
          <Checkbox>Checkbox label</Checkbox>
        </Region>
      </Main>
    </div>
  );
}

export const FlatLandmarks = Template().bind({});
FlatLandmarks.args = {usePortal: false};

export const NestedLandmarks = Template().bind({});
NestedLandmarks.args = {usePortal: false};
