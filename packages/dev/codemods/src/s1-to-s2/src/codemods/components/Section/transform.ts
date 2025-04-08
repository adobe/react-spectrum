import {commentIfParentCollectionNotDetected, movePropToNewChildComponent, updateComponentWithinCollection} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Section:
 * - If within Menu: Update Section to be a MenuSection.
 * - If within Picker: Update Section to be a PickerSection.
 * - If within ComboBox: Update Section to be a ComboBoxSection.
 */
export default function transformSection(path: NodePath<t.JSXElement>) {
  // Update Sections based on parent collection component
  updateComponentWithinCollection(path, {parentComponent: 'Menu', newComponent: 'MenuSection'});
  updateComponentWithinCollection(path, {parentComponent: 'Picker', newComponent: 'PickerSection'});
  updateComponentWithinCollection(path, {parentComponent: 'ComboBox', newComponent: 'ComboBoxSection'});

  movePropToNewChildComponent(path, {
    parentComponent: 'Menu',
    childComponent: 'MenuSection',
    propToMove: 'title',
    newChildComponent: 'Header'
  });
  movePropToNewChildComponent(path, {
    parentComponent: 'Picker',
    childComponent: 'PickerSection',
    propToMove: 'title',
    newChildComponent: 'Header'
  });
  movePropToNewChildComponent(path, {
    parentComponent: 'ComboBox',
    childComponent: 'ComboBoxSection',
    propToMove: 'title',
    newChildComponent: 'Header'
  });

  // Comment if parent collection not detected
  // Reason: Section needs to be updated based on its parent collection component.
  commentIfParentCollectionNotDetected(path);
} 
