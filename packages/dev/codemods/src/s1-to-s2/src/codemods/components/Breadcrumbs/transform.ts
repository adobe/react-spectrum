import {
  addCommentToElement,
  commentOutProp,
  removeProp
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Breadcrumbs:
 * - Comment out showRoot (it has not been implemented yet).
 * - Comment out isMultiline (it has not been implemented yet).
 * - Comment out autoFocusCurrent (it has not been implemented yet).
 * - Remove size="S" (Small is no longer a supported size in Spectrum 2).
 * - Add comment to wrap in nav element if needed.
 */
export default function transformBreadcrumbs(path: NodePath<t.JSXElement>): void {
  // Comment out showRoot
  commentOutProp(path, {propName: 'showRoot'});

  // Comment out isMultiline
  commentOutProp(path, {propName: 'isMultiline'});

  // Comment out autoFocusCurrent
  commentOutProp(path, {propName: 'autoFocusCurrent'});

  // Remove size="S"
  removeProp(path, {propName: 'size', propValue: 'S'});

  // Add comment to wrap in nav element if needed
  addCommentToElement(path, {
    comment: 'S2 Breadcrumbs no longer includes a nav element by default. You can wrap the Breadcrumbs component in a nav element if needed.'
  });
}
