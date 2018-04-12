import assert from 'assert';
import Button from '../../src/Button/js/Button';
import {mount} from 'enzyme';
import OpenTransition from '../../src/utils/OpenTransition';
import Overlay from '../../src/OverlayTrigger/js/Overlay';
import OverlayTrigger from '../../src/OverlayTrigger/js/OverlayTrigger';
import Popover from '../../src/Popover/js/Popover';
import Portal from 'react-overlays/lib/Portal';
import Position from '../../src/OverlayTrigger/js/Position';
import PropTypes from 'prop-types';
import React from 'react';
import RootCloseWrapper from 'react-overlays/lib/RootCloseWrapper';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Overlay', () => {
  const noop = function () {};
  it('renders an overlay', () => {
    const tree = shallow(<Overlay show><span>hey</span></Overlay>);
    assert(tree.find(OpenTransition));
  });

  it('doesn\'t change render of an overlay if not showing', () => {
    const tree = shallow(<Overlay><span /></Overlay>);
    assert.equal(tree.state('exited'), true);
    assert.equal(tree.getElement(), null);
  });

  it('renders a portal with the container prop', () => {
    const tree = shallow(<Overlay show container={noop} />);
    assert(tree.find(Portal));
    assert.equal(tree.find(Portal).prop('container'), noop);
  });

  it('passes props to OpenTransition', () => {
    let props = {
      show: true,
      onExit: noop,
      onExiting: noop,
      onEnter: noop,
      onEntering: noop,
      onEntered: noop
    };
    const tree = shallow(<Overlay {...props} />);

    assert.equal(tree.state('exited'), false);
    assert.equal(tree.find(OpenTransition).prop('in'), true);
    assert.equal(tree.find(OpenTransition).prop('onExit'), noop);
    assert.equal(tree.find(OpenTransition).prop('onExiting'), noop);
    assert.equal(tree.find(OpenTransition).prop('onEnter'), noop);
    assert.equal(tree.find(OpenTransition).prop('onEntering'), noop);
    assert.equal(tree.find(OpenTransition).prop('onEntered'), noop);
  });

  it('wraps in a close wrapper when true', () => {
    const tree = shallow(<Overlay show rootClose onHide={noop}><span /></Overlay>);
    assert(tree.find(RootCloseWrapper));
    assert.equal(tree.find(RootCloseWrapper).prop('onRootClose'), noop);
  });

  it('passes props to Position', () => {
    const target = document.createElement('div');
    let props = {
      show: true,
      container: noop,
      containerPadding: 5,
      target,
      placement: 'left',
      shouldUpdatePosition: true
    };
    const tree = shallow(<Overlay {...props}><span /></Overlay>);

    assert.equal(tree.find(Position).prop('container'), noop);
    assert.equal(tree.find(Position).prop('containerPadding'), 5);
    assert.equal(tree.find(Position).prop('target'), target);
    assert.equal(tree.find(Position).prop('placement'), 'left');
    assert.equal(tree.find(Position).prop('shouldUpdatePosition'), true);
  });

  it('calls props onExcited with args', () => {
    let onExited = sinon.spy();
    const tree = shallow(<Overlay show onExited={onExited}><span /></Overlay>);
    tree.instance().onExited({foo: 'bar'});
    assert(onExited.calledOnce);
    assert(onExited.withArgs({foo: 'bar'}));
  });

  it('changes state if props change', () => {
    const tree = shallow(<Overlay show><span /></Overlay>);
    tree.instance().componentWillReceiveProps({foo: 'bar'});
    assert.equal(tree.state('exited'), true);
  });

  it('context overlay', () => {
    function SimpleContainer(props, context) {
      return props.children;
    }
    function SimpleComponent(props, context) {
      return <div id="modal-test">{context.name}</div>;
    }
    SimpleContainer.contextTypes = {
      name: PropTypes.string
    };

    SimpleComponent.contextTypes = {
      name: PropTypes.string
    };

    const context = {
      name: 'a context has no name'
    };

    const overlayTrigger = mount(
      <SimpleContainer>
        <OverlayTrigger defaultShow placement="right">
          <Button label="Click Me" variant="primary" />
          <Popover><SimpleComponent /></Popover>
        </OverlayTrigger>
      </SimpleContainer>,
      {context});

    assert.equal(document.getElementById('modal-test').textContent, 'a context has no name');
    overlayTrigger.unmount();
  });
});
