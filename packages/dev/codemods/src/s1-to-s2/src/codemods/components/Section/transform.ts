import {commentIfParentCollectionNotDetected, movePropToNewChildComponentName, updateComponentWithinCollection} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Section:
 * - If within Menu: Update Section to be a MenuSection.
 * - If within Picker: Update Section to be a PickerSection.
 * - If within ComboBox: Update Section to be a ComboBoxSection.
 */
export default function transformSection(path: NodePath<t.JSXElement>): void {
  // Update Sections based on parent collection component
  updateComponentWithinCollection(path, {parentComponentName: 'Menu', newComponentName: 'MenuSection'});
  updateComponentWithinCollection(path, {parentComponentName: 'Picker', newComponentName: 'PickerSection'});
  updateComponentWithinCollection(path, {parentComponentName: 'ComboBox', newComponentName: 'ComboBoxSection'});

  // Move title prop to Header component
  movePropToNewChildComponentName(path, {
    parentComponentName: 'Menu',
    childComponentName: 'MenuSection',
    propName: 'title',
    newChildComponentName: 'Header'
  });
  movePropToNewChildComponentName(path, {
    parentComponentName: 'Picker',
    childComponentName: 'PickerSection',
    propName: 'title',
    newChildComponentName: 'Header'
  });
  movePropToNewChildComponentName(path, {
    parentComponentName: 'ComboBox',
    childComponentName: 'ComboBoxSection',
    propName: 'title',
    newChildComponentName: 'Header'
  });

  // Comment if parent collection not detected
  commentIfParentCollectionNotDetected(path);
}
