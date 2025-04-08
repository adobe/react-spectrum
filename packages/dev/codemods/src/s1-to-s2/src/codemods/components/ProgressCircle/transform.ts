import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePropNameAndValue} from '../../shared/transforms';

/**
 * Transforms ProgressCircle:
 * - Change variant="overBackground" to staticColor="white".
 */
export default function transformProgressCircle(path: NodePath<t.JSXElement>) {
  // Change variant="overBackground" to staticColor="white"
  updatePropNameAndValue(path, {
    oldProp: 'variant',
    oldValue: 'overBackground',
    newProp: 'staticColor',
    newValue: 'white'
  });
} 
