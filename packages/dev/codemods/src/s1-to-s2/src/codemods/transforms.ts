import {addComment, addComponentImport, getName, removeComponentImport} from './utils';
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

    const originalParam = renderFunction.expression.params[0];
    if (!t.isIdentifier(originalParam)) {
      addComment(path.node.children[renderFunctionIndex], ' TODO(S2-upgrade): Could not automatically move the render props. You\'ll need to update this manually.');
      return;
    }
    const paramName = originalParam.name;
    const objectPattern = t.objectPattern([
      t.objectProperty(t.identifier(paramName),
        t.identifier(paramName),
        false,
        true
      )
    ]);

    const newRenderFunction = t.jsxExpressionContainer(
      t.arrowFunctionExpression(
        [objectPattern],
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
  const collectionItemParents = new Set(['Menu', 'ActionMenu', 'TagGroup', 'Breadcrumbs', 'Picker', 'ComboBox', 'ListBox', 'TabList', 'TabPanels', 'Collection']);

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

      updateKeyToId(path);

      let localName = newComponent;
      if (availableComponents.has(newComponent)) {
        let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
        localName = addComponentImport(program, newComponent);
      }

      let newNode = t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier(localName), path.node.openingElement.attributes),
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
  const collectionItemParents = new Set(['Menu', 'ActionMenu', 'TagGroup', 'Breadcrumbs', 'Picker', 'ComboBox', 'ListBox', 'TabList', 'TabPanels', 'ActionGroup', 'ActionButtonGroup', 'ToggleButtonGroup', 'ListBox', 'ListView', 'Collection', 'SearchAutocomplete', 'Accordion', 'ActionBar', 'StepList']);
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

/**
 * Updates Tabs to the new API.
 *
 * Example:
 * - Tabs: Remove TabPanels components and keep individual TabPanel components inside.
 */
function updateTabs(
  path: NodePath<t.JSXElement>
) {
  function transformTabs(path: NodePath<t.JSXElement>) {
    let tabListNode: t.JSXElement | null = null;
    let tabPanelsNodes: t.JSXElement[] = [];
    let itemsProp: t.JSXAttribute | null = null;

    path.node.openingElement.attributes = path.node.openingElement.attributes.filter(attr => {
      if (t.isJSXAttribute(attr) && attr.name.name === 'items') {
        itemsProp = attr;
        return false;
      }
      return true;
    });

    path.get('children').forEach(childPath => {
      if (t.isJSXElement(childPath.node)) {
        if (
          t.isJSXIdentifier(childPath.node.openingElement.name) &&
          getName(childPath as NodePath<t.JSXElement>, childPath.node.openingElement.name) === 'TabList'
        ) {
          tabListNode = transformTabList(childPath as NodePath<t.JSXElement>);
          if (itemsProp) {
            tabListNode.openingElement.attributes.push(itemsProp);
          }
        } else if (
          t.isJSXIdentifier(childPath.node.openingElement.name) &&
          getName(childPath as NodePath<t.JSXElement>, childPath.node.openingElement.name) === 'TabPanels'
        ) {
          tabPanelsNodes = transformTabPanels(childPath as NodePath<t.JSXElement>, itemsProp);
        }
      }
    });

    if (tabListNode) {
      path.node.children = [tabListNode, ...tabPanelsNodes];
    }
  }

  function transformTabList(tabListPath: NodePath<t.JSXElement>): t.JSXElement {
    tabListPath.get('children').forEach(itemPath => {
      if (
        t.isJSXElement(itemPath.node) &&
        t.isJSXIdentifier(itemPath.node.openingElement.name) &&
        getName(itemPath as NodePath<t.JSXElement>, itemPath.node.openingElement.name) === 'Item'
      ) {
        updateComponentWithinCollection(itemPath as NodePath<t.JSXElement>, {parentComponent: 'TabList', newComponent: 'Tab'});
      }
    });
    return tabListPath.node;
  }

  function transformTabPanels(tabPanelsPath: NodePath<t.JSXElement>, itemsProp: t.JSXAttribute | null): t.JSXElement[] {
    // Dynamic case
    let dynamicRender = tabPanelsPath.get('children').find(path => t.isJSXExpressionContainer(path.node));
    if (dynamicRender) {
      updateToNewComponent(tabPanelsPath, {newComponent: 'Collection'});
      let itemPath = (dynamicRender.get('expression') as NodePath).get('body');
      updateComponentWithinCollection(itemPath as NodePath<t.JSXElement>, {parentComponent: 'Collection', newComponent: 'TabPanel'});
      if (itemsProp) {
        tabPanelsPath.node.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('items'), itemsProp.value));
      }
      return [tabPanelsPath.node];
    }

    // Static case
    return tabPanelsPath.get('children').map(itemPath => {
      if (
        t.isJSXElement(itemPath.node) &&
        t.isJSXIdentifier(itemPath.node.openingElement.name) &&
        getName(itemPath as NodePath<t.JSXElement>, itemPath.node.openingElement.name) === 'Item'
      ) {
        updateComponentWithinCollection(itemPath as NodePath<t.JSXElement>, {parentComponent: 'TabPanels', newComponent: 'TabPanel'});
        return itemPath.node;
      }
      return null;
    }).filter(Boolean) as t.JSXElement[];
  }

  let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
  removeComponentImport(program, 'TabPanels');
  transformTabs(path);
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
    let propValue: t.JSXAttribute['value'] | void;
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
          [t.isStringLiteral(propValue) ? t.jsxText(propValue.value) : propValue]
        )
      );
      // TODO: handle dynamic collections. Need to wrap function child in <Collection> and move `items` prop down.
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
        let value = convertDimension(attrPath.node.value.value, 'size');
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

/**
 * Handles the legacy `Link` API where an `a` tag or custom router component could be used within a `Link` component.
 * Removes the inner component and moves its attributes to the `Link` component.
 */
function updateLegacyLink(
  path: NodePath<t.JSXElement>
) {
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
 * Copies the columns prop from the TableHeader to the Row component.
 */
function addColumnsPropToRow(
  path: NodePath<t.JSXElement>
) {
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

/**
 * Updates the function signature of the Row component.
 */
function updateRowFunctionArg(
  path: NodePath<t.JSXElement>
) {
  // Find the function passed as a child
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

        // Replace references to the old parameter name inside the function body
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
 * Updates the key prop to id. Keeps the key prop if it's used in an array.map function.
 */
function updateKeyToId(
  path: NodePath<t.JSXElement>
) {
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
}

export function commentIfNestedColumns(
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
 * Updates DialogTrigger and DialogContainer to the new API.
 *
 * Example:
 * - When `type="popover"`, replaces Dialog with `<Popover>`.
 * - When `type="fullscreen"`, replaces Dialog with `<FullscreenDialog>`.
 * - When `type="fullscreenTakeover"`, replaces Dialog with `<FullscreenDialog variant="fullscreenTakeover">`.
 */
function updateDialogChild(
  path: NodePath<t.JSXElement>
) {
  let typePath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'type') as NodePath<t.JSXAttribute> | undefined;
  let type = typePath?.node.value?.type === 'StringLiteral' ? typePath.node.value?.value : 'modal';
  let newComponent = 'Dialog';
  let props: t.JSXAttribute[] = [];
  if (type === 'popover') {
    newComponent = 'Popover';
  } else if (type === 'fullscreen' || type === 'fullscreenTakeover') {
    newComponent = 'FullscreenDialog';
    if (type === 'fullscreenTakeover') {
      props.push(t.jsxAttribute(t.jsxIdentifier('variant'), t.stringLiteral(type)));
    }
  }

  for (let prop of ['isDismissible', 'mobileType', 'hideArrow', 'placement', 'shouldFlip', 'isKeyboardDismissDisabled', 'containerPadding', 'offset', 'crossOffset']) {
    let attr = path.get('openingElement').get('attributes').find(attr => attr.isJSXAttribute() && attr.node.name.name === prop) as NodePath<t.JSXAttribute> | undefined;
    if (attr) {
      props.push(attr.node);
      attr.remove();
    }
  }

  typePath?.remove();

  let localName = newComponent;
  if (newComponent !== 'Dialog' && availableComponents.has(newComponent)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localName = addComponentImport(program, newComponent);
  }

  path.traverse({
    JSXElement(dialog) {
      if (!t.isJSXIdentifier(dialog.node.openingElement.name) || getName(dialog, dialog.node.openingElement.name) !== 'Dialog') {
        return;
      }

      dialog.node.openingElement.name = t.jsxIdentifier(localName);
      if (dialog.node.closingElement) {
        dialog.node.closingElement.name = t.jsxIdentifier(localName);
      }

      dialog.node.openingElement.attributes.push(...props);
    }
  });
}

function updateActionGroup(
  path: NodePath<t.JSXElement>
) {
  let selectionModePath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'selectionMode') as NodePath<t.JSXAttribute> | undefined;
  let selectionMode = t.isStringLiteral(selectionModePath?.node.value) ? selectionModePath.node.value.value : 'none';
  let newComponent, childComponent;
  if (selectionMode === 'none') {
    newComponent = 'ActionButtonGroup';
    childComponent = 'ActionButton';
    selectionModePath?.remove();
  } else {
    newComponent = 'ToggleButtonGroup';
    childComponent = 'ToggleButton';
  }

  let localName = newComponent;
  if (availableComponents.has(newComponent)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localName = addComponentImport(program, newComponent);
  }

  let localChildName = childComponent;
  if (availableComponents.has(childComponent)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localChildName = addComponentImport(program, childComponent);
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
        if (key && newComponent === 'ToggleButtonGroup') {
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
  updateTabs,
  movePropToNewChildComponent,
  movePropToParentComponent,
  updateToNewComponent,
  convertDimensionValueToPx,
  updatePlacementToSingleValue,
  removeComponentIfWithinParent,
  updateAvatarSize,
  updateLegacyLink,
  addColumnsPropToRow,
  updateRowFunctionArg,
  updateDialogChild,
  updateActionGroup,
  updateKeyToId,
  commentIfNestedColumns,
  addRowHeader
};
