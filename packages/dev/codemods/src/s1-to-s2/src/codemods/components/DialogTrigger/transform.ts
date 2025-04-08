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

export default function transformDialogTrigger(path: NodePath<t.JSXElement>) {
  commentOutProp(path, {propToComment: 'type', propValue: 'tray'});
  commentOutProp(path, {propToComment: 'mobileType'});
  removeProp(path, {propToRemove: 'targetRef'});
  moveRenderPropsToChild(path, {newChildComponent: 'Dialog'});
  updatePropName(path, {oldProp: 'isDismissable', newProp: 'isDismissible'});
  updateDialogChild(path);
}
