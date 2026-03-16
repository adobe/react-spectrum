import {getName} from '../../shared/utils';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updateKeyToId} from '../../shared/transforms';

/**
 * Updates the function signature of the Row component.
 */
function updateRowFunctionArg(
  path: NodePath<t.JSXElement>
): void {
  // Find the export function passed as a child
  let functionChild = path.get('children').find(childPath =>
    childPath.isJSXExpressionContainer() &&
    childPath.get('expression').isArrowFunctionExpression()
  );

  let tablePath = path.findParent((p) =>
    t.isJSXElement(p.node) &&
    t.isJSXIdentifier(p.node.openingElement.name) &&
    getName(path, p.node.openingElement.name) === 'TableView'
  );

  let tableHeaderPath = tablePath?.get('children').find((child) =>
    t.isJSXElement(child.node) &&
    t.isJSXIdentifier(child.node.openingElement.name) &&
    getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'TableHeader'
  ) as NodePath<t.JSXElement> | undefined;

  function findColumnKeyProp(path: NodePath<t.JSXElement>) {
    let columnKeyProp = 'id';
    path.traverse({
      JSXElement(columnPath) {
        if (
          t.isArrowFunctionExpression(columnPath.parentPath.node) &&
          t.isJSXElement(columnPath.node) &&
          t.isJSXIdentifier(columnPath.node.openingElement.name) &&
          getName(columnPath as NodePath<t.JSXElement>, columnPath.node.openingElement.name) === 'Column'
        ) {
          let openingElement = columnPath.get('openingElement');
          let keyPropPath = openingElement.get('attributes').find(attr =>
            t.isJSXAttribute(attr.node) &&
            (attr.node.name.name === 'key' || attr.node.name.name === 'id')
          );
          keyPropPath?.traverse({
            Identifier(innerPath) {
              if (
                innerPath.node.name === 'column' &&
                innerPath.parentPath.node.type === 'MemberExpression' &&
                t.isIdentifier(innerPath.parentPath.node.property)
              ) {
                columnKeyProp = innerPath.parentPath.node.property.name;
              }
            }
          });
        }
      }
    });
    return columnKeyProp || 'id';
  }

  let columnKey = findColumnKeyProp(tableHeaderPath as NodePath<t.JSXElement>);

  if (functionChild && functionChild.isJSXExpressionContainer()) {
    let arrowFuncPath = functionChild.get('expression');
    if (arrowFuncPath.isArrowFunctionExpression()) {
      let params = arrowFuncPath.node.params;
      if (params.length === 1 && t.isIdentifier(params[0])) {
        let paramName = params[0].name;

        // Rename parameter to 'column'
        params[0].name = 'column';

        // Replace references to the old parameter name inside the export function body
        arrowFuncPath.get('body').traverse({
          Identifier(innerPath) {
            if (
              innerPath.node.name === paramName &&
              // Ensure we're not replacing the parameter declaration
              innerPath.node !== params[0]
            ) {
              // Replace with column key
              innerPath.replaceWith(
                t.memberExpression(
                  t.identifier('column'),
                  t.identifier(columnKey ?? 'id')
                )
              );
            }
          }
        });
      }
    }
  }
}

/**
 * Transforms Row:
 * - Update key to id.
 * - Update function signature.
 */
export default function transformRow(path: NodePath<t.JSXElement>): void {
  // Update key to id
  updateKeyToId(path);

  updateRowFunctionArg(path);
}
