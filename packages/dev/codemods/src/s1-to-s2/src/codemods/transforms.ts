import {addComment, addComponentImport, getName} from './utils';
import {convertDimension} from './dimensions';
import {getComponents} from '../getComponents';
import {NodePath} from '@babel/traverse';
import type {ReactNode} from 'react';
import * as t from '@babel/types';

let availableComponents = getComponents();

export interface UpdatePropNameAndValueOptions {
  /** Prop name to replace. */
  oldProp: string,
  /** Prop value to replace. */
  oldValue: ReactNode,
  /** Updated prop name. */
  newProp: string,
  /** Updated prop value. */
  newValue: ReactNode
}

/**
 * Update prop name and value to new prop name and value.
 *
 * Example:
 * - Button: Change variant="cta" to variant="accent".
 * - Link: Change `variant="overBackground"` to `staticColor="white"`.
 */
function updatePropNameAndValue(
  path: NodePath<t.JSXElement>,
  options: UpdatePropNameAndValueOptions
) {
  const {oldProp, oldValue, newProp, newValue} = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === oldProp) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === oldProp) {
    if (
      t.isStringLiteral(attrPath.node.value) &&
      attrPath.node.value.value === oldValue
    ) {
      // Update old prop name to new prop name
      attrPath.node.name.name = newProp;

      // If prop value is a string and matches the old value, replace it with the new value
      if (typeof newValue === 'string') {
        attrPath.node.value = t.stringLiteral(newValue);
      } else if (typeof newValue === 'boolean') {
        if (!newValue) {
          attrPath.node.value = t.jsxExpressionContainer(t.booleanLiteral(newValue));
        } else {
          attrPath.node.value = null;
        }
      }
    } else if (t.isJSXExpressionContainer(attrPath.node.value)) {
      if (t.isIdentifier(attrPath.node.value.expression)) {
        // @ts-ignore
        if (attrPath.node.comments && [...attrPath.node.comments].some((comment) => comment.value.includes('could not be automatically'))) {
          return;
        }
        addComment(attrPath.node, ` TODO(S2-upgrade): Prop ${oldProp} could not be automatically updated because ${attrPath.node.value.expression.name} could not be followed.`);
      } else {
        // If prop value is an expression, traverse to find a string literal that matches the old and replace it with the new value
        attrPath.traverse({
          StringLiteral(stringPath) {
            if (
              t.isStringLiteral(stringPath.node) &&
              stringPath.node.value === oldValue
            ) {
              // Update old prop name to new prop name
              attrPath.node.name.name = newProp;

              if (typeof newValue === 'string') {
                stringPath.replaceWith(t.stringLiteral(newValue));
              } else if (typeof newValue === 'boolean') {
                if (!newValue) {
                  stringPath.replaceWith(t.booleanLiteral(newValue));
                } else {
                  attrPath.node.value = null;
                }
              }
            }
          }
        });
      }
    }
  }
}

export interface UpdatePropValueAndAddNewPropOptions {
  /** Prop name to replace. */
  oldProp: string,
  /** Prop value to replace. */
  oldValue: ReactNode,
  /** Updated prop name. */
  newProp: string,
  /** Updated prop value. */
  newValue: ReactNode,
  /** Additional new prop name to add. */
  additionalProp: string,
  /** Additional new prop value to use. */
  additionalValue: string
}

/**
 * Updates a prop name and value to new prop name and value, and adds an additional prop.
 *
 * Example:
 * - Button: Change `variant="overBackground"` to `variant="primary" staticColor="white"`.
 */
function updatePropValueAndAddNewProp(
  path: NodePath<t.JSXElement>,
  options: UpdatePropValueAndAddNewPropOptions
) {
  const {
    oldProp,
    oldValue,
    newProp,
    newValue,
    additionalProp,
    additionalValue
  } = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === oldProp) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isStringLiteral(attrPath.node.value) && attrPath.node.value.value === oldValue) {
    // Update old prop name to new prop name
    attrPath.node.name.name = newProp;

    // If prop value is a string and matches the old value, replace it with the new value
    if (typeof newValue === 'string') {
      attrPath.node.value = t.stringLiteral(newValue);
    } else if (typeof newValue === 'boolean') {
      attrPath.node.value = t.jsxExpressionContainer(t.booleanLiteral(newValue));
    }

    if (additionalProp && additionalValue) {
      attrPath.insertAfter(
        t.jsxAttribute(t.jsxIdentifier(additionalProp), t.stringLiteral(additionalValue as string))
      );
    }
  } else if (attrPath && t.isJSXExpressionContainer(attrPath.node.value)) {
    // If prop value is an expression, traverse to find a string literal that matches the old and replace it with the new value
    attrPath.traverse({
      StringLiteral(stringPath) {
        if (
          t.isStringLiteral(stringPath.node) &&
          stringPath.node.value === oldValue
        ) {
          // Update old prop name to new prop name
          attrPath.node.name.name = newProp;

          if (typeof newValue === 'string') {
            stringPath.replaceWith(t.stringLiteral(newValue));
          } else if (typeof newValue === 'boolean') {
            stringPath.replaceWith(t.booleanLiteral(newValue));
          }

          if (additionalProp && additionalValue) {
            attrPath.insertAfter(
              t.jsxAttribute(t.jsxIdentifier(additionalProp), t.stringLiteral(additionalValue as string))
            );
          }
        }
      }
    });
  }
}

export interface UpdatePropNameOptions {
  /** Prop name to replace. */
  oldProp: string,
  /** Updated prop name. */
  newProp: string
}

/**
 * Updates a prop name to new prop name.
 *
 * Example:
 * - Button: Change style to fillStyle.
 */
function updatePropName(
  path: NodePath<t.JSXElement>,
  options: UpdatePropNameOptions
) {
  const {oldProp, newProp} = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === oldProp) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === oldProp) {
    attrPath.node.name.name = newProp;
  }
}

export interface RemovePropOptions {
  /** Prop name to remove. */
  propToRemove: string,
  /** If provided, prop will only be removed if set to this value. */
  propValue?: string
}

/**
 * Removes a prop.
 *
 * Example:
 * - Button: Remove isQuiet (it is no longer supported).
 */
function removeProp(path: NodePath<t.JSXElement>, options: RemovePropOptions) {
  const {propToRemove, propValue} = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === propToRemove) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === propToRemove) {
    if (propValue) {
      // If prop value is provided, remove prop only if it matches the value
      if (t.isStringLiteral(attrPath.node.value) && attrPath.node.value.value === propValue) {
        attrPath.remove();
      } else if (
        t.isJSXExpressionContainer(attrPath.node.value)
      ) {
        if (t.isIdentifier(attrPath.node.value.expression)) {
          // @ts-ignore
          // eslint-disable-next-line max-depth
          if (attrPath.node.comments && [...attrPath.node.comments].some((comment) => comment.value.includes('could not be automatically'))) {
            return;
          }
          addComment(attrPath.node, ` TODO(S2-upgrade): Prop ${propToRemove} could not be automatically removed because ${attrPath.node.value.expression.name} could not be followed.`);
        } else {
          attrPath.traverse({
            StringLiteral(stringPath) {
              if (
                t.isStringLiteral(stringPath.node) &&
                stringPath.node.value === propValue
              ) {
                // Invalid prop value was found inside expression.
                addComment(attrPath.node, ` TODO(S2-upgrade): ${propToRemove}="${propValue}" is no longer supported. You'll need to update this manually.`);
              }
            }
          });
        }
      }
    } else {
      // No prop value provided, so remove prop regardless of value
      attrPath.remove();
    }
  }
}

export interface CommentOutPropOptions {
  /** Prop to comment out. */
  propToComment: string,
  /** If provided, prop will only be commented out if set to this value. */
  propValue?: string
}

/**
 * Comments out a prop.
 *
 * Example:
 * - Button: Comment out isPending (it has not been implemented yet).
 */
function commentOutProp(
  path: NodePath<t.JSXElement>,
  options: CommentOutPropOptions
) {
  const {propToComment, propValue} = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === propToComment) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === propToComment) {
    if (propValue) {
      // If prop value is provided, comment out prop only if it matches the value
      if (t.isStringLiteral(attrPath.node.value) && attrPath.node.value.value === propValue) {
        addComment(attrPath.parentPath.node, ` TODO(S2-upgrade): ${propToComment}="${propValue}" has not been implemented yet.`);
        attrPath.remove();
      } else {
        attrPath.traverse({
          StringLiteral(stringPath) {
            if (
              t.isStringLiteral(stringPath.node) &&
              stringPath.node.value === propValue
            ) {
              addComment(attrPath.parentPath.node, ` TODO(S2-upgrade): ${propToComment}="${propValue}" has not been implemented yet.`);
              attrPath.remove();
            }
          }
        });
      }
    } else {
      addComment(attrPath.parentPath.node, ` TODO(S2-upgrade): ${propToComment} has not been implemented yet.`);
      attrPath.remove();
    }
  }
}

export interface AddCommentToElementOptions {
  /** Comment to leave. */
  comment: string
}

/**
 * Add a comment above an element.
 *
 * Example:
 * - Breadcrumbs: Check if nav needs to be added around Bre.
 */
function addCommentToElement(
  path: NodePath<t.JSXElement>,
  options: AddCommentToElementOptions
) {
  const {comment} = options;
  addComment(path.node, ` TODO(S2-upgrade): ${comment}`);
}

export interface UpdateComponentIfPropPresentOptions {
  /** Updated component to use. */
  newComponent: string,
  /** Will update component if this prop is present. */
  propToCheck: string
}

/**
 * If a prop is present, updates to use a new component.
 *
 * Example:
 * - Button: If `href` is present, Button should be converted to `LinkButton`.
 */
function updateComponentIfPropPresent(
  path: NodePath<t.JSXElement>,
  options: UpdateComponentIfPropPresentOptions
) {
  const {newComponent, propToCheck} = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === propToCheck) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === propToCheck) {
    let node = attrPath.findParent((p) => t.isJSXElement(p.node))?.node;
    if (node && t.isJSXElement(node)) {
      let localName = newComponent;
      if (availableComponents.has(newComponent)) {
        let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
        localName = addComponentImport(program, newComponent);
      }
      node.openingElement.name = t.jsxIdentifier(localName);
      if (node.closingElement) {
        node.closingElement.name = t.jsxIdentifier(localName);
      }
    }
  }
}

export interface MoveRenderPropsOptions {
  newChildComponent: string
}

/**
 * Remove render props, and move usage to a child component.
 *
 * Example:
 * - DialogTrigger: Update children to remove render props usage, and note that `close` function moved from `DialogTrigger` to `Dialog`.
 */
function moveRenderPropsToChild(
  path: NodePath<t.JSXElement>,
  options: MoveRenderPropsOptions
) {
  const {newChildComponent} = options;

  const renderFunctionIndex = path.node.children.findIndex(
    (child) => 
      t.isJSXExpressionContainer(child) && 
      t.isArrowFunctionExpression(child.expression) &&
      t.isJSXElement(child.expression.body) &&
      t.isJSXIdentifier(child.expression.body.openingElement.name));
  
  const renderFunction = path.node.children[renderFunctionIndex] as t.JSXExpressionContainer;

  if (
    t.isJSXExpressionContainer(renderFunction) && 
    t.isArrowFunctionExpression(renderFunction.expression) &&
    t.isJSXElement(renderFunction.expression.body) &&
    t.isJSXIdentifier(renderFunction.expression.body.openingElement.name) &&
    getName(path, renderFunction.expression.body.openingElement.name) !== newChildComponent
  ) {
    addComment(renderFunction, ' TODO(S2-upgrade): update this dialog to move the close function inside');
    return;
  }

  if (
    renderFunction && 
    t.isArrowFunctionExpression(renderFunction.expression) &&
    t.isJSXElement(renderFunction.expression.body)
  ) {
    const dialogElement = renderFunction.expression.body;

    const newRenderFunction = t.jsxExpressionContainer(
      t.arrowFunctionExpression(
        renderFunction.expression.params,
        t.jsxFragment(
          t.jsxOpeningFragment(),
          t.jsxClosingFragment(),
          dialogElement.children
        )
      )
    );

    let removedOnDismiss = false;
    const attributes = dialogElement.openingElement.attributes.filter((attr) => {
      if (t.isJSXAttribute(attr) && attr.name.name === 'onDismiss') {
        removedOnDismiss = true;
        return false;
      }
      return true;
    });
    
    path.node.children[renderFunctionIndex] = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier(newChildComponent), attributes),
      t.jsxClosingElement(t.jsxIdentifier(newChildComponent)),
      [newRenderFunction]
    );

    if (removedOnDismiss) {
      addComment(path.node.children[renderFunctionIndex], ' onDismiss was removed from Dialog. Use onOpenChange on the DialogTrigger, or onDismiss on the DialogContainer instead');
    }
  }
}

export interface UpdateComponentWithinCollectionOptions {
  parentComponent: string,
  newComponent: string
}

/**
 * If within a collection component, updates to use a new component.
 *
 * Example:
 * - Item: If within `Menu`, update name from `Item` to `MenuItem`.
 */
function updateComponentWithinCollection(
  path: NodePath<t.JSXElement>,
  options: UpdateComponentWithinCollectionOptions
) {
  const {parentComponent, newComponent} = options;

  // Collections currently implemented
  // TODO: Add 'ActionGroup', 'ListBox', 'ListView' once implemented
  const collectionItemParents = new Set(['Menu', 'ActionMenu', 'TagGroup', 'Breadcrumbs', 'Picker', 'ComboBox', 'ListBox', 'TabList', 'TabPanels']);

  if (
    t.isJSXElement(path.node) &&
    t.isJSXIdentifier(path.node.openingElement.name)
  ) {
    // Find closest parent collection component
    let closestParentCollection = path.findParent((p) => 
      t.isJSXElement(p.node) &&
      t.isJSXIdentifier(p.node.openingElement.name) &&
      collectionItemParents.has(getName(path, p.node.openingElement.name))
    );
    if (
      closestParentCollection &&
      t.isJSXElement(closestParentCollection.node) &&
      t.isJSXIdentifier(closestParentCollection.node.openingElement.name) &&
      getName(path, closestParentCollection.node.openingElement.name) === parentComponent
    ) {
      // If closest parent collection component matches parentComponent, replace with newComponent

      let attributes = path.node.openingElement.attributes;
      let keyProp = attributes.find((attr) => t.isJSXAttribute(attr) && attr.name.name === 'key');
      if (
        keyProp &&
        t.isJSXAttribute(keyProp)
      ) {
        // Update key prop to be id
        keyProp.name = t.jsxIdentifier('id');
      }

      if (
        t.isArrowFunctionExpression(path.parentPath.node) &&
        path.parentPath.parentPath &&
        t.isCallExpression(path.parentPath.parentPath.node) &&
        path.parentPath.parentPath.node.callee.type === 'MemberExpression' &&
        path.parentPath.parentPath.node.callee.property.type === 'Identifier' &&
        path.parentPath.parentPath.node.callee.property.name === 'map'
      ) {
        // If Array.map is used, keep the key prop
        if (
          keyProp &&
          t.isJSXAttribute(keyProp)
        ) {
          let newKeyProp = t.jsxAttribute(t.jsxIdentifier('key'), keyProp.value);
          attributes.push(newKeyProp);
        }
      }

      let localName = newComponent;
      if (availableComponents.has(newComponent)) {
        let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
        localName = addComponentImport(program, newComponent);
      }

      let newNode = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier(localName), attributes),
        t.jsxClosingElement(t.jsxIdentifier(localName)),
        path.node.children
      );
      path.replaceWith(newNode);
    }
  }
}

/**
 * If no parent collection detected, leave a comment for the user to check manually.
 *
 * Example: If they're declaring declaring Items somewhere above the collection.
 */
function commentIfParentCollectionNotDetected(
  path: NodePath<t.JSXElement>
) {
  const collectionItemParents = new Set(['Menu', 'ActionMenu', 'TagGroup', 'Breadcrumbs', 'Picker', 'ComboBox', 'ListBox', 'TabList', 'TabPanels', 'ActionGroup', 'ListBox', 'ListView']);
  if (
    t.isJSXElement(path.node)
  ) {
    // Find closest parent collection component
    let closestParentCollection = path.findParent((p) => 
      t.isJSXElement(p.node) &&
      t.isJSXIdentifier(p.node.openingElement.name) &&
      collectionItemParents.has(getName(path, p.node.openingElement.name))
    );
    if (!closestParentCollection) {
      // If we couldn't find a parent collection parent, leave a comment for them to check manually
      addComment(path.node, ' TODO(S2-upgrade): Couldn\'t automatically detect what type of collection component this is rendered in. You\'ll need to update this manually.');
    }
  }
}

export interface RemoveParentAndKeepChildrenOptions {
  parentComponent: string
}

/**
 * Remove a parent component and keep its children.
 *
 * Example:
 * - Tabs: Remove TabPanels components and keep individual TabPanel components inside.
 */
function removeParentAndKeepChildren(
  path: NodePath<t.JSXElement>,
  options: RemoveParentAndKeepChildrenOptions
) {
  const {parentComponent} = options;

  path.traverse({
    JSXElement(path) {
      if (
        t.isJSXElement(path.node) &&
        t.isJSXIdentifier(path.node.openingElement.name) &&
        getName(path, path.node.openingElement.name) === parentComponent
      ) {
        path.replaceWithMultiple(path.node.children);
      }
    }
  });
}

export interface MovePropToNewChildComponentOptions {
  parentComponent: string,
  childComponent: string,
  propToMove: string,
  newChildComponent: string
}

/**
 * If within a component, moves prop to new child component.
 *
 * Example:
 * - Section: If within `Menu`, move `title` prop string to be a child of new `Heading` within a `Header`.
 */
function movePropToNewChildComponent(
  path: NodePath<t.JSXElement>,
  options: MovePropToNewChildComponentOptions
) {
  const {parentComponent, childComponent, propToMove, newChildComponent} =
    options;

  if (
    t.isJSXElement(path.node) &&
    t.isJSXElement(path.parentPath.node) &&
    t.isJSXIdentifier(path.node.openingElement.name) &&
    t.isJSXIdentifier(path.parentPath.node.openingElement.name) &&
    getName(path, path.node.openingElement.name) === childComponent &&
    getName(path, path.parentPath.node.openingElement.name) === parentComponent
  ) {
    let propValue;
    path.node.openingElement.attributes =
      path.node.openingElement.attributes.filter((attr) => {
        if (t.isJSXAttribute(attr) && attr.name.name === propToMove) {
          propValue = attr.value;
          return false;
        }
        return true;
      });

    if (propValue) {
      path.node.children.unshift(
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier(newChildComponent), []),
          t.jsxClosingElement(t.jsxIdentifier(newChildComponent)),
          [t.jsxText(propValue)]
        )
      );
    }
  }
}

export interface MovePropToParentComponentOptions {
  parentComponent: string,
  childComponent: string,
  propToMove: string
}

/**
 * Updates prop to be on parent component.
 *
 * Example:
 * - Tooltip: Remove `placement` and add to the parent `TooltipTrigger` instead.
 */
function movePropToParentComponent(
  path: NodePath<t.JSXElement>,
  options: MovePropToParentComponentOptions
) {
  const {parentComponent, childComponent, propToMove} = options;

  path.traverse({
    JSXAttribute(attributePath) {
      if (
        t.isJSXElement(path.parentPath.node) &&
        t.isJSXIdentifier(path.node.openingElement.name) &&
        t.isJSXIdentifier(path.parentPath.node.openingElement.name) &&
        attributePath.node.name.name === propToMove &&
        getName(path, path.node.openingElement.name) === childComponent &&
        getName(path, path.parentPath.node.openingElement.name) === parentComponent
      ) {
        path.parentPath.node.openingElement.attributes.push(
          t.jsxAttribute(t.jsxIdentifier(propToMove), attributePath.node.value)
        );
        attributePath.remove();
      }
    }
  });
}

export interface UpdateToNewComponentOptions {
  newComponent: string
}

/**
 * Update to use a new component.
 *
 * Example:
 * - Flex: Update `Flex` to be a `div` and apply flex styles using the style macro.
 */
function updateToNewComponent(
  path: NodePath<t.JSXElement>,
  options: UpdateToNewComponentOptions
) {
  const {newComponent} = options;

  let localName = newComponent;
  if (availableComponents.has(newComponent)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localName = addComponentImport(program, newComponent);
  }

  path.node.openingElement.name = t.jsxIdentifier(localName);
  if (path.node.closingElement) {
    path.node.closingElement.name = t.jsxIdentifier(localName);
  }
}

const conversions = {
  'cm': 37.8,
  'mm': 3.78,
  'in': 96,
  'pt': 1.33,
  'pc': 16
};

export interface ConvertDimensionValueToPxOptions {
  propToConvertValue: string
}

/**
 * Updates prop to use pixel value instead.
 * 
 * Example:
 * - ComboBox: Update `menuWidth` to a pixel value.
 */
function convertDimensionValueToPx(
  path: NodePath<t.JSXElement>,
  options: ConvertDimensionValueToPxOptions
) {
  const {propToConvertValue} = options;

  let attrPath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === propToConvertValue) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === propToConvertValue) {
    if (t.isStringLiteral(attrPath.node.value)) {
      try {
        let value = convertDimension(attrPath.node.value.value);
        if (value && typeof value === 'number') {
          attrPath.node.value = t.jsxExpressionContainer(t.numericLiteral(value));
        } else if (value && typeof value === 'string') {
          // eslint-disable-next-line max-depth
          if ((/%|vw|vh|auto|ex|ch|rem|vmin|vmax/).test(value)) {
            addComment(attrPath.node, ' TODO(S2-upgrade): Unable to convert CSS unit to a pixel value');
          } else if ((/cm|mm|in|pt|pc/).test(value)) {
            let unit = value.replace(/\[|\]|\d+/g, '');
            let conversion = conversions[unit as keyof typeof conversions];
            value = Number(value.replace(/\[|\]|cm|mm|in|pt|pc/g, ''));
            // eslint-disable-next-line max-depth
            if (!isNaN(value)) {
              let pixelValue = Math.round(conversion * value);
              attrPath.node.value = t.jsxExpressionContainer(t.numericLiteral(pixelValue));
            }
          } else if ((/px/).test(value)) {
            let pixelValue = Number(value.replace(/\[|\]|px/g, ''));
            // eslint-disable-next-line max-depth
            if (!isNaN(pixelValue)) {
              attrPath.node.value = t.jsxExpressionContainer(t.numericLiteral(pixelValue));
            }
          }
        }
      } catch (error) {
        addComment(attrPath.node, ` TODO(S2-upgrade): Prop ${propToConvertValue} could not be automatically updated due to error: ${error}`);
      }
    } else if (t.isJSXExpressionContainer(attrPath.node.value)) {
      if (t.isIdentifier(attrPath.node.value.expression)) {
        addComment(attrPath.node, ` TODO(S2-upgrade): Prop ${propToConvertValue} could not be automatically updated because ${attrPath.node.value.expression.name} could not be followed.`);
      }
    }
  }
}

export interface UpdatePlacementToSingleValueProps {
  propToUpdate: string,
  /* If provided, updates the prop on the specified child component */
  childComponent?: string
}

/**
 * Updates double placement values to a single value.
 * 
 * Example:
 * - TooltipTrigger: Update `placement="bottom left"` to `placement="bottom"`.
 */
function updatePlacementToSingleValue(
  path: NodePath<t.JSXElement>,
  options: UpdatePlacementToSingleValueProps
) {
  const {propToUpdate, childComponent} = options;

  const doublePlacementValues = new Set([
    'bottom left',
    'bottom right',
    'bottom start',
    'bottom end',
    'top left',
    'top right',
    'top start',
    'top end',
    'left top',
    'left bottom',
    'start top',
    'start bottom',
    'right top',
    'right bottom',
    'end top',
    'end bottom'
  ]);

  let elementPath = childComponent ? 
    path.get('children').find(
      (child) => t.isJSXElement(child.node) &&
      t.isJSXIdentifier(child.node.openingElement.name) &&
      getName(path, child.node.openingElement.name) === childComponent
    ) as NodePath<t.JSXElement> : path;
  let attrPath = elementPath.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === propToUpdate) as NodePath<t.JSXAttribute>;
  if (attrPath && t.isJSXAttribute(attrPath.node) && attrPath.node.name.name === propToUpdate) {
    if (t.isStringLiteral(attrPath.node.value) && doublePlacementValues.has(attrPath.node.value.value)) {
      attrPath.replaceWith(t.jsxAttribute(t.jsxIdentifier(propToUpdate), t.stringLiteral(attrPath.node.value.value.split(' ')[0])));
      return;
    } else if (t.isJSXExpressionContainer(attrPath.node.value)) {
      attrPath.traverse({
        StringLiteral(stringPath) {
          if (
            t.isStringLiteral(stringPath.node) &&
            doublePlacementValues.has(stringPath.node.value)
          ) {
            stringPath.replaceWith(t.stringLiteral(stringPath.node.value.split(' ')[0]));
            return;
          }
        }
      });
    }
  }
}

export interface RemoveComponentIfWithinParentOptions {
  parentComponent: string
}

/**
 * Remove component if within a parent component.
 * 
 * Example:
 * - Divider: Remove `Divider` if used within a `Dialog`.
 */
function removeComponentIfWithinParent(
  path: NodePath<t.JSXElement>,
  options: RemoveComponentIfWithinParentOptions
) {
  const {parentComponent} = options;
  if (
    t.isJSXElement(path.node) &&
    t.isJSXElement(path.parentPath.node) &&
    t.isJSXIdentifier(path.node.openingElement.name) &&
    t.isJSXIdentifier(path.parentPath.node.openingElement.name) &&
    getName(path, path.parentPath.node.openingElement.name) === parentComponent
  ) {
    path.remove();
  }
}

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

export const functionMap = {
  updatePropNameAndValue,
  updatePropValueAndAddNewProp,
  updatePropName,
  removeProp,
  commentOutProp,
  addCommentToElement,
  updateComponentIfPropPresent,
  moveRenderPropsToChild,
  updateComponentWithinCollection,
  commentIfParentCollectionNotDetected,
  removeParentAndKeepChildren,
  movePropToNewChildComponent,
  movePropToParentComponent,
  updateToNewComponent,
  convertDimensionValueToPx,
  updatePlacementToSingleValue,
  removeComponentIfWithinParent,
  updateAvatarSize
};
