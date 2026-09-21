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
  AttachFileMenuItem,
  CommandMenuItem,
  InsertMenuButton,
  InsertTextMenuItem,
  InsertTokenMenuItem,
  PromptField,
  PromptFieldAttachment,
  PromptFieldAttachmentList,
  PromptFieldSubmitButton,
  PromptFieldToolbar,
  PromptFieldValue,
  PromptToken,
  PromptTokenField
} from '../../src/PromptField';
import {Attachment, AttachmentPreview} from '../../src/AttachmentList';
import {
  Collection,
  Header,
  Heading,
  Menu,
  MenuItem,
  MenuSection,
  SubmenuTrigger,
  Text
} from '@react-spectrum/s2/Menu';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import React, {useEffect, useState} from 'react';
import {TokenFieldValue} from 'react-aria-components';
import userEvent from '@testing-library/user-event';

// Tiny transparent PNG so <Image slot="thumbnail"> resolves without a network fetch.
export const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

/**
 * Install DOM stubs that jsdom is missing but TokenField/the completion popover rely on. Call
 * in beforeAll.
 * - Range.getBoundingClientRect / getClientRects: the popover uses these for positioning.
 * - InputEvent.getTargetRanges: TokenField reads it on beforeinput to find the edited range.
 * Returning [] makes it fall back to the current selection (its pre-existing code path).
 */
export function installRangePolyfill(): void {
  let proto = Range.prototype as any;
  if (!proto.getBoundingClientRect) {
    proto.getBoundingClientRect = () => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON() {}
    });
  }
  if (!proto.getClientRects) {
    proto.getClientRects = () => ({
      length: 0,
      item: () => null,
      [Symbol.iterator]: function* () {}
    });
  }
  if (typeof InputEvent !== 'undefined' && !(InputEvent.prototype as any).getTargetRanges) {
    (InputEvent.prototype as any).getTargetRanges = () => [];
  }
}

// Completion data, trimmed from PromptField.stories.tsx.
export const slashCommands = [
  {command: '/audience-explainer', kind: 'skill', description: 'Explain an AEP audience'},
  {command: '/clear', kind: 'command', description: 'Clear the context'},
  {command: '/compact', kind: 'command', description: 'Summarize conversation history'},
  {command: '/feedback', kind: 'command', description: 'Submit feedback'}
];

export const objects = [
  {
    section: 'Audiences',
    type: 'audience',
    items: [
      {kind: 'audience', title: 'New Customers'},
      {kind: 'audience', title: 'Returning Customers'}
    ]
  },
  {
    section: 'Campaigns',
    type: 'campaign',
    items: [{kind: 'campaign', title: 'Spring Launch 2026'}]
  },
  {
    section: 'Journeys',
    type: 'journey',
    items: [
      {kind: 'journey', title: 'Welcome Flow'},
      {kind: 'journey', title: 'Abandoned Cart Recovery'}
    ]
  }
];

interface CompletionCallbacks {
  valueType?: string | null;
  onClear?: () => void;
  onCompact?: () => void;
}

export function renderCompletions(
  filterValue: string,
  callbacks?: CompletionCallbacks
): React.ReactNode[] | null {
  if (filterValue.startsWith('/')) {
    return slashCommands
      .filter(
        item =>
          item.command.includes(filterValue.slice(1)) &&
          (callbacks?.valueType ? item.kind === callbacks.valueType : true)
      )
      .map(item =>
        item.command === '/clear' ? (
          <MenuItem key={item.command} id={item.command} onAction={callbacks?.onClear}>
            <Text slot="label">{item.command}</Text>
          </MenuItem>
        ) : item.command === '/compact' ? (
          <CommandMenuItem key={item.command} id={item.command} onAction={callbacks?.onCompact}>
            <Text slot="label">{item.command}</Text>
          </CommandMenuItem>
        ) : item.command === '/feedback' ? (
          <InsertTextMenuItem key={item.command} id={item.command} text={item.command}>
            <Text slot="label">{item.command}</Text>
          </InsertTextMenuItem>
        ) : (
          <InsertTokenMenuItem
            key={item.command}
            id={item.command}
            token={{
              type: 'token',
              text: item.command,
              value: {type: 'custom', anchor: '/', valueType: item.kind, data: item}
            }}>
            <Text slot="label">{item.command}</Text>
          </InsertTokenMenuItem>
        )
      );
  } else if (filterValue.startsWith('@')) {
    return objects
      .filter(section => (callbacks?.valueType ? section.type === callbacks.valueType : true))
      .map(section => {
        let matchingItems = section.items
          .filter(item => item.title.toLowerCase().includes(filterValue.slice(1).toLowerCase()))
          .map(item => (
            <InsertTokenMenuItem
              key={item.title}
              id={item.title}
              token={{
                type: 'token',
                text: item.title,
                value: {type: 'custom', anchor: '@', valueType: item.kind, data: item}
              }}>
              {item.title}
            </InsertTokenMenuItem>
          ));
        return matchingItems.length > 0 ? (
          <MenuSection key={section.section} id={section.section}>
            <Header>
              <Heading>{section.section}</Heading>
            </Header>
            {matchingItems}
          </MenuSection>
        ) : null;
      })
      .filter((v): v is React.ReactElement => v != null);
  }
  return null;
}

export interface HarnessOptions {
  initialValue?: PromptFieldValue;
  attachments?: PromptFieldAttachment[];
  isGenerating?: boolean;
  placeholder?: string;
  acceptedAttachmentTypes?: string[];
  /** Applied to every rendered attachment (for exercising the upload progress state). */
  uploadProgress?: number;
  /** Renders every attachment in the invalid state. */
  invalid?: boolean;
  onAITermsPress?: () => void;
}

export interface HarnessSpies {
  onSubmit: jest.Mock;
  onStop: jest.Mock;
  onClear: jest.Mock;
  onCompact: jest.Mock;
  onRemoveAttachments: jest.Mock;
}

interface ControlledPromptFieldProps extends HarnessOptions {
  valueRef: React.MutableRefObject<PromptFieldValue>;
  attachmentsRef: React.MutableRefObject<PromptFieldAttachment[]>;
  setValueRef: React.MutableRefObject<React.Dispatch<React.SetStateAction<PromptFieldValue>>>;
  spies: HarnessSpies;
}

function ControlledPromptField(props: ControlledPromptFieldProps) {
  let {
    initialValue = new PromptFieldValue([]),
    attachments: initialAttachments = [],
    isGenerating,
    placeholder,
    acceptedAttachmentTypes = ['image/*'],
    uploadProgress,
    invalid,
    valueRef,
    attachmentsRef,
    setValueRef,
    spies,
    onAITermsPress
  } = props;
  let [value, setValue] = useState<PromptFieldValue>(initialValue);
  let [attachments, setAttachments] = useState<PromptFieldAttachment[]>(initialAttachments);
  useEffect(() => {
    setValueRef.current = setValue;
  }, [setValue, setValueRef]);
  useEffect(() => {
    valueRef.current = value;
  }, [value, valueRef]);
  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments, attachmentsRef]);

  return (
    <PromptField
      value={value}
      onChange={v => setValue(v as PromptFieldValue)}
      attachments={attachments}
      onAttachmentsChange={setAttachments}
      isGenerating={isGenerating}
      onStop={spies.onStop}
      onSubmit={spies.onSubmit}
      acceptedAttachmentTypes={acceptedAttachmentTypes}
      onRemoveAttachments={spies.onRemoveAttachments}
      onAITermsPress={onAITermsPress}>
      <PromptFieldAttachmentList dependencies={[uploadProgress, invalid]}>
        {attachment => (
          <Attachment
            textValue={attachment.file.name}
            isInvalid={invalid}
            uploadProgress={uploadProgress}>
            {attachment.image && <AttachmentPreview mimeType="image/png" src={attachment.image} />}
          </Attachment>
        )}
      </PromptFieldAttachmentList>
      <PromptTokenField
        placeholder={placeholder}
        completionTrigger={/(?<=^|\s)[@/]/}
        renderCompletions={(filterValue, valueType) =>
          renderCompletions(filterValue, {
            valueType,
            onClear: spies.onClear,
            onCompact: spies.onCompact
          })
        }>
        {token => <PromptToken token={token}>{token.text}</PromptToken>}
      </PromptTokenField>
      <PromptFieldToolbar>
        <InsertMenuButton>
          <AttachFileMenuItem />
          <SubmenuTrigger>
            <MenuItem>
              <Text>Reference an object</Text>
            </MenuItem>
            <Menu items={objects}>
              {(item: (typeof objects)[number]) => (
                <MenuSection>
                  <Header>
                    <Heading>{item.section}</Heading>
                  </Header>
                  <Collection items={item.items}>
                    {(obj: {kind: string; title: string}) => (
                      <InsertTokenMenuItem
                        id={obj.title}
                        token={{
                          type: 'token',
                          text: obj.title,
                          value: {type: 'custom', anchor: '@', valueType: obj.kind, data: obj}
                        }}>
                        {obj.title}
                      </InsertTokenMenuItem>
                    )}
                  </Collection>
                </MenuSection>
              )}
            </Menu>
          </SubmenuTrigger>
        </InsertMenuButton>
        <PromptFieldSubmitButton />
      </PromptFieldToolbar>
    </PromptField>
  );
}

export interface PromptFieldHarness extends HarnessSpies {
  user: ReturnType<typeof userEvent.setup>;
  getValue: () => PromptFieldValue;
  getAttachments: () => PromptFieldAttachment[];
  /**
   * The controlled value setter. jsdom can't drive caret/token selection through the
   * contenteditable (that needs Selection.modify / hit-testing, covered by TokenField's own
   * browser tests), so tests position the caret/selection through the controlled value instead.
   */
  setValue: React.Dispatch<React.SetStateAction<PromptFieldValue>>;
  textbox: HTMLElement;
  container: HTMLElement;
}

export function renderPromptField(options: HarnessOptions = {}): PromptFieldHarness {
  let user = userEvent.setup({delay: null, pointerMap});
  let valueRef = {current: options.initialValue ?? new PromptFieldValue([])};
  let attachmentsRef = {current: options.attachments ?? []};
  let setValueRef = {current: (() => {}) as React.Dispatch<React.SetStateAction<PromptFieldValue>>};
  let spies: HarnessSpies = {
    onSubmit: jest.fn(),
    onStop: jest.fn(),
    onClear: jest.fn(),
    onCompact: jest.fn(),
    onRemoveAttachments: jest.fn()
  };
  let tree = render(
    <ControlledPromptField
      {...options}
      valueRef={valueRef}
      attachmentsRef={attachmentsRef}
      setValueRef={setValueRef}
      spies={spies}
    />
  );
  return {
    ...spies,
    user,
    getValue: () => valueRef.current,
    getAttachments: () => attachmentsRef.current,
    setValue: (...args) => setValueRef.current(...args),
    textbox: tree.getByRole('textbox', {name: 'Prompt'}),
    container: tree.container
  };
}

/** Build an image attachment fixture backed by a real File. */
export function imageAttachment(id: string, name = 'photo.png'): PromptFieldAttachment {
  return {id, file: new File(['x'], name, {type: 'image/png'}), image: TINY_PNG};
}

export function tokenTexts(value: PromptFieldValue): string[] {
  return value.segments.filter(s => s.type === 'token').map(s => s.text);
}

export {PromptFieldValue, TokenFieldValue};
