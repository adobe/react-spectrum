import {commentOutProp, removeProp, updatePropNameAndValue} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms ProgressBar:
 * - Change variant="overBackground" to staticColor="white".
 * - Comment out labelPosition (it has not been implemented yet).
 * - Comment out showValueLabel (it has not been implemented yet).
 */
export default function transformProgressBar(path: NodePath<t.JSXElement>): void {
  // Change variant="overBackground" to staticColor="white"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'overBackground',
    newPropName: 'staticColor',
    newPropValue: 'white'
  });

  // Comment out labelPosition
  commentOutProp(path, {propName: 'labelPosition'});

  // Comment out showValueLabel
  removeProp(path, {propName: 'showValueLabel'});
}
