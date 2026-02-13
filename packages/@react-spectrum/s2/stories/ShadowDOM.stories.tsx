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

import '@react-spectrum/s2/page.css';

import {
  Accordion,
  AccordionItem,
  AccordionItemPanel,
  AccordionItemTitle,
  ActionBar,
  ActionButton,
  ActionButtonGroup,
  ActionMenu,
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  CardPreview,
  CardView,
  Cell,
  Checkbox,
  CheckboxGroup,
  Collection,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorWheel,
  Column,
  ComboBox,
  ComboBoxItem,
  Content,
  DatePicker,
  DateRangePicker,
  Dialog,
  DialogTrigger,
  Disclosure,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle,
  Divider,
  DropZone,
  Footer,
  Form,
  Header,
  Heading,
  IllustratedMessage,
  Image,
  InlineAlert,
  Link,
  Menu,
  MenuItem,
  MenuTrigger,
  Meter,
  NumberField,
  Picker,
  PickerItem,
  ProgressBar,
  ProgressCircle,
  Provider,
  Radio,
  RadioGroup,
  RangeCalendar,
  RangeSlider,
  Row,
  SearchField,
  SegmentedControl,
  SegmentedControlItem,
  SelectBox,
  SelectBoxGroup,
  Skeleton,
  SkeletonCollection,
  Slider,
  StatusLight,
  SubmenuTrigger,
  Switch,
  Tab,
  TableBody,
  TableHeader,
  TableView,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TagGroup,
  Text,
  TextField,
  TimeField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  TooltipTrigger,
  TreeView,
  TreeViewItem,
  TreeViewItemContent,
  useAsyncList
} from '../src';
import {action} from '@storybook/addon-actions';
import AlertNotice from '../spectrum-illustrations/linear/AlertNotice';
import {CardViewProps} from '@react-types/card';
import {createRoot} from 'react-dom/client';
import {enableShadowDOM} from '@react-stately/flags';
import type {Meta, StoryObj} from '@storybook/react';
import PaperAirplane from '../spectrum-illustrations/linear/Paperairplane';
import Server from '../spectrum-illustrations/linear/Server';
import StarFilled1 from '../spectrum-illustrations/linear/Star';
import {style} from '../style' with {type: 'macro'};
import {UNSAFE_PortalProvider} from 'react-aria';
import {useEffect, useRef} from 'react';

enableShadowDOM();

const meta: Meta<any> = {
  title: 'ShadowDOM'
};

export default meta;

function ShadowDOMMenuContent() {
  const hostRef = useRef<HTMLDivElement>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const shadowRoot = host.attachShadow({mode: 'open'});

    // So S2 theme variables apply: :host in the copied CSS targets the shadow host.
    const scheme = document.documentElement.getAttribute('data-color-scheme');
    if (scheme) {
      host.setAttribute('data-color-scheme', scheme);
    }

    // Copy all styles from the document into the shadow root so S2 (and Storybook) styles apply.
    // Shadow DOM does not inherit styles; we must duplicate every stylesheet.
    const styleRoot = document.createElement('div');
    styleRoot.setAttribute('data-shadow-styles', '');
    for (const node of document.head.children) {
      if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
        const link = node as HTMLLinkElement;
        const clone = document.createElement('link');
        clone.rel = 'stylesheet';
        clone.href = link.href;
        styleRoot.appendChild(clone);
      } else if (node.tagName === 'STYLE') {
        const style = node as HTMLStyleElement;
        const clone = style.cloneNode(true) as HTMLStyleElement;
        styleRoot.appendChild(clone);
      }
    }
    shadowRoot.appendChild(styleRoot);

    const appContainer = document.createElement('div');
    appContainer.id = 'shadow-app';
    shadowRoot.appendChild(appContainer);

    const portalContainer = document.createElement('div');
    portalContainer.id = 'shadow-portal';
    shadowRoot.appendChild(portalContainer);
    portalContainerRef.current = portalContainer;

    const root = createRoot(appContainer);
    rootRef.current = root;
    root.render(
      <Provider colorScheme="dark">
        <UNSAFE_PortalProvider getContainer={() => portalContainerRef.current}>
          <div
            className={style({
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              padding: 16,
              overflow: 'auto'
            })}>
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Buttons &amp; actions</h2>
            <section className={style({display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'start'})}>
              <Button onPress={action('button')}>Button</Button>
              <Link href="#" isStandalone>Link</Link>
              <ButtonGroup>
                <Button>One</Button>
                <Button>Two</Button>
                <Button>Three</Button>
              </ButtonGroup>
              <ActionButton onPress={action('action button')}>Action</ActionButton>
              <ActionButtonGroup>
                <ActionButton>Copy</ActionButton>
                <ActionButton>Paste</ActionButton>
              </ActionButtonGroup>
              <ToggleButton>Toggle</ToggleButton>
              <ToggleButtonGroup selectionMode="single">
                <ToggleButton id="left">Left</ToggleButton>
                <ToggleButton id="center">Center</ToggleButton>
                <ToggleButton id="right">Right</ToggleButton>
              </ToggleButtonGroup>
              <ActionMenu onAction={action('action menu action')}>
                <MenuItem id="edit">Edit</MenuItem>
                <MenuItem id="duplicate">Duplicate</MenuItem>
                <MenuItem id="delete">Delete</MenuItem>
              </ActionMenu>
              <MenuTrigger>
                <Button aria-label="Open menu">Menu</Button>
                <Menu onAction={action('menu action')}>
                  <MenuItem id="edit">Edit</MenuItem>
                  <SubmenuTrigger>
                    <MenuItem id="dup">Duplicate</MenuItem>
                    <Menu onAction={action('submenu action')}>
                      <MenuItem id="in-place">In place</MenuItem>
                      <MenuItem id="elsewhere">Elsewhere</MenuItem>
                    </Menu>
                  </SubmenuTrigger>
                  <MenuItem id="delete">Delete</MenuItem>
                </Menu>
              </MenuTrigger>
              <DialogTrigger>
                <Button>Dialog</Button>
                <Dialog>
                  {({close}) => (
                    <>
                      <Image slot="hero" src="https://i.imgur.com/Z7AzH2c.png" alt="Sky over roof" />
                      <Heading slot="title">Dialog title</Heading>
                      <Header>Header</Header>
                      <Content>
                        {[...Array(3)].map((_, i) =>
                          <p key={i} style={{marginTop: i === 0 ? 0 : undefined, marginBottom: i === 3 - 1 ? 0 : undefined}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
                        )}
                      </Content>
                      <Footer><Checkbox>Don't show this again</Checkbox></Footer>
                      <ButtonGroup>
                        <Button onPress={close} variant="secondary">Cancel</Button>
                        <Button onPress={close} variant="accent">Save</Button>
                      </ButtonGroup>
                    </>
                  )}
                </Dialog>
              </DialogTrigger>
              <DialogTrigger>
                <Button>Alert</Button>
                <AlertDialog title="Confirm" primaryActionLabel="OK" cancelLabel="Cancel" onPrimaryAction={action('alert confirm')}>
                  Are you sure?
                </AlertDialog>
              </DialogTrigger>
            </section>
            <Divider />
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Form controls</h2>
            <section className={style({display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'})}>
              <TextField label="Name" placeholder="Enter name" />
              <SearchField label="Search" placeholder="Search" />
              <NumberField label="Quantity" defaultValue={5} />
              <TimeField label="Time" />
              <DatePicker label="Date" />
              <DateRangePicker label="Date range" />
              <RangeCalendar aria-label="Date range" />
              <Checkbox onChange={action('checkbox')}>Checkbox</Checkbox>
              <CheckboxGroup label="Options">
                <Checkbox value="a">A</Checkbox>
                <Checkbox value="b">B</Checkbox>
              </CheckboxGroup>
              <Switch onChange={action('switch')}>Switch</Switch>
              <RadioGroup label="Choice" onChange={action('radio')}>
                <Radio value="one">One</Radio>
                <Radio value="two">Two</Radio>
              </RadioGroup>
              <Slider label="Volume" defaultValue={50} />
              <RangeSlider label="Range" defaultValue={{start: 20, end: 80}} />
              <ComboBox label="Flavors" onSelectionChange={action('combobox selection')}>
                <ComboBoxItem>Chocolate</ComboBoxItem>
                <ComboBoxItem>Mint</ComboBoxItem>
                <ComboBoxItem>Vanilla</ComboBoxItem>
              </ComboBox>
              <Picker label="Pick" onChange={action('picker selection')}>
                <PickerItem>Chocolate</PickerItem>
                <PickerItem>Mint</PickerItem>
                <PickerItem>Vanilla</PickerItem>
              </Picker>
              <SelectBoxGroup aria-label="Select" selectionMode="single" styles={style({width: 410})}>
                <SelectBox id="aws" textValue="Amazon Web Services">
                  <Server />
                  <Text slot="label">Amazon Web Services</Text>
                  <Text slot="description">Reliable cloud infrastructure</Text>
                </SelectBox>
                <SelectBox id="azure" textValue="Microsoft Azure">
                  <AlertNotice />
                  <Text slot="label">Microsoft Azure</Text>
                </SelectBox>
                <SelectBox id="gcp" textValue="Google Cloud Platform">
                  <PaperAirplane />
                  <Text slot="label">Google Cloud Platform</Text>
                </SelectBox>
                <SelectBox id="ibm" textValue="IBM Cloud">
                  <StarFilled1 />
                  <Text slot="label">IBM Cloud</Text>
                  <Text slot="description">Hybrid cloud solutions</Text>
                </SelectBox>
              </SelectBoxGroup>
              <SegmentedControl onSelectionChange={action('segmented')}>
                <SegmentedControlItem id="a">A</SegmentedControlItem>
                <SegmentedControlItem id="b">B</SegmentedControlItem>
                <SegmentedControlItem id="c">C</SegmentedControlItem>
              </SegmentedControl>
            </section>
            <Divider />
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Navigation &amp; layout</h2>
            <section className={style({display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'})}>
              <Breadcrumbs onAction={action('breadcrumb')}>
                <Breadcrumb id="home">Home</Breadcrumb>
                <Breadcrumb id="docs">Docs</Breadcrumb>
                <Breadcrumb id="page">Page</Breadcrumb>
              </Breadcrumbs>
              <Tabs aria-label="Tabs">
                <TabList>
                  <Tab id="1">Tab 1</Tab>
                  <Tab id="2">Tab 2</Tab>
                </TabList>
                <TabPanel id="1"><Text>Panel 1</Text></TabPanel>
                <TabPanel id="2"><Text>Panel 2</Text></TabPanel>
              </Tabs>
              <Accordion>
                <AccordionItem id="item1">
                  <AccordionItemTitle>Section</AccordionItemTitle>
                  <AccordionItemPanel>Content</AccordionItemPanel>
                </AccordionItem>
              </Accordion>
              <Disclosure>
                <DisclosureHeader>
                  <DisclosureTitle>Disclosure</DisclosureTitle>
                </DisclosureHeader>
                <DisclosurePanel>Panel content</DisclosurePanel>
              </Disclosure>
            </section>
            <Divider />
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Color</h2>
            <section className={style({display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'})}>
              <ColorField label="Color" defaultValue="#7f00ff" />
              <ColorArea defaultValue="hsl(30, 100%, 50%)" />
              <ColorSlider label="Hue" defaultValue="hsl(30, 100%, 50%)" channel="hue" />
              <ColorSlider label="Alpha" defaultValue="#f00" channel="alpha" />
              <ColorWheel defaultValue="hsl(30, 100%, 50%)" />
              <ColorSwatchPicker defaultValue="#f00">
                <ColorSwatch color="#f00" />
                <ColorSwatch color="#0f0" />
                <ColorSwatch color="#00f" />
                <ColorSwatch color="#ff0" />
              </ColorSwatchPicker>
            </section>
            <Divider />
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Status &amp; feedback</h2>
            <section className={style({display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'})}>
              <Badge>Badge</Badge>
              <StatusLight variant="positive">Positive</StatusLight>
              <StatusLight variant="negative">Negative</StatusLight>
              <ProgressBar label="Progress" value={0.6} />
              <ProgressCircle aria-label="Loading" isIndeterminate />
              <Meter label="Meter" value={70} />
              <Skeleton isLoading><span>Placeholder</span></Skeleton>
              <InlineAlert variant="neutral">
                <Heading>Alert title</Heading>
                <Content>Inline alert body with more detail about what happened or what to do next.</Content>
              </InlineAlert>
              <TooltipTrigger>
                <Button>Hover for tooltip</Button>
                <Tooltip>Tooltip text</Tooltip>
              </TooltipTrigger>
            </section>
            <Divider />
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Content &amp; data</h2>
            <section className={style({display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center'})}>
              <IllustratedMessage>
                <AlertNotice />
                <Heading>No results</Heading>
                <Content>Try adjusting your search or filters to find what you need.</Content>
              </IllustratedMessage>
              <Avatar src="https://i.pravatar.cc/64?u=1" alt="User" />
              <TagGroup label="Tags" onRemove={action('tag remove')}>
                <Tag>Tag 1</Tag>
                <Tag>Tag 2</Tag>
              </TagGroup>
              <Calendar aria-label="Date" />
              <Form>
                <TextField label="Form field" />
                <Button type="submit">Submit</Button>
              </Form>
              <DropZone>
                <Text>Drop zone</Text>
              </DropZone>
            </section>
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Card view</h2>
            <section className={style({display: 'flex', flexDirection: 'column', gap: 8, height: 600, width: 'full'})}>
              <ExampleRender />
            </section>
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Table</h2>
            <section className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
              <TableView aria-label="Table" selectionMode="single" renderActionBar={() => <ActionBar selectedItemCount={1} onClearSelection={action('clear')}><Button>Action</Button></ActionBar>}>
                <TableHeader>
                  <Column id="col1">Name</Column>
                  <Column id="col2">Value</Column>
                </TableHeader>
                <TableBody>
                  <Row id="1">
                    <Cell>Row 1 A</Cell>
                    <Cell>Row 1 B</Cell>
                  </Row>
                  <Row id="2">
                    <Cell>Row 2 A</Cell>
                    <Cell>Row 2 B</Cell>
                  </Row>
                </TableBody>
              </TableView>
            </section>
            <h2 className={style({font: 'heading', fontSize: 'heading-sm'})}>Tree</h2>
            <section className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
              <TreeView aria-label="Tree">
                <TreeViewItem id="1" textValue="Node 1">
                  <TreeViewItemContent>Node 1</TreeViewItemContent>
                </TreeViewItem>
                <TreeViewItem id="2" textValue="Node 2">
                  <TreeViewItemContent>Node 2</TreeViewItemContent>
                </TreeViewItem>
              </TreeView>
            </section>
          </div>
        </UNSAFE_PortalProvider>
      </Provider>
    );

    return () => {
      root.unmount();
      rootRef.current = null;
      portalContainerRef.current = null;
    };
  }, []);

  return <div ref={hostRef} style={{minHeight: 600}} />;
}

export const MenuInShadowRoot: StoryObj = {
  render: () => <ShadowDOMMenuContent />,
  parameters: {
  }
};


const cardViewStyles = style({
  width: 'screen',
  maxWidth: 'full',
  height: 600
});

type Item = {
  id: number,
  user: {
    name: string,
    profile_image: { small: string }
  },
  urls: { regular: string },
  description: string,
  alt_description: string,
  width: number,
  height: number
};

const avatarSize = {
  XS: 16,
  S: 20,
  M: 24,
  L: 28,
  XL: 32
} as const;

function PhotoCard({item, layout}: {item: Item, layout: string}) {
  return (
    <Card id={item.id} textValue={item.description || item.alt_description}>
      {({size}) => (<>
        <CardPreview>
          <Image
            src={item.urls.regular}
            styles={style({
              width: 'full',
              pointerEvents: 'none'
            })}
            // TODO - should we have a safe `dynamicStyles` or something for this?
            UNSAFE_style={{
              aspectRatio: layout === 'waterfall' ? `${item.width} / ${item.height}` : '4/3',
              objectFit: layout === 'waterfall' ? 'contain' : 'cover'
            }}
            renderError={() => (
              <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'center', size: 'full'})}>
                <AlertNotice size="S" />
              </div>
            )} />
        </CardPreview>
        <Content>
          <Text slot="title">{item.description || item.alt_description}</Text>
          {size !== 'XS' && <ActionMenu>
            <MenuItem>Test</MenuItem>
          </ActionMenu>}
          <div className={style({display: 'flex', alignItems: 'center', gap: 8, gridArea: 'description'})}>
            <Avatar src={item.user.profile_image.small} size={avatarSize[size]} />
            <Text slot="description">{item.user.name}</Text>
          </div>
        </Content>
      </>)}
    </Card>
  );
}

const ExampleRender = (args: Omit<CardViewProps<any>, 'children' | 'layout'>) => {
  let list = useAsyncList<Item, number | null>({
    async load({signal, cursor, items}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics/nature/photos?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let nextItems = await res.json();
      // Filter duplicates which might be returned by the API.
      let existingKeys = new Set(items.map(i => i.id));
      nextItems = nextItems.filter(i => !existingKeys.has(i.id) && (i.description || i.alt_description));
      return {items: nextItems, cursor: nextItems.length ? page + 1 : null};
    }
  });

  let loadingState = args.loadingState === 'idle' ? list.loadingState : args.loadingState;
  let items = loadingState === 'loading' ? [] : list.items;

  return (
    <CardView
      aria-label="Nature photos"
      loadingState={loadingState}
      onLoadMore={args.loadingState === 'idle' ? list.loadMore : undefined}
      styles={cardViewStyles}>
      <Collection items={items}>
        {item => <PhotoCard item={item} layout={'grid'} />}
      </Collection>
      {(loadingState === 'loading' || loadingState === 'loadingMore') && (
        <SkeletonCollection>
          {() => (
            <PhotoCard
              item={{
                id: Math.random(),
                user: {name: 'Devon Govett', profile_image: {small: ''}},
                urls: {regular: ''},
                description: 'This is a fake description. Kinda long so it wraps to a new line.',
                alt_description: '',
                width: 400,
                height: 200 + Math.max(0, Math.round(Math.random() * 400))
              }}
              layout={'grid'} />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
};
