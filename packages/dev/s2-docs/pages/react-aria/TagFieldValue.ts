import {type TokenFieldSegment, TokenFieldValue} from 'react-aria-components/TokenField';

export class TagFieldValue extends TokenFieldValue {
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

  toString(): string {
    return this.segments.map(seg => seg.text).join(', ');
  }
}
