import {NodePath} from '@babel/traverse';
import {removeProp} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms ColorSlider props:
 * - Remove showValueLabel (it has been removed due to accessibility issues).
 */
export default function transformColorSlider(path: NodePath<t.JSXElement>) {
  // Remove showValueLabel
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'showValueLabel'});
} 
