import {cleanup, render} from '@testing-library/react';
import {Item, Menu, Section} from '../';
import {MenuContext} from '../src/context';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {Menu as V2Menu, MenuDivider as V2MenuDivider, MenuHeading as V2MenuHeading, MenuItem as V2MenuItem} from '@react/react-spectrum/Menu';

let menuId = 'menu-id';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

let withSection = [
  {name: 'Heading 1', children: [
    {name: 'Foo'},
    {name: 'Bar'},
    {name: 'Baz'}
  ]}
];

function renderComponent(Component, contextProps = {}, props) {
  if (Component === V2Menu) {
    return render(
      <V2Menu id={menuId} {...props}>
        <V2MenuHeading>
          Heading 1
        </V2MenuHeading>
        <V2MenuDivider />
        <V2MenuItem role="menuitem">
          Foo
        </V2MenuItem>
        <V2MenuItem role="menuitem">
          Bar
        </V2MenuItem>
        <V2MenuItem role="menuitem">
          Baz
        </V2MenuItem>
      </V2Menu>
    );
  } else {
    return render(
      <Provider theme={theme}>
        <MenuContext.Provider value={contextProps}>
          <Menu id={menuId} items={withSection} itemKey="name" {...props}>
            {item => (
              <Section items={item.children} title={item.name}>
                {item => <Item childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuContext.Provider>
      </Provider>
    );
  }
}

describe('Menu', function () {
  let onSelectionChange = jest.fn();

  beforeEach(() => {
  });
  
  afterEach(() => {
    onSelectionChange.mockClear();
    cleanup();
  });
  
  // Temp test, need to figure out why react testing library doesn't render all of the V3 menu items
  it.each`
    Name        | Component | props
    ${'Menu'}   | ${Menu}   | ${{}}
    ${'V2Menu'} | ${V2Menu} | ${{}}
  `('$Name has default behavior', async function ({Component}) {
    let tree = renderComponent(Component);
    let item1 = tree.getByText('Foo');
    expect(item1).toBeTruthy();
  });
});
