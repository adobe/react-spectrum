import { Check } from 'lucide-react';
import {
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  Collection,
  Header,
  ListBoxItemProps,
  ListBoxProps,
  Section,
  SectionProps,
  composeRenderProps
} from 'react-aria-components';
import React from 'react';
import {focusRing} from './utils';
import {tv} from 'tailwind-variants';

export function ListBox<T extends object>(
  { children, ...props }: ListBoxProps<T>
) {
  return (
    <AriaListBox {...props} className="outline-0 p-1 border border-gray-300 dark:border-zinc-600 rounded-lg">
      {children}
    </AriaListBox>
  );
}

export const itemStyles = tv({
  extend: focusRing,
  base: 'group relative flex items-center gap-8 cursor-default select-none py-1.5 px-2.5 rounded-md will-change-transform text-sm forced-color-adjust-none',
  variants: {
    isSelected: {
      false: 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 -outline-offset-2',
      true: 'bg-blue-600 text-white forced-colors:!bg-[Highlight] forced-colors:!text-[HighlightText] [&:has(+[data-selected])]:rounded-b-none [&+[data-selected]]:rounded-t-none -outline-offset-4 outline-white forced-colors:outline-[HighlightText]'
    },
    isDisabled: {
      true: 'text-slate-300 dark:text-zinc-600 forced-colors:!text-[GrayText]'
    }
  }
});

export function ListBoxItem(props: ListBoxItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue} className={itemStyles}>
      {composeRenderProps(props.children, children => <>
        {children}
        <div className="absolute left-4 right-4 bottom-0 h-px bg-white/20 forced-colors:bg-[HighlightText] hidden [.group[data-selected]:has(+[data-selected])_&]:block" />
      </>)}
    </AriaListBoxItem>
  );
}

export function DropdownItem(props: ListBoxItemProps) {
  let textValue = props.textValue || (typeof props.children === 'string' ? props.children : undefined);
  return (
    <AriaListBoxItem {...props} textValue={textValue} className="group flex items-center gap-4 cursor-default select-none py-2 pl-3 pr-1 rounded-lg outline outline-0 text-gray-900 dark:text-zinc-100 disabled:text-gray-300 dark:disabled:text-zinc-600 forced-colors:disabled:!text-[GrayText] text-sm focus:bg-blue-600 focus:text-white forced-color-adjust-none forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText]">
      {composeRenderProps(props.children, (children, {isSelected}) => <>
        <span className="flex-1 flex items-center gap-2 truncate font-normal group-selected:font-semibold">
          {children}
        </span>
        <span className="w-5 flex items-center">
          {isSelected && <Check className="w-4 h-4" />}
        </span>
      </>)}
    </AriaListBoxItem>
  );
}

export interface ListBoxSectionProps<T> extends SectionProps<T> {
  title?: string
}

export function ListBoxSection<T extends object>(props: ListBoxSectionProps<T>) {
  return (
    <Section className="first:-mt-[5px] after:content-[''] after:block after:h-[5px]">
      <Header className="text-sm font-semibold text-gray-500 dark:text-zinc-300 px-4 py-1 truncate sticky -top-[5px] -mt-px -mx-1 z-10 bg-gray-100/60 dark:bg-zinc-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 border-y dark:border-y-zinc-700 [&+*]:mt-1">{props.title}</Header>
      <Collection items={props.items}>
        {props.children}
      </Collection>
    </Section>
  );
}
