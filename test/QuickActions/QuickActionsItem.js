import Add from '../../src/Icon/Add';
import assert from 'assert';
import Button from '../../src/Button';
import {MenuItem} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import {QuickActionsItem} from '../../src/QuickActions';
import React from 'react';
import sinon from 'sinon';

describe('QuickActionsItem', function () {
  afterEach(() => {
    if (renderedButton) {
      renderedButton.unmount();
    }

    if (console.error.restore) {
      console.error.restore();
    }
  });

  let props, renderedButton;

  function initialize(icon = <Add />, label = null, extraProps = {}) {
    props = Object.assign({icon: icon}, {label: label}, extraProps);
    renderedButton = shallow(<QuickActionsItem {...props} />);
  }

  it('should render a button with proper classes', function () {
    initialize(<Add />, 'Add');
    assert(renderedButton.prop('quiet'));
    assert.strictEqual(renderedButton.prop('variant'), 'action');
  });

  it('should render a MenuItem when isMenuItem is set', function () {
    initialize(<Add />, 'Add', {isMenuItem: true});
    console.log(renderedButton.debug());
    assert(renderedButton.find(MenuItem));
  });

  it('should always require a label', function () {
    let consoleErrorSpy = sinon.stub(console, 'error');

    initialize(<Add />);

    assert(/The prop `label` is marked as required in `QuickActionsItem`, but its value is `null`/
      .test(consoleErrorSpy.firstCall.args[0]));
  });

  it('should accept custom class', function () {
    initialize(null, 'Add', {className: 'my-custom-button'});
    assert(renderedButton.find('Button').hasClass('my-custom-button'));
  });

  it('should render an icon with default size', function () {
    renderedButton = mount(<QuickActionsItem icon={<Add />} label="Add" />);

    assert(renderedButton.find('svg').hasClass('spectrum-Icon'));
    assert(renderedButton.find('svg').hasClass('spectrum-Icon--sizeS'));
  });

  it('should render a label when icon is not defined', function () {
    renderedButton = mount(<QuickActionsItem label="Delete" />);

    assert.strictEqual(renderedButton.prop('label'), 'Delete');

    assert(renderedButton.find('span').hasClass('spectrum-ActionButton-label'));
  });

  it('should not pass a label prop when an icon is defined', function () {
    initialize(<Add />, 'Add');
    assert.strictEqual(renderedButton.prop('label'), Button.defaultProps.label);
  });

  it('should pass onClick to the rendered button', function () {
    let onClick = sinon.spy();
    initialize(<Add />, 'Add', {onClick});

    renderedButton.find('Button').simulate('click', {});

    assert.equal(onClick.callCount, 1);
    assert.deepEqual(onClick.lastCall.args[0], {});
  });

  it('should pass onClick to the rendered MenuItem', function () {
    let onClick = sinon.spy();
    initialize(<Add />, 'Add', {onClick: onClick, isMenuItem: true});

    renderedButton.find(MenuItem).simulate('click', {});

    sinon.assert.calledWith(onClick, {});
  });
});
