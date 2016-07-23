import React from 'react';
import expect from 'expect';
import Dialog from '../src/Dialog';
import TetherComponent from 'react-tether';
import { shallow, mount } from 'enzyme';

describe('Dialog', () => {
  it('default', () => {
    const tree = shallow(<Dialog />);
    const backdrop = findDialogBackdrop(tree, 'modal');
    const dialog = findDialogComponent(tree);

    expect(tree.type()).toBe(TetherComponent);
    expect(tree.prop('attachment')).toBe('middle center');
    expect(tree.prop('targetAttachment')).toBe('middle center');
    expect(tree.prop('target')).toBe(document.body);
    expect(tree.prop('targetModifier')).toBe('visible');
    expect(tree.prop('style')).toEqual({ zIndex: 10010, display: 'none' });

    expect(backdrop.isEmpty()).toBe(false);
    expect(backdrop.prop('open')).toBe(false);

    expect(dialog.hasClass('coral-Dialog')).toBe(true);
    expect(dialog.hasClass('is-open')).toBe(false);
    expect(dialog.hasClass('coral-Dialog--default')).toBe(true);
    expect(dialog.prop('style')).toEqual({ display: 'none', zIndex: 10010, position: 'static' });
  });

  it('supports variant', () => {
    const tree = shallow(<Dialog variant="warning"><div className="foo" /></Dialog>);
    const dialog = findDialogComponent(tree);
    const child = tree.find('.foo');

    expect(dialog.hasClass('coral-Dialog--warning')).toBe(true);

    expect(child.prop('variant')).toBe('warning');
  });

  it('supports open', () => {
    const tree = shallow(<Dialog open />);
    const backdrop = findDialogBackdrop(tree, 'modal');
    const dialog = findDialogComponent(tree);

    expect(tree.prop('style')).toEqual({ zIndex: 10020, display: 'block' });

    expect(backdrop.prop('open')).toBe(true);

    expect(dialog.hasClass('is-open')).toBe(true);
    expect(dialog.prop('style')).toEqual({ display: 'block', zIndex: 10020, position: 'static' });
  });

  it('supports fullscreen', () => {
    const tree = shallow(<Dialog fullscreen />);
    const dialog = findDialogComponent(tree);
    expect(tree.type()).toBe('div');
    expect(tree.find({ backdrop: 'modal' }).isEmpty()).toBe(true);
    expect(dialog.hasClass('coral-Dialog--fullscreen')).toBe(true);
    expect(dialog.prop('style').position).toBe(null);
  });

  it('supports backdrop', () => {
    const tree = shallow(<Dialog backdrop="static" />);
    const backdrop = findDialogBackdrop(tree, 'static');
    expect(backdrop.prop('backdrop')).toBe('static');
  });

  it('supports closable', () => {
    const tree = shallow(<Dialog closable><div className="foo" /></Dialog>);
    const dialog = findDialogComponent(tree);
    const child = tree.find('.foo');

    expect(dialog.hasClass('coral-Dialog--closable')).toBe(true);
    expect(child.prop('closable')).toBe(true);
  });

  describe('children', () => {
    it('populates variant, closable, and onClose on children', () => {
      const spy = expect.createSpy();
      const assertPropsExist = (child, className) => {
        expect(child.props()).toEqual({ variant: 'foo', onClose: spy, closable: true, className });
      };

      const tree = shallow(
        <Dialog variant="foo" onClose={ spy } closable>
          <div className="foo" />
          <div className="bar" />
        </Dialog>
      );
      assertPropsExist(tree.find('.foo'), 'foo');
      assertPropsExist(tree.find('.bar'), 'bar');
    });
  });

  describe('closes when escape key is pressed', () => {
    it('and open=true', () => {
      const spy = expect.createSpy();
      mount(<Dialog open onClose={ spy } />);
      expect(dispatchKeyDownEvent(window, 27)).toBe(true);
      expect(spy).toHaveBeenCalled();
    });

    it('unless open=false', () => {
      const spy = expect.createSpy();
      mount(<Dialog onClose={ spy } />);
      expect(dispatchKeyDownEvent(window, 27)).toBe(true);
      expect(spy).toNotHaveBeenCalled();
    });
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Dialog className="myClass" />);
    expect(findDialogComponent(tree).hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Dialog foo />);
    expect(findDialogComponent(tree).prop('foo')).toBe(true);
  });
});

const findDialogComponent = tree => tree.find('.coral-Dialog');

const findDialogBackdrop = (tree, backdropValue) => tree.find({ backdrop: backdropValue });

const dispatchKeyDownEvent = (target, keyCode) => {
  const Event = window.Event;
  let event;

  try {
    event = new Event('keydown');
  } catch (e) {
    event = document.createEvent('KeyEvents');
  }
  event.initEvent('keydown', true, true);
  event.keyCode = event.which = keyCode;
  event.charCode = 0;
  return target.dispatchEvent(event);
};
