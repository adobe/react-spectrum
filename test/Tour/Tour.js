import assert from 'assert';
import CoachMark from '../../src/CoachMark';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Tour from '../../src/Tour';

describe('Tour', () => {
  it('default', () => {
    const tree = shallow(<Tour>
      <CoachMark title="Default" selector="#stepOne">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepTwo">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepThree">
        This is the Default Coach Mark
      </CoachMark>
    </Tour>);

    assert.equal(tree.props().currentStep, 1);
    assert.equal(tree.props().totalSteps, 3);
    assert.equal(tree.props().cancelLabel, 'Skip Tour');
    assert.equal(tree.props().confirmLabel, 'Next');
    assert.equal(tree.props().dismissable, undefined);
  });

  it('dismissable - skip', () => {
    let onTourEnd = sinon.spy();
    const tree = shallow(<Tour clickOutsideAction="skip" onTourEnd={onTourEnd}>
      <CoachMark title="Default" selector="#stepOne">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepTwo">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepThree">
        This is the Default Coach Mark
      </CoachMark>
    </Tour>);

    assert.equal(tree.props().currentStep, 1);
    assert.equal(tree.props().totalSteps, 3);
    assert.equal(tree.props().cancelLabel, 'Skip Tour');
    assert.equal(tree.props().confirmLabel, 'Next');
    assert.equal(tree.props().dismissable, true);

    tree.instance().onHide('', tree);

    assert(onTourEnd.calledWith('cancel'));
    assert.equal(tree.html(), null);
  });

  it('dismissable - next', () => {
    let onTourEnd = sinon.spy();
    const tree = shallow(<Tour clickOutsideAction="next" onTourEnd={onTourEnd}>
      <CoachMark title="Default" selector="#stepOne">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepTwo">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepThree">
        This is the Default Coach Mark
      </CoachMark>
    </Tour>);

    assert.equal(tree.props().currentStep, 1);
    assert.equal(tree.props().totalSteps, 3);
    assert.equal(tree.props().cancelLabel, 'Skip Tour');
    assert.equal(tree.props().confirmLabel, 'Next');
    assert.equal(tree.props().dismissable, true);

    for (let i = 1; i <= 3; i++) {
      assert.equal(tree.props().currentStep, i);
      assert.equal(tree.props().totalSteps, 3);

      if (i === 3) {
        assert.equal(tree.props().cancelLabel, null);
        assert.equal(tree.props().confirmLabel, 'Done');
      } else {
        assert.equal(tree.props().cancelLabel, 'Skip Tour');
        assert.equal(tree.props().confirmLabel, 'Next');
      }
      assert(!onTourEnd.called);
      tree.instance().onHide('', tree);
    }

    assert(onTourEnd.calledWith('complete'));
    assert.equal(tree.html(), null);
  });

  it('Should change steps on confirm', () => {
    let onTourEnd = sinon.spy();
    const tree = shallow(<Tour onTourEnd={onTourEnd}>
      <CoachMark title="Default" selector="#stepOne">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepTwo">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepThree">
        This is the Default Coach Mark
      </CoachMark>
    </Tour>);

    for (let i = 1; i <= 3; i++) {
      assert.equal(tree.props().currentStep, i);
      assert.equal(tree.props().totalSteps, 3);
      
      if (i === 3) {
        assert.equal(tree.props().cancelLabel, null);
        assert.equal(tree.props().confirmLabel, 'Done');
      } else {
        assert.equal(tree.props().cancelLabel, 'Skip Tour');
        assert.equal(tree.props().confirmLabel, 'Next');
      }
      assert(!onTourEnd.called);
      tree.instance().onConfirm();
    }

    assert(onTourEnd.calledWith('complete'));
    assert.equal(tree.html(), null);
  });

  it('Should quit tour on cancel', () => {
    let onTourEnd = sinon.spy();
    const tree = shallow(<Tour onTourEnd={onTourEnd}>
      <CoachMark title="Default" selector="#stepOne">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepTwo">
        This is the Default Coach Mark
      </CoachMark>
      <CoachMark title="Default" selector="#stepThree">
        This is the Default Coach Mark
      </CoachMark>
    </Tour>);

    assert.equal(tree.props().currentStep, 1);
    assert(!onTourEnd.called);
    tree.instance().onCancel();

    assert(onTourEnd.calledWith('cancel'));
    assert.equal(tree.html(), null);
  });
});
