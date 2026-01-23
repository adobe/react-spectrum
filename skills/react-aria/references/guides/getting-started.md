# Getting started

How to install React Aria and build your first component.

## Install

Install React Aria with your preferred package manager.

```bash
npm install react-aria-components
```

## Quick start

Copy and paste the CSS or [Tailwind](https://tailwindcss.com) examples into your project and make them your own. You can also download each example as a ZIP, open in StackBlitz, or install with [shadcn](https://ui.shadcn.com/docs/cli).

## Vanilla 

CSS example

```tsx
import {Select, SelectItem} from 'vanilla-starter/Select';

<Select label="Favorite animal">
  <SelectItem>Aardvark</SelectItem>
  <SelectItem>Cat</SelectItem>
  <SelectItem>Dog</SelectItem>
  <SelectItem>Kangaroo</SelectItem>
  <SelectItem>Panda</SelectItem>
  <SelectItem>Snake</SelectItem>
</Select>
```

### Select.tsx

```tsx
'use client';
import {
  ListBoxItemProps,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectValue,
  ValidationResult,
  ListBoxProps
} from 'react-aria-components';
import {Button} from './Button';
import {DropdownItem, DropdownListBox} from './ListBox';
import {ChevronDown} from 'lucide-react';
import {Popover} from './Popover';
import {Label, FieldError, Description} from './Form';
import './Select.css';

export interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }: SelectProps<
    T
  >
) {
  return (
    (
      <AriaSelect {...props}>
        {label && <Label>{label}</Label>}
        <Button>
          <SelectValue />
          <ChevronDown />
        </Button>
        {description && <Description>{description}</Description>}
        <FieldError>{errorMessage}</FieldError>
        <Popover hideArrow className="select-popover">
          <SelectListBox items={items}>
            {children}
          </SelectListBox>
        </Popover>
      </AriaSelect>
    )
  );
}

export function SelectListBox<T extends object>(props: ListBoxProps<T>) {
  return <DropdownListBox {...props} />;
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

```

### Select.css

```css
@import "./theme.css";

.react-aria-Select {
  color: var(--text-color);
  position: relative;
  width: 200px;

  .react-aria-Button {
    --button-color: var(--gray);
    padding: 0 var(--spacing-2) 0 var(--spacing-3);
    width: 100%;
    min-width: 0;

    &[data-pressed] {
      scale: 1;
    }
  }

  .react-aria-SelectValue {
    flex: 1;
    text-align: start;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &[data-placeholder] {
      color: var(--text-color-placeholder);
      font-weight: normal;
    }
  }

  .lucide-chevron-down {
    margin-inline-start: var(--spacing-2);
  }

  .react-aria-SelectValue {
    [slot=description] {
      display: none;
    }
  }
}

.select-popover[data-trigger=Select] {
  width: var(--trigger-width);
  padding: 0;
}

```

## Tailwind example

```tsx
import {Select, SelectItem} from 'tailwind-starter/Select';

<Select label="Favorite animal">
  <SelectItem>Aardvark</SelectItem>
  <SelectItem>Cat</SelectItem>
  <SelectItem>Dog</SelectItem>
  <SelectItem>Kangaroo</SelectItem>
  <SelectItem>Panda</SelectItem>
  <SelectItem>Snake</SelectItem>
</Select>
```

### Select.tsx

```tsx
'use client';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import {
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  Button,
  ListBox,
  ListBoxItemProps,
  SelectValue,
  ValidationResult
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Description, FieldError, Label } from './Field';
import { DropdownItem, DropdownSection, DropdownSectionProps } from './ListBox';
import { Popover } from './Popover';
import { composeTailwindRenderProps, focusRing } from './utils';

const styles = tv({
  extend: focusRing,
  base: 'flex items-center text-start gap-4 w-full font-sans border border-black/10 dark:border-white/10 cursor-default rounded-lg pl-3 pr-2 h-9 min-w-[180px] transition bg-neutral-50 dark:bg-neutral-700 [-webkit-tap-highlight-color:transparent]',
  variants: {
    isDisabled: {
      false: 'text-neutral-800 dark:text-neutral-300 hover:bg-neutral-100 pressed:bg-neutral-200 dark:hover:bg-neutral-600 dark:pressed:bg-neutral-500 group-invalid:outline group-invalid:outline-red-600 forced-colors:group-invalid:outline-[Mark]',
      true: 'border-transparent dark:border-transparent text-neutral-200 dark:text-neutral-600 forced-colors:text-[GrayText] bg-neutral-100 dark:bg-neutral-800'
    }
  }
});

export interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, 'children'> {
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: ValidationResult) => string);
  items?: Iterable<T>;
  children: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>(
  { label, description, errorMessage, children, items, ...props }: SelectProps<T>
) {
  return (
    <AriaSelect {...props} className={composeTailwindRenderProps(props.className, 'group flex flex-col gap-1 relative font-sans')}>
      {label && <Label>{label}</Label>}
      <Button className={styles}>
        <SelectValue className="flex-1 text-sm">
          {({selectedText, defaultChildren}) => selectedText || defaultChildren}
        </SelectValue>
        <ChevronDown aria-hidden className="w-4 h-4 text-neutral-600 dark:text-neutral-400 forced-colors:text-[ButtonText] group-disabled:text-neutral-200 dark:group-disabled:text-neutral-600 forced-colors:group-disabled:text-[GrayText]" />
      </Button>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="min-w-(--trigger-width)">
        <ListBox items={items} className="outline-hidden box-border p-1 max-h-[inherit] overflow-auto [clip-path:inset(0_0_0_0_round_.75rem)]">
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

export function SelectItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export function SelectSection<T extends object>(props: DropdownSectionProps<T>) {
  return <DropdownSection {...props} />;
}

```

### shadcn 

CLI

Use the [shadcn](https://ui.shadcn.com/docs/cli) CLI to add the example code, styles, and dependencies to your project. Install individual components using the menu on each example, or add all components with the command below.

<ShadcnCommand/>

### Storybook starter kits

If you're building a full component library, download a pre-built [Storybook](https://storybook.js.org/) starter kit. These include every component in a standalone development environment.

<StarterKits/>

### Working with 

AI

Use the menu on each page in the docs to open or copy it into your favorite AI assistant. We also have an [MCP server](mcp.md) which can be used directly in your IDE, and [llms.txt](llms.txt) which can help AI agents navigate the docs.

## Build a component from scratch

In this tutorial, we'll build a custom [Select](Select.md) component.

<StepList>
  <Step>
    ### <Counter/>Import and assemble the parts

    Each React Aria component renders a single DOM element. Complex components like `Select` compose together multiple parts to build a complete pattern.

    ```tsx
    import {Button, Label, ListBox, ListBoxItem, Popover, Select, SelectValue} from 'react-aria-components';

    <Select>
      <Label>Favorite Animal</Label>
      <Button>
        <SelectValue />
      </Button>
      <Popover>
        <ListBox>
          <ListBoxItem>Cat</ListBoxItem>
          <ListBoxItem>Dog</ListBoxItem>
          <ListBoxItem>Kangaroo</ListBoxItem>
        </ListBox>
      </Popover>
    </Select>
    ```
  </Step>

  <Step>
    ### <Counter/>Add your styles

    React Aria does not include any styles by default, allowing you to build custom designs to fit your application or design system. You can use any styling solution, including vanilla CSS, Tailwind CSS, CSS-in-JS, etc.

    Each React Aria component includes a default class name to use in your CSS, and data attributes for states such as pressed, hovered, selected, etc.

    ```css
    .react-aria-ListBoxItem {
      color: black;

      &[data-selected] {
        background: black;
        color: white;
      }
    }
    ```

    You can also override these defaults with a custom `className` prop, and access states via render props. Check out our [styling guide](styling.md) to learn more.
  </Step>

  <Step>
    ### <Counter/>Create a reusable component

    To reuse styles throughout your project, wrap all of the parts into a reusable component. Create your own API by extending React Aria's types with additional props. Components such as Popover can also be shared with other patterns so they don't need be styled separately each time.

    ```tsx
    import type {SelectProps as AriaSelectProps, ListBoxItemProps} from 'react-aria-components';
    import {Select as AriaSelect, Button, Label, ListBox, ListBoxItem, SelectValue} from 'react-aria-components';
    import {Popover} from './Popover';
    import './Select.css';

    export interface SelectProps extends AriaSelectProps {
      label?: string
    }

    export function Select(props: SelectProps) {
      return (
        <AriaSelect {...props}>
          <Label>{props.label}</Label>
          <Button className="select-button">
            <SelectValue />
          </Button>
          <Popover>
            <ListBox className="select-listbox">
              {props.children}
            </ListBox>
          </Popover>
        </AriaSelect>
      );
    }

    export function SelectItem(props: ListBoxItemProps) {
      return <ListBoxItem {...props} className="select-item" />;
    }
    ```
  </Step>

  <Step>
    ### <Counter/>Use your component

    Now you can render a consistently styled `<Select>` anywhere in your project!

    ```tsx
    import {Select, SelectItem} from './Select';

    function App() {
      return (
        <Select label="Favorite animal">
          <SelectItem>Cat</SelectItem>
          <SelectItem>Dog</SelectItem>
          <SelectItem>Kangaroo</SelectItem>
        </Select>
      );
    }
    ```
  </Step>
</StepList>

## Framework setup

React Aria works out of the box in any React framework. When you're ready, follow our [framework setup](frameworks.md) guide to optimize the bundle size, configure internationalization, and integrate with client side routers.
