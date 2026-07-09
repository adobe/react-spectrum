import {Token, TokenField} from '../src/TokenField';
import {type TokenFieldSegment, TokenSegmentList} from 'react-aria-components/TokenField';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof TokenField> = {
  component: TokenField,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    style: {width: 400}
  }
};

export default meta;

type Story = StoryFn<typeof TokenField>;

class TokenizingSegmentList extends TokenSegmentList {
  tokenRegex: RegExp;

  constructor(tokens: TokenFieldSegment[], tokenRegex: RegExp) {
    super(tokens);
    this.tokenRegex = tokenRegex;
  }

  static tokenize(text: string, tokenRegex: RegExp): TokenSegmentList {
    let list = new this([], tokenRegex);
    let segments = list.tokenize(text);
    return new this(segments, tokenRegex);
  }

  createSegmentList(segments: TokenFieldSegment[]): this {
    let Constructor = this.constructor as new (
      tokens: TokenFieldSegment[],
      tokenRegex: RegExp
    ) => this;
    return new Constructor(segments, this.tokenRegex);
  }

  tokenize(text: string): TokenFieldSegment[] {
    if (text.length === 0) {
      return [{type: 'text', text}];
    }

    let tokenRegex = this.tokenRegex;
    tokenRegex.lastIndex = 0;

    let match: RegExpExecArray | null = null;
    let start = 0;
    let segments: TokenFieldSegment[] = [];
    while ((match = tokenRegex.exec(text))) {
      if (match.index > start) {
        segments.push({type: 'text', text: text.slice(start, match.index)});
      }
      segments.push({type: 'token', text: match[0]});
      start = match.index + match[0].length;
    }

    if (start < text.length) {
      segments.push({type: 'text', text: text.slice(start)});
    }

    return segments;
  }
}

class TagFieldSegmentList extends TokenSegmentList {
  tokenize(text: string): TokenFieldSegment[] {
    let parts = text.split(/[, \n]/);

    let segments: TokenFieldSegment[] = parts.map((part, i) => {
      if (i === parts.length - 1 || part.length === 0) {
        return {type: 'text', text: part};
      }
      return {type: 'token', text: part};
    });

    if (parts.at(-1)?.length === 0) {
      segments.pop();
    }
    return segments;
  }
}

export const Example: Story = args => (
  <TokenField
    {...args}
    defaultValue={
      new TokenSegmentList([
        {type: 'text', text: 'Hello '},
        {type: 'token', text: '@username'},
        {type: 'text', text: '!'}
      ])
    }>
    {segment => <Token>{segment.text}</Token>}
  </TokenField>
);

Example.args = {
  label: 'Message',
  description: 'Type a message with inline tokens.',
  placeholder: 'Type a message...'
};

export const AutoTokenize: Story = args => (
  <TokenField
    {...args}
    allowsNewlines
    defaultValue={TokenizingSegmentList.tokenize(
      'This example automatically tokenizes #hashtags and @usernames in the text.',
      /(?<=\s|^)[#@]\S+(?=\s)/g
    )}>
    {segment => <Token>{segment.text}</Token>}
  </TokenField>
);

AutoTokenize.args = {
  label: 'Message',
  description: 'Type #hashtags or @usernames to create tokens.'
};

export const TagField: Story = args => (
  <TokenField
    {...args}
    allowsNewlines
    defaultValue={
      new TagFieldSegmentList([
        {type: 'token', text: 'Architecture'},
        {type: 'token', text: 'Design'},
        {type: 'token', text: 'Development'},
        {type: 'token', text: 'Marketing'},
        {type: 'token', text: 'Sales'}
      ])
    }>
    {segment => <Token>{segment.text}</Token>}
  </TokenField>
);

TagField.args = {
  label: 'Categories',
  description: 'Separate tags with a comma, space, or newline.',
  placeholder: 'Add categories...'
};
