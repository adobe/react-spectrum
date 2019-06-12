import assert from 'assert';
import Progress from '../../src/Progress';
import React from 'react';
import {shallow} from 'enzyme';

describe('Progress', () => {
  it('default', () => {
    const tree = shallow(<Progress />);
    assert.equal(tree.hasClass('spectrum-BarLoader'), true);
    assert.equal(tree.hasClass('spectrum-BarLoader--medium'), true);
    assert.equal(tree.hasClass('spectrum-BarLoader--sideLabel'), true);
    assert.equal(tree.prop('role'), 'progressbar');
    assert.equal(tree.prop('aria-valuemin'), 0);
    assert.equal(tree.prop('aria-valuemax'), 100);
    assert.equal(tree.prop('aria-valuenow'), 0);
    assert.equal(tree.prop('aria-valuetext'), '0%');

    const bar = tree.find('.spectrum-BarLoader-track');
    assert.equal(bar.prop('className'), 'spectrum-BarLoader-track');
    const status = findStatus(tree);
    assert.equal(status.prop('className'), 'spectrum-BarLoader-fill');
    assert.deepEqual(status.prop('style'), {width: '0%'});

    assert(!tree.find('.spectrum-BarLoader-label').length);
  });

  describe('value', () => {
    it('updates all the fields', () => {
      const tree = shallow(<Progress value={30} showPercent />);
      assert.equal(tree.prop('aria-valuenow'), 30);
      assert.equal(tree.prop('aria-valuetext'), '30%');
      assert.deepEqual(findStatus(tree).prop('style'), {width: '30%'});
      assert.equal(tree.find('.spectrum-BarLoader-percentage').text(), '30%');
    });

    it('clamps values to 0-100', () => {
      const tree = shallow(<Progress value={10000} showPercent />);
      assert.equal(tree.prop('aria-valuenow'), 100);
      assert.equal(tree.prop('aria-valuetext'), '100%');
      assert.deepEqual(findStatus(tree).prop('style'), {width: '100%'});
      assert.equal(tree.find('.spectrum-BarLoader-percentage').text(), '100%');

      tree.setProps({value: -1});
      assert.equal(tree.prop('aria-valuenow'), 0);
      assert.equal(tree.prop('aria-valuetext'), '0%');
      assert.deepEqual(findStatus(tree).prop('style'), {width: '0%'});
      assert.equal(tree.find('.spectrum-BarLoader-percentage').text(), '0%');
    });
  });

  it('supports multiple sizes', () => {
    const tree = shallow(<Progress size="S" />);
    assert.equal(tree.hasClass('spectrum-BarLoader--small'), true);
  });

  describe('label', () => {
    it('supports showPercent', () => {
      const tree = shallow(<Progress showPercent />);
      const label = tree.find('.spectrum-BarLoader-percentage');
      assert(label.getElement());
      assert.equal(label.text(), '0%');

      tree.setProps({value: 50});
      assert.equal(tree.find('.spectrum-BarLoader-percentage').text(), '50%');
    });

    it('supports labelPosition', () => {
      const tree = shallow(<Progress showPercent labelPosition="left" />);
      assert.equal(tree.hasClass('spectrum-BarLoader--sideLabel'), true);
      tree.setProps({labelPosition: 'top'});
      assert.equal(tree.hasClass('spectrum-BarLoader--sideLabel'), false);
    });

    it('supports variant = overBackground', () => {
      const tree = shallow(<Progress showPercent variant="overBackground" />);
      assert.equal(tree.hasClass('spectrum-BarLoader--overBackground'), true);
      tree.setProps({variant: undefined});
      assert.equal(tree.hasClass('spectrum-BarLoader--overBackground'), false);
    });

    it('supports custom labels', () => {
      const tree = shallow(<Progress label="foo" />);
      assert.equal(findLabel(tree).text(), 'foo');
      assert.equal(tree.prop('aria-labelledby'), findLabel(tree).prop('id'));
    });

    it('supports aria-label and aria-labelledby', () => {
      const labelId = 'label-id';
      const labelTxt = 'foo';
      let tree = shallow(<Progress aria-labelledby={labelId} />);
      assert.equal(tree.prop('aria-labelledby'), labelId);

      // labelled by an external label and aria-label
      tree.setProps({'aria-label': labelTxt});
      assert.equal(
        tree.prop('aria-labelledby'),
        labelId + ' ' + tree.prop('id'));
      assert.equal(
        tree.prop('aria-label'),
        labelTxt);

      // labelled by an external label and a label prop
      tree.setProps({'aria-label': null, 'label': labelTxt});
      assert.equal(
        tree.prop('aria-labelledby'),
        labelId + ' ' + findLabel(tree).prop('id'));

      // labelled by just aria-label
      tree = shallow(<Progress aria-label={labelTxt} />);
      assert.equal(
        tree.prop('aria-labelledby'),
        null);
      assert.equal(
        tree.prop('aria-label'),
        labelTxt);
    });
  });

  it('supports different variants', () => {
    let tree = shallow(<Progress variant="positive" value={50} />);
    assert.equal(tree.hasClass('is-positive'), true);
    tree = shallow(<Progress variant="warning" value={50} />);
    assert.equal(tree.hasClass('is-warning'), true);
    tree = shallow(<Progress variant="critical" value={50} />);
    assert.equal(tree.hasClass('is-critical'), true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Progress className="myClass" />);
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Progress aria-valuetext="halfway there!" />);
    assert.equal(tree.prop('aria-valuetext'), 'halfway there!');
  });

  it('supports indeterminate', () => {
    const tree = shallow(<Progress isIndeterminate />);
    assert.equal(tree.hasClass('spectrum-BarLoader--indeterminate'), true);
    assert.equal(tree.find('.spectrum-BarLoader-fill').prop('style'), null);
    assert.equal(tree.prop('role'), 'progressbar');
    assert.equal(tree.prop('aria-valuemin'), null);
    assert.equal(tree.prop('aria-valuemax'), null);
    assert.equal(tree.prop('aria-valuenow'), null);
    assert.equal(tree.prop('aria-valuetext'), null);
  });

  it('supports raw values for min, max, and value', () => {
    const props = {
      min: 50,
      max: 200,
      value: 100
    };
    const {
      min,
      max,
      value,
      percentage = 100 * value / (max - min)
    } = props;

    const tree = shallow(<Progress {...props} showPercent />);
    assert.deepEqual(tree.find('.spectrum-BarLoader-fill').prop('style'), {width: `${percentage}%`});
    assert.equal(tree.prop('role'), 'progressbar');
    assert.equal(tree.prop('aria-valuemin'), min);
    assert.equal(tree.prop('aria-valuemax'), max);
    assert.equal(tree.prop('aria-valuenow'), value);
    assert.equal(tree.prop('aria-valuetext'), `${Math.round(percentage * 10) / 10}%`);
    assert.equal(tree.find('.spectrum-BarLoader-percentage').text(), `${Math.round(percentage)}%`);
  });
});

const findStatus = tree => tree.find('.spectrum-BarLoader-fill');
const findLabel = tree => tree.find('.spectrum-BarLoader-label');
