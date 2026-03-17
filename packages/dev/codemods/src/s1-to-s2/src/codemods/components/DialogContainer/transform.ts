import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';
import {updateDialogChild} from '../DialogTrigger/transform';
import {updatePropName} from '../../shared/transforms';

/**
 * Transforms DialogContainer:
 * - Remove type (dependent on the dialog level child used, e.g., Dialog, FullscreenDialog, Popover).
 * - Move isDismissable (as isDismissible) to the dialog level component.
 * - Move isKeyboardDismissDisabled to the dialog level component.
 */
export default function transformDialogContainer(path: NodePath<t.JSXElement>): void {
  // Move isDismissable (as isDismissible) to the dialog level component
  updatePropName(path, {oldPropName: 'isDismissable', newPropName: 'isDismissible'});

  updateDialogChild(path);
}
