import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
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
    assert.equal(tree.prop('aria-invalid'), false);
  });

  it('supports quiet variation', () => {
    const tree = shallow(<Textfield multiLine quiet />);
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline spectrum-Textfield--quiet');
    tree.setProps({quiet: false});
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline');
  });

  describe('growing quiet variant', () => {
    let e;
    beforeEach(() => {

      const tree = shallow(<Textarea quiet />);
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
    });
  });

  it('supports name', () => {
    const tree = shallow(<Textfield multiLine name="foo" />);
    assert.equal(tree.prop('name'), 'foo');
  });

  it('supports disabled', () => {
    const tree = shallow(<Textfield multiLine />);
    assert(!tree.prop('disabled'));
    assert.equal(tree.prop('aria-disabled'), false);
    tree.setProps({disabled: true});
    assert.equal(tree.prop('disabled'), true);
    assert.equal(tree.prop('aria-disabled'), true);
  });

  it('supports required', () => {
    const tree = shallow(<Textfield multiLine />);
    assert.equal(tree.prop('aria-required'), false);
    tree.setProps({required: true});
    assert.equal(tree.prop('aria-required'), true);
  });

  it('supports readOnly', () => {
    const tree = shallow(<Textfield multiLine />);
    assert.equal(tree.prop('aria-readonly'), false);
    tree.setProps({readOnly: true});
    assert.equal(tree.prop('aria-readonly'), true);
  });

  it('supports invalid', () => {
    const tree = shallow(<Textfield multiLine invalid />);
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline is-invalid');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Textfield multiLine className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Textfield spectrum-Textfield--multiline myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Textfield multiLine foo />);
    assert.equal(tree.prop('foo'), true);
  });
});
