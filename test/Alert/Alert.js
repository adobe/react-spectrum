import Alert from '../../src/Alert';
import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Alert', () => {
  it('default', () => {
    const tree = shallow(<Alert />);
    assert.equal(tree.prop('className'), 'coral3-Alert coral3-Alert--info coral3-Alert--small');
    assert.equal(tree.type(), 'div');
    assertAlertClassAndIcon(tree, 'info', 'infoCircle');
    assert.equal(tree.find('.coral3-Alert-header').length, 1);
    assert.equal(tree.find('.coral3-Alert-content').length, 1);
    assert(!tree.find('.coral3-Alert-closeButton').node);
  });

  it('supports closable and can be closed', () => {
    const spy = sinon.spy();
    const tree = shallow(<Alert closable onClose={spy} />);
    const closeButton = tree.find('.coral3-Alert-closeButton');
    assert(closeButton.node);
    assert.equal(closeButton.prop('className'), 'coral3-Alert-closeButton u-coral-pullRight');
    assert.equal(closeButton.prop('variant'), 'minimal');
    assert.equal(closeButton.prop('square'), true);
    assert.equal(closeButton.prop('size'), 'M');
    assert.equal(closeButton.prop('icon'), 'close');
    assert.equal(closeButton.prop('iconSize'), 'XS');
    closeButton.simulate('click');
    assert(spy.called);
  });

  it('supports large size', () => {
    const tree = shallow(<Alert large />);
    assert.equal(tree.prop('className'), 'coral3-Alert coral3-Alert--info coral3-Alert--large');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Alert className="myClass" />);
    assert.equal(tree.prop('className'), 'coral3-Alert coral3-Alert--info coral3-Alert--small myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Alert foo />);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports multiple variants', () => {
    let tree = shallow(<Alert variant="help" />);
    assertAlertClassAndIcon(tree, 'help', 'helpCircle');

    tree = shallow(<Alert variant="success" />);
    assertAlertClassAndIcon(tree, 'success', 'checkCircle');

    tree = shallow(<Alert variant="error" />);
    assertAlertClassAndIcon(tree, 'error', 'alert');

    tree = shallow(<Alert variant="warning" />);
    assertAlertClassAndIcon(tree, 'warning', 'alert');
  });

  it('supports header', () => {
    const tree = shallow(<Alert header={<div>My Custom Header</div>}/>);
    const child = tree.find('.coral3-Alert-header > div');
    assert.equal(child.length, 1);
    assert.equal(child.children().node, 'My Custom Header');
  });

  it('supports children', () => {
    const tree = shallow(<Alert><div>My Custom Content</div></Alert>);
    const child = tree.find('.coral3-Alert-content > div');
    assert.equal(child.length, 1);
    assert.equal(child.children().node, 'My Custom Content');
  });
});

const findIcon = tree => tree.find('.coral3-Alert-typeIcon');

const assertAlertClassAndIcon = (tree, classPart, icon) => {
  assert.equal(tree.hasClass(`coral3-Alert--${classPart}`), true);
  assert.equal(findIcon(tree).prop('icon'), icon);
};
