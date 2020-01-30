import {cleanup, fireEvent, render, waitForDomChange, within} from '@testing-library/react';
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
  ]},
  {name: 'Heading 2', children: [
    {name: 'Blah'},
    {name: 'Bleh'}
  ]}
];

function renderComponent(Component, contextProps = {}, props) {
  if (Component === V2Menu) {
    return render(
      <V2Menu id={menuId} {...props}>
        <V2MenuHeading>
          Heading 1
        </V2MenuHeading>
        <V2MenuItem role="menuitemradio">
          Foo
        </V2MenuItem>
        <V2MenuItem role="menuitemradio">
          Bar
        </V2MenuItem>
        <V2MenuItem role="menuitemradio">
          Baz
        </V2MenuItem>
        <V2MenuDivider />
        <V2MenuHeading>
          Heading 2
        </V2MenuHeading>
        <V2MenuItem role="menuitemradio">
          Blah
        </V2MenuItem>
        <V2MenuItem role="menuitemradio">
          Bleh
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
  let offsetWidth, offsetHeight;
  let onSelectionChange = jest.fn();

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => 1000);
  });

  beforeEach(() => {
  });
  
  afterEach(() => {
    onSelectionChange.mockClear();
    cleanup();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });
  
  it.each`
    Name        | Component | props
    ${'Menu'}   | ${Menu}   | ${{}}
    ${'V2Menu'} | ${V2Menu} | ${{}}
  `('$Name renders properly', async function ({Component}) {
    let tree = renderComponent(Component);
    await waitForDomChange();
    let menu = tree.getByRole('menu');
    expect(menu).toBeTruthy();
    if (Component === Menu) {
      expect(menu).toHaveAttribute('aria-orientation', 'vertical');
    }
    
    let headings = within(menu).getAllByRole('heading');
    expect(headings.length).toBe(2);

    for (let heading of headings) {
      expect(heading).toHaveAttribute('aria-level', '3');
    }
    let heading1 = within(menu).getByText('Heading 1');
    let heading2 = within(menu).getByText('Heading 2');
    expect(heading1).toBeTruthy();
    expect(heading2).toBeTruthy();

    let dividers = within(menu).getAllByRole('separator');
    expect(dividers.length).toBe(1);

    let items = within(menu).getAllByRole('menuitemradio');
    expect(items.length).toBe(5);
    for (let item of items) {
      expect(item).toHaveAttribute('tabindex');
      if (Component === Menu) {
        expect(item).toHaveAttribute('aria-checked');
        expect(item).toHaveAttribute('aria-disabled');
      }
      
    }
    let item1 = within(menu).getByText('Foo');
    let item2 = within(menu).getByText('Bar');
    let item3 = within(menu).getByText('Baz');
    let item4 = within(menu).getByText('Blah');
    let item5 = within(menu).getByText('Bleh');

    expect(item1).toBeTruthy();
    expect(item2).toBeTruthy();
    expect(item3).toBeTruthy();
    expect(item4).toBeTruthy();
    expect(item5).toBeTruthy();
    expect(item3).toBeTruthy();
  });
  
  describe('supports single selection', function () {
    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, defaultSelectedKeys: ['Blah']}}
    `('$Name supports defaultSelectedKeys (uncontrolled)', async function ({Component, props}) {
      // Check that correct menu item is selected by default
      let tree = renderComponent(Component, props);
      await waitForDomChange();
      let menu = tree.getByRole('menu');
      let menuItems = within(menu).getAllByRole('menuitemradio');
      let selectedItem = menuItems[3];
      expect(selectedItem).toBe(document.activeElement);
      expect(selectedItem).toHaveAttribute('aria-checked', 'true');
      expect(selectedItem).toHaveAttribute('tabindex', '0');
      let itemText = within(selectedItem).getByText('Blah');
      expect(itemText).toBeTruthy();
      let checkmark = within(selectedItem).getByRole('img');
      expect(checkmark).toBeTruthy();
    
      // Select a different menu item via enter
      let nextSelectedItem = menuItems[4];
      fireEvent.keyDown(nextSelectedItem, {key: 'Enter', code: 13, charCode: 13});
      expect(nextSelectedItem).toHaveAttribute('aria-checked', 'true');
      itemText = within(nextSelectedItem).getByText('Bleh');
      expect(itemText).toBeTruthy();
      checkmark = within(nextSelectedItem).getByRole('img');
      expect(checkmark).toBeTruthy();

      // Make sure there is only a single checkmark in the entire menu
      let checkmarks = tree.getAllByRole('img');
      expect(checkmarks.length).toBe(1);
    });

    it.each`
      Name        | Component | props
      ${'Menu'}   | ${Menu}   | ${{onSelectionChange, defaultSelectedKeys: ['Blah']}}
      ${'V2Menu'} | ${V2Menu} | ${{}}
    `('$Name allows user to change menu item focus via up/down arrow keys', async function ({Component, props}) {
     
    });
  });

  describe('supports multi selection', function () {

  });

  describe('supports no selection', function () {

  });
});
