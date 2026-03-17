import {addComment} from '../../shared/utils';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updatePropNameAndValue} from '../../shared/transforms';

/**
 * If <a> was used inside Link (legacy API), remove the <a> and apply props directly to Link.
 */
function updateLegacyLink(
  path: NodePath<t.JSXElement>
): void {
  let missingOuterHref = t.isJSXElement(path.node) && !path.node.openingElement.attributes.some((attr) => t.isJSXAttribute(attr) && attr.name.name === 'href');
  if (missingOuterHref) {
    let innerLink = path.node.children.find((child) => t.isJSXElement(child) && t.isJSXIdentifier(child.openingElement.name));
    if (innerLink && t.isJSXElement(innerLink)) {
      let innerAttributes = innerLink.openingElement.attributes;
      let outerAttributes = path.node.openingElement.attributes;
      innerAttributes.forEach((attr) => {
        outerAttributes.push(attr);
      });

      if (
        t.isJSXIdentifier(innerLink.openingElement.name) &&
        innerLink.openingElement.name.name !== 'a'
      ) {
        addComment(path.node, ' TODO(S2-upgrade): You may have been using a custom link component here. You\'ll need to update this manually.');
      }
      path.node.children = innerLink.children;
    }
  }
}

/**
 * Transforms Link:
 * - Change variant="overBackground" to staticColor="white".
 * - If <a> was used inside Link (legacy API), remove the <a> and apply props directly to Link.
 */
export default function transformLink(path: NodePath<t.JSXElement>): void {
  // Change variant="overBackground" to staticColor="white"
  updatePropNameAndValue(path, {
    oldPropName: 'variant',
    oldPropValue: 'overBackground',
    newPropName: 'staticColor',
    newPropValue: 'white'
  });

  // Update legacy Link
  updateLegacyLink(path);
}
