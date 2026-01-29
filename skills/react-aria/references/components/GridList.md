# Grid

List

A grid list displays a list of interactive items, with support for keyboard navigation,
single or multiple selection, and row actions.

## Vanilla 

CSS example

```tsx
import {Text} from 'react-aria-components';
import {GridList, GridListItem} from 'vanilla-starter/GridList';

<GridList>
  <GridListItem textValue="Desert Sunset">
    <img src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} alt="" />
    <Text>Desert Sunset</Text>
    <Text slot="description">PNG • 2/3/2024</Text>
  </GridListItem>
  <GridListItem textValue="Hiking Trail">
    <img src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
    <Text>Hiking Trail</Text>
    <Text slot="description">JPEG • 1/10/2022</Text>
  </GridListItem>
  <GridListItem textValue="Lion">
    <img src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={899} alt="" />
    <Text>Lion</Text>
    <Text slot="description">JPEG • 8/28/2021</Text>
  </GridListItem>
  <GridListItem textValue="Mountain Sunrise">
    <img src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
    <Text>Mountain Sunrise</Text>
    <Text slot="description">PNG • 3/15/2015</Text>
  </GridListItem>
  <GridListItem textValue="Giraffe tongue">
    <img src="https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
    <Text>Giraffe tongue</Text>
    <Text slot="description">PNG • 11/27/2019</Text>
  </GridListItem>
  <GridListItem textValue="Golden Hour">
    <img src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={402} alt="" />
    <Text>Golden Hour</Text>
    <Text slot="description">WEBP • 7/24/2024</Text>
  </GridListItem>
  <GridListItem textValue="Architecture">
    <img src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} alt="" />
    <Text>Architecture</Text>
    <Text slot="description">PNG • 12/24/2016</Text>
  </GridListItem>
  <GridListItem textValue="Peeking leopard">
    <img src="https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} alt="" />
    <Text>Peeking leopard</Text>
    <Text slot="description">JPEG • 3/2/2016</Text>
  </GridListItem>
  <GridListItem textValue="Roofs">
    <img src="https://images.unsplash.com/photo-1721598359121-363311b3b263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc0fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} alt="" />
    <Text>Roofs</Text>
    <Text slot="description">JPEG • 4/24/2025</Text>
  </GridListItem>
  <GridListItem textValue="Half Dome Deer">
    <img src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={990} alt="" />
    <Text>Half Dome Deer</Text>
    <Text slot="description">DNG • 8/28/2018</Text>
  </GridListItem>
</GridList>
```

### Grid

List.tsx

```tsx
'use client';
import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps,
  GridListProps,
  GridListLoadMoreItem as AriaGridListLoadMoreItem,
  GridListLoadMoreItemProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';
import {GripVertical} from 'lucide-react';
import {ProgressCircle} from './ProgressCircle';
import './GridList.css';

export function GridList<T extends object>(
  { children, layout = 'grid', ...props }: GridListProps<T>
) {
  return (
    (
      <AriaGridList {...props} layout={layout}>
        {children}
      </AriaGridList>
    )
  );
}

export function GridListItem(
  { children, ...props }: Omit<GridListItemProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    (
      <AriaGridListItem textValue={textValue} {...props}>
        {({ selectionMode, selectionBehavior, allowsDragging }) => (
          <>
            {/* Add elements for drag and drop and selection. */}
            {allowsDragging && <Button slot="drag"><GripVertical size={16} /></Button>}
            {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
              <Checkbox slot="selection" />
            )}
            {children}
          </>
        )}
      </AriaGridListItem>
    )
  );
}

export function GridListLoadMoreItem(props: GridListLoadMoreItemProps) {
  return (
    <AriaGridListLoadMoreItem {...props}>
      <ProgressCircle isIndeterminate aria-label="Loading more..." />
    </AriaGridListLoadMoreItem>
  );
}

```

### Grid

List.css

```css
@import "./theme.css";

.react-aria-GridList {
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-2);
  scroll-padding: var(--spacing-2);
  border-radius: var(--radius);
  max-height: inherit;
  overflow: auto;
  forced-color-adjust: none;
  outline: none;
  width: 100%;
  max-height: 500px;
  min-height: 100px;
  box-sizing: border-box;
  --grid-item-size: 200px;

  &:has(.react-aria-GridListSection) {
    scroll-padding: 50px;
  }

  &[data-layout=grid]:not(:has(.react-aria-GridListSection)) {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, var(--grid-item-size)));
    grid-auto-rows: min-content;
  }

  &[data-layout=grid] > .react-aria-GridListSection {
    grid-template-columns: repeat(auto-fit, minmax(100px, var(--grid-item-size)));
    grid-auto-rows: min-content;
  }

  .react-aria-GridListSection:not(:first-child) {
    margin-top: var(--spacing-4);
  }

  &[data-layout=stack] > .react-aria-GridListSection {
    grid-template-columns: auto;
    align-items: center;
  }

  &[data-size=small] {
    --grid-item-size: 150px;
  }

  @media (width < 500px) {
    &[data-layout=grid] {
      --grid-item-size: 150px;
    }

    &[data-layout=grid]:not(:has(.react-aria-GridListSection)) {
      grid-template-columns: 1fr 1fr;
    }
  }

  &[data-layout=stack] {
    display: grid;
    grid-template-columns: auto;
    align-items: center;
  }

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
  }

  &[data-empty] {
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: italic;
  }

  &[data-drop-target] {
    outline: 2px solid var(--highlight-background);
    outline-offset: -1px;
    background: var(--highlight-overlay);
  }

  .react-aria-DropIndicator {
    display: none;
    &[data-drop-target] {
      display: block;
      outline: 2px solid var(--highlight-background);
      outline-offset: -1px;
      background: var(--highlight-overlay);
      border-radius: var(--radius);
    }
  }
}

.react-aria-GridListItem {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  border-radius: var(--radius);
  outline: none;
  cursor: default;
  color: var(--text-color);
  font: var(--font-size) system-ui;
  box-sizing: border-box;
  padding-bottom: var(--spacing-4);
  background: var(--overlay-background);
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.15);
  min-width: 0;
  max-width: 250px;
  overflow: clip;
  position: relative;
  transform: translateZ(0);
  transition-property: scale;
  transition-duration: 200ms;
  -webkit-tap-highlight-color: transparent;

  &[data-focus-visible] {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
  }

  &[data-pressed] {
    scale: 0.98;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: inherit;
    border: 2px solid light-dark(black, white);
    outline: 2px solid light-dark(rgb(255 255 255 / 0.7), rgb(0 0 0 / 0.7));
    outline-offset: -4px;
    opacity: 0;
    transition: opacity 200ms;
  }

  &[data-selected] {
    &::after {
      opacity: 1;
    }
  }

  &[data-href] {
    cursor: pointer;
  }

  &[data-disabled] {
    color: var(--text-color-disabled);
  }

  .react-aria-Checkbox {
    position: absolute;
    top: var(--spacing-4);
    inset-inline-start: var(--spacing-4);
    --focus-ring-color: var(--highlight-foreground);
    --checkmark-color: light-dark(white, black);

    .indicator {
      --indicator-border: light-dark(rgb(0 0 0 / 0.9), rgb(255 255 255 / 0.7));

      @media (forced-colors: active) {
        --indicator-border: ButtonBorder;
      }
    }

    &[data-selected] .indicator {
      --indicator-color: light-dark(black, var(--highlight-foreground));
      --indicator-shadow: transparent;

      @media (forced-colors: active) {
        --indicator-color: Highlight;
        --checkmark-color: HighlightText;
      }
    }

    &::before {
      content: '';
      position: absolute;
      inset: -4px;
      background: light-dark(rgb(255 255 255 / 0.51), rgb(0 0 0 / 0.56));
      box-shadow: rgba(0, 0, 0, 0.24) 0px 2px 8px 0px;
      border-radius: var(--radius);
    }
  }

  img {
    width: 100%;
    height: var(--grid-item-size);
    object-fit: cover;
    padding-bottom: var(--spacing-2);
    -webkit-user-drag: none;
    -webkit-touch-callout: none;
    flex-shrink: 0;
  }

  .react-aria-Text {
    padding: 0 var(--spacing-4);
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;

    &:not([slot]) {
      font-weight: 500;
    }

    &[slot=description] {
      font-size: var(--font-size-sm);
    }
  }

  .react-aria-Button[slot=drag] {
    all: unset;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: var(--spacing-2);
    inset-inline-end: var(--spacing-2);
    border-radius: var(--radius);
    color: var(--text-color);

    &[data-focus-visible] {
      border-radius: 4px;
      outline: 2px solid var(--focus-ring-color);
    }
  }

  &[data-dragging] {
    opacity: 0.6;
  }

  &[data-drop-target] {
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      z-index: 5;
      outline: 2px solid var(--highlight-background);
      outline-offset: -2px;
      background: var(--highlight-overlay);
    }
  }
}

.react-aria-GridListLoadingIndicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 100%;
}

.react-aria-GridListSection {
  display: grid;
  justify-content: center;
  gap: var(--spacing-4);
  color: var(--text-color);
  width: 100%;

  > .react-aria-GridListHeader {
      grid-column: 1 / -1;
  }
}

.react-aria-GridListHeader {
  position: sticky;
  z-index: 2;
  top: -8px;
  font-size: var(--font-size-lg);
  font-weight: 500;
  background: var(--gray-100);
  border: 0.5px solid var(--gray-400);
  cursor: default;
  user-select: none;
  box-shadow: inset 0px 1px 0px white, inset 0px -4px 8px var(--gray-200);
  border-radius: var(--radius);
  padding: var(--spacing-1) var(--spacing-4);

  @media (prefers-color-scheme: dark) {
    box-shadow: inset 0px 4px 8px var(--gray-200);
  }
}

```

## Tailwind example

```tsx
import {GridList, GridListItem} from 'tailwind-starter/GridList';

<GridList>
  <GridListItem>Aardvark</GridListItem>
  <GridListItem>Cat</GridListItem>
  <GridListItem>Dog</GridListItem>
  <GridListItem>Kangaroo</GridListItem>
  <GridListItem>Panda</GridListItem>
  <GridListItem>Snake</GridListItem>
</GridList>
```

### Grid

List.tsx

```tsx
'use client';
import React from 'react';
import {
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListHeader as AriaGridListHeader,
  Button,
  composeRenderProps,
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { Checkbox } from './Checkbox';
import { composeTailwindRenderProps, focusRing } from './utils';
import {HTMLAttributes} from 'react';
import { twMerge } from 'tailwind-merge';

export function GridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    <AriaGridList {...props} className={composeTailwindRenderProps(props.className, 'overflow-auto w-[200px] relative bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg font-sans empty:flex empty:items-center empty:justify-center empty:italic empty:text-sm')}>
      {children}
    </AriaGridList>
  );
}

const itemStyles = tv({
  extend: focusRing,
  base: 'relative flex gap-3 cursor-default select-none py-2 px-3 text-sm text-neutral-900 dark:text-neutral-200 border-t dark:border-t-neutral-700 border-transparent first:border-t-0 first:rounded-t-lg last:rounded-b-lg last:mb-0 -outline-offset-2',
  variants: {
    isSelected: {
      false: 'hover:bg-neutral-100 pressed:bg-neutral-100 dark:hover:bg-neutral-700/60 dark:pressed:bg-neutral-700/60',
      true: 'bg-blue-100 dark:bg-blue-700/30 hover:bg-blue-200 pressed:bg-blue-200 dark:hover:bg-blue-700/40 dark:pressed:bg-blue-700/40 border-y-blue-200 dark:border-y-blue-900 z-20'
    },
    isDisabled: {
      true: 'text-neutral-300 dark:text-neutral-600 forced-colors:text-[GrayText] z-10'
    }
  }
});

export function GridListItem({ children, ...props }: GridListItemProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className={itemStyles}>
      {composeRenderProps(children, (children, {selectionMode, selectionBehavior, allowsDragging}) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {allowsDragging && <Button slot="drag">≡</Button>}
          {selectionMode !== 'none' && selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      ))}
    </AriaGridListItem>
  );
}

export function GridListHeader({children, ...props}: HTMLAttributes<HTMLElement>) {
  return (
    <AriaGridListHeader {...props} className={twMerge("text-sm font-semibold text-neutral-500 dark:text-neutral-300 px-4 py-1 -mt-px z-10 bg-neutral-100/60 dark:bg-neutral-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-neutral-100 border-y border-y-neutral-200 dark:border-y-neutral-700", props.className)}>{children}</AriaGridListHeader>
  )
}

```

## Content

`GridList` follows the [Collection Components API](collections.md?component=GridList), accepting both static and dynamic collections. This example shows a dynamic collection, passing a list of objects to the `items` prop, and a function to render the children.

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';

let images = [
  {
    id: "8SXaMMWCTGc",
    title: "A Ficus Lyrata Leaf",
    user: "Clay Banks",
    image: "https://images.unsplash.com/photo-1580133318324-f2f76d987dd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "pYjCqqDEOFo",
    title: "Italian beach",
    user: "Alan Bajura",
    image: "https://images.unsplash.com/photo-1737100522891-e8946ac97fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "CF-2tl6MQj0",
    title: "Forest road",
    user: "Artem Stoliar",
    image: "https://images.unsplash.com/photo-1738249034651-1896f689be58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 300
  },
  {
    id: "OW97sLU0cOw",
    title: "Snowy Aurora",
    user: "Janosch Diggelmann",
    image: "https://images.unsplash.com/photo-1738189669835-61808a9d5981?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "WfeLZ02IhkM",
    title: "A blue and white firework is seen from above",
    user: "Janosch Diggelmann",
    image: "https://images.unsplash.com/photo-1738168601630-1c1f3ef5a95a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 300
  },
  {
    id: "w1GpST72Bg8",
    title: "Snowy Mountain",
    user: "Daniil Silantev",
    image: "https://images.unsplash.com/photo-1738165170747-ecc6e3a4d97c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 267
  },
  {
    id: "0iN0KIt6lYI",
    title: "Pastel Sunset",
    user: "Marek Piwnicki",
    image: "https://images.unsplash.com/photo-1737917818689-f3b3708de5d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 640
  },
  {
    id: "-mFKPfXXUG0",
    title: "Snowy Birches",
    user: "Simon Berger",
    image: "https://images.unsplash.com/photo-1737972970322-cc2e255021bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 400
  },
  {
    id: "y36Nj_edtRE",
    title: "Snowy Lake Reflections",
    user: "Daniel Seßler",
    image: "https://images.unsplash.com/photo-1736018545810-3de4c7ec25fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "NvBV-YwlgBw",
    title: "Rocky night sky",
    user: "Dennis Haug",
    image: "https://images.unsplash.com/photo-1735528655501-cf671a3323c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 400
  },
  {
    id: "UthQdrPFxt0",
    title: "A pine tree covered in snow in a forest",
    user: "Anita Austvika",
    image: "https://images.unsplash.com/photo-1737312905026-5dfdff1097bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "2k74xaf8dfc",
    title: "The sun shines through the trees in the forest",
    user: "Joyce G",
    image: "https://images.unsplash.com/photo-1736185597807-371cae1c7e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "Yje5kgfvCm0",
    title: "A blurry photo of a field of flowers",
    user: "Eugene Golovesov",
    image: "https://images.unsplash.com/photo-1736483065204-e55e62092780?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "G2bsj2LVttI",
    title: "A foggy road lined with trees and grass",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737903071772-4d20348b4d81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 533
  },
  {
    id: "ppyNBOkfiuY",
    title: "A close up of a green palm tree",
    user: "Junel Mujar",
    image: "https://images.unsplash.com/photo-1736849544918-6ddb5cfc2c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 533
  },
  {
    id: "UcWUMqIsld8",
    title: "A green leaf floating on top of a body of water",
    user: "Allec Gomes",
    image: "https://images.unsplash.com/photo-1737559217439-a5703e9b65cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "xHqOVq9w8OI",
    title: "Leafy plants",
    user: "Joshua Michaels",
    image: "https://images.unsplash.com/photo-1563364664-399838d1394c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 266
  },
  {
    id: "uWx3_XEc-Jw",
    title: "A view of a mountain covered in fog",
    user: "iuliu illes",
    image: "https://images.unsplash.com/photo-1737403428945-c584529b7b17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 298
  },
  {
    id: "2_3lhGt8i-Y",
    title: "A field with tall grass and fog in the background",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737439987404-a3ee9fb95351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "FV-__IOxb08",
    title: "A close up of a wave on a sandy beach",
    user: "Jonathan Borba",
    image: "https://images.unsplash.com/photo-1726502102472-2108ef2a5cae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "_BS-vK3boOU",
    title: "Desert textures",
    user: "Braden Jarvis",
    image: "https://images.unsplash.com/photo-1722359546494-8e3a00f88e95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 561
  },
  {
    id: "LjAcS9lJdBg",
    title: "Tew Falls, waterfall, in Hamilton, Canada.",
    user: "Andre Portolesi",
    image: "https://images.unsplash.com/photo-1705021246536-aecfad654893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 500
  },
  {
    id: "hlj6xJG30FE",
    title: "Cave light rays",
    user: "Intricate Explorer",
    image: "https://images.unsplash.com/photo-1631641551473-fbe46919289d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 267
  },
  {
    id: "vMoZvKeZOhw",
    title: "Salt Marshes, Isle of Harris, Scotland",
    user: "Nils Leonhardt",
    image: "https://images.unsplash.com/photo-1585951301678-8fd6f3b32c7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "wCLCK9LDDjI",
    title: "An aerial view of a snow covered forest",
    user: "Lukas Hädrich",
    image: "https://images.unsplash.com/photo-1737405555489-78b3755eaa81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 267
  },
  {
    id: "OdDx3_NB-Wk",
    title: "Tall grass",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737301519296-062cd324dbfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "Gn-FOw1geFc",
    title: "Larches on Maple Pass, Washington",
    user: "Noelle",
    image: "https://images.unsplash.com/photo-1737496538329-a59d10148a08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "VhKJHOz2tJ8",
    title: "Heart Nebula",
    user: "Arnaud Girault",
    image: "https://images.unsplash.com/photo-1737478598284-b9bc11cb1e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 266
  },
  {
    id: "w5QmH_uqB0U",
    title: "A pile of shells sitting on top of a sandy beach",
    user: "Toa Heftiba",
    image: "https://images.unsplash.com/photo-1725366351350-a64a1be919ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  }
];

function Example() {
  return (
    <GridList
      aria-label="Nature photos"
      selectionMode="multiple"
      layout="grid"
      /*- begin highlight -*/
      items={images}>
      {/*- end highlight -*/}
      {(image) => (
        <GridListItem textValue={image.title}>
          <img src={image.image} width={image.width} height={image.height} alt="" />
          <Text>{image.title}</Text>
          <Text slot="description">By {image.user}</Text>
        </GridListItem>
      )}
    </GridList>
  );
}
```

### Asynchronous loading

Use [renderEmptyState](#empty-state) to display a spinner during initial load. To enable infinite scrolling, render a `<GridListLoadMoreItem>` at the end of the list. Use whatever data fetching library you prefer – this example uses `useAsyncList` from `react-stately`.

```tsx
import {GridList, GridListItem, GridListLoadMoreItem} from 'vanilla-starter/GridList';
import {Collection, Text} from 'react-aria-components';
import {ProgressCircle} from 'vanilla-starter/ProgressCircle';
import {useAsyncList} from '@react-stately/data';

type Item = {
  id: string;
  description?: string;
  alt_description?: string;
  urls: {regular: string};
  width: number;
  height: number;
  user: {name: string};
};

function AsyncLoadingExample() {
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

  return (
    <GridList
      aria-label="Nature photos"
      layout="grid"
      selectionMode="multiple"
      renderEmptyState={() => (
        <ProgressCircle isIndeterminate aria-label="Loading..." />
      )}>
      <Collection items={list.items}>
        {(item) => (
          <GridListItem textValue={item.description || item.alt_description}>
            <img src={item.urls.regular} width={item.width} height={item.height} alt="" />
            <Text>{item.description || item.alt_description}</Text>
            <Text slot="description">By {item.user.name}</Text>
          </GridListItem>
        )}
      </Collection>
      {/*- begin highlight -*/}
      <GridListLoadMoreItem
        onLoadMore={list.loadMore}
        isLoading={list.loadingState === 'loadingMore'} />
      {/*- end highlight -*/}
    </GridList>
  );
}
```

### Links

Use the `href` prop on a `<GridListItem>` to create a link. See the [framework setup guide](frameworks.md) to learn how to integrate with your framework. Link interactions vary depending on the selection behavior. See the [selection guide](selection.md?component=GridList#selection-behavior) for more details.

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {Text} from 'react-aria-components';

let images = [
  {
    id: "dxylfBs2Xzc",
    title: "Tropical island",
    image: "https://images.unsplash.com/photo-1757258632083-e9b8a5345047?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 5464,
    height: 3640,
    href: "https://unsplash.com/photos/aerial-view-of-a-tropical-island-coastline-with-clear-blue-water-dxylfBs2Xzc"
  },
  {
    id: "xloDEfz0X7g",
    title: "Bryce Canyon",
    image: "https://images.unsplash.com/photo-1759872409669-05565abbb575?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 4032,
    height: 3024,
    href: "https://unsplash.com/photos/orange-rock-formations-with-green-trees-and-blue-sky-xloDEfz0X7g"
  },
  {
    id: "oTBY78rZcEU",
    title: "Snowy river",
    image: "https://images.unsplash.com/photo-1735577561802-380c3afb0146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 3264,
    height: 4896,
    href: "https://unsplash.com/photos/a-river-surrounded-by-snow-covered-trees-and-mountains-oTBY78rZcEU"
  },
  {
    id: "Go811IU9a2g",
    title: "Ocean waves",
    image: "https://images.unsplash.com/photo-1759997604062-c31f20012ac1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 5250,
    height: 3500,
    href: "https://unsplash.com/photos/a-large-wave-crashes-on-a-sandy-beach-Go811IU9a2g"
  },
  {
    id: "B0mydNIV-sI",
    title: "Mount Kazbek at Dawn",
    image: "https://images.unsplash.com/photo-1760464864365-2188cd2afcde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 3947,
    height: 5920,
    href: "https://unsplash.com/photos/snow-capped-mountain-peak-illuminated-by-sunrise-B0mydNIV-sI"
  },
  {
    id: "IHfbPJYsnsI",
    title: "Snowy mountain sunrise",
    image: "https://images.unsplash.com/photo-1759675795062-a657fcb278b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 5794,
    height: 3360,
    href: "https://unsplash.com/photos/snowy-mountains-rise-from-the-ocean-at-sunrise-IHfbPJYsnsI"
  },
  {
    id: "mmcSaJrRuCM",
    title: "Mount Blum",
    image: "https://images.unsplash.com/photo-1760301269447-fbc82b5a8d14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 5862,
    height: 4000,
    href: "https://unsplash.com/photos/majestic-mountain-peak-illuminated-by-sunrise-light-mmcSaJrRuCM"
  },
  {
    id: "SSpEIUBRG9s",
    title: "Sunset",
    image: "https://images.unsplash.com/photo-1760199025509-2ecc68d39acd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2MDYyMjY4NHw&ixlib=rb-4.1.0&q=80&w=1080",
    width: 6000,
    height: 4000,
    href: "https://unsplash.com/photos/silhouette-of-trees-and-plants-against-a-sunset-sky-SSpEIUBRG9s"
  }
];

<GridList layout="grid" items={images}>
  {image => (
    <GridListItem
      /*- begin highlight -*/
      href={image.href}
      target="_blank"
      /*- end highlight -*/
      textValue={image.title}>
      <img src={image.image} width={image.width} height={image.height} alt="" />
      <Text>{image.title}</Text>
    </GridListItem>
  )}
</GridList>
```

### Empty state

```tsx
import {GridList} from 'vanilla-starter/GridList';

<GridList
  aria-label="Search results"
  renderEmptyState={() => 'No results found.'}>
  {[]}
</GridList>
```

### Sections (alpha)

Use the `<GridListSection>` component to group options. A `<GridListHeader>` element may also be included to label the section. Sections without a header must have an `aria-label`.

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {GridListHeader, GridListSection, Text} from 'react-aria-components';

<GridList
  layout="grid"
  aria-label="Photos">
    <GridListSection>
      <GridListHeader>Fruit</GridListHeader>
      <GridListItem textValue="Apple">
        <img src="https://images.unsplash.com/photo-1630563451961-ac2ff27616ab?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} />
        <Text>Apple</Text>
        <Text slot="description">PNG • 9/2/2021</Text>
      </GridListItem>
      <GridListItem textValue="Peach">
        <img src="https://images.unsplash.com/photo-1642372849486-f88b963cb734?q=80&w=2858&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
        <Text>Peach</Text>
        <Text slot="description">JPEG • 1/16/2022</Text>
      </GridListItem>
      <GridListItem textValue="Blueberry">
        <img src="https://images.unsplash.com/photo-1606757389667-45c2024f9fa4?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
        <Text>Blueberry</Text>
        <Text slot="description">JPEG • 11/30/2020</Text>
      </GridListItem>
    </GridListSection>
    <GridListSection>
      <GridListHeader>Vegetables</GridListHeader>
      <GridListItem textValue="Broccoli">
        <img src="https://images.unsplash.com/photo-1685504445355-0e7bdf90d415?q=80&w=928&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
        <Text>Broccoli</Text>
        <Text slot="description">PNG • 5/30/2023</Text>
      </GridListItem>
      <GridListItem textValue="Brussels Sprouts">
        <img src="https://images.unsplash.com/photo-1685504507286-dc290728c01a?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
        <Text>Brussels Sprouts</Text>
        <Text slot="description">PNG • 7/3/2021</Text>
      </GridListItem>
      <GridListItem textValue="Peas">
        <img src="https://images.unsplash.com/photo-1587411768345-867e228218c8?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} />
        <Text>Peas</Text>
        <Text slot="description">PNG • 4/20/2020</Text>
      </GridListItem>
    </GridListSection>
</GridList>
```

## Selection and actions

Use the `selectionMode` prop to enable single or multiple selection. The selected items can be controlled via the `selectedKeys` prop, matching the `id` prop of the items. The `onAction` event handles item actions. Items can be disabled with the `isDisabled` prop. See the [selection guide](selection.md?component=GridList) for more details.

```tsx
import {type Selection, Text} from 'react-aria-components';
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {useState} from 'react';

function Example(props) {
  let [selected, setSelected] = useState<Selection>(new Set());

  return (
    <>
      <GridList
        {...props}
        aria-label="Nature photos"
        layout="grid"
        
        selectedKeys={selected}
        onSelectionChange={setSelected}
        onAction={key => alert(`Clicked ${key}`)}
      >
        <GridListItem id={1} textValue="Desert Sunset">
          <img src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} alt="" />
          <Text>Desert Sunset</Text>
          <Text slot="description">PNG • 2/3/2024</Text>
        </GridListItem>
        <GridListItem id={2} isDisabled textValue="Hiking Trail">
          <img src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
          <Text>Hiking Trail</Text>
          <Text slot="description">JPEG • 1/10/2022</Text>
        </GridListItem>
        <GridListItem id={3} textValue="Lion">
          <img src="https://images.unsplash.com/photo-1629812456605-4a044aa38fbc?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={899} alt="" />
          <Text>Lion</Text>
          <Text slot="description">JPEG • 8/28/2021</Text>
        </GridListItem>
        <GridListItem id={4} textValue="Mountain Sunrise">
          <img src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
          <Text>Mountain Sunrise</Text>
          <Text slot="description">PNG • 3/15/2015</Text>
        </GridListItem>
        <GridListItem id={5} textValue="Giraffe tongue">
          <img src="https://images.unsplash.com/photo-1574870111867-089730e5a72b?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={900} alt="" />
          <Text>Giraffe tongue</Text>
          <Text slot="description">PNG • 11/27/2019</Text>
        </GridListItem>
        <GridListItem id={6} textValue="Golden Hour">
          <img src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={402} alt="" />
          <Text>Golden Hour</Text>
          <Text slot="description">WEBP • 7/24/2024</Text>
        </GridListItem>
        <GridListItem id={7} textValue="Architecture">
          <img src="https://images.unsplash.com/photo-1721661657253-6621d52db753?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDYxfE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} alt="" />
          <Text>Architecture</Text>
          <Text slot="description">PNG • 12/24/2016</Text>
        </GridListItem>
        <GridListItem id={8} textValue="Peeking leopard">
          <img src="https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={400} alt="" />
          <Text>Peeking leopard</Text>
          <Text slot="description">JPEG • 3/2/2016</Text>
        </GridListItem>
        <GridListItem id={9} textValue="Roofs">
          <img src="https://images.unsplash.com/photo-1721598359121-363311b3b263?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHx0b3BpYy1mZWVkfDc0fE04alZiTGJUUndzfHxlbnwwfHx8fHw%3D" width={600} height={900} alt="" />
          <Text>Roofs</Text>
          <Text slot="description">JPEG • 4/24/2025</Text>
        </GridListItem>
        <GridListItem id={10} textValue="Half Dome Deer">
          <img src="https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" width={600} height={990} alt="" />
          <Text>Half Dome Deer</Text>
          <Text slot="description">DNG • 8/28/2018</Text>
        </GridListItem>
      </GridList>
      <p>Current selection: {selected === 'all' ? 'all' : [...selected].join(', ')}</p>
    </>
  );
}
```

## Drag and drop

GridList supports drag and drop interactions when the `dragAndDropHooks` prop is provided using the `useDragAndDrop` hook. Users can drop data on the list as a whole, on individual items, insert new items between existing ones, or reorder items. React Aria supports drag and drop via mouse, touch, keyboard, and screen reader interactions. See the [drag and drop guide](dnd.md?component=GridList) to learn more.

```tsx
import {GridList, GridListItem} from 'vanilla-starter/GridList';
import {useDragAndDrop, Text, useListData} from 'react-aria-components';

let images = [
  {
    id: "8SXaMMWCTGc",
    title: "A Ficus Lyrata Leaf in the sunlight (2/2) (IG: @clay.banks)",
    user: "Clay Banks",
    image: "https://images.unsplash.com/photo-1580133318324-f2f76d987dd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "pYjCqqDEOFo",
    title: "beach of Italy",
    user: "alan bajura",
    image: "https://images.unsplash.com/photo-1737100522891-e8946ac97fd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "CF-2tl6MQj0",
    title: "A winding road in the middle of a forest",
    user: "Artem Stoliar",
    image: "https://images.unsplash.com/photo-1738249034651-1896f689be58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 300
  },
  {
    id: "OW97sLU0cOw",
    title: "A green and purple aurora over a snow covered forest",
    user: "Janosch Diggelmann",
    image: "https://images.unsplash.com/photo-1738189669835-61808a9d5981?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "WfeLZ02IhkM",
    title: "A blue and white firework is seen from above",
    user: "Janosch Diggelmann",
    image: "https://images.unsplash.com/photo-1738168601630-1c1f3ef5a95a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 300
  },
  {
    id: "w1GpST72Bg8",
    title: "A snow covered mountain with a sky background",
    user: "Daniil Silantev",
    image: "https://images.unsplash.com/photo-1738165170747-ecc6e3a4d97c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 267
  },
  {
    id: "0iN0KIt6lYI",
    title: "\"Pastel Sunset\"",
    user: "Marek Piwnicki",
    image: "https://images.unsplash.com/photo-1737917818689-f3b3708de5d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 640
  },
  {
    id: "-mFKPfXXUG0",
    title: "Leave the weight behind! You must make yourself light to strive upwards — to reach the light. (A serene winter landscape featuring a dense collection of bare, white trees.)",
    user: "Simon Berger",
    image: "https://images.unsplash.com/photo-1737972970322-cc2e255021bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 400
  },
  {
    id: "MOk6URQ28R4",
    title: "A snow covered tree with a sky background",
    user: "Daniil Silantev",
    image: "https://images.unsplash.com/photo-1738081359113-a7a33c509cf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "y36Nj_edtRE",
    title: "A lake surrounded by trees covered in snow",
    user: "Daniel Seßler",
    image: "https://images.unsplash.com/photo-1736018545810-3de4c7ec25fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "NvBV-YwlgBw",
    title: "The night sky with stars above a rock formation",
    user: "Dennis Haug",
    image: "https://images.unsplash.com/photo-1735528655501-cf671a3323c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 400
  },
  {
    id: "UthQdrPFxt0",
    title: "A pine tree covered in snow in a forest",
    user: "Anita Austvika",
    image: "https://images.unsplash.com/photo-1737312905026-5dfdff1097bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "2k74xaf8dfc",
    title: "The sun shines through the trees in the forest",
    user: "Joyce G",
    image: "https://images.unsplash.com/photo-1736185597807-371cae1c7e4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "Yje5kgfvCm0",
    title: "A blurry photo of a field of flowers",
    user: "Eugene Golovesov",
    image: "https://images.unsplash.com/photo-1736483065204-e55e62092780?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "G2bsj2LVttI",
    title: "A foggy road lined with trees and grass",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737903071772-4d20348b4d81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 533
  },
  {
    id: "ppyNBOkfiuY",
    title: "A close up of a green palm tree",
    user: "Junel Mujar",
    image: "https://images.unsplash.com/photo-1736849544918-6ddb5cfc2c42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 533
  },
  {
    id: "UcWUMqIsld8",
    title: "A green leaf floating on top of a body of water",
    user: "Allec Gomes",
    image: "https://images.unsplash.com/photo-1737559217439-a5703e9b65cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "xHqOVq9w8OI",
    title: "green-leafed plant",
    user: "Joshua Michaels",
    image: "https://images.unsplash.com/photo-1563364664-399838d1394c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 266
  },
  {
    id: "uWx3_XEc-Jw",
    title: "A view of a mountain covered in fog",
    user: "iuliu illes",
    image: "https://images.unsplash.com/photo-1737403428945-c584529b7b17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 298
  },
  {
    id: "2_3lhGt8i-Y",
    title: "A field with tall grass and fog in the background",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737439987404-a3ee9fb95351?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "FV-__IOxb08",
    title: "A close up of a wave on a sandy beach",
    user: "Jonathan Borba",
    image: "https://images.unsplash.com/photo-1726502102472-2108ef2a5cae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "_BS-vK3boOU",
    title: "Desert textures",
    user: "Braden Jarvis",
    image: "https://images.unsplash.com/photo-1722359546494-8e3a00f88e95?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 561
  },
  {
    id: "LjAcS9lJdBg",
    title: "Tew Falls, waterfall, in Hamilton, Canada.",
    user: "Andre Portolesi",
    image: "https://images.unsplash.com/photo-1705021246536-aecfad654893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 500
  },
  {
    id: "hlj6xJG30FE",
    title: "Find me on Instagram! @intricateexplorer",
    user: "Intricate Explorer",
    image: "https://images.unsplash.com/photo-1631641551473-fbe46919289d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 267
  },
  {
    id: "vMoZvKeZOhw",
    title: "Salt Marshes, Isle of Harris, Scotland by Nils Leonhardt. Visit my website: https://nilsleonhardt.com/storytelling-harris/ Instagram: @am.basteir",
    user: "Nils Leonhardt",
    image: "https://images.unsplash.com/photo-1585951301678-8fd6f3b32c7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "wCLCK9LDDjI",
    title: "An aerial view of a snow covered forest",
    user: "Lukas Hädrich",
    image: "https://images.unsplash.com/photo-1737405555489-78b3755eaa81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 267
  },
  {
    id: "OdDx3_NB-Wk",
    title: "A close up of a tall grass with a sky in the background",
    user: "Ingmar H",
    image: "https://images.unsplash.com/photo-1737301519296-062cd324dbfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "Gn-FOw1geFc",
    title: "Larches on Maple Pass, Washington",
    user: "noelle",
    image: "https://images.unsplash.com/photo-1737496538329-a59d10148a08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  },
  {
    id: "VhKJHOz2tJ8",
    title: "IC 1805 La nébuleuse du coeur",
    user: "arnaud girault",
    image: "https://images.unsplash.com/photo-1737478598284-b9bc11cb1e9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 266
  },
  {
    id: "w5QmH_uqB0U",
    title: "A pile of shells sitting on top of a sandy beach",
    user: "Toa Heftiba",
    image: "https://images.unsplash.com/photo-1725366351350-a64a1be919ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTczODM2NzE4M3w&ixlib=rb-4.0.3&q=80&w=400",
    width: 400,
    height: 600
  }
];

function Example() {
  let list = useListData({
    initialItems: images
  });

  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys, items: typeof list.items) => items.map(item => ({'text/plain': item.title})),
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return (
    <GridList
      aria-label="Reorderable list"
      layout="grid"
      selectionMode="multiple"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
    >
      {image => (
        <GridListItem textValue={image.title}>
          <img src={image.image} width={image.width} height={image.height} alt="" />
          <Text>{image.title}</Text>
          <Text slot="description">{image.user}</Text>
        </GridListItem>
      )}
    </GridList>
  );
}
```

## Examples

<ExampleList
  tag="gridlist"
  pages={props.pages}
/>

## A

PI

```tsx
<GridList>
  <GridListItem>
    <Button slot="drag" />
    <Checkbox slot="selection" /> or <SelectionIndicator />
  </GridListItem>
  <GridListLoadMoreItem />
</GridList>
```

### Grid

List

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `autoFocus` | `boolean | FocusStrategy | undefined` | — | Whether to auto focus the gridlist or an option. |
| `children` | `React.ReactNode | ((item: T) => ReactNode)` | — | The contents of the collection. |
| `className` | `ClassNameOrFunction<GridListRenderProps> | undefined` | 'react-aria-GridList' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `defaultSelectedKeys` | `Iterable<Key> | "all" | undefined` | — | The initial selected keys in the collection (uncontrolled). |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `disabledBehavior` | `DisabledBehavior | undefined` | "all" | Whether `disabledKeys` applies to all interactions, or only selection. |
| `disabledKeys` | `Iterable<Key> | undefined` | — | The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with. |
| `disallowEmptySelection` | `boolean | undefined` | — | Whether the collection allows empty selection. |
| `disallowTypeAhead` | `boolean | undefined` | false | Whether typeahead navigation is disabled. |
| `dragAndDropHooks` | `DragAndDropHooks<NoInfer<T>> | undefined` | — | The drag and drop hooks returned by `useDragAndDrop` used to enable drag and drop behavior for the GridList. |
| `escapeKeyBehavior` | `"none" | "clearSelection" | undefined` | 'clearSelection' | Whether pressing the escape key should clear selection in the grid list or not. Most experiences should not modify this option as it eliminates a keyboard user's ability to easily clear selection. Only use if the escape key is being handled externally or should not trigger selection clearing contextually. |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `inert` | `boolean | undefined` | — |  |
| `items` | `Iterable<T> | undefined` | — | Item objects in the collection. |
| `keyboardNavigationBehavior` | `"arrow" | "tab" | undefined` | 'arrow' | Whether keyboard navigation to focusable elements within grid list items is via the left/right arrow keys or the tab key. |
| `lang` | `string | undefined` | — |  |
| `layout` | `"grid" | "stack" | undefined` | 'stack' | Whether the items are arranged in a stack or grid. |
| `onAction` | `((key: Key) => void) | undefined` | — | Handler that is called when a user performs an action on an item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onSelectionChange` | `((keys: Selection) => void) | undefined` | — | Handler that is called when the selection changes. |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `renderEmptyState` | `((props: GridListRenderProps) => ReactNode) | undefined` | — | Provides content to display when there are no items in the list. |
| `selectedKeys` | `Iterable<Key> | "all" | undefined` | — | The currently selected keys in the collection (controlled). |
| `selectionBehavior` | `SelectionBehavior | undefined` | "toggle" | How multiple selection should behave in the collection. |
| `selectionMode` | `SelectionMode | undefined` | — | The type of selection that is allowed in the collection. |
| `shouldSelectOnPressUp` | `boolean | undefined` | — | Whether selection should occur on press up instead of press down. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `style` | `(React.CSSProperties | ((values: GridListRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `translate` | `"yes" | "no" | undefined` | — |  |

### Grid

ListSection

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-label` | `string | undefined` | — | An accessibility label for the section. |
| `children` | `React.ReactNode | ((item: T) => React.ReactElement)` | — | Static child items or a function to render children. |
| `className` | `string | undefined` | 'react-aria-GridListSection' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dependencies` | `readonly any[] | undefined` | — | Values that should invalidate the item cache when using dynamic collections. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `Key | undefined` | — | The unique id of the section. |
| `inert` | `boolean | undefined` | — |  |
| `items` | `Iterable<T> | undefined` | — | Item objects in the section. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The object value that this section represents. When using dynamic collections, this is set automatically. |

### Grid

ListHeader

`<GridListHeader>` labels the section within a GridList. It accepts all HTML attributes.

### Grid

ListItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ChildrenOrFunction<GridListItemRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<GridListItemRenderProps> | undefined` | 'react-aria-GridListItem' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `dir` | `string | undefined` | — |  |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `hidden` | `boolean | undefined` | — |  |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `inert` | `boolean | undefined` | — |  |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `lang` | `string | undefined` | — |  |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `((e: React.MouseEvent<FocusableElement>) => void) | undefined` | — | **Not recommended – use `onPress` instead.** `onClick` is an alias for `onPress` provided for compatibility with other libraries. `onPress` provides  additional event details for non-mouse interactions. |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `React.HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `style` | `(React.CSSProperties | ((values: GridListItemRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `target` | `React.HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `value` | `T | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |

### Grid

ListLoadMoreItem

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | The load more spinner to render when loading additional items. |
| `className` | `string | undefined` | 'react-aria-GridListLoadMoreItem' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. |
| `dir` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `isLoading` | `boolean | undefined` | — | Whether or not the loading spinner should be rendered or not. |
| `lang` | `string | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLoadMore` | `(() => any) | undefined` | — | Handler that is called when more items should be loaded, e.g. while scrolling near the bottom. |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLDivElement> | undefined` | — |  |
| `scrollOffset` | `number | undefined` | 1 | The amount of offset from the bottom of your scrollable region that should trigger load more. Uses a percentage value relative to the scroll body's client height. Load more is then triggered when your current scroll position's distance from the bottom of the currently loaded list of items is less than or equal to the provided value. (e.g. 1 = 100% of the scroll region's height). |
| `style` | `React.CSSProperties | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. |
| `translate` | `"yes" | "no" | undefined` | — |  |

## Related 

Types

### use

DragAndDrop

`useDragAndDrop(options: DragAndDropOptions<T>): DragAndDrop<T>`

Provides the hooks required to enable drag and drop behavior for a drag and drop compatible collection component.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `getItems` | `((keys: Set<Key>, items: T[]) => DragItem[]) | undefined` | () => \[] | A function that returns the items being dragged. If not specified, we assume that the collection is not draggable. |
| `renderDragPreview` | `((items: DragItem[]) => JSX.Element | { element: JSX.Element; x: number; y: number; }) | undefined` | — | A function that renders a drag preview, which is shown under the user's cursor while dragging. By default, a copy of the dragged element is rendered. |
| `renderDropIndicator` | `((target: DropTarget) => JSX.Element) | undefined` | — | A function that renders a drop indicator element between two items in a collection. This should render a `<DropIndicator>` element. If this function is not provided, a default DropIndicator is provided. |
| `dropTargetDelegate` | `DropTargetDelegate | undefined` | — | A custom delegate object that provides drop targets for pointer coordinates within the collection. |
| `isDisabled` | `boolean | undefined` | — | Whether the drag and drop events should be disabled. |
| `onDragStart` | `((e: DraggableCollectionStartEvent) => void) | undefined` | — | Handler that is called when a drag operation is started. |
| `onDragMove` | `((e: DraggableCollectionMoveEvent) => void) | undefined` | — | Handler that is called when the drag is moved. |
| `onDragEnd` | `((e: DraggableCollectionEndEvent) => void) | undefined` | — | Handler that is called when the drag operation is ended, either as a result of a drop or a cancellation. |
| `getAllowedDropOperations` | `(() => DropOperation[]) | undefined` | — | Function that returns the drop operations that are allowed for the dragged items. If not provided, all drop operations are allowed. |
| `acceptedDragTypes` | `"all" | (string | symbol)[] | undefined` | 'all' | The drag types that the droppable collection accepts. If the collection accepts directories, include `DIRECTORY_DRAG_TYPE` in your array of allowed types. |
| `onInsert` | `((e: DroppableCollectionInsertDropEvent) => void) | undefined` | — | Handler that is called when external items are dropped "between" items. |
| `onRootDrop` | `((e: DroppableCollectionRootDropEvent) => void) | undefined` | — | Handler that is called when external items are dropped on the droppable collection's root. |
| `onItemDrop` | `((e: DroppableCollectionOnItemDropEvent) => void) | undefined` | — | Handler that is called when items are dropped "on" an item. |
| `onReorder` | `((e: DroppableCollectionReorderEvent) => void) | undefined` | — | Handler that is called when items are reordered within the collection. This handler only allows dropping between items, not on items. It does not allow moving items to a different parent item within a tree. |
| `onMove` | `((e: DroppableCollectionReorderEvent) => void) | undefined` | — | Handler that is called when items are moved within the source collection. This handler allows dropping both on or between items, and items may be moved to a different parent item within a tree. |
| `shouldAcceptItemDrop` | `((target: ItemDropTarget, types: DragTypes) => boolean) | undefined` | — | A function returning whether a given target in the droppable collection is a valid "on" drop target for the current drag types. |
| `onDropEnter` | `((e: DroppableCollectionEnterEvent) => void) | undefined` | — | Handler that is called when a valid drag enters a drop target. |
| `onDropActivate` | `((e: DroppableCollectionActivateEvent) => void) | undefined` | — | Handler that is called after a valid drag is held over a drop target for a period of time. |
| `onDropExit` | `((e: DroppableCollectionExitEvent) => void) | undefined` | — | Handler that is called when a valid drag exits a drop target. |
| `onDrop` | `((e: DroppableCollectionDropEvent) => void) | undefined` | — | Handler that is called when a valid drag is dropped on a drop target. When defined, this overrides other drop handlers such as `onInsert`, and `onItemDrop`. |
| `getDropOperation` | `((target: DropTarget, types: DragTypes, allowedOperations: DropOperation[]) => DropOperation) | undefined` | — | A function returning the drop operation to be performed when items matching the given types are dropped on the drop target. |
