import {DOMBackend} from '../src/dom/DOMBackend';
import ReactView from './ReactView';

export class ReactBackend extends DOMBackend {
  createView(options) {
    return new ReactView(options);
  }
}

export default new ReactBackend;
