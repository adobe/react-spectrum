import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import Slider from '../../src/Slider';

describe('Slider', function () {
  it('should render a basic slider', function () {
    const tree = shallow(<Slider />);
    assert.equal(tree.prop('className'), 'spectrum-Slider');
    assert.equal(findTrack(tree).length, 2);
    assert.equal(findHandles(tree).length, 1);
    assert.equal(findInputs(tree).length, 1);
    assert.equal(tree.state('startValue'), 50);
    assert.equal(findInputs(tree).prop('value'), 50);
    assert.equal(findHandles(tree).prop('style').left, '50%');
  });

  it('should support setting a default value', function () {
    const tree = shallow(<Slider defaultValue={75} />);
    assert.equal(tree.state('startValue'), 75);
    assert.equal(findInputs(tree).prop('value'), 75);
    assert.equal(findHandles(tree).prop('style').left, '75%');
  });

  it('should support setting a min and max value', function () {
    const tree = shallow(<Slider min={10} max={20} />);
    assert.equal(tree.state('startValue'), 15);
    assert.equal(findInputs(tree).prop('value'), 15);
    assert.equal(findHandles(tree).prop('style').left, '50%');

    tree.setProps({
      min: -50,
      max: 50
    });

    tree.update();

    assert.equal(tree.state('startValue'), 0);
    assert.equal(findInputs(tree).prop('value'), 0);
    assert.equal(findHandles(tree).prop('style').left, '50%');
  });

  it('should support vertical orientation', function () {
    const tree = shallow(<Slider min={10} max={20} defaultValue={18} orientation="vertical" />);
    assert.equal(tree.state('startValue'), 18);
    assert.equal(findInputs(tree).prop('value'), 18);
    assert.equal(findHandles(tree).prop('style').bottom, '80%');
  });

  it('should support drag and drop to set the slider value', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Slider onChange={onChange} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseMove({
      preventDefault() {},
      clientX: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 60);
    assert.equal(tree.state('startValue'), 60);

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 60);
  });

  it('should support clicking on the track to set the value', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Slider onChange={onChange} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 60);
    assert.equal(tree.state('draggingHandle'), 'startHandle');

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 60);
  });

  it('should support drag and drop to set the slider value with step', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Slider onChange={onChange} min={10} max={25} step={5} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseMove({
      preventDefault() {},
      persist() {},
      clientX: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 20);

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 20);
  });

  it('should support drag and drop to set the slider value in vertical orientation', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Slider onChange={onChange} orientation="vertical" />);

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
      persist() {},
      clientY: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 40);

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 40);
  });

  it('should not set state if value is controlled', function () {
    const tree = shallow(<Slider value={75} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    assert.equal(tree.state('startValue'), 75);
    assert.equal(findInputs(tree).prop('value'), 75);
  });

  it('should stop dragging on mouse up', function () {
    const tree = shallow(<Slider />);
    const dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    // Initial mouse down
    tree.instance().dom = dom;
    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    assert.equal(tree.state('startValue'), 60);
    assert.equal(tree.state('draggingHandle'), 'startHandle');

    // Mouse move
    tree.instance().dom = dom;
    let event = new window.MouseEvent('mousemove', {
      persist() {},
      clientX: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('startValue'), 70);

    // Mouse up
    event = new window.MouseEvent('mouseup', {
      persist() {}
    });
    window.dispatchEvent(event);
    assert.equal(tree.state('draggingHandle'), null);

    tree.update();

    assert.equal(findInputs(tree).prop('value'), 70);
  });

  it('should support range slider', function () {
    const tree = shallow(<Slider variant="range" />);
    assert.equal(tree.prop('className'), 'spectrum-Slider spectrum-Slider--range');
    assert.equal(findTrack(tree).length, 3);
    assert.equal(findHandles(tree).length, 2);
    assert.equal(findInputs(tree).length, 2);
    assert.equal(tree.state('startValue'), 0);
    assert.equal(tree.state('endValue'), 100);
    assert.equal(findStartHandleInput(tree).prop('value'), 0);
    assert.equal(findEndHandleInput(tree).prop('value'), 100);
    assert.equal(findStartHandleElement(tree).props.style.left, '0%');
    assert.equal(findEndHandleElement(tree).props.style.left, '100%');
  });

  it('should render a range slider with startValue and endValue', function () {
    const tree = shallow(<Slider variant="range" startValue="20" endValue="60" />);
    assert.equal(tree.prop('className'), 'spectrum-Slider spectrum-Slider--range');
    assert.equal(findTrack(tree).length, 3);
    assert.equal(findHandles(tree).length, 2);
    assert.equal(findInputs(tree).length, 2);
    assert.equal(tree.state('startValue'), 20);
    assert.equal(tree.state('endValue'), 60);
    assert.equal(findStartHandleInput(tree).prop('value'), 20);
    assert.equal(findEndHandleInput(tree).prop('value'), 60);
    assert.equal(findStartHandleElement(tree).props.style.left, '20%');
    assert.equal(findEndHandleElement(tree).props.style.left, '60%');
  });

  it('should not allow crossing of sliders for range slider', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Slider variant="range" onChange={onChange} />);
    tree.setState({startValue: 70, endValue: 80, draggingHandle: 'endHandle'});
    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    let innerTree = shallow(findEndHandleElement(tree));
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    // endHandle crossed startHandle each other 60<70
    assert.equal(tree.state('draggingHandle'), 'endHandle');
    assert(onChange.notCalled);

    // The value does not get updated
    assert.equal(tree.state('startValue'), 70);
    assert.equal(tree.state('endValue'), 80);
    assert.equal(findStartHandleInput(tree).prop('value'), 70);
    assert.equal(findEndHandleInput(tree).prop('value'), 80);
  });

  it('should not set state if values are controlled in range slider', function () {
    const tree = shallow(<Slider variant="range" startValue="10" endValue="60" />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    let innerTree = shallow(findStartHandleElement(tree));
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    innerTree = shallow(findEndHandleElement(tree));
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 90
    });


    assert.equal(tree.state('startValue'), 10);
    assert.equal(tree.state('endValue'), 60);

    tree.update();

    assert.equal(findStartHandleInput(tree).prop('value'), 10);
    assert.equal(findEndHandleInput(tree).prop('value'), 60);
  });

  it('should set state if values are uncontrolled in range slider', function () {
    const tree = shallow(<Slider variant="range" defaultStartValue="10" defaultEndValue="60" />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    let innerTree = shallow(findStartHandleElement(tree));
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 60
    });

    assert.equal(tree.state('startValue'), 40);

    innerTree = shallow(findEndHandleElement(tree));
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 90
    });
    assert.equal(tree.state('endValue'), 70);

    tree.update();

    assert.equal(findStartHandleInput(tree).prop('value'), 40);
    assert.equal(findEndHandleInput(tree).prop('value'), 70);

  });

  it('should support disabled', function () {
    const tree = shallow(<Slider disabled />);
    assert(tree.hasClass('is-disabled'));
    assert.equal(findControls(tree).prop('onMouseDown'), null);
    assert.equal(findInputs(tree).prop('disabled'), true);
  });

  it('should support focus/blur states', function () {
    const tree = shallow(<Slider />);
    findInputs(tree).simulate('focus');
    assert.equal(tree.state('focusedHandle'), 'startHandle');
    assert(findHandles(tree).hasClass('is-focused'));

    findInputs(tree).simulate('blur');
    assert(!tree.state('focusedHandle'));
    assert(!findHandles(tree).hasClass('is-focused'));
  });

  it('should support changing value via input element using keyboard or assitive technology', function () {
    const tree = mount(<Slider />);
    tree.instance().dom.querySelector('input').value = 100;
    findStartHandleInput(tree).simulate('change');
    assert.equal(tree.state('startValue'), findStartHandleInput(tree).prop('value'));
    assert.equal(tree.state('startValue'), 100);

    tree.unmount();
  });

  it('should support filled variant', function () {
    const tree = shallow(<Slider defaultValue={75} filled />);
    assert.equal(tree.find('.spectrum-Slider-track').first().prop('style').width, '75%');
  });

  it('should support ramp variant', function () {
    const tree = shallow(<Slider variant="ramp" />);
    assert(tree.hasClass('spectrum-Slider--ramp'));
    assert.equal(tree.find('.spectrum-Slider-ramp').length, 1);
  });

  it('should support adding label, hidden by default, but still accessible', function () {
    const labelString = 'Foo';
    const tree = shallow(<Slider label={labelString} />);
    const id = tree.instance().sliderId;

    assert.equal(findLabel(tree).length, 1);

    assert.equal(findValue(tree).length, 0);

    assert.equal(findInputs(tree).prop('id'), id);
    assert.equal(findInputs(tree).prop('aria-labelledby'), findLabel(tree).prop('id'));
  });

  it('should support adding label and aria-labelledby, hidden by default, but still accessible', function () {
    const labelString = 'Foo';
    const ariaLabelledbyString = 'barId';
    const tree = shallow(<Slider label={labelString} aria-labelledby={ariaLabelledbyString} />);
    const id = tree.instance().sliderId;
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
    const tree = shallow(<Slider renderLabel label={labelString} aria-labelledby={ariaLabelledbyString} />);
    const id = tree.instance().sliderId;
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
    let tree = shallow(<Slider variant="range" onChangeEnd={onChangeEnd} />);
    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    let innerTree = shallow(tree.find('.spectrum-Slider-handle').getElements()[0]);
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    assert.equal(tree.state('startValue'), 60);
    assert.equal(tree.state('draggingHandle'), 'startHandle');

    // Dragging the mouse
    let event = new window.MouseEvent('mousemove', {
      persist() {},
      clientX: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('startValue'), 70);

    // Mouse up
    event = new window.MouseEvent('mouseup', {
      persist() {}
    });
    window.dispatchEvent(event);
    assert.equal(tree.state('draggingHandle'), null);
    assert(onChangeEnd.called);

    onChangeEnd = sinon.spy();
    tree = shallow(<Slider onChangeEnd={onChangeEnd} />);
    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    }, 'startHandle');

    assert.equal(tree.state('startValue'), 60);
    assert.equal(tree.state('draggingHandle'), 'startHandle');

    // Dragging the mouse
    event = new window.MouseEvent('mousemove', {
      persist() {},
      clientX: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('startValue'), 70);

    // Mouse up
    event = new window.MouseEvent('mouseup', {
      persist() {}
    });
    window.dispatchEvent(event);
    assert.equal(tree.state('draggingHandle'), null);
    assert(onChangeEnd.called);
  });

  it('should set focus to input on mousedown', function () {
    const tree = mount(<Slider />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    assert.equal(tree.instance().startHandleInput, document.activeElement);

    tree.unmount();
  });

  it('should set focus to input on mouseup', function () {
    const tree = mount(<Slider />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.instance().onMouseDown({
      preventDefault() {},
      stopPropagation() {},
      persist() {},
      clientX: 80
    });

    tree.instance().onMouseUp({
      preventDefault() {},
      persist() {},
      clientX: 80
    });

    assert.equal(tree.instance().startHandleInput, document.activeElement);

    tree.unmount();
  });

  describe('Range slider', () => {
    it('should support clicking on the track to set the value of closest handle', () => {
      const tree = mount(<Slider variant="range" defaultStartValue="20" defaultEndValue="60" />);
      sinon.stub(tree.instance().dom, 'getBoundingClientRect').callsFake(() => ({
        top: 0,
        left: 20,
        width: 100,
        height: 32
      }));

      sinon.stub(tree.instance().startHandleInput, 'getBoundingClientRect').callsFake(() => ({
        top: 10,
        left: 34,
        width: 12,
        height: 12
      }));

      sinon.stub(tree.instance().endHandleInput, 'getBoundingClientRect').callsFake(() => ({
        top: 10,
        left: 74,
        width: 12,
        height: 12
      }));

      findControls(tree).simulate('mouseDown', {
        preventDefault() {},
        clientX: 70,
        clientY: 16,
        pageX: 70,
        pageY: 16
      });

      tree.update();

      assert.equal(tree.state('endValue'), 50);
      assert.equal(findEndHandleInput(tree).prop('value'), 50);
      assert.equal(tree.instance().endHandleInput, document.activeElement);

      tree.unmount();
    });

    it('should support changing value via input element using keyboard or assitive technology', function () {
      const tree = mount(<Slider variant="range" defaultStartValue="20" defaultEndValue="60" />);
      findEndHandleInput(tree).getDOMNode().value = 80;
      findEndHandleInput(tree).simulate('change');
      assert.equal(tree.state('endValue'), findEndHandleInput(tree).prop('value'));
      assert.equal(tree.state('endValue'), 80);

      tree.unmount();
    });

    it('should support setting a min and max value', function () {
      const tree = shallow(<Slider variant="range" min={10} max={20} />);
      assert.equal(tree.state('startValue'), 10);
      assert.equal(findStartHandle(tree).prop('style').left, '0%');
      assert.equal(findStartHandleInput(tree).prop('value'), 10);
      assert.equal(tree.state('endValue'), 20);
      assert.equal(findEndHandle(tree).prop('style').left, '100%');
      assert.equal(findEndHandleInput(tree).prop('value'), 20);

      tree.setProps({
        min: -50,
        max: 50
      });

      tree.update();

      assert.equal(tree.state('startValue'), -50);
      assert.equal(findStartHandle(tree).prop('style').left, '0%');
      assert.equal(findStartHandleInput(tree).prop('value'), -50);
      assert.equal(tree.state('endValue'), 50);
      assert.equal(findEndHandle(tree).prop('style').left, '100%');
      assert.equal(findEndHandleInput(tree).prop('value'), 50);
    });

    it('should support clicking on value label to focus appropriate slider input', () => {
      const tree = mount(<Slider variant="range" label="Range" renderLabel min={0} max={100} defaultStartValue={20} defaultEndValue={80} />);

      // fake window.getSelection
      let focusOffset = 4;
      window.getSelection = () => ({focusOffset});

      // Test clicking on startValue
      focusOffset = 2;
      findValue(tree).simulate('click');
      assert.equal(tree.instance().startHandleInput, document.activeElement);

      // Test clicking on endValue
      focusOffset = 4;
      findValue(tree).simulate('click');
      assert.equal(tree.instance().endHandleInput, document.activeElement);

      document.activeElement.blur();

      // Clicking value label should do nothing if control is disabled
      tree.setProps({disabled: true});

      findValue(tree).simulate('click');
      assert.notEqual(tree.instance().endHandleInput, document.activeElement);

      tree.unmount();
    });

    it('should support aria-label on min and max inputs', () => {
      const tree = shallow(<Slider variant="range" aria-label="Range" min={0} max={100} defaultStartValue={20} defaultEndValue={80} />);

      assert.equal(findLabel(tree).prop('aria-label'), 'Range');
      assert.equal(findStartHandleInput(tree).prop('aria-label'), 'Minimum');
      assert.equal(findEndHandleInput(tree).prop('aria-label'), 'Maximum');
      assert.equal(tree.prop('aria-labelledby'), findLabel(tree).prop('id'));
      assert.equal(findStartHandleInput(tree).prop('aria-labelledby'),
                   [findLabel(tree).prop('id'), findStartHandleInput(tree).prop('id')].join(' '));
      assert.equal(findEndHandleInput(tree).prop('aria-labelledby'),
                   [findLabel(tree).prop('id'), findEndHandleInput(tree).prop('id')].join(' '));
    });
  });
});

const findLabel = tree => tree.find('.spectrum-Slider-label');
const findValue = tree => tree.find('.spectrum-Slider-value');
const findControls = tree => tree.find('.spectrum-Slider-controls');
const findTrack = tree => tree.find('.spectrum-Slider-track');
const findHandles = tree => tree.find('.spectrum-Slider-handle');
const findStartHandle = tree => findHandles(tree).first();
const findEndHandle = tree => findHandles(tree).last();
const findStartHandleElement = tree => findStartHandle(tree).getElements()[0];
const findEndHandleElement = tree => findEndHandle(tree).getElements()[0];
const findInputs = tree => tree.find('.spectrum-Slider-input');
const findStartHandleInput = tree => findInputs(tree).first();
const findEndHandleInput = tree => findInputs(tree).last();
