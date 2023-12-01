import {
  Button,
  GridList as AriaGridList,
  GridListItem as AriaGridListItem,
  GridListItemProps,
  GridListProps
} from 'react-aria-components';
import {Checkbox} from './Checkbox';

export function GridList<T extends object>(
  { children, ...props }: GridListProps<T>
) {
  return (
    <AriaGridList {...props}>
      {children}
    </AriaGridList>
  );
}

export function GridListItem({ children, ...props }: GridListItemProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  return (
    <AriaGridListItem textValue={textValue} {...props} className="relative flex gap-2 cursor-default select-none py-2 px-4 rounded-lg text-gray-900 disabled:text-gray-300 text-sm hover:bg-gray-200 selected:bg-blue-600/10 selected:z-10 border border-transparent -mb-px last:mb-0 selected:border-blue-200 selected:[&:has(+[data-selected])]:rounded-b-none [&[data-selected]+[data-selected]]:rounded-t-none outline-none focus-visible:outline-blue-600 -outline-offset-2">
      {({ selectionMode, selectionBehavior, allowsDragging }) => (
        <>
          {/* Add elements for drag and drop and selection. */}
          {allowsDragging && <Button slot="drag">≡</Button>}
          {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
            <Checkbox slot="selection" />
          )}
          {children}
        </>
      )}
    </AriaGridListItem>
  );
}
