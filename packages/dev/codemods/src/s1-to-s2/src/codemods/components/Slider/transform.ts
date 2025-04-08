import {commentOutProp, removeProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Slider props:
 * - Remove isFilled (Slider is always filled in Spectrum 2).
 * - Remove trackGradient (Not supported in S2 design).
 * - Remove showValueLabel (it has been removed due to accessibility issues).
 * - Comment out getValueLabel (it has not been implemented yet).
 * - Comment out orientation (it has not been implemented yet).
 */
export default function transformSlider(path: NodePath<t.JSXElement>) {
  // Remove isFilled
  // Reason: Slider is always filled in Spectrum 2
  removeProp(path, {propToRemove: 'isFilled'});

  // Remove trackGradient
  // Reason: Not supported in S2 design
  removeProp(path, {propToRemove: 'trackGradient'});

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
