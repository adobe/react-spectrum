'use client';
import {
  Collection,
  Text,
  TreeView,
  TreeViewItem,
  TreeViewItemContent
} from '@react-spectrum/s2/TreeView';
import {DragAndDropHooks} from '@react-spectrum/s2/useDragAndDrop';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TextField} from '@react-spectrum/s2/TextField';

export interface FileItem {
  id: string;
  name: string;
  children?: FileItem[];
}

interface EditableTreeViewProps {
  dragAndDropHooks?: DragAndDropHooks<FileItem>;
}

///- begin collapse -///
let files: FileItem[] = [
  {
    id: 'documents',
    name: 'Documents',
    children: [
      {id: 'brief', name: 'Project brief.pdf'},
      {id: 'report', name: 'Quarterly report.docx'}
    ]
  },
  {id: 'budget', name: 'Budget.xlsx'}
];
///- end collapse -///

export function EditableTreeView(props: EditableTreeViewProps) {
  return (
    <TreeView
      aria-label="Shared files"
      keyboardNavigationBehavior="tab"
      selectionMode="multiple"
      items={files}
      defaultExpandedKeys={['documents']}
      dragAndDropHooks={props.dragAndDropHooks}
      styles={style({height: 280, width: 'full', maxWidth: 520})}>
      {renderItem}
    </TreeView>
  );
}

function renderItem(item: FileItem) {
  return (
    <TreeViewItem textValue={item.name}>
      <TreeViewItemContent>
        <Text>
          <TextField
            aria-label={`${item.name} title`}
            defaultValue={item.name}
            placeholder="Enter a name"
            styles={style({margin: 4})}
          />
        </Text>
      </TreeViewItemContent>
      <Collection items={item.children}>{renderItem}</Collection>
    </TreeViewItem>
  );
}
