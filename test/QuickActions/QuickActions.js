import Add from '../../src/Icon/Add';
import assert from 'assert';
import DropdownButton from '../../src/DropdownButton';
import {mount, shallow} from 'enzyme';
import {QuickActions, QuickActionsItem} from '../../src/QuickActions';
import React from 'react';
import sinon from 'sinon';

describe('QuickActions', function () {
  beforeEach(() => {
    mountedQuickActions = undefined;
  });
  afterEach(() => {
    if (mountedQuickActions) {
      console.log('mountedQuickActions', mountedQuickActions);
      mountedQuickActions.unmount();
    }

    if (console.error.restore) {
      console.error.restore();
    }
  });

  let mountedQuickActions;

  it('should render a div with proper classes', function () {
    const renderedQuickActions = shallow(
      <QuickActions>
        <QuickActionsItem label="Add" icon={<Add />} onClick={() => {}} />
      </QuickActions>
    );

    assert(renderedQuickActions.hasClass('spectrum-QuickActions'));
  });

  it('should render a div with is-open class when open prop is passed', function () {
    const renderedQuickActions = shallow(
      <QuickActions isOpen>
        <QuickActionsItem label="Add" icon={<Add />} onClick={() => {}} />
      </QuickActions>
    );

    assert(renderedQuickActions.hasClass('is-open'));
  });

  it('should accept custom class', function () {
    const renderedQuickActions = shallow(
      <QuickActions className="my-custom-quickActions-class">
        <QuickActionsItem label="Add" icon={<Add />} onClick={() => {}} />
      </QuickActions>
    );

    assert(renderedQuickActions.hasClass('my-custom-quickActions-class'));
  });

  it('should always require QuickActionsItem children', function () {
    let consoleErrorSpy = sinon.stub(console, 'error');

    // For a single child
    shallow(
      <QuickActions>
        <Add />
      </QuickActions>
    );

    assert(/Invalid prop `children` supplied to `QuickActions`/.test(consoleErrorSpy.getCall(0).args[0]));

    // For multiple children
    shallow(
      <QuickActions>
        <Add />
        <Add />
        <Add />
      </QuickActions>
    );

    assert(/Invalid prop `children` supplied to `QuickActions`/.test(consoleErrorSpy.firstCall.args[0]));
  });

  it('should render icons only by default', function () {
    mountedQuickActions = mount(
      <QuickActions>
        <QuickActionsItem label="Add" icon={<Add />} onClick={() => {}} />
      </QuickActions>
    );

    assert.strictEqual(mountedQuickActions.prop('variant'), undefined);
    assert(mountedQuickActions.find(QuickActionsItem).prop('icon'));
    assert(!mountedQuickActions.hasClass('spectrum-QuickActions--textOnly'));
  });

  it('should render icons when variant="icon"', function () {
    const renderedQuickActions = shallow(
      <QuickActions variant="icon">
        <QuickActionsItem label="Add" icon={<Add />} onClick={() => {}} />
      </QuickActions>
    );

    assert(renderedQuickActions.find(QuickActionsItem).prop('icon'));
    assert(!renderedQuickActions.hasClass('spectrum-QuickActions--textOnly'));
  });

  it('should render text only when variant="text"', function () {
    const renderedQuickActions = shallow(
      <QuickActions variant="text">
        <QuickActionsItem label="Add" icon={<Add />} onClick={() => {}} />
      </QuickActions>
    );

    assert.strictEqual(renderedQuickActions.find(QuickActionsItem).prop('icon'), undefined);
    assert(renderedQuickActions.hasClass('spectrum-QuickActions--textOnly'));
  });

  it('should wrap quick actions into DropdownButton if maxVisibleItems is set', function () {
    const MAX_VISIBLE_ITEMS = 2;
    const thirdQuickAction = <QuickActionsItem label="Add 3" icon={<Add />} onClick={() => {}} />;
    const quickActions = (
      <QuickActions maxVisibleItems={MAX_VISIBLE_ITEMS}>
        <QuickActionsItem label="Add 1" icon={<Add />} onClick={() => {}} />
        <QuickActionsItem label="Add 2" icon={<Add />} onClick={() => {}} />
        {thirdQuickAction}
      </QuickActions>
    );

    const tree = shallow(quickActions);
    assert.strictEqual(tree.children().filter(QuickActionsItem).length, MAX_VISIBLE_ITEMS);

    const dropdownButton = tree.find(DropdownButton);
    assert.strictEqual(dropdownButton.find(QuickActionsItem).length,
      quickActions.props.children.length - MAX_VISIBLE_ITEMS);

    const wrappedQuickAction = dropdownButton.find(QuickActionsItem);
    assert(wrappedQuickAction);
    assert.strictEqual(wrappedQuickAction.prop('label'), thirdQuickAction.props.label);
    assert(wrappedQuickAction.prop('isMenuItem'));
  });
});
