import assert from 'assert';
import Button from '../../src/Button';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';
import {Toast} from '../../src/Toast';

describe('Toast', () => {
  it('should render a toast', () => {
    const tree = shallow(<Toast>Test</Toast>);
    assert.equal(tree.prop('className'), 'coral-Toast');
    assert.equal(tree.text(), 'Test');
    assert.equal(tree.find(Icon).length, 0);
    assert.equal(tree.find(Button).length, 0);
  });

  it('should render an icon', () => {
    const tree = shallow(<Toast icon="alert">Test</Toast>);
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'alert');
  });

  it('should render a close button', () => {
    const tree = shallow(<Toast closable>Test</Toast>);
    assert.equal(tree.find(Button).length, 1);
    assert.equal(tree.find(Button).prop('className'), 'coral-Toast-closeButton');
    assert.equal(tree.find(Button).prop('icon'), 'close');
  });

  it('should render a success variant', () => {
    const tree = shallow(<Toast variant="success">Success</Toast>);
    assert.equal(tree.prop('className'), 'coral-Toast coral-Toast--success');
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'checkCircle');
  });

  it('should render a info variant', () => {
    const tree = shallow(<Toast variant="info">Info</Toast>);
    assert.equal(tree.prop('className'), 'coral-Toast coral-Toast--info');
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'infoCircle');
  });

  it('should render a help variant', () => {
    const tree = shallow(<Toast variant="help">Info</Toast>);
    assert.equal(tree.prop('className'), 'coral-Toast coral-Toast--help');
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'helpCircle');
  });

  it('should render a warning variant', () => {
    const tree = shallow(<Toast variant="warning">Info</Toast>);
    assert.equal(tree.prop('className'), 'coral-Toast coral-Toast--warning');
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'alert');
  });

  it('should render a error variant', () => {
    const tree = shallow(<Toast variant="error">Info</Toast>);
    assert.equal(tree.prop('className'), 'coral-Toast coral-Toast--error');
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'alert');
  });
});
