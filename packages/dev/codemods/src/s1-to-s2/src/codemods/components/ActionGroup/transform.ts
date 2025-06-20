import {addComponentImport} from '../../shared/utils';
import {commentOutProp} from '../../shared/transforms';
import {getComponents} from '../../../getComponents';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

let availableComponents = getComponents();

/**
 * Transforms ActionGroup:
 * - Comment out overflowMode (it has not been implemented yet).
 * - Comment out buttonLabelBehavior (it has not been implemented yet).
 * - Comment out summaryIcon (it has not been implemented yet).
 * - Use ActionButtonGroup if no selection.
 * - Use ToggleButtonGroup if selection is used.
 * - Update root level onAction to onPress on each ActionButton.
 * - Apply isDisabled directly on each ActionButton/ToggleButton instead of disabledKeys.
 * - Convert dynamic collections render function to items.map.
 */
export default function transformActionGroup(path: NodePath<t.JSXElement>): void {
  // Comment out overflowMode
  commentOutProp(path, {propName: 'overflowMode'});

  // Comment out buttonLabelBehavior
  commentOutProp(path, {propName: 'buttonLabelBehavior'});

  // Comment out summaryIcon
  commentOutProp(path, {propName: 'summaryIcon'});

  let selectionModePath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'selectionMode') as NodePath<t.JSXAttribute> | undefined;
  let selectionMode = t.isStringLiteral(selectionModePath?.node.value) ? selectionModePath.node.value.value : 'none';
  let newComponentName, childComponentName;
  if (selectionMode === 'none') {
    // Use ActionButtonGroup if no selection
    newComponentName = 'ActionButtonGroup';
    childComponentName = 'ActionButton';
    selectionModePath?.remove();
  } else {
    // Use ToggleButtonGroup if selection is used
    newComponentName = 'ToggleButtonGroup';
    childComponentName = 'ToggleButton';
  }

  let localName = newComponentName;
  if (availableComponents.has(newComponentName)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localName = addComponentImport(program, newComponentName);
  }

  let localChildName = childComponentName;
  if (availableComponents.has(childComponentName)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localChildName = addComponentImport(program, childComponentName);
  }


  // Convert dynamic collection to an array.map.
  let items = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'items') as NodePath<t.JSXAttribute> | undefined;
  let itemArg: t.Identifier | undefined;
  if (items && t.isJSXExpressionContainer(items.node.value) && t.isExpression(items.node.value.expression)) {
    let child = path.get('children').find(c => c.isJSXExpressionContainer());
    if (child && child.isJSXExpressionContainer() && t.isFunction(child.node.expression)) {
      let arg = child.node.expression.params[0];
      if (t.isIdentifier(arg)) {
        itemArg = arg;
      }

      child.replaceWith(
        t.jsxExpressionContainer(
          t.callExpression(
            t.memberExpression(
              items.node.value.expression,
              t.identifier('map')
            ),
            [child.node.expression]
          )
        )
      );
    }
  }
  items?.remove();

  let onAction = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'onAction') as NodePath<t.JSXAttribute> | undefined;

  // Pull disabledKeys prop out into a variable, converted to a Set.
  // Then we can check it in the isDisabled prop of each item.
  let disabledKeysPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'disabledKeys') as NodePath<t.JSXAttribute> | undefined;
  let disabledKeys: t.Identifier | undefined;
  if (disabledKeysPath && t.isJSXExpressionContainer(disabledKeysPath.node.value) && t.isExpression(disabledKeysPath.node.value.expression)) {
    disabledKeys = path.scope.generateUidIdentifier('disabledKeys');
    path.scope.push({
      id: disabledKeys,
      init: t.newExpression(t.identifier('Set'), [disabledKeysPath.node.value.expression]),
      kind: 'let'
    });
    disabledKeysPath.remove();
  }

  path.traverse({
    JSXElement(child) {
      if (t.isJSXIdentifier(child.node.openingElement.name) && child.node.openingElement.name.name === 'Item') {
        // Replace Item with ActionButton or ToggleButton.
        let childNode = t.cloneNode(child.node);
        childNode.openingElement.name = t.jsxIdentifier(localChildName);
        if (childNode.closingElement) {
          childNode.closingElement.name = t.jsxIdentifier(localChildName);
        }

        // If there is no key prop and we are using dynamic collections, add a default computed from item.key ?? item.id.
        let key = childNode.openingElement.attributes.find(attr => t.isJSXAttribute(attr) && attr.name.name === 'key') as t.JSXAttribute | undefined;
        if (!key && itemArg) {
          let id = t.jsxExpressionContainer(
            t.logicalExpression(
              '??',
              t.memberExpression(itemArg, t.identifier('key')),
              t.memberExpression(itemArg, t.identifier('id'))
            )
          );

          key = t.jsxAttribute(
            t.jsxIdentifier('key'),
            id
          );

          childNode.openingElement.attributes.push(key);
        }

        // If this is a ToggleButtonGroup, add an id prop in addition to key when needed.
        if (key && newComponentName === 'ToggleButtonGroup') {
          // If we are in an array.map we need both key and id. Otherwise, we only need id.
          if (itemArg) {
            childNode.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('id'), key.value));
          } else {
            key.name.name = 'id';
          }
        }

        let keyValue: t.Expression | undefined = undefined;
        if (key && t.isJSXExpressionContainer(key.value) && t.isExpression(key.value.expression)) {
          keyValue = key.value.expression;
        } else if (key && t.isStringLiteral(key.value)) {
          keyValue = key.value;
        }

        // Add an onPress to each item that calls the previous onAction, passing in the key.
        if (onAction && t.isJSXExpressionContainer(onAction.node.value) && t.isExpression(onAction.node.value.expression)) {
          childNode.openingElement.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('onPress'),
              t.jsxExpressionContainer(
                keyValue
                  ? t.arrowFunctionExpression([], t.callExpression(onAction.node.value.expression, [keyValue]))
                  : onAction.node.value.expression
              )
            )
          );
        }

        // Add an isDisabled prop to each item, testing whether it is in disabledKeys.
        if (disabledKeys && keyValue) {
          childNode.openingElement.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier('isDisabled'),
              t.jsxExpressionContainer(
                t.callExpression(
                  t.memberExpression(
                    disabledKeys,
                    t.identifier('has')
                  ),
                  [keyValue]
                )
              )
            )
          );
        }

        child.replaceWith(childNode);
      }
    }
  });

  onAction?.remove();

  path.node.openingElement.name = t.jsxIdentifier(localName);
  if (path.node.closingElement) {
    path.node.closingElement.name = t.jsxIdentifier(localName);
  }
}
