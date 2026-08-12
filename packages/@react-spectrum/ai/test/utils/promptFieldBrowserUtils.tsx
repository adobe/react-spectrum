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
import {Attachment} from '../../src/AttachmentList';
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
import {expect, type Mock, vi} from 'vitest';
import {Image} from '@react-spectrum/s2/Image';
import {type Locator, userEvent} from 'vitest/browser';
import React, {useEffect, useState} from 'react';
import {render} from 'vitest-browser-react';
import {TokenFieldValue} from 'react-aria-components';

// Tiny transparent PNG so <Image slot="thumbnail"> resolves without a network fetch.
export const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

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
}

export interface HarnessSpies {
  onSubmit: Mock;
  onStop: Mock;
  onClear: Mock;
  onCompact: Mock;
  onRemoveAttachments: Mock;
}

interface ControlledPromptFieldProps extends HarnessOptions {
  valueRef: React.MutableRefObject<PromptFieldValue>;
  attachmentsRef: React.MutableRefObject<PromptFieldAttachment[]>;
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
    spies
  } = props;
  let [value, setValue] = useState<PromptFieldValue>(initialValue);
  let [attachments, setAttachments] = useState<PromptFieldAttachment[]>(initialAttachments);
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
      onRemoveAttachments={spies.onRemoveAttachments}>
      <PromptFieldAttachmentList dependencies={[uploadProgress, invalid]}>
        {attachment => (
          <Attachment
            textValue={attachment.file.name}
            isInvalid={invalid}
            uploadProgress={uploadProgress}>
            {attachment.image && <Image src={attachment.image} slot="thumbnail" />}
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
                          value: {type: 'custom', valueType: obj.kind, anchor: '@', data: obj}
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
  getValue: () => PromptFieldValue;
  getAttachments: () => PromptFieldAttachment[];
  textbox: Locator;
  container: HTMLElement;
}

export async function renderPromptField(options: HarnessOptions = {}): Promise<PromptFieldHarness> {
  let valueRef = {current: options.initialValue ?? new PromptFieldValue([])};
  let attachmentsRef = {current: options.attachments ?? []};
  let spies: HarnessSpies = {
    onSubmit: vi.fn(),
    onStop: vi.fn(),
    onClear: vi.fn(),
    onCompact: vi.fn(),
    onRemoveAttachments: vi.fn()
  };
  let screen = await render(
    <ControlledPromptField
      {...options}
      valueRef={valueRef}
      attachmentsRef={attachmentsRef}
      spies={spies}
    />
  );
  return {
    ...spies,
    getValue: () => valueRef.current,
    getAttachments: () => attachmentsRef.current,
    textbox: screen.getByRole('textbox', {name: 'Prompt'}),
    container: screen.container
  };
}

export interface UncontrolledHarness {
  onSubmit: Mock;
  textbox: Locator;
  container: HTMLElement;
}

/**
 * Renders an uncontrolled PromptField (using defaultValue/defaultAttachments and the default
 * attachment renderer) so submit-clears-the-field and default-render paths are exercised.
 */
export async function renderUncontrolledPromptField(
  options: {
    defaultValue?: PromptFieldValue;
    defaultAttachments?: PromptFieldAttachment[];
  } = {}
): Promise<UncontrolledHarness> {
  let onSubmit = vi.fn();
  let screen = await render(
    <PromptField
      defaultValue={options.defaultValue}
      defaultAttachments={options.defaultAttachments}
      acceptedAttachmentTypes={['image/*']}
      onSubmit={onSubmit}>
      <PromptFieldAttachmentList />
      <PromptTokenField>
        {token => <PromptToken token={token}>{token.text}</PromptToken>}
      </PromptTokenField>
      <PromptFieldToolbar>
        <PromptFieldSubmitButton />
      </PromptFieldToolbar>
    </PromptField>
  );
  return {
    onSubmit,
    textbox: screen.getByRole('textbox', {name: 'Prompt'}),
    container: screen.container
  };
}

/** Build an image attachment fixture backed by a real File. */
export function imageAttachment(id: string, name = 'photo.png'): PromptFieldAttachment {
  return {id, file: new File(['x'], name, {type: 'image/png'}), image: TINY_PNG};
}

export function tokenTexts(value: PromptFieldValue): string[] {
  return value.segments.filter(s => s.type === 'token').map(s => s.text);
}

export async function focusField(textbox: Locator): Promise<void> {
  await userEvent.click(textbox);
  await expect.element(textbox).toHaveFocus();
}

export async function waitForFieldText(
  getValue: () => PromptFieldValue,
  str: string
): Promise<void> {
  await expect.poll(() => getValue().toString()).toBe(str);
}

export async function waitForTokens(
  getValue: () => PromptFieldValue,
  tokens: string[]
): Promise<void> {
  await expect.poll(() => tokenTexts(getValue())).toEqual(tokens);
}

export {PromptFieldValue, TokenFieldValue};
