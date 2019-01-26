import assert from 'assert';
import Button from '../../src/Button';
import CoachMarkPopover from '../../src/CoachMark/js/CoachMarkPopover';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('CoachMarkPopover', () => {
  it('default', () => {
    const tree = mount(<div>
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
    
    let coachmarkPopover = tree.find(CoachMarkPopover);

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

    tree.unmount();
  });

  it('can display an image', () => {
    const tree = mount(<div>
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

    let coachmarkPopover = tree.find(CoachMarkPopover);

    assert.equal(coachmarkPopover.find('img').length, 1);

    tree.unmount();
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

  it('Should have working confirm and cancel buttons', async () => {
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
});
