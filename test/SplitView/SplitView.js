import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import SplitView from '../../src/SplitView';

describe('SplitView', function () {
  // Stub offsetWidth/offsetHeight so we can calculate min/max sizes correctly
  let stub1, stub2;
  before(function () {
    stub1 = sinon.stub(window.HTMLElement.prototype, 'offsetWidth').get(() => 1000);
    stub2 = sinon.stub(window.HTMLElement.prototype, 'offsetHeight').get(() => 1000);
  });

  after(function () {
    stub1.restore();
    stub2.restore();
  });

  afterEach(function () {
    document.body.style.cursor = '';
  });

  it('should render a basic split view', function () {
    let wrapper = shallow(
      <SplitView>
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    assert.equal(wrapper.prop('className'), 'spectrum-SplitView spectrum-SplitView--horizontal');
    assert.equal(wrapper.find('.spectrum-SplitView-pane').length, 2);
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').length, 1);
    assert.equal(wrapper.find('.spectrum-SplitView-gripper').length, 1);
    assert.equal(wrapper.find('.spectrum-SplitView-pane').first().childAt(0).text(), 'Left');
    assert.equal(wrapper.find('.spectrum-SplitView-pane').last().childAt(0).text(), 'Right');
    assert.equal(wrapper.find('.spectrum-SplitView-pane').first().prop('style').width, 304);

    let id = wrapper.find('.spectrum-SplitView-pane').first().prop('id');
    assert(id);
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('aria-controls'), id);
    assert(wrapper.find('.spectrum-SplitView-splitter').hasClass('is-draggable'));
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('role'), 'separator');
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('tabIndex'), 0);
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('aria-valuemin'), 0);
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('aria-valuemax'), 100);
  });

  it('should render a non-resizable split view', function () {
    let wrapper = shallow(
      <SplitView resizable={false}>
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    assert.equal(wrapper.find('.spectrum-SplitView-gripper').length, 0);
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('tabIndex'), null);
    assert(!wrapper.find('.spectrum-SplitView-splitter').hasClass('is-draggable'));
  });

  it('should render a split view with a primary pane on the right', function () {
    let wrapper = shallow(
      <SplitView primaryPane={1}>
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    let id = wrapper.find('.spectrum-SplitView-pane').last().prop('id');
    assert(id);
    assert.equal(wrapper.find('.spectrum-SplitView-splitter').prop('aria-controls'), id);
    assert.equal(wrapper.find('.spectrum-SplitView-pane').last().prop('style').width, 304);
  });

  it('should render a vertical split view', function () {
    let wrapper = shallow(
      <SplitView orientation="vertical">
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    assert.equal(wrapper.prop('className'), 'spectrum-SplitView spectrum-SplitView--vertical');
    assert.equal(wrapper.find('.spectrum-SplitView-pane').first().prop('style').height, 304);
  });

  it('should set the default size from primaryDefault', function () {
    let wrapper = shallow(
      <SplitView primaryDefault={50}>
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    assert.equal(wrapper.find('.spectrum-SplitView-pane').first().prop('style').width, 50);
  });

  describe('primarySize', () => {
    let onResize;
    let wrapper;
    beforeEach(() => {
      onResize = sinon.spy();
    });
    afterEach(() => {
      wrapper.unmount();
    });

    it('should do nothing if zero and collapsible is false', function () {
      wrapper = mount(
        <SplitView onResize={onResize}>
          <div>Left</div>
          <div>Right</div>
        </SplitView>
      , {disableLifecycleMethods: true});

      wrapper.setProps({primarySize: 0});

      assert(onResize.notCalled);
    });

    it('should place the divider at position 0 when mounted', function () {
      wrapper = mount(
        <SplitView collapsible onResize={onResize} primarySize={0}>
          <div>Left</div>
          <div>Right</div>
        </SplitView>);

      assert.equal(wrapper.state('dividerPosition'), 0);
    });

    it('should not resize if primarySize does not update', function () {
      wrapper = mount(
        <SplitView collapsible onResize={onResize} primarySize={350}>
          <div>Left</div>
          <div>Right</div>
        </SplitView>);

      wrapper.setProps({primaryMax: 999, primarySize: 350});
      assert(onResize.notCalled);
    });

    it('should resize when primarySize updates', function () {
      wrapper = mount(
        <SplitView collapsible onResize={onResize} primarySize={350}>
          <div>Left</div>
          <div>Right</div>
        </SplitView>);

      wrapper.setProps({primarySize: 0});
      assert(onResize.calledOnce);
    });

    it('should not drag if primarySize is controlled', function () {
      let onMouseDown = sinon.spy();
      wrapper = mount(
        <SplitView collapsible onMouseDown={onMouseDown} onResize={onResize} primarySize={0}>
          <div>Left</div>
          <div>Right</div>
        </SplitView>
      , {disableLifecycleMethods: true});

      wrapper.simulate('mouseMove', {clientX: 0, clientY: 0});
      wrapper.simulate('mouseDown', {clientX: 0, clientY: 0});
      assert(onMouseDown.called);
      assert.equal(wrapper.state('dragging'), false);
    });
  });

  function testCursor(props, clientX, clientY, cursor) {
    let tree = mount(
      <SplitView {...props}>
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    assert.equal(document.body.style.cursor, '');

    tree.simulate('mouseMove', {clientX, clientY});
    assert.equal(document.body.style.cursor, cursor);
    assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-hovered'));

    tree.simulate('mouseLeave');
    assert(!tree.find('.spectrum-SplitView-splitter').hasClass('is-hovered'));
    assert.equal(document.body.style.cursor, '');

    tree.unmount();
  }

  describe('horizontal cursors', function () {
    it('should set the cursor to e-resize when hovering over the splitter at the minimum', function () {
      testCursor({}, 304, 0, 'e-resize');
    });

    it('should set the cursor to ew-resize when hovering over the splitter in the middle', function () {
      testCursor({primaryMin: 50}, 304, 0, 'ew-resize');
    });

    it('should set the cursor to w-resize when hovering over the splitter at the maximum', function () {
      testCursor({primaryDefault: 100, primaryMin: 50, primaryMax: 100}, 100, 0, 'w-resize');
    });

    it('should set the cursor to w-resize when hovering over the splitter at the minimum with primaryPane = 1', function () {
      testCursor({primaryPane: 1}, 1000 - 304, 0, 'w-resize');
    });

    it('should set the cursor to ew-resize when hovering over the splitter in the middle with primaryPane = 1', function () {
      testCursor({primaryPane: 1, primaryMin: 50}, 1000 - 304, 0, 'ew-resize');
    });

    it('should set the cursor to e-resize when hovering over the splitter at the maximum with primaryPane = 1', function () {
      testCursor({primaryPane: 1, primaryDefault: 100, primaryMin: 50, primaryMax: 100}, 1000 - 100, 0, 'e-resize');
    });
  });

  describe('vertical cursors', function () {
    it('should set the cursor to s-resize when hovering over the splitter at the minimum', function () {
      testCursor({orientation: 'vertical'}, 0, 304, 's-resize');
    });

    it('should set the cursor to ns-resize when hovering over the splitter in the middle', function () {
      testCursor({orientation: 'vertical', primaryMin: 50}, 0, 304, 'ns-resize');
    });

    it('should set the cursor to n-resize when hovering over the splitter at the maximum', function () {
      testCursor({orientation: 'vertical', primaryDefault: 100, primaryMin: 50, primaryMax: 100}, 0, 100, 'n-resize');
    });

    it('should set the cursor to n-resize when hovering over the splitter at the minimum with primaryPane = 1', function () {
      testCursor({orientation: 'vertical', primaryPane: 1}, 0, 1000 - 304, 'n-resize');
    });

    it('should set the cursor to ns-resize when hovering over the splitter in the middle with primaryPane = 1', function () {
      testCursor({orientation: 'vertical', primaryPane: 1, primaryMin: 50}, 0, 1000 - 304, 'ns-resize');
    });

    it('should set the cursor to s-resize when hovering over the splitter at the maximum with primaryPane = 1', function () {
      testCursor({orientation: 'vertical', primaryPane: 1, primaryDefault: 100, primaryMin: 50, primaryMax: 100}, 0, 1000 - 100, 's-resize');
    });
  });

  function fireMouseEvent(type, props) {
    let event = new window.MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      ...props
    });

    window.dispatchEvent(event);
  }

  function testDragging(opts) {
    let onMouseDown = sinon.spy();
    let onResize = sinon.spy();
    let onResizeEnd = sinon.spy();
    let tree = mount(
      <SplitView {...(opts.props || {})} onMouseDown={onMouseDown} onResize={onResize} onResizeEnd={onResizeEnd}>
        <div>Left</div>
        <div>Right</div>
      </SplitView>
    , {disableLifecycleMethods: true});

    // simulate mouse move over diveder, then mouse down on it
    tree.simulate('mouseMove', {clientX: opts.startClientX || 304, clientY: opts.startClientY || 304});
    tree.simulate('mouseDown', {clientX: opts.startClientX || 304, clientY: opts.startClientY || 304});

    // check that the splitter is now active, and the cursor is set
    assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-active'));
    assert.equal(document.body.style.cursor, opts.startCursor);

    // fire mouse move
    fireMouseEvent('mousemove', {clientX: opts.endClientX || 304, clientY: opts.endClientY || 304});

    // check that mouseDown was called
    assert(onMouseDown.called);

    // check that onResize was called
    assert(onResize.calledOnce);
    assert(!onResizeEnd.called);
    assert.equal(onResize.lastCall.args[0], opts.width != null ? opts.width : opts.height);

    // check that width/height updated correctly
    tree.update();
    if (opts.width != null) {
      assert.equal(tree.find('.spectrum-SplitView-pane[id]').prop('style').width, opts.width);
    }

    if (opts.height != null) {
      assert.equal(tree.find('.spectrum-SplitView-pane[id]').prop('style').height, opts.height);
    }

    // check that the cursor changed
    assert.equal(document.body.style.cursor, opts.endCursor);

    // custom test
    if (opts.test) {
      opts.test(tree);
    }

    // cire mouse up, and check that splitter is no longer active
    fireMouseEvent('mouseup', {clientX: opts.endClientX || 0, clientY: opts.endClientY || 0});

    // check that onResizeEnd was called
    assert(onResizeEnd.called);
    assert.equal(onResizeEnd.lastCall.args[0], opts.width != null ? opts.width : opts.height);

    tree.update();
    assert(!tree.find('.spectrum-SplitView-splitter').hasClass('is-active'));

    tree.unmount();
  }

  describe('horizontal dragging', function () {
    it('should support dragging the splitter', function () {
      testDragging({
        endClientX: 400,
        startCursor: 'e-resize',
        endCursor: 'ew-resize',
        width: 400
      });
    });

    it('should stop dragging at the minimum', function () {
      testDragging({
        props: {primaryMin: 100},
        endClientX: 50,
        startCursor: 'ew-resize',
        endCursor: 'e-resize',
        width: 100
      });
    });

    it('should stop dragging at the maximum', function () {
      testDragging({
        props: {primaryMax: 500},
        endClientX: 600,
        startCursor: 'e-resize',
        endCursor: 'w-resize',
        width: 500
      });
    });

    it('should stop snap to zero when collapsible', function () {
      testDragging({
        props: {primaryMin: 100, collapsible: true},
        endClientX: 80,
        startCursor: 'ew-resize',
        endCursor: 'e-resize',
        width: 100
      });

      testDragging({
        props: {primaryMin: 100, collapsible: true},
        endClientX: 40,
        startCursor: 'ew-resize',
        endCursor: 'e-resize',
        width: 0,
        test(tree) {
          assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-start'));
        }
      });
    });

    it('should stop snap to zero when collapsible with primaryPane = 1', function () {
      testDragging({
        props: {primaryMin: 100, primaryPane: 1, collapsible: true},
        startClientX: 1000 - 304,
        endClientX: 1000 - 80,
        startCursor: 'ew-resize',
        endCursor: 'w-resize',
        width: 100
      });

      testDragging({
        props: {primaryMin: 100, primaryPane: 1, collapsible: true},
        startClientX: 1000 - 304,
        endClientX: 1000 - 40,
        startCursor: 'ew-resize',
        endCursor: 'w-resize',
        width: 0,
        test(tree) {
          assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-end'));
        }
      });
    });
  });

  describe('vertical dragging', function () {
    it('should support dragging the splitter', function () {
      testDragging({
        props: {orientation: 'vertical'},
        endClientY: 400,
        startCursor: 's-resize',
        endCursor: 'ns-resize',
        height: 400
      });
    });

    it('should stop dragging at the minimum', function () {
      testDragging({
        props: {orientation: 'vertical', primaryMin: 100},
        endClientY: 50,
        startCursor: 'ns-resize',
        endCursor: 's-resize',
        height: 100
      });
    });

    it('should stop dragging at the maximum', function () {
      testDragging({
        props: {orientation: 'vertical', primaryMax: 500},
        endClientY: 600,
        startCursor: 's-resize',
        endCursor: 'n-resize',
        height: 500
      });
    });

    it('should stop snap to zero when collapsible', function () {
      testDragging({
        props: {orientation: 'vertical', primaryMin: 100, collapsible: true},
        endClientY: 80,
        startCursor: 'ns-resize',
        endCursor: 's-resize',
        height: 100
      });

      testDragging({
        props: {orientation: 'vertical', primaryMin: 100, collapsible: true},
        endClientY: 40,
        startCursor: 'ns-resize',
        endCursor: 's-resize',
        height: 0,
        test(tree) {
          assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-start'));
        }
      });
    });

    it('should stop snap to zero when collapsible with primaryPane = 1', function () {
      testDragging({
        props: {orientation: 'vertical', primaryMin: 100, primaryPane: 1, collapsible: true},
        startClientY: 1000 - 304,
        endClientY: 1000 - 80,
        startCursor: 'ns-resize',
        endCursor: 'n-resize',
        height: 100
      });

      testDragging({
        props: {orientation: 'vertical', primaryMin: 100, primaryPane: 1, collapsible: true},
        startClientY: 1000 - 304,
        endClientY: 1000 - 40,
        startCursor: 'ns-resize',
        endCursor: 'n-resize',
        height: 0,
        test(tree) {
          assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-end'));
        }
      });
    });
  });

  describe('keyboard interactions', function () {
    function testKeyboard(opts) {
      let onResize = sinon.spy();
      let onResizeEnd = sinon.spy();
      let tree = mount(
        <SplitView {...(opts.props || {})} onResize={onResize} onResizeEnd={onResizeEnd}>
          <div>Left</div>
          <div>Right</div>
        </SplitView>
      , {disableLifecycleMethods: true});

      if (opts.setup) {
        opts.setup(tree);
      }

      onResize.reset();
      onResizeEnd.reset();

      tree.find('.spectrum-SplitView-splitter').simulate('keyDown', {key: opts.key});

      if (opts.width != null) {
        assert.equal(tree.find('.spectrum-SplitView-pane[id]').prop('style').width, opts.width);
      }

      if (opts.height != null) {
        assert.equal(tree.find('.spectrum-SplitView-pane[id]').prop('style').height, opts.height);
      }

      if (opts.shouldResize) {
        assert(onResize.calledOnce);
        assert.equal(onResize.lastCall.args[0], opts.width != null ? opts.width : opts.height);
        assert(onResizeEnd.calledOnce);
        assert.equal(onResizeEnd.lastCall.args[0], opts.width != null ? opts.width : opts.height);
      } else {
        assert(onResize.notCalled);
        assert(onResizeEnd.notCalled);
      }

      if (opts.test) {
        opts.test(tree);
      }

      tree.unmount();
    }

    describe('ArrowLeft', function () {
      it('should move the splitter to the left when pressing the left arrow key', function () {
        testKeyboard({
          props: {primaryMin: 50},
          key: 'ArrowLeft',
          width: 294,
          shouldResize: true
        });
      });

      it('should move the splitter to the left when pressing the left arrow key with primaryPane = 1', function () {
        testKeyboard({
          props: {primaryPane: 1},
          key: 'ArrowLeft',
          width: 314,
          shouldResize: true
        });
      });

      it('should not move to the left beyond the minimum', function () {
        testKeyboard({
          key: 'ArrowLeft',
          width: 304
        });
      });

      it('should not move to the left when orientation is vertical', function () {
        testKeyboard({
          props: {primaryMin: 50, orientation: 'vertical'},
          key: 'ArrowLeft',
          height: 304
        });
      });
    });

    describe('ArrowRight', function () {
      it('should move the splitter to the right when pressing the right arrow key', function () {
        testKeyboard({
          key: 'ArrowRight',
          width: 314,
          shouldResize: true
        });
      });

      it('should move the splitter to the right when pressing the right arrow key with primaryPane = 1', function () {
        testKeyboard({
          props: {primaryMin: 50, primaryPane: 1},
          key: 'ArrowRight',
          width: 294,
          shouldResize: true
        });
      });

      it('should not move to the right when orientation is vertical', function () {
        testKeyboard({
          props: {orientation: 'vertical'},
          key: 'ArrowRight',
          height: 304
        });
      });
    });

    describe('ArrowUp', function () {
      it('should move the splitter up when pressing the up arrow key', function () {
        testKeyboard({
          props: {primaryMin: 50, orientation: 'vertical'},
          key: 'ArrowUp',
          height: 294,
          shouldResize: true
        });
      });

      it('should move the splitter up when pressing the up arrow key with primaryPane = 1', function () {
        testKeyboard({
          props: {primaryPane: 1, orientation: 'vertical'},
          key: 'ArrowUp',
          height: 314,
          shouldResize: true
        });
      });

      it('should not move up beyond the minimum', function () {
        testKeyboard({
          props: {orientation: 'vertical'},
          key: 'ArrowUp',
          height: 304
        });
      });

      it('should not move up when orientation is horizontal', function () {
        testKeyboard({
          props: {primaryMin: 50, orientation: 'horizontal'},
          key: 'ArrowUp',
          width: 304
        });
      });
    });

    describe('ArrowDown', function () {
      it('should move the splitter down when pressing the down arrow key', function () {
        testKeyboard({
          props: {orientation: 'vertical'},
          key: 'ArrowDown',
          height: 314,
          shouldResize: true
        });
      });

      it('should move the splitter down when pressing the down arrow key with primaryPane = 1', function () {
        testKeyboard({
          props: {primaryMin: 50, primaryPane: 1, orientation: 'vertical'},
          key: 'ArrowDown',
          height: 294,
          shouldResize: true
        });
      });

      it('should not move down when orientation is horizontal', function () {
        testKeyboard({
          props: {orientation: 'horizontal'},
          key: 'ArrowDown',
          width: 304
        });
      });
    });

    describe('Home', function () {
      it('should move the splitter to the minimum when pressing the home key in horizontal orientation', function () {
        testKeyboard({
          props: {primaryMin: 50},
          key: 'Home',
          width: 50,
          shouldResize: true
        });
      });

      it('should move the splitter to the minimum when pressing the home key in vertical orientation', function () {
        testKeyboard({
          props: {primaryMin: 50, orientation: 'vertical'},
          key: 'Home',
          height: 50,
          shouldResize: true
        });
      });
    });

    describe('End', function () {
      it('should move the splitter to the maximum when pressing the end key in horizontal orientation', function () {
        testKeyboard({
          key: 'End',
          width: 1000 - 304,
          shouldResize: true
        });
      });

      it('should move the splitter to the maximum when pressing the end key in vertical orientation', function () {
        testKeyboard({
          props: {orientation: 'vertical'},
          key: 'End',
          height: 1000 - 304,
          shouldResize: true
        });
      });
    });

    describe('Enter', function () {
      it('should collapse the split view when pressing the enter key in horizontal orientation', function () {
        testKeyboard({
          props: {collapsible: true},
          key: 'Enter',
          width: 0,
          shouldResize: true,
          test(tree) {
            assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-start'));
          }
        });
      });

      it('should collapse the split view when pressing the enter key in horizontal orientation with primaryPane = 1', function () {
        testKeyboard({
          props: {collapsible: true, primaryPane: 1},
          key: 'Enter',
          width: 0,
          shouldResize: true,
          test(tree) {
            assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-end'));
          }
        });
      });

      it('should collapse the split view when pressing the enter key in vertical orientation', function () {
        testKeyboard({
          props: {collapsible: true, orientation: 'vertical'},
          key: 'Enter',
          height: 0,
          shouldResize: true,
          test(tree) {
            assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-start'));
          }
        });
      });

      it('should collapse the split view when pressing the enter key in vertical orientation with primaryPane = 1', function () {
        testKeyboard({
          props: {collapsible: true, primaryPane: 1, orientation: 'vertical'},
          key: 'Enter',
          height: 0,
          shouldResize: true,
          test(tree) {
            assert(tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-end'));
          }
        });
      });

      it('should restore the split view to its prior position when pressing the enter key when already collapsed', function () {
        testKeyboard({
          props: {collapsible: true, primaryDefault: 500},
          setup(tree) {
            // collapse
            tree.find('.spectrum-SplitView-splitter').simulate('keyDown', {key: 'Enter'});
          },
          key: 'Enter',
          width: 500,
          shouldResize: true,
          test(tree) {
            assert(!tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-start'));
          }
        });
      });

      it('should restore the split view to the minimum position when pressing the enter key when collapsed by default', function () {
        testKeyboard({
          props: {collapsible: true, primaryDefault: 0},
          key: 'Enter',
          width: 304,
          shouldResize: true,
          test(tree) {
            assert(!tree.find('.spectrum-SplitView-splitter').hasClass('is-collapsed-start'));
          }
        });
      });
    });
  });
});
