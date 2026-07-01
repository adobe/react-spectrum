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

export function findColumnWidthRoot(element: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = element;
  while (el) {
    if (el.style.getPropertyValue('--col-0-width')) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

export function getColumnWidthFromCSSVar(index: number, root: HTMLElement): number {
  let value = root.style.getPropertyValue(`--col-${index}-width`);
  return Number(value.replace('px', '').trim());
}

export function getCellWidth(cell: HTMLElement): number {
  let styleWidth = cell.style.width;
  if (styleWidth.endsWith('px')) {
    return Number(styleWidth.replace('px', ''));
  }

  let root = findColumnWidthRoot(cell);
  if (!root) {
    return Number(styleWidth.replace('px', '')) || 0;
  }

  if (styleWidth.startsWith('calc(')) {
    let sum = 0;
    for (let match of styleWidth.matchAll(/var\(--col-(\d+)-width\)/g)) {
      sum += getColumnWidthFromCSSVar(Number(match[1]), root);
    }
    return sum;
  }

  let columnIndex = cell.getAttribute('data-column-index');
  if (columnIndex != null) {
    return getColumnWidthFromCSSVar(Number(columnIndex), root);
  }

  return 0;
}

export function getColumnWidthsFromRow(headerRow: HTMLElement): number[] {
  let root = findColumnWidthRoot(headerRow);
  if (root) {
    return Array.from(headerRow.children).map((_, index) => getColumnWidthFromCSSVar(index, root));
  }

  return Array.from(headerRow.children).map(cell => getCellWidth(cell as HTMLElement));
}
