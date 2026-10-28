/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {
  Button,
  Cell,
  Column,
  ColumnResizer,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableLayout,
  Virtualizer
} from 'react-aria-components';
import React, {useState} from 'react';

interface RecordItem {
  id: string;
  index: number;
  name: string;
  owner: string;
  status: string;
  amount: string;
  date: string;
  category: string;
}

export function MeasuredTableFixture({items}: {items: RecordItem[]}) {
  // A fitted labels column shares the flexible width, so container resizes rewrap it.
  let [labelsWidth, setLabelsWidth] = useState<number | '1fr'>(300);
  let [nameWidth, setNameWidth] = useState(150);
  let [width, setWidth] = useState(1000);
  let [animation, setAnimation] = useState('idle');
  return (
    <>
      <div className="collection-toolbar">
        <Button id="table-narrow" onPress={() => setLabelsWidth(100)}>
          Narrow labels
        </Button>
        <Button id="table-widen" onPress={() => setLabelsWidth(300)}>
          Widen labels
        </Button>
        <Button id="table-fit" onPress={() => setLabelsWidth('1fr')}>
          Fit labels
        </Button>
        <Button id="table-name-resize" onPress={() => setNameWidth(170)}>
          Widen name
        </Button>
        <Button id="table-container-resize" onPress={() => setWidth(800)}>
          Open side panel
        </Button>
        <Button id="table-animate" onPress={() => setAnimation('running')}>
          Animate side panel
        </Button>
      </div>
      <ResizableTableContainer
        className="measured-table-container"
        style={{width}}
        data-resize-animation={animation}
        // Widths are controlled, so dragging the resizer updates the labels column here.
        onResize={widths => {
          let width = widths.get('labels');
          if (typeof width === 'number') {
            setLabelsWidth(width);
          }
        }}
        onAnimationEnd={event => {
          if (event.target === event.currentTarget && event.animationName === 'benchmark-resize') {
            setWidth(800);
            setAnimation('done');
          }
        }}>
        <Virtualizer
          layout={TableLayout}
          layoutOptions={{estimatedRowHeight: 32, headingHeight: 32}}
          shouldObserveItemSize>
          <Table aria-label="Measured records" className="measured-table">
            <TableHeader>
              <Column id="name" data-column="name" isRowHeader width={nameWidth}>
                Name
              </Column>
              <Column id="labels" data-column="labels" width={labelsWidth}>
                Labels
                <ColumnResizer aria-label="Resize labels" />
              </Column>
              <Column id="owner" width={90}>
                Team
              </Column>
              <Column id="status" width={90}>
                Status
              </Column>
              <Column id="amount" width={90}>
                Amount
              </Column>
              <Column id="date" width={90}>
                Updated
              </Column>
              <Column id="category" width={90}>
                Category
              </Column>
              <Column id="review">Review</Column>
            </TableHeader>
            <TableBody items={items}>
              {row => (
                <Row id={row.id} data-record={row.id}>
                  <Cell>
                    <div>{row.name}</div>
                  </Cell>
                  <Cell>
                    <div className="tag-list">
                      {Array.from({length: 2 + (row.index % 3) * 2}, (_, i) => (
                        <span key={i}>Label {i}</span>
                      ))}
                    </div>
                  </Cell>
                  <Cell>
                    <div>{row.owner}</div>
                  </Cell>
                  <Cell>
                    <div>{row.status}</div>
                  </Cell>
                  <Cell>
                    <div>{row.amount}</div>
                  </Cell>
                  <Cell>
                    <div>{row.date}</div>
                  </Cell>
                  <Cell>
                    <div>{row.category}</div>
                  </Cell>
                  <Cell>
                    <div>Ready</div>
                  </Cell>
                </Row>
              )}
            </TableBody>
          </Table>
        </Virtualizer>
      </ResizableTableContainer>
    </>
  );
}
