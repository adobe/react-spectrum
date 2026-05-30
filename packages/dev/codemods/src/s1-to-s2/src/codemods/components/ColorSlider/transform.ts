import {NodePath} from '@babel/traverse';
import {removeProp} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms ColorSlider:
 * - Remove showValueLabel (it has been removed due to accessibility issues).
 */
export default function transformColorSlider(path: NodePath<t.JSXElement>): void {
  // Remove showValueLabel
  removeProp(path, {propName: 'showValueLabel'});
}
