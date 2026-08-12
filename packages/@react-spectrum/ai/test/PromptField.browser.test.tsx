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

import {describe, expect, it} from 'vitest';
import {
  focusField,
  imageAttachment,
  PromptFieldValue,
  renderPromptField,
  renderUncontrolledPromptField,
  tokenTexts,
  waitForFieldText,
  waitForTokens
} from './utils/promptFieldBrowserUtils';
import {page, userEvent} from 'vitest/browser';
import React from 'react';

const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;

// A prompt containing both a fillable object placeholder (Journey) and a free-text placeholder (Date).
function placeholderPrompt(): PromptFieldValue {
  return new PromptFieldValue([
    {type: 'text', text: 'Detect audiences in '},
    {
      type: 'token',
      text: 'Journey',
      value: {type: 'placeholder', placeholderType: 'token', anchor: '@', valueType: 'journey'}
    },
    {type: 'text', text: ' that changed in the past '},
    {type: 'token', text: 'Date', value: {type: 'placeholder', placeholderType: 'text'}}
  ]);
}

let menuItem = (name: string | RegExp) => page.getByRole('menuitem', {name});
let menuItemCount = (name: string | RegExp) => menuItem(name).elements().length;

describeOrSkip('PromptField', () => {
  describe('placeholder text', () => {
    it('shows the placeholder when empty and hides it after typing', async () => {
      let {textbox, getValue} = await renderPromptField({placeholder: 'Ask me anything'});
      expect(textbox.element()).toHaveAttribute('data-placeholder', 'Ask me anything');

      await focusField(textbox);
      await userEvent.keyboard('hi');
      await waitForFieldText(getValue, 'hi');
    });
  });

  describe('autocomplete trigger: @', () => {
    it('opens object completions and inserts a token', async () => {
      let {textbox, getValue} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('@');

      // All object sections are shown for a bare @ trigger.
      await expect.element(menuItem('New Customers')).toBeInTheDocument();
      await expect.element(menuItem('Spring Launch 2026')).toBeInTheDocument();
      await expect.element(menuItem('Welcome Flow')).toBeInTheDocument();

      await userEvent.click(menuItem('New Customers'));
      // Token replaces the typed filter and a trailing space is added.
      await waitForTokens(getValue, ['New Customers']);
      await waitForFieldText(getValue, 'New Customers ');
    });

    it('filters completions as the user types', async () => {
      let {textbox} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('@New');

      await expect.element(menuItem('New Customers')).toBeInTheDocument();
      await expect.poll(() => menuItemCount('Welcome Flow')).toBe(0);
    });

    it('does not trigger when @ is not preceded by whitespace or start', async () => {
      let {textbox} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('hello@');

      // No completion popover should open.
      await expect.poll(() => page.getByRole('menu').elements().length).toBe(0);
    });
  });

  describe('autocomplete trigger: /', () => {
    it('inserts a token via InsertTokenMenuItem', async () => {
      let {textbox, getValue} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('/');

      await expect.element(menuItem('/audience-explainer')).toBeInTheDocument();
      await expect.element(menuItem('/clear')).toBeInTheDocument();
      await expect.element(menuItem('/compact')).toBeInTheDocument();
      await expect.element(menuItem('/feedback')).toBeInTheDocument();

      await userEvent.click(menuItem('/audience-explainer'));
      await waitForTokens(getValue, ['/audience-explainer']);
    });

    it('inserts plain text via InsertTextMenuItem', async () => {
      let {textbox, getValue} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('/feedback');

      await userEvent.click(menuItem('/feedback'));
      await waitForFieldText(getValue, '/feedback ');
      expect(tokenTexts(getValue())).toEqual([]);
    });

    it('runs a callback and clears the filter via CommandMenuItem', async () => {
      let {textbox, getValue, onCompact} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('/compact');

      await userEvent.click(menuItem('/compact'));
      await expect.poll(() => onCompact).toHaveBeenCalledTimes(1);
      // Nothing inserted, and the filter text is cleared.
      expect(tokenTexts(getValue())).toEqual([]);
      expect(getValue().toString()).not.toContain('/compact');
    });

    it('runs a callback via a plain MenuItem', async () => {
      let {textbox, onClear} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('/clear');

      await userEvent.click(menuItem('/clear'));
      await expect.poll(() => onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('URL tokenization', () => {
    it('auto-tokenizes a URL as it is typed', async () => {
      let {textbox, getValue} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('visit test.com now');

      await expect
        .poll(() => getValue().segments.some(s => s.type === 'token' && s.value?.type === 'url'))
        .toBe(true);
      let urlToken = getValue().segments.find(s => s.type === 'token' && s.value?.type === 'url');
      expect(urlToken?.text).toBe('test.com');
    });
  });

  describe('insert (+) menu', () => {
    it('inserts an object token from the Reference submenu', async () => {
      let {textbox, getValue} = await renderPromptField();
      // Type first so the field has a live caret to insert at.
      await focusField(textbox);
      await userEvent.keyboard('Use ');
      await userEvent.click(page.getByRole('button', {name: 'Add'}));

      await expect.element(menuItem('Attach a file')).toBeInTheDocument();
      let referenceItem = menuItem('Reference an object');
      await expect.element(referenceItem).toBeInTheDocument();

      // Open the submenu.
      await userEvent.hover(referenceItem);
      await expect.element(menuItem('Welcome Flow')).toBeInTheDocument();
      await userEvent.click(menuItem('Welcome Flow'));

      await waitForTokens(getValue, ['Welcome Flow']);
      await waitForFieldText(getValue, 'Use Welcome Flow ');
    });

    it('does not insert a double space when the caret is already followed by one', async () => {
      let {textbox, getValue} = await renderPromptField();
      await focusField(textbox);
      await userEvent.keyboard('x y');
      // Move the caret between 'x' and the space.
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');

      await userEvent.click(page.getByRole('button', {name: 'Add'}));
      await userEvent.hover(menuItem('Reference an object'));
      await expect.element(menuItem('Welcome Flow')).toBeInTheDocument();
      await userEvent.click(menuItem('Welcome Flow'));

      // Reuses the existing trailing space rather than adding a second one.
      await waitForFieldText(getValue, 'xWelcome Flow y');
    });
  });

  describe('replacing an existing token', () => {
    it('opens same-type completions when a custom token is selected', async () => {
      let initialValue = new PromptFieldValue([
        {type: 'text', text: 'Analyze '},
        {
          type: 'token',
          text: 'New Customers',
          value: {
            type: 'custom',
            anchor: '@',
            valueType: 'audience',
            data: {kind: 'audience', title: 'New Customers'}
          }
        }
      ]);
      let {textbox, getValue} = await renderPromptField({initialValue});
      await focusField(textbox);

      // Selecting the existing token opens completions filtered to the same type (audiences).
      await userEvent.click(page.getByText('New Customers'));
      await expect.element(menuItem('Returning Customers')).toBeInTheDocument();
      await expect.poll(() => menuItemCount('Welcome Flow')).toBe(0);
      await expect.poll(() => menuItemCount('Spring Launch 2026')).toBe(0);

      // Choosing a different audience replaces the selected token.
      await userEvent.click(menuItem('Returning Customers'));
      await waitForTokens(getValue, ['Returning Customers']);
    });
  });

  describe('placeholders', () => {
    it('moves between placeholders with Tab and Shift+Tab', async () => {
      let {textbox, getValue} = await renderPromptField({initialValue: placeholderPrompt()});
      await focusField(textbox);
      await userEvent.keyboard('{Home}');

      // Tab selects the first placeholder (Journey, index 1).
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => getValue().selectedRange.start).toEqual({index: 1, offset: 0});
      await expect
        .poll(() => getValue().selectedRange.end)
        .toEqual({index: 1, offset: 'Journey'.length});

      // Tab again selects the next placeholder (Date, index 3).
      await userEvent.keyboard('{Tab}');
      await expect.poll(() => getValue().selectedRange.start).toEqual({index: 3, offset: 0});
      await expect
        .poll(() => getValue().selectedRange.end)
        .toEqual({index: 3, offset: 'Date'.length});

      // Shift+Tab goes back to the Journey placeholder.
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
      await expect.poll(() => getValue().selectedRange.start).toEqual({index: 1, offset: 0});
    });

    it('re-opens completions filtered to the placeholder value type when typed over', async () => {
      let {textbox} = await renderPromptField({initialValue: placeholderPrompt()});
      await focusField(textbox);
      await userEvent.keyboard('{Home}');
      await userEvent.keyboard('{Tab}'); // select the Journey placeholder
      await userEvent.keyboard('W');

      // Completions re-open, filtered to journeys only.
      await expect.element(menuItem('Welcome Flow')).toBeInTheDocument();
      await expect.poll(() => menuItemCount('New Customers')).toBe(0);
    });

    it('selects the last placeholder when Shift+Tab-ing into the field', async () => {
      let {textbox, getValue} = await renderPromptField({initialValue: placeholderPrompt()});
      await focusField(textbox);
      // Caret past the last placeholder so Tab leaves the field instead of jumping placeholders.
      await userEvent.keyboard('{End}');
      await userEvent.keyboard('{Tab}');
      // Re-enter from a following element; the last placeholder (Date, index 3) is auto-selected.
      await userEvent.keyboard('{Shift>}{Tab}{/Shift}');

      await expect.poll(() => getValue().selectedRange.start).toEqual({index: 3, offset: 0});
      await expect.poll(() => getValue().selectedRange.end).toEqual({index: 3, offset: 1});
    });
  });

  describe('submit / generate state', () => {
    it('disables submit when empty and enables it with content', async () => {
      let {textbox, getValue, onSubmit} = await renderPromptField();
      let submit = page.getByRole('button', {name: 'Send'});
      await expect.element(submit).toBeDisabled();

      await focusField(textbox);
      await userEvent.keyboard('hello');
      await waitForFieldText(getValue, 'hello');
      await expect.element(submit).toBeEnabled();

      await userEvent.click(submit);
      await expect.poll(() => onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].toString()).toBe('hello');
    });

    it('shows a Stop button while generating and calls onStop', async () => {
      let {onStop} = await renderPromptField({isGenerating: true});
      let stop = page.getByRole('button', {name: 'Stop'});
      await expect.element(stop).toBeEnabled();

      await userEvent.click(stop);
      await expect.poll(() => onStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('attachments', () => {
    it('renders attachments and removes them', async () => {
      let attachment = imageAttachment('a1');
      let {container, getAttachments, onRemoveAttachments} = await renderPromptField({
        attachments: [attachment]
      });

      await expect.element(page.getByLabelText('Attachments')).toBeInTheDocument();
      let removeButton = container.querySelector('[slot="remove"]') as HTMLElement;
      expect(removeButton).toBeInTheDocument();

      await userEvent.click(removeButton);
      await expect.poll(() => onRemoveAttachments).toHaveBeenCalledTimes(1);
      expect(onRemoveAttachments.mock.calls[0][0][0].id).toBe('a1');
      await expect.poll(() => getAttachments().length).toBe(0);
    });

    it('shows upload progress while uploading', async () => {
      await renderPromptField({attachments: [imageAttachment('a1')], uploadProgress: 50});
      await expect.element(page.getByRole('progressbar', {name: 'Uploading'})).toBeInTheDocument();
    });

    it('renders an attachment in the invalid state', async () => {
      let {container} = await renderPromptField({
        attachments: [imageAttachment('a1')],
        invalid: true
      });
      await expect.element(page.getByLabelText('Attachments')).toBeInTheDocument();
      // The invalid state renders a decorative alert icon.
      expect(container.querySelector('[aria-hidden="true"] svg')).toBeTruthy();
    });
  });

  describe('uncontrolled', () => {
    it('renders default attachments and clears the field and attachments on submit', async () => {
      let defaultValue = new PromptFieldValue([{type: 'text', text: 'hello'}]);
      let {textbox, onSubmit} = await renderUncontrolledPromptField({
        defaultValue,
        defaultAttachments: [imageAttachment('a1')]
      });

      // Default attachment renderer shows the thumbnail.
      await expect.element(page.getByLabelText('Attachments')).toBeInTheDocument();

      let submit = page.getByRole('button', {name: 'Send'});
      await expect.element(submit).toBeEnabled();
      await userEvent.click(submit);

      await expect.poll(() => onSubmit).toHaveBeenCalledTimes(1);
      // Uncontrolled field resets itself after submit.
      await expect.poll(() => textbox.element().textContent).toBe('');
      await expect.poll(() => page.getByLabelText('Attachments').elements().length).toBe(0);
    });
  });
});
