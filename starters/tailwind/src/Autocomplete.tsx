import React from "react";
import {
  UNSTABLE_Autocomplete as AriaAutocomplete,
  AutocompleteProps as AriaAutocompleteProps,
  Collection,
  Header,
  ListBox,
  ListBoxItemProps,
  ListBoxSection,
  SectionProps,
  useFilter,
} from "react-aria-components";
import { SearchField } from "./SearchField";
import { DropdownItem } from "./ListBox";

export interface AutocompleteProps<T extends object> extends Omit<AriaAutocompleteProps, "children"> {
  children: React.ReactNode | ((item: T) => React.ReactNode);
  items?: Iterable<T>;
  label?: string;
}

export function Autocomplete<T extends object>({
  items,
  children,
  label,
  ...props
}: AutocompleteProps<T>) {
  let { contains } = useFilter({ sensitivity: "base" });
  return (
    <AriaAutocomplete {...props} filter={contains}>
      <SearchField label={label} />
      <ListBox
        items={items}
        className="p-3 overflow-auto outline-0 max-h-[200px]"
        {...props}
      >
        {children}
      </ListBox>
    </AriaAutocomplete>
  );
}

export function AutocompleteItem(props: ListBoxItemProps) {
  return <DropdownItem {...props} />;
}

export interface AutocompleteSectionProps<T> extends SectionProps<T> {
  title?: string
  items?: any
}

export function AutocompleteSection<T extends object>(
  props: AutocompleteSectionProps<T>
) {
  return (
    <ListBoxSection className="first:-mt-[5px] after:content-[''] after:block after:h-[5px]">
      <Header className="text-sm font-semibold text-gray-500 dark:text-zinc-300 px-4 py-1 truncate sticky -top-[5px] -mt-px -mx-1 z-10 bg-gray-100/60 dark:bg-zinc-700/60 backdrop-blur-md supports-[-moz-appearance:none]:bg-gray-100 border border-gray-200 dark:border-zinc-700 [&+*]:mt-1 rounded">{props.title}</Header>
      <Collection items={props.items}>
        {props.children}
      </Collection>
    </ListBoxSection>
  )
}
