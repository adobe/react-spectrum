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
  /** The new */
  caret: Position;
}

export enum Direction {
  Forward = 1,
  Backward = -1
}

/**
 * A list of segments containing editable text and non-editable tokens.
 */
export class TokenSegmentList {
  segments: TokenFieldSegment[];

  constructor(tokens: TokenFieldSegment[]) {
    this.segments = tokens;
  }

  private splitSegment(
    segment: TokenFieldSegment,
    offset: number
  ): [TokenFieldSegment | null, TokenFieldSegment | null] {
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
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    let startSegment = this.segments[start.index];
    let endSegment = this.segments[end.index];
    let [startSplit] = this.splitSegment(startSegment, start.offset);
    let [, endSplit] = this.splitSegment(endSegment, end.offset);

    let caret = {
      index: start.index,
      offset: start.offset + text.length
    };

    let newSegments = this.segments.slice(0, start.index);
    if (startSplit) {
      newSegments.push(startSplit);
      if (startSplit.type === 'token' && text.length > 0) {
        newSegments.push(this.createTextSegment(text));
        caret.index = newSegments.length - 1;
        caret.offset = text.length;
      } else {
        startSplit.text += text;
      }

      if (endSplit) {
        if (startSplit.type === 'token' || endSplit.type === 'token') {
          newSegments.push(endSplit);
        } else {
          startSplit.text += endSplit.text;
        }
      }
    } else if (endSplit) {
      if (endSplit.type === 'token' && text.length > 0) {
        newSegments.push(this.createTextSegment(text));
      } else {
        endSplit.text = text + endSplit.text;
      }
      newSegments.push(endSplit);
    } else if (text.length) {
      newSegments.push(this.createTextSegment(text));
    }
    newSegments.push(...this.segments.slice(end.index + 1));
    return {
      value: newSegments,
      caret
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
}
