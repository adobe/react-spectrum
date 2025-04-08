import {
  addCommentToElement,
  commentOutProp,
  removeProp,
  updateComponentWithinCollection
} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Transforms Breadcrumbs props:
 * - Comment out showRoot (it has not been implemented yet).
 * - Comment out isMultiline (it has not been implemented yet).
 * - Comment out autoFocusCurrent (it has not been implemented yet).
 * - Remove size="S" (Small is no longer a supported size in Spectrum 2).
 * - Update Item to be a Breadcrumb.
 * - Add comment to wrap in nav element if needed.
 */
export default function transformBreadcrumbs(path: NodePath<t.JSXElement>) {
  // Comment out showRoot
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'showRoot'});

  // Comment out isMultiline
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'isMultiline'});

  // Comment out autoFocusCurrent
  // Reason: It has not been implemented yet
  commentOutProp(path, {propToComment: 'autoFocusCurrent'});

  // Remove size="S"
  // Reason: Small is no longer a supported size in Spectrum 2
  removeProp(path, {propToRemove: 'size', propValue: 'S'});

  // Add comment to wrap in nav element if needed
  // Reason: A nav element is no longer included inside Breadcrumbs by default.
  addCommentToElement(path, {
    comment: 'S2 Breadcrumbs no longer includes a nav element by default. You can wrap the Breadcrumbs component in a nav element if needed.'
  });
} 
