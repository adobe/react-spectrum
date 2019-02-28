import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {Toast} from '../../src/Toast';

describe('Toast', () => {
  it('should render a toast', () => {
    const tree = shallow(<Toast>Test</Toast>);
    assert.equal(tree.prop('className'), 'spectrum-Toast');
    assert.equal(tree.text(), 'Test');
    assert.equal(tree.find('button').length, 0);
  });

  it('should render a close button', () => {
    const tree = shallow(<Toast closable>Test</Toast>);
    assert.equal(tree.find('button').length, 1);
    assert.equal(tree.find('button').prop('className'), 'spectrum-ClearButton spectrum-ClearButton--medium spectrum-ClearButton--overBackground');
  });

  it('should render an action button', () => {
    const tree = shallow(<Toast actionLabel="test">Test</Toast>);
    assert.equal(tree.find('Button').length, 1);
    assert.equal(tree.find('Button').prop('variant'), 'overBackground');
  });

  it('should render a success variant', () => {
    const tree = shallow(<Toast variant="success">Success</Toast>);
    assert.equal(tree.prop('className'), 'spectrum-Toast spectrum-Toast--success');
  });

  it('should render a info variant', () => {
    const tree = shallow(<Toast variant="info">Info</Toast>);
    assert.equal(tree.prop('className'), 'spectrum-Toast spectrum-Toast--info');
  });

  it('should render a help variant', () => {
    const tree = shallow(<Toast variant="help">Info</Toast>);
    assert.equal(tree.prop('className'), 'spectrum-Toast spectrum-Toast--help');
  });

  it('should render a warning variant', () => {
    const tree = shallow(<Toast variant="warning">Info</Toast>);
    assert.equal(tree.prop('className'), 'spectrum-Toast spectrum-Toast--warning');
  });

  it('should render a error variant', () => {
    const tree = shallow(<Toast variant="error">Info</Toast>);
    assert.equal(tree.prop('className'), 'spectrum-Toast spectrum-Toast--error');
  });

  describe('events', () => {
    it('onAction is triggered on clicking upon action', () => {
      const onAction = sinon.spy();
      const tree = shallow(<Toast actionLabel="test" onAction={onAction}>Test</Toast>);
      tree.find('Button').simulate('click');
      assert(onAction.calledOnce);
    });

    it('onClose is triggered on closing toast', () => {
      const onClose = sinon.spy();
      const tree = shallow(<Toast closable onClose={onClose}>Test</Toast>);
      tree.find('button').simulate('click');
      assert(onClose.calledOnce);
    });

    it('onAction and onClose is triggered on action where closeOnAction', () => {
      const onClose = sinon.spy();
      const onAction = sinon.spy();
      const tree = shallow(<Toast closable closeOnAction actionLabel="test" onAction={onAction} onClose={onClose}>Test</Toast>);
      tree.find('Button').simulate('click');
      assert(onClose.calledOnce);
      assert(onAction.calledOnce);
    });

    it('does not blow up if no onAction or onClose is passed for a closeOnAction', () => {
      const tree = shallow(<Toast closable closeOnAction actionLabel="test">Test</Toast>);
      assert.doesNotThrow(() => {
        tree.find('Button').simulate('click');
      });
    });
  });
});
