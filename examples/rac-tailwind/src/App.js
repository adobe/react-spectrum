import { ArrowUpIcon, BellIcon, CheckCircleIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { ChatBubbleOvalLeftEllipsisIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { Button, Calendar, CalendarCell, CalendarGrid, CalendarGridBody, CalendarGridHeader, CalendarHeaderCell, Cell, Collection, Column, ComboBox, DateInput, DatePicker, DateSegment, Dialog, DialogTrigger, Group, Header, Heading, Input, Item, Label, ListBox, Menu, MenuTrigger, Modal, ModalOverlay, OverlayArrow, Popover, ProgressBar, Radio, RadioGroup, Row, Section, Select, SelectValue, Separator, Slider, SliderOutput, SliderThumb, SliderTrack, Switch, Tab, Table, TableBody, TableHeader, TabList, TabPanel, TabPanels, Tabs, Text } from 'react-aria-components';
import { useAsyncList } from 'react-stately';
import { people } from './people.js';
import stocks from './stocks.json';

export function App() {
  return (
    <>
      <h1 className="text-center text-4xl font-serif font-semibold mb-3">React Aria Components 🤝 Tailwind CSS</h1>
      <p className="text-center font-serif mb-8">
        <a className="hover:text-blue-100 transition underline" target="_blank" href="https://github.com/adobe/react-spectrum/blob/main/examples/rac-tailwind/src/App.js">Example code</a> • <a className="hover:text-blue-100 transition underline" target="_blank" href="https://react-spectrum.adobe.com/react-aria/react-aria-components.html">Docs</a>
      </p>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-[repeat(auto-fit,theme(width.96))] auto-rows-fr justify-center">
        <MenuExample />
        <SelectExample />
        <DatePickerExample />
        <SliderExample />
        <TabsExample />
        <ModalExample />
        <RadioGroupExample />
        <PopoverExample />
        <SwitchExample />
        <ContactListExample />
        <TableExample />
        <ImageGridExample />
        <ComboBoxExample />
        <ProgressBarExample />
      </div>
    </>
  );
}

function MenuExample() {
  return (
    <div className="bg-gradient-to-r to-blue-500 from-violet-500 p-8 rounded-lg">
      <MenuTrigger>
        <OverlayButton aria-label="Menu">☰</OverlayButton>
        <Popover className="p-1 w-56 overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 data-[entering]:animate-in data-[entering]:fade-in data-[entering]:zoom-in-95 data-[exiting]:animate-out data-[exiting]:fade-out data-[exiting]:zoom-out-95 fill-mode-forwards origin-top-left">
          <Menu className="outline-none">
            <MenuItem id="new">New…</MenuItem>
            <MenuItem id="open">Open…</MenuItem>
            <Separator className="border-b border-b-gray-300 mx-3 my-1" />
            <MenuItem id="save">Save</MenuItem>
            <MenuItem id="save-as">Save as…</MenuItem>
            <Separator className="border-b border-b-gray-300 mx-3 my-1" />
            <MenuItem id="print">Print…</MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}

function MenuItem(props) {
  return <Item {...props} className={({ isFocused }) => `
    group flex w-full items-center rounded-md px-3 py-2 sm:text-sm outline-none cursor-default
    ${isFocused ? 'bg-violet-500 text-white' : 'text-gray-900'}
  `} />;
}

function OverlayButton(props) {
  return <Button {...props} className="inline-flex items-center justify-center rounded-md bg-black bg-opacity-20 bg-clip-padding border border-white/20 px-3.5 py-2 sm:text-sm font-medium text-white data-[hovered]:bg-opacity-30 data-[pressed]:bg-opacity-40 transition-colors cursor-default outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-white/75" />;
}

function SelectExample() {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-rose-500 p-8 rounded-lg flex justify-center">
      <Select className="flex flex-col gap-1 w-5/6">
        <Label className="text-sm">Favorite Animal</Label>
        <Button className="flex relative w-full cursor-default rounded-lg bg-white bg-white bg-opacity-90 data-[pressed]:bg-opacity-100 transition py-2 pl-3 pr-2 text-left shadow-md text-gray-700 focus:outline-none data-[focus-visible]:border-indigo-500 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black sm:text-sm">
          <SelectValue className="flex-1 truncate data-[placeholder]:italic" />
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-500"
            aria-hidden="true" />
        </Button>
        <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm data-[entering]:animate-in data-[entering]:fade-in data-[exiting]:animate-out data-[exiting]:fade-out fill-mode-forwards">
          <ListBox className="outline-none p-1 [--focus-bg:theme(colors.rose.600)]">
            <ListBoxItem>Aardvark</ListBoxItem>
            <ListBoxItem>Cat</ListBoxItem>
            <ListBoxItem>Dog</ListBoxItem>
            <ListBoxItem>Kangaroo</ListBoxItem>
            <ListBoxItem>Panda</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
    </div>
  );
}

function ListBoxItem(props) {
  return (
    <Item
      {...props}
      textValue={props.children}
      className={({isFocused}) => `
        relative group cursor-default select-none py-2 pl-10 pr-4 outline-none rounded
        ${isFocused ? 'bg-[--focus-bg] text-white' : 'text-gray-900'}
      `}>
      {({ isSelected }) => (
        <>
          <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>{props.children}</span>
          {isSelected &&
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[--focus-bg] group-data-[focused]:text-white">
              <CheckIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          }
        </>
      )}
    </Item>
  );
}

function ComboBoxExample() {
  return (
    <div className="bg-gradient-to-r from-sky-400 to-cyan-400 p-8 rounded-lg flex justify-center">
      <ComboBox className="flex flex-col gap-1 w-5/6">
        <Label className="text-sm text-black">Favorite Animal</Label>
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white bg-opacity-90 focus-within:bg-opacity-100 transition text-left shadow-md [&:has([data-focus-visible])]:ring-2 [&:has([data-focus-visible])]:ring-black sm:text-sm">
          <Input className="w-full border-none py-2 pl-3 pr-10 sm:text-sm leading-5 text-gray-900 bg-transparent outline-none" />
          <Button className="absolute inset-y-0 right-0 flex items-center px-2 cursor-default transition border-l border-l-sky-200 data-[pressed]:bg-sky-100">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-500"
              aria-hidden="true" />
          </Button>
        </div>
        <Popover className="max-h-60 w-[--trigger-width] overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 sm:text-sm data-[exiting]:animate-out data-[exiting]:fade-out fill-mode-forwards duration-100 ease-in">
          <ListBox className="outline-none p-1 [--focus-bg:theme(colors.sky.600)]">
            <ListBoxItem>Aardvark</ListBoxItem>
            <ListBoxItem>Cat</ListBoxItem>
            <ListBoxItem>Dog</ListBoxItem>
            <ListBoxItem>Kangaroo</ListBoxItem>
            <ListBoxItem>Panda</ListBoxItem>
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}

function TabsExample() {
  return (
    <div className="bg-gradient-to-r from-lime-500 to-emerald-500 p-8 rounded-lg">
      <Tabs>
        <TabList aria-label="Feeds" className="flex space-x-1 rounded-full bg-green-900/40 bg-clip-padding p-1 border border-white/30">
          <MyTab id="blog">Blog</MyTab>
          <MyTab id="releases">Releases</MyTab>
          <MyTab id="docs">Docs</MyTab>
        </TabList>
        <TabPanels>
          <MyTabPanel id="blog">
            <div className="flex flex-col">
              <Article title="Taming the dragon: Accessible drag and drop" summary="We are excited to announce the release of drag and drop support in React Aria and React Spectrum! This includes a suite of hooks for implementing drag and drop interactions, with support for both mouse and touch, as well as full parity for keyboard and screen reader input." />
              <Article title="Date and Time Pickers for All" summary="We are very excited to announce the release of the React Aria and React Spectrum date and time picker components! This includes a full suite of fully featured components and hooks including calendars, date and time fields, and range pickers, all with a focus on internationalization and accessibility. It also includes @internationalized/date, a brand new framework-agnostic library for locale-aware date and time manipulation." />
              <Article title="Creating an accessible autocomplete experience" summary="After many months of research, development, and testing, we’re excited to announce that the React Spectrum ComboBox component and React Aria useComboBox hook are now available! In this post we'll take a deeper look into some of the challenges we faced when building an accessible and mobile friendly ComboBox." />
            </div>
          </MyTabPanel>
          <MyTabPanel id="releases">
            <div className="flex flex-col">
              <Article title="February 23, 2023 Release" summary="In this release, we have added support for Node ESM to all of our packages. We have also been busy at work on our pre-releases and improving our focus management in collections." />
              <Article title="December 16, 2022 Release" summary="It is our last release of the year and we are happy to share a new TableView feature, now in beta. Using the new allowsResizing prop on a Column in TableView gives users the ability to dynamically adjust the width of that column. TableView column resizing supports mouse, keyboard, touch, and screen reader interactions to allow all users to take advantage of a customizable table." />
              <Article title="November 15, 2022 Release" summary="We are excited to announce the release of drag and drop support in React Aria and React Spectrum! This includes a suite of hooks for implementing drag and drop interactions. There is also an update to all Spectrum colors, aligning React Spectrum with the latest Spectrum designs. Finally, React Aria includes a new simplified API for overlays such as popovers and modals." />
            </div>
          </MyTabPanel>
          <MyTabPanel id="docs">
            <div className="flex flex-col">
              <Article title="React Stately" summary="A library of React Hooks that provides cross-platform state management for your design system." />
              <Article title="React Aria" summary="A library of React Hooks that provides accessible UI primitives for your design system." />
              <Article title="React Spectrum" summary="A React implementation of Spectrum, Adobe’s design system." />
            </div>
          </MyTabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

function MyTab(props) {
  return (
    <Tab
      {...props}
      className={({isSelected, isFocusVisible}) => `
        w-full rounded-full py-2.5 sm:text-sm font-medium leading-5 text-center cursor-default ring-black outline-none transition-colors
        ${isFocusVisible ? 'ring-2' : ''}
        ${isSelected ? 'text-emerald-700 bg-white shadow' : 'text-lime-50 data-[hovered]:bg-white/[0.12] data-[hovered]:text-white data-[pressed]:bg-white/[0.12] data-[pressed]:text-white'}
      `} />
  );
}

function MyTabPanel(props) {
  return <TabPanel {...props} className="mt-2 text-gray-700 font-serif rounded-2xl bg-white p-2 shadow ring-black focus:outline-none data-[focus-visible]:ring-2" />;
}

function Article({title, summary}) {
  return (
    <a href="#" className="p-2 rounded-lg hover:bg-gray-100 h-[69px]">
      <h3 className="text-sm mb-0.5 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{title}</h3>
      <p className="text-xs overflow-hidden text-ellipsis line-clamp-2">{summary}</p>
    </a>
  );
}

function RadioGroupExample() {
  return (
    <div className="bg-gradient-to-r from-blue-300 to-indigo-300 p-8 rounded-lg">
      <RadioGroup className="space-y-2" defaultValue="Standard">
        <Label className="text-xl text-slate-900 font-semibold font-serif">Shipping</Label>
        <MyRadio name="Standard" time="4-10 business days" price="$4.99" />
        <MyRadio name="Express" time="2-5 business days" price="$15.99" />
        <MyRadio name="Lightning" time="1 business day" price="$24.99" />
      </RadioGroup>
    </div>
  );
}

function MyRadio({name, time, price}) {
  return (
    <Radio value={name} className={({isFocusVisible, isSelected, isPressed}) => `
      relative flex cursor-default rounded-lg px-4 py-3 shadow-lg focus:outline-none bg-clip-padding border border-transparent
      ${isFocusVisible ? 'ring-2 ring-blue-600 ring-offset-1 ring-offset-white/80' : ''}
      ${isSelected ? 'bg-blue-600 border-white/30 text-white' : ''}
      ${isPressed && !isSelected ? 'bg-blue-50' : ''}
      ${!isSelected && !isPressed ? 'bg-white' : ''}
    `}>
      {({isSelected}) => (
        <div className="flex w-full items-center justify-between gap-3">
          <div className="shrink-0">
            <CheckCircleIcon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-blue-100'}`} />
          </div>
          <div className="flex flex-1 flex-col">
            <div className={`font-serif font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>{name}</div>
            <div className={`text-sm inline ${isSelected ? 'text-sky-100' : 'text-gray-500'}`}>
              {time}
            </div>
          </div>
          <div className={`text-sm font-medium font-mono ${isSelected ? 'text-white' : 'text-gray-900'}`}>{price}</div>
        </div>
      )}
    </Radio>
  );
}

function ModalExample() {
  return (
    <div className="bg-gradient-to-r from-sky-400 to-indigo-500 p-8 rounded-lg flex items-center justify-center">
      <DialogTrigger>
        <OverlayButton>Open dialog</OverlayButton>
        <ModalOverlay className={({isEntering, isExiting}) => `
          fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
          ${isEntering ? 'animate-in fade-in duration-300 ease-out fill-mode-forwards' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in fill-mode-forwards' : ''}
        `}>
          <Modal className={({isEntering, isExiting}) => `
            w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl
            ${isEntering ? 'animate-in fade-in zoom-in-95 ease-out duration-300 fill-mode-forwards' : ''}
            ${isExiting ? 'animate-out fade-out zoom-out-95 ease-in duration-200 fill-mode-forwards' : ''}
          `}>
            <Dialog role="alertdialog" className="outline-none relative">
              {({ close }) => (<>
                <Heading className="text-xl font-semibold leading-6 text-slate-700">Delete folder</Heading>
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500 absolute right-0 top-0 stroke-2" />
                <p className="mt-3 text-sm text-slate-500">
                  Are you sure you want to delete "Documents"? All contents will be permanently destroyed.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <DialogButton
                    className="bg-slate-200 text-slate-800 data-[hovered]:border-slate-300 data-[pressed]:bg-slate-300"
                    onPress={close}
                  >
                    Cancel
                  </DialogButton>
                  <DialogButton
                    className="bg-red-500 text-white data-[hovered]:border-red-600 data-[pressed]:bg-red-600"
                    onPress={close}
                  >
                    Delete
                  </DialogButton>
                </div>
              </>)}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </div>
  );
}

function DialogButton({className, ...props}) {
  return <Button {...props} className={`inline-flex justify-center rounded-md border border-transparent px-5 py-2 text-sm font-medium transition-colors cursor-default outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-blue-500 data-[focus-visible]:ring-offset-2 ${className}`} />;
}

function PopoverExample() {
  return (
    <div className="bg-gradient-to-r from-orange-400 to-pink-600 p-8 rounded-lg flex items-start justify-center">
      <DialogTrigger>
        <OverlayButton aria-label="Notifications">
          <BellIcon className="w-5 h-5 text-white" aria-hidden="true" />
        </OverlayButton>
        <MyPopover className="w-[280px] data-[placement=bottom]:mt-2 data-[placement=top]:mb-2 group">
          <OverlayArrow>
            <svg viewBox="0 0 12 12" className="block fill-white group-data-[placement=bottom]:rotate-180 w-4 h-4">
              <path d="M0 0,L6 6,L12 0" />
            </svg>
          </OverlayArrow>
          <Dialog className="p-2 outline-none text-gray-700">
            <div className="flex flex-col">
              <Notification avatar={people[4].avatar} name={people[4].name} time="2h" text="This looks great! Let's ship it." />
              <Notification avatar={people[1].avatar} name={people[1].name} time="4h" text="Can you add a bit more pizzazz?" />
              <Notification avatar={people[6].avatar} name={people[6].name} time="1d" text="Here's a first pass. What do you think?" />
            </div>
          </Dialog>
        </MyPopover>
      </DialogTrigger>
    </div>
  );
}

function MyPopover(props) {
  return (
    <Popover
      {...props}
      className={({isEntering, isExiting}) => `
        px-4 sm:px-0 rounded-lg drop-shadow-lg ring-1 ring-black/10 bg-white ${props.className || ''}
        ${isEntering ? 'animate-in fade-in data-[placement=bottom]:slide-in-from-top-1 data-[placement=top]:slide-in-from-bottom-1 ease-out duration-200 fill-mode-forwards' : ''}
        ${isExiting ? 'animate-out fade-out data-[placement=bottom]:slide-out-to-top-1 data-[placement=top]:slide-out-to-bottom-1 ease-in duration-150 fill-mode-forwards' : ''}
      `} />
  );
}

function Notification({avatar, name, time, text}) {
  return (
    <a href="#" className="p-2 rounded-lg hover:bg-gray-100 grid grid-cols-[theme(width.5)_1fr_theme(width.4)] gap-x-2">
      <img src={avatar} className="rounded-full w-5 h-5 row-span-3" />
      <div className="text-sm text-gray-800 font-semibold">{name}</div>
      <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 text-gray-400 stroke-2" />
      <div className="text-xs text-gray-500 col-span-2">Commented {time} ago</div>
      <p className="text-xs overflow-hidden text-ellipsis line-clamp-2 mt-1 col-span-2">{text}</p>
    </a>
  );
}

function SwitchExample() {
  return (
    <div className="bg-gradient-to-r from-yellow-300 to-orange-300 p-8 rounded-lg flex items-center justify-center">
      <Switch className="group flex gap-2 items-center text-black font-semibold text-sm">
        <div className="inline-flex h-[26px] w-[44px] shrink-0 cursor-default rounded-full shadow-inner bg-clip-padding border border-white/30 p-[3px] transition-colors duration-200 ease-in-out bg-yellow-600 group-data-[pressed]:bg-yellow-700 group-data-[selected]:bg-amber-800 group-data-[selected]:group-data-[pressed]:bg-amber-900 focus:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-black">
          <span className="h-[18px] w-[18px] transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0 group-data-[selected]:translate-x-[100%]" />
        </div>
        Wi-Fi
      </Switch>
    </div>
  );
}

function SliderExample() {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-lg flex items-center justify-center">
      <Slider defaultValue={30} className="w-5/6">
        <div className="flex sm:text-sm">
          <Label className="flex-1">Opacity</Label>
          <SliderOutput />
        </div>
        <SliderTrack className="relative w-full h-7">
          {(state) => <>
            <div className="absolute h-2 top-[50%] transform translate-y-[-50%] w-full rounded-full bg-white bg-opacity-40" />
            <div className="absolute h-2 top-[50%] transform translate-y-[-50%] rounded-full bg-white" style={{width: state.getThumbPercent(0) * 100 + '%'}} />
            <SliderThumb className="h-7 w-7 top-[50%] rounded-full border border-purple-800/75 bg-white transition-colors data-[dragging]:bg-purple-100 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-black" />
          </>}
        </SliderTrack>
      </Slider>
    </div>
  );
}

function ProgressBarExample() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-8 rounded-lg flex items-center justify-center">
      <ProgressBar value={30} className="flex flex-col gap-3 w-56 text-sm">
        {({percentage, valueText}) => <>
          <div className="flex">
            <Label className="flex-1">Loading…</Label>
            <span>{valueText}</span>
          </div>
          <div className="h-2 top-[50%] transform translate-y-[-50%] w-full rounded-full bg-white bg-opacity-40">
            <div className="absolute h-2 top-[50%] transform translate-y-[-50%] rounded-full bg-white" style={{width: percentage + '%'}} />
          </div>
        </>}
      </ProgressBar>
    </div>
  );
}

function DatePickerExample() {
  return (
    <div className="bg-gradient-to-r from-violet-500 to-fuchsia-600 p-8 rounded-lg flex items-start justify-center">
      <DatePicker className="flex flex-col gap-1 w-5/6">
        <Label className="text-sm">Date</Label>
        <Group className="flex rounded-lg bg-white/90 focus-within:bg-white [&:has([data-pressed])]:bg-white transition pl-3 text-left shadow-md text-gray-700 focus:outline-none data-[focus-visible]:[&:not(:has(button[data-focus-visible]))]:ring-2 data-[focus-visible]:ring-black">
          <DateInput className="flex flex-1 py-2 sm:text-sm input">
            {(segment) => <DateSegment segment={segment} className="px-0.5 box-content tabular-nums text-right outline-none rounded-sm focus:bg-violet-700 focus:text-white group caret-transparent data-[placeholder]:italic" />}
          </DateInput>
          <Button className="cursor-default outline-none px-2 transition border-l border-l-purple-200 rounded-r-lg data-[pressed]:bg-purple-100 data-[focus-visible]:ring-2 data-[focus-visible]:ring-black">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-500"
              aria-hidden="true" />
          </Button>
        </Group>
        <MyPopover>
          <Dialog className="p-6 text-gray-600">
            <Calendar>
              <header className="flex items-center pb-4 px-1 font-serif w-full">
                <Heading className="flex-1 font-semibold text-2xl ml-2" />
                <Button slot="previous" className="w-9 h-9 ml-4 outline-none cursor-default rounded-full flex items-center justify-center data-[hovered]:bg-gray-100 data-[pressed]:bg-gray-200 data-[focus-visible]:ring data-[focus-visible]:ring-violet-600 data-[focus-visible]:ring-opacity-70 data-[focus-visible]:ring-offset-2"><ChevronLeftIcon className="h-6 w-6" /></Button>
                <Button slot="next" className="w-9 h-9 outline-none cursor-default rounded-full flex items-center justify-center data-[hovered]:bg-gray-100 data-[pressed]:bg-gray-200 data-[focus-visible]:ring data-[focus-visible]:ring-violet-600 data-[focus-visible]:ring-opacity-70 data-[focus-visible]:ring-offset-2"><ChevronRightIcon className="h-6 w-6" /></Button>
              </header>
              <CalendarGrid className="border-spacing-1 border-separate">
                <CalendarGridHeader>
                  {day => <CalendarHeaderCell className="text-xs text-gray-500 font-semibold">{day}</CalendarHeaderCell>}
                </CalendarGridHeader>
                <CalendarGridBody>
                  {date => <CalendarCell date={date} className="w-9 h-9 outline-none cursor-default rounded-full text-sm flex items-center justify-center data-[outside-month]:text-gray-300 data-[hovered]:bg-gray-100 data-[pressed]:bg-gray-200 data-[selected]:data-[hovered]:bg-violet-700 data-[selected]:bg-violet-700 data-[selected]:text-white data-[focus-visible]:ring data-[focus-visible]:ring-violet-600 data-[focus-visible]:ring-opacity-70 data-[focus-visible]:ring-offset-2" />}
                </CalendarGridBody>
              </CalendarGrid>
            </Calendar>
          </Dialog>
        </MyPopover>
      </DatePicker>
    </div>
  );
}

function ContactListExample() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-sky-500 p-8 rounded-lg flex justify-center">
      <ListBox aria-label="Contacts" selectionMode="multiple" selectionBehavior="replace" className="w-72 max-h-[290px] overflow-auto outline-none bg-white text-gray-700 p-2 flex flex-col gap-2 rounded-lg shadow scroll-pt-6">
        <ContactSection title="Favorites">
          <Contact id="wade" name="Tony Baldwin" handle="@tony" avatar="https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
          <Contact id="arelene" name="Julienne Langstrath" handle="@jlangstrath" avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
          <Contact id="tom" name="Roberto Gonzalez" handle="@rgonzalez" avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
        </ContactSection>
        <ContactSection title="All Contacts" items={people}>
          {item => <Contact name={item.name} handle={item.username} avatar={item.avatar} />}
        </ContactSection>
      </ListBox>
    </div>
  );
}

function ContactSection({title, children, items}) {
  return (
    <Section>
      <Header className="sticky -top-2 bg-white z-10 text-sm font-bold font-serif px-2 mb-1 text-slate-700">{title}</Header>
      <Collection items={items}>
        {children}
      </Collection>
    </Section>
  );
}

function Contact({id, avatar, name, handle}) {
  return (
    <Item id={id} textValue={name} className="group peer relative py-1 px-2 text-sm outline-none cursor-default grid grid-rows-2 grid-flow-col auto-cols-max gap-x-3 rounded aria-selected:bg-blue-500 text-slate-700 aria-selected:text-white aria-selected:[&:has(+[aria-selected=true])]:rounded-b-none aria-selected:peer-aria-selected:rounded-t-none data-[focus-visible]:ring-2 ring-offset-2 ring-blue-500 [&[aria-selected=false]:has(+[aria-selected=false])_.divider]:block [&[aria-selected=true]:has(+[aria-selected=true])_.divider]:block">
      <img src={avatar} alt="" className="row-span-2 place-self-center h-8 w-8 rounded-full" />
      <Text slot="label" className="font-medium truncate">{name}</Text>
      <Text slot="description" className="truncate text-xs text-slate-600 group-aria-selected:text-white">{handle}</Text>
      <div className="divider hidden absolute left-12 right-2 bottom-0 h-px bg-gray-200 group-aria-selected:bg-blue-400" />
    </Item>
  );
}

// TODO: we need a way to pass in a custom keyboard delegate so grid navigation works.
function ImageGridExample() {
  let list = useAsyncList({
    async load({ signal, cursor }) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/photos?page=${page}&per_page=25&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        { signal }
      );
      let items = await res.json();
      return { items, cursor: page + 1 };
    }
  });

  return (
    <div className="bg-gradient-to-r from-sky-500 to-teal-500 p-8 rounded-lg flex justify-center">
      <ListBox aria-label="Images" items={list.items} selectionMode="single" selectionBehavior="replace" className="max-h-[280px] overflow-auto outline-none bg-white rounded-lg shadow p-2 grid grid-cols-3 gap-2">
        {item => (
          <Item textValue={item.user.name} className="rounded outline-none group cursor-default">
            <img src={item.urls.regular} alt={item.alt_description} className="w-full h-[80px] object-cover rounded group-aria-selected:ring group-aria-selected:ring-2 group-aria-selected:ring-offset-2 group-aria-selected:ring-sky-600" />
            <Text slot="label" className="text-[11px] text-gray-700 font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-full block mt-1">{item.user.name}</Text>
          </Item>
        )}
      </ListBox>
    </div>
  );
}

function TableExample() {
  let [sortDescriptor, setSortDescriptor] = useState({column: 'symbol', direction: 'ascending'});
  let sortedItems = useMemo(() => {
    return stocks.sort((a, b) => {
      let first = a[sortDescriptor.column];
      let second = b[sortDescriptor.column];
      let cmp = first.localeCompare(second);
      if (sortDescriptor.direction === 'descending') {
        cmp *= -1;
      }
      return cmp;
    })
  }, [sortDescriptor]);

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-8 rounded-lg flex items-center justify-center md:col-span-2">
      <div className="max-h-[280px] overflow-auto relative bg-white rounded-lg shadow text-gray-600">
        <Table aria-label="Stocks" selectionMode="single" selectionBehavior="replace" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor} className="border-separate border-spacing-0">
          <TableHeader>
            <StockColumn id="symbol" allowsSorting>Symbol</StockColumn>
            <StockColumn id="name" isRowHeader allowsSorting>Name</StockColumn>
            <StockColumn id="marketCap" allowsSorting>Market Cap</StockColumn>
            <StockColumn id="sector" allowsSorting>Sector</StockColumn>
            <StockColumn id="industry" allowsSorting>Industry</StockColumn>
          </TableHeader>
          <TableBody items={sortedItems}>
            {item => (
              <StockRow>
                <StockCell><span className="font-mono bg-slate-100 border border-slate-200 rounded px-1 group-aria-selected:bg-slate-700 group-aria-selected:border-slate-800">${item.symbol}</span></StockCell>
                <StockCell className="font-semibold">{item.name}</StockCell>
                <StockCell>{item.marketCap}</StockCell>
                <StockCell>{item.sector}</StockCell>
                <StockCell>{item.industry}</StockCell>
              </StockRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function StockColumn(props) {
  return (
    <Column {...props} className="sticky top-0 border-b border-slate-300 bg-slate-200 px-4 py-2 font-bold text-sm text-left cursor-default first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-slate-600 data-[focus-visible]:-outline-offset-4">
      {({allowsSorting, sortDirection}) => (
        <span className="flex items-center">
          {props.children}
          {allowsSorting && (
            <span aria-hidden="true" className="ml-1 w-4 h-4">
              {sortDirection && <ArrowUpIcon className={`w-4 h-4 transition ${sortDirection === 'descending' ? 'rotate-180' : ''}`} />}
            </span>
          )}
        </span>
      )}
    </Column>
  );
}

function StockRow(props) {
  return <Row {...props} className="even:bg-slate-100 aria-selected:bg-slate-600 aria-selected:text-white cursor-default group outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-slate-600 data-[focus-visible]:-outline-offset-4 aria-selected:data-[focus-visible]:outline-white" />;
}

function StockCell(props) {
  return <Cell {...props} className={`px-4 py-2 text-sm ${props.className} data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-slate-600 data-[focus-visible]:-outline-offset-4 group-aria-selected:data-[focus-visible]:outline-white`} />;
}
