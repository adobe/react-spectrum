/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {Input, Label, TextField, useDrag} from 'react-aria-components';
import React, {useState} from 'react';

interface RecordItem {
  id: string;
  name: string;
  owner: string;
  status: string;
}

function NotesField() {
  let [value, setValue] = useState('');
  return (
    <>
      <TextField value={value} onChange={setValue}>
        <Label>Project notes</Label>
        <Input id="dnd-notes" />
      </TextField>
      <output id="dnd-value">{value}</output>
    </>
  );
}

function DraggableCard({item}: {item: RecordItem}) {
  let {dragProps, isDragging} = useDrag({getItems: () => [{'text/plain': item.name}]});
  return (
    <div
      {...dragProps}
      role="button"
      tabIndex={0}
      data-record={item.id}
      data-dragging={isDragging || undefined}
      className="draggable-card">
      <strong>{item.name}</strong>
      <span>
        {item.owner} · {item.status}
      </span>
    </div>
  );
}

export function DndFixture({items}: {items: RecordItem[]}) {
  return (
    <>
      <NotesField />
      <div className="draggable-cards">
        {items.map(item => (
          <DraggableCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
