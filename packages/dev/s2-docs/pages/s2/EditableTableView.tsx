'use client';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/s2/TableView';
import {DragAndDropHooks} from '@react-spectrum/s2/useDragAndDrop';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TextField} from '@react-spectrum/s2/TextField';

export interface FileItem {
  id: string;
  name: string;
}

interface EditableTableViewProps {
  dragAndDropHooks?: DragAndDropHooks<FileItem>;
}

///- begin collapse -///
let files: FileItem[] = [
  {id: 'brief', name: 'Project brief.pdf'},
  {id: 'report', name: 'Quarterly report.docx'},
  {id: 'budget', name: 'Budget.xlsx'}
];
///- end collapse -///

export function EditableTableView(props: EditableTableViewProps) {
  return (
    <TableView
      aria-label="Shared files"
      keyboardNavigationBehavior="tab"
      selectionMode="multiple"
      dragAndDropHooks={props.dragAndDropHooks}
      styles={style({height: 280, width: 'full', maxWidth: 520})}>
      <TableHeader>
        <Column isRowHeader>Name</Column>
        <Column>Notes</Column>
      </TableHeader>
      <TableBody items={files}>
        {item => (
          <Row textValue={item.name}>
            <Cell>{item.name}</Cell>
            <Cell>
              <TextField
                aria-label={`${item.name} notes`}
                placeholder="Enter notes"
                styles={style({marginY: 4, width: 'full'})}
              />
            </Cell>
          </Row>
        )}
      </TableBody>
    </TableView>
  );
}
