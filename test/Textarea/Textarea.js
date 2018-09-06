import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';
import Textarea from '../../src/Textarea';
import Textfield from '../../src/Textfield';

describe('Textarea', () => {
  it('should render a Textfield with multiLine = true', () => {
    const tree = shallow(<Textarea />);
    assert.equal(tree.type(), Textfield);
    assert.equal(tree.prop('multiLine'), true);
  });

  it('should render a textarea', () => {
    const tree = shallow(<Textfield multiLine />);
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline');
  });

  it('supports quiet variation', () => {
    const tree = shallow(<Textfield multiLine quiet />);
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline spectrum-Textfield--quiet');
    tree.setProps({quiet: false});
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline');
  });

  describe('growing quiet variant', () => {
    let e;
    let spy = sinon.spy();
    beforeEach(() => {

      const tree = shallow(<Textarea quiet onChange={spy} />);
      e = {
        target: {
          scrollHeight: 200,
          style: {}
        }
      };

      tree.instance().handleHeightChange(null, e);
    });

    it('height should equal scrollHeight', () => {
      assert.equal(e.target.style.height, e.target.scrollHeight + 'px');
      assert(spy.calledOnce);
    });
  });

  it('supports name', () => {
    const tree = shallow(<Textfield multiLine name="foo" />);
    assert.equal(tree.prop('name'), 'foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Textfield multiLine />);
    assert(!tree.prop('disabled'));
    tree.setProps({disabled: true});
    assert.equal(tree.prop('disabled'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Textfield multiLine />);
    assert(!tree.prop('required'));
    tree.setProps({required: true});
    assert.equal(tree.prop('required'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Textfield multiLine />);
    assert(!tree.prop('readOnly'));
    tree.setProps({readOnly: true});
    assert.equal(tree.prop('readOnly'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Textfield multiLine />);
    assert(!tree.prop('aria-invalid'));
    tree.setProps({invalid: true});
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline is-invalid');
    assert.equal(tree.prop('aria-invalid'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Textfield multiLine className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Textfield multiLine data-foo />);
    assert.equal(tree.prop('data-foo'), true);
  });

  it('supports autoFocus', async () => {
    const tree = mount(<Textfield multiLine autoFocus />);
    assert(!tree.getDOMNode().getAttribute('autoFocus'));
    await sleep(17);
    assert.equal(document.activeElement, tree.getDOMNode());
    tree.unmount();
  });

  it('supports onChange event handler', () => {
    const spy = sinon.spy();
    const val = 'foo';
    const tree = mount(<Textfield onChange={spy} />);
    tree.getDOMNode().value = val;
    tree.simulate('change');
    assert(spy.calledOnce);
    assert.equal(spy.lastCall.args[0], val);

    tree.unmount();
  });
});
