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

import {ActionGroup, Item} from '@react-spectrum/actiongroup';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '@react-spectrum/table';
import {Checkbox} from '@react-spectrum/checkbox';
import {classNames, useFocusableRef, useStyleProps} from '@react-spectrum/utils';
import {createLandmarkController, useLandmark} from '../';
import {Flex} from '@react-spectrum/layout';
import {Link} from '@react-spectrum/link';
import {Meta} from '@storybook/react';
import React, {SyntheticEvent, useEffect, useMemo, useRef} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import styles from './index.css';
import {TextField} from '@react-spectrum/textfield';

interface StoryProps {}

const meta: Meta<StoryProps> = {
  title: 'Landmark',
  parameters: {providerSwitcher: {mainElement: false}}
};

export default meta;

const Template = (props) => <Example {...props} />;
const NestedTemplate = (props) => <NestedExample {...props} />;
const TableTemplate = (props) => <TableExample {...props} />;
const ApplicationTemplate = (props) => <ApplicationExample {...props} />;
const DuplicateRolesWithLabelsTemplate = (props) => <DuplicateRolesWithLabelsExample {...props} />;
const DuplicateRolesWithNoLabelsTemplate = (props) => <DuplicateRolesNoLabelExample {...props} />;
const DuplicateRolesWithSameLabelsTemplate = (props) => <DuplicateRolesWithSameLabelsExample {...props} />;
const OneWithNoFocusableChildrenExampleTemplate = (props) => <OneWithNoFocusableChildrenExample {...props} />;
const AllWithNoFocusableChildrenExampleTemplate = (props) => <AllWithNoFocusableChildrenExample {...props} />;

function Main(props) {
  let ref = useFocusableRef(null);
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref);
  return <main aria-label="Danni's unicorn corral" ref={ref} {...props} {...landmarkProps} {...styleProps}>{props.children}</main>;
}

function Navigation(props) {
  let ref = useFocusableRef(null);
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref);
  return <nav aria-label="Rainbow lookout"  ref={ref} {...props} {...landmarkProps} {...styleProps}>{props.children}</nav>;
}

function Region(props) {
  let ref = useFocusableRef(null);
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'region'}, ref);
  return <article aria-label="The greens" ref={ref} {...props} {...landmarkProps} {...styleProps}>{props.children}</article>;
}

function Search(props) {
  let ref = useFocusableRef(null);
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'search'}, ref);
  return (
    <form aria-label="Magic seeing eye" ref={ref} {...props} {...landmarkProps} {...styleProps} className={classNames(styles, 'landmark')}>
      <SearchField label="Search" />
    </form>
  );
}

function Example() {
  return (
    <div>
      <Navigation>
        <div>Navigation Landmark</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Main>
        <div>Main Landmark</div>
        <TextField label="First Name" />
      </Main>
    </div>
  );
}

function DuplicateRolesWithLabelsExample() {
  return (
    <div>
      <Navigation aria-label="First Nav">
        <div>Navigation Landmark with 'First Nav' label</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Navigation aria-label="Second Nav">
        <div>Navigation Landmark with 'Second Nav' label</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Main>
        <div>Main Landmark</div>
        <TextField label="First Name" />
      </Main>
    </div>
  );
}

function DuplicateRolesWithSameLabelsExample() {
  return (
    <div>
      <Navigation aria-label="First Nav">
        <div>Navigation Landmark with 'First Nav' label</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Navigation aria-label="First Nav">
        <div>Navigation Landmark with 'First Nav' label</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Main>
        <div>Main Landmark</div>
        <TextField label="First Name" />
      </Main>
    </div>
  );
}

function DuplicateRolesNoLabelExample() {
  return (
    <div>
      <Navigation aria-label={undefined}>
        <div>Navigation Landmark with no label</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Navigation aria-label={undefined}>
        <div>Navigation Landmark with no label</div>
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </Navigation>
      <Main aria-label={undefined}>
        <div>Main Landmark</div>
        <TextField label="First Name" />
      </Main>
    </div>
  );
}

function OneWithNoFocusableChildrenExample() {
  return (
    <div>
      <TextField label="First Name" />
      <Main>
        <div>Main Landmark</div>
        <div>No focusable children</div>
      </Main>
      <TextField label="First Name" />
    </div>
  );
}

function AllWithNoFocusableChildrenExample() {
  return (
    <div>
      <Region>
        <div>Region Landmark</div>
        <div>No focusable children</div>
      </Region>
      <TextField label="First Name" />
      <Main>
        <div>Main Landmark</div>
        <div>No focusable children</div>
      </Main>
    </div>
  );
}

function NestedExample() {
  return (
    <div>
      <Main>
        <div>Main Landmark</div>
        <TextField label="First Name" />

        <Region>
          <div>Region Landmark inside Main</div>
          <Checkbox>Checkbox label</Checkbox>
        </Region>
      </Main>
    </div>
  );
}

function TableExample() {
  return (
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
  );
}
// ['main', 'region', 'search', 'navigation', 'form', 'banner', 'contentinfo', 'complementary']
function ApplicationExample() {
  return (
    <div className={classNames(styles, 'application')}>
      <Region UNSAFE_className={classNames(styles, 'globalnav')}>
        <Flex justifyContent="space-between">
          <Link><a href="//react-spectrum.com">React Spectrum</a></Link>
          <Search />
        </Flex>
      </Region>
      <Navigation UNSAFE_className={classNames(styles, 'navigation')} aria-label="Site Nav">
        <ActionGroup orientation="vertical">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </ActionGroup>
      </Navigation>
      <Main UNSAFE_className={classNames(styles, 'main')}>
        <TableView aria-label="Table" justifySelf="stretch">
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
      <Navigation UNSAFE_className={classNames(styles, 'navigation-content')} aria-label="Content Nav">
        <ActionGroup orientation="vertical">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </ActionGroup>
      </Navigation>
    </div>
  );
}

function IframeExample() {
  let controller = useMemo(() => createLandmarkController(), []);
  useEffect(() => () => controller.dispose(), [controller]);
  let onLoad = (e: SyntheticEvent) => {
    let iframe = e.target as HTMLIFrameElement;
    let window = iframe.contentWindow;
    let document = window?.document;
    if (!window || !document) {
      return;
    }

    let prevFocusedElement: HTMLElement | null = null;
    window.addEventListener('react-aria-landmark-navigation', ((e: CustomEvent) => {
      e.preventDefault();
      if (!window || !document) {
        return;
      }
      let el = document.activeElement as HTMLElement;
      if (el !== document.body) {
        prevFocusedElement = el;
      }

      // Prevent focus scope from stealing focus back when we move focus to the iframe.
      document.body.setAttribute('data-react-aria-top-layer', 'true');

      window.parent.postMessage({
        type: 'landmark-navigation',
        direction: e.detail.direction
      });

      setTimeout(() => {
        document?.body.removeAttribute('data-react-aria-top-layer');
      }, 100);
    }) as EventListener);

    // When the iframe is re-focused, restore focus back inside where it was before.
    window.addEventListener('focus', () => {
      if (prevFocusedElement) {
        prevFocusedElement.focus();
        prevFocusedElement = null;
      }
    });

    // Move focus to first or last landmark when we receive a message from the parent page.
    window.addEventListener('message', e => {
      if (e.data.type === 'landmark-navigation') {
        // (Can't use LandmarkController in this example because we need the controller instance inside the iframe)
        document?.body.dispatchEvent(new KeyboardEvent('keydown', {key: 'F6', shiftKey: e.data.direction === 'backward', bubbles: true}));
      }
    });
  };

  let ref = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    let onMessage = (e: MessageEvent) => {
      let iframe = ref.current;
      if (e.data.type === 'landmark-navigation') {
        // Move focus to the iframe so that when focus is restored there, and we can redirect it back inside (below).
        iframe?.focus();

        // Now re-dispatch the keyboard event so landmark navigation outside the iframe picks it up.
        controller.navigate(e.data.direction);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [controller]);

  let {landmarkProps} = useLandmark({
    role: 'main',
    focus(direction) {
      // when iframe landmark receives focus via landmark navigation, go to first/last landmark inside iframe.
      ref.current?.contentWindow?.postMessage({
        type: 'landmark-navigation',
        direction
      });
    }
  }, ref);

  return (
    <div className={classNames(styles, 'application')}>
      <Region UNSAFE_className={classNames(styles, 'globalnav')}>
        <Flex justifyContent="space-between">
          <Link><a href="//react-spectrum.com">React Spectrum</a></Link>
          <Search />
        </Flex>
      </Region>
      <Navigation UNSAFE_className={classNames(styles, 'navigation')} aria-label="Site Nav">
        <ActionGroup orientation="vertical">
          <Item>One</Item>
          <Item>Two</Item>
          <Item>Three</Item>
        </ActionGroup>
      </Navigation>
      <iframe
        ref={ref}
        {...landmarkProps}
        title="iframe"
        style={{width: '100%', height: '100%'}}
        src="iframe.html?providerSwitcher-express=false&providerSwitcher-toastPosition=bottom&providerSwitcher-locale=&providerSwitcher-theme=&providerSwitcher-scale=&args=&id=landmark--application-with-landmarks&viewMode=story"
        onLoad={onLoad}
        tabIndex={-1} />
    </div>
  );
}

export const FlatLandmarks = {
  render: Template
};

export const NestedLandmarks = {
  render: NestedTemplate
};

export const TableLandmark = {
  render: TableTemplate
};

export const ApplicationWithLandmarks = {
  render: ApplicationTemplate
};

export const DuplicateRolesWithLabels = {
  render: DuplicateRolesWithLabelsTemplate
};

export const DuplicateRolesWithNoLabels = {
  render: DuplicateRolesWithNoLabelsTemplate
};

export const DuplicateRolesWithSameLabels = {
  render: DuplicateRolesWithSameLabelsTemplate
};

export const OneWithNoFocusableChildren = {
  render: OneWithNoFocusableChildrenExampleTemplate
};

export const AllWithNoFocusableChildren = {
  render: AllWithNoFocusableChildrenExampleTemplate
};

export {IframeExample};
