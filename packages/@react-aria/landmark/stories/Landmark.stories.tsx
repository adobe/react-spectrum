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
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {Flex} from '@react-spectrum/layout';
import {Link} from '@react-spectrum/link';
import {Meta, Story} from '@storybook/react';
import React, {useRef} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import styles from './index.css';
import {TextField} from '@react-spectrum/textfield';
import {useLandmark} from '../';


interface StoryProps {}

const meta: Meta<StoryProps> = {
  title: 'Landmark',
  parameters: {providerSwitcher: {mainElement: false}}
};

export default meta;

const Template = (): Story<StoryProps> => (props) => <Example {...props} />;
const NestedTemplate = (): Story<StoryProps> => (props) => <NestedExample {...props} />;
const TableTemplate = (): Story<StoryProps> => (props) => <TableExample {...props} />;
const ApplicationTemplate = (): Story<StoryProps> => (props) => <ApplicationExample {...props} />;
const DuplicateRolesWithLabelsTemplate = (): Story<StoryProps> => (props) => <DuplicateRolesWithLabelsExample {...props} />;
const DuplicateRolesWithNoLabelsTemplate = (): Story<StoryProps> => (props) => <DuplicateRolesNoLabelExample {...props} />;
const DuplicateRolesWithSameLabelsTemplate = (): Story<StoryProps> => (props) => <DuplicateRolesWithSameLabelsExample {...props} />;
const OneWithNoFocusableChildrenExampleTemplate = (): Story<StoryProps> => (props) => <OneWithNoFocusableChildrenExample {...props} />;
const AllWithNoFocusableChildrenExampleTemplate = (): Story<StoryProps> => (props) => <AllWithNoFocusableChildrenExample {...props} />;

function Main(props) {
  let ref = useRef();
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'main'}, ref);
  return <main aria-label="Danni's unicorn corral" ref={ref} {...props} {...landmarkProps} {...styleProps}>{props.children}</main>;
}

function Navigation(props) {
  let ref = useRef();
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'navigation'}, ref);
  return <nav aria-label="Rainbow lookout"  ref={ref} {...props} {...landmarkProps} {...styleProps}>{props.children}</nav>;
}

function Region(props) {
  let ref = useRef();
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'region'}, ref);
  return <article aria-label="The greens" ref={ref} {...props} {...landmarkProps} {...styleProps}>{props.children}</article>;
}

function Search(props) {
  let ref = useRef();
  let {styleProps} = useStyleProps(props);
  let {landmarkProps} = useLandmark({...props, role: 'search'}, ref);
  return (
    <form aria-label="Magic seeing eye" ref={ref} {...props} {...landmarkProps} {...styleProps}>
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

export const FlatLandmarks = Template().bind({});
FlatLandmarks.args = {};

export const NestedLandmarks = NestedTemplate().bind({});
NestedLandmarks.args = {};

export const TableLandmark = TableTemplate().bind({});
TableLandmark.args = {};

export const ApplicationWithLandmarks = ApplicationTemplate().bind({});
ApplicationWithLandmarks.args = {};

export const DuplicateRolesWithLabels = DuplicateRolesWithLabelsTemplate().bind({});
DuplicateRolesWithLabels.args = {};

export const DuplicateRolesWithNoLabels = DuplicateRolesWithNoLabelsTemplate().bind({});
DuplicateRolesWithNoLabels.args = {};

export const DuplicateRolesWithSameLabels = DuplicateRolesWithSameLabelsTemplate().bind({});
DuplicateRolesWithSameLabels.args = {};

export const OneWithNoFocusableChildren = OneWithNoFocusableChildrenExampleTemplate().bind({});
OneWithNoFocusableChildren.args = {};

export const AllWithNoFocusableChildren = AllWithNoFocusableChildrenExampleTemplate().bind({});
AllWithNoFocusableChildren.args = {};
