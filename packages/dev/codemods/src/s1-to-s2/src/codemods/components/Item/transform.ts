import {commentIfParentCollectionNotDetected, updateComponentWithinCollection} from '../../shared/transforms';
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
 * - Update key to id (and keep key if rendered inside array.map).
 */
export default function transformItem(path: NodePath<t.JSXElement>): void {
  // Update Items based on parent collection component
  updateComponentWithinCollection(path, {parentComponentName: 'Menu', newComponentName: 'MenuItem'});
  updateComponentWithinCollection(path, {parentComponentName: 'ActionMenu', newComponentName: 'MenuItem'});
  updateComponentWithinCollection(path, {parentComponentName: 'TagGroup', newComponentName: 'Tag'});
  updateComponentWithinCollection(path, {parentComponentName: 'Breadcrumbs', newComponentName: 'Breadcrumb'});
  updateComponentWithinCollection(path, {parentComponentName: 'Picker', newComponentName: 'PickerItem'});
  updateComponentWithinCollection(path, {parentComponentName: 'ComboBox', newComponentName: 'ComboBoxItem'});

  // Comment if parent collection not detected
  commentIfParentCollectionNotDetected(path);
}
