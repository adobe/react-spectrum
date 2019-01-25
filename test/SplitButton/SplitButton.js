import assert from 'assert';
import Button from '../../src/Button';
import Dropdown from '../../src/Dropdown';
import {MenuItem} from '../../src/Menu';
import {mount} from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
import sinon from 'sinon';
import SplitButton from '../../src/SplitButton';

describe('SplitButton', () => {
  let wrapper;
  const clickHandler = sinon.spy();
  const selectHandler = sinon.spy();
  const render = (props = {}) => mount(
    <SplitButton
      label="Action"
      variant="primary"
      onClick={clickHandler}
      onSelect={selectHandler}
      {...props}>
      <MenuItem className="testMenuItem" value="twitter">
      Twitter
      </MenuItem>
      <MenuItem className="testMenuItem" value="facebook">
      Facebook
      </MenuItem>
      <MenuItem className="testMenuItem" value="instagram">
      Instagram
      </MenuItem>
    </SplitButton>
  );
  beforeEach(() => {
    clickHandler.reset();
    selectHandler.reset();
  });
  afterEach(() => {
    wrapper.unmount();
  });
  it('renders a default', function () {
    wrapper = render();
    const buttons = wrapper.find(Button);
    const dropdown = wrapper.find(Dropdown);

    assert.equal(buttons.length, 2);
    assert.equal(dropdown.length, 1);

    assert(wrapper.childAt(0).hasClass('spectrum-SplitButton'));
    assert(buttons.first().hasClass('spectrum-SplitButton-action'));
    assert(buttons.last().hasClass('spectrum-SplitButton-trigger'));
  });

  it('has appropriate WAI-ARIA props to label group and buttons', () => {
    wrapper = render();
    const buttons = wrapper.find(Button);
    const dropdown = wrapper.find(Dropdown);

    assert.equal(buttons.length, 2);
    assert.equal(dropdown.length, 1);

    assert.equal(wrapper.childAt(0).prop('role'), 'group');
    assert.equal(wrapper.childAt(0).prop('aria-labelledby'), buttons.first().prop('id'));
    assert.equal(buttons.last().prop('aria-labelledby'), buttons.first().prop('id'));
    assert.equal(buttons.last().prop('aria-haspopup'), 'true');
  });

  it('action button triggers click event', () => {
    const onOpen = sinon.spy();
    wrapper = render({onOpen});
    const buttons = wrapper.find(Button);
    buttons.first().simulate('click');
    assert(!onOpen.called);
    assert(clickHandler.called);
  });

  it('toggles menu when trigger button is clicked', () => {
    const onOpen = sinon.spy();
    const onClose = sinon.spy();
    wrapper = render({onOpen, onClose});
    const buttons = wrapper.find(Button);
    buttons.last().simulate('click');
    assert(onOpen.called);
    assert.equal(buttons.last().getDOMNode().getAttribute('aria-expanded'), 'true');
    buttons.last().simulate('click');
    assert(onClose.called);
    assert(!buttons.last().getDOMNode().getAttribute('aria-expanded'));
  });

  it('keydown event with \'ArrowDown\' or \'down\' expands menu', () => {
    const onOpen = sinon.spy();
    const onClose = sinon.spy();
    const onKeyDown = sinon.spy();
    wrapper = render({onOpen, onClose, onKeyDown});
    const buttons = wrapper.find(Button);
    buttons.first().getDOMNode().focus();
    wrapper.childAt(0).simulate('keydown', {target: buttons.first().getDOMNode(), key: 'ArrowDown', altKey: true});
    assert(onKeyDown.called);
    assert(onOpen.called);
    assert.equal(buttons.last().getDOMNode().getAttribute('aria-expanded'), 'true');
    // close by clicking on last button element
    buttons.last().simulate('click');
    assert(onClose.called);
    assert(!buttons.last().getDOMNode().getAttribute('aria-expanded'));
    buttons.last().getDOMNode().focus();
    wrapper.childAt(0).simulate('keydown', {target: buttons.last().getDOMNode(), key: 'Down'});
    assert(onKeyDown.calledTwice);
    assert(onOpen.calledTwice);
    assert.equal(buttons.last().getDOMNode().getAttribute('aria-expanded'), 'true');
    // close by calling hide on overlayTrigger
    wrapper.instance().dropdownRef.overlayTrigger.hide();
    assert(onClose.calledTwice);
    assert(!buttons.last().getDOMNode().getAttribute('aria-expanded'));
  });
});
