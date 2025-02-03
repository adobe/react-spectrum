/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AddressBar, FileTab, Scrollable, Window} from './components';
import {animate, AnimationPlaybackControls, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform} from 'framer-motion';
import {
  Button,
  Collection,
  Key,
  Tab,
  TabList,
  TabPanel,
  Tabs
} from 'react-aria-components';
import {ComboBox, ComboBoxItem} from 'tailwind-starter/ComboBox';
import {DatePicker} from 'tailwind-starter/DatePicker';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Slider} from 'tailwind-starter/Slider';

export function Styles() {
  return (
    <AnimatedTabs
      tabs={[
        {
          id: 'css',
          label: 'Vanilla CSS',
          content: <div className="flex flex-col gap-4">
            <Window
              className="h-fit"
              isBackground
              toolbar={
                <div className="grid grid-cols-2 w-full">
                  <FileTab>DatePicker.tsx</FileTab>
                  <FileTab className="hidden lg:block">DatePicker.css</FileTab>
                </div>
              }>
              <div className="grid grid-cols-1 lg:grid-cols-2 bg-gray-50 dark:bg-zinc-800/80 dark:backdrop-saturate-200">
                <Scrollable className="rounded-bl-lg">
                  <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('styling')!.innerHTML}} />
                </Scrollable>
                <div className="flex flex-row px-3 lg:hidden bg-gray-200/80 backdrop-blur-md dark:bg-zinc-700/80 border-y border-gray-300 dark:border-zinc-700">
                  <FileTab>DatePicker.css</FileTab>
                </div>
                <Scrollable className="rounded-br-lg lg:border-l lg:border-l-gray-200 dark:border-l-zinc-600">
                  <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('css')!.innerHTML}} />
                </Scrollable>
              </div>
            </Window>
            <Window
              className="lg:absolute bottom-10 left-[16.5%] max-w-[350px] sm:w-[350px]"
              toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex items-center justify-center bg-gray-50 dark:bg-zinc-900 col-span-2 pt-12 pb-14 text-sm">
                <DatePicker label="Date Planted" />
              </div>
            </Window>
          </div>
        },
        {
          id: 'tailwind',
          label: 'Tailwind',
          content: <div className="flex flex-col lg:flex-row gap-4">
            <Window className="flex-1 bg-gray-50 dark:bg-zinc-800/80 dark:backdrop-saturate-200" isBackground toolbar={<FileTab>ComboBox.tsx</FileTab>}>
              <Scrollable className="rounded-b-lg">
                <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('tailwind')!.innerHTML}} />
              </Scrollable>
            </Window>
            <Window className=" max-w-[350px] sm:w-[350px]" toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex-1 flex flex-col w-full px-16 py-24 bg-gray-50 dark:bg-zinc-900">
                <ComboBox label="Assignee" items={people} defaultSelectedKey={1}>
                  {item => (
                    <ComboBoxItem textValue={item.name}>
                      <img alt="" src={item.avatar} className="w-6 h-6 rounded-full" />
                      <span className="truncate">{item.name}</span>
                    </ComboBoxItem>
                  )}
                </ComboBox>
              </div>
            </Window>
          </div>
        },
        {
          id: 'styled-components',
          label: 'Styled Components',
          content: <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Window isBackground toolbar={<FileTab>Slider.tsx</FileTab>} className="bg-gray-50 dark:bg-zinc-800/80 backdrop-saturate-200">
              <Scrollable className="rounded-b-lg">
                <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('styled-components')!.innerHTML}} />
              </Scrollable>
            </Window>
            <Window toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 py-20">
                <Slider label="Opacity" defaultValue={30} />
              </div>
            </Window>
          </div>
        },
        {
          id: 'panda',
          label: 'Panda',
          content: <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Window isBackground toolbar={<FileTab>Button.tsx</FileTab>} className="bg-gray-50 dark:bg-zinc-800/80 dark:backdrop-saturate-200">
              <Scrollable className="rounded-b-lg">
                <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('panda')!.innerHTML}} />
              </Scrollable>
            </Window>
            <Window toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-zinc-800 py-20">
                <Button className="bg-blue-600 text-white pressed:bg-blue-700 border border-white/10 rounded-lg px-4 py-2 cursor-default outline outline-0 focus-visible:outline-2 outline-blue-600 dark:outline-blue-500 outline-offset-2">
                  Initiate launch sequence…
                </Button>
              </div>
            </Window>
          </div>
        }
      ]} />
  );
}

interface TabOptions {
  id: string,
  label: string,
  content: React.ReactNode
}

function AnimatedTabs({tabs}: {tabs: TabOptions[]}) {
  let [selectedKey, setSelectedKey] = useState<Key>(tabs[0].id);

  let tabListRef = useRef<HTMLDivElement>(null);
  let tabPanelsRef = useRef<HTMLDivElement>(null);

  // Track the scroll position of the tab panel container.
  let {scrollXProgress} = useScroll({
    container: tabPanelsRef
  });

  // Find all the tab elements so we can use their dimensions.
  let [tabElements, setTabElements] = useState<HTMLElement[]>([]);
  useEffect(() => {
    if (tabElements.length === 0) {
      let tabs = tabListRef.current!.querySelectorAll<HTMLElement>('[role=tab]');
      setTabElements(Array.from(tabs));
    }
  }, [tabElements]);

  // This function determines which tab should be selected
  // based on the scroll position.
  let getIndex = useCallback(
    (x) => Math.max(0, Math.floor((tabElements.length - 1) * x)),
    [tabElements]
  );

  // This function transforms the scroll position into the X position
  // or width of the selected tab indicator.
  let transform = (x, property) => {
    if (!tabElements.length) {return 0;}

    // Find the tab index for the scroll X position.
    let index = getIndex(x);

    // Get the difference between this tab and the next one.
    let difference =
      index < tabElements.length - 1
        ? tabElements[index + 1][property] - tabElements[index][property]
        : tabElements[index].offsetWidth;

    // Get the percentage between tabs.
    // This is the difference between the integer index and fractional one.
    let percent = (tabElements.length - 1) * x - index;

    // Linearly interpolate to calculate the position of the selection indicator.
    let value = tabElements[index][property] + difference * percent;

    // iOS scrolls weird when translateX is 0 for some reason. 🤷‍♂️
    return value || 0.1;
  };

  let x = useTransform(scrollXProgress, (x) => transform(x, 'offsetLeft'));
  let width = useTransform(scrollXProgress, (x) => transform(x, 'offsetWidth'));

  // When the user scrolls, update the selected key
  // so that the correct tab panel becomes interactive.
  useMotionValueEvent(scrollXProgress, 'change', (x) => {
    if (animationRef.current || !tabElements.length) {return;}
    setSelectedKey(tabs[getIndex(x)].id);
  });

  // When the user clicks on a tab perform an animation of
  // the scroll position to the newly selected tab panel.
  let animationRef = useRef<AnimationPlaybackControls | null>(null);
  let shouldReduceMotion = useReducedMotion();
  let onSelectionChange = (selectedKey: Key) => {
    setSelectedKey(selectedKey);

    // If the scroll position is already moving but we aren't animating
    // then the key changed as a result of a user scrolling. Ignore.
    if (scrollXProgress.getVelocity() && !animationRef.current) {
      return;
    }

    let tabPanel = tabPanelsRef.current!;
    let index = tabs.findIndex((tab) => tab.id === selectedKey);
    let scrollLeft = tabPanel.scrollWidth * (index / tabs.length);
    if (shouldReduceMotion) {
      tabPanel.scrollLeft = scrollLeft;
      return;
    }

    animationRef.current?.stop();
    animationRef.current = animate(
      tabPanel.scrollLeft,
      scrollLeft,
      {
        type: 'spring',
        bounce: 0.2,
        duration: 0.6,
        onUpdate: (v) => {
          tabPanel.scrollLeft = v;
        },
        onPlay: () => {
          // Disable scroll snap while the animation is going or weird things happen.
          tabPanel.style.scrollSnapType = 'none';
        },
        onComplete: () => {
          tabPanel.style.scrollSnapType = '';
          animationRef.current = null;
        }
      }
    );
  };

  // Scroll selected tab into view.
  let tabListScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let tab = tabListRef.current!.querySelector(`[data-key="${selectedKey}"]`) as HTMLDivElement;
    if (tab) {
      let scroll = tabListScrollRef.current;
      // Would use scrollIntoView but it's broken in Chrome: https://github.com/facebook/react/issues/23396
      if (scroll && (tab.offsetLeft < scroll.scrollLeft || (tab.offsetLeft + tab.offsetWidth) > (scroll.offsetWidth + scroll.scrollLeft))) {
        scroll.scroll({
          left: tab.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedKey]);

  return (
    <Tabs
      className="-mx-8 md:-mx-2"
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}>
      <div className="relative overflow-x-auto no-scrollbar dark:isolate p-2 sm:-m-2" ref={tabListScrollRef}>
        <TabList ref={tabListRef} className="flex px-2 y-2 md:px-0" items={tabs}>
          {(tab) =>
            (<Tab className="shrink-0 cursor-default px-3 py-1.5 text-sm sm:text-base text-black dark:text-white transition outline outline-0 forced-colors:selected:text-[HighlightText]! forced-color-adjust-none">
              {({isSelected, isFocusVisible}) => (<>
                {tab.label}
                {isFocusVisible && isSelected && (
                  // Focus ring.
                  <motion.span
                    className="absolute inset-y-2 inset-x-0 z-10 rounded-full outline outline-2 outline-black dark:outline-white forced-colors:outline-[Highlight]! outline-offset-2"
                    style={{x, width}} />
                )}
              </>)}
            </Tab>)
          }
        </TabList>
        {/* Selection indicator. */}
        <motion.span
          className="absolute inset-y-2 inset-x-0 z-10 bg-white rounded-full mix-blend-difference forced-colors:bg-[Highlight] forced-colors:mix-blend-normal forced-colors:-z-10"
          style={{x, width}} />
      </div>
      <div
        ref={tabPanelsRef}
        className="relative pt-10 pb-10 overflow-auto snap-x snap-mandatory no-scrollbar flex edge-mask">
        <Collection items={tabs}>
          {(tab) => (
            <TabPanel
              shouldForceMount
              className="shrink-0 w-full px-4 box-border snap-start snap-always outline outline-0 -outline-offset-2 rounded-sm focus-visible:outline-black">
              {tab.content}
            </TabPanel>
          )}
        </Collection>
      </div>
    </Tabs>
  );
}

const people = [
  {
    id: 1,
    avatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Gilberto Miguel',
    username: '@gilberto_miguel'
  },
  {
    id: 2,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Maia Pettegree',
    username: '@mpettegree'
  },
  {
    id: 3,
    avatar:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Wade Redington',
    username: '@redington'
  },
  {
    id: 4,
    avatar:
      'https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Kurtis Gurrado',
    username: '@kurtis'
  },
  {
    id: 5,
    avatar:
      'https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Sonja Balmann',
    username: '@sbalmann'
  },
  {
    id: 6,
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    name: 'Brent Mickelwright',
    username: '@brent_m'
  },
  {
    id: 7,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    name: 'Charles Webb',
    username: '@cwebb'
  }
];
