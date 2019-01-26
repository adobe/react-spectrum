import assert from 'assert';
import CoachMarkIndicator from '../../src/CoachMark/js/CoachMarkIndicator';
import {mount} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('CoachMarkIndicator', () => {
  let clock;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });
  it('default', () => {
    const tree = mount(<div>
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

    tree.unmount();
  });

  it('quiet', () => {
    const tree = mount(<div>
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

    tree.unmount();
  });

  it('Should attach to a dom element', async () => {
    const container = document.createElement('div');
    const someElement = document.createElement('div');
    someElement.setAttribute('id', 'something');
    someElement.getBoundingClientRect = () => ({
      x: 50,
      y: 75,
      width: 250,
      height: 150
    });
    container.appendChild(someElement);

    const someOtherElement = document.createElement('div');
    someOtherElement.setAttribute('id', 'somethingElse');
    someOtherElement.getBoundingClientRect = () => ({
      x: 200,
      y: 250,
      width: 100,
      height: 100
    });
    container.appendChild(someOtherElement);

    document.documentElement.appendChild(container);

    const tree = mount(<CoachMarkIndicator selector="#something" />);

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
    tree.unmount();
  });

  it('Should not render if it can not find the selector', async () => {
    const tree = mount(<CoachMarkIndicator selector="#something" />);
    let updateTargetNodeSpy = sinon.stub(tree.instance(), 'updateTargetNode').callThrough();

    let coachMarkState = tree.state();
    assert(!('top' in coachMarkState.style));
    assert(!('left' in coachMarkState.style));
    clock.tick(2000);

    assert.equal(updateTargetNodeSpy.getCalls().length, 12);
    assert(!('top' in coachMarkState.style));
    assert(!('left' in coachMarkState.style));
    tree.unmount();
  });

  it('Should move if its target moved because of a resize', async () => {
    const container = document.createElement('div');
    const someElement = document.createElement('div');
    someElement.setAttribute('id', 'something');
    someElement.getBoundingClientRect = () => ({
      x: 50,
      y: 75,
      width: 250,
      height: 150
    });
    container.appendChild(someElement);

    document.documentElement.appendChild(container);

    let onPositionedSpy = sinon.spy();
    const tree = mount(<CoachMarkIndicator onPositioned={onPositionedSpy} selector="#something" />);

    let coachMarkState = tree.state();
    assert.equal(coachMarkState.style.top, 147);
    assert.equal(coachMarkState.style.left, 172);
    assert(onPositionedSpy.calledOnce);

    someElement.getBoundingClientRect = () => ({
      x: 200,
      y: 250,
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
    tree.unmount();
  });
});
