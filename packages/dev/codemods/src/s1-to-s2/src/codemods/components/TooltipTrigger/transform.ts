import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePlacementToSingleValue} from '../../shared/transforms';

/**
 * Transforms TooltipTrigger:
 * - Updates placement prop to single value.
 */
export default function transformTooltipTrigger(path: NodePath<t.JSXElement>): void {
  // Update placement prop to single value
  updatePlacementToSingleValue(path, {
    propToUpdateName: 'placement',
    childComponentName: 'Tooltip'
  });
}
