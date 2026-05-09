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

/**
 * Positions use JavaScript UTF-16 code unit indices (same as DOM Range offsets in text nodes),
 * not Unicode code points or grapheme clusters, except where `delete` applies `Intl.Segmenter`.
 */

import {Direction, Position, TokenFieldSegment, TokenSegmentList} from '../src/TokenSegmentList';

function text(s: string): TokenFieldSegment {
  return {type: 'text', text: s};
}

function token(s: string): TokenFieldSegment {
  return {type: 'token', text: s};
}

function replace(segments: TokenFieldSegment[], start: Position, end: Position, insert: string) {
  return new TokenSegmentList(segments).replaceRange(start, end, insert);
}

function replaceWithRegex(
  segments: TokenFieldSegment[],
  start: Position,
  end: Position,
  insert: string,
  regex: RegExp | null
) {
  return new TokenSegmentList(segments, {tokenRegex: regex}).replaceRange(start, end, insert);
}

function replaceSeg(
  segments: TokenFieldSegment[],
  start: Position,
  end: Position,
  insert: TokenFieldSegment[]
) {
  return new TokenSegmentList(segments).replaceRangeWithSegments(start, end, insert);
}

function replaceSegWithRegex(
  segments: TokenFieldSegment[],
  start: Position,
  end: Position,
  insert: TokenFieldSegment[],
  regex: RegExp | null
) {
  return new TokenSegmentList(segments, {tokenRegex: regex}).replaceRangeWithSegments(
    start,
    end,
    insert
  );
}

describe('TokenSegmentList', () => {
  let graphemeSegmenter: Intl.Segmenter;
  let wordSegmenter: Intl.Segmenter;

  beforeAll(() => {
    graphemeSegmenter = new Intl.Segmenter('en-US', {granularity: 'grapheme'});
    wordSegmenter = new Intl.Segmenter('en-US', {granularity: 'word'});
  });

  describe('replaceRange', () => {
    describe('single text segment', () => {
      it('inserts at start (collapsed range)', () => {
        let {value, caret} = replace(
          [text('ab')],
          {index: 0, offset: 0},
          {index: 0, offset: 0},
          'X'
        );
        expect(value).toEqual([text('Xab')]);
        expect(caret).toEqual({index: 0, offset: 1});
      });

      it('inserts at end (collapsed range)', () => {
        let {value, caret} = replace(
          [text('ab')],
          {index: 0, offset: 2},
          {index: 0, offset: 2},
          'Z'
        );
        expect(value).toEqual([text('abZ')]);
        expect(caret).toEqual({index: 0, offset: 3});
      });

      it('inserts in middle (collapsed range)', () => {
        let {value, caret} = replace(
          [text('hello')],
          {index: 0, offset: 2},
          {index: 0, offset: 2},
          '__'
        );
        expect(value).toEqual([text('he__llo')]);
        expect(caret).toEqual({index: 0, offset: 4});
      });

      it('replaces a substring in the middle', () => {
        let {value, caret} = replace(
          [text('hello')],
          {index: 0, offset: 2},
          {index: 0, offset: 4},
          'XX'
        );
        expect(value).toEqual([text('heXXo')]);
        expect(caret).toEqual({index: 0, offset: 4});
      });

      it('replaces entire segment with empty string', () => {
        let {value, caret} = replace(
          [text('hello')],
          {index: 0, offset: 0},
          {index: 0, offset: 5},
          ''
        );
        expect(value).toEqual([]);
        expect(caret).toEqual({index: 0, offset: 0});
      });

      it('replaces entire segment with new text', () => {
        let {value, caret} = replace(
          [text('hello')],
          {index: 0, offset: 0},
          {index: 0, offset: 5},
          'hi'
        );
        expect(value).toEqual([text('hi')]);
        expect(caret).toEqual({index: 0, offset: 2});
      });

      it('deletes a single character range', () => {
        let {value, caret} = replace(
          [text('abc')],
          {index: 0, offset: 1},
          {index: 0, offset: 2},
          ''
        );
        expect(value).toEqual([text('ac')]);
        expect(caret).toEqual({index: 0, offset: 1});
      });

      it('inserts text when empty', () => {
        let {value, caret} = replace([], {index: 0, offset: 0}, {index: 0, offset: 0}, 'hello');
        expect(value).toEqual([text('hello')]);
        expect(caret).toEqual({index: 0, offset: 5});
      });
    });

    describe('multiple text segments (no tokens)', () => {
      it('merges across two segments when selection spans boundary', () => {
        let {value, caret} = replace(
          [text('ab'), text('cd')],
          {index: 0, offset: 1},
          {index: 1, offset: 1},
          'X'
        );
        expect(value).toEqual([text('aXd')]);
        expect(caret).toEqual({index: 0, offset: 2});
      });

      it('replaces both segments entirely with one insert', () => {
        let {value, caret} = replace(
          [text('ab'), text('cd')],
          {index: 0, offset: 0},
          {index: 1, offset: 2},
          'Z'
        );
        expect(value).toEqual([text('Z')]);
        expect(caret).toEqual({index: 0, offset: 1});
      });
    });

    describe('tokens in range', () => {
      it('removes token and merges surrounding text when selection spans token', () => {
        let {value, caret} = replace(
          [text('a'), token('T'), text('b')],
          {index: 0, offset: 1},
          {index: 2, offset: 0},
          ''
        );
        expect(value).toEqual([text('ab')]);
        expect(caret).toEqual({index: 0, offset: 1});
      });

      it('replaces across token with new text', () => {
        let {value, caret} = replace(
          [text('a'), token('T'), text('b')],
          {index: 0, offset: 0},
          {index: 2, offset: 1},
          'XY'
        );
        expect(value).toEqual([text('XY')]);
        expect(caret).toEqual({index: 0, offset: 2});
      });

      it('removes two adjacent tokens when range covers both and following text start', () => {
        let {value, caret} = replace(
          [token('A'), token('B'), text('z')],
          {index: 0, offset: 0},
          {index: 2, offset: 0},
          ''
        );
        expect(value).toEqual([text('z')]);
        expect(caret).toEqual({index: 0, offset: 0});
      });

      it('removes multiple interior tokens between text selections', () => {
        let {value, caret} = replace(
          [text('aa'), token('T1'), token('T2'), text('bb')],
          {index: 0, offset: 1},
          {index: 3, offset: 1},
          '_'
        );
        expect(value).toEqual([text('a_b')]);
        expect(caret).toEqual({index: 0, offset: 2});
      });

      it('inserts before token when range starts at token boundary (offset 0)', () => {
        let {value, caret} = replace(
          [text('pre'), token('T')],
          {index: 1, offset: 0},
          {index: 1, offset: 0},
          '@'
        );
        expect(value).toEqual([text('pre@'), token('T')]);
        expect(caret).toEqual({index: 0, offset: 4});
      });

      it('inserts text before a lone token when collapsed at token start (implementation order)', () => {
        let {value, caret} = replace(
          [token('T')],
          {index: 0, offset: 0},
          {index: 0, offset: 0},
          'x'
        );
        expect(value).toEqual([text('x'), token('T')]);
        expect(caret).toEqual({index: 0, offset: 1});
      });

      it('inserts after token when start is inside token (offset > 0)', () => {
        let {value, caret} = replace(
          [token('T')],
          {index: 0, offset: 1},
          {index: 0, offset: 1},
          'x'
        );
        expect(value).toEqual([token('T'), text('x')]);
        expect(caret).toEqual({index: 1, offset: 1});
      });
    });

    describe('UTF-16 / supplementary plane', () => {
      const emoji = '😀';

      it('inserts before an emoji using code unit offsets', () => {
        expect(emoji.length).toBe(2);
        let {value, caret} = replace(
          [text(`a${emoji}b`)],
          {index: 0, offset: 1},
          {index: 0, offset: 1},
          '_'
        );
        expect(value).toEqual([text(`a_${emoji}b`)]);
        expect(caret).toEqual({index: 0, offset: 2});
      });

      it('replaces only the emoji (two code units)', () => {
        let {value, caret} = replace(
          [text(`a${emoji}b`)],
          {index: 0, offset: 1},
          {index: 0, offset: 3},
          'Z'
        );
        expect(value).toEqual([text('aZb')]);
        expect(caret).toEqual({index: 0, offset: 2});
      });

      it('handles combining character as two code units after base letter', () => {
        let s = 'e\u0301';
        expect(s.length).toBe(2);
        let {value, caret} = replace([text(s)], {index: 0, offset: 1}, {index: 0, offset: 2}, '');
        expect(value).toEqual([text('e')]);
        expect(caret).toEqual({index: 0, offset: 1});
      });

      it('handles family emoji sequence length for offset math', () => {
        let s = '👨‍👩‍👧‍👦';
        expect(s.length).toBeGreaterThan(4);
        let {value, caret} = replace(
          [text(`x${s}y`)],
          {index: 0, offset: 1},
          {index: 0, offset: 1 + s.length},
          'Z'
        );
        expect(value).toEqual([text('xZy')]);
        expect(caret).toEqual({index: 0, offset: 2});
      });
    });
  });

  describe('replaceRangeWithSegments', () => {
    it('matches replaceRange for a single text insert segment', () => {
      let start = {index: 0, offset: 2};
      let end = {index: 0, offset: 2};
      let segs = [text('hello')];
      let a = replace(segs, start, end, '__');
      let b = replaceSeg(segs, start, end, [text('__')]);
      expect(b).toEqual(a);
    });

    it('matches replaceRange across a token when insert is one text segment', () => {
      let start = {index: 0, offset: 0};
      let end = {index: 2, offset: 1};
      let segs = [text('a'), token('T'), text('b')];
      let a = replace(segs, start, end, 'XY');
      let b = replaceSeg(segs, start, end, [text('XY')]);
      expect(b).toEqual(a);
    });

    it('matches replaceRange with tokenRegex when insert is one text segment', () => {
      const mentionRe = /@\S+(?=\s)/g;
      let start = {index: 0, offset: 6};
      let end = {index: 0, offset: 6};
      let segs = [text('hello  world')];
      let a = replaceWithRegex(segs, start, end, '@alice ', mentionRe);
      let b = replaceSegWithRegex(segs, start, end, [text('@alice ')], mentionRe);
      expect(b).toEqual(a);
    });

    it('replaceRange delegates to replaceRangeWithSegments (non-empty string)', () => {
      let list = new TokenSegmentList([text('ab')]);
      let a = list.replaceRange({index: 0, offset: 1}, {index: 0, offset: 1}, 'Z');
      let b = list.replaceRangeWithSegments({index: 0, offset: 1}, {index: 0, offset: 1}, [
        text('Z')
      ]);
      expect(b).toEqual(a);
    });

    it('inserts structured segments in the middle of a text run', () => {
      let {value, caret} = replaceSeg(
        [text('hello')],
        {index: 0, offset: 2},
        {index: 0, offset: 2},
        [text('['), token('T'), text(']')]
      );
      expect(value).toEqual([text('he['), token('T'), text(']llo')]);
      expect(caret).toEqual({index: 2, offset: 1});
    });

    it('does not run tokenRegex on token-only insert', () => {
      const mentionRe = /@\S+(?=\s)/g;
      let {value, caret} = replaceSegWithRegex(
        [text('hello ')],
        {index: 0, offset: 6},
        {index: 0, offset: 6},
        [token('@alice')],
        mentionRe
      );
      expect(value).toEqual([text('hello '), token('@alice')]);
      expect(caret).toEqual({index: 1, offset: 6});
    });
  });

  describe('delete', () => {
    it('deletes one grapheme backward inside ASCII text', () => {
      let list = new TokenSegmentList([text('abc')]);
      let {value, caret} = list.delete(
        {index: 0, offset: 3},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 2});
    });

    it('deletes one grapheme forward from middle of ASCII text', () => {
      let list = new TokenSegmentList([text('abc')]);
      let {value, caret} = list.delete({index: 0, offset: 1}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('ac')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('deletes one grapheme forward at offset 0', () => {
      let list = new TokenSegmentList([text('abc')]);
      let {value, caret} = list.delete({index: 0, offset: 0}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('bc')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('deletes full emoji as one grapheme backward', () => {
      let s = `a${'😀'}b`;
      let list = new TokenSegmentList([text(s)]);
      let {value, caret} = list.delete(
        {index: 0, offset: 1 + 2},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('deletes full emoji as one grapheme forward from before emoji', () => {
      let s = `a${'😀'}b`;
      let list = new TokenSegmentList([text(s)]);
      let {value, caret} = list.delete({index: 0, offset: 1}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('backward deletes trailing token when last segment is a token', () => {
      let list = new TokenSegmentList([text('x'), token('T')]);
      let {value, caret} = list.delete(
        {index: 2, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('x')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('at start of text backward removes previous token', () => {
      let list = new TokenSegmentList([token('T'), text('ab')]);
      let {value, caret} = list.delete(
        {index: 1, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('at start of text backward removes character from previous text segment', () => {
      let list = new TokenSegmentList([text('xy'), text('ab')]);
      let {value, caret} = list.delete(
        {index: 1, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('xab')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('at end of text forward removes next token', () => {
      let list = new TokenSegmentList([text('ab'), token('T')]);
      let {value, caret} = list.delete({index: 0, offset: 2}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 2});
    });

    it('on token index at offset 0 backward removes previous character', () => {
      let list = new TokenSegmentList([text('ab'), token('T')]);
      let {value, caret} = list.delete(
        {index: 1, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('a'), token('T')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('on token index at offset > 0 backward removes token', () => {
      let list = new TokenSegmentList([text('ab'), token('T')]);
      let {value, caret} = list.delete(
        {index: 1, offset: 1},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('on token index at offset 0 forward removes token segment', () => {
      let list = new TokenSegmentList([text('a'), token('T')]);
      let {value, caret} = list.delete({index: 1, offset: 0}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('a')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('on token index at offset > 0 forward removes next character', () => {
      let list = new TokenSegmentList([token('T'), text('ab')]);
      let {value, caret} = list.delete({index: 0, offset: 1}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([token('T'), text('b')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('backward from start of second token removes first token', () => {
      let list = new TokenSegmentList([token('A'), token('B')]);
      let {value, caret} = list.delete(
        {index: 1, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([token('B')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('forward from start of second token removes second token', () => {
      let list = new TokenSegmentList([token('A'), token('B')]);
      let {value, caret} = list.delete({index: 1, offset: 0}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([token('A')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('backward from end of first token removes first token', () => {
      let list = new TokenSegmentList([token('A'), token('B')]);
      let {value, caret} = list.delete(
        {index: 0, offset: 1},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([token('B')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('forward from end of first token removes second token', () => {
      let list = new TokenSegmentList([token('A'), token('B')]);
      let {value, caret} = list.delete({index: 0, offset: 1}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([token('A')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('at first segment offset 0 backward is no-op', () => {
      let list = new TokenSegmentList([text('ab')]);
      let {value, caret} = list.delete(
        {index: 0, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('at end of last segment forward is a no-op', () => {
      let list = new TokenSegmentList([text('ab')]);
      let {value, caret} = list.delete({index: 0, offset: 2}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('ab')]);
      expect(caret).toEqual({index: 0, offset: 2});
    });

    it('uses word segmenter for deleteWordBackward-style range', () => {
      let list = new TokenSegmentList([text('hello world')]);
      let {value, caret} = list.delete({index: 0, offset: 11}, wordSegmenter, Direction.Backward);
      expect(value).toEqual([text('hello ')]);
      expect(caret).toEqual({index: 0, offset: 6});
    });

    it('uses word segmenter for deleteWordForward-style range', () => {
      let list = new TokenSegmentList([text('hello world')]);
      let {value, caret} = list.delete({index: 0, offset: 6}, wordSegmenter, Direction.Forward);
      expect(value).toEqual([text('hello ')]);
      expect(caret).toEqual({index: 0, offset: 6});
    });

    it('forward from end of a text segment deletes first grapheme of the next text segment (merged into one run)', () => {
      let list = new TokenSegmentList([text('ab'), text('cd')]);
      let {value, caret} = list.delete({index: 0, offset: 2}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([text('abd')]);
      expect(caret).toEqual({index: 0, offset: 2});
    });

    it('is a no-op when segments are empty', () => {
      let list = new TokenSegmentList([]);
      let {value, caret} = list.delete({index: 0, offset: 0}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('on lone token at offset 0 backward is a no-op', () => {
      let list = new TokenSegmentList([token('T')]);
      let {value, caret} = list.delete(
        {index: 0, offset: 0},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([token('T')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('on lone token at offset 0 forward removes the token', () => {
      let list = new TokenSegmentList([token('T')]);
      let {value, caret} = list.delete({index: 0, offset: 0}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('deletes e plus combining acute as one grapheme backward (entire cluster removed)', () => {
      let s = 'e\u0301';
      let list = new TokenSegmentList([text(s)]);
      let {value, caret} = list.delete(
        {index: 0, offset: 2},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([]);
      expect(caret).toEqual({index: 0, offset: 0});
    });

    it('backward delete of last character leaves caret between the two tokens', () => {
      let list = new TokenSegmentList([token('L'), text('a'), token('R')]);
      let {value, caret} = list.delete(
        {index: 1, offset: 1},
        graphemeSegmenter,
        Direction.Backward
      );
      expect(value).toEqual([token('L'), token('R')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('forward delete of last character leaves caret between the two tokens', () => {
      let list = new TokenSegmentList([token('L'), text('a'), token('R')]);
      let {value, caret} = list.delete({index: 1, offset: 0}, graphemeSegmenter, Direction.Forward);
      expect(value).toEqual([token('L'), token('R')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });
  });

  describe('deleteLine (forward)', () => {
    it('deletes from caret through character before newline in same segment', () => {
      let list = new TokenSegmentList([text('hello\nworld')]);
      let {value, caret} = list.deleteLine({index: 0, offset: 2}, Direction.Forward);
      expect(value).toEqual([text('he\nworld')]);
      expect(caret).toEqual({index: 0, offset: 2});
    });

    it('finds newline in a later segment when none after caret in first', () => {
      let list = new TokenSegmentList([text('ab'), text('cd\nef')]);
      let {value, caret} = list.deleteLine({index: 0, offset: 1}, Direction.Forward);
      expect(value).toEqual([text('a\nef')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('when no newline after caret, deletes to end of last segment', () => {
      let list = new TokenSegmentList([text('ab'), text('cd')]);
      let {value, caret} = list.deleteLine({index: 0, offset: 1}, Direction.Forward);
      expect(value).toEqual([text('a')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('uses newline after caret in same segment when multiple newlines exist', () => {
      let list = new TokenSegmentList([text('a\nb\nc')]);
      let {value, caret} = list.deleteLine({index: 0, offset: 2}, Direction.Forward);
      expect(value).toEqual([text('a\n\nc')]);
      expect(caret).toEqual({index: 0, offset: 2});
    });
  });

  describe('deleteLine (backward)', () => {
    it('deletes from newline through caret (range start is the newline code unit)', () => {
      let list = new TokenSegmentList([text('hello\nworld')]);
      let {value, caret} = list.deleteLine({index: 0, offset: 10}, Direction.Backward);
      expect(value).toEqual([text('hellod')]);
      expect(caret).toEqual({index: 0, offset: 5});
    });

    it('finds newline in an earlier segment', () => {
      let list = new TokenSegmentList([text('a\nb'), text('cd')]);
      let {value, caret} = list.deleteLine({index: 1, offset: 1}, Direction.Backward);
      expect(value).toEqual([text('ad')]);
      expect(caret).toEqual({index: 0, offset: 1});
    });

    it('when no newline before caret, deletes from document start', () => {
      let list = new TokenSegmentList([text('hello')]);
      let {value, caret} = list.deleteLine({index: 0, offset: 3}, Direction.Backward);
      expect(value).toEqual([text('lo')]);
      expect(caret).toEqual({index: 0, offset: 0});
    });
  });

  describe('deleteLine empty list', () => {
    it('returns unchanged for empty segments', () => {
      let list = new TokenSegmentList([]);
      expect(list.deleteLine({index: 0, offset: 0}, Direction.Forward)).toEqual({
        value: [],
        caret: {index: 0, offset: 0}
      });
      expect(list.deleteLine({index: 0, offset: 0}, Direction.Backward)).toEqual({
        value: [],
        caret: {index: 0, offset: 0}
      });
    });
  });

  describe('insertToken', () => {
    it('turns entire text segment into a token', () => {
      let list = new TokenSegmentList([text('hello')]);
      let {value, caret} = list.insertToken({index: 0, offset: 0});
      expect(value).toEqual([token('hello')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('ignores offset and still tokenizes full text run', () => {
      let list = new TokenSegmentList([text('hello')]);
      let {value, caret} = list.insertToken({index: 0, offset: 3});
      expect(value).toEqual([token('hello')]);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('no-op when index points at token', () => {
      let segs = [text('a'), token('T')];
      let list = new TokenSegmentList(segs);
      let {value, caret} = list.insertToken({index: 1, offset: 0});
      expect(value).toEqual(segs);
      expect(caret).toEqual({index: 1, offset: 0});
    });

    it('no-op when index is out of range', () => {
      let segs = [text('a')];
      let list = new TokenSegmentList(segs);
      let {value, caret} = list.insertToken({index: 5, offset: 0});
      expect(value).toEqual(segs);
      expect(caret).toEqual({index: 5, offset: 0});
    });
  });

  describe('tokenRegex', () => {
    const mentionRe = /@\S+(?=\s)/g;

    it('tokenizes mention when trailing space is part of the insert (lookahead in window)', () => {
      let {value, caret} = replaceWithRegex(
        [text('hello  world')],
        {index: 0, offset: 6},
        {index: 0, offset: 6},
        '@alice ',
        mentionRe
      );
      expect(value).toEqual([text('hello '), token('@alice'), text('  world')]);
      expect(caret).toEqual({index: 2, offset: 1});
    });

    it('does not tokenize when space after mention exists only in suffix (outside window)', () => {
      let {value, caret} = replaceWithRegex(
        [text('hello  world')],
        {index: 0, offset: 6},
        {index: 0, offset: 6},
        '@alice',
        mentionRe
      );
      expect(value).toEqual([text('hello @alice world')]);
      expect(caret).toEqual({index: 0, offset: 12});
    });

    it('tokenizes multiple mentions in one insert', () => {
      let {value, caret} = replaceWithRegex(
        [text('')],
        {index: 0, offset: 0},
        {index: 0, offset: 0},
        '@a @b ',
        mentionRe
      );
      expect(value).toEqual([token('@a'), text(' '), token('@b'), text(' ')]);
      expect(caret).toEqual({index: 3, offset: 1});
    });

    it('with tokenRegex null, behaves like replace without tokenization', () => {
      let withRegex = replaceWithRegex(
        [text('hello  world')],
        {index: 0, offset: 6},
        {index: 0, offset: 6},
        '@alice ',
        mentionRe
      );
      let withNull = replaceWithRegex(
        [text('hello  world')],
        {index: 0, offset: 6},
        {index: 0, offset: 6},
        '@alice ',
        null
      );
      expect(withRegex.value).not.toEqual(withNull.value);
      expect(withNull.value).toEqual([text('hello @alice  world')]);
      expect(withNull.caret).toEqual({index: 0, offset: 13});
    });

    it('does not run tokenization on empty insert even when pattern would match full string', () => {
      let list = new TokenSegmentList([text('@alice  ')], {tokenRegex: mentionRe});
      let {value, caret} = list.replaceRange({index: 0, offset: 7}, {index: 0, offset: 8}, '');
      expect(value).toEqual([text('@alice ')]);
      expect(caret).toEqual({index: 0, offset: 7});
    });
  });
});
