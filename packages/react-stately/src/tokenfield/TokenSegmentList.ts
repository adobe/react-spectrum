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

export type TokenFieldSegment<T = any> = TextSegment | TokenSegment<T>;

export interface TextSegment {
  type: 'text';
  text: string;
}

export interface TokenSegment<T = any> {
  type: 'token';
  text: string;
  /** An arbitrary value associated with the token. */
  value?: T;
}

export interface Position {
  /** Index of the segment in the list. */
  index: number;
  /** Text offset within the segment in UTF-16 code units. */
  offset: number;
}

export enum Direction {
  Forward = 1,
  Backward = -1
}

export interface TokenSegmentListOptions {
  caretPosition?: Position | null;
}

/**
 * A list of segments containing editable text and non-editable tokens.
 */
export class TokenSegmentList<T = any> {
  /** The text and token segments in the list. */
  readonly segments: readonly TokenFieldSegment<T>[];
  /** The caret position. */
  caretPosition: Position = {index: 0, offset: 0};
  // Linked list representing the undo/redo history.
  private previous: this | null = null;
  private next: this | null = null;
  private isCoalescing = true;

  /** Create a new list with the given segments. */
  constructor(tokens: readonly TokenFieldSegment<T>[], options?: TokenSegmentListOptions) {
    this.segments = tokens;
    this.caretPosition = options?.caretPosition ?? {index: 0, offset: 0};
  }

  protected createSegmentList(segments: readonly TokenFieldSegment<T>[]): this {
    const Constructor = this.constructor as new (
      segments: readonly TokenFieldSegment<T>[],
      options?: TokenSegmentListOptions
    ) => this;
    return new Constructor(segments);
  }

  /** Create a new list with the caret position set to the given position. */
  withCaretPosition(caretPosition: Position): this {
    if (
      this.caretPosition.index === caretPosition.index &&
      this.caretPosition.offset === caretPosition.offset
    ) {
      return this;
    }

    let result = this.createSegmentList(this.segments);
    result.caretPosition = caretPosition;
    result.previous = this.previous;
    result.next = this.next;
    result.isCoalescing = this.isCoalescing;
    return result;
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

  private createTextSegment(text: string): TextSegment {
    return {type: 'text', text};
  }

  protected tokenize(text: string): TokenFieldSegment<T>[] {
    return [this.createTextSegment(text)];
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
  replaceRange(start: Position, end: Position, text: string, coalesce = true): this {
    return this.replaceRangeWithSegments(
      start,
      end,
      text.length > 0 ? [this.createTextSegment(text)] : [],
      coalesce
    );
  }

  /** Replace the text between two positions with new segments. */
  replaceRangeWithSegments(
    start: Position,
    end: Position,
    insert: TokenFieldSegment<T>[],
    coalesce = true
  ): this {
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
      appendSegments(newSegments, insert, text => this.tokenize(text));
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

    let segments = this.createSegmentList(newSegments);
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

  /** Find the boundary before or after a position using an Intl.Segmenter. */
  findBoundaryWithSegmenter(
    position: Position,
    segmenter: Intl.Segmenter,
    direction: Direction
  ): Position | null {
    position = this.clampPosition(position);
    for (let i = position.index; i >= 0 && i < this.segments.length; i += direction) {
      let segment = this.segments[i];
      switch (segment.type) {
        case 'token':
          if (
            i !== position.index ||
            (direction === Direction.Backward ? position.offset > 0 : position.offset === 0)
          ) {
            let index = i + direction;
            return {
              index: index >= 0 ? index : 0,
              offset:
                direction === Direction.Backward && index >= 0
                  ? this.segments[index].text.length
                  : 0
            };
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
          while (part && part.isWordLike === false) {
            offset += direction;
            part = segmenter.segment(segment.text).containing(offset);
          }

          if (part) {
            return {
              index: i,
              offset:
                direction === Direction.Backward ? part.index : part.index + part.segment.length
            };
          }
          continue;
        }
      }
    }

    return null;
  }

  /** Find a line boundary before or after a position. */
  findLineBoundary(position: Position, direction: Direction): Position | null {
    let res = this.findText(position, direction, '\n');
    if (res) {
      return res;
    }
    return direction === Direction.Backward
      ? {index: 0, offset: 0}
      : {
          index: this.segments.length - 1,
          offset: this.segments[this.segments.length - 1].text.length
        };
  }

  /** Find a string or regular expression match before or after a position. */
  findText(position: Position, direction: Direction, search: string | RegExp): Position | null {
    if (this.segments.length === 0) {
      return null;
    }

    for (let i = position.index; i >= 0 && i < this.segments.length; i += direction) {
      let segment = this.segments[i];
      if (segment.type !== 'text') {
        continue;
      }
      let offset = findInText(
        segment.text,
        search,
        direction,
        i === position.index ? position.offset : undefined
      );
      if (offset >= 0) {
        return {
          index: i,
          offset: offset
        };
      }
    }

    return null;
  }

  /** Delete text at a position using a segmenter. */
  delete(
    position: Position,
    segmenter: Intl.Segmenter,
    direction: Direction,
    coalesce = true
  ): this {
    let boundary = this.findBoundaryWithSegmenter(position, segmenter, direction);
    if (boundary) {
      return this.replaceRange(
        direction === Direction.Backward ? boundary : position,
        direction === Direction.Backward ? position : boundary,
        '',
        coalesce
      );
    }

    this.caretPosition = position;
    return this;
  }

  /** Delete text to the next or previous line break. */
  deleteLine(position: Position, direction: Direction, coalesce = true): this {
    if (this.segments.length === 0) {
      return this;
    }

    let boundary = this.findLineBoundary(position, direction);
    if (boundary) {
      return this.replaceRange(
        direction === Direction.Backward ? boundary : position,
        direction === Direction.Backward ? position : boundary,
        '',
        coalesce
      );
    }

    return this;
  }

  /** Create a new list containing a subset of the segments. */
  slice(start: Position, end: Position): this {
    start = this.clampPosition(start);
    end = this.clampPosition(end);
    if (start.index === end.index && start.offset === end.offset) {
      return this.createSegmentList([]);
    }
    if (start.index === end.index) {
      let segment = this.segments[start.index];
      if (segment.type === 'text') {
        return this.createSegmentList([
          {type: 'text', text: segment.text.slice(start.offset, end.offset)}
        ]);
      }
      return this.createSegmentList([segment]);
    }
    let startSegment = this.segments[start.index];
    let endSegment = this.segments[end.index];
    let [, startSplit] = this.splitSegment(startSegment, start.offset);
    let [endSplit] = this.splitSegment(endSegment, end.offset);

    let result: TokenFieldSegment<T>[] = [];
    if (startSplit) {
      result.push(startSplit);
    }
    result.push(...this.segments.slice(start.index + 1, end.index));
    if (endSplit) {
      result.push(endSplit);
    }
    return this.createSegmentList(result);
  }

  /** Convert the list to a string. */
  toString(): string {
    return this.segments.map(seg => seg.text).join('');
  }

  /** Returns the previous list in the undo history. */
  undo(): this {
    return this.previous ?? this;
  }

  /** Returns the next list in the redo history. */
  redo(): this {
    return this.next ?? this;
  }

  /** End coalescing undo/redo history. */
  endCoalescing(): void {
    this.isCoalescing = false;
  }
}

function findInText(
  text: string,
  search: string | RegExp,
  direction: Direction,
  fromOffset?: number
): number {
  if (typeof search === 'string') {
    if (direction === Direction.Backward) {
      return text.lastIndexOf(search, fromOffset !== undefined ? fromOffset - 1 : text.length - 1);
    }
    return text.indexOf(search, fromOffset ?? 0);
  }

  if (direction === Direction.Forward) {
    let start = fromOffset ?? 0;
    let index = text.slice(start).search(search);
    return index >= 0 ? start + index : -1;
  }

  let limit = fromOffset !== undefined ? fromOffset : text.length;
  if (limit < 0) {
    return -1;
  }

  let re = search.flags.includes('g') ? search : new RegExp(search.source, search.flags + 'g');
  let matches = Array.from(text.slice(0, limit).matchAll(re));
  return matches.at(-1)?.index ?? -1;
}

function appendSegments(
  segments: TokenFieldSegment[],
  insert: TokenFieldSegment[],
  tokenize?: (text: string) => TokenFieldSegment[]
): TokenFieldSegment[] {
  for (let segment of insert) {
    if (segment.type === 'text' && segment.text.length === 0) {
      continue;
    }

    let last = segments[segments.length - 1];
    if (last && last.type === 'text' && segment.type === 'text') {
      if (tokenize) {
        let tokenized = tokenize(last.text + segment.text);
        segments.splice(segments.length - 1, 1, ...tokenized);
      } else {
        segments[segments.length - 1] = {type: 'text', text: last.text + segment.text};
      }
    } else if (tokenize && segment.type === 'text') {
      let tokenized = tokenize(segment.text);
      segments.push(...tokenized);
    } else {
      segments.push(segment);
    }
  }
  return segments;
}
