import assert from 'assert';
import Button from '../../src/Button';
import CoachMarkPopover from '../../src/CoachMark/js/CoachMarkPopover';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('CoachMarkPopover', () => {
  let clock;
  let tree;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    document.activeElement.blur();
    clock.runAll();
    if (tree) {
      tree.unmount();
      tree = null;
    }
    clock.restore();
  });

  it('default', () => {
    tree = mount(<div>
      <div
        id="something"
        style={{
          width: '100px',
          height: '75px',
          background: 'grey'
        }} />
      <CoachMarkPopover title="Default">
        This is the Default Coach Mark
      </CoachMarkPopover>
    </div>);

    clock.runAll();

    let coachmarkPopover = tree.find(CoachMarkPopover);

    assert.equal(coachmarkPopover.getDOMNode(), document.activeElement);

    assert.equal(coachmarkPopover.getDOMNode().tabIndex, 1);

    let coachmarkPopoverContainer = coachmarkPopover.find('.spectrum-CoachMarkPopover');
    assert.equal(coachmarkPopoverContainer.children().length, 3);

    let coachMarkHeader = coachmarkPopover.find('.spectrum-CoachMarkPopover-header');
    assert.equal(coachMarkHeader.children().length, 1);

    let coachMarkTitle = coachmarkPopover.find('.spectrum-CoachMarkPopover-title');
    assert.equal(coachMarkTitle.text(), 'Default');

    let coachMarkContent = coachmarkPopover.find('.spectrum-CoachMarkPopover-content');
    assert.equal(coachMarkContent.text(), 'This is the Default Coach Mark');

    let coachMarkFooter = coachmarkPopover.find('.spectrum-CoachMarkPopover-footer');
    assert.equal(coachMarkFooter.children().length, 0);

    assert.equal(coachmarkPopover.find('img').length, 0);
  });

  it('can display an image', () => {
    tree = mount(<div>
      <div
        id="something"
        style={{
          width: '100px',
          height: '75px',
          background: 'grey'
        }} />
      <CoachMarkPopover image="https://adobe.com/uncle-shantanu.jpg" title="Default">
        This is the Default Coach Mark
      </CoachMarkPopover>
    </div>);

    clock.runAll();

    let coachmarkPopover = tree.find(CoachMarkPopover);

    assert.equal(coachmarkPopover.getDOMNode(), document.activeElement);

    assert.equal(coachmarkPopover.find('img').length, 1);
    assert.equal(coachmarkPopover.find('img').prop('alt'), '');
  });

  it('Should only display valid progress', () => {
    let tree = shallow(<CoachMarkPopover title="Default">
      This is a Coach Mark
    </CoachMarkPopover>);

    assert.equal(tree.find('.spectrum-CoachMarkPopover-step').length, 0);

    tree = shallow(<CoachMarkPopover title="Default" disableProgress>
      This is a Coach Mark
    </CoachMarkPopover>);

    assert.equal(tree.find('.spectrum-CoachMarkPopover-step').length, 0);

    tree = shallow(<CoachMarkPopover title="Default" currentStep={1}>
      This is a Coach Mark
    </CoachMarkPopover>);

    assert.equal(tree.find('.spectrum-CoachMarkPopover-step').length, 0);

    tree = shallow(<CoachMarkPopover title="Default" totalSteps={4}>
      This is a Coach Mark
    </CoachMarkPopover>);

    assert.equal(tree.find('.spectrum-CoachMarkPopover-step').length, 0);

    tree = shallow(<CoachMarkPopover title="Default" currentStep={1} totalSteps={4}>
      This is a Coach Mark
    </CoachMarkPopover>);

    assert.equal(tree.find('.spectrum-CoachMarkPopover-step').length, 1);
  });

  it('Should have working confirm and cancel buttons', () => {
    const confirmSpy = sinon.spy();
    const cancelSpy = sinon.spy();

    const tree = shallow(<CoachMarkPopover
      title="Default"
      confirmLabel="confirm"
      cancelLabel="cancel"
      onConfirm={confirmSpy}
      onCancel={cancelSpy}>
      This is the Default Coach Mark
    </CoachMarkPopover>);

    const buttons = tree.find(Button);
    assert.equal(buttons.length, 2);

    assert(!cancelSpy.called);
    const cancelButton = buttons.first();
    assert.equal(cancelButton.children().first().text(), 'cancel');
    cancelButton.simulate('click');
    assert(cancelSpy.called);

    assert(!confirmSpy.called);
    const confirmButton = buttons.last();
    assert.equal(confirmButton.children().first().text(), 'confirm');
    confirmButton.simulate('click');
    assert(confirmSpy.called);
  });

  it('Should autoFocus confirm button by default', () => {
    const confirmSpy = sinon.spy();

    tree = mount(<CoachMarkPopover
      title="Default"
      confirmLabel="confirm"
      onConfirm={confirmSpy}>
      This is the Default Coach Mark
    </CoachMarkPopover>);

    clock.runAll();

    const confirmButton = tree.find(Button);
    assert.equal(confirmButton.getDOMNode(), document.activeElement);
    confirmButton.simulate('click');
    assert(confirmSpy.called);
  });

  it('Should autoFocus cancel button if no confirm button is present', () => {
    const cancelSpy = sinon.spy();

    tree = mount(<CoachMarkPopover
      title="Default"
      cancelLabel="cancel"
      onCancel={cancelSpy}>
      This is the Default Coach Mark
    </CoachMarkPopover>);

    clock.runAll();

    const cancelButton = tree.find(Button);
    assert.equal(cancelButton.getDOMNode(), document.activeElement);
    cancelButton.simulate('click');
    assert(cancelSpy.called);
  });

  it('focusing CoachMarkPopover itself should marshall focus to first tabbable descendant', () => {
    const focusSpy = sinon.spy();

    tree = mount(<CoachMarkPopover
      title="Default"
      confirmLabel="confirm"
      cancelLabel="cancel"
      onFocus={focusSpy}
      autoFocus={false}>
      This is the Default Coach Mark
    </CoachMarkPopover>);

    tree.simulate('focus', {type: 'focus'});

    clock.runAll();

    assert(focusSpy.called);

    const cancelButton = tree.find(Button).first();
    assert.equal(cancelButton.getDOMNode(), document.activeElement);
  });

  it('trapFocus: false should prevent trapFocus from executing', async () => {
    const focusSpy = sinon.spy();

    tree = mount(<CoachMarkPopover
      title="Default"
      confirmLabel="confirm"
      cancelLabel="cancel"
      onFocus={focusSpy}
      autoFocus={false}
      trapFocus={false}>
      This is the Default Coach Mark
    </CoachMarkPopover>);

    assert.equal(tree.find(CoachMarkPopover).getDOMNode().hasAttribute('tabIndex'), false);

    const lastFocus = document.activeElement;
    tree.simulate('focus', {type: 'focus'});
    clock.runAll();
    assert.equal(document.activeElement, lastFocus);
  });

  it('supports onKeyDown event handler', () => {
    const onKeyDown = sinon.spy();
    const tree = shallow(<CoachMarkPopover
      title="Default"
      onKeyDown={onKeyDown}>
      This is the Default Coach Mark
    </CoachMarkPopover>);
    tree.simulate('keydown', {key: 'Tab', shiftKey: false});
    assert(onKeyDown.called);
  });

  it('supports trapFocus', () => {
    const preventDefault = sinon.spy();
    const stopPropagation = sinon.spy();
    tree = mount(<CoachMarkPopover
      title="Default"
      confirmLabel="confirm"
      cancelLabel="cancel">
      This is the Default Coach Mark
    </CoachMarkPopover>);
    const event = {
      preventDefault,
      stopPropagation
    };
    clock.runAll();
    assert.equal(tree.childAt(0).prop('tabIndex'), 1);
    tree.simulate('focus', {...event, type: 'focus'});
    assert(preventDefault.called);
    assert(stopPropagation.called);
    assert.equal(document.activeElement, tree.find(Button).first().getDOMNode());
    event.key = 'Tab';
    event.shiftKey = true;
    tree.find(Button).first().simulate('keydown', {...event, type: 'keydown'});
    assert(preventDefault.calledTwice);
    assert(stopPropagation.calledTwice);
    assert.equal(document.activeElement, tree.find(Button).last().getDOMNode());
    event.shiftKey = false;
    tree.find(Button).last().simulate('keydown', {...event, type: 'keydown'});
    assert(preventDefault.calledThrice);
    assert(stopPropagation.calledThrice);
    assert.equal(document.activeElement, tree.find(Button).first().getDOMNode());

    // Should support stopPropagation from within onKeyDown event listener
    tree.setProps({
      'onKeyDown': e => e.isPropagationStopped = () => true
    });
    event.shiftKey = true;
    tree.find(Button).first().simulate('keydown', {...event, type: 'keydown'});
    assert(preventDefault.calledThrice);
    assert(stopPropagation.calledThrice);
    assert.equal(document.activeElement, tree.find(Button).first().getDOMNode());
  });
});
