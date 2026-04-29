/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button} from '../src/Button';
import {Meta, StoryObj} from '@storybook/react';
import React, {useRef} from 'react';
import {scrollIntoView} from 'react-aria/private/utils/scrollIntoView';

import {useLayoutEffect} from '@react-aria/utils';
import './styles.css';

export default {
  title: 'React Aria Components/ScrollIntoView',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    description: {
      data:
        'Reproduces window scrolling when the document root has a thick border (like a bare HTML page). Uses react-aria scrollIntoView with the document element as the scroll view.'
    }
  }
} as Meta<typeof Button>;

export type ScrollIntoViewStory = StoryObj<typeof Button>;

export function ScrollIntoViewExample() {
  let redSectionRef = useRef<HTMLDivElement>(null);
  let yellowSectionRef = useRef<HTMLDivElement>(null);
  let blueSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let html = document.documentElement;
    let prevBorder = html.style.border;
    let prevWidth = html.style.width;
    html.style.border = '100px solid black';
    html.style.width = '1000px';
    return () => {
      html.style.border = prevBorder;
      html.style.width = prevWidth;
    };
  }, []);

  let triggerScroll = (target: React.RefObject<HTMLDivElement | null>, align: 'start' | 'end') => {
    let root = (document.scrollingElement || document.documentElement) as HTMLElement;
    if (target.current) {
      scrollIntoView(root, target.current, {block: align, inline: align});
    }
  };

  let sectionStyle = (color: string): React.CSSProperties => ({
    height: 1000,
    backgroundColor: color,
    width: '100%'
  });

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      <div ref={redSectionRef} style={sectionStyle('red')}>
        Test 1
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8}}>
          <Button onPress={() => triggerScroll(redSectionRef, 'start')}>Scroll to Red (Start)</Button>
          <Button onPress={() => triggerScroll(yellowSectionRef, 'start')}>Scroll to Yellow (Start)</Button>
          <Button onPress={() => triggerScroll(yellowSectionRef, 'end')}>Scroll to Yellow (End)</Button>
          <Button onPress={() => triggerScroll(blueSectionRef, 'start')}>Scroll to Blue (Start)</Button>
          <Button onPress={() => triggerScroll(blueSectionRef, 'end')}>Scroll to Blue (End)</Button>
        </div>
      </div>
      <div style={sectionStyle('green')}>Test 2</div>
      <div ref={yellowSectionRef} style={sectionStyle('yellow')}>
        Test 3
      </div>
      <div ref={blueSectionRef} style={sectionStyle('blue')}>
        Test 4
      </div>
    </div>
  );
}

export const RootScrollPlayground: ScrollIntoViewStory = {
  render: () => <ScrollIntoViewExample />
};
