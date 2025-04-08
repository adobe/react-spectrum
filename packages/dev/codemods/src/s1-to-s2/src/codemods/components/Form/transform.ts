import {NodePath} from '@babel/traverse';
import {removeProp} from '../../shared/transforms';
import * as t from '@babel/types';

/**
 * Transforms Form props:
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 * - Remove isReadOnly (it is no longer supported in Spectrum 2).
 * - Remove validationState (it is no longer supported in Spectrum 2).
 * - Remove validationBehavior (it is no longer supported in Spectrum 2).
 */
export default function transformForm(path: NodePath<t.JSXElement>) {
  // Remove isQuiet
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'isQuiet'});

  // Remove isReadOnly
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'isReadOnly'});

  // Remove validationState
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'validationState'});

  // Remove validationBehavior
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'validationBehavior'});
} 
