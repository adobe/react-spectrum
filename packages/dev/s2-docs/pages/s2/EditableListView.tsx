'use client';
import {DragAndDropHooks} from '@react-spectrum/s2/useDragAndDrop';
import {ListView, ListViewItem, Text} from '@react-spectrum/s2/ListView';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TextField} from '@react-spectrum/s2/TextField';

export interface FileItem {
  id: string;
  name: string;
}

interface EditableListViewProps {
  items?: FileItem[];
  dragAndDropHooks?: DragAndDropHooks<FileItem>;
}

///- begin collapse -///
export let defaultItems: FileItem[] = [
  {id: 'brief', name: 'Project brief.pdf'},
  {id: 'report', name: 'Quarterly report.docx'},
  {id: 'budget', name: 'Budget.xlsx'}
];
///- end collapse -///

export function EditableListView(props: EditableListViewProps) {
  let {items = defaultItems, dragAndDropHooks} = props;
  return (
    <ListView
      aria-label="Shared files"
      keyboardNavigationBehavior="tab"
      selectionMode="multiple"
      items={items}
      dragAndDropHooks={dragAndDropHooks}
      styles={style({height: 280, width: 'full', maxWidth: 520})}>
      {item => (
        <ListViewItem textValue={item.name}>
          <Text>
            <TextField
              aria-label={`${item.name} title`}
              defaultValue={item.name}
              placeholder="Enter a name"
              styles={style({margin: 4})}
            />
          </Text>
        </ListViewItem>
      )}
    </ListView>
  );
}
