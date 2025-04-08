import {commentOutProp, removeProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms RangeSlider props:
 * - Remove showValueLabel (it has been removed due to accessibility issues).
 * - Comment out getValueLabel (it has not been implemented yet).
 * - Comment out orientation (it has not been implemented yet).
 */
export default function transformRangeSlider(path: NodePath<t.JSXElement>) {
  // Remove showValueLabel
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'showValueLabel'});

  // Comment out getValueLabel
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'getValueLabel'});

  // Comment out orientation
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'orientation'});
} 
