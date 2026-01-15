import {NodePath} from '@babel/traverse';
import {removeProp} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms Form:
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Remove isReadOnly (it is no longer supported in Spectrum 2).
 * - Remove validationState (it is no longer supported in Spectrum 2).
 * - Remove validationBehavior (it is no longer supported in Spectrum 2).
 */
export default function transformForm(path: NodePath<t.JSXElement>): void {
  // Remove isQuiet
  removeProp(path, {propName: 'isQuiet'});

  // Remove isReadOnly
  removeProp(path, {propName: 'isReadOnly'});

  // Remove validationState
  removeProp(path, {propName: 'validationState'});

  // Remove validationBehavior
  removeProp(path, {propName: 'validationBehavior'});
}
