/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import Button from '../../src/Button/js/Button';
import * as ModalContainer from '../../src/ModalContainer/js/ModalContainer.js';
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
import {sleep} from '../utils';
import Tooltip from '../../src/Tooltip/js/Tooltip';

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
  });

  it('wraps in a close wrapper when true', () => {
    const tree = shallow(<Overlay show rootClose><span /></Overlay>);
    assert(tree.find(RootCloseWrapper));
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
    assert(tree.find(Position).prop('boundariesElement'));
  });

  it('calls props onExited with args', () => {
    let onExited = sinon.spy();
    const tree = shallow(<Overlay show onExited={onExited}><span /></Overlay>);
    tree.instance().onExited({foo: 'bar'});
    assert(onExited.calledOnce);
    assert(onExited.withArgs({foo: 'bar'}));
  });

  it('should not apply extra css to body', () => {
    let overlay = mount(
      <OverlayTrigger trigger="click">
        <Button>Click me</Button>
        <Popover>Popover</Popover>
      </OverlayTrigger>
    );
    const prevText = document.body.style.cssText;

    overlay.setState({'show': true});
    assert.equal(document.body.style.cssText, prevText);
    overlay.setState({'show': false});
    overlay.unmount();
  });

  it('calls modalManager when rendering and unmounting', () => {
    const stub = sinon.stub(require('../../src/OverlayTrigger/js/calculatePosition'), 'default').returns({
      positionLeft: 100,
      positionTop: 50,
      maxHeight: 200,
      arrowOffsetLeft: '0%',
      arrowOffsetTop: '50%'
    });
    const addspy = sinon.spy();
    const removespy = sinon.spy();
    const addstub = sinon.stub(ModalContainer.modalManager, 'addToModal').callsFake(addspy);
    const removestub = sinon.stub(ModalContainer.modalManager, 'removeFromModal').callsFake(removespy);
    const tree = mount(<OverlayTrigger><button /><Overlay><span>hi</span></Overlay></OverlayTrigger>);
    assert(!addstub.called);
    tree.setState({'show': true});
    assert(addstub.called);
    stub.restore();
    stub.resetHistory();
    tree.unmount();
    assert(removestub.called);
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

  it('should only hide if it is the top-most overlay', async () => {
    let onHideOuter = sinon.spy();
    let onHideInner = sinon.spy();
    let overlay = mount(
      <Overlay show onHide={onHideOuter}>
        <OverlayTrigger onHide={onHideInner} trigger="click">
          <Button>Click me</Button>
          <Popover trapFocus={false}>Popover</Popover>
        </OverlayTrigger>
      </Overlay>
    );

    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);

    // Hiding the outer overlay should work fine since the inner overlay hasn't been shown yet
    overlay.instance().hide();

    assert(onHideOuter.calledOnce);
    assert(onHideInner.notCalled);

    onHideOuter.resetHistory();

    // Trigger click
    let event = new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    document.querySelector('button').dispatchEvent(event);
    await sleep(17);
    overlay.update();

    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);

    // Wait for animation
    await sleep(125);

    // Hiding the outer overlay should now do nothing since it is no longer the top overlay
    overlay.instance().hide();
    assert(onHideOuter.notCalled);
    assert(onHideInner.notCalled);

    // Hiding the inner overlay should work since it is the top overlay
    document.querySelector('button').dispatchEvent(event);
    assert(onHideOuter.notCalled);
    assert(onHideInner.calledOnce);

    onHideInner.resetHistory();

    // Wait for animation
    await sleep(125);

    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);

    // Hiding the outer overlay should work now since it is the top overlay
    overlay.instance().hide();
    assert(onHideOuter.calledOnce);
    assert(onHideInner.notCalled);

    overlay.unmount();
  });

  it('should hide all top-most overlays of different role', async () => {
    const clock = sinon.useFakeTimers();
    const onHideFirst = sinon.spy();
    const onHideSecond = sinon.spy();
    const tree = mount(
      <Overlay show>
        <OverlayTrigger onHide={onHideFirst} trigger="click">
          <OverlayTrigger onHide={onHideSecond} trigger="click">
            <Button />
            <Popover />
          </OverlayTrigger>
          <Tooltip />
        </OverlayTrigger>
      </Overlay>
    );

    const event = new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });

    document.querySelector('button').dispatchEvent(event);
    clock.tick(100);
    assert(onHideFirst.notCalled);
    assert(onHideSecond.notCalled);
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
    assert.equal(document.querySelectorAll('.spectrum-Tooltip').length, 1);

    document.dispatchEvent(event);
    clock.tick(100);
    assert(onHideFirst.calledOnce);
    assert(onHideSecond.calledOnce);
    clock.restore();
    tree.unmount();
  });
});
