import {cleanup, fireEvent, render, waitForElement} from '@testing-library/react';
import React from 'react';
import {Tab, TabList} from '../';

afterEach(cleanup);

it('tab list test with Jest and react testing library', async function () {
  let spy = jest.fn(() => {});
  let {getByText, getAllByRole} = render(
    <TabList onSelectionChange={spy}>
      <Tab label="Tab 1" value="val1" />
      <Tab label="Tab 2" value="val2" />
      <Tab label="Tab 3" value="val3" />
    </TabList>
   );
  await waitForElement(() => getByText('Tab 1'));
  let tabs = getAllByRole('tab');
  fireEvent.click(getByText('Tab 3'));
  expect(spy.mock.calls.length).toBe(1);
  expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
});
