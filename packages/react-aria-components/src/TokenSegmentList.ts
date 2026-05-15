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
  readonly segments: readonly TokenFieldSegment[];
  readonly tokenRegex: RegExp | null = null;
  caretPosition: Position = {index: 0, offset: 0};
  // Linked list representing the undo/redo history.
  private previous: TokenSegmentList | null = null;
  private next: TokenSegmentList | null = null;
  private isCoalescing = true;

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
  replaceRange(start: Position, end: Position, text: string, coalesce = true): TokenSegmentList {
    return this.replaceRangeWithSegments(
      start,
      end,
      text.length > 0 ? [this.createTextSegment(text)] : [],
      coalesce
    );
  }

  replaceRangeWithSegments(
    start: Position,
    end: Position,
    insert: TokenFieldSegment[],
    coalesce = true
  ): TokenSegmentList {
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    let startSegment = this.segments[start.index];
    let endSegment = this.segments[end.index];
    let [startSplit] = this.splitSegment(startSegment, start.offset);
    let [, endSplit] = this.splitSegment(endSegment, end.offset);

    let newSegments = this.segments.slice(0, start.index);
    if (startSplit) {
      appendSegments(newSegments, [startSplit]);
    }

    if (insert.length) {
      appendSegments(newSegments, insert);
    }

    let lastSegment = newSegments[newSegments.length - 1];
    let lastIsText = lastSegment && lastSegment.type === 'text';
    let caret = {
      index: lastIsText ? newSegments.length - 1 : newSegments.length,
      offset: lastIsText ? lastSegment.text.length : 0
    };

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

    let segments = new TokenSegmentList(newSegments);
    segments.caretPosition = caret;
    segments.isCoalescing = coalesce;
    if (this.isCoalescing && coalesce && this.previous) {
      segments.previous = this.previous;
      segments.previous.next = segments;
    } else {
      segments.previous = this;
      this.caretPosition = end;
      this.next = segments;
    }
    return segments;
  }

  /** Delete text at a position using a segmenter. */
  delete(
    position: Position,
    segmenter: Intl.Segmenter,
    direction: Direction,
    coalesce = true
  ): TokenSegmentList {
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
              '',
              coalesce
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
              '',
              coalesce
            );
          }
          continue;
        }
      }
    }

    this.caretPosition = position;
    return this;
  }

  /** Delete text to the next or previous line break. */
  deleteLine(position: Position, direction: Direction, coalesce = true): TokenSegmentList {
    if (this.segments.length === 0) {
      return this;
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
          '',
          coalesce
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
      '',
      coalesce
    );
  }

  /** Converts the text at a position into a token. */
  insertToken(position: Position): TokenSegmentList {
    let segment = this.segments[position.index];
    if (segment && segment.type === 'text') {
      return this.replaceRangeWithSegments(
        {index: position.index, offset: 0},
        {index: position.index, offset: segment.text.length},
        [{type: 'token', text: segment.text}],
        false
      );
    }

    this.caretPosition = position;
    return this;
  }

  slice(start: Position, end: Position): TokenSegmentList {
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    if (start.index === end.index && start.offset === end.offset) {
      return new TokenSegmentList([]);
    }
    if (start.index === end.index) {
      let segment = this.segments[start.index];
      if (segment.type === 'text') {
        return new TokenSegmentList([
          {type: 'text', text: segment.text.slice(start.offset, end.offset)}
        ]);
      }
      return new TokenSegmentList([segment]);
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
    return new TokenSegmentList(result);
  }

  toString(): string {
    return this.segments.map(seg => seg.text).join('');
  }

  undo(): TokenSegmentList {
    return this.previous ?? this;
  }

  redo(): TokenSegmentList {
    return this.next ?? this;
  }

  endCoalescing(): void {
    this.isCoalescing = false;
  }
}

function appendSegments(
  segments: TokenFieldSegment[],
  insert: TokenFieldSegment[]
): TokenFieldSegment[] {
  for (let segment of insert) {
    let last = segments[segments.length - 1];
    if (last && last.type === 'text' && segment.type === 'text') {
      segments[segments.length - 1] = {type: 'text', text: last.text + segment.text};
    } else {
      segments.push(segment);
    }
  }
  return segments;
}
