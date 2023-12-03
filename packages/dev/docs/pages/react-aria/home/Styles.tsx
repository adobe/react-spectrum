import React from 'react';
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Collection
} from "react-aria-components";
import { motion, animate, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {Button} from 'react-aria-components';

export function Styles() {
  return (
    <AnimatedTabs
      tabs={[
        {
          id: "css",
          label: "Vanilla CSS",
          content: <div className="grid grid-cols-3 gap-4">
            <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('css')!.innerHTML}} />
            <div className="flex items-center justify-center bg-gray-50 border rounded-xl p-5">
              <Button>Hello world!</Button>
            </div>
          </div>
        },
        {
          id: "tailwind",
          label: "Tailwind",
          content: <div className="grid grid-cols-2 gap-4">
            <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('tailwind')!.innerHTML}} />
            <div className="flex items-center justify-center bg-gray-50 border rounded-xl p-5">
              <Button>Hello world!</Button>
            </div>
          </div>
        },
        {
          id: "styled-components",
          label: "Styled Components",
          content: <div className="grid grid-cols-2 gap-4">
            <div className="contents" dangerouslySetInnerHTML={{__html: document.getElementById('styled-components')!.innerHTML}} />
            <div className="flex items-center justify-center bg-gray-50 border rounded-xl p-5">
              <Button>Hello world!</Button>
            </div>
          </div>
        },
        { id: "vanilla-extract", label: "Vanilla Extract" }
      ]} />
  );
}

function AnimatedTabs({tabs}) {
  let [selectedKey, setSelectedKey] = useState(tabs[0].id);

  let tabListRef = useRef(null);
  let tabPanelsRef = useRef(null);

  // Track the scroll position of the tab panel container.
  let { scrollXProgress } = useScroll({
    container: tabPanelsRef
  });

  // Find all the tab elements so we can use their dimensions.
  let [tabElements, setTabElements] = useState([]);
  useEffect(() => {
    if (tabElements.length === 0) {
      let tabs = tabListRef.current!.querySelectorAll("[role=tab]");
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
    if (!tabElements.length) return 0;

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

  let x = useTransform(scrollXProgress, (x) => transform(x, "offsetLeft"));
  let width = useTransform(scrollXProgress, (x) => transform(x, "offsetWidth"));

  // When the user scrolls, update the selected key
  // so that the correct tab panel becomes interactive.
  useMotionValueEvent(scrollXProgress, "change", (x) => {
    if (animationRef.current || !tabElements.length) return;
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
        type: "spring",
        bounce: 0.2,
        duration: 0.6,
        onUpdate: (v) => {
          tabPanel.scrollLeft = v;
        },
        onPlay: () => {
          // Disable scroll snap while the animation is going or weird things happen.
          tabPanel.style.scrollSnapType = "none";
        },
        onComplete: () => {
          tabPanel.style.scrollSnapType = "";
          animationRef.current = null;
        }
      }
    );
  };

  return (
    <Tabs
      className="w-fit"
      selectedKey={selectedKey}
      onSelectionChange={onSelectionChange}>
      <div className="relative">
        <TabList ref={tabListRef} className="flex -mx-1" items={tabs}>
          {(tab) =>
            <Tab className="cursor-default px-3 py-1.5 text-md transition outline-none touch-none">
              {({ isSelected, isFocusVisible }) => <>
                {tab.label}
                {isFocusVisible && isSelected && (
                  // Focus ring.
                  <motion.span
                    className="absolute inset-0 z-10 rounded-full ring-2 ring-black ring-offset-2"
                    style={{ x, width }}
                  />
                )}
              </>}
            </Tab>
          }
        </TabList>
        {/* Selection indicator. */}
        <motion.span
          className="absolute inset-0 z-10 bg-white rounded-full mix-blend-difference"
          style={{ x, width }} />
      </div>
      <div
        ref={tabPanelsRef}
        className="my-4 overflow-auto snap-x snap-mandatory no-scrollbar flex"
        style={{
          maskImage: 'linear-gradient(to right, transparent, white 8px calc(100% - 8px), transparent)'
        }}>
        <Collection items={tabs}>
          {(tab) => (
            <TabPanel
              shouldForceMount
              className="flex-shrink-0 w-full px-2 box-border snap-start outline-none -outline-offset-2 rounded focus-visible:outline-black">
              {tab.content}
            </TabPanel>
          )}
        </Collection>
      </div>
    </Tabs>
  );
}
