import {Key} from '@react-types/shared';
import {TokenSegmentList} from 'react-aria-components/TokenField';

export class ComboBoxSegmentList extends TokenSegmentList<Key> {
  getSelectedKeys(): Key[] {
    return this.segments.filter(seg => seg.type === 'token').map(seg => seg.value!);
  }

  getInputValue(): string {
    let segment = this.segments[this.caretPosition.index];
    return segment?.type === 'text' ? segment.text : '';
  }

  setSelectedKeys(keys: Key[]): ComboBoxSegmentList {
    let selectedKeys = this.getSelectedKeys();
    let added: Key[] = [];
    for (let key of keys) {
      if (!selectedKeys.includes(key)) {
        added.push(key);
      }
    }
    let removed = new Set();
    for (let key of selectedKeys) {
      if (!keys.includes(key)) {
        removed.add(key);
      }
    }

    let value = this;
    for (let key of removed) {
      let index = value.segments.findIndex(seg => seg.type === 'token' && seg.value! === key);
      value = value.replaceRangeWithSegments(
        {index: index, offset: 0},
        {index: index, offset: value.segments[index]?.text.length ?? 0},
        [],
        false
      );
    }

    if (added.length > 0) {
      let segment = value.segments[value.caretPosition.index];
      value = value.replaceRangeWithSegments(
        {index: value.caretPosition.index, offset: 0},
        segment?.type === 'text'
          ? {
              index: value.caretPosition.index,
              offset: value.segments[value.caretPosition.index]?.text.length ?? 0
            }
          : {index: value.caretPosition.index, offset: 0},
        added.map(value => {
          return {type: 'token', text: String(value), value: value};
        }),
        false
      );
    }

    return value;
  }
}
