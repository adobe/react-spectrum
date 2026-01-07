import {addComment, getName} from '../../shared/utils';
import {commentOutProp} from '../../shared/transforms';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Copies the columns prop from the TableHeader to the Row component.
 */
function addColumnsPropToRow(
  path: NodePath<t.JSXElement>
): void {
  const tableHeaderPath = path.get('children').find((child) =>
      t.isJSXElement(child.node) &&
      t.isJSXIdentifier(child.node.openingElement.name) &&
      getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'TableHeader'
    ) as NodePath<t.JSXElement> | undefined;

  if (!tableHeaderPath) {
    addComment(path.node, ' TODO(S2-upgrade): Could not find TableHeader within Table to retrieve columns prop.');
    return;
  }

  const columnsProp = tableHeaderPath
    .get('openingElement')
    .get('attributes')
    .find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'columns') as NodePath<t.JSXAttribute> | undefined;

  if (columnsProp) {
    path.traverse({
      JSXElement(innerPath) {
        if (
          t.isJSXElement(innerPath.node) &&
          t.isJSXIdentifier(innerPath.node.openingElement.name) &&
          getName(innerPath as NodePath<t.JSXElement>, innerPath.node.openingElement.name) === 'Row'
        ) {
          let rowPath = innerPath as NodePath<t.JSXElement>;
          rowPath.node.openingElement.attributes.push(columnsProp.node);

          // If Row doesn't contain id prop, leave a comment for the user to check manually
          let idProp = rowPath.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'id');
          if (!idProp) {
            addComment(rowPath.node, ' TODO(S2-upgrade): If the items do not have id properties, you\'ll need to add an id prop to the Row.');
          }
        }
      }
    });
  }
}

function commentIfNestedColumns(
  path: NodePath<t.JSXElement>
) {
  const headerPath = path.get('children').find((child) =>
    t.isJSXElement(child.node) &&
    t.isJSXIdentifier(child.node.openingElement.name) &&
    getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'TableHeader'
  ) as NodePath<t.JSXElement> | undefined;
  const columns = headerPath?.get('children') || [];

  let hasNestedColumns = false;

  columns.forEach(column => {
    let columnChildren = column.get('children');
    if (
        columnChildren.find(child =>
          t.isJSXElement(child.node) &&
          t.isJSXIdentifier(child.node.openingElement.name) &&
          getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'Column'
      )
    ) {
      hasNestedColumns = true;
    }
  });

  if (hasNestedColumns) {
    addComment(path.node, ' TODO(S2-upgrade): Nested Column components are not supported yet.');
  }
}

/**
 * Adds isRowHeader to the first Column in a table if there isn't already a row header.
 * @param path
 */
function addRowHeader(
  path: NodePath<t.JSXElement>
) {
  let tableHeaderPath = path.get('children').find((child) =>
    t.isJSXElement(child.node) &&
    t.isJSXIdentifier(child.node.openingElement.name) &&
    getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'TableHeader'
  ) as NodePath<t.JSXElement> | undefined;


  // Check if isRowHeader is already set on a Column
  let hasRowHeader = false;
  tableHeaderPath?.get('children').forEach((child) => {
    if (
      t.isJSXElement(child.node) &&
      t.isJSXIdentifier(child.node.openingElement.name) &&
      getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'Column'
    ) {
      let isRowHeaderProp = (child.get('openingElement') as NodePath).get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'isRowHeader') as NodePath<t.JSXAttribute> | undefined;
      if (isRowHeaderProp) {
        hasRowHeader = true;
      }
    }
  });

  // If there isn't already a row header, add one to the first Column if possible
  if (!hasRowHeader) {
    tableHeaderPath?.get('children').forEach((child) => {
      // Add to first Column if static
      if (
        !hasRowHeader &&
        t.isJSXElement(child.node) &&
        t.isJSXIdentifier(child.node.openingElement.name) &&
        getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'Column'
      ) {
        child.node.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('isRowHeader'), t.jsxExpressionContainer(t.booleanLiteral(true))));
        hasRowHeader = true;
      }

      // If render function is used, leave a comment to update manually
      if (
        t.isJSXExpressionContainer(child.node) &&
        t.isArrowFunctionExpression(child.node.expression)
      ) {
        addComment(child.node, ' TODO(S2-upgrade): You\'ll need to add isRowHeader to one of the columns manually.');
      }

      // If array.map is used, leave a comment to update manually
      if (
        t.isJSXExpressionContainer(child.node) &&
        t.isCallExpression(child.node.expression) &&
        t.isMemberExpression(child.node.expression.callee) &&
        t.isIdentifier(child.node.expression.callee.property) &&
        child.node.expression.callee.property.name === 'map'
      ) {
        addComment(child.node, ' TODO(S2-upgrade): You\'ll need to add isRowHeader to one of the columns manually.');
      }
    });
  }
}

/**
 * Moves loadingState and onLoadMore from TableBody to TableView.
 * @param path
 */
function movePropsFromTableBodyToTableView(
  path: NodePath<t.JSXElement>
) {
  const tableBodyPath = path.get('children').find((child) =>
    t.isJSXElement(child.node) &&
    t.isJSXIdentifier(child.node.openingElement.name) &&
    getName(child as NodePath<t.JSXElement>, child.node.openingElement.name) === 'TableBody'
  ) as NodePath<t.JSXElement> | undefined;

  if (!tableBodyPath) {
    return;
  }

  const propsToMove = ['loadingState', 'onLoadMore'];
  const newAttributes: t.JSXAttribute[] = [];

  tableBodyPath.node.openingElement.attributes = tableBodyPath.node.openingElement.attributes.filter(attribute => {
    if (t.isJSXAttribute(attribute) && propsToMove.includes(attribute.name.name as string)) {
      newAttributes.push(attribute);
      return false; // Remove from TableBody
    }
    return true; // Keep in TableBody
  });

  if (newAttributes.length > 0) {
    path.node.openingElement.attributes.push(...newAttributes);
  }
}

/**
 * Transforms TableView:
 * - For Column and Row: Update key to be id (and keep key if rendered inside array.map).
 * - For dynamic tables, pass a columns prop into Row.
 * - For Row: Update dynamic render function to pass in column instead of columnKey.
 * - Comment out UNSTABLE_allowsExpandableRows (it has not been implemented yet).
 * - Comment out UNSTABLE_onExpandedChange (it has not been implemented yet).
 * - Comment out UNSTABLE_expandedKeys (it has not been implemented yet).
 * - Comment out UNSTABLE_defaultExpandedKeys (it has not been implemented yet).
 */
export default function transformTable(path: NodePath<t.JSXElement>): void {
  // Add columns prop to Row for dynamic tables
  addColumnsPropToRow(path);

  // Comment out nested columns
  commentIfNestedColumns(path);

  // Comment out dragAndDropHooks
  commentOutProp(path, {propName: 'dragAndDropHooks'});

  // Comment out selectionStyle="highlight"
  commentOutProp(path, {propName: 'selectionStyle'});

  // Comment out unstable expandable rows props
  commentOutProp(path, {propName: 'UNSTABLE_allowsExpandableRows'});
  commentOutProp(path, {propName: 'UNSTABLE_onExpandedChange'});
  commentOutProp(path, {propName: 'UNSTABLE_expandedKeys'});
  commentOutProp(path, {propName: 'UNSTABLE_defaultExpandedKeys'});

  addRowHeader(path);

  // Move loadingState and onLoadMore from TableBody to TableView
  movePropsFromTableBodyToTableView(path);
}
