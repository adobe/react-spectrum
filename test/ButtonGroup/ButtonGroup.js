import Add from '../../src/Icon/Add';
import assert from 'assert';
import Bell from '../../src/Icon/Bell';
import Button from '../../src/Button';
import ButtonGroup from '../../src/ButtonGroup';
import Camera from '../../src/Icon/Camera';
import CheckmarkCircle from '../../src/Icon/CheckmarkCircle';
import Delete from '../../src/Icon/Delete';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import Undo from '../../src/Icon/Undo';

const defaultProps = {
  children: [
    <Button label="React" value="react" icon={<CheckmarkCircle />} />,
    <Button label="Add" value="add" icon={<Add />} />,
    <Button label="Delete" value="delete" icon={<Delete />} disabled />,
    <Button label="Bell" value="bell" icon={<Bell />} />,
    <Button label="Camera" value="camera" icon={<Camera />} />,
    <Button label="Undo" value="undo" icon={<Undo />} readOnly />
  ]
};

const badButtonProps = {
  children: [
    <Button variant="primary" label="React" value="react" icon={<CheckmarkCircle />} />,
    <Button variant="primary" label="Add" value="add" icon={<Add />} />,
  ]
};

const toolButtonProps = {
  children: [
    <Button variant="tool" value="react" icon={<CheckmarkCircle />} />,
    <Button variant="tool" value="add" icon={<Add />} />,
  ]
};

const selectedValue = [
  'react',
  'add',
  'undo'
];

describe('ButtonGroup', () => {
  it('supports additional classNames', () => {
    const tree = shallow(<ButtonGroup className="bell" />);
    assert(tree.childAt(0).prop('className').indexOf('bell') >= 0);
  });

  it('supports numerous buttons', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} />);
    assert.equal(tree.find(Button).length, 6);
  });

  it('should default to quiet action button', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} />);
    assert.equal(tree.find(Button).first().prop('variant'), 'action');
    assert.equal(tree.find(Button).first().prop('quiet'), true);
  });

  it('should default to quiet action button if invalid variant is provided', () => {
    const tree = shallow(<ButtonGroup {...badButtonProps} />);
    assert.equal(tree.find(Button).first().prop('variant'), 'action');
    assert.equal(tree.find(Button).first().prop('quiet'), true);
  });

  it('should support tool buttons', () => {
    const tree = shallow(<ButtonGroup {...toolButtonProps} />);
    assert.equal(tree.find(Button).first().prop('variant'), 'tool');
  });

  it('supports an item being selected', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} value={selectedValue[0]} />);
    assert.equal(tree.find({selected: true}).length, 1);
  });

  it('supports an item being selected', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} value={selectedValue[0]} />);
    const selectedItem = tree.find({selected: true});
    assert.equal(selectedItem.length, 1);
  });

  it('supports multiple items being selected', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} multiple value={selectedValue} />);
    assert.equal(tree.find({selected: true}).length, 3);
  });

  it('supports multiple items being deselected', () => {
    const onChangeSpy = sinon.spy();
    const onClickSpy = sinon.spy();
    const tree = shallow(<ButtonGroup {...defaultProps} multiple onChange={onChangeSpy} onClick={onClickSpy} />);
    tree.setState({value: selectedValue});
    let selectedItems = tree.find({selected: true});
    assert.equal(selectedItems.length, 3);

    selectedItems.at(0).simulate('click');
    selectedItems = tree.find({selected: true});
    assert.equal(selectedItems.length, 2);
    assert(onChangeSpy.calledOnce);
    assert(onClickSpy.calledOnce);

    selectedItems.at(0).simulate('click');
    selectedItems = tree.find({selected: true});
    assert.equal(selectedItems.length, 1);
    assert(onChangeSpy.calledTwice);
    assert(onClickSpy.calledTwice);

    selectedItems.at(0).simulate('click');
    selectedItems = tree.find({selected: true});
    assert.equal(selectedItems.length, 1);
    assert(onChangeSpy.calledTwice);
    assert(onClickSpy.calledThrice);
  });

  it('componentWillReceiveProps', () => {
    const onChangeSpy = sinon.spy();
    const onClickSpy = sinon.spy();
    const tree = shallow(<ButtonGroup {...defaultProps} multiple onChange={onChangeSpy} onClick={onClickSpy} />);
    assert.equal(tree.props.value, null);
    assert.equal(tree.state.value, null);
    tree.setProps({value: selectedValue});
    assert.deepEqual(tree.props.value, tree.state.value);
  });

  it('supports all items being disabled', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} disabled />);
    tree.find(Button).forEach((node) => {
      assert.equal(node.prop('disabled'), true);
    });
  });

  it('supports an item being disabled', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} />);
    assert.equal(tree.find({disabled: true}).length, 1);
  });

  it('supports readOnly', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} readOnly />);
    tree.find(Button).first().simulate('click');
    assert.equal(tree.find({selected: true}).length, 0);
  });

  it('supports orientation', () => {
    const tree = shallow(<ButtonGroup {...defaultProps} />);
    tree.setProps({orientation: 'horizontal'});
    assert.equal(tree.childAt(0).prop('aria-orientation'), null);
    tree.setProps({orientation: 'vertical'});
    assert.equal(tree.childAt(0).prop('aria-orientation'), null);
    tree.setProps({orientation: 'both'});
    assert.equal(tree.childAt(0).prop('aria-orientation'), null);
    tree.setProps({orientation: 'horizontal', readOnly: true});
    assert.equal(tree.childAt(0).prop('aria-orientation'), 'horizontal');
    tree.setProps({orientation: 'vertical', readOnly: true});
    assert.equal(tree.childAt(0).prop('aria-orientation'), 'vertical');
    tree.setProps({orientation: 'both', readOnly: true});
    assert.equal(tree.childAt(0).prop('aria-orientation'), null);
  });

  it('supports selection being returned on selection change for single select', (done) => {
    const tree = shallow(
      <ButtonGroup
        {...defaultProps}
        onChange={(value) => {
          assert.deepEqual(value, 'react');
          done();
        }} />
    );
    tree.find(Button).first().simulate('click');
  });

  describe('Accessibility', () => {
    describe('supports appropriate WAI-ARIA properties depending on selection mode', () => {
      describe('readOnly', () => {
        it('should have role=toolbar if there are more than one button', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} readOnly />);
          assert.equal(tree.childAt(0).prop('role'), 'toolbar');
        });

        it('children should not have a role attribute', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} readOnly />);
          assert.equal(tree.find(Button).first().prop('role'), undefined);
        });

        it('should have role=group if there is one button or less', () => {
          const tree = shallow(<ButtonGroup readOnly>
            <Button label="Only One" />
          </ButtonGroup>);
          assert.equal(tree.childAt(0).prop('role'), 'group');
        });

        it('items should not have aria-checked attribute', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} readOnly />);
          assert.equal(tree.find(Button).first().prop('aria-checked'), undefined);
        });
      });

      describe('multiple', () => {
        it('should have role=group', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} multiple />);
          assert.equal(tree.childAt(0).prop('role'), 'group');
        });

        it('children should have role=checkbox', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} multiple />);
          assert.equal(tree.find(Button).first().prop('role'), 'checkbox');
        });

        it('selected items should have aria-checked=true', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} multiple value={selectedValue} />);
          tree.find(Button).forEach((node, i) => {
            assert.equal(node.prop('aria-checked'), i < 2 || i > 4);
          });
        });
      });

      describe('Default (single-selection)', () => {
        it('should have role=radiogroup', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} />);
          assert.equal(tree.childAt(0).prop('role'), 'radiogroup');
        });

        it('children should have role=radio', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} />);
          assert.equal(tree.find(Button).first().prop('role'), 'radio');
        });

        it('selected item should have aria-checked=true', () => {
          const tree = shallow(<ButtonGroup {...defaultProps} value={selectedValue[0]} />);
          tree.find(Button).forEach((node, i) => {
            assert.equal(node.prop('aria-checked'), i === 0);
          });
        });
      });

      it('supports aria-checked updating with selection', () => {
        const tree = shallow(<ButtonGroup {...defaultProps} />);
        tree.find(Button).forEach((node, i) => {
          assert.equal(node.prop('aria-checked'), false);
        });
        tree.find(Button).first().simulate('click');
        tree.find(Button).forEach((node, i) => {
          assert.equal(node.prop('aria-checked'), i === 0);
        });
      });
    });

    describe('Keyboard interaction, ', () => {
      describe('readOnly', () => {
        it('buttons should have tabIndex=0, or if disabled tabIndex=-1, when no button has focus', () => {
          const tree = mount(<ButtonGroup {...defaultProps} readOnly />);
          tree.find(Button).forEach((node) => {
            let tabIndex = !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });

          tree.unmount();
        });
        it('focused button should have tabIndex=0, while not focused buttons should have tabIndex=-1', () => {
          const tree = mount(<ButtonGroup {...defaultProps} readOnly />);
          tree.find(Button).first().simulate('focus');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 0 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });
          tree.find(Button).last().simulate('focus');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 5 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });
          tree.find(Button).last().simulate('blur');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 5 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });

          tree.unmount();
        });
      });

      describe('multiple', () => {
        it('buttons should have tabIndex=0, or if disabled tabIndex=-1, when no button has focus', () => {
          const tree = mount(<ButtonGroup {...defaultProps} multiple />);
          tree.find(Button).forEach((node) => {
            let tabIndex = !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });

          tree.unmount();
        });

        it('focused button should have tabIndex=0, while not focused buttons should have tabIndex=-1', () => {
          const tree = mount(<ButtonGroup {...defaultProps} multiple />);
          tree.find(Button).first().simulate('focus');
          tree.find(Button).first().simulate('click');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 0 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });
          tree.find(Button).at(4).simulate('focus');
          tree.find(Button).at(4).simulate('click');
          tree.find(Button).at(1).simulate('focus');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 1 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });
          tree.find(Button).at(1).simulate('blur');
          tree.update();

          // with multiple selection, selected items should have tabIndex=0 on blur
          tree.find(Button).forEach((node, i) => {
            let tabIndex = (i === 0 || i === 4) && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });

          tree.unmount();
        });
      });

      describe('Default (single-selection)', () => {
        it('buttons should have tabIndex=0, or if disabled tabIndex=-1, attribute when no button has focus', () => {
          const tree = mount(<ButtonGroup {...defaultProps} />);
          tree.find(Button).forEach((node) => {
            let tabIndex = !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });

          tree.unmount();
        });

        it('focused button should have tabIndex=0, while not focused buttons should have tabIndex=-1', () => {
          const tree = mount(<ButtonGroup {...defaultProps} />);
          tree.find(Button).first().simulate('focus');
          tree.find(Button).first().simulate('click');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 0 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });
          tree.find(Button).last().simulate('focus');
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 5 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });
          tree.find(Button).last().simulate('blur');

          // with single selection, only selected item should have tabIndex=0 on blur
          tree.find(Button).forEach((node, i) => {
            let tabIndex = i === 0 && !node.prop('disabled') ? 0 : -1;
            assert.equal(node.getDOMNode().tabIndex, tabIndex);
          });

          tree.unmount();
        });
      });

      describe('navigation', () => {
        let tree;
        let wrapper;
        let button;
        before(() => {
          tree = mount(<ButtonGroup {...defaultProps} />);
          wrapper = tree.find('.spectrum-ButtonGroup');
        });

        after(() => {
          tree.unmount();
        });

        const findButtonAt = (wrapper, index) => wrapper.find(Button).at(index);
        const testKeyboardNavigation = (key, indexes) => {
          let len = indexes.length;
          for (let i = 0; i < len; i++) {
            button = findButtonAt(wrapper, indexes[i]);
            if (i > 0) {
              assert.equal(button.prop('value'), document.activeElement.value);
            }
            if (i < len - 1) {
              button.simulate('keydown', {key: key, preventDefault: () => {}});
            }
          }
        };

        it('supports ArrowRight to focus next, not disabled button', () => {
          testKeyboardNavigation('ArrowRight', [0, 1, 3]);
        });

        it('supports ArrowDown to focus next, not disabled button', () => {
          testKeyboardNavigation('ArrowDown', [0, 1, 3]);
        });

        it('supports wrapping when ArrowRight key is pressed on last button', () => {
          testKeyboardNavigation('ArrowDown', [5, 0]);
        });

        it('supports wrapping when ArrowDown key is pressed on last button', () => {
          testKeyboardNavigation('ArrowDown', [5, 0]);
        });

        it('supports ArrowLeft to focus previous, not disabled button', () => {
          testKeyboardNavigation('ArrowLeft', [3, 1, 0]);
        });

        it('supports ArrowUp to focus previous, not disabled button', () => {
          testKeyboardNavigation('ArrowUp', [3, 1, 0]);
        });

        it('supports wrapping when ArrowLeft key is pressed on first button', () => {
          testKeyboardNavigation('ArrowLeft', [0, 5]);
        });

        it('supports wrapping when ArrowUp key is pressed on first button', () => {
          testKeyboardNavigation('ArrowUp', [0, 5]);
        });

        it('supports Home to focus first, not disabled button', () => {
          testKeyboardNavigation('Home', [5, 0]);
        });

        it('supports PageUp to focus first, not disabled button', () => {
          testKeyboardNavigation('PageUp', [5, 0]);
        });

        it('supports End to focus last, not disabled button', () => {
          testKeyboardNavigation('End', [0, 5]);
        });

        it('supports PageDown to focus last, not disabled button', () => {
          testKeyboardNavigation('PageDown', [0, 5]);
        });
      });
    });

  });
});
