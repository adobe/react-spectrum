import Alert from '../../src/Alert';
import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';

describe('Alert', () => {
  it('default', () => {
    const tree = shallow(<Alert />);
    assert.equal(tree.prop('className'), 'spectrum-Alert spectrum-Alert--info');
    assert.equal(tree.type(), 'div');
    assertAlertClassAndIcon(tree, 'info');
    assert.equal(tree.find('.spectrum-Alert-header').length, 1);
    assert.equal(tree.find('.spectrum-Alert-content').length, 1);
    assert.equal(tree.find('.spectrum-Alert-closeButton').length, 0);
  });

  it('supports large size', () => {
    const tree = shallow(<Alert large />);
    assert.equal(tree.prop('className'), 'spectrum-Alert spectrum-Alert--info');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Alert className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Alert spectrum-Alert--info myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Alert foo />);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports multiple variants', () => {
    let tree = shallow(<Alert variant="help" />);
    assertAlertClassAndIcon(tree, 'help');

    tree = shallow(<Alert variant="success" />);
    assertAlertClassAndIcon(tree, 'success');

    tree = shallow(<Alert variant="error" />);
    assertAlertClassAndIcon(tree, 'error');

    tree = shallow(<Alert variant="warning" />);
    assertAlertClassAndIcon(tree, 'warning');
  });

  it('supports header', () => {
    const tree = shallow(<Alert header={<div>My Custom Header</div>} />);
    const child = tree.find('.spectrum-Alert-header > div');
    assert.equal(child.length, 1);
    assert.equal(child.children().text(), 'My Custom Header');
  });

  it('supports children', () => {
    const tree = shallow(<Alert><div>My Custom Content</div></Alert>);
    const child = tree.find('.spectrum-Alert-content > div');
    assert.equal(child.length, 1);
    assert.equal(child.children().text(), 'My Custom Content');
  });
});

const assertAlertClassAndIcon = (tree, variant) => {
  assert.equal(tree.hasClass(`spectrum-Alert--${variant}`), true);
  assert.equal(tree.find('.spectrum-Alert-icon').prop('aria-label'), variant);
};
