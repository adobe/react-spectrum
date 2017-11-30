import assert from 'assert';
import Bell from '../../src/Icon/Bell';
import Bell18 from '@react/react-spectrum-icons/dist/Bell/18';
import Bell24 from '@react/react-spectrum-icons/dist/Bell/24';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';

describe('Icon', () => {
  it('supports icons', () => {
    const tree = shallow(<Bell />);
    assert.equal(tree.type(), Icon);
    assert.equal(typeof tree.prop('icon'), 'object');
  });

  it('supports multiple sizes', () => {
    const tree = shallow(<Icon icon={Bell18} size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-Icon spectrum-Icon--sizeL');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Icon icon={Bell18} className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-Icon spectrum-Icon--sizeM myClass');
  });

  it('switches between sizes appropriately', () => {
    let tree = shallow(<Icon icon={{18: Bell18, 24: Bell24}} size="L" />);
    assert.equal(tree.prop('viewBox'), Bell18.props.viewBox);

    tree = shallow(<Icon icon={{18: Bell18, 24: Bell24}} size="M" />);
    assert.equal(tree.prop('viewBox'), Bell24.props.viewBox);
  });
});
