import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Slider from '../../src/Slider';

describe('Slider', function () {
  it('should render a basic slider', function () {
    const tree = shallow(<Slider />);
    assert.equal(tree.prop('className'), 'spectrum-Slider');
    assert.equal(tree.find('.spectrum-Slider-track').length, 1);
    assert.equal(tree.find('.spectrum-Slider-handle').length, 1);
    assert.equal(tree.find('.spectrum-Slider-input').length, 1);
    assert.equal(tree.state('startValue'), 0.5);
    assert.equal(tree.find('.spectrum-Slider-handle').prop('style').left, '50%');
  });

  it('should support setting a default value', function () {
    const tree = shallow(<Slider defaultValue={0.75} />);
    assert.equal(tree.state('startValue'), 0.75);
    assert.equal(tree.find('.spectrum-Slider-handle').prop('style').left, '75%');
  });

  it('should support setting a min and max value', function () {
    const tree = shallow(<Slider min={10} max={20} />);
    assert.equal(tree.state('startValue'), 15);
    assert.equal(tree.find('.spectrum-Slider-handle').prop('style').left, '50%');
  });

  it('should support vertical orientation', function () {
    const tree = shallow(<Slider min={10} max={20} defaultValue={18} orientation="vertical" />);
    assert.equal(tree.state('startValue'), 18);
    assert.equal(tree.find('.spectrum-Slider-handle').prop('style').bottom, '80%');
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

    assert.deepEqual(onChange.getCall(0).args[0], 0.6);
    assert.equal(tree.state('startValue'), 0.6);
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

    tree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 0.6);
    assert.equal(tree.state('draggingHandle'), 'startHandle');
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
      clientX: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 20);
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
      clientY: 80
    });

    assert.deepEqual(onChange.getCall(0).args[0], 0.4);
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

    assert.equal(tree.state('startValue'), 0.75);
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

    assert.equal(tree.state('startValue'), 0.6);
    assert.equal(tree.state('draggingHandle'), 'startHandle');

    // Mouse move
    tree.instance().dom = dom;
    let event = new window.MouseEvent('mousemove', {
      clientX: 90
    });

    window.dispatchEvent(event);
    assert.equal(tree.state('startValue'), 0.7);

    // Mouse up
    event = new window.MouseEvent('mouseup');
    window.dispatchEvent(event);
    assert.equal(tree.state('draggingHandle'), null);
  });

  it('should support range slider', function () {
    const tree = shallow(<Slider variant="range" />);
    assert.equal(tree.prop('className'), 'spectrum-Slider');
    assert.equal(tree.find('.spectrum-Slider-track').length, 1);
    assert.equal(tree.find('.spectrum-Slider-handle').length, 2);
    assert.equal(tree.find('.spectrum-Slider-input').length, 2);
    assert.equal(tree.state('startValue'), 0);
    assert.equal(tree.state('endValue'), 1);
    assert.equal(tree.find('.spectrum-Slider-handle').getElements()[0].props.style.left, '0%');
    assert.equal(tree.find('.spectrum-Slider-handle').getElements()[1].props.style.left, '100%');
  });

  it('should render a range slider with startValue and endValue', function () {
    const tree = shallow(<Slider variant="range" startValue="0.2" endValue="0.6" />);
    assert.equal(tree.prop('className'), 'spectrum-Slider');
    assert.equal(tree.find('.spectrum-Slider-track').length, 1);
    assert.equal(tree.find('.spectrum-Slider-handle').length, 2);
    assert.equal(tree.find('.spectrum-Slider-input').length, 2);
    assert.equal(tree.state('startValue'), 0.2);
    assert.equal(tree.state('endValue'), 0.6);
    assert.equal(tree.find('.spectrum-Slider-handle').getElements()[0].props.style.left, '20%');
    assert.equal(tree.find('.spectrum-Slider-handle').getElements()[1].props.style.left, '60%');
  });

  it('should not allow crossing of sliders for range slider', function () {
    const onChange = sinon.spy();
    const tree = shallow(<Slider variant="range" onChange={onChange} />);
    tree.setState({startValue: 0.7, endValue: 0.8, draggingHandle: 'endHandle'});
    tree.instance().dom = {
      getBoundingClientRect() {
        return {
          left: 20,
          width: 100
        };
      }
    };

    let innerTree = shallow(tree.find('.spectrum-Slider-handle').getElements()[1]);
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 80
    });

    // endHandle crossed startHandle each other 0.6<0.7
    assert.equal(tree.state('draggingHandle'), 'endHandle');
    assert(onChange.notCalled);

    // The value does not get updated
    assert.equal(tree.state('startValue'), 0.7);
    assert.equal(tree.state('endValue'), 0.8);
  });

  it('should not set state if values are controlled in range slider', function () {
    const tree = shallow(<Slider variant="range" startValue="0.1" endValue="0.6" />);

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
      clientX: 80
    });

    innerTree = shallow(tree.find('.spectrum-Slider-handle').getElements()[1]);
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 90
    });


    assert.equal(tree.state('startValue'), 0.1);
    assert.equal(tree.state('endValue'), 0.6);
  });

  it('should set state if values are uncontrolled in range slider', function () {
    const tree = shallow(<Slider variant="range" defaultStartValue="0.1" defaultEndValue="0.6" />);

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
      clientX: 60
    });

    assert.equal(tree.state('startValue'), 0.4);

    innerTree = shallow(tree.find('.spectrum-Slider-handle').getElements()[1]);
    innerTree.simulate('mouseDown', {
      preventDefault() {},
      clientX: 90
    });
    assert.equal(tree.state('endValue'), 0.7);
  });

});
