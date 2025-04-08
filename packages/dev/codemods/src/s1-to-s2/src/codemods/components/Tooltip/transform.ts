import {movePropToParentComponent, removeProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Tooltip props:
 * - Remove variant (it is no longer supported in Spectrum 2).
 * - Move placement prop to the parent TooltipTrigger.
 * - Remove showIcon (it is no longer supported in Spectrum 2).
 * - Move isOpen prop to the parent TooltipTrigger.
 */
export default function transformTooltip(path: NodePath<t.JSXElement>) {
  // Remove variant
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'variant'});

  // Move placement prop to the parent TooltipTrigger
  movePropToParentComponent(path, {
    parentComponent: 'TooltipTrigger',
    childComponent: 'Tooltip',
    propToMove: 'placement'
  });

  // Remove showIcon
  // Reason: It is no longer supported in Spectrum 2
  removeProp(path, {propToRemove: 'showIcon'});

  // Move isOpen prop to the parent TooltipTrigger
  movePropToParentComponent(path, {
    parentComponent: 'TooltipTrigger',
    childComponent: 'Tooltip',
    propToMove: 'isOpen'
  });
} 
