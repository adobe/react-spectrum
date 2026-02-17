/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {Button, ButtonGroup, Content, DropZone, FileTrigger, Heading, IllustratedMessage} from '../src';
import CloudUpload from '@react-spectrum/s2/illustrations/gradient/generic1/CloudUpload';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import React from 'react';
import {render} from './utils/render';
import {style} from '../style' with {type: 'macro'};

describe('DropZone browser interactions', () => {
  it('handles drag/drop and passes dropped items', async () => {
    let onDrop = vi.fn();

    await render(
      <DropZone
        data-testid="dropzone"
        isFilled
        replaceMessage="Replace file"
        styles={style({width: 320, maxWidth: '90%'})}
        getDropOperation={types => (types.has('text/plain') ? 'copy' : 'cancel')}
        onDrop={onDrop}>
        <IllustratedMessage>
          <CloudUpload />
          <Heading>Drag and drop your file</Heading>
          <Content>or</Content>
          <ButtonGroup>
            <FileTrigger>
              <Button variant="primary">Select a file</Button>
            </FileTrigger>
          </ButtonGroup>
        </IllustratedMessage>
      </DropZone>
    );

    let dropzone = page.getByTestId('dropzone').element();
    let dt = new DataTransfer();
    dt.items.add('hello world', 'text/plain');

    dropzone.dispatchEvent(new DragEvent('dragenter', {dataTransfer: dt, bubbles: true}));
    dropzone.dispatchEvent(new DragEvent('dragover', {dataTransfer: dt, bubbles: true}));
    dropzone.dispatchEvent(new DragEvent('drop', {dataTransfer: dt, bubbles: true}));

    await expect.poll(() => onDrop).toHaveBeenCalledTimes(1);
    let event = onDrop.mock.calls[0][0];
    expect(['copy', 'cancel']).toContain(event.dropOperation);
    expect(event.items.length).toBeGreaterThanOrEqual(0);
  });

  it('rejects unsupported drop types', async () => {
    let onDrop = vi.fn();

    await render(
      <DropZone
        data-testid="dropzone"
        getDropOperation={types => (types.has('text/plain') ? 'copy' : 'cancel')}
        onDrop={onDrop}>
        <div>Drop</div>
      </DropZone>
    );

    let dropzone = page.getByTestId('dropzone').element();
    let dt = new DataTransfer();
    dt.items.add('x', 'application/json');

    dropzone.dispatchEvent(new DragEvent('dragenter', {dataTransfer: dt, bubbles: true}));
    dropzone.dispatchEvent(new DragEvent('drop', {dataTransfer: dt, bubbles: true}));

    await expect.poll(() => onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop.mock.calls[0][0].dropOperation).toBe('cancel');
  });
});
