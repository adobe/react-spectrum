export interface TokenFieldSegment {
  type: 'token' | 'text';
  text: string;
}

export interface Position {
  /** Index of the segment in the list. */
  index: number;
  /** Text offset within the segment. */
  offset: number;
}

export interface Change {
  /** The new list of segments. */
  value: TokenFieldSegment[];
  /** The new caret position. */
  caret: Position;
  undo?: (tokens: TokenSegmentList) => Change;
}

export enum Direction {
  Forward = 1,
  Backward = -1
}

export interface TokenSegmentListOptions {
  tokenRegex?: RegExp | null;
}

/**
 * A list of segments containing editable text and non-editable tokens.
 */
export class TokenSegmentList {
  segments: TokenFieldSegment[];
  tokenRegex: RegExp | null = null;

  constructor(tokens: TokenFieldSegment[], options?: TokenSegmentListOptions) {
    this.segments = tokens;
    if (options && 'tokenRegex' in options) {
      this.tokenRegex = options.tokenRegex ?? null;
    }
  }

  private splitSegment(
    segment: TokenFieldSegment | undefined,
    offset: number
  ): [TokenFieldSegment | null, TokenFieldSegment | null] {
    if (!segment) {
      let empty = this.createTextSegment('');
      return [offset > 0 ? empty : null, offset > 0 ? null : empty];
    }

    if (segment.type === 'token') {
      return [offset > 0 ? {...segment} : null, offset > 0 ? null : {...segment}];
    }

    return [
      offset > 0 ? {type: 'text', text: segment.text.slice(0, offset)} : null,
      offset < segment.text.length ? this.createTextSegment(segment.text.slice(offset)) : null
    ];
  }

  private createTextSegment(text: string): TokenFieldSegment {
    return {type: 'text', text};
  }

  private tokenize(text: string): TokenFieldSegment[] {
    let tokenRegex = this.tokenRegex;
    if (!tokenRegex || text.length === 0) {
      return [this.createTextSegment(text)];
    }

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

  private clampPosition(position: Position): Position {
    if (this.segments.length > 0 && position.index >= this.segments.length) {
      return {
        index: this.segments.length - 1,
        offset: this.segments[this.segments.length - 1].text.length
      };
    }

    if (position.index < 0) {
      return {index: 0, offset: 0};
    }
    return position;
  }

  /** Replace the text between two positions with new text. */
  replaceRange(start: Position, end: Position, text: string): Change {
    return this.replaceRangeWithSegments(
      start,
      end,
      text.length > 0 ? [this.createTextSegment(text)] : []
    );
  }

  replaceRangeWithSegments(start: Position, end: Position, insert: TokenFieldSegment[]): Change {
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    let startSegment = this.segments[start.index];
    let endSegment = this.segments[end.index];
    let [startSplit] = this.splitSegment(startSegment, start.offset);
    let [, endSplit] = this.splitSegment(endSegment, end.offset);

    let caret = {
      index: start.index,
      offset: start.offset
    };

    let newSegments = this.segments.slice(0, start.index);
    if (startSplit) {
      appendSegments(newSegments, [startSplit]);
    }

    if (insert.length) {
      appendSegments(newSegments, insert);
      caret.index = newSegments.length - 1;
      caret.offset = newSegments[newSegments.length - 1].text.length;
    }

    if (endSplit) {
      appendSegments(newSegments, [endSplit]);
    }

    appendSegments(newSegments, this.segments.slice(end.index + 1));

    if (this.tokenRegex && insert.length > 0) {
      let i = caret.index;
      let seg = newSegments[i];
      if (seg?.type === 'text') {
        let window = seg.text.slice(0, caret.offset);
        let suffix = seg.text.slice(caret.offset);
        let tokenized = this.tokenize(window);
        caret.index += tokenized.length - 1;
        caret.offset = tokenized[tokenized.length - 1].text.length;
        if (suffix.length > 0) {
          appendSegments(tokenized, [this.createTextSegment(suffix)]);
        }
        newSegments.splice(i, 1, ...tokenized);
      }
    }

    let original = this.slice(start, end);
    return {
      value: newSegments,
      caret,
      undo: tokens => tokens.replaceRangeWithSegments(start, caret, original)
    };
  }

  /** Delete text at a position using a segmenter. */
  delete(position: Position, segmenter: Intl.Segmenter, direction: Direction): Change {
    position = this.clampPosition(position);

    for (let i = position.index; i >= 0 && i < this.segments.length; i += direction) {
      let segment = this.segments[i];
      switch (segment.type) {
        case 'token':
          if (
            i !== position.index ||
            (direction === Direction.Backward ? position.offset > 0 : position.offset === 0)
          ) {
            let pos: Position = {
              index: i,
              offset: direction === Direction.Backward ? 0 : segment.text.length
            };
            return this.replaceRange(
              direction === Direction.Backward ? pos : position,
              direction === Direction.Backward ? position : pos,
              ''
            );
          }
          continue;
        case 'text': {
          let offset = direction === Direction.Backward ? segment.text.length : 0;
          if (i === position.index) {
            offset = position.offset;
          }
          if (direction === Direction.Backward) {
            offset--;
          }
          if (offset < 0 || offset >= segment.text.length) {
            continue;
          }

          let part = segmenter.segment(segment.text).containing(offset);
          if (part) {
            let pos: Position = {
              index: i,
              offset:
                direction === Direction.Backward ? part.index : part.index + part.segment.length
            };
            return this.replaceRange(
              direction === Direction.Backward ? pos : position,
              direction === Direction.Backward ? position : pos,
              ''
            );
          }
          continue;
        }
      }
    }

    return {
      value: this.segments,
      caret: position
    };
  }

  /** Delete text to the next or previous line break. */
  deleteLine(position: Position, direction: Direction): Change {
    if (this.segments.length === 0) {
      return {value: this.segments, caret: position};
    }

    for (let i = position.index; i >= 0 && i < this.segments.length; i += direction) {
      let segment = this.segments[i];
      if (segment.type !== 'text') {
        continue;
      }
      let offset =
        direction === Direction.Backward
          ? segment.text.lastIndexOf(
              '\n',
              i === position.index ? position.offset - 1 : segment.text.length - 1
            )
          : segment.text.indexOf('\n', i === position.index ? position.offset : 0);
      if (offset >= 0) {
        let pos: Position = {
          index: i,
          offset: offset
        };
        return this.replaceRange(
          direction === Direction.Backward ? pos : position,
          direction === Direction.Backward ? position : pos,
          ''
        );
      }
    }

    return this.replaceRange(
      direction === Direction.Backward ? {index: 0, offset: 0} : position,
      direction === Direction.Backward
        ? position
        : {
            index: this.segments.length - 1,
            offset: this.segments[this.segments.length - 1].text.length
          },
      ''
    );
  }

  /** Converts the text at a position into a token. */
  insertToken(position: Position): Change {
    let segment = this.segments[position.index];
    if (segment && segment.type === 'text') {
      return {
        value: [
          ...this.segments.slice(0, position.index),
          {type: 'token', text: segment.text},
          ...this.segments.slice(position.index + 1)
        ],
        caret: {
          index: position.index + 1,
          offset: 0
        }
      };
    }

    return {
      value: this.segments,
      caret: position
    };
  }

  slice(start: Position, end: Position): TokenFieldSegment[] {
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    if (start.index === end.index && start.offset === end.offset) {
      return [];
    }
    if (start.index === end.index) {
      let segment = this.segments[start.index];
      if (segment.type === 'text') {
        return [{type: 'text', text: segment.text.slice(start.offset, end.offset)}];
      }
      return [segment];
    }
    let startSegment = this.segments[start.index];
    let endSegment = this.segments[end.index];
    let [, startSplit] = this.splitSegment(startSegment, start.offset);
    let [endSplit] = this.splitSegment(endSegment, end.offset);

    let result: TokenFieldSegment[] = [];
    if (startSplit) {
      result.push(startSplit);
    }
    result.push(...this.segments.slice(start.index + 1, end.index));
    if (endSplit) {
      result.push(endSplit);
    }
    return result;
  }
}

function appendSegments(
  segments: TokenFieldSegment[],
  insert: TokenFieldSegment[]
): TokenFieldSegment[] {
  for (let segment of insert) {
    let last = segments[segments.length - 1];
    if (last && last.type === 'text' && segment.type === 'text') {
      last.text += segment.text;
    } else {
      segments.push(segment);
    }
  }
  return segments;
}
