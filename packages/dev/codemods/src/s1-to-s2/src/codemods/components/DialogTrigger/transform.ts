import {addComponentImport, getName} from '../../shared/utils';
import {
  commentOutProp,
  moveRenderPropsToChild,
  removeProp,
  updatePropName
} from '../../shared/transforms';
import {getComponents} from '../../../getComponents';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

let availableComponents = getComponents();

/**
 * Updates DialogTrigger and DialogContainer to the new API.
 *
 * Example:
 * - When `type="popover"`, replaces Dialog with `<Popover>`.
 * - When `type="fullscreen"`, replaces Dialog with `<FullscreenDialog>`.
 * - When `type="fullscreenTakeover"`, replaces Dialog with `<FullscreenDialog variant="fullscreenTakeover">`.
 */
export function updateDialogChild(
  path: NodePath<t.JSXElement>
): void {
  let typePath = path.get('openingElement').get('attributes').find((attr) => t.isJSXAttribute(attr.node) && attr.node.name.name === 'type') as NodePath<t.JSXAttribute> | undefined;
  let type = typePath?.node.value?.type === 'StringLiteral' ? typePath.node.value?.value : 'modal';
  let newComponentName = 'Dialog';
  let props: t.JSXAttribute[] = [];
  if (type === 'popover') {
    newComponentName = 'Popover';
  } else if (type === 'fullscreen' || type === 'fullscreenTakeover') {
    newComponentName = 'FullscreenDialog';
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

  let localName = newComponentName;
  if (newComponentName !== 'Dialog' && availableComponents.has(newComponentName)) {
    let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
    localName = addComponentImport(program, newComponentName);
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

/**
 * Transforms DialogTrigger:
 * - Comment out type="tray" (it has not been implemented yet).
 * - Comment out mobileType (it has not been implemented yet).
 * - Remove targetRef (it is no longer supported).
 * - Move render props to the child component (updated API).
 */
export default function transformDialogTrigger(path: NodePath<t.JSXElement>): void {
  // Comment out type="tray"
  commentOutProp(path, {propName: 'type', propValue: 'tray'});

  // Comment out mobileType
  commentOutProp(path, {propName: 'mobileType'});

  // Remove targetRef
  removeProp(path, {propName: 'targetRef'});

  // Move render props to the child component
  moveRenderPropsToChild(path, {newChildComponentName: 'Dialog'});

  // Update isDismissable to isDismissible
  updatePropName(path, {oldPropName: 'isDismissable', newPropName: 'isDismissible'});

  // Update DialogTrigger to the new API
  updateDialogChild(path);
}
