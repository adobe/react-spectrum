import {commentOutProp, removeProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms RangeSlider:
 * - Remove showValueLabel (it has been removed due to accessibility issues).
 * - Comment out getValueLabel (it has not been implemented yet).
 * - Comment out orientation (it has not been implemented yet).
 */
export default function transformRangeSlider(path: NodePath<t.JSXElement>) {
  // Remove showValueLabel
  removeProp(path, {propToRemove: 'showValueLabel'});

  // Comment out getValueLabel
  commentOutProp(path, {propToComment: 'getValueLabel'});

  // Comment out orientation
  commentOutProp(path, {propToComment: 'orientation'});
} 
