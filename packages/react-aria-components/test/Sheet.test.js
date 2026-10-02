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
  act,
  pointerMap,
  render,
  setupIntersectionObserverMock,
  within
} from '@react-spectrum/test-utils-internal';
import {Button} from '../src/Button';
import {Heading} from '../src/Heading';
import {I18nProvider} from 'react-aria/I18nProvider';
import React from 'react';
import {Sheet, SheetBackdrop, SheetContent, SheetOverlay, SheetTrigger} from '../src/Sheet';
import userEvent from '@testing-library/user-event';

// Sheet detects view timeline support when it loads. jsdom does not implement CSS.supports, so
// simulate a browser with view timeline support (e.g. Chrome or Safari).
jest.mock('../src/Sheet', () => {
  window.CSS.supports = () => true;
  return jest.requireActual('../src/Sheet');
});

function TestSheet({
  overlayProps = {},
  sheetProps = {},
  backdropProps = {},
  contentProps = {},
  triggerProps = {},
  children
}) {
  return (
    <SheetTrigger {...triggerProps}>
      <Button>Open sheet</Button>
      <SheetOverlay data-testid="overlay" {...overlayProps}>
        <SheetBackdrop data-testid="backdrop" {...backdropProps} />
        <Sheet data-testid="sheet" {...sheetProps}>
          <SheetContent {...contentProps}>
            {({close}) => (
              <>
                <Heading slot="title">Sheet title</Heading>
                <Button onPress={close}>Close</Button>
                {children}
              </>
            )}
          </SheetContent>
        </Sheet>
      </SheetOverlay>
    </SheetTrigger>
  );
}

describe('Sheet', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
    jest.useFakeTimers();
  });

  // jsdom does not implement Element#scrollTo.
  beforeEach(() => {
    Element.prototype.scrollTo = function (options) {
      if (options?.top != null) {
        this.scrollTop = options.top;
      }
      if (options?.left != null) {
        this.scrollLeft = options.left;
      }
    };
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
    delete Element.prototype.scrollTo;
  });

  async function open(tree) {
    await user.click(tree.getByRole('button', {name: 'Open sheet'}));
    return tree.getByRole('dialog');
  }

  it('renders an accessible modal dialog with default class names and attributes', async () => {
    let tree = render(<TestSheet />);
    expect(tree.queryByRole('dialog')).toBeNull();

    let dialog = await open(tree);
    let heading = within(dialog).getByRole('heading');
    expect(dialog).toHaveAttribute('aria-labelledby', heading.id);
    expect(dialog).toHaveClass('react-aria-SheetContent');
    expect(dialog).toHaveAttribute('data-sheet-content');

    let overlay = tree.getByTestId('overlay');
    let sheet = tree.getByTestId('sheet');
    let backdrop = tree.getByTestId('backdrop');
    expect(overlay).toHaveClass('react-aria-SheetOverlay');
    expect(sheet).toHaveClass('react-aria-Sheet');
    expect(backdrop).toHaveClass('react-aria-SheetBackdrop');
    expect(sheet).toContainElement(dialog);
    expect(overlay).toContainElement(sheet);
    expect(overlay).toContainElement(backdrop);

    for (let el of [overlay, sheet, backdrop]) {
      expect(el).toHaveAttribute('data-position', 'bottom');
      expect(el).toHaveAttribute('data-swipe-direction', 'bottom');
      expect(el).toHaveAttribute('data-stack-index', '0');
      expect(el).not.toHaveAttribute('data-has-descendants');
      expect(el).not.toHaveAttribute('data-expanded');
    }

    // Content outside the sheet is hidden from assistive technology.
    expect(tree.queryByRole('button', {name: 'Open sheet'})).toBeNull();
  });

  it.each`
    position    | swipeDirection  | expectedDirection
    ${'top'}    | ${undefined}    | ${'top'}
    ${'bottom'} | ${undefined}    | ${'bottom'}
    ${'left'}   | ${undefined}    | ${'left'}
    ${'right'}  | ${undefined}    | ${'right'}
    ${'center'} | ${undefined}    | ${'vertical'}
    ${'center'} | ${'horizontal'} | ${'horizontal'}
    ${'bottom'} | ${'vertical'}   | ${'vertical'}
  `(
    'uses swipe direction $expectedDirection for position $position with swipeDirection $swipeDirection',
    async ({position, swipeDirection, expectedDirection}) => {
      let tree = render(<TestSheet overlayProps={{position, swipeDirection}} />);
      await open(tree);

      for (let testId of ['overlay', 'sheet', 'backdrop']) {
        let el = tree.getByTestId(testId);
        expect(el).toHaveAttribute('data-position', position);
        expect(el).toHaveAttribute('data-swipe-direction', expectedDirection);
      }
    }
  );

  it.each`
    locale     | position    | swipeDirection | expectedPosition | expectedDirection
    ${'en-US'} | ${'start'}  | ${undefined}   | ${'left'}        | ${'left'}
    ${'en-US'} | ${'end'}    | ${undefined}   | ${'right'}       | ${'right'}
    ${'ar-AE'} | ${'start'}  | ${undefined}   | ${'right'}       | ${'right'}
    ${'ar-AE'} | ${'end'}    | ${undefined}   | ${'left'}        | ${'left'}
    ${'ar-AE'} | ${'left'}   | ${undefined}   | ${'left'}        | ${'left'}
    ${'en-US'} | ${'center'} | ${'start'}     | ${'center'}      | ${'left'}
    ${'ar-AE'} | ${'center'} | ${'end'}       | ${'center'}      | ${'left'}
  `(
    'resolves position $position and swipeDirection $swipeDirection in $locale',
    async ({locale, position, swipeDirection, expectedPosition, expectedDirection}) => {
      let tree = render(
        <I18nProvider locale={locale}>
          <TestSheet overlayProps={{position, swipeDirection}} />
        </I18nProvider>
      );
      await open(tree);

      for (let testId of ['overlay', 'sheet', 'backdrop']) {
        let el = tree.getByTestId(testId);
        expect(el).toHaveAttribute('data-position', expectedPosition);
        expect(el).toHaveAttribute('data-swipe-direction', expectedDirection);
      }

      let sheet = tree.getByTestId('sheet');
      expect(sheet.parentElement.parentElement).toHaveStyle({direction: 'ltr'});
      expect(sheet).toHaveStyle({direction: locale === 'ar-AE' ? 'rtl' : 'ltr'});
    }
  );

  it('passes sheet render props to className, style, and children functions', async () => {
    let expected = {
      position: 'left',
      swipeDirection: 'horizontal',
      stackIndex: 0,
      hasDescendants: false,
      isExpanded: false
    };
    let overlayClassName = jest.fn(() => 'custom-overlay');
    let overlayStyle = jest.fn(() => ({zIndex: 5}));
    let overlayChildren = jest.fn();
    let sheetClassName = jest.fn(() => 'custom-sheet');
    let sheetStyle = jest.fn(() => ({background: 'red'}));
    let sheetChildren = jest.fn();
    let backdropClassName = jest.fn(() => 'custom-backdrop');
    let backdropStyle = jest.fn(() => ({opacity: 0.5}));

    let tree = render(
      <SheetTrigger>
        <Button>Open sheet</Button>
        <SheetOverlay
          data-testid="overlay"
          position="left"
          swipeDirection="horizontal"
          className={overlayClassName}
          style={overlayStyle}>
          {renderProps => {
            overlayChildren(renderProps);
            return (
              <>
                <SheetBackdrop
                  data-testid="backdrop"
                  className={backdropClassName}
                  style={backdropStyle}
                />
                <Sheet data-testid="sheet" className={sheetClassName} style={sheetStyle}>
                  {sheetRenderProps => {
                    sheetChildren(sheetRenderProps);
                    return (
                      <SheetContent>
                        <Heading slot="title">Sheet title</Heading>
                      </SheetContent>
                    );
                  }}
                </Sheet>
              </>
            );
          }}
        </SheetOverlay>
      </SheetTrigger>
    );
    await open(tree);

    for (let fn of [
      overlayClassName,
      overlayStyle,
      overlayChildren,
      sheetClassName,
      sheetStyle,
      sheetChildren,
      backdropClassName,
      backdropStyle
    ]) {
      expect(fn).toHaveBeenLastCalledWith(expect.objectContaining(expected));
    }

    let overlay = tree.getByTestId('overlay');
    let sheet = tree.getByTestId('sheet');
    let backdrop = tree.getByTestId('backdrop');
    expect(overlay).toHaveClass('custom-overlay');
    expect(overlay).not.toHaveClass('react-aria-SheetOverlay');
    expect(overlay).toHaveStyle({zIndex: '5', position: 'absolute'});
    expect(sheet).toHaveClass('custom-sheet');
    expect(sheet).toHaveStyle({background: 'red', position: 'relative'});
    expect(backdrop).toHaveClass('custom-backdrop');
    expect(backdrop).toHaveStyle({opacity: '0.5', position: 'absolute'});
  });

  it('supports custom class names on SheetContent', async () => {
    let tree = render(<TestSheet contentProps={{className: 'custom-content'}} />);
    let dialog = await open(tree);
    expect(dialog).toHaveClass('custom-content');
    expect(dialog).not.toHaveClass('react-aria-SheetContent');
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    let onOpenChange = jest.fn();
    let tree = render(<TestSheet triggerProps={{onOpenChange}} />);
    let dialog = await open(tree);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(document.activeElement).toBe(dialog);

    await user.keyboard('{Escape}');
    act(() => jest.runAllTimers());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(tree.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(tree.getByRole('button', {name: 'Open sheet'}));
  });

  it('defers hiding outside content and focusing the dialog until the enter animation completes', async () => {
    // jsdom skips enter animations unless getAnimations is implemented.
    Element.prototype.getAnimations = () => [];
    try {
      let tree = render(<TestSheet />);
      let trigger = tree.getByRole('button', {name: 'Open sheet'});
      let dialog = await open(tree);
      let overlay = tree.getByTestId('overlay');
      expect(overlay).toHaveAttribute('data-entering');
      expect(document.activeElement).toBe(trigger);
      expect(trigger.closest('[inert], [aria-hidden="true"]')).toBeNull();

      let scroller = overlay.querySelector('[data-sheet-scroll]');
      await act(async () => {
        scroller.dispatchEvent(new Event('scrollend'));
      });
      expect(overlay).not.toHaveAttribute('data-entering');
      expect(document.activeElement).toBe(dialog);
      expect(trigger.closest('[inert], [aria-hidden="true"]')).not.toBeNull();
    } finally {
      delete Element.prototype.getAnimations;
    }
  });

  it('closes via the close function passed to SheetContent children', async () => {
    let tree = render(<TestSheet />);
    let dialog = await open(tree);
    await user.click(within(dialog).getByRole('button', {name: 'Close'}));
    act(() => jest.runAllTimers());
    expect(tree.queryByRole('dialog')).toBeNull();
  });

  it('closes when interacting outside the sheet by default', async () => {
    let tree = render(<TestSheet />);
    await open(tree);
    await user.click(tree.getByTestId('backdrop'));
    act(() => jest.runAllTimers());
    expect(tree.queryByRole('dialog')).toBeNull();
  });

  it('does not close when interacting outside a non-dismissable sheet', async () => {
    let tree = render(<TestSheet overlayProps={{preventDismissal: true}} />);
    await open(tree);
    await user.click(tree.getByTestId('backdrop'));
    act(() => jest.runAllTimers());
    expect(tree.getByRole('dialog')).toBeInTheDocument();

    // Escape still closes the sheet.
    await user.keyboard('{Escape}');
    act(() => jest.runAllTimers());
    expect(tree.queryByRole('dialog')).toBeNull();
  });

  it('supports controlled open state', async () => {
    let onOpenChange = jest.fn();
    let tree = render(<TestSheet overlayProps={{isOpen: false, onOpenChange}} />);
    expect(tree.queryByRole('dialog')).toBeNull();

    tree.rerender(<TestSheet overlayProps={{isOpen: true, onOpenChange}} />);
    let dialog = tree.getByRole('dialog');

    // Closing only requests a state change.
    await user.click(within(dialog).getByRole('button', {name: 'Close'}));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(tree.getByRole('dialog')).toBeInTheDocument();

    tree.rerender(<TestSheet overlayProps={{isOpen: false, onOpenChange}} />);
    act(() => jest.runAllTimers());
    expect(tree.queryByRole('dialog')).toBeNull();
  });

  describe('visibility', () => {
    let observe;
    let observer;
    beforeEach(() => {
      observe = jest.fn();
      observer = setupIntersectionObserverMock({observe});
    });

    function intersect(intersectionRatio) {
      act(() => {
        observer.instance.triggerCallback([{intersectionRatio}]);
      });
    }

    it('observes the sheet content visibility', async () => {
      let tree = render(<TestSheet />);
      let dialog = await open(tree);
      expect(observe).toHaveBeenCalledWith(dialog);
      expect(observer.instance.thresholds).toEqual([0, 1]);
    });

    it('marks the sheet as expanded only when fully visible', async () => {
      let tree = render(<TestSheet />);
      await open(tree);
      let testIds = ['overlay', 'sheet', 'backdrop'];

      intersect(0.5);
      for (let testId of testIds) {
        expect(tree.getByTestId(testId)).not.toHaveAttribute('data-expanded');
      }

      intersect(1);
      for (let testId of testIds) {
        expect(tree.getByTestId(testId)).toHaveAttribute('data-expanded', 'true');
      }

      intersect(0.5);
      for (let testId of testIds) {
        expect(tree.getByTestId(testId)).not.toHaveAttribute('data-expanded');
      }
    });

    it('closes when the sheet is swiped out of view', async () => {
      let onOpenChange = jest.fn();
      let tree = render(<TestSheet triggerProps={{onOpenChange}} />);
      await open(tree);

      intersect(1);
      intersect(0);
      act(() => jest.runAllTimers());
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
      expect(tree.queryByRole('dialog')).toBeNull();
    });

    it('does not close before the sheet has become visible', async () => {
      let onOpenChange = jest.fn();
      let tree = render(<TestSheet triggerProps={{onOpenChange}} />);
      await open(tree);

      // The initial observation reports the sheet as hidden while it is still entering.
      intersect(0);
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
      expect(tree.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('snap points', () => {
    it('renders a snap marker for each snap point with the first as the initial position', async () => {
      let tree = render(<TestSheet overlayProps={{snapPoints: ['180px', 50]}} />);
      await open(tree);

      let sheet = tree.getByTestId('sheet');
      let markers = Array.from(sheet.children).filter(
        el => el.style.scrollSnapAlign && el.getAttribute('role') !== 'dialog'
      );
      expect(markers).toHaveLength(2);
      expect(markers[0]).toHaveAttribute('data-sheet-initial');
      expect(markers[1]).not.toHaveAttribute('data-sheet-initial');

      // Bottom sheets rest their leading (top) edge at the snap point.
      expect(markers[0].style.scrollSnapAlign).toBe('start');
      expect(markers[0].style.scrollMarginTop).toBe('calc(100dvh - 180px)');
      // Numeric snap points are relative to the viewport along the swipe axis.
      expect(markers[1].style.scrollMarginTop).toBe('calc(100dvh - 50dvh)');
    });

    it.each`
      position   | property                | expected
      ${'top'}   | ${'scrollMarginBottom'} | ${'calc(100dvh - 180px)'}
      ${'left'}  | ${'scrollMarginRight'}  | ${'calc(100dvw - 180px)'}
      ${'right'} | ${'scrollMarginLeft'}   | ${'calc(100dvw - 180px)'}
    `(
      'anchors snap markers to the leading edge for $position sheets',
      async ({position, property, expected}) => {
        let tree = render(<TestSheet overlayProps={{position, snapPoints: ['180px']}} />);
        await open(tree);

        let marker = tree.getByTestId('sheet').querySelector('[data-sheet-initial]');
        expect(marker.style[property]).toBe(expected);
      }
    );

    it('does not render snap markers without snap points', async () => {
      let tree = render(<TestSheet />);
      await open(tree);
      expect(tree.getByTestId('sheet').querySelector('[data-sheet-initial]')).toBeNull();
    });

    it('measures the sheet when non-dismissable to clamp swiping to the smallest snap point', async () => {
      let observe = jest.fn();
      let disconnect = jest.fn();
      let originalResizeObserver = window.ResizeObserver;
      window.ResizeObserver = jest.fn(() => ({observe, disconnect, unobserve: jest.fn()}));
      try {
        let tree = render(
          <TestSheet overlayProps={{preventDismissal: true, snapPoints: ['180px', 50]}} />
        );
        await open(tree);
        let sheet = tree.getByTestId('sheet');
        expect(observe).toHaveBeenCalledWith(sheet);

        // Swiping past the smallest snap point is not possible, so the exit position is not a snap target.
        let scroller = sheet.closest('[data-sheet-scroll]');
        expect(scroller.firstElementChild.style.scrollSnapAlign).toBe('none');

        await user.keyboard('{Escape}');
        act(() => jest.runAllTimers());
        expect(disconnect).toHaveBeenCalled();
      } finally {
        window.ResizeObserver = originalResizeObserver;
      }
    });
  });

  describe('stacking', () => {
    function NestedSheets() {
      return (
        <TestSheet
          overlayProps={{'data-testid': 'parent-overlay'}}
          sheetProps={{
            'data-testid': 'parent-sheet',
            swipeAnimation: 'radius',
            stackAnimation: 'scaleBack'
          }}
          backdropProps={{'data-testid': 'parent-backdrop'}}>
          <SheetTrigger>
            <Button>Open child</Button>
            <SheetOverlay data-testid="child-overlay">
              <SheetBackdrop data-testid="child-backdrop" />
              <Sheet data-testid="child-sheet" stackAnimation="scaleBack">
                <SheetContent>
                  {({close}) => (
                    <>
                      <Heading slot="title">Child sheet</Heading>
                      <Button onPress={close}>Close child</Button>
                    </>
                  )}
                </SheetContent>
              </Sheet>
            </SheetOverlay>
          </SheetTrigger>
        </TestSheet>
      );
    }

    it('does not hide a nested sheet while it is entering', async () => {
      Element.prototype.getAnimations = () => [];
      try {
        let tree = render(<NestedSheets />);
        await user.click(tree.getByRole('button', {name: 'Open sheet'}));
        let enter = async overlay => {
          await act(async () => {
            overlay.querySelector('[data-sheet-scroll]').dispatchEvent(new Event('scrollend'));
          });
        };
        await enter(tree.getByTestId('parent-overlay'));

        await user.click(tree.getByRole('button', {name: 'Open child'}));
        let hidden = '[inert], [aria-hidden="true"]';
        let childSheet = tree.getByTestId('child-sheet');
        let parentSheet = tree.getByTestId('parent-sheet');
        expect(childSheet.closest(hidden)).toBeNull();
        expect(parentSheet.closest(hidden)).toBeNull();

        await enter(tree.getByTestId('child-overlay'));
        expect(childSheet.closest(hidden)).toBeNull();
        expect(parentSheet.closest(hidden)).not.toBeNull();
        expect(document.activeElement).toBe(tree.getByRole('dialog', {name: 'Child sheet'}));
      } finally {
        delete Element.prototype.getAnimations;
      }
    });

    it('tracks the stack index and descendants of nested sheets', async () => {
      let tree = render(<NestedSheets />);
      await open(tree);
      expect(document.documentElement.style.getPropertyValue('timeline-scope')).toBe(
        '--sheet-timeline-0'
      );

      await user.click(tree.getByRole('button', {name: 'Open child'}));
      let child = tree.getByRole('dialog', {name: 'Child sheet'});
      expect(child).toBeInTheDocument();

      for (let testId of ['parent-overlay', 'parent-sheet', 'parent-backdrop']) {
        let el = tree.getByTestId(testId);
        expect(el).toHaveAttribute('data-stack-index', '0');
        expect(el).toHaveAttribute('data-has-descendants', 'true');
      }
      for (let testId of ['child-overlay', 'child-sheet', 'child-backdrop']) {
        let el = tree.getByTestId(testId);
        expect(el).toHaveAttribute('data-stack-index', '1');
        expect(el).not.toHaveAttribute('data-has-descendants');
      }
      expect(document.documentElement.style.getPropertyValue('timeline-scope')).toBe(
        '--sheet-timeline-0, --sheet-timeline-1'
      );

      await user.click(within(child).getByRole('button', {name: 'Close child'}));
      act(() => jest.runAllTimers());
      expect(tree.queryByRole('dialog', {name: 'Child sheet'})).toBeNull();
      for (let testId of ['parent-overlay', 'parent-sheet', 'parent-backdrop']) {
        expect(tree.getByTestId(testId)).not.toHaveAttribute('data-has-descendants');
      }
      expect(document.documentElement.style.getPropertyValue('timeline-scope')).toBe(
        '--sheet-timeline-0'
      );

      await user.keyboard('{Escape}');
      act(() => jest.runAllTimers());
      expect(tree.queryByRole('dialog')).toBeNull();
      expect(document.documentElement.style.getPropertyValue('timeline-scope')).toBe('');
    });

    it('animates parent sheets along the view timelines of their descendants', async () => {
      let tree = render(<NestedSheets />);
      await open(tree);
      let parentSheet = tree.getByTestId('parent-sheet');
      expect(parentSheet.style.animationName).toBe('radius');
      expect(parentSheet.style.animationTimeline).toBe('--sheet-timeline-0');

      await user.click(tree.getByRole('button', {name: 'Open child'}));
      expect(parentSheet.style.animationName).toBe('radius, scaleBack');
      expect(parentSheet.style.animationTimeline).toBe('--sheet-timeline-0, --sheet-timeline-1');
      expect(parentSheet.style.animationRange).toBe('entry 0% entry 100%, entry');
      expect(parentSheet.style.animationDirection).toBe('normal, normal');
      expect(parentSheet.style.animationComposition).toBe('replace, accumulate');

      // The child has no descendants, so it has no stack animation.
      expect(tree.getByTestId('child-sheet').style.animationName).toBe('');

      await user.click(tree.getByRole('button', {name: 'Close child'}));
      act(() => jest.runAllTimers());
      expect(parentSheet.style.animationName).toBe('radius');
      expect(parentSheet.style.animationTimeline).toBe('--sheet-timeline-0');
    });

    it('closes only the topmost sheet on Escape', async () => {
      let tree = render(<NestedSheets />);
      await open(tree);
      await user.click(tree.getByRole('button', {name: 'Open child'}));
      let child = tree.getByRole('dialog', {name: 'Child sheet'});
      expect(document.activeElement).toBe(child);

      await user.keyboard('{Escape}');
      act(() => jest.runAllTimers());
      expect(tree.queryByRole('dialog', {name: 'Child sheet'})).toBeNull();
      expect(tree.getByRole('dialog', {name: 'Sheet title'})).toBeInTheDocument();
      expect(document.activeElement).toBe(tree.getByRole('button', {name: 'Open child'}));
    });
  });

  describe('overscroll padding', () => {
    it.each`
      position    | padding            | margin            | size
      ${'bottom'} | ${'paddingBottom'} | ${'marginBottom'} | ${'100vh'}
      ${'top'}    | ${'paddingTop'}    | ${'marginTop'}    | ${'100vh'}
      ${'left'}   | ${'paddingLeft'}   | ${'marginLeft'}   | ${'100vw'}
      ${'right'}  | ${'paddingRight'}  | ${'marginRight'}  | ${'100vw'}
    `(
      'extends $position sheets beyond the viewport edge',
      async ({position, padding, margin, size}) => {
        let tree = render(
          <TestSheet overlayProps={{position}} sheetProps={{overscrollPadding: true}} />
        );
        await open(tree);
        let sheet = tree.getByTestId('sheet');
        expect(sheet.style[padding]).toBe(size);
        expect(sheet.style[margin]).toBe(`-${size}`);
      }
    );

    it('does not add padding when the sheet is not swiped toward its edge', async () => {
      let tree = render(
        <TestSheet
          overlayProps={{position: 'bottom', swipeDirection: 'vertical'}}
          sheetProps={{overscrollPadding: true}}
        />
      );
      await open(tree);
      let sheet = tree.getByTestId('sheet');
      expect(sheet.style.paddingBottom).toBe('');
      expect(sheet.style.marginBottom).toBe('');
    });
  });

  describe('swipe animations', () => {
    it.each`
      swipeDirection  | range                                            | direction      | iterations
      ${'bottom'}     | ${'entry 0% entry 100%'}                         | ${'normal'}    | ${'1'}
      ${'right'}      | ${'entry 0% entry 100%'}                         | ${'normal'}    | ${'1'}
      ${'top'}        | ${'exit calc(100% - 100%) exit calc(100% - 0%)'} | ${'reverse'}   | ${'1'}
      ${'left'}       | ${'exit calc(100% - 100%) exit calc(100% - 0%)'} | ${'reverse'}   | ${'1'}
      ${'vertical'}   | ${'cover 0% cover 100%'}                         | ${'alternate'} | ${'2'}
      ${'horizontal'} | ${'cover 0% cover 100%'}                         | ${'alternate'} | ${'2'}
    `(
      'binds swipe animations to the view timeline when swiping $swipeDirection',
      async ({swipeDirection, range, direction, iterations}) => {
        let tree = render(
          <TestSheet
            overlayProps={{swipeDirection}}
            sheetProps={{swipeAnimation: 'sheetAnimation'}}
            backdropProps={{swipeAnimation: 'backdropAnimation'}}
          />
        );
        await open(tree);

        for (let [testId, name] of [
          ['sheet', 'sheetAnimation'],
          ['backdrop', 'backdropAnimation']
        ]) {
          let style = tree.getByTestId(testId).style;
          expect(style.animationName).toBe(name);
          expect(style.animationTimeline).toBe('--sheet-timeline-0');
          expect(style.animationRange).toBe(range);
          expect(style.animationDirection).toBe(direction);
          expect(style.animationIterationCount).toBe(iterations);
          expect(style.animationFillMode).toBe('both');
          expect(style.animationTimingFunction).toBe('linear');
        }
      }
    );

    it('limits swipe animations to the given snap point range', async () => {
      let tree = render(
        <TestSheet
          overlayProps={{snapPoints: ['180px']}}
          sheetProps={{swipeAnimation: 'sheetAnimation', swipeAnimationRange: {end: 0}}}
          backdropProps={{swipeAnimation: 'backdropAnimation', swipeAnimationRange: {start: 0}}}
        />
      );
      await open(tree);
      expect(tree.getByTestId('sheet').style.animationRange).toBe('entry 0% entry 180px');
      expect(tree.getByTestId('backdrop').style.animationRange).toBe('entry 180px entry 100%');
    });

    it('does not add animations by default', async () => {
      let tree = render(<TestSheet />);
      await open(tree);
      expect(tree.getByTestId('sheet').style.animationName).toBe('');
      expect(tree.getByTestId('backdrop').style.animationName).toBe('');
    });
  });

  describe('view timelines', () => {
    it('names the view timeline on SheetContent by stack index', async () => {
      let tree = render(<TestSheet />);
      let dialog = await open(tree);
      expect(dialog.style.viewTimelineName).toBe('--sheet-timeline-0');
      expect(dialog.style.viewTimelineAxis).toBe('y');
    });

    it.each`
      position    | axis   | inset
      ${'bottom'} | ${'y'} | ${'0 100dvh'}
      ${'top'}    | ${'y'} | ${'100dvh 0'}
      ${'left'}   | ${'x'} | ${'100dvw 0'}
      ${'right'}  | ${'x'} | ${'0 100dvw'}
      ${'center'} | ${'y'} | ${'0 100dvh'}
    `('uses a $axis axis view timeline for $position sheets', async ({position, axis, inset}) => {
      let tree = render(<TestSheet overlayProps={{position}} />);
      let dialog = await open(tree);
      expect(dialog.style.viewTimelineAxis).toBe(axis);
      expect(dialog.style.viewTimelineInset).toBe(inset);
    });
  });
});
