import {NodePath} from '@babel/traverse';
import {removeProp} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms CheckboxGroup:
 * - Remove showErrorIcon (it has been removed due to accessibility issues).
 */
export default function transformCheckboxGroup(path: NodePath<t.JSXElement>): void {
  // Remove showErrorIcon
  removeProp(path, {propName: 'showErrorIcon'});
}
