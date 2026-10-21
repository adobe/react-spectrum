'use client';

import {Button, ListBox, ListBoxItem, Popover, Select, SelectValue} from 'react-aria-components';

export default function Home() {
  return (
    <main>
      <Select aria-label="Farben">
        <Button>
          <SelectValue />
        </Button>
        <Popover>
          <ListBox>
            <ListBoxItem>#000</ListBoxItem>
            <ListBoxItem>#111</ListBoxItem>
            <ListBoxItem>#222</ListBoxItem>
          </ListBox>
        </Popover>
      </Select>
    </main>
  );
}
