import {getName, removeComponentImport} from '../../shared/utils';
import {NodePath} from '@babel/traverse';
import {removeProp, updateComponentWithinCollection, updateToNewComponentName} from '../../shared/transforms';
import * as t from '@babel/types';

function transformTabList(tabListPath: NodePath<t.JSXElement>): t.JSXElement {
  tabListPath.get('children').forEach(itemPath => {
    if (
      t.isJSXElement(itemPath.node) &&
      t.isJSXIdentifier(itemPath.node.openingElement.name) &&
      getName(itemPath as NodePath<t.JSXElement>, itemPath.node.openingElement.name) === 'Item'
    ) {
      updateComponentWithinCollection(itemPath as NodePath<t.JSXElement>, {parentComponentName: 'TabList', newComponentName: 'Tab'});
    }
  });
  return tabListPath.node;
}

function transformTabPanels(tabPanelsPath: NodePath<t.JSXElement>, itemsProp: t.JSXAttribute | null): t.JSXElement[] {
  // Dynamic case
  let dynamicRender = tabPanelsPath.get('children').find(path => t.isJSXExpressionContainer(path.node));
  if (dynamicRender) {
    updateToNewComponentName(tabPanelsPath, {newComponentName: 'Collection'});
    let itemPath = (dynamicRender.get('expression') as NodePath).get('body');
    updateComponentWithinCollection(itemPath as NodePath<t.JSXElement>, {parentComponentName: 'Collection', newComponentName: 'TabPanel'});
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
      updateComponentWithinCollection(itemPath as NodePath<t.JSXElement>, {parentComponentName: 'TabPanels', newComponentName: 'TabPanel'});
      return itemPath.node;
    }
    return null;
  }).filter(Boolean) as t.JSXElement[];
}

/**
 * Transforms Tabs props and structure:
 * - Inside TabList: Update Item to be Tab.
 * - Update items on Tabs to be on TabList.
 * - Inside TabPanels: Update Item to be a TabPanel and remove the surrounding TabPanels.
 * - Remove isEmphasized (it is no longer supported in Spectrum 2).
 * - Remove isQuiet (it is no longer supported in Spectrum 2).
 */
export default function transformTabs(path: NodePath<t.JSXElement>): void {

  let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
  removeComponentImport(program, 'TabPanels');

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

  // Remove isEmphasized
  removeProp(path, {propName: 'isEmphasized'});

  // Remove isQuiet
  removeProp(path, {propName: 'isQuiet'});
}
