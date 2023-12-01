import {
  Button,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagGroupProps as AriaTagGroupProps,
  TagList,
  TagListProps,
  TagProps as AriaTagProps,
  Text
} from 'react-aria-components';
import { Description, Label } from './Field';
import { XIcon } from 'lucide-react';

const colors = {
  gray: 'bg-gray-100 text-gray-600 border-gray-200 hover:border-gray-300',
  green: 'bg-green-100 text-green-700 border-green-200 hover:border-green-300',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:border-yellow-300',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300'
};

export interface TagGroupProps<T> extends Omit<AriaTagGroupProps, 'children'>, Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'> {
  label?: string;
  description?: string;
  errorMessage?: string;
}

export interface TagProps extends AriaTagProps {
  color?: keyof typeof colors
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
    <AriaTagGroup {...props} className="flex flex-col gap-1">
      <Label>{label}</Label>
      <TagList items={items} renderEmptyState={renderEmptyState} className="flex flex-wrap gap-1">
        {children}
      </TagList>
      {description && <Description>{description}</Description>}
      {errorMessage && <Text slot="errorMessage" className="text-sm text-red-600">{errorMessage}</Text>}
    </AriaTagGroup>
  );
}

export function Tag({ children, color = 'gray', ...props }: TagProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaTag textValue={textValue} {...props} className={`${colors[color]} transition cursor-default selected:bg-gray-700 selected:text-white selected:border-gray-800 text-xs rounded-full border px-3 py-0.5 flex items-center max-w-fit gap-1 outline-none focus-visible:outline-blue-600 disabled:bg-gray-100 disabled:text-gray-300`}>
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && <Button slot="remove"><XIcon className="w-3 h-3" /></Button>}
        </>
      )}
    </AriaTag>
  );
}
