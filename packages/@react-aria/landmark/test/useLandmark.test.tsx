/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render, within} from '@testing-library/react';
import {ActionGroup, Item} from '@react-spectrum/actiongroup';
import {Button} from '@react-spectrum/button';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import {Checkbox} from '@react-spectrum/checkbox';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {theme} from '@react-spectrum/theme-default';
import {useLandmark} from '../';
import userEvent from '@testing-library/user-event';

function Main(props) {
  let ref = useRef();
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref);
  return <main ref={ref} {...landmarkProps}>{props.children}</main>;
}

function Navigation(props) {
  let ref = useRef();
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref);
  return <nav ref={ref} {...landmarkProps}>{props.children}</nav>;
}

function Region(props) {
  let ref = useRef();
  let {landmarkProps} = useLandmark({...props, role: 'region'}, ref);
  return <article ref={ref} {...landmarkProps}>{props.children}</article>;
}

// taken from useFocusVisible tests
function toggleBrowserTabs() {
  // this describes Chrome behaviour only, for other browsers visibilitychange fires after all focus events.
  // leave tab
  const lastActiveElement = document.activeElement;
  fireEvent(lastActiveElement, new Event('blur'));
  fireEvent(window, new Event('blur'));
  Object.defineProperty(document, 'visibilityState', {
    value: 'hidden',
    writable: true
  });
  Object.defineProperty(document, 'hidden', {value: true, writable: true});
  fireEvent(document, new Event('visibilitychange'));
  // return to tab
  Object.defineProperty(document, 'visibilityState', {
    value: 'visible',
    writable: true
  });
  Object.defineProperty(document, 'hidden', {value: false, writable: true});
  fireEvent(document, new Event('visibilitychange'));
  fireEvent(window, new Event('focus'));
  fireEvent(lastActiveElement, new Event('focus'));
}

function toggleBrowserWindow() {
  fireEvent(window, new Event('blur'));
  fireEvent(window, new Event('focus'));
}


describe('LandmarkManager', function () {
  let offsetWidth, offsetHeight;

  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    jest.useFakeTimers();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  afterEach(() => {

    act(() => {jest.runAllTimers();});
  });

  it('can tab into a landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');
    expect(navigation).toBeInTheDocument();
    expect(main).toBeInTheDocument();

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);
  });

  it('can F6 to a landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);
  });

  it('can F6 to a landmark region when there is only one landmark', function () {
    let tree = render(
      <div>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);
  });

  it('can F6 to a nested landmark region that is first', function () {
    let tree = render(
      <div>
        <Main>
          <Region>
            <Checkbox>Checkbox label</Checkbox>
          </Region>

          <TextField label="First Name" />
        </Main>
      </div>
    );
    let main = tree.getByRole('main');
    let region = tree.getByRole('region');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(region);
  });

  it('can F6 to a nested landmark region that is last', function () {
    let tree = render(
      <div>
        <Main>
          <TextField label="First Name" />

          <Region>
            <Checkbox>Checkbox label</Checkbox>
          </Region>
        </Main>
      </div>
    );
    let main = tree.getByRole('main');
    let region = tree.getByRole('region');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(region);
  });

  it('goes in dom order with two nested landmarks', function () {
    let tree = render(
      <div>
        <Main>
          <Region aria-label="Region 1">
            <Checkbox>Checkbox label 1</Checkbox>
          </Region>

          <TextField label="First Name" />

          <Region aria-label="Region 2">
            <Checkbox>Checkbox label 2</Checkbox>
          </Region>

          <TextField label="Last Name" />
        </Main>
      </div>
    );
    let main = tree.getByRole('main');
    let region1 = tree.getAllByRole('region')[0];
    let region2 = tree.getAllByRole('region')[1];

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region1);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region2);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(region2);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(region1);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(main);
  });

  it('can F6 to the next landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let main = tree.getByRole('main');

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);
  });


  it('landmark navigation forward wraps', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let main = tree.getByRole('main');

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);
  });

  it('can shift+tab into a landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));

    userEvent.tab({shift: true});
    expect(document.activeElement).toBe(tree.getAllByRole('link')[2]);
  });

  it('can shift+F6 to a landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(navigation);
  });

  it('can shift+F6 to the previous landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );

    userEvent.tab();
    userEvent.tab();
    userEvent.tab();
    userEvent.tab();
    expect(document.activeElement).toBe(tree.getByRole('textbox'));

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(tree.getAllByRole('link')[2]);
  });

  it('landmark navigation backward wraps', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let main = tree.getByRole('main');

    userEvent.tab();
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(main);
  });

  it('F6 should focus the last focused element in a landmark region', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );

    userEvent.tab();
    userEvent.tab();
    userEvent.tab();
    userEvent.tab();
    expect(document.activeElement).toBe(tree.getByRole('textbox'));

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(tree.getAllByRole('link')[2]);
  });

  it('components that already handle focus management, should handle focus themselves', function () {
    let tree = render(
      <Provider theme={theme}>
        <div>
          <Navigation>
            <ActionGroup>
              <Item>One</Item>
              <Item>Two</Item>
              <Item>Three</Item>
            </ActionGroup>
          </Navigation>
          <Main>
            <TableView aria-label="Table">
              <TableHeader>
                <Column key="foo" allowsSorting>Foo</Column>
                <Column key="bar" allowsSorting>Bar</Column>
                <Column key="baz">Baz</Column>
              </TableHeader>
              <TableBody>
                <Row>
                  <Cell>Foo 1</Cell>
                  <Cell>Bar 1</Cell>
                  <Cell>Baz 1</Cell>
                </Row>
                <Row>
                  <Cell>Foo 2</Cell>
                  <Cell>Bar 2</Cell>
                  <Cell>Baz 2</Cell>
                </Row>
                <Row>
                  <Cell>Foo 3</Cell>
                  <Cell>Bar 3</Cell>
                  <Cell>Baz 3</Cell>
                </Row>
              </TableBody>
            </TableView>
          </Main>
        </div>
      </Provider>
    );
    act(() => {jest.runAllTimers();});
    let buttons = tree.getAllByRole('button');
    let table = tree.getByRole('grid');
    let rows = within(table).getAllByRole('row');
    let cells = within(rows[1]).getAllByRole('gridcell');

    userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(buttons[1]);

    userEvent.tab();
    expect(document.activeElement).toBe(rows[1]);
    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(cells[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(cells[0]);
  });

  it('Should allow 2+ landmarks with same role if they are labelled.', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <div>
        <Navigation aria-label="First nav">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Navigation aria-label="Second nav">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );

    expect(spyWarn).not.toHaveBeenCalled();
  });

  it('Should warn if 2+ landmarks with same role are used but not labelled.', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );

    expect(spyWarn).toHaveBeenCalledWith('Page contains more than one landmark with the \'navigation\' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute.');
  });

  it('Should warn if 2+ landmarks with same role and same label', function () {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <div>
        <Navigation aria-label="First nav">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Navigation aria-label="First nav">
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );

    expect(spyWarn).toHaveBeenCalledWith('Page contains more than one landmark with the \'navigation\' role and \'First nav\' label. If two or more landmarks on a page share the same role, they must have unique labels.');
  });

  it('Should not navigate to a landmark that has been removed from the DOM', function () {

    function Container({children = null}) {
      return (
        <div>
          <Navigation>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Navigation>
          {children}
          <Main>
            <TextField label="Last Name" />
          </Main>
        </div>
      );
    }

    let tree = render(
      <Container>
        <Region>
          <TextField label="First Name" />
        </Region>
      </Container>
    );

    let navigation = tree.getByRole('navigation');
    let region = tree.getByRole('region');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);


    tree.rerender(<Container />);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(navigation);
  });

  it('Should navigate to a landmark that has been added to the DOM', function () {

    function Container({children = null}) {
      return (
        <div>
          <Navigation>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Navigation>
          <Main>
            <TextField label="Last Name" />
          </Main>
          {children}
        </div>
      );
    }

    let tree = render(<Container />);
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    tree.rerender(
      <Container>
        <Region>
          <TextField label="First Name" />
        </Region>
      </Container>
    );

    let region = tree.getByRole('region');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);
  });

  it('Should navigate to a landmark that has been added as a child to an existing landmark.', function () {

    function Container({children = null}) {
      return (
        <div>
          <Navigation>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Navigation>
          <Main>
            <TextField label="Last Name" />
            {children}
          </Main>
        </div>
      );
    }
    let tree = render(<Container />);

    tree.rerender(
      <Container>
        <Region>
          <TextField label="First Name" />
        </Region>
      </Container>
    );
    let main = tree.getByRole('main');
    let navigation = tree.getByRole('navigation');
    let region = tree.getByRole('region');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(region);
  });

  it('Should navigate to a landmark that has been added as a parent to an existing landmark.', function () {

    function Contained() {
      return (
        <div>
          <Navigation>
            <ul>
              <li><a href="/home">Home</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </Navigation>
          <Region>
            <TextField label="Last Name" />
          </Region>
        </div>
      );
    }

    let tree = render(<Contained />);

    tree.rerender(
      <Main>
        <TextField label="Last Name" />
        <Contained />
      </Main>
    );

    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);
  });

  it('can alt+F6 to main landmark', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Region>
          <TextField label="Last Name" />
        </Region>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
      );
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);

    fireEvent.keyDown(document.activeElement, {key: 'F6', altKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', altKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6', altKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', altKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);
  });

  it('alt+F6 does nothing if no main landmark', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Region>
          <TextField label="Last Name" />
        </Region>
      </div>
      );
    let navigation = tree.getByRole('navigation');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);

    fireEvent.keyDown(document.activeElement, {key: 'F6', altKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', altKey: true});
    expect(document.activeElement).toBe(navigation);
  });

  it('can alt+F6 to main landmark if main is the only landmark', function () {
    let tree = render(
      <div>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
      );
    let main = tree.getByRole('main');

    fireEvent.keyDown(document.activeElement, {key: 'F6', altKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', altKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6', altKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', altKey: true});
    expect(document.activeElement).toBe(main);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(main);
  });

  it('landmark has tabIndex="-1" when focused', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
      );
    let navigation = tree.getByRole('navigation');
    let main = tree.getByRole('main');
    expect(navigation).not.toHaveAttribute('tabIndex');
    expect(main).not.toHaveAttribute('tabIndex');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(navigation);
    expect(navigation).toHaveAttribute('tabIndex', '-1');
    expect(main).not.toHaveAttribute('tabIndex');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(main).toHaveAttribute('tabIndex', '-1');
    expect(navigation).not.toHaveAttribute('tabIndex');
  });

  it('cannot focus landmark with mouse', function () {
    let tree = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let navigation = tree.getByRole('navigation');

    fireEvent.mouseDown(navigation);
    fireEvent.mouseUp(navigation);

    expect(document.activeElement).toBe(document.body);
  });

  it('focuses the landmark again after toggling browser tabs', function () {
    let {getByRole} = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let nav = getByRole('navigation');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(nav).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(nav);

    toggleBrowserTabs();

    expect(document.activeElement).toBe(nav);
    expect(nav).toHaveAttribute('tabIndex', '-1');
  });

  it('focuses the landmark again after toggling browser windows', function () {
    let {getByRole} = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let nav = getByRole('navigation');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(nav).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(nav);

    toggleBrowserWindow();

    expect(document.activeElement).toBe(nav);
    expect(nav).toHaveAttribute('tabIndex', '-1');
  });

  it('loses the tabIndex=-1 if something else is focused', function () {
    let {getByRole, getAllByRole} = render(
      <div>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
        <Main>
          <TextField label="First Name" />
        </Main>
      </div>
    );
    let nav = getByRole('navigation');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(nav).toHaveAttribute('tabIndex', '-1');
    expect(document.activeElement).toBe(nav);

    userEvent.tab();

    expect(document.activeElement).toBe(getAllByRole('link')[0]);
    expect(nav).not.toHaveAttribute('tabIndex');
  });

  it('cleans up event listeners if all landmarks are unmounted', function () {
    // Because our listener stops propagation of the F6 key to prevent anything
    // else from handling it, we can render with landmarks to make sure the propagation is stopped
    // and then when everything is unmounted, we can check again.
    let onKeyDown = jest.fn();
    let {getByRole, rerender} = render(
      <div>
        <Button onKeyDown={onKeyDown} variant="cta">Focusable</Button>
        <Navigation>
          <ul>
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </Navigation>
      </div>
    );
    let nav = getByRole('navigation');
    let button = getByRole('button');

    act(() => {
      button.focus();
    });
    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(nav);

    expect(onKeyDown).not.toHaveBeenCalled();

    rerender(
      <div>
        <Button onKeyDown={onKeyDown} variant="cta">Focusable</Button>
      </div>
    );
    button = getByRole('button');

    act(() => {
      button.focus();
    });
    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});

    expect(onKeyDown).toHaveBeenCalled();
  });
});
