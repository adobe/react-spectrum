import {AddressBar, FileTab, Window} from './components';
import {animate, motion, useMotionValueEvent, useScroll, useTransform} from 'framer-motion';
import {
  Button,
  Collection,
  ComboBox,
  Group,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Tab,
  TabList,
  TabPanel,
  Tabs
} from 'react-aria-components';
import {CheckIcon, ChevronDown, ChevronsUpDownIcon} from 'lucide-react';
import React, {useCallback, useEffect, useRef, useState} from 'react';

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
                  <FileTab>ComboBox.tsx</FileTab>
                  <FileTab className="hidden lg:block">ComboBox.css</FileTab>
                </div>
              }>
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('styling')!.innerHTML}} />
                <div className="flex flex-row px-3 pt-2.5 lg:hidden bg-gray-200/80 backdrop-blur-md dark:bg-gray-800 border-y border-gray-300">
                  <FileTab>ComboBox.css</FileTab>
                </div>
                <div className="contents [&>*]:border-l" dangerouslySetInnerHTML={{__html: document.getElementById('css')!.innerHTML}} />
              </div>
            </Window>
            <Window
              className="lg:absolute bottom-10 left-16 w-[350px]"
              toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex items-center justify-center bg-gray-50 col-span-2 p-14 text-sm">
                <ComboBox>
                  <Label>Favorite Animal</Label>
                  <div>
                    <Input />
                    <Button><ChevronDown /></Button>
                  </div>
                  <Popover>
                    <ListBox>
                      <ListBoxItem>Aardvark</ListBoxItem>
                      <ListBoxItem>Cat</ListBoxItem>
                      <ListBoxItem>Dog</ListBoxItem>
                      <ListBoxItem>Kangaroo</ListBoxItem>
                      <ListBoxItem>Panda</ListBoxItem>
                      <ListBoxItem>Snake</ListBoxItem>
                    </ListBox>
                  </Popover>
                </ComboBox>
              </div>
            </Window>
          </div>
        },
        {
          id: 'tailwind',
          label: 'Tailwind',
          content: <div className="flex flex-col lg:flex-row gap-4">
            <Window className="flex-1" isBackground toolbar={<FileTab>ComboBox.tsx</FileTab>}>
              <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('tailwind')!.innerHTML}} />
            </Window>
            <Window className="w-[350px] h-[320px] place-self-center" toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-sky-300 to-cyan-300">
                <ComboBox className="group flex flex-col gap-1 w-[200px]">
                  <Label className="text-black cursor-default text-sm">Assignee</Label>
                  <Group className="flex rounded-lg bg-white bg-opacity-90 focus-within:bg-opacity-100 transition shadow-md ring-1 ring-black/10 focus-visible:ring-2 focus-visible:ring-black">
                    <Input className="flex-1 w-full border-none py-2 px-3 leading-5 text-gray-900 bg-transparent outline-none text-sm" />
                    <Button className="px-2.5 flex items-center transition border-0 border-solid border-l border-l-sky-200 bg-transparent rounded-r-lg pressed:bg-sky-100 cursor-default">
                      <ChevronsUpDownIcon className="w-4 h-4 text-gray-700" />
                    </Button>
                  </Group>
                  <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 entering:animate-in entering:fade-in exiting:animate-out exiting:fade-out">
                    <ListBox className="outline-none p-1" items={people}>
                      {item => (
                        <ListBoxItem
                          textValue={item.name}
                          className="group flex items-center gap-2 cursor-default select-none py-1.5 px-2 outline-none rounded text-gray-900 text-sm focus:bg-sky-600 focus:text-white">
                          {({isSelected}) => (<>
                            <span className="flex-1 flex items-center gap-3 truncate font-normal group-selected:font-semibold">
                              <img alt="" src={item.avatar} className="w-6 h-6 rounded-full" />
                              <span className="truncate">{item.name}</span>
                            </span>
                            {isSelected &&
                              <span className="w-4 flex items-center text-sky-600 group-focus:text-white">
                                <CheckIcon className="w-4 h-4" />
                              </span>
                            }
                          </>)}
                        </ListBoxItem>
                      )}
                    </ListBox>
                  </Popover>
                </ComboBox>
              </div>
            </Window>
          </div>
        },
        {
          id: 'styled-components',
          label: 'Styled Components',
          content: <div className="grid grid-cols-2 gap-4">
            <Window isBackground toolbar={<FileTab>ComboBox.tsx</FileTab>}>
              <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('styled-components')!.innerHTML}} />
            </Window>
            <Window toolbar={<AddressBar>https://your-app.com</AddressBar>}>
              <div className="flex-1 flex items-center justify-center bg-gray-50 p-5">
                <Button>Hello world!</Button>
              </div>
            </Window>
          </div>
        },
        {id: 'vanilla-extract', label: 'Vanilla Extract', content: ''}
      ]} />
  );
}

interface TabOptions {
  id: string,
  label: string,
  content: React.ReactNode
}

function AnimatedTabs({tabs}: {tabs: TabOptions[]}) {
  let [selectedKey, setSelectedKey] = useState(tabs[0].id);

  let tabListRef = useRef(null);
  let tabPanelsRef = useRef(null);

  // Track the scroll position of the tab panel container.
  let {scrollXProgress} = useScroll({
    container: tabPanelsRef
  });

  // Find all the tab elements so we can use their dimensions.
  let [tabElements, setTabElements] = useState([]);
  useEffect(() => {
    if (tabElements.length === 0) {
      let tabs = tabListRef.current!.querySelectorAll('[role=tab]');
      setTabElements(tabs);
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
  let animationRef = useRef(null);
  let onSelectionChange = (selectedKey) => {
    setSelectedKey(selectedKey);

    // If the scroll position is already moving but we aren't animating
    // then the key changed as a result of a user scrolling. Ignore.
    if (scrollXProgress.getVelocity() && !animationRef.current) {
      return;
    }

    let tabPanel = tabPanelsRef.current;
    let index = tabs.findIndex((tab) => tab.id === selectedKey);
    animationRef.current?.stop();
    animationRef.current = animate(
      tabPanel.scrollLeft,
      tabPanel.scrollWidth * (index / tabs.length),
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
    let tab = tabListRef.current!.querySelector(`[data-key="${selectedKey}"]`);
    if (tab) {
      let scroll = tabListScrollRef.current;
      // Would use scrollIntoView but it's broken in Chrome: https://github.com/facebook/react/issues/23396
      if (tab.offsetLeft < scroll.scrollLeft || (tab.offsetLeft + tab.offsetWidth) > (scroll.offsetWidth + scroll.scrollLeft)) {
        tabListScrollRef.current.scroll({
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
      <div className="relative overflow-x-auto no-scrollbar p-2 -m-2" ref={tabListScrollRef}>
        <TabList ref={tabListRef} className="flex px-2 y-2 md:px-0" items={tabs}>
          {(tab) =>
            (<Tab className="flex-shrink-0 cursor-default px-3 py-1.5 text-sm sm:text-base text-black dark:text-white transition outline-none">
              {({isSelected, isFocusVisible}) => (<>
                {tab.label}
                {isFocusVisible && isSelected && (
                  // Focus ring.
                  <motion.span
                    className="absolute inset-y-2 inset-x-0 z-10 rounded-full ring-2 ring-black ring-offset-2"
                    style={{x, width}} />
                )}
              </>)}
            </Tab>)
          }
        </TabList>
        {/* Selection indicator. */}
        <motion.span
          className="absolute inset-y-2 inset-x-0 z-10 bg-white rounded-full mix-blend-difference"
          style={{x, width}} />
      </div>
      <div
        ref={tabPanelsRef}
        className="relative pt-10 pb-10 overflow-auto snap-x snap-mandatory no-scrollbar flex edge-mask">
        <Collection items={tabs}>
          {(tab) => (
            <TabPanel
              shouldForceMount
              className="flex-shrink-0 w-full px-4 box-border snap-start snap-always outline-none -outline-offset-2 rounded focus-visible:outline-black">
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
