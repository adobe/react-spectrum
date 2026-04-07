import {movePropToChildComponent, updatePropName} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms MenuTrigger:
 * - Rename `closeOnSelect` to `shouldCloseOnSelect` and move it to the child `Menu`.
 */
export default function transformMenuTrigger(path: NodePath<t.JSXElement>): void {
  updatePropName(path, {oldPropName: 'closeOnSelect', newPropName: 'shouldCloseOnSelect'});

  movePropToChildComponent(path, {
    parentComponentName: 'MenuTrigger',
    childComponentName: 'Menu',
    propName: 'shouldCloseOnSelect'
  });
}
