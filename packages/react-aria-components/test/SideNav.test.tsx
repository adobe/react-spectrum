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

import {act, pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {Link} from '../src/Link';
import React from 'react';
import {
  SideNav,
  SideNavHeader,
  SideNavItem,
  SideNavItemContent,
  SideNavProps,
  SideNavSection
} from '../src/SideNav';
import userEvent, {UserEvent} from '@testing-library/user-event';

// libraries > (projects-1, projects-2); files is a top-level leaf.
function SideNavExample(props: Partial<SideNavProps<unknown>>) {
  return (
    <SideNav aria-label="Test sidenav" {...props}>
      <SideNavItem id="files" href="/files" textValue="Your files">
        <SideNavItemContent>
          <Link>Your files</Link>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="libraries" href="/libraries" textValue="Your libraries">
        <SideNavItemContent>
          <Link>Your libraries</Link>
          <Button slot="chevron" aria-label="expand">
            ▶
          </Button>
        </SideNavItemContent>
        <SideNavItem id="projects-1" href="/projects-1" textValue="Projects 1">
          <SideNavItemContent>
            <Link>Projects 1</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
    </SideNav>
  );
}

// files (leaf) then libraries > projects-1 > projects-1A
function ThreeLevelSideNavExample(props: Partial<SideNavProps<unknown>>) {
  return (
    <SideNav aria-label="Test sidenav" {...props}>
      <SideNavItem id="files" href="/files" textValue="Your files">
        <SideNavItemContent>
          <Link>Your files</Link>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="libraries" href="/libraries" textValue="Your libraries">
        <SideNavItemContent>
          <Link>Your libraries</Link>
          <Button slot="chevron" aria-label="expand">
            ▶
          </Button>
        </SideNavItemContent>
        <SideNavItem id="projects-1" href="/projects-1" textValue="Projects 1">
          <SideNavItemContent>
            <Link>Projects 1</Link>
            <Button slot="chevron" aria-label="expand">
              ▶
            </Button>
          </SideNavItemContent>
          <SideNavItem id="projects-1A" href="/projects-1A" textValue="Projects 1A">
            <SideNavItemContent>
              <Link>Projects 1A</Link>
            </SideNavItemContent>
          </SideNavItem>
        </SideNavItem>
      </SideNavItem>
    </SideNav>
  );
}

// files (leaf) then a no-href "Section" row with a secondary-action button (not a chevron) and
// a linked child. Focus should land on the row itself, not jump into the secondary action.
function NoLinkActionMenuSideNavExample(props: Partial<SideNavProps<unknown>>) {
  return (
    <SideNav aria-label="Test sidenav" {...props}>
      <SideNavItem id="files" href="/files" textValue="Your files">
        <SideNavItemContent>
          <Link>Your files</Link>
        </SideNavItemContent>
      </SideNavItem>
      <SideNavItem id="section" textValue="Section">
        <SideNavItemContent>
          Section
          <Button aria-label="More actions">•••</Button>
          <Button slot="chevron" aria-label="expand">
            ▶
          </Button>
        </SideNavItemContent>
        <SideNavItem id="section-2" href="/section-2" textValue="Section 2">
          <SideNavItemContent>
            <Link>Section 2</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavItem>
    </SideNav>
  );
}

// Section 1 has an aria-label instead of a SideNavHeader (as is allowed by the underlying
// TreeSection); Section 2 uses a SideNavHeader so both default classes get covered.
function SectionSideNavExample(props: Partial<SideNavProps<unknown>>) {
  return (
    <SideNav aria-label="Test sidenav" {...props}>
      <SideNavSection aria-label="Section 1">
        <SideNavItem id="files" href="/files" textValue="Your files">
          <SideNavItemContent>
            <Link>Your files</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavSection>
      <SideNavSection>
        <SideNavHeader>Section 2</SideNavHeader>
        <SideNavItem id="libraries" href="/libraries" textValue="Your libraries">
          <SideNavItemContent>
            <Link>Your libraries</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNavSection>
    </SideNav>
  );
}

describe('SideNav', () => {
  let user: UserEvent;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });
  afterEach(() => {
    act(() => jest.runAllTimers());
  });

  it('renders a treegrid with default classes and nested items', () => {
    let {getByRole, getAllByRole} = render(<SideNavExample />);
    let sideNav = getByRole('treegrid');
    expect(sideNav).toHaveClass('react-aria-SideNav');
    expect(sideNav).toHaveAttribute('aria-label', 'Test sidenav');
    let rows = getAllByRole('row');
    expect(rows[0]).toHaveClass('react-aria-SideNavItem');
    expect(getByRole('link', {name: 'Your files'})).toBeInTheDocument();
  });

  it('expands and collapses a level with the chevron', async () => {
    let {getByRole, queryByRole} = render(<SideNavExample />);
    let librariesRow = getByRole('row', {name: 'Your libraries'});
    expect(librariesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();

    await user.click(within(librariesRow).getByRole('button'));
    expect(librariesRow).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Projects 1'})).toBeInTheDocument();
  });

  it('exposes row render props via SideNavItem className function', () => {
    let {getByRole} = render(
      <SideNav aria-label="s">
        <SideNavItem
          id="files"
          href="/files"
          textValue="Your files"
          className={({level}) => `lvl-${level}`}>
          <SideNavItemContent>
            <Link>Your files</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    );
    expect(getByRole('row', {name: 'Your files'})).toHaveClass('lvl-1');
  });

  it('marks the link matching selectedRoute with aria-current and data-current on the row', () => {
    let {getByRole, rerender} = render(<SideNavExample selectedRoute="/files" />);
    expect(getByRole('link', {name: 'Your files'})).toHaveAttribute('aria-current', 'page');
    expect(getByRole('row', {name: 'Your files'})).toHaveAttribute('data-current', 'true');
    expect(getByRole('link', {name: 'Your libraries'})).not.toHaveAttribute('aria-current');
    expect(getByRole('row', {name: 'Your libraries'})).not.toHaveAttribute('data-current');

    rerender(<SideNavExample selectedRoute="/libraries" />);
    expect(getByRole('link', {name: 'Your files'})).not.toHaveAttribute('aria-current');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveAttribute('aria-current', 'page');
  });

  it('exposes isCurrent through SideNavItemContent render props', () => {
    let {getByRole} = render(
      <SideNav aria-label="s" selectedRoute="/files">
        <SideNavItem id="files" href="/files" textValue="Your files">
          <SideNavItemContent>
            {({isCurrent}) => <Link data-testid="files-link">{isCurrent ? 'current' : 'not'}</Link>}
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    );
    expect(getByRole('link')).toHaveTextContent('current');
  });

  it('initial focus moves to the selected route', async () => {
    let {getByRole} = render(
      <ThreeLevelSideNavExample defaultExpandedKeys={['libraries']} selectedRoute="/projects-1" />
    );
    await user.tab();
    expect(getByRole('link', {name: 'Projects 1'})).toHaveFocus();
  });

  it('falls back to the closest visible ancestor when selectedRoute is under a collapsed parent', async () => {
    let {getByRole, queryByRole} = render(<ThreeLevelSideNavExample selectedRoute="/projects-1" />);
    expect(getByRole('row', {name: 'Your libraries'})).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();
    await user.tab();
    expect(getByRole('link', {name: 'Your libraries'})).toHaveFocus();
  });

  it('skips an expanded-but-hidden (by something higher up) ancestor and lands on the closest rendered ancestor', async () => {
    let {getByRole, queryByRole} = render(
      <ThreeLevelSideNavExample defaultExpandedKeys={['projects-1']} selectedRoute="/projects-1A" />
    );
    expect(getByRole('row', {name: 'Your libraries'})).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();
    await user.tab();
    expect(getByRole('link', {name: 'Your libraries'})).toHaveFocus();
  });

  it('exposes isCurrentAncestor (render prop + data-current-ancestor) for every ancestor of the current item, regardless of expanded state', async () => {
    function Example(props: Partial<SideNavProps<unknown>>) {
      return (
        <SideNav aria-label="s" {...props}>
          <SideNavItem id="libraries" href="/libraries" textValue="Your libraries">
            <SideNavItemContent>
              {({isCurrentAncestor}) => (
                <>
                  <Link>Your libraries</Link>
                  <Button slot="chevron" aria-label="expand">
                    ▶
                  </Button>
                  <span data-testid="anc">{String(isCurrentAncestor)}</span>
                </>
              )}
            </SideNavItemContent>
            <SideNavItem id="projects-1" href="/projects-1" textValue="Projects 1">
              <SideNavItemContent>
                <Link>Projects 1</Link>
              </SideNavItemContent>
            </SideNavItem>
          </SideNavItem>
        </SideNav>
      );
    }
    // Collapsed parent whose descendant is current.
    let {getByTestId, getByRole, unmount} = render(<Example selectedRoute="/projects-1" />);
    expect(getByTestId('anc')).toHaveTextContent('true');
    expect(getByRole('row', {name: 'Your libraries'})).toHaveAttribute(
      'data-current-ancestor',
      'true'
    );
    unmount();

    // Expanded parent whose descendant is current.
    ({getByTestId, getByRole, unmount} = render(
      <Example selectedRoute="/projects-1" defaultExpandedKeys={['libraries']} />
    ));
    expect(getByTestId('anc')).toHaveTextContent('true');
    expect(getByRole('row', {name: 'Your libraries'})).toHaveAttribute(
      'data-current-ancestor',
      'true'
    );
    unmount();

    // Parent itself current, not an ancestor of itself.
    ({getByTestId, getByRole} = render(<Example selectedRoute="/libraries" />));
    expect(getByTestId('anc')).toHaveTextContent('false');
    expect(getByRole('row', {name: 'Your libraries'})).not.toHaveAttribute('data-current-ancestor');
  });

  it('expands/collapses with ArrowRight/ArrowLeft on the link', async () => {
    let {getByRole, queryByRole} = render(<SideNavExample />);
    let librariesRow = getByRole('row', {name: 'Your libraries'});
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(librariesRow).toHaveAttribute('aria-expanded', 'true');
    expect(getByRole('link', {name: 'Projects 1'})).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(librariesRow).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1'})).toBeNull();
  });

  it('takes one tab to leave the sidenav from a link', async () => {
    let {getByRole} = render(
      <>
        <SideNavExample selectedRoute="/files" />
        <input type="text" />
      </>
    );
    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();
    await user.tab();
    expect(getByRole('textbox')).toHaveFocus();
  });

  it('takes one shift+tab to leave the sidenav from a link', async () => {
    let {getByRole} = render(
      <>
        <input type="text" />
        <SideNavExample selectedRoute="/files" />
      </>
    );
    await user.tab();
    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();
    await user.tab({shift: true});
    expect(getByRole('textbox')).toHaveFocus();
  });

  it('keeps focus on the row (not a secondary action) for an item with no href/link', async () => {
    let {getByRole} = render(<NoLinkActionMenuSideNavExample />);
    await user.tab();
    expect(getByRole('link', {name: 'Your files'})).toHaveFocus();

    await user.keyboard('{ArrowDown}');

    // Focus stays on the row itself; it does not jump into the secondary-action button.
    let sectionRow = getByRole('row', {name: 'Section'});
    expect(sectionRow).toHaveFocus();
    expect(within(sectionRow).getByRole('button', {name: 'More actions'})).not.toHaveFocus();
  });

  it('arrow left from a deep leaf steps to parent, collapses it, then moves to the grandparent', async () => {
    let {getByRole, queryByRole} = render(
      <ThreeLevelSideNavExample
        defaultExpandedKeys={['libraries', 'projects-1']}
        selectedRoute="/projects-1A"
      />
    );
    await user.tab();
    expect(getByRole('link', {name: 'Projects 1A'})).toHaveFocus();

    // 1st ArrowLeft: leaf has nothing to collapse, so focus moves up to its parent.
    await user.keyboard('{ArrowLeft}');
    expect(getByRole('link', {name: 'Projects 1'})).toHaveFocus();
    expect(getByRole('row', {name: 'Projects 1'})).toHaveAttribute('aria-expanded', 'true');

    // 2nd ArrowLeft: the parent is expanded, so it collapses; focus stays on it.
    await user.keyboard('{ArrowLeft}');
    expect(getByRole('row', {name: 'Projects 1'})).toHaveAttribute('aria-expanded', 'false');
    expect(queryByRole('link', {name: 'Projects 1A'})).toBeNull();
    expect(getByRole('link', {name: 'Projects 1'})).toHaveFocus();

    // 3rd ArrowLeft: focus moves up to the grandparent.
    await user.keyboard('{ArrowLeft}');
    expect(getByRole('link', {name: 'Your libraries'})).toHaveFocus();
  });

  it('should render a SideNav with default classes, including sections and headers', () => {
    let {getByRole, getAllByRole} = render(<SectionSideNavExample />);
    let sideNav = getByRole('treegrid');
    expect(sideNav).toHaveClass('react-aria-SideNav');

    let rows = getAllByRole('row');
    // The header is also exposed with role="row", but it gets 'react-aria-SideNavHeader'
    // instead of 'react-aria-SideNavItem', so it is excluded from this loop.
    let itemRows = rows.filter(row => !row.classList.contains('react-aria-SideNavHeader'));
    expect(itemRows).toHaveLength(2);
    for (let row of itemRows) {
      expect(row).toHaveClass('react-aria-SideNavItem');
    }

    let groups = getAllByRole('rowgroup');
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveClass('react-aria-SideNavSection');
    expect(groups[1]).toHaveClass('react-aria-SideNavSection');

    let header = rows[1];
    expect(header).toHaveClass('react-aria-SideNavHeader');
    expect(within(header).getByRole('rowheader')).toHaveTextContent('Section 2');
  });

  it('should support custom classes on SideNav and SideNavItem', () => {
    let {getByRole} = render(
      <SideNav aria-label="s" className="test-sidenav">
        <SideNavItem id="files" href="/files" textValue="Your files" className="test-row">
          <SideNavItemContent>
            <Link>Your files</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    );
    expect(getByRole('treegrid')).toHaveClass('test-sidenav');
    expect(getByRole('row')).toHaveClass('test-row');
  });

  it('should support DOM props on SideNav and SideNavItem', () => {
    let {getByRole} = render(
      <SideNav aria-label="s" data-testid="test-sidenav">
        <SideNavItem id="files" href="/files" textValue="Your files" data-testid="test-row">
          <SideNavItemContent>
            <Link>Your files</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    );
    expect(getByRole('treegrid')).toHaveAttribute('data-testid', 'test-sidenav');
    expect(getByRole('row')).toHaveAttribute('data-testid', 'test-row');
  });

  it('should support style on SideNav', () => {
    let {getByRole} = render(<SideNavExample style={{width: 200}} />);
    expect(getByRole('treegrid')).toHaveAttribute('style', expect.stringContaining('width: 200px'));
  });

  it('should have the base set of data attributes', () => {
    let {getByRole, getAllByRole} = render(<SideNavExample />);
    let sideNav = getByRole('treegrid');
    expect(sideNav).toHaveAttribute('data-rac');
    expect(sideNav).not.toHaveAttribute('data-empty');
    expect(sideNav).not.toHaveAttribute('data-focused');
    expect(sideNav).not.toHaveAttribute('data-focus-visible');

    for (let row of getAllByRole('row')) {
      expect(row).toHaveAttribute('data-rac');
      expect(row).toHaveAttribute('data-level');
      expect(row).not.toHaveAttribute('data-selected');
      expect(row).not.toHaveAttribute('data-disabled');
      expect(row).not.toHaveAttribute('data-hovered');
      expect(row).not.toHaveAttribute('data-focused');
      expect(row).not.toHaveAttribute('data-focus-visible');
      expect(row).not.toHaveAttribute('data-pressed');
      expect(row).not.toHaveAttribute('data-selection-mode');
      expect(row).not.toHaveAttribute('data-current');
    }
  });

  it('should set data-current, data-expanded, data-has-child-items, data-level, and data-current-ancestor', () => {
    let {getByRole} = render(
      <ThreeLevelSideNavExample
        defaultExpandedKeys={['libraries', 'projects-1']}
        selectedRoute="/projects-1"
      />
    );
    let filesRow = getByRole('row', {name: 'Your files'});
    let librariesRow = getByRole('row', {name: 'Your libraries'});
    let projects1Row = getByRole('row', {name: 'Projects 1'});
    let projects1ARow = getByRole('row', {name: 'Projects 1A'});

    expect(projects1Row).toHaveAttribute('data-current', 'true');
    expect(filesRow).not.toHaveAttribute('data-current');
    expect(librariesRow).not.toHaveAttribute('data-current');
    expect(projects1ARow).not.toHaveAttribute('data-current');

    expect(librariesRow).toHaveAttribute('data-expanded', 'true');
    expect(librariesRow).toHaveAttribute('data-has-child-items', 'true');
    expect(projects1Row).toHaveAttribute('data-expanded', 'true');
    expect(projects1Row).toHaveAttribute('data-has-child-items', 'true');
    expect(projects1ARow).not.toHaveAttribute('data-expanded');
    expect(projects1ARow).not.toHaveAttribute('data-has-child-items');

    expect(filesRow).toHaveAttribute('data-level', '1');
    expect(librariesRow).toHaveAttribute('data-level', '1');
    expect(projects1Row).toHaveAttribute('data-level', '2');
    expect(projects1ARow).toHaveAttribute('data-level', '3');

    expect(librariesRow).toHaveAttribute('data-current-ancestor', 'true');
    expect(filesRow).not.toHaveAttribute('data-current-ancestor');
    expect(projects1Row).not.toHaveAttribute('data-current-ancestor');
    expect(projects1ARow).not.toHaveAttribute('data-current-ancestor');
  });

  it('sets data-focus-visible (and isFocusVisible) on the row for the link, not other children', async () => {
    let {getByRole} = render(
      <SideNav aria-label="s" selectedRoute="/files">
        <SideNavItem
          id="files"
          href="/files"
          textValue="Your files"
          className={({isFocusVisible}) => (isFocusVisible ? 'ring' : 'no-ring')}>
          <SideNavItemContent>
            <Link>Your files</Link>
            <Button>Other</Button>
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    );
    let row = getByRole('row', {name: /Your files/});
    let link = getByRole('link', {name: 'Your files'});
    let other = getByRole('button', {name: 'Other'});

    expect(row).not.toHaveAttribute('data-focus-visible');

    await user.tab();
    expect(link).toHaveFocus();
    expect(row).toHaveAttribute('data-focus-visible', 'true');
    expect(row).toHaveClass('ring');

    // Tabbing to the other button keeps focus within the row, but focus-visible does not follow it.
    await user.tab();
    expect(other).toHaveFocus();
    expect(row).not.toHaveAttribute('data-focus-visible');
    expect(row).toHaveClass('no-ring');
  });

  it('exposes isCurrent on the SideNavItem className render props', () => {
    let {getByRole} = render(
      <SideNav aria-label="s" selectedRoute="/files">
        <SideNavItem
          id="files"
          href="/files"
          textValue="Your files"
          className={({isCurrent}) => (isCurrent ? 'current' : 'not-current')}>
          <SideNavItemContent>
            <Link>Your files</Link>
          </SideNavItemContent>
        </SideNavItem>
        <SideNavItem
          id="libraries"
          href="/libraries"
          textValue="Your libraries"
          className={({isCurrent}) => (isCurrent ? 'current' : 'not-current')}>
          <SideNavItemContent>
            <Link>Your libraries</Link>
          </SideNavItemContent>
        </SideNavItem>
      </SideNav>
    );
    expect(getByRole('row', {name: 'Your files'})).toHaveClass('current');
    expect(getByRole('row', {name: 'Your files'})).toHaveAttribute('data-current', 'true');
    expect(getByRole('row', {name: 'Your libraries'})).toHaveClass('not-current');
    expect(getByRole('row', {name: 'Your libraries'})).not.toHaveAttribute('data-current');
  });
});
