/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, triggerPress, within} from '@react-spectrum/test-utils';
import {Card, CardView, GalleryLayout, GridLayout, WaterfallLayout} from '../';
import {composeStories} from '@storybook/testing-react';
import {Content} from '@react-spectrum/view';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Provider} from '@react-spectrum/provider';
import React, {useMemo} from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import * as stories from '../stories/GridCardView.stories';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {useCollator} from '@react-aria/i18n';
import userEvent from '@testing-library/user-event';

let {falsyItems} = stories;
let {FalsyIds} = composeStories(stories);

let theme = {
  light: themeLight,
  medium: scaleMedium
};

let defaultItems = [
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Title 1'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Title 2'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Title 3'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Title 4'},
  {width: 640, height: 640, src: 'https://i.imgur.com/DhygPot.jpg', title: 'Title 5'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Title 6'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Title 7'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Title 8'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Title 9'},
  {width: 1516, height: 1009, src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Title 10'},
  {width: 314, height: 1009, src: 'https://i.imgur.com/L7RTlvI.png', title: 'Title 11'},
  {width: 1001, height: 381, src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Title 12'}
];

let itemsNoSize = [
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Title 1'},
  {src: 'https://i.imgur.com/DhygPot.jpg', title: 'Title 2'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Title 3'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Title 4'},
  {src: 'https://i.imgur.com/DhygPot.jpg', title: 'Title 5'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Title 6'},
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Title 7'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Title 8'},
  {src: 'https://i.imgur.com/zzwWogn.jpg', title: 'Title 9'},
  {src: 'https://i.imgur.com/1nScMIH.jpg', title: 'Title 10'},
  {src: 'https://i.imgur.com/L7RTlvI.png', title: 'Title 11'},
  {src: 'https://i.imgur.com/Z7AzH2c.jpg', title: 'Title 12'}
];

let mockHeight = 800;
let mockWidth = 800;
let onSelectionChange = jest.fn();
let getCardStyles = (card) => card.parentNode.parentNode.style;

function StaticCardView(props) {
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let gridLayout = useMemo(() => new GridLayout({collator}), [collator]);
  let {
    layout = gridLayout,
    selectionMode = 'multiple',
    locale = 'en-US',
    ...otherProps
  } = props;

  return (
    <Provider theme={theme} locale={locale}>
      <CardView onSelectionChange={onSelectionChange} {...otherProps} selectionMode={selectionMode} layout={layout} width="100%" height="100%" aria-label="Test CardView">
        <Card width={1001} height={381} textValue="Title  1">
          <Image src="https://i.imgur.com/Z7AzH2c.jpg" />
          <Heading>Title  1</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
        </Card>
        <Card width={640} height={640} textValue="Title  1">
          <Image src="https://i.imgur.com/DhygPot.jpg" />
          <Heading>Title  1</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
        </Card>
        <Card width={182} height={1009} textValue="Title  1">
          <Image src="https://i.imgur.com/L7RTlvI.png" />
          <Heading>Title  1</Heading>
          <Text slot="detail">PNG</Text>
          <Content>Description</Content>
        </Card>
      </CardView>
    </Provider>
  );
}

function DynamicCardView(props) {
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let cardOrientation = props.cardOrientation || 'vertical';
  let gridLayout = useMemo(() => new GridLayout({collator, cardOrientation}), [collator, cardOrientation]);
  let {
    layout = gridLayout,
    selectionMode = 'multiple',
    items = defaultItems,
    locale = 'en-US',
    ...otherProps
  } = props;

  return (
    <Provider theme={theme} locale={locale}>
      <CardView onSelectionChange={onSelectionChange} {...otherProps} selectionMode={selectionMode} items={items} layout={layout} width="100%" height="100%" aria-label="Test CardView">
        {(item) => (
          <Card key={item.title} textValue={item.title} width={item.width} height={item.height}>
            <Image src={item.src} />
            <Heading>{item.title}</Heading>
            <Text slot="detail">PNG</Text>
            <Content>Description</Content>
          </Card>
        )}
      </CardView>
    </Provider>
  );
}

describe('CardView', function () {
  beforeAll(function () {
    jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => mockWidth);
    jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => mockHeight);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  // TODO: add tests for card sizes, layouts with non-default options
  it.each`
    Name                  | layout
    ${'Grid layout'}      | ${GridLayout}
    ${'Gallery layout'}   | ${GalleryLayout}
    ${'Waterfall layout'} | ${WaterfallLayout}
  `('$Name CardView supports static cards', function ({Name, layout}) {
    let tree = render(<StaticCardView layout={layout} />);
    act(() => {
      jest.runAllTimers();
    });

    let grid = tree.getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-label', 'Test CardView');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '1');

    let rowgroups = within(grid).getAllByRole('row');
    expect(rowgroups).toHaveLength(3);

    for (let [index, row] of rowgroups.entries()) {
      expect(row).toHaveAttribute('aria-rowindex', (index + 1).toString());
      let cell = within(row).getByRole('gridcell');
      expect(cell).toBeTruthy();

      let image = within(cell).getByRole('img');
      expect(image).toHaveAttribute('src');
      expect(within(cell).getByText('Description')).toBeTruthy();
      expect(within(cell).getByText('PNG')).toBeTruthy();
      expect(within(cell).getByText('Title', {exact: false})).toBeTruthy();
    }
  });

  it.each`
    Name                  | layout
    ${'Grid layout'}      | ${GridLayout}
    ${'Gallery layout'}   | ${GalleryLayout}
    ${'Waterfall layout'} | ${WaterfallLayout}
  `('$Name CardView supports dynamic cards', function ({Name, layout}) {
    let tree = render(<DynamicCardView layout={layout} />);
    act(() => {
      jest.runAllTimers();
    });

    let grid = tree.getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-label', 'Test CardView');
    expect(grid).toHaveAttribute('aria-rowcount', defaultItems.length.toString());
    expect(grid).toHaveAttribute('aria-colcount', '1');

    let rowgroups = within(grid).getAllByRole('row');
    for (let [index, row] of rowgroups.entries()) {
      expect(row).toHaveAttribute('aria-rowindex', (index + 1).toString());
      let cell = within(row).getByRole('gridcell');
      expect(cell).toBeTruthy();

      let image = within(cell).getByRole('img');
      expect(image).toHaveAttribute('src');
      expect(within(cell).getByText('Description')).toBeTruthy();
      expect(within(cell).getByText('PNG')).toBeTruthy();
      expect(within(cell).getByText('Title', {exact: false})).toBeTruthy();
    }
  });

  it.each`
    Name                  | layout
    ${'Grid layout'}      | ${GridLayout}
    ${'Gallery layout'}   | ${GalleryLayout}
    ${'Waterfall layout'} | ${WaterfallLayout}
  `('$Name CardView supports falsy ids', function ({layout}) {
    let tree = render(
      <Provider theme={theme} locale="en-US">
        <FalsyIds items={falsyItems} aria-label="test falsy" layout={layout} />
      </Provider>
    );
    act(() => {
      jest.runAllTimers();
    });
    let grid = tree.getByRole('grid');
    let rowgroups = within(grid).getAllByRole('row');
    expect(rowgroups).toHaveLength(falsyItems.length);
    for (let row of rowgroups) {
      let cell = within(row).getByRole('gridcell');
      expect(cell).toBeTruthy();

      let image = within(cell).getByRole('img');
      expect(image).toHaveAttribute('src');
      expect(within(cell).getByText('long description', {exact: false})).toBeTruthy();
      expect(within(cell).getByText('PNG')).toBeTruthy();
    }
  });

  describe('Grid layout and some shared gallery layout behavior', function () {
    it.each`
      cardOrientation
      ${'vertical'}
      ${'horizontal'}
    `('grid layout CardView renders each card with the same height and width (card orientation: $cardOrientation)', function ({cardOrientation}) {
      let tree = render(<DynamicCardView cardOrientation={cardOrientation} />);
      act(() => {
        jest.runAllTimers();
      });

      let grid = tree.getByRole('grid');
      let wrappers = within(grid).getAllByRole('presentation');
      let currentTop;
      let currentLeft;
      let expectedWidth;
      let expectedHeight;
      let expectedSpacing;
      for (let [index, div] of wrappers.entries()) {
        if (index === 0) {
          continue;
        }

        if (!expectedWidth) {
          currentTop = div.style.top;
          currentLeft = div.style.left;
          expectedWidth = div.style.width;
          expectedHeight = div.style.height;

          // Calculate the horizontal spacing between the cards based off the available width and number of cards
          if (!expectedSpacing) {
            let cardsInRow = Math.floor((mockWidth - 24 * 2) /  parseInt(expectedWidth, 10));
            if (cardsInRow > 1) {
              expectedSpacing = (mockWidth - (24 * 2) - (cardsInRow *  parseInt(expectedWidth, 10))) / (cardsInRow - 1);
            } else {
              expectedSpacing = 0;
            }
          }

          // default margin size is 24px
          expect(div.style.top).toEqual('24px');
          expect(div.style.left).toEqual('24px');
        } else {
          expect(div.style.width).toEqual(expectedWidth);
          expect(div.style.height).toEqual(expectedHeight);
          if (currentTop === div.style.top) {
            currentLeft = `${parseInt(currentLeft, 10) + parseInt(expectedWidth, 10) + expectedSpacing}px`;
          } else {
            // default space between the two cards vertically is 18px
            currentTop = `${parseInt(currentTop, 10) + parseInt(expectedHeight, 10) + 18}px`;
            currentLeft = '24px';
            expect(div.style.top).toEqual(currentTop);
          }
          expect(div.style.left).toEqual(currentLeft);
        }
      }

      if (cardOrientation === 'horizontal') {
        expect(expectedWidth > expectedHeight).toBeTruthy();
      } else {
        expect(expectedHeight > expectedWidth).toBeTruthy();
      }
    });

    describe('keyboard nav', function () {
      it('should move focus via Arrow Down', function () {
        let tree = render(<DynamicCardView />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[1]);
        expect(document.activeElement).toBe(cards[1]);
        let cardStyles = getCardStyles(cards[1]);
        let expectedLeft = cardStyles.left;
        let expectedTop = `${parseInt(cardStyles.top, 10) + parseInt(cardStyles.height, 10) + 18}px`;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it('should move focus via Arrow Up', function () {
        let tree = render(<DynamicCardView />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[5]);
        expect(document.activeElement).toBe(cards[5]);
        let cardStyles = getCardStyles(cards[5]);
        let expectedLeft = cardStyles.left;
        let expectedTop = `${parseInt(cardStyles.top, 10) - parseInt(cardStyles.height, 10) - 18}px`;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it.each`
        Name                  | layout
        ${'Grid layout'}      | ${GridLayout}
        ${'Gallery layout'}   | ${GalleryLayout}
      `('$Name CardView should move focus via Arrow Left', function ({Name, layout}) {
        let tree = render(<DynamicCardView layout={layout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[1]);
        expect(document.activeElement).toBe(cards[1]);
        let cardStyles = getCardStyles(cards[1]);
        let expectedLeft = cardStyles.left;
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[0]);
        cardStyles = getCardStyles(document.activeElement);
        // horizontal spacing in grid is minimum 18px, but in this specific setup the calculated horizontal spacing is 19px due to margins
        let horizontalSpacing = Name === 'Grid layout' ? 19 : 18;
        expectedLeft = `${parseInt(expectedLeft, 10) - parseInt(cardStyles.width, 10) - horizontalSpacing}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it.each`
        Name                  | layout
        ${'Grid layout'}      | ${GridLayout}
        ${'Gallery layout'}   | ${GalleryLayout}
      `('$Name CardView should move focus via Arrow Left (RTL)', function ({Name, layout}) {
        let tree = render(<DynamicCardView locale="ar-AE" layout={layout} />);
        act(() => {
          jest.runAllTimers();
        });

        let expectedRight;
        let expectedTop;
        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[0]);
        expect(document.activeElement).toBe(cards[0]);
        let cardStyles = getCardStyles(cards[0]);
        expectedRight = cardStyles.right;
        expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[1]);
        // horizontal spacing in grid is minimum 18px, but in this specific setup the calculated horizontal spacing is 19px due to margins
        let horizontalSpacing = Name === 'Grid layout' ? 19 : 18;
        expectedRight = `${parseInt(expectedRight, 10) + parseInt(cardStyles.width, 10) + horizontalSpacing}px`;
        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.right).toEqual(expectedRight);
      });

      it.each`
        Name                  | layout
        ${'Grid layout'}      | ${GridLayout}
        ${'Gallery layout'}   | ${GalleryLayout}
      `('$Name CardView should move focus via Arrow Right', function ({Name, layout}) {
        let tree = render(<DynamicCardView layout={layout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[0]);
        expect(document.activeElement).toBe(cards[0]);
        let cardStyles = getCardStyles(cards[0]);
        let expectedLeft = cardStyles.left;
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[1]);
        // horizontal spacing in grid is minimum 18px, but in this specific setup the calculated horizontal spacing is 19px due to margins
        let horizontalSpacing = Name === 'Grid layout' ? 19 : 18;
        expectedLeft = `${parseInt(expectedLeft, 10) + parseInt(cardStyles.width, 10) + horizontalSpacing}px`;
        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it.each`
        Name                  | layout
        ${'Grid layout'}      | ${GridLayout}
        ${'Gallery layout'}   | ${GalleryLayout}
      `('$Name CardView should move focus via Arrow Right (RTL)', function ({Name, layout}) {
        let tree = render(<DynamicCardView locale="ar-AE" layout={layout} />);
        act(() => {
          jest.runAllTimers();
        });

        let expectedRight;
        let expectedTop;
        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[1]);
        expect(document.activeElement).toBe(cards[1]);
        let cardStyles = getCardStyles(cards[1]);
        expectedRight = cardStyles.right;
        expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[0]);
        cardStyles = getCardStyles(document.activeElement);
        // horizontal spacing in grid is minimum 18px, but in this specific setup the calculated horizontal spacing is 19px due to margins
        let horizontalSpacing = Name === 'Grid layout' ? 19 : 18;
        expectedRight = `${parseInt(expectedRight, 10) - parseInt(cardStyles.width, 10) - horizontalSpacing}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.right).toEqual(expectedRight);
      });

      it('should move focus via Page Up', function () {
        let tree = render(<DynamicCardView />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[5]);

        fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
        fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});
        act(() => {
          jest.runAllTimers();
        });

        cards = tree.getAllByRole('gridcell');
        expect(document.activeElement).toBe(cards[cards.length - 1]);
        let cardStyles = getCardStyles(document.activeElement);
        let expectedLeft = cardStyles.left;

        let numCardsInPage = Math.floor(mockHeight / (parseInt(cardStyles.height, 10) + 18));
        let expectedTop = `${parseInt(cardStyles.top, 10) - numCardsInPage * (parseInt(cardStyles.height, 10) + 18)}px`;

        fireEvent.keyDown(document.activeElement, {key: 'PageUp', code: 33, charCode: 33});
        fireEvent.keyUp(document.activeElement, {key: 'PageUp', code: 33, charCode: 33});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it('should move focus via Page Down', function () {
        let tree = render(<DynamicCardView />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[1]);

        expect(document.activeElement).toBe(cards[1]);
        let cardStyles = getCardStyles(document.activeElement);
        let expectedLeft = cardStyles.left;

        let numCardsInPage = Math.floor(mockHeight / (parseInt(cardStyles.height, 10) + 18));
        let expectedTop = `${parseInt(cardStyles.top, 10) + numCardsInPage * (parseInt(cardStyles.height, 10) + 18)}px`;

        fireEvent.keyDown(document.activeElement, {key: 'PageDown', code: 34, charCode: 34});
        fireEvent.keyUp(document.activeElement, {key: 'PageDown', code: 34, charCode: 34});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });
    });
  });

  describe('Gallery layout', function () {
    it('renders cards in rows with constrained heights and variable widths', function () {
      let tree = render(<DynamicCardView layout={GalleryLayout} />);
      act(() => {
        jest.runAllTimers();
      });

      let grid = tree.getByRole('grid');
      let wrappers = within(grid).getAllByRole('presentation');
      let currentTop;
      let expectedLeft;
      let expectedHeight;
      for (let [index, div] of wrappers.entries()) {
        if (index === 0) {
          continue;
        }

        if (!expectedHeight) {
          currentTop = div.style.top;
          expectedHeight = div.style.height;
          expect(div.style.top).toEqual('24px');
          expect(div.style.left).toEqual('24px');

          expectedLeft = `${parseInt(div.style.left, 10) + parseInt(div.style.width, 10) + 18}px`;
        } else {
          if (currentTop === div.style.top) {
            expect(div.style.left).toEqual(expectedLeft);
          } else {
            currentTop = div.style.top;
            // If new row, get new expected height since it can change from row to row
            expectedHeight = div.style.height;
            expect(div.style.left).toEqual('24px');
          }
          expect(div.style.height).toEqual(expectedHeight);
          expectedLeft = `${parseInt(div.style.left, 10) + parseInt(div.style.width, 10) + 18}px`;
        }
      }
    });

    describe('keyboard nav', function () {
      it('should move focus via Arrow Down', function () {
        let tree = render(<DynamicCardView layout={GalleryLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[0]);
        expect(document.activeElement).toBe(cards[0]);
        expect(within(document.activeElement).getByText('Title 1')).toBeTruthy();

        let cardStyles = getCardStyles(cards[0]);
        let expectedTop = `${parseInt(cardStyles.top, 10) + parseInt(cardStyles.height, 10) + 18}px`;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(within(document.activeElement).getByText('Title 4')).toBeTruthy();
      });

      it('should move focus via Arrow Up', function () {
        let tree = render(<DynamicCardView layout={GalleryLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[3]);
        expect(document.activeElement).toBe(cards[3]);
        expect(within(document.activeElement).getByText('Title 4')).toBeTruthy();

        let cardStyles = getCardStyles(cards[3]);
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expectedTop = `${parseInt(expectedTop, 10) - parseInt(cardStyles.height, 10) - 18}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(within(document.activeElement).getByText('Title 1')).toBeTruthy();
      });

      it('should move focus via Page Up', function () {
        let tree = render(<DynamicCardView layout={GalleryLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[0]);

        fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
        fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});
        act(() => {
          jest.runAllTimers();
        });

        fireEvent.keyDown(document.activeElement, {key: 'PageUp', code: 33, charCode: 33});
        fireEvent.keyUp(document.activeElement, {key: 'PageUp', code: 33, charCode: 33});
        act(() => {
          jest.runAllTimers();
        });

        let pageUpElement = document.activeElement;

        fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
        fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});
        act(() => {
          jest.runAllTimers();
        });

        let cardStyles = getCardStyles(document.activeElement);
        let numCardsInPage = Math.floor(mockHeight / (parseInt(cardStyles.height, 10) + 32));

        for (let i = 0; i < numCardsInPage; i++) {
          fireEvent.keyDown(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
          fireEvent.keyUp(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
          act(() => {
            jest.runAllTimers();
          });
        }

        expect(document.activeElement).toEqual(pageUpElement);
      });

      it('should move focus via Page Down', function () {
        let tree = render(<DynamicCardView layout={GalleryLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[0]);

        fireEvent.keyDown(document.activeElement, {key: 'PageDown', code: 34, charCode: 34});
        fireEvent.keyUp(document.activeElement, {key: 'PageDown', code: 34, charCode: 34});
        act(() => {
          jest.runAllTimers();
        });

        let pageDownElement = document.activeElement;

        fireEvent.keyDown(document.activeElement, {key: 'Home', code: 36, charCode: 36});
        fireEvent.keyUp(document.activeElement, {key: 'Home', code: 36, charCode: 36});
        act(() => {
          jest.runAllTimers();
        });

        let cardStyles = getCardStyles(document.activeElement);
        let numCardsInPage = Math.floor(mockHeight / (parseInt(cardStyles.height, 10) + 18));

        for (let i = 0; i < numCardsInPage; i++) {
          fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
          fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
          act(() => {
            jest.runAllTimers();
          });
        }

        expect(document.activeElement).toEqual(pageDownElement);
      });
    });
  });

  describe('Waterfall layout', function () {
    it.each`
      Name                         | items
      ${'no item widths provided'} | ${itemsNoSize}
      ${'item widths provided'}    | ${defaultItems}
    `('with ${Name}, renders cards in columns with constrained widths and variable heights', function ({items}) {
      let tree = render(<DynamicCardView layout={WaterfallLayout} items={items} />);
      act(() => {
        jest.runAllTimers();
      });

      let grid = tree.getByRole('grid');
      let wrappers = within(grid).getAllByRole('presentation');
      let expectedWidth;
      let columnLefts = [];
      let columnHeights = [];
      for (let [index, div] of wrappers.entries()) {
        if (index === 0) {
          continue;
        }

        if (!expectedWidth) {
          expectedWidth = div.style.width;
          expect(div.style.top).toEqual('24px');
          expect(div.style.left).toEqual('24px');
          columnLefts.push(div.style.left);

          let expectedHeight = `${parseInt(div.style.top, 10) + parseInt(div.style.height, 10) + 18}px`;
          columnHeights.push(expectedHeight);
        } else {
          expect(div.style.width).toEqual(expectedWidth);

          // Make sure each item is within one of the columns of the waterfall and check the positioning
          if (div.style.top === '24px') {
            columnLefts.push(div.style.left);
            let expectedHeight = `${parseInt(div.style.top, 10) + parseInt(div.style.height, 10) + 18}px`;
            columnHeights.push(expectedHeight);
          } else {
            let index = columnLefts.indexOf(div.style.left);
            expect(index).not.toEqual(-1);
            expect(columnHeights[index]).toEqual(div.style.top);
            columnHeights[index] = `${parseInt(div.style.top, 10) + parseInt(div.style.height, 10) + 18}px`;
          }
        }
      }
    });

    describe('keyboard nav', function () {
      it('should move focus via Arrow Down', function () {
        let tree = render(<DynamicCardView layout={WaterfallLayout} />);
        act(() => jest.runAllTimers()); // relayout raf
        act(() => jest.runAllTimers()); // update size

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[0]);
        expect(document.activeElement).toBe(cards[0]);
        expect(within(document.activeElement).getByText('Title 1')).toBeTruthy();

        let cardStyles = getCardStyles(cards[0]);
        let expectedTop = `${parseInt(cardStyles.top, 10) + parseInt(cardStyles.height, 10) + 18}px`;
        let expectedLeft = cardStyles.left;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
        expect(within(document.activeElement).getByText('Title 3')).toBeTruthy();
      });

      it('should move focus via Arrow Up', function () {
        let tree = render(<DynamicCardView layout={WaterfallLayout} />);
        act(() => jest.runAllTimers()); // relayout raf
        act(() => jest.runAllTimers()); // update size

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[2]);
        expect(document.activeElement).toBe(cards[2]);
        expect(within(document.activeElement).getByText('Title 3')).toBeTruthy();

        let cardStyles = getCardStyles(cards[2]);
        let expectedTop = cardStyles.top;
        let expectedLeft = cardStyles.left;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowUp', code: 38, charCode: 38});
        act(() => {
          jest.runAllTimers();
        });

        cardStyles = getCardStyles(document.activeElement);
        expectedTop = `${parseInt(expectedTop, 10) - parseInt(cardStyles.height, 10) - 18}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
        expect(within(document.activeElement).getByText('Title 1')).toBeTruthy();
      });

      it('should move focus via Arrow Left', function () {
        let tree = render(<DynamicCardView layout={WaterfallLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[1]);
        act(() => {
          jest.runAllTimers();
        });
        expect(document.activeElement).toBe(cards[1]);
        let cardStyles = getCardStyles(cards[1]);
        let expectedLeft = cardStyles.left;
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[0]);
        cardStyles = getCardStyles(document.activeElement);
        expectedLeft = `${parseInt(expectedLeft, 10) - parseInt(cardStyles.width, 10) - 18}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it('should move focus via Arrow Left (RTL)', function () {
        let tree = render(<DynamicCardView locale="ar-AE" layout={WaterfallLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');
        triggerPress(cards[0]);
        act(() => {
          jest.runAllTimers();
        });
        expect(document.activeElement).toBe(cards[0]);
        let cardStyles = getCardStyles(cards[0]);
        let expectedRight = cardStyles.right;
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowLeft', code: 37, charCode: 37});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[1]);
        cardStyles = getCardStyles(document.activeElement);
        expectedRight = `${parseInt(expectedRight, 10) + parseInt(cardStyles.width, 10) + 18}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.right).toEqual(expectedRight);
      });

      it('should move focus via Arrow Right', function () {
        let tree = render(<DynamicCardView layout={WaterfallLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[0]);
        act(() => {
          jest.runAllTimers();
        });
        expect(document.activeElement).toBe(cards[0]);
        let cardStyles = getCardStyles(cards[0]);
        let expectedLeft = cardStyles.left;
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[1]);
        cardStyles = getCardStyles(document.activeElement);
        expectedLeft = `${parseInt(expectedLeft, 10) + parseInt(cardStyles.width, 10) + 18}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.left).toEqual(expectedLeft);
      });

      it('should move focus via Arrow Right (RTL)', function () {
        let tree = render(<DynamicCardView locale="ar-AE" layout={WaterfallLayout} />);
        act(() => {
          jest.runAllTimers();
        });

        let cards = tree.getAllByRole('gridcell');

        triggerPress(cards[1]);
        act(() => {
          jest.runAllTimers();
        });
        expect(document.activeElement).toBe(cards[1]);
        let cardStyles = getCardStyles(cards[1]);
        let expectedRight = cardStyles.right;
        let expectedTop = cardStyles.top;

        fireEvent.keyDown(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        fireEvent.keyUp(document.activeElement, {key: 'ArrowRight', code: 39, charCode: 39});
        act(() => {
          jest.runAllTimers();
        });

        expect(document.activeElement).toBe(cards[0]);
        cardStyles = getCardStyles(document.activeElement);
        expectedRight = `${parseInt(expectedRight, 10) - parseInt(cardStyles.width, 10) - 18}px`;
        expect(cardStyles.top).toEqual(expectedTop);
        expect(cardStyles.right).toEqual(expectedRight);
      });

      // TODO: Can't test PageUp/Down of WaterfallLayout because it is setting the heights of the items to 0. Figure out why
      // seems to be the updateItemSize
    });
  });

  describe('common keyboard nav', function () {
    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should move focus via Home', function ({layout}) {
      let tree = render(<DynamicCardView layout={layout} />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[2]);
      expect(document.activeElement).toBe(cards[2]);

      fireEvent.keyDown(document.activeElement, {key: 'Home', code: 36, charCode: 36});
      fireEvent.keyUp(document.activeElement, {key: 'Home', code: 36, charCode: 36});
      act(() => {
        jest.runAllTimers();
      });

      expect(document.activeElement).toBe(cards[0]);
    });

    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should move focus via End', function ({layout}) {
      let tree = render(<DynamicCardView layout={layout} />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[2]);
      expect(document.activeElement).toBe(cards[2]);

      fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
      fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});
      act(() => {
        jest.runAllTimers();
      });

      cards = tree.getAllByRole('gridcell');
      expect(document.activeElement).toBe(cards[cards.length - 1]);
    });

    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should move focus via type to select', function ({layout}) {
      let tree = render(<DynamicCardView layout={layout} />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[1]);
      expect(document.activeElement).toBe(cards[1]);

      userEvent.type(document.activeElement, 'Title 12');
      act(() => {
        jest.runAllTimers();
      });

      expect(within(document.activeElement).getByText('Title 12')).toBeTruthy();
    });
  });

  describe('selection', function () {
    // TODO: Add range selection test via shift click and shift + arrow keys when that functionality is fixed
    it('CardView should support selectedKeys', function () {
      let tree = render(<DynamicCardView selectedKeys={['Title 1', 'Title 2']} />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      expect(cards[0].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(cards[1].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeTruthy();
      expect(within(cards[1]).getByRole('checkbox').checked).toBeTruthy();
    });

    it('CardView should support disabledKeys', function () {
      let tree = render(<DynamicCardView disabledKeys={['Title 1']} />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[0]);
      expect(document.activeElement).not.toBe(cards[0]);
      expect(cards[0].parentNode).not.toHaveAttribute('aria-selected', 'true');
      expect(within(cards[0]).getByRole('checkbox')).toHaveAttribute('disabled');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeFalsy();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('CardView should support multiple selection', function () {
      let tree = render(<DynamicCardView />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[0]);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Title 1']));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);

      triggerPress(cards[2]);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Title 1', 'Title 3']));
      expect(onSelectionChange).toHaveBeenCalledTimes(2);

      expect(cards[0].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(cards[2].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeTruthy();
      expect(within(cards[2]).getByRole('checkbox').checked).toBeTruthy();

      triggerPress(cards[0]);
      expect(new Set(onSelectionChange.mock.calls[2][0])).toEqual(new Set(['Title 3']));
      expect(onSelectionChange).toHaveBeenCalledTimes(3);

      expect(cards[0].parentNode).toHaveAttribute('aria-selected', 'false');
      expect(cards[2].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeFalsy();
      expect(within(cards[2]).getByRole('checkbox').checked).toBeTruthy();
    });

    it('CardView should support single selection', function () {
      let tree = render(<DynamicCardView selectionMode="single" />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[0]);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(['Title 1']));
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(cards[0].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeTruthy();

      triggerPress(cards[2]);
      expect(new Set(onSelectionChange.mock.calls[1][0])).toEqual(new Set(['Title 3']));
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(cards[0].parentNode).toHaveAttribute('aria-selected', 'false');
      expect(cards[2].parentNode).toHaveAttribute('aria-selected', 'true');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeFalsy();
      expect(within(cards[2]).getByRole('checkbox').checked).toBeTruthy();

      triggerPress(cards[2]);
      expect(new Set(onSelectionChange.mock.calls[2][0])).toEqual(new Set([]));
      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      expect(cards[0].parentNode).toHaveAttribute('aria-selected', 'false');
      expect(cards[2].parentNode).toHaveAttribute('aria-selected', 'false');
      expect(within(cards[0]).getByRole('checkbox').checked).toBeFalsy();
      expect(within(cards[2]).getByRole('checkbox').checked).toBeFalsy();
    });

    it('CardView should support no selection', function () {
      let tree = render(<DynamicCardView selectionMode="none" />);
      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      triggerPress(cards[0]);
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
      expect(cards[0].parentNode).not.toHaveAttribute('aria-selected');
      expect(within(cards[0]).queryByRole('checkbox')).toBeNull();

      triggerPress(cards[2]);
      expect(onSelectionChange).toHaveBeenCalledTimes(0);
      expect(cards[2].parentNode).not.toHaveAttribute('aria-selected');
      expect(within(cards[2]).queryByRole('checkbox')).toBeNull();
    });
  });

  describe('loading', function () {
    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should render a loading spinner when loading', function ({layout}) {
      let tree = render(<DynamicCardView layout={layout} items={[]} loadingState="loading" />);
      act(() => {
        jest.runAllTimers();
      });

      let row = tree.getByRole('row');
      expect(row).toBeTruthy();

      let gridCell = within(row).getByRole('gridcell');
      expect(gridCell).toBeTruthy();

      let spinner = within(gridCell).getByRole('progressbar');
      expect(spinner).toHaveAttribute('aria-label', 'Loading…');
      expect(row.parentNode.style.height).toBe(`${mockHeight}px`);

      tree.rerender(<DynamicCardView layout={layout} />);
      // Run timers for transitions
      act(() => {
        jest.runAllTimers();
      });
      let grid = tree.getByRole('grid');
      expect(within(grid).queryByRole('progressbar')).toBeNull();
      expect(grid).toHaveAttribute('aria-rowcount', defaultItems.length.toString());
      expect(within(grid).getByText('Title 1')).toBeTruthy();
    });

    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should render a loading spinner at the bottom when loading more', function ({layout}) {
      let tree = render(<DynamicCardView layout={layout} loadingState="loadingMore" />);
      act(() => {
        jest.runAllTimers();
      });

      let grid = tree.getByRole('grid');
      expect(grid).toHaveAttribute('aria-rowcount', defaultItems.length.toString());
      expect(within(grid).getByText('Title 1')).toBeTruthy();

      let cards = tree.getAllByRole('gridcell');
      expect(cards).toBeTruthy();
      triggerPress(cards[1]);

      // Scroll to the 'ideal' end, however, this won't be the true y position after everything has
      // been rendered and layout infos are all calculated. So scroll to the beginning again and then back one more time.
      // This time we'll end up at the true end and the progress bar will be visible.
      fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
      fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});

      fireEvent.keyDown(document.activeElement, {key: 'Home', code: 35, charCode: 35});
      fireEvent.keyUp(document.activeElement, {key: 'Home', code: 35, charCode: 35});

      fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
      fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});

      act(() => {
        jest.runAllTimers();
      });
      expect(within(grid).getByText('Title 12')).toBeTruthy();


      let spinner = within(grid).getByRole('progressbar');
      expect(spinner).toHaveAttribute('aria-label', 'Loading more…');
      expect(getCardStyles(spinner.parentNode).height).toBe('60px');
    });

    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
    `('$Name CardView should call loadMore when scrolling to the bottom', function ({layout}) {
      let onLoadMore = jest.fn();
      let tree = render(<DynamicCardView layout={layout} onLoadMore={onLoadMore} />);

      act(() => {
        jest.runAllTimers();
      });

      let cards = tree.getAllByRole('gridcell');
      expect(cards).toBeTruthy();
      // Virtualizer calls onLoadMore twice due to initial layout
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      triggerPress(cards[1]);

      fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
      fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});
      act(() => {
        jest.runAllTimers();
      });

      let grid = tree.getByRole('grid');
      grid.scrollTop = 3000;
      fireEvent.scroll(grid);
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should not render a loading spinner when filtering', function ({layout}) {
      let tree = render(<DynamicCardView layout={layout} loadingState="filtering" />);
      act(() => {
        jest.runAllTimers();
      });

      let grid = tree.getByRole('grid');
      expect(grid).toHaveAttribute('aria-rowcount', defaultItems.length.toString());
      expect(within(grid).getByText('Title 1')).toBeTruthy();

      fireEvent.keyDown(document.activeElement, {key: 'End', code: 35, charCode: 35});
      fireEvent.keyUp(document.activeElement, {key: 'End', code: 35, charCode: 35});
      act(() => {
        jest.runAllTimers();
      });

      expect(within(grid).queryByRole('progressbar')).toBeNull();
    });
  });

  describe('emptyState', function () {
    it.each`
      Name                  | layout
      ${'Grid layout'}      | ${GridLayout}
      ${'Gallery layout'}   | ${GalleryLayout}
      ${'Waterfall layout'} | ${WaterfallLayout}
    `('$Name CardView should render empty state when there are no items', function ({layout}) {
      let renderEmptyState = () => <div>empty</div>;
      let tree = render(<DynamicCardView layout={layout} items={[]} renderEmptyState={renderEmptyState} />);
      act(() => {
        jest.runAllTimers();
      });

      let row = tree.getByRole('row');
      expect(row).toBeTruthy();

      let gridCell = within(row).getByRole('gridcell');
      expect(gridCell).toBeTruthy();
      expect(within(gridCell).getByText('empty')).toBeTruthy();
      expect(row.parentNode.style.height).toBe(`${mockHeight}px`);
    });
  });

  // TODO: not testing waterfall layout because of aforementioned issue with the heights for each card being set to 0 for that layout
  it.each`
    Name                  | layout
    ${'Grid layout'}      | ${GridLayout}
    ${'Gallery layout'}   | ${GalleryLayout}
  `('$Name CardView should only scroll an item into view when in keyboard modality', function ({layout}) {
    let tree = render(<DynamicCardView layout={layout} />);
    act(() => {
      jest.runAllTimers();
    });
    let cards = tree.getAllByRole('gridcell');
    expect(cards).toBeTruthy();
    let grid = tree.getByRole('grid');
    let initialScrollTop = grid.scrollTop;
    triggerPress(cards[cards.length - 1]);
    act(() => {
      jest.runAllTimers();
    });
    expect(grid.scrollTop).toBe(initialScrollTop);

    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown', code: 40, charCode: 40});
    act(() => {
      jest.runAllTimers();
    });

    expect(grid.scrollTop).toBeGreaterThan(initialScrollTop);
  });
});
