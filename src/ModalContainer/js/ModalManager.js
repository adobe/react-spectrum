import ModalManager from 'react-overlays/lib/ModalManager'; // needed for the modal manager class

export default class SpectrumModalManager extends ModalManager { // extending for the add and remove
  addToModal(child) {
    const hideSiblingNodes = this.hideSiblingNodes;
    this.hideSiblingNodes = false;
    this.add(child, document.body);
    this.hideSiblingNodes = hideSiblingNodes;
  }

  removeFromModal(child) {
    const hideSiblingNodes = this.hideSiblingNodes;
    this.hideSiblingNodes = false;
    this.remove(child);
    this.hideSiblingNodes = hideSiblingNodes;
  }
}
