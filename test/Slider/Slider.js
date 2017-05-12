import React from 'react';
import {createSpy} from 'expect';
import assert from 'assert';
import {shallow} from 'enzyme';
import Slider from '../../src/Slider';

describe('Slider', function () {
  it('should render a basic slider', function () {
    const tree = shallow(<Slider />);
    assert.equal(tree.prop('className'), 'coral3-Slider');
    assert.equal(tree.find('.coral3-Slider-bar').length, 1);
    assert.equal(tree.find('.coral3-Slider-handle').length, 1);
    assert.equal(tree.find('.coral3-Slider-input').length, 1);

    assert.equal(tree.state('value'), 0.5);
    assert.equal(tree.find('.coral3-Slider-handle').prop('style').left, '50%');
  });

  it('should support setting a default value', function () {
    const tree = shallow(<Slider defaultValue={0.75} />);
    assert.equal(tree.state('value'), 0.75);
    assert.equal(tree.find('.coral3-Slider-handle').prop('style').left, '75%');
  });

  it('should support setting a min and max value', function () {
    const tree = shallow(<Slider min={10} max={20} />);
    assert.equal(tree.state('value'), 15);
    assert.equal(tree.find('.coral3-Slider-handle').prop('style').left, '50%');
  });

  it('should support vertical orientation', function () {
    const tree = shallow(<Slider min={10} max={20} defaultValue={18} orientation="vertical" />);
    assert.equal(tree.state('value'), 18);
    assert.equal(tree.find('.coral3-Slider-handle').prop('style').bottom, '80%');
  });

  it('should support drag and drop to set the slider value', function () {
    const onChange = createSpy();
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

    assert.deepEqual(onChange.calls[0].arguments[0], 0.6);
    assert.equal(tree.state('value'), 0.6);
  });

  it('should support clicking on the track to set the value', function () {
    const onChange = createSpy();
    const tree = shallow(<Slider onChange={onChange} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 80
    });

    assert.deepEqual(onChange.calls[0].arguments[0], 0.6);
  });

  it('should support drag and drop to set the slider value with step', function () {
    const onChange = createSpy();
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
      clientX: 80
    });

    assert.deepEqual(onChange.calls[0].arguments[0], 20);
  });

  it('should support drag and drop to set the slider value in vertical orientation', function () {
    const onChange = createSpy();
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
      clientY: 80
    });

    assert.deepEqual(onChange.calls[0].arguments[0], 0.4);
  });

  it('should not set state if value is controlled', function () {
    const tree = shallow(<Slider value={0.75} />);

    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    tree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 80
    });

    assert.equal(tree.state('value'), 0.75);
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
    tree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 80
    });

    assert.equal(tree.state('value'), 0.6);
    assert.equal(tree.state('isDragging'), true);

    // Mouse move
    tree.instance().dom = dom;
    let event = new window.MouseEvent('mousemove', {
      clientX: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('value'), 0.7);

    // Mouse up
    event = new window.MouseEvent('mouseup');
    window.dispatchEvent(event);
    assert.equal(tree.state('isDragging'), false);
  });
});
