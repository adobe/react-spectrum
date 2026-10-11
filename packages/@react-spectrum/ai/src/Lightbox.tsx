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

import {focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  Tab as RACTab,
  TabList as RACTabList,
  TabPanel as RACTabPanel,
  TabPanels as RACTabPanels,
  Tabs as RACTabs,
  TabListProps,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsProps,
  TabListStateContext
} from 'react-aria-components/Tabs';
import {Button} from 'react-aria-components/Button';
import {useContext, useState} from 'react';

export type LightboxCarouselProps = Omit<TabsProps, 'className'>;
export type LightboxPickerProps<T> = Omit<TabListProps<T>, 'className'>;
export type LightboxPickerItemProps = Omit<TabProps, 'className' | 'children'>;
export type LightboxItemsProps<T> = Omit<TabPanelsProps<T>, 'className'>;
export type LightboxItemProps = Omit<TabPanelProps, 'className'>;

const carouselStyles = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      horizontal: 'column',
      vertical: 'row'
    }
  },
  gap: 16,
  minWidth: 0,
  width: 'full'
});

const pickerStyles = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      horizontal: 'row',
      vertical: 'column'
    }
  },
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4
});

const pickerItemStyles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 32,
  minHeight: 32,
  borderRadius: 'full',
  cursor: 'default'
});

const pickerDotStyles = style({
  size: 8,
  flexShrink: 0,
  borderRadius: 'full',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'gray-600',
  backgroundColor: {
    default: 'gray-300',
    isSelected: 'gray-900'
  }
});

const itemsStyles = style({
  minWidth: 0,
  width: 'full'
});

const itemStyles = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 0,
  width: 'full'
});

export function LightboxCarousel(props: LightboxCarouselProps) {
  // let [item, setItem] = useState();
  // let prevItem = () => (
  //   setItem()
  // );

  // let state = useContext(TabListStateContext)!;
  // console.log(state);
  return <RACTabs {...props} className={renderProps => carouselStyles(renderProps)} />;
}

export function LightboxPicker<T>(props: LightboxPickerProps<T>) {
  let state = useContext(TabListStateContext)!;
  console.log(state);
  return <RACTabList {...props} className={renderProps => pickerStyles(renderProps)} />;
}

export function LightboxPickerItem(props: LightboxPickerItemProps) {
  return (
    <RACTab {...props} className={renderProps => pickerItemStyles(renderProps)}>
      {renderProps => <span aria-hidden="true" className={pickerDotStyles(renderProps)} />}
    </RACTab>
  );
}

export function LightboxItems<T>(props: LightboxItemsProps<T>) {
  let state = useContext(TabListStateContext)!;
  // console.log(state);
  return (
    <div className={style({display: 'flex'})}>
      <Button>Prev</Button>
      <RACTabPanels {...props} className={itemsStyles} />
      <Button>Next</Button>
    </div>
  );

}

export function LightboxItem(props: LightboxItemProps) {
  return (
    <RACTabPanel {...props} className={renderProps => itemStyles(renderProps)} />
  );
}
