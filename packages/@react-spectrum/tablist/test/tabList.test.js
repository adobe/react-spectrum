import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import {Tab, TabList} from '@react-spectrum/tablist';

afterEach(cleanup);

it('tab list test with Jest and react testing library', async function () {
  let spy = jest.fn(() => {});
  let {getByText, getAllByRole} = render(
    <TabList onChange={spy}>
      <Tab label="Tab 1" />
      <Tab label="Tab 2" />
      <Tab label="Tab 3" />
    </TabList>
   );
  await waitForElement(() => getByText('Tab 1'));
  let tabs = getAllByRole('tab');
  fireEvent.click(getByText('Tab 3'));
  expect(spy.mock.calls.length).toBe(1);
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
});

