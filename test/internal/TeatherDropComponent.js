import React from 'react';
import expect from 'expect';
import {render, unmountComponentAtNode} from 'react-dom';
import TetherDropComponent from '../../src/internal/TetherDropComponent';

describe('TetherDropComponent', () => {
  it('Adds target and drop elements', () => {
    const {targetEl, dropEl} = renderIntoDiv(
      <TetherDropComponent
        content={ <div className="drop" /> }
      >
        <div className="target" />
      </TetherDropComponent>
    );
    expect(dropEl.querySelector('.drop')).toExist();
    expect(targetEl.querySelector('.target')).toExist();
    expect(dropEl.className).toBe('coral-drop coral-drop-element');
    expect(dropEl.querySelector('.coral-drop-content')).toExist();
    expect(targetEl.querySelector('.coral-drop-target')).toExist();
    expect(dropEl.parentNode).toNotExist(); // Hasn't been attached until open:true is set.
  });

  it('supports classPrefix', () => {
    const {targetEl, dropEl} = renderIntoDiv(
      <TetherDropComponent
        content={ <div className="drop" /> }
        classPrefix="foo"
      >
        <div className="target" />
      </TetherDropComponent>
    );
    expect(dropEl.className).toBe('foo foo-element');
    expect(dropEl.querySelector('.foo-content')).toExist();
    expect(targetEl.querySelector('.foo-target')).toExist();
  });

  it('supports open', () => {
    const {targetEl, dropEl} = renderIntoDiv(
      <TetherDropComponent
        content={ <div className="drop" /> }
        open
      >
        <div className="target" />
      </TetherDropComponent>
    );
    assertPosition(targetEl, 'left', 'center');
    expect(dropEl.className.indexOf('coral-drop-open') >= 0).toBe(true);
    expect(dropEl.parentNode).toBe(document.body);
  });

  describe('supports position', () => {
    const createElWithPosition = position => (
      renderIntoDiv(
        <TetherDropComponent
          content={ <div className="drop" /> }
          position={ position }
          open
        >
          <div className="target" />
        </TetherDropComponent>
      )
    );

    it('right center', () => {
      const {targetEl} = createElWithPosition('right center');
      assertPosition(targetEl, 'left', 'center');
    });

    it('top center', () => {
      const {targetEl} = createElWithPosition('top center');
      assertPosition(targetEl, 'bottom', 'top');
    });

    it('left center', () => {
      const {targetEl} = createElWithPosition('left center');
      assertPosition(targetEl, 'right', 'left');
    });

    it('bottom center', () => {
      const {targetEl} = createElWithPosition('bottom center');
      assertPosition(targetEl, 'top', 'bottom');
    });
  });

  it('cleans up after itself', () => {
    const addSpy = expect.spyOn(document, 'addEventListener');
    const removeSpy = expect.spyOn(document, 'removeEventListener');
    const {tree, targetEl, dropEl} = renderIntoDiv(
      <TetherDropComponent onClickOutside={ function () {} } content={ <div /> } open>
        Foo
      </TetherDropComponent>
    );

    expect(tree.tetherDrop).toExist();
    expect(addSpy.calls[0].arguments[0]).toBe('click');
    expect(dropEl.parentNode).toExist();

    unmountComponentAtNode(targetEl);

    expect(tree.tetherDrop).toNotExist();
    expect(removeSpy.calls[0].arguments[0]).toBe('click');
    expect(dropEl.parentNode).toNotExist(); // removed from DOM

    addSpy.restore();
    removeSpy.restore();
  });

  it('supports onClickOutside', () => {
    const spy = expect.createSpy();
    const {targetEl} = renderIntoDiv(
      <TetherDropComponent onClickOutside={ spy } content={ <div /> } open>
        Foo
      </TetherDropComponent>
    );
    expect(spy).toNotHaveBeenCalled();
    dispatchCustomEvent(targetEl, 'click');
    expect(spy).toNotHaveBeenCalled();
    dispatchCustomEvent(document, 'click');
    expect(spy).toHaveBeenCalled();
  });

  describe('updates', () => {
    let targetEl;
    let dropEl;

    const renderAgainWithProps = (node, {children = 'Foo', ...otherProps}) => {
      if (otherProps.content == null) {
        otherProps.content = <div />;
      }
      const tree =
        render(
          <TetherDropComponent
            open
            { ...otherProps }
          >
            { children }
          </TetherDropComponent>,
          node
        );
      return populateReturnObject(tree, node);
    };

    beforeEach(() => {
      const tree =
        renderIntoDiv(<TetherDropComponent content={ <div /> } open>Foo</TetherDropComponent>);
      targetEl = tree.targetEl;
      dropEl = tree.dropEl;
    });

    it('content when it changes', () => {
      expect(dropEl.querySelector('.coral-drop-content').firstChild.tagName).toBe('DIV');
      const {dropEl: newDropEl} = renderAgainWithProps(targetEl, {content: <span />});
      expect(newDropEl.querySelector('.coral-drop-content').firstChild.tagName).toBe('SPAN');
    });

    it('children when it changes', () => {
      expect(targetEl.firstChild.innerHTML).toBe('Foo');
      const {targetEl: newTargetEl} =
        renderAgainWithProps(targetEl, {children: 'Bar', content: <div />});
      expect(newTargetEl.firstChild.innerHTML).toBe('Bar');
    });

    it('visibility when open changes', () => {
      ({targetEl, dropEl} =
        renderIntoDiv(<TetherDropComponent content={ <div /> }>Foo</TetherDropComponent>));
      expect(dropEl.parentNode).toNotExist();
      const {dropEl: newDropEl} = renderAgainWithProps(targetEl, {});
      expect(newDropEl.parentNode).toExist(); // Make sure visibility is changed.
    });
  });
});

const dispatchCustomEvent = (node, eventType, bubbles = false, cancelable = true) => {
  const e = document.createEvent('CustomEvent');
  e.initEvent(eventType, bubbles, cancelable);
  node.dispatchEvent(e);
};

const renderIntoDiv = component => {
  const div = document.createElement('div');
  const tree = render(component, div);
  return populateReturnObject(tree, div);
};

const populateReturnObject = (tree, node) => (
  {
    targetEl: node,
    drop: tree.tetherDrop,
    dropEl: tree.tetherDrop.drop,
    tree
  }
);

const assertPosition = (el, elementPosition, targetPosition) => {
  expect(hasClasses(el.firstChild, [
    `coral-drop-element-attached-${ elementPosition }`,
    'coral-drop-element-attached-center',
    `coral-drop-target-attached-${ targetPosition }`,
    'coral-drop-target-attached-center'
  ])).toBe(true);
};

const hasClass = (el, className) => ` ${ el.className } `.indexOf(` ${ className } `) >= 0;
const hasClasses =
  (el, classNames) => classNames.find(className => hasClass(el, className) === false) == null;
