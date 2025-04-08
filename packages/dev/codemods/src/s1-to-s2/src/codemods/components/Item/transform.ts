import {commentIfParentCollectionNotDetected, updateComponentWithinCollection, updateKeyToId} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Item:
 * - If within Menu: Update Item to be a MenuItem.
 * - If within ActionMenu: Update Item to be a MenuItem.
 * - If within TagGroup: Update Item to be a Tag.
 * - If within Breadcrumbs: Update Item to be a Breadcrumb.
 * - If within Picker: Update Item to be a PickerItem.
 * - If within ComboBox: Update Item to be a ComboBoxItem.
 * - If within ListBox: Update Item to be a ListBoxItem.
 * - If within TabList: Update Item to be a Tab.
 * - If within TabPanels: Update Item to be a TabPanel and remove surrounding TabPanels.
 * - Update key to id (and keep key if rendered inside array.map).
 */
export default function transformItem(path: NodePath<t.JSXElement>) {
  // Update Items based on parent collection component
  updateComponentWithinCollection(path, {parentComponent: 'Menu', newComponent: 'MenuItem'});
  updateComponentWithinCollection(path, {parentComponent: 'ActionMenu', newComponent: 'MenuItem'});
  updateComponentWithinCollection(path, {parentComponent: 'TagGroup', newComponent: 'Tag'});
  updateComponentWithinCollection(path, {parentComponent: 'Breadcrumbs', newComponent: 'Breadcrumb'});
  updateComponentWithinCollection(path, {parentComponent: 'Picker', newComponent: 'PickerItem'});
  updateComponentWithinCollection(path, {parentComponent: 'ComboBox', newComponent: 'ComboBoxItem'});

  // Comment if parent collection not detected
  // Reason: Item needs to be updated based on its parent collection component.
  commentIfParentCollectionNotDetected(path);
} 
