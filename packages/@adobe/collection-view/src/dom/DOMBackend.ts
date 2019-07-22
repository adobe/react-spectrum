import DOMView from './DOMView';
import DragHandler from './DragHandler';
import {Backend, DragHandlerView} from '../types';
import {View} from '../View';

export class DOMBackend implements Backend<DOMView> {
  createView(view: View) {
    return new DOMView(view);
  }
  
  registerDragEvents(view: DragHandlerView) {
    DragHandler.registerView(view);
  }
  
  unregisterDragEvents(view: DragHandlerView) {
    DragHandler.unregisterView(view);
  }
  
  setDragImage(event: DragEvent, view: View) {
    DragHandler.setDragImage(event, view);
  }
}

export default new DOMBackend;
