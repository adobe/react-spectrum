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
export default function transformSlider(path: NodePath<t.JSXElement>): void {
  // Remove isFilled
  removeProp(path, {propName: 'isFilled'});

  // Remove trackGradient
  removeProp(path, {propName: 'trackGradient'});

  // Remove showValueLabel
  removeProp(path, {propName: 'showValueLabel'});

  // Comment out getValueLabel
  commentOutProp(path, {propName: 'getValueLabel'});

  // Comment out orientation
  commentOutProp(path, {propName: 'orientation'});
}
