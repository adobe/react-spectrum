import assert from 'assert';
import Button from '../../src/Button';
import Dropdown from '../../src/Dropdown';
import FieldLabel from '../../src/FieldLabel';
import Illustrator from '../src/Icon/Illustrator';
import Lightroom from '../src/Icon/Lightroom';
import {mount, render, shallow} from 'enzyme';
import Photoshop from '../src/Icon/Photoshop';
import React from 'react';
import Select, {SelectMenu} from '../../src/Select';
import sinon from 'sinon';
import {sleep} from '../utils';

const testOptions = [
  {label: 'Chocolate', value: 'chocolate'},
  {label: 'Vanilla', value: 'vanilla'},
  {label: 'Strawberry', value: 'strawberry'},
  {label: 'Caramel', value: 'caramel'},
  {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
  {label: 'Coconut', value: 'coco'},
  {label: 'Peppermint', value: 'peppermint'},
  {label: 'Some crazy long value that should be cut off', value: 'logVal'}
];

describe('Select', () => {
  it('renders a dropdown', () => {
    const tree = shallow(<Select />);
    const dropdown = tree.find(Dropdown);
    assert.equal(dropdown.prop('className'), 'spectrum-Dropdown');
    assert.equal(tree.state('value'), null);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Select className="myClass" />);
    const select = tree.find(Dropdown);

    assert.equal(select.hasClass('myClass'), true);
    // Check that spectrum-Dropdown is not overwritten by the provided class.
    assert.equal(select.hasClass('spectrum-Dropdown'), true);
  });

  it('renders options', () => {
    const tree = shallow(<Select options={testOptions} />);
    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Chocolate');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.equal(tree.find(SelectMenu).prop('value'), 'chocolate');
  });

  it('renders options with multiple select', () => {
    const tree = shallow(<Select options={testOptions} multiple />);
    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Select an option');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.deepEqual(tree.find(SelectMenu).prop('value'), []);
  });

  it('should set an initial value', () => {
    const tree = shallow(<Select options={testOptions} value="vanilla" />);
    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Vanilla');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.equal(tree.find(SelectMenu).prop('value'), 'vanilla');
  });

  it('should set an initial value with multiple select', () => {
    const tree = shallow(<Select options={testOptions} value={['vanilla', 'caramel']} multiple />);
    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Select an option');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.deepEqual(tree.find(SelectMenu).prop('value'), ['vanilla', 'caramel']);
  });

  it('should set a default value', () => {
    const tree = shallow(<Select options={testOptions} defaultValue="vanilla" />);
    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Vanilla');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.equal(tree.find(SelectMenu).prop('value'), 'vanilla');
  });

  it('should update value if passed in', () => {
    const tree = shallow(<Select options={testOptions} value="vanilla" />);
    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Vanilla');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.equal(tree.find(SelectMenu).prop('value'), 'vanilla');

    tree.setProps({value: 'chocolate'});

    assert.equal(tree.find('.spectrum-Dropdown-label').text(), 'Chocolate');
    assert.deepEqual(tree.find(SelectMenu).prop('options'), testOptions);
    assert.equal(tree.find(SelectMenu).prop('value'), 'chocolate');
  });

  it('should handle selection', () => {
    const onChange = sinon.spy();
    const tree = shallow(<Select options={testOptions} onChange={onChange} />);
    assert.equal(tree.state('value'), 'chocolate');

    tree.find(Dropdown).simulate('select', 'vanilla');

    assert.equal(tree.state('value'), 'vanilla');
    assert(onChange.called);
  });

  it('should not close menu if closeOnSelect is set to false', () => {
    const onClose = sinon.spy();
    const onChange = sinon.spy();
    const tree = shallow(<Select options={testOptions} onChange={onChange} closeOnSelect={false} />);
    assert.equal(tree.state('value'), 'chocolate');

    tree.find(Dropdown).simulate('select', 'vanilla');

    assert.equal(onClose.callCount, 0);
    assert.equal(onChange.callCount, 1);
  });

  it('should not close menu if multiple selection is enabled', () => {
    const onClose = sinon.spy();
    const onChange = sinon.spy();
    const tree = shallow(<Select options={testOptions} onChange={onChange} multiple />);
    assert.deepEqual(tree.state('value'), []);

    tree.find(Dropdown).simulate('select', ['vanilla']);

    assert.equal(onClose.callCount, 0);
    assert.equal(onChange.callCount, 1);
  });

  it('Labelling of the Select with parent FieldLabel is handled correctly', () => {
    const tree = render(
      <FieldLabel label="foo">
        <Select options={testOptions} value="vanilla" />
      </FieldLabel>
      );

    assert.equal(tree.find('button').prop('aria-labelledby'), tree.find('label').prop('id') + ' ' + tree.find('span').prop('id'));

  });

  it('Labelling of the Select with aria-labelledby is handled correctly', () => {
    const tree = render(
      <div>
        <FieldLabel id="bar" label="test" htmlFor="foo" />
        <Select id="foo" options={testOptions} value="vanilla" aria-labelledby="bar" />
      </div>
    );

    assert.equal(tree.find('button').prop('aria-labelledby'), 'bar ' + tree.find('span').prop('id'));

  });

  it('Labelling of the Select with aria-label is handled correctly', () => {
    const tree = render(
      <Select options={testOptions} value="vanilla" aria-label="test" />
      );

    assert.equal(tree.find('button').prop('aria-labelledby'), tree.find('button').prop('id') + ' ' + tree.find('span').prop('id'));
  });

  it('should pass aria-* properties and id to the button', () => {
    const tree = render(
      <Select options={testOptions} value="vanilla" aria-describedby="test" id="myid" />
      );

    assert.equal(tree.find('button').prop('aria-describedby'), 'test');
    assert.equal(tree.find('button').prop('id'), 'myid');
  });

  it('shound pass non-aria DOM properties to the dropdown', () => {
    const tree = mount(
      <Select options={testOptions} value="vanilla" style={{width: '192px'}} lang="jp" />
      );

    assert.equal(tree.find(Dropdown).prop('lang'), 'jp');
    assert.equal(tree.find(Dropdown).prop('style').width, '192px');
  });

  it('should not update state if value prop is passed', () => {
    const onChange = sinon.spy();
    const tree = shallow(<Select options={testOptions} value="vanilla" onChange={onChange} />);
    assert.equal(tree.state('value'), 'vanilla');

    tree.find(Dropdown).simulate('select', 'chocolate');

    assert.equal(tree.state('value'), 'vanilla');
    assert(onChange.called);
  });

  it('should trigger the menu on key press', () => {
    const tree = shallow(<Select options={testOptions} />);

    for (let key of ['Enter', 'ArrowDown', 'Space']) {
      const spy = sinon.spy();
      tree.instance().button = {onClick: spy};

      tree.find(Button).simulate('keyDown', {key, preventDefault: function () {}});
      assert(spy.called);
    }
  });

  it('supports caching of width when componentDidUpdate is called', async () => {
    const tree = mount(<Select options={testOptions} />);

    // stub offsetWidth getter
    const stubWidth = 192;
    const stub = sinon.stub(tree.find(Button).getDOMNode(), 'offsetWidth').get(() => stubWidth);

    // show menu
    tree.instance().componentDidUpdate();
    await sleep(1);
    assert.equal(tree.instance().state.width, stubWidth);

    // restore original offsetWidth getter
    stub.restore();
    tree.unmount();
  });

  it('should not have a minimum width if noMinWidth prop is passed', () => {
    const tree = shallow(
      <Select options={testOptions} noMinWidth />
    );

    assert.deepEqual(tree.find(Button).prop('style'), null);
  });

  it('onClose restores focus to button and calls onClose method if defined', () => {
    const spy = sinon.spy();
    const tree = mount(<Select options={testOptions} onClose={spy} />);
    tree.find(Button).simulate('click');
    assert.equal(tree.find(Button).prop('selected'), true);
    assert.notEqual(tree.find(Button).getDOMNode(), document.activeElement);
    tree.find(Button).simulate('click');
    tree.update();
    assert(spy.calledOnce);
    assert.equal(tree.find(Button).getDOMNode(), document.activeElement);
    assert.equal(tree.find(Button).prop('selected'), false);

    tree.unmount();
  });

  it('supports icons in items', () => {
    const optionsWithIcons = [
      {label: 'Photoshop', value: 'PHSP', icon: <Photoshop />},
      {label: 'Lightroom', value: 'LTRM', icon: <Lightroom />},
      {label: 'Illustrator', value: 'ILST', icon: <Illustrator />},
      {label: 'Other', value: 'OTHER'}
    ];
    const tree = shallow(<Select options={optionsWithIcons} />);

    const selectMenu = tree.find(SelectMenu).prop('options');

    assert.equal(selectMenu.length, 4);
    assert.deepStrictEqual(selectMenu[0].icon, <Photoshop />);
    assert.equal(selectMenu[3].icon, null);

    const button = tree.find(Button);
    assert.deepStrictEqual(button.prop('icon'), <Photoshop />);
  });
});
