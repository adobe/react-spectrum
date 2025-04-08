import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePlacementToSingleValue} from '../../shared/transforms';

/**
 * Transforms TooltipTrigger props:
 * - Updates placement prop to single value.
 */
export default function transformTooltipTrigger(path: NodePath<t.JSXElement>) {
  updatePlacementToSingleValue(path, {
    propToUpdate: 'placement',
    childComponent: 'Tooltip'
  });
} 
