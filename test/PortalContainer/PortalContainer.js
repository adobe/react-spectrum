import assert from 'assert';
import PortalContainer from '../../src/PortalContainer';
import React from 'react';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

describe('PortalContainer', () => {
  let renderStub;
  let renderUnstableStub;
  beforeEach(() => {
    renderStub = sinon.stub(ReactDOM, 'render');
    renderUnstableStub = sinon.stub(ReactDOM, 'unstable_renderSubtreeIntoContainer');
  });
  afterEach(() => {
    ReactDOM.render.restore();
    ReactDOM.unstable_renderSubtreeIntoContainer.restore();
  });
  it('should safe render if no context is supplied', () => {
    const child = <div />;
    PortalContainer.add(child);
    assert(renderStub.calledOnce);
    assert(renderUnstableStub.notCalled);
    PortalContainer.remove(child);
  });
  it('should unsafe render if context is supplied', () => {
    const component = {context: 'pretend this is a component'};
    const child = <div />;
    PortalContainer.add(child, component);
    assert(renderUnstableStub.calledOnce);
    assert(renderStub.notCalled);
    PortalContainer.remove(child);
  });
  it('should reuse existing render same key is provided', () => {
    const child = <div key="73" />;
    PortalContainer.add(child);
    PortalContainer.add(child);
    assert(renderStub.calledTwice);
    // args[1] is the node, check that they were the same both times for reuse
    assert(renderStub.firstCall.args[1] === renderStub.lastCall.args[1]);
    PortalContainer.remove(child);
  });
  it('should reuse existing render same key is provided for context as well', () => {
    const child = <div key="73" />;
    const component = {context: 'pretend this is a component'};
    PortalContainer.add(child, component);
    PortalContainer.add(child, component);
    assert(renderUnstableStub.calledTwice);
    // args[1] is the node, check that they were the same both times for reuse
    assert(renderUnstableStub.firstCall.args[1] === renderUnstableStub.lastCall.args[1]);
    PortalContainer.remove(child);
  });
});
