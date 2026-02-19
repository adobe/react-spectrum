/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {Button, ButtonGroup, Content, DropZone, FileTrigger, Heading, IllustratedMessage} from '../src';
import CloudUpload from '@react-spectrum/s2/illustrations/gradient/generic1/CloudUpload';
import {describe, expect, it, vi} from 'vitest';
import {dragAndDrop} from './utils/dragAndDrop';
import {page} from 'vitest/browser';
import React from 'react';
import {render} from './utils/render';
import {style} from '../style' with {type: 'macro'};
import {useDrag} from '@react-aria/dnd';

function Draggable({type}: {type: string}) {
  let {dragProps} = useDrag({
    getItems() {
      return [{
        [type]: 'hello world'
      }];
    }
  });

  return (
    <div {...dragProps} role="button" tabIndex={0} data-testid="drag-source">
      Drag me
    </div>
  );
}

describe('DropZone browser interactions', () => {
  it('should handle drag and drop of valid drop types', async () => {
    let onDrop = vi.fn();

    await render(
      <>
        <Draggable type="text/plain" />
        <DropZone
          data-testid="dropzone"
          isFilled
          replaceMessage="Replace file"
          styles={style({width: 320, maxWidth: '90%'})}
          getDropOperation={types => (types.has('text/plain') ? 'copy' : 'cancel')}
          onDrop={onDrop}>
          <IllustratedMessage>
            <CloudUpload />
            <Heading>
              Drag and drop your file
            </Heading>
            <Content>
              Or, select a file from your computer
            </Content>
            <ButtonGroup>
              <FileTrigger
                acceptedFileTypes={['text/plain']}>
                <Button variant="accent">Browse files</Button>
              </FileTrigger>
            </ButtonGroup>
          </IllustratedMessage>
        </DropZone>
      </>
    );

    let sourceEl = page.getByTestId('drag-source').element();
    let targetEl = page.getByTestId('dropzone').element();
    await dragAndDrop(sourceEl, targetEl);

    await expect.poll(() => onDrop).toHaveBeenCalledTimes(1);
    let event = onDrop.mock.calls[0][0];
    expect(event.dropOperation).toBe('copy');
    expect(event.items.length).toBeGreaterThanOrEqual(1);
  });

  it('should reject unsupported drop types', async () => {
    let onDrop = vi.fn();

    await render(
      <>
        <Draggable type="application/json" />
        <DropZone
          data-testid="dropzone"
          isFilled
          replaceMessage="Replace file"
          styles={style({width: 320, maxWidth: '90%'})}
          getDropOperation={types => (types.has('text/plain') ? 'copy' : 'cancel')}
          onDrop={onDrop}>
          <IllustratedMessage>
            <CloudUpload />
            <Heading>
              Drag and drop your file
            </Heading>
            <Content>
              Or, select a file from your computer
            </Content>
            <ButtonGroup>
              <FileTrigger
                acceptedFileTypes={['text/plain']}>
                <Button variant="accent">Browse files</Button>
              </FileTrigger>
            </ButtonGroup>
          </IllustratedMessage>
        </DropZone>
      </>
    );

    let sourceEl = page.getByTestId('drag-source').element();
    let targetEl = page.getByTestId('dropzone').element();
    await dragAndDrop(sourceEl, targetEl);

    expect(onDrop).not.toHaveBeenCalled();
  });
});
