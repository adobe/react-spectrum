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

import {act, fireEvent, render, within} from '@react-spectrum/test-utils-internal';
import {
  Attachment,
  AttachmentGrid,
  AttachmentGridItem,
  AttachmentList,
  LightboxCarousel,
  LightboxCarouselProps,
  LightboxItem,
  LightboxItems,
  LightboxPicker,
  LightboxPickerItem,
  LightboxTrigger
} from '@react-spectrum/ai';
import {I18nProvider} from 'react-aria/I18nProvider';
import {Image} from '@react-spectrum/s2/Image';
import {Key} from '@react-types/shared';
import React from 'react';
import userEvent from '@testing-library/user-event';

const ids = ['one', 'two', 'three', 'four', 'five'];

interface CarouselProps extends Omit<LightboxCarouselProps, 'children'> {
  itemIds?: string[];
  withControls?: boolean | string[];
}

function Carousel({itemIds = ids, withControls = false, ...props}: CarouselProps) {
  return (
    <LightboxCarousel aria-label="Photos" {...props}>
      <LightboxPicker aria-label="Choose photo">
        {itemIds.map(id => (
          <LightboxPickerItem key={id} id={id} aria-label={`Photo ${id}`}>
            <Image src={`https://example.com/${id}.png`} alt="" />
          </LightboxPickerItem>
        ))}
      </LightboxPicker>
      <LightboxItems>
        {itemIds.map(id => (
          <LightboxItem key={id} id={id} data-testid={`slide-${id}`}>
            <Image src={`https://example.com/${id}.png`} alt={`Photo ${id}`} />
            {(withControls === true ||
              (Array.isArray(withControls) && withControls.includes(id))) && (
              <>
                <input
                  aria-label={`Caption ${id}`}
                  onKeyDown={e => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                      e.stopPropagation();
                    }
                  }}
                />
                <button>Download {id}</button>
              </>
            )}
          </LightboxItem>
        ))}
      </LightboxItems>
    </LightboxCarousel>
  );
}

function AttachmentExample({
  layout = 'grid',
  onAction
}: {
  layout?: 'grid' | 'list';
  onAction?: (key: Key) => void;
}) {
  return (
    <LightboxTrigger>
      {layout === 'grid' ? (
        <AttachmentGrid aria-label="Attachments" onAction={onAction}>
          {ids.map(id => (
            <AttachmentGridItem key={id} id={id} aria-label={`File ${id}`} textValue={`File ${id}`}>
              <Image slot="thumbnail" src="https://example.com/image.png" alt="" />
            </AttachmentGridItem>
          ))}
        </AttachmentGrid>
      ) : (
        <AttachmentList aria-label="Attachments" onAction={onAction}>
          {ids.map(id => (
            <Attachment key={id} id={id} aria-label={`File ${id}`} textValue={`File ${id}`}>
              <Image slot="thumbnail" src="https://example.com/image.png" alt="" />
            </Attachment>
          ))}
        </AttachmentList>
      )}
      <Carousel />
    </LightboxTrigger>
  );
}

const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;
describeOrSkip('Lightbox', () => {
  let user: ReturnType<typeof userEvent.setup>;
  let scrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo');

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: jest.fn()
    });
  });

  afterAll(() => {
    if (scrollTo) {
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', scrollTo);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo');
    }
  });

  beforeEach(() => {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null});
  });

  afterEach(() => {
    act(() => jest.runAllTimers());
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('attachment integration', () => {
    it.each(['grid', 'list'] as const)(
      'opens the matching slide from the attachment %s and navigates the modal without another onAction call',
      async layout => {
        let onAction = jest.fn();
        let {getByLabelText, getByRole} = render(
          <AttachmentExample layout={layout} onAction={onAction} />
        );

        await user.click(getByLabelText('File three'));

        let dialog = within(getByRole('dialog'));
        expect(within(dialog.getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName(
          'Photo three'
        );

        await user.click(dialog.getByRole('button', {name: 'Next attachment'}));
        expect(within(dialog.getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName(
          'Photo four'
        );
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(onAction).toHaveBeenCalledWith('three');
      }
    );

    it('opens the newly activated attachment after closing and reopening', async () => {
      let {getByLabelText, getByRole, queryByRole} = render(<AttachmentExample />);

      await user.click(getByLabelText('File two'));
      await user.click(within(getByRole('dialog')).getByRole('button', {name: 'Dismiss'}));
      act(() => jest.runAllTimers());
      expect(queryByRole('dialog')).not.toBeInTheDocument();

      await user.click(getByLabelText('File four'));
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo four');
    });
  });

  describe('labelling', () => {
    it('falls back to a default label for the inline region', () => {
      let {getByRole} = render(<Carousel aria-label={undefined} />);
      expect(getByRole('region')).toHaveAccessibleName('Attachment viewer');
    });

    it('supports aria-labelledby on the inline region', () => {
      let {getByRole} = render(
        <>
          <h2 id="gallery-heading">Gallery</h2>
          <Carousel aria-label={undefined} aria-labelledby="gallery-heading" />
        </>
      );
      expect(getByRole('region')).toHaveAccessibleName('Gallery');
    });

    it('applies the id to the labelled region only', () => {
      let {container, getByRole} = render(
        <Carousel aria-labelledby="gallery-heading" id="gallery" />
      );
      expect(container.querySelectorAll('#gallery')).toHaveLength(1);
      expect(getByRole('region')).toHaveAttribute('id', 'gallery');
      expect(getByRole('region')).toHaveAttribute('aria-labelledby', 'gallery gallery-heading');
    });
  });

  describe('navigation buttons', () => {
    it('navigates forward and backward using Next and Previous', async () => {
      let {getByRole} = render(<Carousel />);
      await user.click(getByRole('tab', {name: 'Photo two'}));

      await user.click(getByRole('button', {name: 'Next attachment'}));
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo three');
      await user.click(getByRole('button', {name: 'Previous attachment'}));
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
    });

    it.each([
      ['one', 'Previous attachment', 'Next attachment'],
      ['five', 'Next attachment', 'Previous attachment']
    ])(
      'marks the boundary button %s/%s as aria-disabled and ignores activation',
      async (selectedKey, disabledButton, enabledButton) => {
        let onSelectionChange = jest.fn();
        let {getByRole} = render(<Carousel onSelectionChange={onSelectionChange} />);
        await user.click(getByRole('tab', {name: `Photo ${selectedKey}`}));
        onSelectionChange.mockClear();
        let button = getByRole('button', {name: disabledButton});
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(getByRole('button', {name: enabledButton})).not.toHaveAttribute(
          'aria-disabled',
          'true'
        );

        await user.click(button);
        await user.keyboard('{Enter}');
        expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName(
          `Photo ${selectedKey}`
        );
        expect(onSelectionChange).not.toHaveBeenCalled();
      }
    );

    it('disables both navigation actions when there is only one slide', async () => {
      let onSelectionChange = jest.fn();
      let {getByRole} = render(
        <Carousel itemIds={['one']} onSelectionChange={onSelectionChange} />
      );
      onSelectionChange.mockClear();
      for (let name of ['Previous attachment', 'Next attachment']) {
        let button = getByRole('button', {name});
        expect(button).toHaveAttribute('aria-disabled', 'true');
        await user.click(button);
      }
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo one');
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('panel keyboard navigation', () => {
    it('navigates with panel arrow keys without wrapping at the boundaries', async () => {
      let {getByRole} = render(<Carousel itemIds={['one', 'two']} />);
      act(() => getByRole('tabpanel').focus());

      await user.keyboard('{ArrowLeft}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo one');
      await user.keyboard('{ArrowRight}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      await user.keyboard('{ArrowRight}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      await user.keyboard('{ArrowLeft}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo one');
    });

    it('reverses panel arrow-key navigation in RTL', async () => {
      let {getByRole} = render(
        <I18nProvider locale="ar-AE">
          <Carousel />
        </I18nProvider>
      );
      await user.click(getByRole('tab', {name: 'Photo two'}));
      act(() => getByRole('tabpanel').focus());

      await user.keyboard('{ArrowLeft}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo three');
      await user.keyboard('{ArrowRight}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
    });

    it('handles repeated arrow-key events while focus remains on the panel', () => {
      let {getByRole} = render(<Carousel />);
      act(() => getByRole('tabpanel').focus());

      fireEvent.keyDown(getByRole('tabpanel'), {key: 'ArrowRight'});
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      fireEvent.keyDown(getByRole('tabpanel'), {key: 'ArrowRight', repeat: true});
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo three');
      expect(getByRole('tabpanel')).toHaveFocus();
    });

    it('does not change slides when a child input stops arrow-key propagation', async () => {
      let onSelectionChange = jest.fn();
      let {getByRole} = render(<Carousel withControls onSelectionChange={onSelectionChange} />);
      await user.click(getByRole('tab', {name: 'Photo two'}));
      onSelectionChange.mockClear();
      let input = getByRole('textbox', {name: 'Caption two'});
      await user.click(input);
      await user.type(input, 'abc');
      await user.keyboard('{ArrowLeft}X{ArrowRight}');

      expect(input).toHaveValue('abXc');
      expect(input).toHaveFocus();
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('does not navigate when the keyboard event is already default-prevented', async () => {
      let onSelectionChange = jest.fn();
      let {getByRole} = render(
        <div onKeyDownCapture={e => e.preventDefault()}>
          <Carousel onSelectionChange={onSelectionChange} />
        </div>
      );
      await user.click(getByRole('tab', {name: 'Photo two'}));
      onSelectionChange.mockClear();
      act(() => getByRole('tabpanel').focus());

      await user.keyboard('{ArrowLeft}{ArrowRight}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      expect(getByRole('tabpanel')).toHaveFocus();
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('focus management', () => {
    it('focuses the selected picker item when the modal opens', async () => {
      let {getByLabelText, getByRole} = render(<AttachmentExample />);

      await user.click(getByLabelText('File three'));
      act(() => jest.runAllTimers());
      expect(getByRole('tab', {name: 'Photo three'})).toHaveFocus();
    });

    it('synchronizes picker focus when scrolling changes selection while focus remains inside the picker', async () => {
      let {getByRole} = render(<Carousel />);
      await user.tab();
      expect(getByRole('tab', {name: 'Photo one'})).toHaveFocus();

      let viewport = getByRole('tabpanel').parentElement!.parentElement!;
      Object.defineProperty(viewport, 'offsetWidth', {value: 100});
      fireEvent.scroll(viewport, {target: {scrollLeft: 300}});
      expect(getByRole('tab', {name: 'Photo four'})).toHaveFocus();
    });

    it('focuses the first tabbable control in the incoming slide when navigating from the panel', async () => {
      let {getByRole} = render(<Carousel withControls={['two']} />);
      act(() => getByRole('tabpanel').focus());
      expect(getByRole('tabpanel')).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(getByRole('textbox', {name: 'Caption two'})).toHaveFocus();
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
    });

    it('focuses the incoming panel when it has no tabbable controls', async () => {
      let {getByRole} = render(<Carousel />);
      act(() => getByRole('tabpanel').focus());

      await user.keyboard('{ArrowRight}');
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      expect(getByRole('tabpanel')).toHaveFocus();
    });

    it('clears the outgoing focus ring when changing slides', async () => {
      let {getByRole} = render(<Carousel />);
      await user.tab();
      await user.tab();
      let outgoingPanel = getByRole('tabpanel');
      expect(outgoingPanel).toHaveFocus();
      expect(outgoingPanel).toHaveAttribute('data-focus-visible', 'true');
      let onBlur = jest.fn();
      outgoingPanel.addEventListener('blur', onBlur, {once: true});

      await user.keyboard('{ArrowRight}');

      expect(outgoingPanel).not.toHaveAttribute('data-focused');
      expect(outgoingPanel).not.toHaveAttribute('data-focus-visible');
      expect(getByRole('tabpanel')).toHaveFocus();
      expect(onBlur).toHaveBeenCalledTimes(1);
      expect(getByRole('region')).toContainElement(onBlur.mock.calls[0][0].relatedTarget);
    });

    it('does not restore picker focus after focus moves outside and scrolling changes selection', async () => {
      let {getByRole} = render(
        <>
          <button>Outside</button>
          <Carousel />
        </>
      );
      let pickerItem = getByRole('tab', {name: 'Photo one'});
      await user.click(pickerItem);
      expect(pickerItem).toHaveFocus();

      let outside = getByRole('button', {name: 'Outside'});
      await user.click(outside);
      let viewport = getByRole('tabpanel').parentElement!.parentElement!;
      Object.defineProperty(viewport, 'offsetWidth', {value: 100});
      fireEvent.scroll(viewport, {target: {scrollLeft: 200}});
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo three');
      expect(outside).toHaveFocus();
    });

    it('preserves navigation button focus when changing slides', async () => {
      let {getByRole} = render(<Carousel />);
      let next = getByRole('button', {name: 'Next attachment'});

      await user.click(next);
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo two');
      expect(next).toHaveFocus();
      let previous = getByRole('button', {name: 'Previous attachment'});
      await user.click(previous);
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName('Photo one');
      expect(previous).toHaveFocus();
    });
  });

  it('updates the mounted slide window, keeping only selected and neighboring slides mounted and neighboring wrappers inert', async () => {
    let {getByRole, getByTestId, queryByAltText} = render(<Carousel />);
    let checkWindow = (selected: string, mounted: string[]) => {
      for (let id of ids) {
        if (mounted.includes(id)) {
          let panel = getByTestId(`slide-${id}`);
          expect(within(panel).getByAltText(`Photo ${id}`)).toBeInTheDocument();
          let wrapper = panel.parentElement!;
          if (id === selected) {
            expect(wrapper).not.toHaveAttribute('inert');
          } else {
            expect(wrapper).toHaveAttribute('inert');
          }
        } else {
          expect(queryByAltText(`Photo ${id}`)).not.toBeInTheDocument();
        }
      }
      expect(within(getByRole('tabpanel')).getByRole('img')).toHaveAccessibleName(
        `Photo ${selected}`
      );
    };

    checkWindow('one', ['one', 'two']);
    await user.click(getByRole('button', {name: 'Next attachment'}));
    checkWindow('two', ['one', 'two', 'three']);
    await user.click(getByRole('button', {name: 'Next attachment'}));
    checkWindow('three', ['two', 'three', 'four']);
    await user.click(getByRole('tab', {name: 'Photo five'}));
    checkWindow('five', ['four', 'five']);
  });
});
