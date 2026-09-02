import {
  CommandMenuItem,
  InsertTokenMenuItem,
  PromptFieldTokenValue,
  PromptFieldValue
} from '@react-spectrum/ai';
import FileText from '@react-spectrum/s2/icons/FileText';
import {Header, Heading, MenuSection, Text} from '@react-spectrum/s2/Menu';
import {iconStyle} from '@react-spectrum/s2/style' with {type: 'macro'};
import LinkIcon from '@react-spectrum/s2/icons/Link';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import Project from '@react-spectrum/s2/icons/Project';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import {TokenSegment} from 'react-stately';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';

export const slashCommands = [
  {command: '/clear', kind: 'command', description: 'Clear the conversation'},
  {command: '/compact', kind: 'command', description: 'Summarize the conversation so far'},
  {command: '/docx', kind: 'skill', description: 'Create or edit a Word document'},
  {command: '/pptx', kind: 'skill', description: 'Create a slide deck'}
];

const icons = {
  command: <Prompt styles={iconStyle({size: 'XS'})} />,
  skill: <Plugin styles={iconStyle({size: 'XS'})} />,
  person: <UserGroup styles={iconStyle({size: 'XS'})} />,
  document: <FileText styles={iconStyle({size: 'XS'})} />,
  project: <Project styles={iconStyle({size: 'XS'})} />,
  url: <LinkIcon styles={iconStyle({size: 'XS'})} />
} as const;

export function getIcon(token: TokenSegment<PromptFieldTokenValue>) {
  switch (token.value?.type) {
    case 'placeholder':
      return token.value.placeholderType === 'token' && token.value.valueType
        ? icons[token.value.valueType]
        : null;
    case 'url':
      return icons.url;
    case 'custom':
      return icons[token.value.valueType];
  }
}

export const objects = [
  {
    section: 'People',
    type: 'person',
    items: [
      {kind: 'person', title: 'Alex Rivera'},
      {kind: 'person', title: 'Jamie Chen'},
      {kind: 'person', title: 'Morgan Taylor'}
    ]
  },
  {
    section: 'Documents',
    type: 'document',
    items: [
      {kind: 'document', title: 'Project plan'},
      {kind: 'document', title: 'Meeting notes'},
      {kind: 'document', title: 'Research summary'}
    ]
  },
  {
    section: 'Projects',
    type: 'project',
    items: [
      {kind: 'project', title: 'Website redesign'},
      {kind: 'project', title: 'Mobile app launch'}
    ]
  }
];

interface CompletionCallbacks {
  valueType?: string | null;
  onClear?: () => void;
  onCompact?: () => void;
}

export function renderCompletions(filterValue: string, callbacks?: CompletionCallbacks) {
  if (filterValue.startsWith('/')) {
    return slashCommands
      .filter(
        item =>
          item.command.includes(filterValue.slice(1)) &&
          (callbacks?.valueType ? item.kind === callbacks.valueType : true)
      )
      .map(item =>
        item.kind === 'command' ? (
          <CommandMenuItem
            key={item.command}
            id={item.command}
            onAction={item.command === '/clear' ? callbacks?.onClear : callbacks?.onCompact}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </CommandMenuItem>
        ) : (
          <InsertTokenMenuItem
            key={item.command}
            id={item.command}
            token={{
              type: 'token',
              text: item.command,
              value: {type: 'custom', anchor: '/', valueType: item.kind, data: item}
            }}>
            <Plugin />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
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

        if (matchingItems.length > 0) {
          return (
            <MenuSection key={section.section} id={section.section}>
              <Header>
                <Heading>{section.section}</Heading>
              </Header>
              {matchingItems}
            </MenuSection>
          );
        } else {
          return null;
        }
      })
      .filter(v => v != null);
  }
  return null;
}

export interface UploadState {
  status: 'uploading' | 'completed';
  progress?: number;
}

export const suggestions = [
  new PromptFieldValue([{type: 'text', text: 'Summarize this conversation'}]),
  new PromptFieldValue([
    {type: 'text', text: 'Suggest places to eat after the hike within '},
    {type: 'token', text: '#', value: {type: 'placeholder', placeholderType: 'text'}},
    {type: 'text', text: ' miles'}
  ])
];
