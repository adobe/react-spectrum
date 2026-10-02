import {movePropToParentComponent, removeProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Tooltip:
 * - Remove variant (it is no longer supported in Spectrum 2).
 * - Move placement prop to the parent TooltipTrigger.
 * - Remove showIcon (it is no longer supported in Spectrum 2).
 * - Move isOpen prop to the parent TooltipTrigger.
 */
export default function transformTooltip(path: NodePath<t.JSXElement>): void {
  // Remove variant
  removeProp(path, {propName: 'variant'});

  // Move placement prop to the parent TooltipTrigger
  movePropToParentComponent(path, {
    parentComponentName: 'TooltipTrigger',
    childComponentName: 'Tooltip',
    propName: 'placement'
  });

  // Remove showIcon
  removeProp(path, {propName: 'showIcon'});

  // Move isOpen prop to the parent TooltipTrigger
  movePropToParentComponent(path, {
    parentComponentName: 'TooltipTrigger',
    childComponentName: 'Tooltip',
    propName: 'isOpen'
  });
}
