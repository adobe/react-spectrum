import {commentOutProp} from '../../shared/transforms';
import {getName} from '../../shared/utils';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

function updateAvatarSize(
  path: NodePath<t.JSXElement>
) {
  if (
    t.isJSXElement(path.node) &&
    t.isJSXIdentifier(path.node.openingElement.name) &&
    getName(path, path.node.openingElement.name) === 'Avatar'
  ) {
    let sizeAttrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'size') as NodePath<t.JSXAttribute>;
    if (sizeAttrPath) {
      let value = sizeAttrPath.node.value;
      if (value?.type === 'StringLiteral') {
        const avatarDimensions = {
          'avatar-size-50': 16,
          'avatar-size-75': 18,
          'avatar-size-100': 20,
          'avatar-size-200': 22,
          'avatar-size-300': 26,
          'avatar-size-400': 28,
          'avatar-size-500': 32,
          'avatar-size-600': 36,
          'avatar-size-700': 40
        };
        let val = avatarDimensions[value.value as keyof typeof avatarDimensions];
        if (val != null) {
          sizeAttrPath.node.value = t.jsxExpressionContainer(t.numericLiteral(val));
        }
      }
    }
  }
}

/**
 * Transforms Avatar:
 * - Comment out isDisabled (it has not been implemented yet).
 * - Update size to be a pixel value if it currently matches 'avatar-size-*'.
 */
export default function transformAvatar(path: NodePath<t.JSXElement>): void {
  // Comment out isDisabled
  commentOutProp(path, {propName: 'isDisabled'});

  // Update size to be a pixel value if it currently matches 'avatar-size-*'
  updateAvatarSize(path);
}
