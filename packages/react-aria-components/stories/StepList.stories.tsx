/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from 'storybook/actions';
import {
  Check,
  ClipboardList,
  GitCompareArrows,
  Hammer,
  LucideIcon,
  Rocket,
  ShieldCheck
} from 'lucide-react';
import {Link} from '../src/Link';
import {Meta, StoryObj} from '@storybook/react';
import React, {useCallback, useMemo, useState} from 'react';
import {Router, Link as RouterLink} from '../../dev/s2-docs/pages/react-aria/Router';
import {RouterProvider} from 'react-aria/private/utils/openLink';
import {Step, StepListTabList, StepListTabs, StepPanel, StepPanels} from '../src/StepListTabs';
import {StepList, StepListItem} from '../src/StepList';
// Reuse the same fake documentation router that NavigationTree.mdx uses.
import styles from './styles.css';
import {Text} from '../src/Text';

export default {
  title: 'React Aria Components/StepList',
  component: StepList,
  args: {
    onSelectionChange: action('onSelectionChange'),
    onLastCompletedStepChange: action('onLastCompletedStepChange')
  },
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    isReadOnly: {
      control: 'boolean'
    },
    onLastCompletedStepChange: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    orientation: {
      control: {
        type: 'inline-radio',
        options: ['horizontal', 'vertical']
      }
    }
  }
} as Meta<typeof StepList>;

export type StepListStory = StoryObj<typeof StepList>;

export const StepListExample: StepListStory = {
  render: (args: any) => (
    <StepList {...args}>
      <StepListItem>
        <Text>Home</Text>
      </StepListItem>
      <StepListItem>
        <Text>React Aria</Text>
      </StepListItem>
      <StepListItem>
        <Text>StepList</Text>
      </StepListItem>
    </StepList>
  )
};

interface ItemValue {
  id: string;
  url: string;
}
let items: Array<ItemValue> = [
  {id: 'Home', url: '/'},
  {id: 'React Aria', url: '/react-aria'},
  {id: 'StepList', url: '/react-aria/StepList'}
];

function InteractiveStepList(args: any) {
  const keys = useMemo(() => (args.items || []).map(o => o.id), [args.items]);
  let [stepNumber, setStepNumber] = useState(
    () => keys.indexOf(args.selectedKey || args.defaultSelectedKey) + 1
  );

  const selectedKey = useMemo(() => {
    return keys[stepNumber - 1];
  }, [keys, stepNumber]);

  const handleSelectionChange = useCallback(
    key => {
      setStepNumber(keys.indexOf(key) + 1);
      args.onSelectionChange(key);
    },
    [keys, args]
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
      <StepList {...args} onSelectionChange={handleSelectionChange} selectedKey={selectedKey} />
      <div>
        <button onClick={() => setStepNumber(Math.max(stepNumber - 1, 1))}>Prev</button>
        <button onClick={() => setStepNumber(Math.min(stepNumber + 1, keys.length))}>Next</button>
      </div>
    </div>
  );
}

export const DynamicStepListExample: StepListStory = {
  render: (args: any) => (
    <InteractiveStepList {...args} items={items}>
      {(item: ItemValue) => (
        <StepListItem id={item.id}>
          <Text>{item.id}</Text>
        </StepListItem>
      )}
    </InteractiveStepList>
  )
};

interface CoworkerItemValue {
  id: string;
  url: string;
  title: string;
  stage: number;
  Icon: LucideIcon;
}

let coworkerItems: Array<CoworkerItemValue> = [
  {id: 'plan', url: '/plan', title: 'Plan', stage: 1, Icon: ClipboardList},
  {id: 'build', url: '/build', title: 'Build', stage: 2, Icon: Hammer},
  {
    id: 'governance',
    url: '/governance',
    title: 'Governance review',
    stage: 3,
    Icon: GitCompareArrows
  },
  {id: 'launch', url: '/launch', title: 'Launch', stage: 4, Icon: ShieldCheck},
  {id: 'monitor', url: '/monitor', title: 'Monitor', stage: 5, Icon: Rocket}
];

// Translate the router's selected route into the id of the matching step so it can
// drive the StepList's `selectedKey`.
function routeToId(route: string): string {
  return coworkerItems.find(item => item.url === route)?.id ?? coworkerItems[0].id;
}

export const CoworkerStepListExample: StepListStory = {
  render: (args: any) => (
    <Router defaultSelectedRoute="/governance">
      {({selectedRoute}) => {
        let currentIndex = coworkerItems.findIndex(item => item.url === selectedRoute);
        let prevItem = coworkerItems[Math.max(currentIndex - 1, 0)];
        let nextItem = coworkerItems[Math.min(currentIndex + 1, coworkerItems.length - 1)];
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <div className={styles['coworker-StepList-wrapper']}>
              <StepList
                {...args}
                items={coworkerItems}
                selectedKey={routeToId(selectedRoute)}
                className={styles['coworker-StepList']}>
                {(item: CoworkerItemValue) => {
                  let Icon = item.Icon;
                  return (
                    <StepListItem
                      id={item.id}
                      className={styles['coworker-StepListItem']}
                      href={item.url}>
                      <Link
                        className={styles['coworker-StepListItem-link']}
                        render={props => <RouterLink {...props} />}>
                        <span className={styles['coworker-StepListItem-marker']} aria-hidden="true">
                          <span className={styles['coworker-StepListItem-icon']}>
                            <Icon size={16} strokeWidth={2} />
                          </span>
                          <span className={styles['coworker-StepListItem-check']}>
                            <Check size={16} strokeWidth={3} />
                          </span>
                        </span>
                        <span className={styles['coworker-StepListItem-labels']}>
                          <Text className={styles['coworker-StepListItem-title']}>
                            {item.title}
                          </Text>
                          <span
                            className={
                              styles['coworker-StepListItem-stage']
                            }>{`Stage ${item.stage}`}</span>
                        </span>
                      </Link>
                    </StepListItem>
                  );
                }}
              </StepList>
            </div>
            {/* Upcoming steps aren't selectable via click, so forward navigation goes through
                the router as well — updating the route drives the controlled selectedKey. */}
            <div style={{display: 'flex', gap: '12px'}}>
              <RouterLink href={prevItem.url}>Prev</RouterLink>
              <RouterLink href={nextItem.url}>Next</RouterLink>
            </div>
          </div>
        );
      }}
    </Router>
  ),
  parameters: {
    description:
      'A StepList component for navigating through steps, based on NavigationTree with links. Follows https://www.w3.org/WAI/tutorials/forms/multi-page/#using-step-by-step-indicator mostly.'
  }
};

interface TabStepItem {
  id: string;
  title: string;
  stage: number;
  Icon: LucideIcon;
}

let tabStepItems: Array<TabStepItem> = [
  {id: 'plan', title: 'Plan', stage: 1, Icon: ClipboardList},
  {id: 'build', title: 'Build', stage: 2, Icon: Hammer},
  {id: 'governance', title: 'Governance review', stage: 3, Icon: GitCompareArrows},
  {id: 'launch', title: 'Launch', stage: 4, Icon: ShieldCheck},
  {id: 'monitor', title: 'Monitor', stage: 5, Icon: Rocket}
];

// The chevron marker/labels for a single step. Completed steps swap the icon for a check
// via the [data-completed] hook that StepListTabs sets on each step's content.
function TabStepContent({item}: {item: TabStepItem}) {
  let Icon = item.Icon;
  return (
    <>
      <span className={styles['coworker-StepListTab-marker']} aria-hidden="true">
        <span className={styles['coworker-StepListTab-icon']}>
          <Icon size={16} strokeWidth={2} />
        </span>
        <span className={styles['coworker-StepListTab-check']}>
          <Check size={16} strokeWidth={3} />
        </span>
      </span>
      <span className={styles['coworker-StepListTab-labels']}>
        <span className={styles['coworker-StepListTab-title']}>{item.title}</span>
        <span className={styles['coworker-StepListTab-stage']}>{`Stage ${item.stage}`}</span>
      </span>
    </>
  );
}

// Static children variant.
export const TabBasedStepList: StepListStory = {
  render: (args: any) => (
    <div className={styles['coworker-StepListTabs']}>
      <StepListTabs {...args} defaultSelectedKey="governance">
        <div className={styles['coworker-StepListTabList-wrapper']}>
          <StepListTabList
            aria-label="Coworker steps"
            className={styles['coworker-StepListTabList']}>
            {tabStepItems.map(item => (
              <Step key={item.id} id={item.id}>
                <TabStepContent item={item} />
              </Step>
            ))}
          </StepListTabList>
        </div>
        <StepPanels>
          {tabStepItems.map(item => (
            <StepPanel key={item.id} id={item.id} className={styles['coworker-StepListTabPanel']}>
              {`${item.title} — stage ${item.stage} content`}
            </StepPanel>
          ))}
        </StepPanels>
      </StepListTabs>
    </div>
  )
};

// Dynamic items variant. Upcoming steps aren't clickable, so forward navigation is driven
// externally via the controlled selectedKey (Prev/Next), mirroring the other StepList stories.
function InteractiveStepListTabs(args: any) {
  const keys = useMemo(() => tabStepItems.map(o => o.id), []);
  let [stepNumber, setStepNumber] = useState(
    () => Math.max(keys.indexOf(args.defaultSelectedKey), 0) + 1
  );
  const selectedKey = keys[stepNumber - 1];

  const handleSelectionChange = useCallback(
    (key: string) => {
      setStepNumber(keys.indexOf(key) + 1);
      args.onSelectionChange?.(key);
    },
    [keys, args]
  );

  return (
    <div className={styles['coworker-StepListTabs']}>
      <StepListTabs {...args} selectedKey={selectedKey} onSelectionChange={handleSelectionChange}>
        <div className={styles['coworker-StepListTabList-wrapper']}>
          <StepListTabList
            aria-label="Coworker steps"
            items={tabStepItems}
            className={styles['coworker-StepListTabList']}>
            {(item: TabStepItem) => (
              <Step id={item.id}>
                <TabStepContent item={item} />
              </Step>
            )}
          </StepListTabList>
        </div>
        <StepPanels items={tabStepItems}>
          {(item: TabStepItem) => (
            <StepPanel id={item.id} className={styles['coworker-StepListTabPanel']}>
              {`${item.title} — stage ${item.stage} content`}
            </StepPanel>
          )}
        </StepPanels>
      </StepListTabs>
      <div style={{display: 'flex', gap: '12px'}}>
        <button onClick={() => setStepNumber(Math.max(stepNumber - 1, 1))}>Prev</button>
        <button onClick={() => setStepNumber(Math.min(stepNumber + 1, keys.length))}>Next</button>
      </div>
    </div>
  );
}

export const DynamicTabBasedStepList: StepListStory = {
  render: (args: any) => <InteractiveStepListTabs {...args} defaultSelectedKey="plan" />
};

// Router-driven variant: each step is a link (href)
interface RouterStepItem extends TabStepItem {
  url: string;
}

let routerStepItems: Array<RouterStepItem> = tabStepItems.map(item => ({
  ...item,
  url: `/${item.id}`
}));

function RouterStepListTabs(args: any) {
  let [url, setUrl] = useState('/governance');
  let currentIndex = routerStepItems.findIndex(item => item.url === url);
  let prevUrl = routerStepItems[Math.max(currentIndex - 1, 0)].url;
  let nextUrl = routerStepItems[Math.min(currentIndex + 1, routerStepItems.length - 1)].url;

  return (
    <RouterProvider navigate={setUrl}>
      <div className={styles['coworker-StepListTabs']}>
        <StepListTabs {...args} selectedKey={url}>
          <div className={styles['coworker-StepListTabList-wrapper']}>
            <StepListTabList
              aria-label="Coworker steps"
              items={routerStepItems}
              className={styles['coworker-StepListTabList']}>
              {(item: RouterStepItem) => (
                <Step id={item.url} href={item.url}>
                  <TabStepContent item={item} />
                </Step>
              )}
            </StepListTabList>
          </div>
          <StepPanels items={routerStepItems}>
            {(item: RouterStepItem) => (
              <StepPanel id={item.url} className={styles['coworker-StepListTabPanel']}>
                {`${item.title} — stage ${item.stage} content`}
              </StepPanel>
            )}
          </StepPanels>
        </StepListTabs>
        <div style={{display: 'flex', gap: '12px'}}>
          <Link href={prevUrl}>Prev</Link>
          <Link href={nextUrl}>Next</Link>
        </div>
      </div>
    </RouterProvider>
  );
}

export const RouterTabBasedStepList: StepListStory = {
  render: (args: any) => <RouterStepListTabs {...args} />
};
