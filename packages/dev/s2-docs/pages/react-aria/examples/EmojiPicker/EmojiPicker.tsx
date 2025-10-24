"use client";
import {Autocomplete, GridLayout, ListBox, ListBoxItem, Select, SelectValue, Size, useFilter, Virtualizer} from 'react-aria-components';
import {Button} from 'vanilla-starter/Button';
import {Popover} from 'vanilla-starter/Popover';
import {SearchField} from 'vanilla-starter/SearchField';
import _emojis from 'emojibase-data/en/compact.json';
import './EmojiPicker.css';

const emojis = _emojis.filter((e) => !e.label.startsWith('regional indicator'));

export function EmojiPicker() {
  let {contains} = useFilter({ sensitivity: 'base' });

  return (
    <Select aria-label="Emoji" className="emoji-picker" defaultValue="🥳">
      <Button variant="secondary">
        <SelectValue />
      </Button>
      <Popover placement="bottom">
        <Autocomplete filter={contains}>
          <div className="emoji-picker-popover">
            <SearchField aria-label="Search" placeholder="Search emoji" autoFocus />
            <Virtualizer
              layout={GridLayout}
              layoutOptions={{
                minItemSize: new Size(32, 32),
                maxItemSize: new Size(32, 32),
                minSpace: new Size(4, 4),
                preserveAspectRatio: true,
              }}>
              <ListBox className="emoji-list" items={emojis} aria-label="Emoji list" layout="grid">
                {(item) => <EmojiItem id={item.unicode} item={item} />}
              </ListBox>
            </Virtualizer>
          </div>
        </Autocomplete>
      </Popover>
    </Select>
  );
}

function EmojiItem({ id, item }: { id: string; item: (typeof emojis)[0] }) {
  return (
    <ListBoxItem
      id={id}
      value={item}
      textValue={item.label + (item.tags || []).join(' ')}
      className="emoji-item">
      {item.unicode}
    </ListBoxItem>
  );
}
