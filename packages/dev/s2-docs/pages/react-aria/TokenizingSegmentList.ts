import {type TokenFieldSegment, TokenSegmentList} from 'react-aria-components/TokenField';

export class TokenizingSegmentList extends TokenSegmentList {
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
