import {CollectionView} from './CollectionView';
import {Item} from './types';
import {LayoutInfo} from './LayoutInfo';

let KEY = 0;

/**
 * {@link CollectionView} creates instances of the {@link ReusableView} class to
 * represent views currently being displayed. ReusableViews manage a DOM node, handle
 * applying {@link LayoutInfo} objects to the view, and render content
 * as needed. Subclasses must implement the {@link render} method at a
 * minimum. Other methods can be overrided to customize behavior.
 */
export class ReusableView {
  /** The LayoutInfo this view is currently representing. */
  layoutInfo: LayoutInfo | null;

  /** The content currently being displayed by this view, set by the collection view. */
  content: any;

  states: Set<string>;

  viewType: string;
  key: number;
  
  private isDirty: boolean;
  private contentChanged: boolean;

  constructor() {
    this.isDirty = false;
    this.contentChanged = false;
    this.states = new Set();
    this.key = ++KEY;

    // this.css({
    //   position: 'absolute',
    //   overflow: 'hidden',
    //   top: 0,
    //   left: 0,
    //   transition: 'all',
    //   WebkitTransition: 'all',
    //   WebkitTransitionDuration: 'inherit',
    //   transitionDuration: 'inherit'
    // });

    // // set WAI-ARIA role="presentation", item role should be set in the item renderer
    // this.setAttribute('role', 'presentation');
  }

  /**
   * Applies the given LayoutInfo to the view.
   * If overridden, subclasses must call super.
   */
  // applyLayoutInfo(layoutInfo: LayoutInfo) {
  //   if (!layoutInfo) {
  //     return;
  //   }

  //   let transform = `translate3d(${layoutInfo.rect.x}px, ${layoutInfo.rect.y}px, 0)`;
  //   if (layoutInfo.transform) {
  //     transform += ' ' + layoutInfo.transform;
  //   }

  //   this.css({
  //     width: layoutInfo.rect.width + 'px',
  //     height: layoutInfo.rect.height + 'px',
  //     opacity: layoutInfo.opacity,
  //     zIndex: layoutInfo.zIndex,
  //     WebkitTransform: transform,
  //     transform: transform
  //   });

  //   this.layoutInfo = layoutInfo;
  // }

  /**
   * Prepares the view for reuse. Called just before the view is removed from the DOM.
   */
  prepareForReuse() {
    this.content = null;
    this.layoutInfo = null;
  }

  /**
   * Sets the content currently being displayed by the view and re-renders.
   */
  // setContent(content) {
  //   this.content = content;
  //   this.isDirty = true;
  //   this.contentChanged = true;
  //   // this.flushUpdates();
  // }

  // renderChildren(context) {
  //   if (this.contentChanged) {
  //     this.render(context);
  //     this.contentChanged = false;
  //   }
  // }

  // /**
  //  * Renders the view. Must be implemented by subclasses.
  //  * @abstract
  //  */
  // render(context) {
  //   throw new Error('Subclasses must implement render');
  // }

  /**
   * Applies a state to the view, such as a selected state.
   * The default implementation applies CSS classes.
   */
  addState(state: string) {
    // this.addClass(state);
    this.states.add(state);
    this.isDirty = true;
  }

  /**
   * Removes a state from the view, such as a selected state.
   * The default implementation removes CSS classes.
   */
  removeState(state: string) {
    // this.removeClass(state);
    this.states.delete(state);
    this.isDirty = true;
  }

  /**
   * Sets whether the given state is applied.
   */
  setState(state: string, enabled: boolean) {
    if (enabled) {
      this.addState(state);
    } else {
      this.removeState(state);
    }
  }

  /**
   * Sets focus to first child element of view if it is focusable.
   */
  // focus() {
  //   var node = this.backendView && this.getDOMNode().firstChild as HTMLElement;

  //   if (node && typeof node.focus === 'function') {
  //     node.focus();
  //   }
  // }
}
