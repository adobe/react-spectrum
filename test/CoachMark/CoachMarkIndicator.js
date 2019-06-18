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
import CoachMarkIndicator from '../../src/CoachMark/js/CoachMarkIndicator';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('CoachMarkIndicator', () => {
  let clock;
  let tree;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
    clock.restore();
  });

  it('default', () => {
    tree = mount(<div>
      <div
        id="something"
        style={{
          width: '100px',
          height: '75px',
          background: 'grey'
        }} />
      <CoachMarkIndicator selector="#something" />
    </div>);

    let rings = tree.find('.spectrum-CoachMarkIndicator-ring');
    assert.equal(rings.length, 3);
    rings.forEach(ring => {
      assert(ring.hasClass('spectrum-CoachMarkIndicator-ring'));
    });
  });

  it('quiet', () => {
    tree = mount(<div>
      <div
        id="something"
        style={{
          width: '100px',
          height: '75px',
          background: 'grey'
        }} />
      <CoachMarkIndicator selector="#something" quiet />
    </div>);

    let coachmarkIndicatorDiv = tree.children().children();
    assert(coachmarkIndicatorDiv.hasClass('spectrum-CoachMarkIndicator--quiet'));
    assert(coachmarkIndicatorDiv.hasClass('spectrum-CoachMarkIndicator'));
    assert.equal(coachmarkIndicatorDiv.children().length, 3);
  });

  it('Should attach to a dom element', async () => {
    const container = document.createElement('div');
    const someElement = document.createElement('div');
    someElement.setAttribute('id', 'something');
    someElement.getBoundingClientRect = () => ({
      left: 50,
      top: 75,
      width: 250,
      height: 150
    });
    container.appendChild(someElement);

    const someOtherElement = document.createElement('div');
    someOtherElement.setAttribute('id', 'somethingElse');
    someOtherElement.getBoundingClientRect = () => ({
      left: 200,
      top: 250,
      width: 100,
      height: 100
    });
    container.appendChild(someOtherElement);

    document.documentElement.appendChild(container);

    tree = mount(<CoachMarkIndicator selector="#something" />);

    let coachMarkState = tree.state();
    assert.equal(coachMarkState.style.top, 147);
    assert.equal(coachMarkState.style.left, 172);

    tree.setProps({
      selector: '#somethingElse'
    });

    coachMarkState = tree.state();
    assert.equal(coachMarkState.style.top, 297);
    assert.equal(coachMarkState.style.left, 247);

    document.documentElement.removeChild(container);
  });

  it('Should not render if it can not find the selector', async () => {
    tree = mount(<CoachMarkIndicator selector="#something" />);
    let updateTargetNodeSpy = sinon.stub(tree.instance(), 'updateTargetNode').callThrough();

    let coachMarkState = tree.state();
    assert(!('top' in coachMarkState.style));
    assert(!('left' in coachMarkState.style));
    clock.tick(2000);

    assert.equal(updateTargetNodeSpy.getCalls().length, 12);
    assert(!('top' in coachMarkState.style));
    assert(!('left' in coachMarkState.style));
  });

  it('Should move if its target moved because of a resize', async () => {
    const container = document.createElement('div');
    const someElement = document.createElement('div');
    someElement.setAttribute('id', 'something');
    someElement.getBoundingClientRect = () => ({
      left: 50,
      top: 75,
      width: 250,
      height: 150
    });
    container.appendChild(someElement);

    document.documentElement.appendChild(container);

    let onPositionedSpy = sinon.spy();
    tree = mount(<CoachMarkIndicator onPositioned={onPositionedSpy} selector="#something" />);

    let coachMarkState = tree.state();
    assert.equal(coachMarkState.style.top, 147);
    assert.equal(coachMarkState.style.left, 172);
    assert(onPositionedSpy.calledOnce);

    someElement.getBoundingClientRect = () => ({
      left: 200,
      top: 250,
      width: 100,
      height: 100
    });

    tree.instance().resizeListener();

    coachMarkState = tree.state();
    assert.equal(coachMarkState.style.top, 147);
    assert.equal(coachMarkState.style.left, 172);
    assert(onPositionedSpy.calledOnce);

    clock.tick(51); // one tick past debounce

    coachMarkState = tree.state();
    assert.equal(coachMarkState.style.top, 297);
    assert.equal(coachMarkState.style.left, 247);
    assert(onPositionedSpy.calledTwice);

    document.documentElement.removeChild(container);
  });
});
