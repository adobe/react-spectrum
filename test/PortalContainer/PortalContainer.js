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
});
