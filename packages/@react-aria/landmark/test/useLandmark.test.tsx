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

import {ActionGroup, Item} from '@react-spectrum/actiongroup';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import {Checkbox} from '@react-spectrum/checkbox';
import {fireEvent, render} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import React, {useRef} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {theme} from '@react-spectrum/theme-default';
import {useLandmark} from '../';
import userEvent from '@testing-library/user-event';

// ['main', 'region', 'search', 'navigation', 'form', 'banner', 'contentinfo', 'complementary']

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


describe('LandmarkManager', function () {
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

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));
  });

  it.skip('can F6 to a nested landmark region that is first', function () {
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
    let checkbox = tree.getByRole('checkbox');
    let textbox = tree.getByRole('textbox');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(checkbox);
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
    let checkbox = tree.getByRole('checkbox');
    let textbox = tree.getByRole('textbox');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(checkbox);
  });

  it.skip('goes in dom order with two nested landmarks', function () {
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
    let checkbox1 = tree.getByLabelText('Checkbox label 1');
    let checkbox2 = tree.getByLabelText('Checkbox label 2');
    let textbox1 = tree.getByLabelText('First Name');
    // let textbox2 = tree.getByLabelText('Last Name');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox1);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox1);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox2);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox1);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(checkbox2);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(checkbox1);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(textbox1);
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

    userEvent.tab();
    expect(tree.getAllByRole('link')[0]).toBe(tree.getAllByRole('link')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));
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

    userEvent.tab();
    expect(tree.getAllByRole('link')[0]).toBe(tree.getAllByRole('link')[0]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));

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

  it.skip('can shift+F6 to a landmark region', function () {
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

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);
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

    userEvent.tab();
    expect(tree.getAllByRole('link')[0]).toBe(document.activeElement);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));
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
    let buttons = tree.getAllByRole('button');
    let table = tree.getByRole('grid');

    userEvent.tab();
    expect(document.activeElement).toBe(buttons[0]);
    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(buttons[1]);

    userEvent.tab();
    expect(document.activeElement).toBe(table);
    fireEvent.keyDown(document.activeElement, {key: 'ArrowDown'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowDown'});
    fireEvent.keyDown(document.activeElement, {key: 'ArrowRight'});
    fireEvent.keyUp(document.activeElement, {key: 'ArrowRight'});
    expect(document.activeElement).toBe(table);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(table);
  });

  it('Should allow 2+ landmarks with same role if they are labelled.', function () {
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

    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(spyWarn).not.toHaveBeenCalled();
  });

  it('Should warn if 2+ landmarks with same role are used but not labelled.', function () {
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

    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(spyWarn).toHaveBeenCalledWith('Page contains more than one landmark with the \'navigation\' role. If two or more landmarks on a page share the same role, all must be labeled with an aria-label or aria-labelledby attribute.');
  });
});
