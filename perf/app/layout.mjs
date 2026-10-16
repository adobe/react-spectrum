/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

// Pure geometry validation, also exercised with broken layouts in the unit tests.
export function validLayout(snapshot, expected) {
  if (
    !snapshot ||
    ![snapshot.width, snapshot.height, snapshot.contentWidth, snapshot.scrollTop].every(
      Number.isFinite
    ) ||
    Math.abs(snapshot.width - expected.width) > 1 ||
    snapshot.height <= 0 ||
    !snapshot.rows.length ||
    snapshot.rows.length >= expected.total
  ) {
    return false;
  }
  let visible = snapshot.rows
    .filter(row => row.top + row.height > 1 && row.top < snapshot.height - 1)
    .sort((a, b) => a.top - b.top);
  if (
    visible.length < 2 ||
    visible[0].top > 1 ||
    visible.at(-1).top + visible.at(-1).height < snapshot.height - 1
  ) {
    return false;
  }
  if (
    expected.atTop &&
    (snapshot.scrollTop > 1 || visible[0].id !== 'item-0' || Math.abs(visible[0].top) > 1)
  ) {
    return false;
  }
  return (
    (!expected.columns ||
      (snapshot.columns?.length === expected.columns.length &&
        snapshot.columns.every((width, i) => Math.abs(width - expected.columns[i]) <= 1))) &&
    new Set(visible.map(row => Math.round(row.height))).size >= 2 &&
    visible.every(
      (row, i) =>
        Number.isFinite(row.index) &&
        row.index >= 0 &&
        row.index < expected.total &&
        row.id === `item-${row.index}` &&
        row.height > 0 &&
        Math.abs(row.height - row.allocatedHeight) <= 1 &&
        (!expected.columns || Math.abs(row.height - row.contentHeight) <= 1) &&
        Math.abs(row.width - snapshot.contentWidth) <= 1 &&
        (!i ||
          (row.index === visible[i - 1].index + 1 &&
            Math.abs(row.top - visible[i - 1].top - visible[i - 1].height) <= 1))
    )
  );
}

function cellContentHeight(cell) {
  let style = getComputedStyle(cell);
  // Use the content's natural height rather than the stretched row allocation.
  return (
    cell.firstElementChild.getBoundingClientRect().height +
    parseFloat(style.paddingTop) +
    parseFloat(style.paddingBottom) +
    parseFloat(style.borderTopWidth) +
    parseFloat(style.borderBottomWidth)
  );
}

// Called once per animation frame, never from the MutationObserver. Reads are
// bounded by the rendered virtualized window, not the full dataset.
export function readLayout(expected) {
  let viewport = document.querySelector(expected.viewport);
  if (!viewport) {
    return null;
  }
  let bounds = viewport.getBoundingClientRect();
  let columns = expected.columns && [...viewport.querySelectorAll('[role="columnheader"]')];
  let headingHeight = columns?.length ? columns[0].parentElement.getBoundingClientRect().height : 0;
  let snapshot = {
    width: bounds.width,
    contentWidth: columns
      ? columns.reduce((total, column) => total + column.getBoundingClientRect().width, 0)
      : viewport.clientWidth,
    height: viewport.clientHeight - headingHeight,
    scrollTop: viewport.scrollTop,
    ...(columns && {columns: columns.map(column => column.getBoundingClientRect().width)}),
    rows: [...viewport.querySelectorAll('[data-record]')].map(node => {
      let rect = (columns ? node.parentElement : node).getBoundingClientRect();
      let id = node.getAttribute('data-record');
      return {
        id,
        index: Number(id.slice(5)),
        top: rect.top - bounds.top - viewport.clientTop - headingHeight,
        height: rect.height,
        width: rect.width,
        allocatedHeight: node.parentElement.getBoundingClientRect().height,
        ...(columns && {
          contentHeight: Math.max(
            ...[...node.querySelectorAll('[role="gridcell"], [role="rowheader"]')].map(
              cellContentHeight
            )
          )
        })
      };
    })
  };
  return validLayout(snapshot, expected) ? snapshot : null;
}

export function layoutSignature(snapshot) {
  // Virtualizers may reorder DOM nodes or recycle offscreen rows without moving
  // visible content. Compare geometry in visual order, independent of that work.
  let visible = snapshot && {
    ...snapshot,
    rows: snapshot.rows
      .filter(row => row.top + row.height > 1 && row.top < snapshot.height - 1)
      .sort((a, b) => a.top - b.top)
  };
  return JSON.stringify(visible, (_, value) =>
    typeof value === 'number' ? Math.round(value * 10) / 10 : value
  );
}

export async function settleLayout(expected) {
  let previous;
  let stable = 0;
  let start = performance.now();
  while (performance.now() - start < 15000) {
    await new Promise(requestAnimationFrame);
    let layout = readLayout(expected);
    let signature = layout && layoutSignature(layout);
    stable = signature && signature === previous ? stable + 1 : 1;
    previous = signature;
    if (signature && stable >= 3) {
      return layout;
    }
  }
  throw new Error('The variable-height viewport did not reach a complete, stable layout.');
}
