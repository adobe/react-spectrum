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

import {act, screen, waitFor} from '@react-spectrum/test-utils-internal';
import {
  AttachFileMenuItem,
  InsertMenuButton,
  PromptField,
  PromptFieldToolbar,
  PromptTokenField
} from '../src/PromptField';
import {
  imageAttachment,
  installRangePolyfill,
  PromptFieldValue,
  renderPromptField,
  tokenTexts
} from './utils/promptFieldTestUtils';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import userEvent from '@testing-library/user-event';

// Suite requires React 19 (matches the TokenField browser coverage this ports from).
const describeOrSkip = parseInt(React.version, 10) < 19 ? describe.skip : describe;

let findMenuItem = (name: string | RegExp) => screen.findByRole('menuitem', {name});
let getMenuItem = (name: string | RegExp) => screen.getByRole('menuitem', {name});
let queryMenuItem = (name: string | RegExp) => screen.queryByRole('menuitem', {name});

let selectedText = (v: PromptFieldValue) =>
  v.slice(v.selectedRange.start, v.selectedRange.end).toString();

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

describeOrSkip('PromptField', () => {
  let user;

  beforeAll(() => {
    user = userEvent.setup({delay: null});
  });

  beforeAll(() => {
    installRangePolyfill();
  });

  describe('placeholder text', () => {
    it('shows the placeholder when empty and hides it after typing', async () => {
      let {user, textbox, getValue} = renderPromptField({placeholder: 'Ask me anything'});
      expect(textbox).toHaveAttribute('data-placeholder', 'Ask me anything');

      await user.click(textbox);
      await user.keyboard('hi');
      expect(getValue().toString()).toBe('hi');
    });
  });

  describe('autocomplete trigger: @', () => {
    it('opens object completions and inserts a token', async () => {
      let {user, textbox, getValue} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('@');

      // All object sections are shown for a bare @ trigger.
      expect(await findMenuItem('New Customers')).toBeInTheDocument();
      expect(getMenuItem('Spring Launch 2026')).toBeInTheDocument();
      expect(getMenuItem('Welcome Flow')).toBeInTheDocument();

      await user.click(getMenuItem('New Customers'));
      // Token replaces the typed filter and a trailing space is added.
      await waitFor(() => expect(tokenTexts(getValue())).toEqual(['New Customers']));
      expect(getValue().toString()).toBe('New Customers ');
    });

    it('filters completions as the user types', async () => {
      let {user, textbox} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('@New');

      expect(await findMenuItem('New Customers')).toBeInTheDocument();
      expect(queryMenuItem('Welcome Flow')).not.toBeInTheDocument();
    });

    it('does not trigger when @ is not preceded by whitespace or start', async () => {
      let {user, textbox} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('hello@');

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('autocomplete trigger: /', () => {
    it('inserts a token via InsertTokenMenuItem', async () => {
      let {user, textbox, getValue} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('/');

      expect(await findMenuItem('/audience-explainer')).toBeInTheDocument();
      expect(getMenuItem('/clear')).toBeInTheDocument();
      expect(getMenuItem('/compact')).toBeInTheDocument();
      expect(getMenuItem('/feedback')).toBeInTheDocument();

      await user.click(getMenuItem('/audience-explainer'));
      await waitFor(() => expect(tokenTexts(getValue())).toEqual(['/audience-explainer']));
    });

    it('inserts plain text via InsertTextMenuItem', async () => {
      let {user, textbox, getValue} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('/feedback');

      await user.click(await findMenuItem('/feedback'));
      await waitFor(() => expect(getValue().toString()).toBe('/feedback '));
      expect(tokenTexts(getValue())).toEqual([]);
    });

    it('runs a callback and clears the filter via CommandMenuItem', async () => {
      let {user, textbox, getValue, onCompact} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('/compact');

      await user.click(await findMenuItem('/compact'));
      await waitFor(() => expect(onCompact).toHaveBeenCalledTimes(1));
      // Nothing inserted, and the filter text is cleared.
      expect(tokenTexts(getValue())).toEqual([]);
      expect(getValue().toString()).not.toContain('/compact');
    });

    it('runs a callback via a plain MenuItem', async () => {
      let {user, textbox, onClear} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('/clear');

      await user.click(await findMenuItem('/clear'));
      await waitFor(() => expect(onClear).toHaveBeenCalledTimes(1));
    });
  });

  describe('URL tokenization', () => {
    it('auto-tokenizes a URL as it is typed', async () => {
      let {user, textbox, getValue} = renderPromptField();
      await user.click(textbox);
      await user.keyboard('visit test.com now');

      await waitFor(() =>
        expect(getValue().segments.some(s => s.type === 'token' && s.value?.type === 'url')).toBe(
          true
        )
      );
      let urlToken = getValue().segments.find(s => s.type === 'token' && s.value?.type === 'url');
      expect(urlToken?.text).toBe('test.com');
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
      let {user, textbox, getValue, setValue} = renderPromptField({initialValue});

      // Select the token via the controlled value (jsdom can't click-select a token), then the
      // completions open filtered to the same type (audiences).
      await user.click(textbox);
      act(() =>
        setValue(
          v =>
            v.withSelectedRange(
              new PromptFieldValue.SelectedRange(
                {index: 1, offset: 0},
                {index: 1, offset: 'New Customers'.length}
              )
            ) as PromptFieldValue
        )
      );
      expect(await findMenuItem('Returning Customers')).toBeInTheDocument();
      expect(queryMenuItem('Welcome Flow')).not.toBeInTheDocument();
      expect(queryMenuItem('Spring Launch 2026')).not.toBeInTheDocument();

      // Choosing a different audience replaces the selected token.
      await user.click(getMenuItem('Returning Customers'));
      await waitFor(() => expect(tokenTexts(getValue())).toEqual(['Returning Customers']));
    });
  });

  describe('insert (+) menu', () => {
    it('inserts an object token from the Reference submenu', async () => {
      let {user, textbox, getValue} = renderPromptField();
      // Type first so the field has a live caret to insert at (typical usage).
      await user.click(textbox);
      await user.keyboard('Use ');
      await user.click(screen.getByRole('button', {name: 'Add'}));

      expect(await findMenuItem('Attach a file')).toBeInTheDocument();
      let referenceItem = getMenuItem('Reference an object');

      // Open the submenu.
      await user.hover(referenceItem);
      await user.click(await findMenuItem('Welcome Flow'));

      await waitFor(() => expect(tokenTexts(getValue())).toEqual(['Welcome Flow']));
      expect(getValue().toString()).toBe('Use Welcome Flow ');
    });

    it('does not insert a double space when the caret is already followed by one', async () => {
      let {user, getValue, setValue} = renderPromptField();
      // Place the caret between 'x' and the space (jsdom can't move the caret via arrow keys).
      act(() =>
        setValue(
          new PromptFieldValue([{type: 'text', text: 'x y'}]).withSelectedRange(
            new PromptFieldValue.SelectedRange({index: 0, offset: 1})
          ) as PromptFieldValue
        )
      );

      await user.click(screen.getByRole('button', {name: 'Add'}));
      await user.hover(getMenuItem('Reference an object'));
      await user.click(await findMenuItem('Welcome Flow'));

      // Reuses the existing trailing space rather than adding a second one.
      await waitFor(() => expect(getValue().toString()).toBe('xWelcome Flow y'));
    });
  });

  describe('placeholders', () => {
    it('moves between placeholders with Tab and Shift+Tab', async () => {
      let {user, textbox, getValue} = renderPromptField({initialValue: placeholderPrompt()});
      await user.click(textbox);
      await user.keyboard('{Home}');

      // Tab selects the first placeholder (Journey, index 1).
      await user.keyboard('{Tab}');
      await waitFor(() => expect(getValue().selectedRange.start).toEqual({index: 1, offset: 0}));
      expect(getValue().selectedRange.end).toEqual({index: 1, offset: 'Journey'.length});

      // Tab again selects the next placeholder (Date, index 3).
      await user.keyboard('{Tab}');
      await waitFor(() => expect(getValue().selectedRange.start).toEqual({index: 3, offset: 0}));
      expect(getValue().selectedRange.end).toEqual({index: 3, offset: 'Date'.length});

      // Shift+Tab goes back to the Journey placeholder.
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      await waitFor(() => expect(getValue().selectedRange.start).toEqual({index: 1, offset: 0}));
    });

    it('re-opens completions filtered to the placeholder value type when typed over', async () => {
      let {user, textbox} = renderPromptField({initialValue: placeholderPrompt()});
      await user.click(textbox);
      await user.keyboard('{Home}');
      await user.keyboard('{Tab}'); // select the Journey placeholder
      await user.keyboard('W');

      // Completions re-open, filtered to journeys only.
      expect(await findMenuItem('Welcome Flow')).toBeInTheDocument();
      expect(queryMenuItem('New Customers')).not.toBeInTheDocument();
    });

    it('selects the last token when Shift+Tab-ing into the field', async () => {
      let {user, textbox, getValue, setValue} = renderPromptField({
        initialValue: placeholderPrompt()
      });
      await user.click(textbox);
      // Put the caret past the last placeholder so Tab leaves the field instead of jumping
      // placeholders (jsdom can't move the caret to the end via {End}).
      act(() =>
        setValue(
          v =>
            v.withSelectedRange(
              new PromptFieldValue.SelectedRange({index: 3, offset: 'Date'.length})
            ) as PromptFieldValue
        )
      );
      await user.keyboard('{Tab}');
      // Re-enter from a following element; the last placeholder (Date, index 3) is auto-selected.
      await user.keyboard('{Shift>}{Tab}{/Shift}');

      await waitFor(() => expect(getValue().selectedRange.start).toEqual({index: 3, offset: 0}));
      // The selection covers the last placeholder (the Date token).
      expect(selectedText(getValue())).toBe('Date');
    });

    it('tabs through all tokens, not just placeholders', async () => {
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
        },
        {type: 'text', text: ' and '},
        {
          type: 'token',
          text: 'Journey',
          value: {type: 'placeholder', placeholderType: 'token', anchor: '@', valueType: 'journey'}
        }
      ]);
      let {user, textbox, getValue} = renderPromptField({initialValue});
      await user.click(textbox);
      await user.keyboard('{Home}');

      // Tab selects the first token (a non-placeholder custom token).
      await user.keyboard('{Tab}');
      await waitFor(() => expect(selectedText(getValue())).toBe('New Customers'));

      // Tab again selects the next token (the placeholder).
      await user.keyboard('{Tab}');
      await waitFor(() => expect(selectedText(getValue())).toBe('Journey'));

      await user.keyboard('{Tab}');
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(selectedText(getValue())).toBe('Journey');
    });

    it('advances the selection to the next placeholder after filling a placeholder', async () => {
      let {user, textbox, getValue} = renderPromptField({initialValue: placeholderPrompt()});
      await user.click(textbox);
      await user.keyboard('{Home}');
      await user.keyboard('{Tab}'); // select the Journey placeholder

      await user.click(await findMenuItem('Welcome Flow'));

      // Filling the placeholder auto-advances the selection to the next placeholder (Date).
      await waitFor(() => expect(selectedText(getValue())).toBe('Date'));
    });

    it('does not advance the selection onto a following non-placeholder token', async () => {
      let initialValue = new PromptFieldValue([
        {type: 'text', text: 'in '},
        {
          type: 'token',
          text: 'Journey',
          value: {type: 'placeholder', placeholderType: 'token', anchor: '@', valueType: 'journey'}
        },
        {type: 'text', text: ' for '},
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
      let {user, textbox, getValue} = renderPromptField({initialValue});
      await user.click(textbox);
      await user.keyboard('{Home}');
      await user.keyboard('{Tab}'); // select the Journey placeholder

      await user.click(await findMenuItem('Welcome Flow'));

      // No placeholder follows, so the selection collapses to a caret rather than selecting the
      // non-placeholder token (auto-advance only targets placeholders).
      await waitFor(() => expect(getValue().selectedRange.isCollapsed).toBe(true));
      expect(selectedText(getValue())).toBe('');
      expect(tokenTexts(getValue())).toEqual(['Welcome Flow', 'New Customers']);
    });
  });

  describe('submit / generate state', () => {
    it('disables submit when empty and enables it with content', async () => {
      let {user, textbox, getValue, onSubmit} = renderPromptField();
      let submit = screen.getByRole('button', {name: 'Send'});
      expect(submit).toBeDisabled();

      await user.click(textbox);
      await user.keyboard('hello');
      await waitFor(() => expect(getValue().toString()).toBe('hello'));
      expect(submit).toBeEnabled();

      await user.click(submit);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0].toString()).toBe('hello');
    });

    it('shows a Stop button while generating and calls onStop', async () => {
      let {user, onStop} = renderPromptField({isGenerating: true});
      let stop = screen.getByRole('button', {name: 'Stop'});
      expect(stop).toBeEnabled();

      await user.click(stop);
      expect(onStop).toHaveBeenCalledTimes(1);
    });
  });

  describe('attachments', () => {
    it('renders attachments and removes them', async () => {
      let attachment = imageAttachment('a1');
      let {user, container, getAttachments, onRemoveAttachments} = renderPromptField({
        attachments: [attachment]
      });

      expect(screen.getByLabelText('Attachments')).toBeInTheDocument();
      let removeButton = container.querySelector('[slot="remove"]') as HTMLElement;
      expect(removeButton).toBeInTheDocument();

      await user.click(removeButton);
      expect(onRemoveAttachments).toHaveBeenCalledTimes(1);
      expect(onRemoveAttachments.mock.calls[0][0][0].id).toBe('a1');
      await waitFor(() => expect(getAttachments().length).toBe(0));
    });

    it('shows upload progress while uploading', () => {
      renderPromptField({attachments: [imageAttachment('a1')], uploadProgress: 50});
      expect(screen.getByRole('progressbar', {name: 'Uploading'})).toBeInTheDocument();
    });

    it('renders an attachment in the invalid state', () => {
      let {container} = renderPromptField({attachments: [imageAttachment('a1')], invalid: true});
      expect(screen.getByLabelText('Attachments')).toBeInTheDocument();
      // The invalid state renders a decorative alert icon.
      expect(container.querySelector('svg')).toBeTruthy();
    });
  });

  describe('InsertMenuButton', () => {
    it('calls onOpenChange when the menu is opened', async () => {
      let onOpenChange = jest.fn();
      let {getByRole} = render(
        <PromptField>
          <PromptTokenField />
          <PromptFieldToolbar>
            <InsertMenuButton onOpenChange={onOpenChange}>
              <AttachFileMenuItem />
            </InsertMenuButton>
          </PromptFieldToolbar>
        </PromptField>
      );
      await user.click(getByRole('button', {name: 'Add'}));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('calls AttachFileMenuItem onAction when the item is selected', async () => {
      let onAction = jest.fn();
      let {getByRole} = render(
        <PromptField>
          <PromptTokenField />
          <PromptFieldToolbar>
            <InsertMenuButton>
              <AttachFileMenuItem onAction={onAction} />
            </InsertMenuButton>
          </PromptFieldToolbar>
        </PromptField>
      );
      await user.click(getByRole('button', {name: 'Add'}));
      await user.click(await findMenuItem('Attach a file'));
      expect(onAction).toHaveBeenCalled();
    });
  });

  it('fires onKeyDown when a key is pressed in the token field', async () => {
    let onKeyDown = jest.fn();
    let {getByRole} = render(
      <PromptField>
        <PromptTokenField onKeyDown={onKeyDown} />
      </PromptField>
    );

    let input = getByRole('textbox');
    await user.click(input);
    await user.keyboard('a');

    expect(onKeyDown).toHaveBeenCalled();
  });

  it('calls onAITermsPress when the AI User Guidelines link is pressed', async () => {
    let onAITermsPress = jest.fn();
    let {user} = renderPromptField({onAITermsPress});

    await user.click(screen.getByRole('link', {name: 'AI User Guidelines'}));
    expect(onAITermsPress).toHaveBeenCalledTimes(1);
  });
});
