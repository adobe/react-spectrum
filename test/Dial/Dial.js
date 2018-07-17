import assert from 'assert';
import Dial from '../../src/Dial';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Dial', function () {
  it('should render a dial', function () {
    const tree = shallow(<Dial />);
    assert(tree.hasClass('spectrum-Dial'));
    assert.equal(findHandles(tree).length, 1);
    assert.equal(findInputs(tree).length, 1);
    assert.equal(tree.state('startValue'), 50);
    assert.equal(findInputs(tree).prop('value'), 50);
    assert.equal(findHandles(tree).prop('style').transform, 'rotate(90deg)');
  });

  it('should support setting a default value', function () {
    const tree = shallow(<Dial defaultValue={75} />);
    assert.equal(tree.state('startValue'), 75);
    assert.equal(findInputs(tree).prop('value'), 75);
    assert.equal(findHandles(tree).prop('style').transform, 'rotate(157.5deg)');
  });

  it('should support setting a min and max value', function () {
    const tree = shallow(<Dial min={10} max={20} />);
    assert.equal(tree.state('startValue'), 15);
    assert.equal(findInputs(tree).prop('value'), 15);
    assert.equal(findHandles(tree).prop('style').transform, 'rotate(90deg)');

    tree.setProps({
      min: -50,
      max: 50
    });

    tree.update();

    assert.equal(tree.state('startValue'), 0);
    assert.equal(findInputs(tree).prop('value'), 0);
    assert.equal(findHandles(tree).prop('style').transform, 'rotate(90deg)');
  });

  it('should support drag and drop to set the dial value', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Dial onChange={onChange} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    tree.instance().onMouseMove({
      preventDefault() {},
      clientY: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 40);

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 40);
  });

  it('should support drag and drop to set the dial value, snapping to step', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Dial onChange={onChange} step={5} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    tree.instance().onMouseMove({
      preventDefault() {},
      clientY: 82
    });

    assert.deepEqual(onChange.getCall(0).args[0], 40);

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 40);
  });


  it('should not set state if value is controlled', function () {
    const tree = shallow(<Dial value={75} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      clientY: 80
    });

    assert.equal(tree.state('startValue'), 75);
    assert.equal(findInputs(tree).prop('value'), 75);
  });

  it('should stop dragging on mouse up', function () {
    const tree = shallow(<Dial />);
    const dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    // Initial mouse down
    tree.instance().dom = dom;
    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      clientY: 80
    });

    assert.equal(tree.state('startValue'), 50);
    assert(tree.state('isDragging'));

    // Mouse move
    tree.instance().dom = dom;
    let event = new window.MouseEvent('mousemove', {
      clientY: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('startValue'), 30);

    // Mouse up
    event = new window.MouseEvent('mouseup');
    window.dispatchEvent(event);
    assert(!tree.state('isDragging'));

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 30);
  });

  it('should support disabled', function () {
    const tree = shallow(<Dial disabled />);
    assert(tree.hasClass('is-disabled'));
    assert.equal(findControls(tree).prop('onMouseDown'), null);
    assert.equal(findInputs(tree).prop('disabled'), true);
  });

  it('should support focus/blur states', function () {
    const tree = shallow(<Dial />);
    findInputs(tree).simulate('focus');
    assert(tree.state('isFocused'));
    assert(findHandles(tree).hasClass('is-focused'));

    findInputs(tree).simulate('blur');
    assert(!tree.state('isFocused'));
    assert(!findHandles(tree).hasClass('is-focused'));
  });

  it('should support changing value via input element using keyboard or assitive technology', function () {
    const tree = mount(<Dial />);
    tree.instance().dom.querySelector('input').value = 100;
    findInput(tree).simulate('change');
    assert.equal(tree.state('startValue'), findInput(tree).prop('value'));
    assert.equal(tree.state('startValue'), 100);
    tree.unmount();
  });

  it('should support small size', function () {
    const tree = shallow(<Dial size="S" />);
    assert(tree.hasClass('spectrum-Dial'));
    assert(tree.hasClass('spectrum-Dial--small'));
    assert.equal(findHandles(tree).prop('style').transform, 'rotate(90deg)');
  });

  it('should support adding label, hidden by default, but still accessible', function () {
    const labelString = 'Foo';
    const tree = shallow(<Dial label={labelString} />);
    const id = tree.instance().dialId;

    assert.equal(findLabel(tree).length, 1);

    assert.equal(findValue(tree).length, 0);

    assert.equal(findInputs(tree).prop('id'), id);
    assert.equal(findInputs(tree).prop('aria-labelledby'), findLabel(tree).prop('id'));
  });

  it('should support adding label and aria-labelledby, hidden by default, but still accessible', function () {
    const labelString = 'Foo';
    const ariaLabelledbyString = 'barId';
    const tree = shallow(<Dial label={labelString} aria-labelledby={ariaLabelledbyString} />);
    const id = tree.instance().dialId;
    const labelId = tree.instance().getLabelId();

    assert.equal(findLabel(tree).prop('htmlFor'), id);
    assert.equal(findLabel(tree).prop('id'), labelId);
    assert.equal(findLabel(tree).text(), labelString);
    assert.equal(findLabel(tree).prop('hidden'), true);

    assert.equal(findValue(tree).length, 0);

    assert.equal(findInputs(tree).prop('id'), id);
    assert.equal(findInputs(tree).prop('aria-label'), null);
    assert.equal(findInputs(tree).prop('aria-labelledby'), [ariaLabelledbyString, labelId].join(' '));
  });

  it('should support adding label and aria-labelledby with renderLabel', function () {
    const labelString = 'Foo';
    const ariaLabelledbyString = 'barId';
    const tree = shallow(<Dial renderLabel label={labelString} aria-labelledby={ariaLabelledbyString} />);
    const id = tree.instance().dialId;
    const labelId = tree.instance().getLabelId();

    assert.equal(findLabel(tree).prop('htmlFor'), id);
    assert.equal(findLabel(tree).prop('id'), labelId);
    assert.equal(findLabel(tree).text(), labelString);
    assert.equal(findLabel(tree).prop('hidden'), null);

    assert.equal(findValue(tree).prop('aria-labelledby'), [ariaLabelledbyString, labelId].join(' '));
    assert.equal(findValue(tree).prop('role'), 'textbox');
    assert.equal(findValue(tree).prop('aria-readonly'), 'true');
    assert.equal(findValue(tree).text(), 50);

    assert.equal(findInputs(tree).prop('id'), id);
    assert.equal(findInputs(tree).prop('aria-label'), null);
    assert.equal(findInputs(tree).prop('aria-labelledby'), [ariaLabelledbyString, labelId].join(' '));
  });

  it('should submit values when stopped dragging', function () {
    let onChangeEnd = sinon.spy();
    let tree = shallow(<Dial onChangeEnd={onChangeEnd} />);
    const dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    // Initial mouse down
    tree.instance().dom = dom;
    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      clientY: 80
    });

    assert.equal(tree.state('startValue'), 50);
    assert(tree.state('isDragging'));

    // Mouse move
    tree.instance().dom = dom;
    let event = new window.MouseEvent('mousemove', {
      clientY: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('startValue'), 30);

    // Mouse up
    event = new window.MouseEvent('mouseup');
    window.dispatchEvent(event);
    assert(!tree.state('isDragging'));

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 30);

    assert(onChangeEnd.called);
  });

  it('should set focus to input on mousedown', function () {
    const tree = mount(<Dial />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      clientY: 80
    });

    assert.equal(tree.instance().input, document.activeElement);
    tree.unmount();
  });

  it('should set focus to input on mouseup', function () {
    const tree = mount(<Dial />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          top: 20,
          height: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      clientY: 80
    });

    tree.instance().onMouseUp({
      preventDefault() {},
      clientY: 80
    });

    assert.equal(tree.instance().input, document.activeElement);
    tree.unmount();
  });

  it('should set focus to input on value click', function () {
    const tree = mount(<Dial renderLabel label="Foo" />);
    findValue(tree).simulate('click');
    assert.equal(tree.instance().input, document.activeElement);
    tree.unmount();
  });
});

const findLabel = tree => tree.find('.spectrum-Dial-label');
const findValue = tree => tree.find('.spectrum-Dial-value');
const findControls = tree => tree.find('.spectrum-Dial-controls');
const findHandles = tree => tree.find('.spectrum-Dial-handle');
const findInputs = tree => tree.find('.spectrum-Dial-input');
const findInput = tree => findInputs(tree).first();
