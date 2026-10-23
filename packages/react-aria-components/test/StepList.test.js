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

import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {StepList, StepListContext, StepListItem, StepListItemContent} from '../src/StepList';

let steps = [
  {id: 'domain', label: 'Domain'},
  {id: 'dns', label: 'DNS'},
  {id: 'advanced', label: 'Advanced'}
];

let renderStepList = (listProps, itemProps) =>
  render(
    <StepList selectedKey="dns" aria-label="Setup" {...listProps}>
      {steps.map(step => (
        <StepListItem key={step.id} id={step.id} {...itemProps}>
          {step.label}
        </StepListItem>
      ))}
    </StepList>
  );

describe('StepList', () => {
  it('should render with default classes', () => {
    let {getByRole, getAllByRole} = renderStepList();
    expect(getByRole('list')).toHaveClass('react-aria-StepList');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('react-aria-StepListItem');
    }
  });

  it('should render with custom classes', () => {
    let {getByRole, getAllByRole} = renderStepList({className: 'steps'}, {className: 'step'});
    expect(getByRole('list')).toHaveClass('steps');

    for (let item of getAllByRole('listitem')) {
      expect(item).toHaveClass('step');
    }
  });

  it('should mark steps before the selected step as completed', () => {
    let {getAllByRole} = renderStepList();
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
    let {getAllByRole, rerender} = renderStepList({selectedKey: 'advanced'});
    let items = getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-completed');
    expect(items[1]).toHaveAttribute('data-completed');
    expect(items[2]).toHaveAttribute('data-current');

    rerender(
      <StepList selectedKey="domain" aria-label="Setup">
        {steps.map(step => (
          <StepListItem key={step.id} id={step.id}>
            {step.label}
          </StepListItem>
        ))}
      </StepList>
    );

    items = getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-current');
    expect(items[1]).not.toHaveAttribute('data-completed');
    expect(items[2]).not.toHaveAttribute('data-completed');
  });

  it('should mark no steps as completed when the selected step is not in the collection', () => {
    let {getAllByRole} = renderStepList({selectedKey: 'nope'});

    for (let item of getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('data-completed');
      expect(item).not.toHaveAttribute('data-current');
    }
  });

  it('should support dynamic collections', () => {
    let {getAllByRole} = render(
      <StepList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => <StepListItem>{step.label}</StepListItem>}
      </StepList>
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
      <StepList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => (
          <StepListItem>
            {({isCurrent, isCompleted}) =>
              isCurrent ? 'current' : isCompleted ? 'completed' : step.label
            }
          </StepListItem>
        )}
      </StepList>
    );

    expect(getAllByRole('listitem').map(item => item.lastChild.textContent)).toEqual([
      'completed',
      'current',
      'Advanced'
    ]);
  });

  it('should provide a 1-based step number to render props', () => {
    let {getAllByRole} = render(
      <StepList selectedKey="dns" aria-label="Setup" items={steps}>
        {() => <StepListItem>{({stepNumber}) => `Step ${stepNumber}`}</StepListItem>}
      </StepList>
    );

    expect(getAllByRole('listitem').map(item => item.lastChild.textContent)).toEqual([
      'Step 1',
      'Step 2',
      'Step 3'
    ]);
  });

  it('should provide the step number to className and style functions', () => {
    let {getAllByRole} = render(
      <StepList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => (
          <StepListItem
            className={({stepNumber}) => `step-${stepNumber}`}
            style={({stepNumber}) => ({order: stepNumber})}>
            {step.label}
          </StepListItem>
        )}
      </StepList>
    );

    let items = getAllByRole('listitem');
    expect(items.map(item => item.className)).toEqual(['step-1', 'step-2', 'step-3']);
    expect(items.map(item => item.style.order)).toEqual(['1', '2', '3']);
  });

  it('should support DOM props', () => {
    let {getByRole, getAllByRole} = renderStepList(
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
    let {getAllByRole} = renderStepList();

    for (let item of getAllByRole('listitem')) {
      expect(item).not.toHaveAttribute('id');
    }
  });

  it('should support custom render function', () => {
    let {getByRole, getAllByRole} = renderStepList(
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
      <StepList selectedKey="a" aria-label="Setup" ref={listRef}>
        <StepListItem id="a" ref={itemRef}>
          A
        </StepListItem>
      </StepList>
    );

    expect(listRef.current).toBe(getByRole('list'));
    expect(itemRef.current).toBe(getByRole('listitem'));
  });

  it('should support slots', () => {
    let {getByRole} = render(
      <StepListContext.Provider value={{slots: {test: {'aria-label': 'test'}}}}>
        <StepList slot="test" selectedKey="a">
          <StepListItem id="a">A</StepListItem>
        </StepList>
      </StepListContext.Provider>
    );

    let list = getByRole('list');
    expect(list).toHaveAttribute('slot', 'test');
    expect(list).toHaveAttribute('aria-label', 'test');
  });

  it('should label StepListItemContent with the step state', () => {
    let {getByRole} = render(
      <StepList selectedKey="a" aria-label="Setup">
        <StepListItem id="a">
          <StepListItemContent>Step A</StepListItemContent>
        </StepListItem>
      </StepList>
    );

    let step = getByRole('img');
    let [stateId, contentId] = step.getAttribute('aria-labelledby').split(' ');
    expect(document.getElementById(stateId)).toHaveTextContent('Current');
    expect(contentId).toBe(step.id);
  });

  it('should render StepListItemContent as a non-focusable div without an href', () => {
    let {getByRole} = render(
      <StepList selectedKey="a" aria-label="Setup">
        <StepListItem id="a">
          <StepListItemContent>Step A</StepListItemContent>
        </StepListItem>
      </StepList>
    );

    let content = getByRole('img');
    expect(content.tagName).toBe('DIV');
    expect(content).toHaveAttribute('role', 'img');
    expect(content).not.toHaveAttribute('tabindex');
    expect(content).not.toHaveAttribute('href');
  });

  it('should render StepListItemContent as an anchor when an href is provided', () => {
    let {getAllByRole} = render(
      <StepList selectedKey="dns" aria-label="Setup" items={steps}>
        {step => (
          <StepListItem>
            {({isCompleted}) => (
              <StepListItemContent href={isCompleted ? `#${step.id}` : undefined}>
                {step.label}
              </StepListItemContent>
            )}
          </StepListItem>
        )}
      </StepList>
    );

    let contents = [...getAllByRole('link'), ...getAllByRole('img')];
    expect(contents).toHaveLength(3);

    // Completed step gets the href.
    expect(contents[0].tagName).toBe('A');
    expect(contents[0]).toHaveAttribute('href', '#domain');
    expect(contents[0]).not.toHaveAttribute('role');

    // Current and upcoming steps do not.
    for (let content of contents.slice(1)) {
      expect(content.tagName).toBe('DIV');
      expect(content).toHaveAttribute('role', 'img');
      expect(content).not.toHaveAttribute('href');
    }
  });
});
