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

import {ActionButton} from '@react-spectrum/s2/ActionButton';
import Attach from '@react-spectrum/s2/icons/Attach';
import {Attachment, AttachmentList} from './AttachmentList';
import {Autocomplete} from 'react-aria-components/Autocomplete';
import {baseColor, css, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Brand from '@react-spectrum/s2/icons/Brand';
import {Button} from '@react-spectrum/s2/Button';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import {
  Collection,
  Header,
  Heading,
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  SubmenuTrigger
} from '@react-spectrum/s2/Menu';
import Data from '@react-spectrum/s2/icons/Data';
// eslint-disable-next-line
import {
  Direction,
  TokenFieldSegment,
  TokenSegmentList
} from '/packages/react-aria-components/src/TokenSegmentList';
import {Group} from 'react-aria-components/Group';
import {Image, Text} from '@react-spectrum/s2/Card';
import {isFileDropItem, useDrop} from 'react-aria-components/useDrop';
import {Link} from '@react-spectrum/s2/Link';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import Plus from '@react-spectrum/s2/icons/Add';
import {Popover} from '@react-spectrum/s2/Popover';
// eslint-disable-next-line
import {
  positionToDOMRange,
  Token,
  TokenField
} from '/packages/react-aria-components/src/TokenField';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import Send from '@react-spectrum/s2/icons/ArrowUpSend';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import {useMemo, useRef, useState} from 'react';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';

interface Attachment {
  id: string;
  image: string;
  title: string;
  description: string;
}

export function PromptField({
  onSend,
  isDisabled
}: {
  onSend?: (text: string) => void;
  isDisabled?: boolean;
}) {
  let [value, setValue] = useState<TokenSegmentList>(new AutoLinkingSegmentList([]));
  let [attachments, setAttachments] = useState<Attachment[]>([]);

  // Not using RAC DropZone because it adds its own focusable button,
  // and we want to avoid an extra tab stop by attaching to the input.
  // TODO: support clipboard too (without messing up pasting text)
  let inputRef = useRef<HTMLTextAreaElement>(null);
  let {dropProps, isDropTarget} = useDrop({
    ref: inputRef,
    hasDropButton: true,
    async onDrop(e) {
      let files = await Promise.all(
        e.items.filter(isFileDropItem).map(async item => ({
          id: crypto.randomUUID(),
          image: item.type.startsWith('image/') ? URL.createObjectURL(await item.getFile()) : '',
          title: item.name,
          description: item.type
        }))
      );
      setAttachments(attachments => [...attachments, ...files]);
    }
  });

  let onAction = (item: Item) => {
    setValue(value =>
      value.replaceRangeWithSegments(
        value.caretPosition,
        value.caretPosition,
        [
          {
            type: 'token',
            text: 'command' in item ? item.command : item.title,
            value: item
          },
          {type: 'text', text: ' '}
        ],
        false // Don't coalesce in undo/redo history.
      )
    );

    // Wait for popover animation
    setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
  };

  return (
    <div>
      <Group
        {...dropProps}
        role="group"
        className={renderProps =>
          style({
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 16,
            boxShadow: 'emphasized',
            backgroundColor: {
              default: 'elevated',
              isDropTarget: 'blue-200'
            },
            borderRadius: 'lg',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: {
              default: 'transparent',
              isDropTarget: 'blue-800'
            }
          })({...renderProps, isDropTarget})
        }>
        {attachments.length > 0 && (
          <AttachmentList
            aria-label="Attachments"
            onRemove={keys => {
              setAttachments(attachments =>
                attachments.filter(attachment => !keys.has(attachment.id))
              );
            }}
            items={attachments}>
            {attachment => (
              <Attachment>
                {attachment.image && <Image src={attachment.image} slot="thumbnail" />}
                {/* <Content>
                  <Text slot="title">{attachment.title}</Text>
                  <Text slot="description">{attachment.description}</Text>
                </Content> */}
              </Attachment>
            )}
          </AttachmentList>
        )}
        <PromptTokenField
          ref={inputRef}
          value={value}
          onChange={setValue}
          onPaste={e => {
            let clipboardData = e.clipboardData as DataTransfer;
            for (let item of clipboardData.items) {
              if (item.type.startsWith('image/')) {
                let file = item.getAsFile()!;
                let image = URL.createObjectURL(file);
                setAttachments(attachments => [
                  ...attachments,
                  {id: crypto.randomUUID(), image, title: file.name, description: file.type}
                ]);
              }
            }
          }}
        />
        <div
          className={style({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16
          })}>
          <MenuTrigger>
            <ActionButton isQuiet aria-label="Add">
              <Plus />
            </ActionButton>
            <Menu>
              <MenuItem
                onAction={() => {
                  let input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.onchange = e => {
                    let files = (e.currentTarget as HTMLInputElement).files;
                    if (files) {
                      setAttachments(attachments => [
                        ...attachments,
                        ...Array.from(files).map(file => ({
                          id: crypto.randomUUID(),
                          image: URL.createObjectURL(file),
                          title: file.name,
                          description: file.type
                        }))
                      ]);
                    }
                  };
                  input.click();
                }}>
                <Attach />
                <Text>Attach a file</Text>
              </MenuItem>
              <SubmenuTrigger>
                <MenuItem>
                  <Prompt />
                  <Text>Commands</Text>
                </MenuItem>
                <Menu items={slashCommands.filter(item => item.type === 'command')}>
                  {item => (
                    <MenuItem id={item.command} onAction={() => onAction(item)}>
                      <Text slot="label">{item.command}</Text>
                      <Text slot="description">{item.description}</Text>
                    </MenuItem>
                  )}
                </Menu>
              </SubmenuTrigger>
              <SubmenuTrigger>
                <MenuItem>
                  <Plugin />
                  <Text>Skills</Text>
                </MenuItem>
                <Menu items={slashCommands.filter(item => item.type === 'skill')}>
                  {item => (
                    <MenuItem id={item.command} onAction={() => onAction(item)}>
                      <Text slot="label">{item.command}</Text>
                      <Text slot="description">{item.description}</Text>
                    </MenuItem>
                  )}
                </Menu>
              </SubmenuTrigger>
              <SubmenuTrigger>
                <MenuItem>
                  <Data />
                  <Text>Reference an object</Text>
                </MenuItem>
                <Menu items={objects}>
                  {item => (
                    <MenuSection>
                      <Header>
                        <Heading>{item.section}</Heading>
                      </Header>
                      <Collection items={item.items}>
                        {item => (
                          <MenuItem id={item.title} onAction={() => onAction(item)}>
                            {item.title}
                          </MenuItem>
                        )}
                      </Collection>
                    </MenuSection>
                  )}
                </Menu>
              </SubmenuTrigger>
            </Menu>
          </MenuTrigger>
          <Button
            variant="primary"
            aria-label="Send"
            isDisabled={isDisabled}
            onPress={() => {
              onSend?.(value.toString());
              setValue(new AutoLinkingSegmentList([]));
              inputRef.current?.focus();
            }}>
            <Send />
          </Button>
        </div>
      </Group>
      <p className={style({font: 'ui-sm', textAlign: 'center'})}>
        Responses are generated using AI, and may be inaccurate. Check before using.{' '}
        <Link
          variant="secondary"
          href="https://www.adobe.com/legal/licenses-terms/adobe-gen-ai-user-guidelines.html"
          target="_blank">
          AI User Guidelines
        </Link>
      </p>
    </div>
  );
}

const slashCommands = [
  {
    command: '/audience-explainer',
    type: 'skill',
    description: 'Explain an AEP audience in english'
  },
  {command: '/clear', type: 'command', description: 'Clear the context'},
  {command: '/compact', type: 'command', description: 'Summarize conversation history'},
  {command: '/dataset-usage', type: 'skill', description: 'Explain how to use a dataset'},
  {command: '/plan', type: 'command', description: 'Create a plan before executing'},
  {command: '/visual-artifact', type: 'skill', description: 'Generate a chart or graph'}
];

const icons = {
  command: <Prompt styles={iconStyle({size: 'S'})} />,
  skill: <Plugin styles={iconStyle({size: 'S'})} />,
  audience: <UserGroup styles={iconStyle({size: 'S'})} />,
  campaign: <Brand styles={iconStyle({size: 'S'})} />,
  journey: <SocialNetwork styles={iconStyle({size: 'S'})} />,
  url: <LinkIcon styles={iconStyle({size: 'S'})} />
} as const;

const objects = [
  {
    section: 'Audiences',
    items: [
      {type: 'audience', title: 'New Customers'},
      {type: 'audience', title: 'Returning Customers'},
      {type: 'audience', title: 'Loyal Customers'},
      {type: 'audience', title: 'High-Value Customers'},
      {type: 'audience', title: 'Low-Value Customers'}
    ]
  },
  {
    section: 'Campaigns',
    items: [
      {type: 'campaign', title: 'Spring Launch 2026'},
      {type: 'campaign', title: 'Holiday Cheer'},
      {type: 'campaign', title: 'Back to School'},
      {type: 'campaign', title: 'Summer Adventure'},
      {type: 'campaign', title: 'Tech Trends Expo'}
    ]
  },
  {
    section: 'Journeys',
    items: [
      {type: 'journey', title: 'Welcome Flow'},
      {type: 'journey', title: 'Abandoned Cart Recovery'},
      {type: 'journey', title: 'Post-Purchase Follow-up'},
      {type: 'journey', title: 'Re-engagement Campaign'},
      {type: 'journey', title: 'Birthday Surprise Journey'}
    ]
  }
];

type CommandOrSection = (typeof slashCommands)[number] | (typeof objects)[number];
type Item = (typeof slashCommands)[number] | (typeof objects)[number]['items'][number];

const tokenRegex = /(?<=\s|^)(https?:\/\/)?(www\.)?([^/\s]+\.[a-z]{2,}(\/\S+)?)(?=\s)/g;
class AutoLinkingSegmentList extends TokenSegmentList {
  tokenize(text: string): TokenFieldSegment[] {
    if (text.length === 0) {
      return [{type: 'text', text}];
    }

    tokenRegex.lastIndex = 0;

    let match: RegExpExecArray | null = null;
    let start = 0;
    let segments: TokenFieldSegment[] = [];
    while ((match = tokenRegex.exec(text))) {
      if (match.index > start) {
        segments.push({type: 'text', text: text.slice(start, match.index)});
      }
      segments.push({type: 'token', text: match[3], value: {type: 'url', url: match[0]}});
      start = match.index + match[0].length;
    }

    if (start < text.length) {
      segments.push({type: 'text', text: text.slice(start)});
    }

    return segments;
  }
}

function PromptTokenField(props) {
  let {value, onChange, ref: inputRef} = props;

  let [filterAnchor, filterValue] = useMemo(() => {
    let filterAnchor = value.findText(value.caretPosition, Direction.Backward, /(?<=^|\s)[@/]/);
    if (filterAnchor != null) {
      let filterValue = value.slice(filterAnchor, value.caretPosition).toString();
      return [filterAnchor, filterValue];
    }
    return [null, null];
  }, [value]);

  let items: CommandOrSection[] = [];
  if (filterValue != null && filterValue.startsWith('/')) {
    items = slashCommands.filter(item => item.command.includes(filterValue.slice(1)));
  } else if (filterValue != null && filterValue.startsWith('@')) {
    items = objects
      .map(section => {
        let matchingItems = section.items.filter(item =>
          item.title.toLowerCase().includes(filterValue.slice(1).toLowerCase())
        );
        if (matchingItems.length > 0) {
          return {
            section: section.section,
            items: matchingItems
          };
        } else {
          return null;
        }
      })
      .filter(v => v != null);
  }

  let onAction = (item: Item) => {
    onChange(value =>
      value.replaceRangeWithSegments(
        filterAnchor!,
        value.caretPosition,
        [
          {
            type: 'token',
            text: 'command' in item ? item.command : item.title,
            value: item
          },
          {type: 'text', text: ' '}
        ],
        false // Don't coalesce in undo/redo history.
      )
    );
  };

  return (
    <Autocomplete>
      <TokenField
        value={value}
        onChange={onChange}
        multiline
        aria-label="Prompt"
        ref={inputRef}
        onPaste={props.onPaste}
        className={renderProps =>
          css(
            '&:empty::before { content: "Ready to get started? Ask a question, share an idea, or add a task."; }'
          ) +
          style({
            font: 'body',
            color: {
              default: baseColor('neutral'),
              ':empty': {
                default: 'gray-600',
                forcedColors: 'GrayText'
              }
            },
            width: 'full',
            outlineStyle: 'none',
            cursor: 'text'
          })(renderProps)
        }>
        {segment => (
          <Token
            className={style({
              backgroundColor: {
                default: 'blue-300',
                isSelected: 'blue-900',
                '::selection': 'transparent'
              },
              color: {
                default: 'blue-1000',
                isSelected: 'white'
              },
              borderRadius: 'sm',
              paddingX: 4,
              paddingY: 2,
              lineHeight: '[1em]',
              cursor: 'default',
              '--iconPrimary': {
                type: 'fill',
                value: 'currentColor'
              },
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 4,
              verticalAlign: 'baseline'
            })}>
            <CenterBaseline>{icons[segment.value?.type]}</CenterBaseline>
            {segment.text}
          </Token>
        )}
      </TokenField>
      <Popover
        triggerRef={inputRef}
        isOpen={filterAnchor != null && items.length > 0}
        isNonModal
        hideArrow
        placement="bottom start"
        getTargetRect={target => {
          return positionToDOMRange(target, filterAnchor!).getBoundingClientRect();
        }}>
        <Menu items={items} dependencies={[onAction]}>
          {item => {
            if ('command' in item) {
              return (
                <MenuItem id={item.command} onAction={() => onAction(item)}>
                  {item.type === 'skill' ? <Plugin /> : <Prompt />}
                  <Text slot="label">{item.command}</Text>
                  <Text slot="description">{item.description}</Text>
                </MenuItem>
              );
            } else {
              return (
                <MenuSection>
                  <Header>
                    <Heading>{item.section}</Heading>
                  </Header>
                  <Collection items={item.items} dependencies={[onAction]}>
                    {item => (
                      <MenuItem id={item.title} onAction={() => onAction(item)}>
                        {item.title}
                      </MenuItem>
                    )}
                  </Collection>
                </MenuSection>
              );
            }
          }}
        </Menu>
      </Popover>
    </Autocomplete>
  );
}
