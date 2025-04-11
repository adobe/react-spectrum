import {commentOutProp, removeProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Slider:
 * - Remove isFilled (Slider is always filled in Spectrum 2).
 * - Remove trackGradient (Not supported in S2 design).
 * - Remove showValueLabel (it has been removed due to accessibility issues).
 * - Comment out getValueLabel (it has not been implemented yet).
 * - Comment out orientation (it has not been implemented yet).
 */
export default function transformSlider(path: NodePath<t.JSXElement>) {
  // Remove isFilled
  removeProp(path, {propToRemove: 'isFilled'});

  // Remove trackGradient
  removeProp(path, {propToRemove: 'trackGradient'});

  // Remove showValueLabel
  removeProp(path, {propToRemove: 'showValueLabel'});

  // Comment out getValueLabel
  commentOutProp(path, {propToComment: 'getValueLabel'});

  // Comment out orientation
  commentOutProp(path, {propToComment: 'orientation'});
} 
