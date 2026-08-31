import {
  CommandMenuItem,
  InsertTextMenuItem,
  InsertTokenMenuItem,
  PromptFieldTokenValue,
  PromptFieldValue
} from '@react-spectrum/ai';
import Brand from '@react-spectrum/s2/icons/Brand';
import {Header, Heading, MenuItem, MenuSection, Text} from '@react-spectrum/s2/Menu';
import {iconStyle} from '@react-spectrum/s2/style' with {type: 'macro'};
import LinkIcon from '@react-spectrum/s2/icons/Link';
import Plugin from '@react-spectrum/s2/icons/Plugin';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import SocialNetwork from '@react-spectrum/s2/icons/SocialNetwork';
import {TokenSegment} from 'react-stately';
import UserGroup from '@react-spectrum/s2/icons/UserGroup';

export const slashCommands = [
  {
    command: '/audience-explainer',
    kind: 'skill',
    description: 'Explain an AEP audience in english'
  },
  {command: '/btw', kind: 'command', description: 'Ask a side question'},
  {command: '/clear', kind: 'command', description: 'Clear the context'},
  {command: '/compact', kind: 'command', description: 'Summarize conversation history'},
  {command: '/dataset-usage', kind: 'skill', description: 'Explain how to use a dataset'},
  {command: '/feedback', kind: 'command', description: 'Submit feedback'},
  {command: '/plan', kind: 'command', description: 'Create a plan before executing'},
  {command: '/visual-artifact', kind: 'skill', description: 'Generate a chart or graph'}
];

const icons = {
  command: <Prompt styles={iconStyle({size: 'XS'})} />,
  skill: <Plugin styles={iconStyle({size: 'XS'})} />,
  audience: <UserGroup styles={iconStyle({size: 'XS'})} />,
  campaign: <Brand styles={iconStyle({size: 'XS'})} />,
  journey: <SocialNetwork styles={iconStyle({size: 'XS'})} />,
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
    section: 'Audiences',
    type: 'audience',
    items: [
      {kind: 'audience', title: 'New Customers'},
      {kind: 'audience', title: 'Returning Customers'},
      {kind: 'audience', title: 'Loyal Customers'},
      {kind: 'audience', title: 'High-Value Customers'},
      {kind: 'audience', title: 'Low-Value Customers'}
    ]
  },
  {
    section: 'Campaigns',
    type: 'campaign',
    items: [
      {kind: 'campaign', title: 'Spring Launch 2026'},
      {kind: 'campaign', title: 'Holiday Cheer'},
      {kind: 'campaign', title: 'Back to School'},
      {kind: 'campaign', title: 'Summer Adventure'},
      {kind: 'campaign', title: 'Tech Trends Expo'}
    ]
  },
  {
    section: 'Journeys',
    type: 'journey',
    items: [
      {kind: 'journey', title: 'Welcome Flow'},
      {kind: 'journey', title: 'Abandoned Cart Recovery'},
      {kind: 'journey', title: 'Post-Purchase Follow-up'},
      {kind: 'journey', title: 'Re-engagement Campaign'},
      {kind: 'journey', title: 'Birthday Surprise Journey'}
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
        item.command === '/clear' ? (
          <MenuItem key={item.command} id={item.command} onAction={callbacks?.onClear}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </MenuItem>
        ) : item.command === '/compact' ? (
          <CommandMenuItem key={item.command} id={item.command} onAction={callbacks?.onCompact}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
          </CommandMenuItem>
        ) : item.command === '/feedback' || item.command === '/btw' ? (
          // coworker doesn't seem to have any text insertion commands anymore, so I added these for testing
          <InsertTextMenuItem key={item.command} id={item.command} text={item.command}>
            <Prompt />
            <Text slot="label">{item.command}</Text>
            <Text slot="description">{item.description}</Text>
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
            {item.kind === 'skill' ? <Plugin /> : <Prompt />}
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

interface UploadState {
  status: 'uploading' | 'completed';
  progress?: number;
}

function atEnd(v: PromptFieldValue) {
  let segs = v.segments;
  return {index: segs.length - 1, offset: segs[segs.length - 1].text.length};
}

let prompt1 = new PromptFieldValue([
  {type: 'text', text: 'Analyze '},
  {
    type: 'token',
    text: 'New Customers',
    value: {type: 'custom', anchor: '@', valueType: 'audience', data: {title: 'New Customers'}}
  },
  {type: 'text', text: ' and suggest targeting strategies'}
]);

let prompt2 = new PromptFieldValue([
  {type: 'text', text: 'Write a brief for '},
  {
    type: 'token',
    text: 'Spring Launch 2026',
    value: {type: 'custom', anchor: '@', valueType: 'campaign', data: {title: 'Spring Launch 2026'}}
  }
]);

let prompt3Base = new PromptFieldValue([
  {type: 'text', text: 'Summarize the '},
  {
    type: 'token',
    text: 'Welcome Flow',
    value: {type: 'custom', anchor: '@', valueType: 'journey', data: {title: 'Welcome Flow'}}
  }
]);

let prompt4 = new PromptFieldValue(
  [
    {type: 'text', text: 'Detect audiences in '},
    {
      type: 'token',
      text: 'Journey',
      value: {type: 'placeholder', placeholderType: 'token', anchor: '@', valueType: 'journey'}
    },
    {type: 'text', text: ' that changed significantly in the past '},
    {type: 'token', text: 'date', value: {type: 'placeholder', placeholderType: 'text'}}
  ]
  // {selectedRange: new TokenFieldValue.SelectedRange({index: 1, offset: 0}, {index: 1, offset: 1})}
);

export const prompts = [
  prompt1.withSelectedRange(new PromptFieldValue.SelectedRange(atEnd(prompt1))),
  prompt2.withSelectedRange(new PromptFieldValue.SelectedRange(atEnd(prompt2))),
  prompt3Base.replaceRange(
    atEnd(prompt3Base),
    atEnd(prompt3Base),
    ' journey performance from test.com '
  ),
  prompt4
];
