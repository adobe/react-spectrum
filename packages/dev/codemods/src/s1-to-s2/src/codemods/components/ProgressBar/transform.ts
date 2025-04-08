import {commentOutProp, removeProp, updatePropNameAndValue} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ProgressBar props:
 * - Change variant="overBackground" to staticColor="white".
 * - Comment out labelPosition (it has not been implemented yet).
 * - Comment out showValueLabel (it has not been implemented yet).
 */
export default function transformProgressBar(path: NodePath<t.JSXElement>) {
  // Change variant="overBackground" to staticColor="white"
  updatePropNameAndValue(path, {
    oldProp: 'variant',
    oldValue: 'overBackground',
    newProp: 'staticColor',
    newValue: 'white'
  });

  // Comment out labelPosition
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'labelPosition'});

  // Comment out showValueLabel
  // Reason: It has been removed due to accessibility issues
  removeProp(path, {propToRemove: 'showValueLabel'});
} 
