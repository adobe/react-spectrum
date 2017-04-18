import React from 'react';
import expect from 'expect';
import {shallow} from 'enzyme';
import Alert from '../../src/Alert';

describe('Alert', () => {
  it('default', () => {
    const tree = shallow(<Alert />);
    expect(tree.prop('className')).toBe('coral3-Alert coral3-Alert--info coral3-Alert--small');
    expect(tree.type()).toBe('div');
    assertAlertClassAndIcon(tree, 'info', 'infoCircle');
    expect(tree.find('.coral3-Alert-header').length).toBe(1);
    expect(tree.find('.coral3-Alert-content').length).toBe(1);
    expect(tree.find('.coral3-Alert-closeButton').node).toNotExist();
  });

  it('supports closable and can be closed', () => {
    const spy = expect.createSpy();
    const tree = shallow(<Alert closable onClose={ spy } />);
    const closeButton = tree.find('.coral3-Alert-closeButton');
    expect(closeButton.node).toExist();
    expect(closeButton.prop('className')).toBe('coral3-Alert-closeButton u-coral-pullRight');
    expect(closeButton.prop('variant')).toBe('minimal');
    expect(closeButton.prop('square')).toBe(true);
    expect(closeButton.prop('size')).toBe('M');
    expect(closeButton.prop('icon')).toBe('close');
    expect(closeButton.prop('iconSize')).toBe('XS');
    closeButton.simulate('click');
    expect(spy).toHaveBeenCalled();
  });

  it('supports large size', () => {
    const tree = shallow(<Alert large />);
    expect(tree.prop('className')).toBe('coral3-Alert coral3-Alert--info coral3-Alert--large');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Alert className="myClass" />);
    expect(tree.prop('className'))
      .toBe('coral3-Alert coral3-Alert--info coral3-Alert--small myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Alert foo />);
    expect(tree.prop('foo')).toBe(true);
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
    const tree = shallow(<Alert header={ <div>My Custom Header</div> } />);
    const child = tree.find('.coral3-Alert-header > div');
    expect(child.length).toBe(1);
    expect(child.children().node).toBe('My Custom Header');
  });

  it('supports children', () => {
    const tree = shallow(<Alert><div>My Custom Content</div></Alert>);
    const child = tree.find('.coral3-Alert-content > div');
    expect(child.length).toBe(1);
    expect(child.children().node).toBe('My Custom Content');
  });
});

const findIcon = tree => tree.find('.coral3-Alert-typeIcon');

const assertAlertClassAndIcon = (tree, classPart, icon) => {
  expect(tree.hasClass(`coral3-Alert--${ classPart }`)).toBe(true);
  expect(findIcon(tree).prop('icon')).toBe(icon);
};
