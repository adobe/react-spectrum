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

import {fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {TextField} from '@react-spectrum/textfield';
import {useLandmark} from '../';
import userEvent from '@testing-library/user-event';
import {Checkbox} from '@react-spectrum/checkbox';

//['main', 'region', 'search', 'navigation', 'form', 'banner', 'contentinfo', 'complementary']

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
    let checkbox = tree.getByRole('checkbox');
    let textbox = tree.getByRole('textbox');

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6'});
    fireEvent.keyUp(document.activeElement, {key: 'F6'});
    expect(document.activeElement).toBe(textbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(checkbox);

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(textbox);
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

    fireEvent.keyDown(document.activeElement, {key: 'F6', shiftKey: true});
    fireEvent.keyUp(document.activeElement, {key: 'F6', shiftKey: true});
    expect(document.activeElement).toBe(tree.getByRole('textbox'));
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
});
