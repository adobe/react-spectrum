import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
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
    assert.equal(tree.find('button').prop('className'), 'spectrum-Toast-closeButton');
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
});
