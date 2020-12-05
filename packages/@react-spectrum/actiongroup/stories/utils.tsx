import {ActionGroup, Item} from '../src';
import BookIcon from '@spectrum-icons/workflow/Book';
import CopyIcon from '@spectrum-icons/workflow/Copy';
import DeleteIcon from '@spectrum-icons/workflow/Delete';
import DocumentIcon from '@spectrum-icons/workflow/Document';
import DrawIcon from '@spectrum-icons/workflow/Draw';
import InfoIcon from '@spectrum-icons/workflow/Info';
import PropertiesIcon from '@spectrum-icons/workflow/Properties';
import React from 'react';
import SettingsIcon from '@spectrum-icons/workflow/Settings';
import {Text} from '@react-spectrum/text';
import ViewCardIcon from '@spectrum-icons/workflow/ViewCard';
import ViewGridIcon from '@spectrum-icons/workflow/ViewGrid';
import ViewListIcon from '@spectrum-icons/workflow/ViewList';


export const iconMap = {
  'Document setup': DocumentIcon,
  'Settings': SettingsIcon,
  'Grid view': ViewGridIcon,
  'List view': ViewListIcon,
  'Gallery view': ViewCardIcon,
  'Edit': DrawIcon,
  'Copy': CopyIcon,
  'Delete': DeleteIcon,
  'Properties': PropertiesIcon,
  'Info': InfoIcon,
  'Keywords': BookIcon
};

export function ActionGroupTextOnly(props) {
  return (
    <ActionGroup selectionMode="single" {...props}>
      {(item: any) => <Item key={item.name} textValue={item.name}>{item.children}</Item>}
    </ActionGroup>
  );
}

export function ActionGroupBoth(props) {
  return (
    <ActionGroup selectionMode="single" {...props}>
      {(item: any) => {
        let IconElement = iconMap[item.children];
        return (
          <Item key={item.name} textValue={item.name}>
            <Text>{item.children}</Text>
            <IconElement />
          </Item>
        );
      }}
    </ActionGroup>
  );
}

export function ActionGroupIconOnly(props) {
  return (
    <ActionGroup selectionMode="single" {...props}>
      {(item: any) => {
        let IconElement = iconMap[item.children];
        return (
          <Item key={item.name} textValue={item.name}>
            <IconElement />
          </Item>
        );
      }}
    </ActionGroup>
  );
}
