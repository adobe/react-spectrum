import assert from 'assert';
import Button from '../../src/Button';
import Dropdown from '../../src/Dropdown';
import DropdownButton from '../../src/DropdownButton';
import {MenuItem} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

const render = (props = {}) => shallow(
  <DropdownButton label="Test" {...props}>
    <MenuItem value="Test1">
      Test1
    </MenuItem>
    <MenuItem value="Test2">
      Test2
    </MenuItem>
  </DropdownButton>
);

describe('DropdownButton', function () {
  it('renders a default', function () {

    const wrapper = render({});

    assert.equal(wrapper.find(Button).length, 1);
    assert.equal(wrapper.find(Dropdown).length, 1);
  });

  it('passes props', function () {
    const onClose = sinon.spy();
    const onOpen = sinon.spy();
    const onSelect = sinon.spy();
    const closeOnSelect = true;
    const wrapper = render({onClose, onOpen, onSelect, closeOnSelect});

    const dropdown = wrapper.find(Dropdown);

    assert.equal(dropdown.prop('onClose'), onClose);
    assert.equal(dropdown.prop('onOpen'), onOpen);
    assert.equal(dropdown.prop('onSelect'), onSelect);
    assert.equal(dropdown.prop('closeOnSelect'), closeOnSelect);
  });
});
