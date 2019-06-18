/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import {SideNavHeading, SideNavItem} from '../../src/SideNav';

const render = (props = {}) => shallow(<SideNavHeading {...props} />).dive();

describe('SideNavHeading', () => {
  it('renders an li with correct className', () => {
    let tree = render();
    assert.equal(tree.type(), 'li');
    assert.equal(tree.find('.spectrum-SideNav-item').length, 1);
  });

  it('supports className as prop', () => {
    let tree = render({className: 'test-nav-heading'});
    assert.equal(tree.find('.test-nav-heading').length, 1);
  });

  it('supports extra props', () => {
    let tree = render({'aria-custom': 'value'});
    assert.equal(tree.find('li').prop('aria-custom'), 'value');
  });

  it('label is shown correctly via label prop', () => {
    let tree = render({label: 'Item label'});
    assert.equal(tree.find('h2').prop('children'), 'Item label');
  });

  it('renders a nested sidenav', () => {
    let tree = shallow(
      <SideNavHeading label="Nested">
        <SideNavItem value="dc">Document Clouds</SideNavItem>
        <SideNavItem value="cc">Creative Cloud</SideNavItem>
      </SideNavHeading>
    );
    assert.equal(tree.dive().find('SideNav').length, 1);
  });
});
