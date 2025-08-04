import { ArrowUpIcon, BellIcon, CheckCircleIcon, CheckIcon, ChevronUpDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { ChatBubbleOvalLeftEllipsisIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import {
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent as AriaTreeItemContent,
  Autocomplete,
  Button,
  Cell,
  Collection,
  Column,
  ComboBox,
  DateInput,
  DatePicker,
  DateSegment,
  Dialog,
  DialogTrigger,
  Group,
  Header,
  Heading,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Menu,
  MenuItem,
  MenuTrigger,
  Modal,
  ModalOverlay,
  OverlayArrow,
  Popover,
  ProgressBar,
  Radio,
  RadioGroup,
  Row,
  SearchField,
  Section,
  Select,
  SelectValue,
  Separator,
  Slider,
  SliderOutput,
  SliderThumb,
  SliderTrack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableHeader,
  TabList,
  TabPanel,
  Tabs,
  Text,
  useFilter
} from 'react-aria-components';
import { useAsyncList } from 'react-stately';
import { people } from './people.js';
import stocks from './stocks.json';
import {AnimatedCalendar} from './AnimatedCalendar';

export function App() {
  return (
    <>
      <h1 className="mb-3 font-serif text-4xl font-semibold text-center">React Aria Components 🤝 Tailwind CSS</h1>
      <p className="mb-8 font-serif text-center">
        <a className="underline transition hover:text-blue-100" target="_blank" href="https://github.com/adobe/react-spectrum/blob/main/examples/rac-tailwind/src/App.js">Example code</a> • <a className="underline transition hover:text-blue-100" target="_blank" href="https://react-spectrum.adobe.com/react-aria/react-aria-components.html">Docs</a>
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
        <AutocompleteExample />
        <TreeExample />
      </div>
    </>
  );
}

function MenuExample() {
  return (
    <div className="p-8 rounded-lg bg-linear-to-r to-blue-500 from-violet-500">
      <MenuTrigger>
        <OverlayButton aria-label="Menu">☰</OverlayButton>
        <Popover className="w-56 p-1 overflow-auto origin-top-left bg-white rounded-md shadow-lg ring-1 ring-black/5 data-entering:animate-in data-entering:fade-in data-entering:zoom-in-95 data-exiting:animate-out data-exiting:fade-out data-exiting:zoom-out-95 fill-mode-forwards">
          <Menu className="outline-hidden">
            <MyMenuItem id="new">New…</MyMenuItem>
            <MyMenuItem id="open">Open…</MyMenuItem>
            <Separator className="mx-3 my-1 border-b border-b-gray-300" />
            <MyMenuItem id="save">Save</MyMenuItem>
            <MyMenuItem id="save-as">Save as…</MyMenuItem>
            <Separator className="mx-3 my-1 border-b border-b-gray-300" />
            <MyMenuItem id="print">Print…</MyMenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
    </div>
  );
}

function MyMenuItem(props) {
  return <MenuItem {...props} className={({ isFocused }) => `
    group flex w-full items-center rounded-md px-3 py-2 sm:text-sm outline-hidden cursor-default
    ${isFocused ? 'bg-violet-500 text-white' : 'text-gray-900'}
  `} />;
}

function OverlayButton(props) {
  return <Button {...props} className="inline-flex items-center justify-center rounded-md bg-black/20 bg-clip-padding border border-white/20 px-3.5 py-2 sm:text-sm font-medium text-white data-hovered:bg-black/30 data-pressed:bg-black/40 transition-colors cursor-default outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-white/75" />;
}

function SelectExample() {
  return (
    <div className="flex justify-center p-8 rounded-lg bg-linear-to-r from-amber-500 to-rose-500">
      <Select className="flex flex-col w-5/6 gap-1">
        <Label className="text-sm">Favorite Animal</Label>
        <Button className="relative flex w-full py-2 pl-3 pr-2 text-left text-gray-700 transition bg-white rounded-lg shadow-md cursor-default bg-white/90 data-pressed:bg-white focus:outline-hidden data-focus-visible:border-indigo-500 data-focus-visible:ring-2 data-focus-visible:ring-black sm:text-sm">
          <SelectValue className="flex-1 truncate data-placeholder:italic" />
          <ChevronUpDownIcon
            className="w-5 h-5 text-gray-500"
            aria-hidden="true" />
        </Button>
        <Popover className="max-h-60 w-(--trigger-width) overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 sm:text-sm data-entering:animate-in data-entering:fade-in data-exiting:animate-out data-exiting:fade-out fill-mode-forwards">
          <ListBox className="outline-hidden p-1 [--focus-bg:var(--color-rose-600)]">
            <MyListBoxItem>Aardvark</MyListBoxItem>
            <MyListBoxItem>Cat</MyListBoxItem>
            <MyListBoxItem>Dog</MyListBoxItem>
            <MyListBoxItem>Kangaroo</MyListBoxItem>
            <MyListBoxItem>Panda</MyListBoxItem>
          </ListBox>
        </Popover>
      </Select>
    </div>
  );
}

function MyListBoxItem(props) {
  return (
    <ListBoxItem
      {...props}
      textValue={props.children}
      className={({isFocused}) => `
        relative group cursor-default select-none py-2 pl-10 pr-4 outline-hidden rounded
        ${isFocused ? 'bg-(--focus-bg) text-white' : 'text-gray-900'}
      `}>
      {({ isSelected }) => (
        <>
          <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>{props.children}</span>
          {isSelected &&
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-(--focus-bg) group-data-focused:text-white">
              <CheckIcon className="w-5 h-5" aria-hidden="true" />
            </span>
          }
        </>
      )}
    </ListBoxItem>
  );
}

function ComboBoxExample() {
  return (
    <div className="flex justify-center p-8 rounded-lg bg-linear-to-r from-sky-400 to-cyan-400">
      <ComboBox className="flex flex-col w-5/6 gap-1">
        <Label className="text-sm text-black">Favorite Animal</Label>
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/90 focus-within:bg-white transition text-left shadow-md [&:has([data-focus-visible])]:ring-2 [&:has([data-focus-visible])]:ring-black sm:text-sm">
          <Input className="w-full py-2 pl-3 pr-10 leading-5 text-gray-900 bg-transparent border-none sm:text-sm outline-hidden" />
          <Button className="absolute inset-y-0 right-0 flex items-center px-2 transition border-l cursor-default border-l-sky-200 data-pressed:bg-sky-100">
            <ChevronUpDownIcon
              className="w-5 h-5 text-gray-500"
              aria-hidden="true" />
          </Button>
        </div>
        <Popover className="max-h-60 w-(--trigger-width) overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black/5 sm:text-sm data-exiting:animate-out data-exiting:fade-out fill-mode-forwards duration-100 ease-in">
          <ListBox className="outline-hidden p-1 [--focus-bg:var(--color-sky-600)]">
            <MyListBoxItem>Aardvark</MyListBoxItem>
            <MyListBoxItem>Cat</MyListBoxItem>
            <MyListBoxItem>Dog</MyListBoxItem>
            <MyListBoxItem>Kangaroo</MyListBoxItem>
            <MyListBoxItem>Panda</MyListBoxItem>
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}

function TabsExample() {
  return (
    <div className="p-8 rounded-lg bg-linear-to-r from-lime-500 to-emerald-500">
      <Tabs>
        <TabList aria-label="Feeds" className="flex p-1 space-x-1 border rounded-full bg-green-900/40 bg-clip-padding border-white/30">
          <MyTab id="blog">Blog</MyTab>
          <MyTab id="releases">Releases</MyTab>
          <MyTab id="docs">Docs</MyTab>
        </TabList>
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
      </Tabs>
    </div>
  );
}

function MyTab(props) {
  return (
    <Tab
      {...props}
      className={({isSelected, isFocusVisible}) => `
        w-full rounded-full py-2.5 sm:text-sm font-medium leading-5 text-center cursor-default ring-black outline-hidden transition-colors
        ${isFocusVisible ? 'ring-2' : ''}
        ${isSelected ? 'text-emerald-700 bg-white shadow-sm' : 'text-lime-50 data-hovered:bg-white/[0.12] data-hovered:text-white data-pressed:bg-white/[0.12] data-pressed:text-white'}
      `} />
  );
}

function MyTabPanel(props) {
  return <TabPanel {...props} className="p-2 mt-2 font-serif text-gray-700 bg-white shadow-sm rounded-2xl ring-black focus:outline-hidden data-focus-visible:ring-2" />;
}

function Article({title, summary}) {
  return (
    <a href="#" className="p-2 rounded-lg hover:bg-gray-100 h-[69px]">
      <h3 className="text-sm mb-0.5 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{title}</h3>
      <p className="overflow-hidden text-xs text-ellipsis line-clamp-2">{summary}</p>
    </a>
  );
}

function RadioGroupExample() {
  return (
    <div className="p-8 rounded-lg bg-linear-to-r from-blue-300 to-indigo-300">
      <RadioGroup className="space-y-2" defaultValue="Standard">
        <Label className="font-serif text-xl font-semibold text-slate-900">Shipping</Label>
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
      relative flex cursor-default rounded-lg px-4 py-3 shadow-lg focus:outline-hidden bg-clip-padding border border-transparent
      ${isFocusVisible ? 'ring-2 ring-blue-600 ring-offset-1 ring-offset-white/80' : ''}
      ${isSelected ? 'bg-blue-600 border-white/30 text-white' : ''}
      ${isPressed && !isSelected ? 'bg-blue-50' : ''}
      ${!isSelected && !isPressed ? 'bg-white' : ''}
    `}>
      {({isSelected}) => (
        <div className="flex items-center justify-between w-full gap-3">
          <div className="shrink-0">
            <CheckCircleIcon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-blue-100'}`} />
          </div>
          <div className="flex flex-col flex-1">
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
    <div className="flex items-center justify-center p-8 rounded-lg bg-linear-to-r from-sky-400 to-indigo-500">
      <DialogTrigger>
        <OverlayButton>Open dialog</OverlayButton>
        <ModalOverlay className={({isEntering, isExiting}) => `
          fixed inset-0 z-10 overflow-y-auto bg-black/25 flex min-h-full items-center justify-center p-4 text-center backdrop-blur
          ${isEntering ? 'animate-in fade-in duration-300 ease-out fill-mode-forwards' : ''}
          ${isExiting ? 'animate-out fade-out duration-200 ease-in fill-mode-forwards' : ''}
        `}>
          <Modal className={({isEntering, isExiting}) => `
            w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl
            ${isEntering ? 'animate-in fade-in zoom-in-95 ease-out duration-300 fill-mode-forwards' : ''}
            ${isExiting ? 'animate-out fade-out zoom-out-95 ease-in duration-200 fill-mode-forwards' : ''}
          `}>
            <Dialog role="alertdialog" className="relative outline-hidden">
              {({ close }) => (<>
                <Heading className="text-xl font-semibold leading-6 text-slate-700">Delete folder</Heading>
                <ExclamationTriangleIcon className="absolute top-0 right-0 w-6 h-6 text-red-500 stroke-2" />
                <p className="mt-3 text-sm text-slate-500">
                  Are you sure you want to delete "Documents"? All contents will be permanently destroyed.
                </p>
                <div className="flex justify-end gap-2 mt-6">
                  <DialogButton
                    className="bg-slate-200 text-slate-800 data-hovered:border-slate-300 data-pressed:bg-slate-300"
                    onPress={close}
                  >
                    Cancel
                  </DialogButton>
                  <DialogButton
                    className="text-white bg-red-500 data-hovered:border-red-600 data-pressed:bg-red-600"
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
  return <Button {...props} className={`inline-flex justify-center rounded-md border border-transparent px-5 py-2 text-sm font-medium transition-colors cursor-default outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-focus-visible:ring-offset-2 ${className}`} />;
}

function PopoverExample() {
  return (
    <div className="flex items-start justify-center p-8 rounded-lg bg-linear-to-r from-orange-400 to-pink-600">
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
          <Dialog className="p-2 text-gray-700 outline-hidden">
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
      <img src={avatar} className="w-5 h-5 row-span-3 rounded-full" />
      <div className="text-sm font-semibold text-gray-800">{name}</div>
      <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4 text-gray-400 stroke-2" />
      <div className="col-span-2 text-xs text-gray-500">Commented {time} ago</div>
      <p className="col-span-2 mt-1 overflow-hidden text-xs text-ellipsis line-clamp-2">{text}</p>
    </a>
  );
}

function SwitchExample() {
  return (
    <div className="flex items-center justify-center p-8 rounded-lg bg-linear-to-r from-yellow-300 to-orange-300">
      <Switch className="flex items-center gap-2 text-sm font-semibold text-black group">
        <div className="inline-flex h-[26px] w-[44px] shrink-0 cursor-default rounded-full shadow-inner bg-clip-padding border border-white/30 p-[3px] transition-colors duration-200 ease-in-out bg-yellow-600 group-data-pressed:bg-yellow-700 group-data-selected:bg-amber-800 group-data-pressed:group-data-selected:bg-amber-900 focus:outline-hidden group-data-focus-visible:ring-2 group-data-focus-visible:ring-black">
          <span className="h-[18px] w-[18px] transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out translate-x-0 group-data-selected:translate-x-[100%]" />
        </div>
        Wi-Fi
      </Switch>
    </div>
  );
}

function SliderExample() {
  return (
    <div className="flex items-center justify-center p-8 rounded-lg bg-linear-to-r from-purple-500 to-pink-500">
      <Slider defaultValue={30} className="w-5/6">
        <div className="flex sm:text-sm">
          <Label className="flex-1">Opacity</Label>
          <SliderOutput />
        </div>
        <SliderTrack className="relative w-full h-7">
          {({state}) => <>
            <div className="absolute h-2 top-[50%] transform translate-y-[-50%] w-full rounded-full bg-white/40" />
            <div className="absolute h-2 top-[50%] transform translate-y-[-50%] rounded-full bg-white" style={{width: state.getThumbPercent(0) * 100 + '%'}} />
            <SliderThumb className="h-7 w-7 top-[50%] rounded-full border border-purple-800/75 bg-white transition-colors data-dragging:bg-purple-100 outline-hidden data-focus-visible:ring-2 data-focus-visible:ring-black" />
          </>}
        </SliderTrack>
      </Slider>
    </div>
  );
}

function ProgressBarExample() {
  return (
    <div className="flex items-center justify-center p-8 rounded-lg bg-linear-to-r from-blue-500 to-purple-500">
      <ProgressBar value={30} className="flex flex-col w-56 gap-3 text-sm">
        {({percentage, valueText}) => <>
          <div className="flex">
            <Label className="flex-1">Loading…</Label>
            <span>{valueText}</span>
          </div>
          <div className="h-2 top-[50%] transform translate-y-[-50%] w-full rounded-full bg-white/40">
            <div className="absolute h-2 top-[50%] transform translate-y-[-50%] rounded-full bg-white" style={{width: percentage + '%'}} />
          </div>
        </>}
      </ProgressBar>
    </div>
  );
}

function DatePickerExample() {
  return (
    <div className="flex items-start justify-center p-8 rounded-lg bg-linear-to-r from-violet-500 to-fuchsia-600">
      <DatePicker className="flex flex-col w-5/6 gap-1">
        <Label className="text-sm">Date</Label>
        <Group className="flex rounded-lg bg-white/90 focus-within:bg-white [&:has([data-pressed])]:bg-white transition pl-3 text-left shadow-md text-gray-700 focus:outline-hidden data-focus-visible:[&:not(:has(button[data-focus-visible]))]:ring-2 data-focus-visible:ring-black">
          <DateInput className="flex flex-1 py-2 sm:text-sm input">
            {(segment) => <DateSegment segment={segment} className="px-0.5 box-content tabular-nums text-right outline-hidden rounded-xs focus:bg-violet-700 focus:text-white group caret-transparent data-placeholder:italic" />}
          </DateInput>
          <Button className="px-2 transition border-l rounded-r-lg cursor-default outline-hidden border-l-purple-200 data-pressed:bg-purple-100 data-focus-visible:ring-2 data-focus-visible:ring-black">
            <ChevronUpDownIcon
              className="w-5 h-5 text-gray-500"
              aria-hidden="true" />
          </Button>
        </Group>
        <MyPopover>
          <Dialog className="p-6 text-gray-600">
            <AnimatedCalendar />
          </Dialog>
        </MyPopover>
      </DatePicker>
    </div>
  );
}

function ContactListExample() {
  return (
    <div className="flex justify-center p-8 rounded-lg bg-linear-to-r from-blue-500 to-sky-500">
      <ListBox aria-label="Contacts" selectionMode="multiple" selectionBehavior="replace" className="w-72 max-h-[290px] overflow-auto outline-hidden bg-white text-gray-700 p-2 flex flex-col gap-2 rounded-lg shadow-sm scroll-pb-2 scroll-pt-7">
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
      <Header className="sticky z-10 px-2 mb-1 font-serif text-sm font-bold bg-white -top-2 text-slate-700">{title}</Header>
      <Collection items={items}>
        {children}
      </Collection>
    </Section>
  );
}

function Contact({id, avatar, name, handle}) {
  return (
    <ListBoxItem id={id} textValue={name} className="group peer relative py-1 px-2 text-sm outline-hidden cursor-default grid grid-rows-2 grid-flow-col auto-cols-max gap-x-3 rounded-sm aria-selected:bg-blue-500 text-slate-700 aria-selected:text-white [&:has(+[aria-selected=true])]:aria-selected:rounded-b-none peer-aria-selected:aria-selected:rounded-t-none data-focus-visible:ring-2 ring-offset-2 ring-blue-500 [&[aria-selected=false]:has(+[aria-selected=false])_.divider]:block [&[aria-selected=true]:has(+[aria-selected=true])_.divider]:block">
      <img src={avatar} alt="" className="w-8 h-8 row-span-2 rounded-full place-self-center" />
      <Text slot="label" className="font-medium truncate">{name}</Text>
      <Text slot="description" className="text-xs truncate text-slate-600 group-aria-selected:text-white">{handle}</Text>
      <div className="absolute bottom-0 hidden h-px bg-gray-200 divider left-12 right-2 group-aria-selected:bg-blue-400" />
    </ListBoxItem>
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
    <div className="flex justify-center p-8 rounded-lg bg-linear-to-r from-sky-500 to-teal-500">
      <ListBox aria-label="Images" items={list.items} selectionMode="single" selectionBehavior="replace" className="max-h-[280px] overflow-auto outline-hidden bg-white rounded-lg shadow-sm p-2 grid grid-cols-3 gap-2">
        {item => (
          <ListBoxItem textValue={item.user.name} className="rounded-sm cursor-default outline-hidden group">
            <img src={item.urls.regular} alt={item.alt_description} className="w-full h-[80px] object-cover rounded-sm group-aria-selected:ring-3 group-aria-selected:ring-2 group-aria-selected:ring-offset-2 group-aria-selected:ring-sky-600" />
            <Text slot="label" className="text-[11px] text-gray-700 font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-full block mt-1">{item.user.name}</Text>
          </ListBoxItem>
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
    <div className="flex items-center justify-center p-8 rounded-lg bg-linear-to-r from-indigo-500 to-violet-500 md:col-span-2">
      <div className="max-h-[280px] overflow-auto scroll-pt-[2.321rem] relative bg-white rounded-lg shadow-sm text-gray-600">
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
                <StockCell><span className="px-1 font-mono border rounded-sm bg-slate-100 border-slate-200 group-aria-selected:bg-slate-700 group-aria-selected:border-slate-800">${item.symbol}</span></StockCell>
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
    <Column {...props} className="sticky top-0 px-4 py-2 text-sm font-bold text-left border-b cursor-default border-slate-300 bg-slate-200 first:rounded-tl-lg last:rounded-tr-lg whitespace-nowrap outline-hidden data-focus-visible:outline data-focus-visible:outline-2 data-focus-visible:outline-slate-600 data-focus-visible:-outline-offset-4">
      {({allowsSorting, sortDirection}) => (
        <span className="flex items-center">
          {props.children}
          {allowsSorting && (
            <span aria-hidden="true" className="w-4 h-4 ml-1">
              {sortDirection && <ArrowUpIcon className={`w-4 h-4 transition ${sortDirection === 'descending' ? 'rotate-180' : ''}`} />}
            </span>
          )}
        </span>
      )}
    </Column>
  );
}

function StockRow(props) {
  return <Row {...props} className="cursor-default even:bg-slate-100 aria-selected:bg-slate-600 aria-selected:text-white group outline-hidden data-focus-visible:outline data-focus-visible:outline-2 data-focus-visible:outline-slate-600 data-focus-visible:-outline-offset-4 aria-selected:data-focus-visible:outline-white" />;
}

function StockCell(props) {
  return <Cell {...props} className={`px-4 py-2 text-sm ${props.className} data-focus-visible:outline data-focus-visible:outline-2 data-focus-visible:outline-slate-600 data-focus-visible:-outline-offset-4 data-focus-visible:group-aria-selected:outline-white`} />;
}

function AutocompleteExample() {
  let {contains} = useFilter({sensitivity: 'base'});
  return (
    <div className="flex flex-col justify-center p-8 rounded-lg bg-linear-to-r from-sky-400 to-cyan-400">
      <Autocomplete filter={contains} className="flex flex-col w-5/6 gap-1">
        <SearchField>
          <Label className="text-sm text-black">Contacts</Label>
          <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white/90 focus-within:bg-white transition text-left shadow-md [&:has([data-focus-visible])]:ring-2 [&:has([data-focus-visible])]:ring-black sm:text-sm">
            <Input className="w-full py-2 pl-3 pr-2 leading-5 text-gray-900 bg-transparent border-none sm:text-sm outline-hidden" />
          </div>
        </SearchField>
        <div className="h-[300px] py-2 rounded-lg flex justify-center">
          <ListBox aria-label="Contacts" selectionMode="multiple" selectionBehavior="replace" className="w-72 max-h-[290px] overflow-auto outline-hidden bg-white text-gray-700 p-2 flex flex-col gap-2 rounded-lg shadow-sm scroll-pb-2 scroll-pt-7">
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
      </Autocomplete>
    </div>
  );
}

function TreeExample (
  { children, ...props }
) {
  return (
    <div className="flex flex-col justify-center p-8 rounded-lg bg-linear-to-r from-amber-500 to-rose-500">
      <AriaTree {...props} className={'w-72 h-[290px] overflow-auto outline-hidden bg-white text-gray-700 p-2 flex flex-col gap-2 rounded-lg shadow-sm scroll-pb-2 scroll-pt-7'}>
        <TreeItem id="documents" textValue="Documents">
          <TreeItemContent>
            Documents
          </TreeItemContent>
          <TreeItem id="project" textValue="Project">
            <TreeItemContent>
              Project
            </TreeItemContent>
            <TreeItem id="report" textValue="Weekly Report">
              <TreeItemContent>
                Weekly Report
              </TreeItemContent>
            </TreeItem>
          </TreeItem>
        </TreeItem>
        <TreeItem id="photos" textValue="Photos">
          <TreeItemContent>
            Photos
          </TreeItemContent>
          <TreeItem id="one" textValue="Image 1">
            <TreeItemContent>
              Image 1
            </TreeItemContent>
          </TreeItem>
          <TreeItem id="two" textValue="Image 2">
            <TreeItemContent>
              Image 2
            </TreeItemContent>
          </TreeItem>
        </TreeItem>
      </AriaTree>
    </div>
  );
}

export function TreeItem(props) {
  return (
    <AriaTreeItem {...props} className="group peer relative py-1 px-2 text-sm outline-hidden cursor-default flex gap-x-3 rounded-sm aria-selected:bg-blue-500 text-slate-700 aria-selected:text-white [&:has(+[aria-selected=true])]:aria-selected:rounded-b-none peer-aria-selected:aria-selected:rounded-t-none data-focus-visible:ring-2 ring-offset-2 ring-blue-500 [&[aria-selected=false]:has(+[aria-selected=false])_.divider]:block [&[aria-selected=true]:has(+[aria-selected=true])_.divider]:block" />
  )
}

export function TreeItemContent({ children, ...props }) {
  return (
    <AriaTreeItemContent {...props}>
      {({ selectionMode, selectionBehavior, hasChildItems }) => (
        <div className={`flex items-center`}>
          {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          <div className='shrink-0 w-[calc(calc(var(--tree-item-level)_-_1)_*_calc(var(--spacing)_*_3))]' />
          {hasChildItems ? (
            <Button slot="chevron" className="flex items-center justify-center w-8 h-8 rounded-lg cursor-default shrink-0 text-start">
              <ChevronRightIcon aria-hidden className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ease-in-out group-data-[expanded=true]:rotate-90" />
            </Button>
          ) : <div className='w-8 h-8 shrink-0' />}
          {children}
        </div>
      )}
    </AriaTreeItemContent>
  );
}

