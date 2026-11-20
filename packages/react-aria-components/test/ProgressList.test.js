/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ProgressList,
  ProgressListContext,
  ProgressListItem,
  ProgressListItemContent
} from '../src/ProgressList';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';

let steps = [
  {id: 'domain', label: 'Domain'},
  {id: 'dns', label: 'DNS'},
  {id: 'advanced', label: 'Advanced'}
];

let renderProgressList = (listProps, itemProps) =>
  render(
    <ProgressList selectedKey="dns" aria-label="Setup" {...listProps}>
      {steps.map(step => (
        <ProgressListItem key={step.id} id={step.id} {...itemProps}>
          <ProgressListItemContent>{step.label}</ProgressListItemContent>
        </ProgressListItem>
      ))}
    </ProgressList>
  );

describe('ProgressList', () => {
  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderProgressList();
    expect(getByRole('list')).toHaveClass('react-aria-ProgressList');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('react-aria-ProgressListItem');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderProgressList({className: 'steps'}, {className: 'step'});
    expect(getByRole('list')).toHaveClass('steps');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('step');
    }
  });

  it('should mark steps before the selected step as completed', () => {
    let {getAllByRole} = renderProgressList();
    let items = getAllByRole('listitem');

    expect(items[0]).toHaveAttribute('data-completed');
    expect(items[0]).not.toHaveAttribute('data-current');
    expect(items[0]).not.toHaveAttribute('aria-current');

    expect(items[1]).toHaveAttribute('data-current');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[1]).not.toHaveAttribute('data-completed');

    expect(items[2]).not.toHaveAttribute('data-completed');
    expect(items[2]).not.toHaveAttribute('data-current');
  });

  it('should update completed steps when the selected step changes', () => {
    let {getAllByRole, rerender} = renderProgressList({selectedKey: 'advanced'});
    let items = getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-completed');
    expect(items[1]).toHaveAttribute('data-completed');
    expect(items[2]).toHaveAttribute('data-current');

    rerender(
      <ProgressList selectedKey="domain" aria-label="Setup">
        {steps.map(step => (
          <ProgressListItem key={step.id} id={step.id}>
            <ProgressListItemContent>{step.label}</ProgressListItemContent>
          </ProgressListItem>
        ))}
      </ProgressList>
    );

    items = getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-current');
    expect(items[1]).not.toHaveAttribute('data-completed');
    expect(items[2]).not.toHaveAttribute('data-completed');
  });

  it('should mark no steps as completed when the selected step is not in the collection', () => {
    let {getAllByRole} = renderProgressList({selectedKey: 'nope'});

    for (let item of getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('data-completed');
      expect(item).not.toHaveAttribute('data-current');
    }
  });

  it('should support dynamic collections', () => {
    let {getAllByRole} = render(
      <ProgressList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => (
          <ProgressListItem>
            <ProgressListItemContent>{step.label}</ProgressListItemContent>
          </ProgressListItem>
        )}
      </ProgressList>
    );

    let items = getAllByRole('listitem');
    expect(items.map(item => item.textContent)).toEqual([
      'CompletedDomain',
      'CurrentDNS',
      'Not completedAdvanced'
    ]);
    expect(items[0]).toHaveAttribute('data-completed');
    expect(items[1]).toHaveAttribute('data-current');
  });

  it('should support render props', () => {
    let {getAllByRole} = render(
      <ProgressList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => (
          <ProgressListItem>
            {({isCurrent, isCompleted}) => (
              <ProgressListItemContent>
                {isCurrent ? 'current' : isCompleted ? 'completed' : step.label}
              </ProgressListItemContent>
            )}
          </ProgressListItem>
        )}
      </ProgressList>
    );

    expect(getAllByRole('listitem').map(item => item.lastChild.textContent)).toEqual([
      'completed',
      'current',
      'Advanced'
    ]);
  });

  it('should provide a 1-based step number to render props', () => {
    let {getAllByRole} = render(
      <ProgressList selectedKey="dns" aria-label="Setup" items={steps}>
        {() => (
          <ProgressListItem>
            {({stepNumber}) => (
              <ProgressListItemContent>{`Step ${stepNumber}`}</ProgressListItemContent>
            )}
          </ProgressListItem>
        )}
      </ProgressList>
    );

    expect(getAllByRole('listitem').map(item => item.lastChild.textContent)).toEqual([
      'Step 1',
      'Step 2',
      'Step 3'
    ]);
  });

  it('should provide the step number to className and style functions', () => {
    let {getAllByRole} = render(
      <ProgressList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => (
          <ProgressListItem
            className={({stepNumber}) => `step-${stepNumber}`}
            style={({stepNumber}) => ({order: stepNumber})}>
            <ProgressListItemContent>{step.label}</ProgressListItemContent>
          </ProgressListItem>
        )}
      </ProgressList>
    );

    let items = getAllByRole('listitem');
    expect(items.map(item => item.className)).toEqual(['step-1', 'step-2', 'step-3']);
    expect(items.map(item => item.style.order)).toEqual(['1', '2', '3']);
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderProgressList(
      {'data-foo': 'bar', 'aria-label': 'test list'},
      {'data-bar': 'foo', 'aria-label': 'test item'}
    );

    let list = getByRole('list');
    expect(list).toHaveAttribute('data-foo', 'bar');
    expect(list).toHaveAttribute('aria-label', 'test list');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveAttribute('data-bar', 'foo');
      expect(item).toHaveAttribute('aria-label', 'test item');
    }
  });

  it('should not forward the step id to the DOM', () => {
    let {getAllByRole} = renderProgressList();

    for (let item of getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('id');
    }
  });

  it('should support custom render function', () => {
    let {getByRole, getAllByRole} = renderProgressList(
      {render: props => <ol {...props} data-custom="bar" />},
      {render: props => <li {...props} data-custom="true" />}
    );

    expect(getByRole('list')).toHaveAttribute('data-custom', 'bar');
    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveAttribute('data-custom', 'true');
    }
  });

  it('should support refs', () => {
    let listRef = React.createRef();
    let itemRef = React.createRef();
    let {getByRole} = render(
      <ProgressList selectedKey="a" aria-label="Setup" ref={listRef}>
        <ProgressListItem id="a" ref={itemRef}>
          <ProgressListItemContent>A</ProgressListItemContent>
        </ProgressListItem>
      </ProgressList>
    );

    expect(listRef.current).toBe(getByRole('list'));
    expect(itemRef.current).toBe(getByRole('listitem'));
  });

  it('should support slots', () => {
    let {getByRole} = render(
      <ProgressListContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <ProgressList slot="test" selectedKey="a">
          <ProgressListItem id="a">
            <ProgressListItemContent>A</ProgressListItemContent>
          </ProgressListItem>
        </ProgressList>
      </ProgressListContext.Provider>
    );

    let list = getByRole('list');
    expect(list).toHaveAttribute('slot', 'test');
    expect(list).toHaveAttribute('aria-label', 'test');
  });

  it('should label ProgressListItemContent with the step state', () => {
    let {getByRole} = render(
      <ProgressList selectedKey="a" aria-label="Setup">
        <ProgressListItem id="a">
          <ProgressListItemContent>Step A</ProgressListItemContent>
        </ProgressListItem>
      </ProgressList>
    );

    let step = getByRole('img');
    let [stateId, contentId] = step.getAttribute('aria-labelledby').split(' ');
    expect(document.getElementById(stateId)).toHaveTextContent('Current');
    expect(contentId).toBe(step.id);
  });

  it('should label ProgressListItemContent with the step state and a custom aria-labelledby', () => {
    let {getByRole} = render(
      <>
        <span id="step-label">Custom step</span>
        <span id="step-detail">Details</span>
        <ProgressList selectedKey="a" aria-label="Setup">
          <ProgressListItem id="a">
            <ProgressListItemContent aria-labelledby="step-label step-detail">
              Step A
            </ProgressListItemContent>
          </ProgressListItem>
        </ProgressList>
      </>
    );

    let content = getByRole('img');
    let status = getByRole('listitem').querySelector('[hidden]');
    expect(status).toHaveTextContent('Current');
    expect(content).toHaveAttribute('aria-labelledby', `${status.id} step-label step-detail`);
    expect(content).toHaveAccessibleName('Current Custom step Details');
  });

  it('should support className and style on ProgressListItemContent', () => {
    let {getByRole, rerender} = render(
      <ProgressList selectedKey="a" aria-label="Setup">
        <ProgressListItem id="a">
          <ProgressListItemContent>Step A</ProgressListItemContent>
        </ProgressListItem>
      </ProgressList>
    );

    expect(getByRole('img')).toHaveClass('react-aria-ProgressListItemContent');

    rerender(
      <ProgressList selectedKey="a" aria-label="Setup">
        <ProgressListItem id="a">
          <ProgressListItemContent className="content" style={{color: 'red'}}>
            Step A
          </ProgressListItemContent>
        </ProgressListItem>
      </ProgressList>
    );

    let content = getByRole('img');
    expect(content).toHaveClass('content');
    expect(content).not.toHaveClass('react-aria-ProgressListItemContent');
    expect(content.style.color).toBe('red');
  });

  it('should support custom render function on ProgressListItemContent', () => {
    let {getByRole} = render(
      <ProgressList selectedKey="a" aria-label="Setup">
        <ProgressListItem id="a">
          <ProgressListItemContent render={props => <div {...props} data-custom="content" />}>
            Step A
          </ProgressListItemContent>
        </ProgressListItem>
      </ProgressList>
    );

    let content = getByRole('img');
    expect(content).toHaveAttribute('data-custom', 'content');
    expect(content).toHaveClass('react-aria-ProgressListItemContent');
  });

  it('should render ProgressListItemContent as a non-focusable div', () => {
    let {getByRole} = render(
      <ProgressList selectedKey="a" aria-label="Setup">
        <ProgressListItem id="a">
          <ProgressListItemContent>Step A</ProgressListItemContent>
        </ProgressListItem>
      </ProgressList>
    );

    let content = getByRole('img');
    expect(content.tagName).toBe('DIV');
    expect(content).toHaveAttribute('role', 'img');
    expect(content).not.toHaveAttribute('tabindex');
  });
});
