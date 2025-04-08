import {NodePath} from '@babel/traverse';
import {removeProp} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms CheckboxGroup props:
 * - Remove showErrorIcon (it has been removed due to accessibility issues).
 */
export default function transformCheckboxGroup(path: NodePath<t.JSXElement>) {
  // Remove showErrorIcon
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'showErrorIcon'});
} 
