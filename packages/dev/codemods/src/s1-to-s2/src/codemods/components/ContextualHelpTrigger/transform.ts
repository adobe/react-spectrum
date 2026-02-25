import {addComponentImport, getName} from '../../shared/utils';
import {getComponents} from '../../../getComponents';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

let availableComponents = getComponents();

/**
 * Transforms ContextualHelpTrigger:
 * - Rename ContextualHelpTrigger to UnavailableMenuItemTrigger.
 * - Replace the old Dialog with ContextualHelpPopover.
 */
export default function transformContextualHelpTrigger(path: NodePath<t.JSXElement>): void {
  let program = path.findParent((p) => t.isProgram(p.node)) as NodePath<t.Program>;
  let localName = addComponentImport(program, 'UnavailableMenuItemTrigger');

  // replace ContextualHelpTrigger with UnavailableMenuItemTrigger
  path.node.openingElement.name = t.jsxIdentifier(localName);
  if (path.node.closingElement) {
    path.node.closingElement.name = t.jsxIdentifier(localName);
  }

  // replace Dialog with ContextualHelpPopover
  let dialog = path.node.children.filter((c): c is t.JSXElement => t.isJSXElement(c))[1];
  if (dialog && t.isJSXIdentifier(dialog.openingElement.name)) {
    let name = getName(path, dialog.openingElement.name);
    if (name === 'Dialog') {
      let contextualHelpPopover = availableComponents.has('ContextualHelpPopover')
        ? addComponentImport(program, 'ContextualHelpPopover')
        : 'ContextualHelpPopover';
      dialog.openingElement.name = t.jsxIdentifier(contextualHelpPopover);
      if (dialog.closingElement) {
        dialog.closingElement.name = t.jsxIdentifier(contextualHelpPopover);
      }
    }
  }
}
