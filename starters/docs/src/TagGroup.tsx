'use client';
import {
  Button,
  Label,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagGroupProps as AriaTagGroupProps,
  TagList,
  TagListProps,
  TagProps,
  Text
} from 'react-aria-components';
import {X} from 'lucide-react';
import './TagGroup.css';

export interface TagGroupProps<T>
  extends
    Omit<AriaTagGroupProps, 'children'>,
    Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export function TagGroup<T extends object>(
  {
    label,
    description,
    errorMessage,
    items,
    children,
    renderEmptyState,
    ...props
  }: TagGroupProps<T>
) {
  return (
    (
      <AriaTagGroup {...props}>
        <Label>{label}</Label>
        <TagList items={items} renderEmptyState={renderEmptyState}>
          {children}
        </TagList>
        {description && <Text slot="description">{description}</Text>}
        {errorMessage && <Text slot="errorMessage">{errorMessage}</Text>}
      </AriaTagGroup>
    )
  );
}

export function Tag(
  { children, ...props }: Omit<TagProps, 'children'> & {
    children?: React.ReactNode;
  }
) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    (
      <AriaTag textValue={textValue} {...props}>
        {({ allowsRemoving }) => (
          <>
            {children}
            {allowsRemoving && <Button slot="remove"><X size={12} /></Button>}
          </>
        )}
      </AriaTag>
    )
  );
}
