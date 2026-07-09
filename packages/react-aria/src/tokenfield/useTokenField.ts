/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing
 */

import {announce} from '../live-announcer/LiveAnnouncer';
import {AriaLabelingProps, DOMAttributes, FocusableProps} from '@react-types/shared';
import {
  ClipboardEventHandler,
  HTMLAttributes,
  RefObject,
  useCallback,
  useMemo,
  useRef
} from 'react';
import {
  Direction,
  Position,
  TokenFieldProps,
  TokenFieldSegment,
  TokenFieldState,
  TokenSegmentList
} from 'react-stately/useTokenFieldState';
import {getActiveElement} from '../utils/shadowdom/DOMFunctions';
import {getOwnerDocument} from '../utils/domHelpers';
import {isMac} from '../utils/platform';
import {mergeProps} from '../utils/mergeProps';
import {setInteractionModality} from '../interactions/useFocusVisible';
import {useEvent} from '../utils/useEvent';
import {useField} from '../label/useField';
import {useFocusable} from '../interactions/useFocusable';
import {useKeyboard} from '../interactions/useKeyboard';
import {useLayoutEffect} from '../utils/useLayoutEffect';
import {useLocale} from '../i18n/I18nProvider';

export interface AriaTokenFieldProps<T extends TokenSegmentList = TokenSegmentList>
  extends TokenFieldProps<T>, FocusableProps, AriaLabelingProps {
  /**
   * The accessibility role of the token field.
   *
   * @default 'textbox'
   */
  role?: 'textbox' | 'searchbox' | 'combobox';
  /** Whether the token field allows newlines. */
  allowsNewlines?: boolean;
  /** Whether the token field is read only. */
  isReadOnly?: boolean;
  /** Whether the token field is disabled. */
  isDisabled?: boolean;
  /** A function that is called when the user presses the Enter key. */
  onSubmit?: () => void;
  /**
   * Handler that is called when the user copies text. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncopy).
   */
  onCopy?: ClipboardEventHandler<T>;

  /**
   * Handler that is called when the user cuts text. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/oncut).
   */
  onCut?: ClipboardEventHandler<T>;

  /**
   * Handler that is called when the user pastes text. See
   * [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/onpaste).
   */
  onPaste?: ClipboardEventHandler<T>;
}

export interface TokenFieldAria {
  /** Props for the token field's input element. */
  tokenFieldProps: HTMLAttributes<HTMLDivElement>;
  /** Props for the text field's visible label element, if any. */
  labelProps: DOMAttributes;
  /** Props for the text field's description element, if any. */
  descriptionProps: DOMAttributes;
}

const CLIPBOARD_MIME_TYPE = 'application/vnd.react-aria.tokens+json';

export function useTokenField<T extends TokenSegmentList = TokenSegmentList>(
  props: AriaTokenFieldProps<T>,
  state: TokenFieldState,
  ref: RefObject<HTMLDivElement | null>
): TokenFieldAria {
  let {
    role = 'textbox',
    allowsNewlines: multiline = false,
    isReadOnly = false,
    isDisabled = false,
    'aria-details': ariaDetails
  } = props;

  let {value} = state;
  let {locale} = useLocale();
  let graphemeSegmenter = useMemo(
    () => new Intl.Segmenter(locale, {granularity: 'grapheme'}),
    [locale]
  );
  let wordSegmenter = useMemo(() => new Intl.Segmenter(locale, {granularity: 'word'}), [locale]);

  let dropPosition = useRef<Position | null>(null);
  let transferredData = useRef<TokenFieldSegment[] | null>(null);

  let nextValue = useRef<TokenSegmentList | null>(null);
  let apply = (fn: (value: TokenSegmentList) => TokenSegmentList) => {
    state.setValue(value => {
      let newValue = fn(value);
      nextValue.current = newValue;
      return newValue;
    });
  };

  // Composition events are not cancelable. The browser will mutate the DOM, making it out of sync with React.
  // To account for this, we prevent React from re-rendering during composition, and track DOM mutations performed
  // by the browser. When composition ends, we revert the DOM to its original state, and re-render with React.
  // Mutating the DOM in any way during composition breaks the IME, causing composition to end unexpectedly.
  // During composition, we still emit updates via onChange to ensure that things like autocomplete work,
  // but we don't actually re-render to the DOM unless the value changes from what we expect (e.g. inserting a completion).
  let mutationTracker = useMutationTracker(ref);
  let startComposition = useCallback(() => {
    mutationTracker.start();
    state.setComposing(true);
  }, [state, mutationTracker]);
  let stopComposition = useCallback(() => {
    mutationTracker.stop();
    state.setComposing(false);
  }, [state, mutationTracker]);

  useEvent(ref, 'compositionstart', () => {
    startComposition();

    let range = window.getSelection()?.getRangeAt(0);
    if (range) {
      let [start, end] = rangeToPositions(ref.current!, range);

      // Normalize the range to ensure it is not inside a token, otherwise the browser
      // will attempt to insert the composed text into the token instead of replacing it.
      let r = createDOMRange(ref.current!, start, end);
      if (r.startContainer !== range.startContainer || r.startOffset !== range.startOffset) {
        range.setStart(r.startContainer, r.startOffset);
      }
      if (r.endContainer !== range.endContainer || r.endOffset !== range.endOffset) {
        range.setEnd(r.endContainer, r.endOffset);
      }
    }
  });

  useEvent(ref, 'compositionend', stopComposition);

  // If a prop update occurs during composition that doesn't match the expected value,
  // end composition and re-render the controlled value.
  useLayoutEffect(() => {
    if (state.isComposing && value !== nextValue.current) {
      stopComposition();
    }
    nextValue.current = value;
  });

  let caretPosition = useRef<Position | null>(null);
  useLayoutEffect(() => {
    if (
      ref.current &&
      value.caretPosition &&
      !state.isComposing &&
      value.caretPosition !== caretPosition.current
    ) {
      // Only move the caret when the field is already focused.
      if (ref.current === getActiveElement(getOwnerDocument(ref.current))) {
        setCursor(ref.current, value.caretPosition);
      }
      caretPosition.current = value.caretPosition;
    }
  });

  // Handle text editing commands and prevent browser default behavior.
  useEvent(ref, 'beforeinput', e => {
    // Android sometimes doesn't fire a compositionend event before a regular input event.
    if (state.isComposing && !e.isComposing) {
      stopComposition();
    }

    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    let range = selection.getRangeAt(0);
    let [start, end] = rangeToPositions(ref.current!, range);

    // https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
    switch (e.inputType) {
      case 'insertText':
      case 'insertReplacementText':
      case 'insertCompositionText':
      case 'insertFromComposition': // Removed from the spec, but still fired by Safari.
      case 'insertFromPaste':
      case 'insertFromYank':
      case 'insertFromDrop': {
        let data: TokenFieldSegment[] = [{type: 'text', text: e.data ?? ''}];
        if (transferredData.current) {
          data = transferredData.current;
          transferredData.current = null;
        } else if (e.dataTransfer) {
          let parsed = e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)
            ? parseSegments(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE))
            : null;
          if (parsed) {
            data = parsed;
          } else if (e.dataTransfer.types.includes('text/plain')) {
            data[0].text = e.dataTransfer.getData('text/plain');
          }
        }

        if (e.inputType === 'insertFromDrop' && dropPosition.current) {
          start = end = dropPosition.current;
          dropPosition.current = null;
        }

        if (!multiline) {
          for (let segment of data) {
            segment.text = segment.text.replace(/[\r\n]+/g, ' ');
          }
        }

        apply(tokens =>
          tokens.replaceRangeWithSegments(
            start,
            end,
            data,
            // Don't coalesce paste/drop events with other edits.
            e.inputType === 'insertText' ||
              e.inputType === 'insertCompositionText' ||
              e.inputType === 'insertFromComposition'
          )
        );
        break;
      }
      case 'insertParagraph': {
        if (props.onSubmit) {
          props.onSubmit();
          break;
        }
        // fallthrough
      }
      case 'insertLineBreak': {
        if (multiline) {
          apply(tokens => tokens.replaceRange(start, end, '\n'));
        }
        break;
      }
      case 'deleteContentBackward':
      case 'deleteContentForward':
      case 'deleteWordBackward':
      case 'deleteWordForward':
      case 'deleteHardLineForward':
      case 'deleteHardLineBackward':
      case 'deleteSoftLineForward':
      case 'deleteSoftLineBackward':
      case 'deleteContent':
      case 'deleteByCut':
      case 'deleteCompositionText': {
        if (!range.collapsed) {
          apply(tokens => tokens.replaceRange(start, end, ''));
          break;
        }

        switch (e.inputType) {
          case 'deleteContentBackward': {
            apply(tokens => tokens.delete(start, graphemeSegmenter, Direction.Backward));
            break;
          }
          case 'deleteContentForward':
            apply(tokens => tokens.delete(start, graphemeSegmenter, Direction.Forward));
            break;
          case 'deleteWordBackward': {
            apply(tokens => tokens.delete(start, wordSegmenter, Direction.Backward));
            break;
          }
          case 'deleteWordForward':
            apply(tokens => tokens.delete(start, wordSegmenter, Direction.Forward));
            break;
          case 'deleteHardLineForward':
          case 'deleteSoftLineForward': // TODO: this usually deletes to the nearest *visual* line break rather than a hard break
            apply(tokens => tokens.deleteLine(start, Direction.Forward));
            break;
          case 'deleteHardLineBackward':
          case 'deleteSoftLineBackward':
            apply(tokens => tokens.deleteLine(start, Direction.Backward));
            break;
        }
        break;
      }
      case 'deleteByDrag': {
        apply(tokens => {
          let endOffset =
            start.index === end.index ? end.offset : tokens.segments[start.index].text.length;
          let change = tokens.replaceRange(start, end, '');
          if (
            dropPosition.current &&
            dropPosition.current.index === start.index &&
            dropPosition.current.offset >= start.offset
          ) {
            dropPosition.current.offset -= endOffset - start.offset;
          }

          return change;
        });
        break;
      }
    }

    e.preventDefault();
  });

  let writeClipboardData = (e: ClipboardEvent | DragEvent) => {
    if ('clipboardData' in e) {
      e.preventDefault();
    }
    let selection = getSelection(ref.current!);
    if (!selection) {
      return;
    }
    let [start, end] = selection;
    let slice = value.slice(start, end);
    let dataTransfer = 'clipboardData' in e ? e.clipboardData : e.dataTransfer;
    dataTransfer?.setData(CLIPBOARD_MIME_TYPE, JSON.stringify(slice.segments));
    dataTransfer?.setData('text/plain', slice.toString());

    if (e.type === 'cut') {
      apply(tokens => tokens.replaceRange(start, end, '', false));
    }
  };

  useEvent(ref, 'copy', writeClipboardData);
  useEvent(ref, 'cut', writeClipboardData);
  useEvent(ref, 'dragstart', writeClipboardData);
  useEvent(ref, 'paste', e => {
    // Safari doesn't pass the custom clipboard data type to beforeinput dataTransfer so we handle it here.
    if (e.clipboardData && e.clipboardData.types.includes(CLIPBOARD_MIME_TYPE)) {
      transferredData.current = parseSegments(e.clipboardData.getData(CLIPBOARD_MIME_TYPE));
    }
  });

  // Store the cursor position on drop so we know where to insert when the insertFromDrop event occurs.
  useEvent(ref, 'drop', e => {
    if (typeof document.caretPositionFromPoint === 'function') {
      let pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        dropPosition.current = getPosition(ref.current!, pos.offsetNode, pos.offset);
      }
    } else if (typeof document.caretRangeFromPoint === 'function') {
      let range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        dropPosition.current = getPosition(ref.current!, range.startContainer, range.startOffset);
      }
    }

    if (e.dataTransfer && e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)) {
      transferredData.current = parseSegments(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE));
    }
  });

  useSelectionChange(ref, () => {
    if (state.isComposing) {
      return;
    }

    value.endCoalescing();

    // When the cursor moves next to a token, announce it.
    // Otherwise the screen reader will only announce the first/last character.
    if (window.getSelection()?.isCollapsed) {
      let [start, end] = getSelection(ref.current!)!;
      if (start.offset === 0) {
        let segment = value.segments[start.index];
        if (segment?.type !== 'token') {
          segment = value.segments[start.index - 1];
        }
        if (segment?.type === 'token') {
          announce(segment.text, 'assertive');
        }

        // Update the caret position in the value.
        state.setValue(value => value.withCaretPosition(end));
      }
    }
  });

  // Override the default triple click behavior to ensure that tokens get selected.
  // Some browsers only select the text between tokens instead of the entire line.
  useEvent(ref, 'mousedown', e => {
    if (e.detail === 3) {
      let selection = getSelection(ref.current!);
      if (!selection) {
        return;
      }

      let start = value.findLineBoundary(selection[0], Direction.Backward);
      let end = value.findLineBoundary(selection[1], Direction.Forward);
      if (start && end) {
        e.preventDefault();
        setSelection(ref.current!, start, end, true);
      }
    }
  });

  let moveSelection = (
    direction: 'left' | 'right',
    granularity: 'character' | 'word',
    extend = false
  ) => {
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !selection.focusNode || !selection.anchorNode) {
      return false;
    }

    // Pressing an arrow with a non-empty selection collapses it to the corresponding edge.
    // The browser handles this natively.
    if (!extend && !selection.isCollapsed) {
      return false;
    }

    // Move the caret using the browser's native caret movement (Selection.modify) so that
    // bidirectional text is handled correctly. Repeat until the position actually changes
    // to account for the zero width spaces around tokens.
    let pos = getPosition(ref.current!, selection.focusNode, selection.focusOffset);
    while (true) {
      let {focusNode, focusOffset} = selection;
      selection.modify(extend ? 'extend' : 'move', direction, granularity);
      if (selection.focusNode === focusNode && selection.focusOffset === focusOffset) {
        return false;
      }
      let newPos = getPosition(ref.current!, selection.focusNode, selection.focusOffset);
      if (!isSamePosition(pos, newPos)) {
        return true;
      }
    }
  };

  let mod = isMac() ? 'Meta' : 'Control';
  let wordModKey = isMac() ? 'Alt' : 'Control';
  let shortcuts: Record<string, () => boolean | void> = {
    [`${mod}+z`]: () => {
      // If composing, the browser handles undo natively.
      if (state.isComposing) {
        return false;
      }
      apply(state => state.undo());
    },
    [isMac() ? 'Shift+Meta+z' : 'Control+y']: () => {
      if (state.isComposing) {
        return false;
      }
      apply(state => state.redo());
    },
    ArrowLeft: () => {
      return moveSelection('left', 'character');
    },
    [`${wordModKey}+ArrowLeft`]: () => {
      return moveSelection('left', 'word');
    },
    'Shift+ArrowLeft': () => {
      return moveSelection('left', 'character', true);
    },
    [`Shift+${wordModKey}+ArrowLeft`]: () => {
      return moveSelection('left', 'word', true);
    },
    ArrowRight: () => {
      return moveSelection('right', 'character');
    },
    [`${wordModKey}+ArrowRight`]: () => {
      return moveSelection('right', 'word');
    },
    'Shift+ArrowRight': () => {
      return moveSelection('right', 'character', true);
    },
    [`Shift+${wordModKey}+ArrowRight`]: () => {
      return moveSelection('right', 'word', true);
    },
    Home: () => {
      // Browsers do not behave consistently when there are tokens.
      let selection = getSelection(ref.current!);
      if (!selection) {
        return false;
      }
      let boundary = value.findLineBoundary(selection[0], Direction.Backward);
      if (boundary) {
        setCursor(ref.current!, boundary, true);
        return true;
      }
      return false;
    },
    End: () => {
      let selection = getSelection(ref.current!);
      if (!selection) {
        return false;
      }
      let boundary = value.findLineBoundary(selection[1], Direction.Forward);
      if (boundary) {
        setCursor(ref.current!, boundary, true);
        return true;
      }
      return false;
    }
  };

  let {keyboardProps} = useKeyboard({
    isDisabled: isDisabled || isReadOnly,
    onKeyDown: e => {
      props.onKeyDown?.(e);

      // mini version of useKeyboard shortcuts until it is merged.
      let modifiers = ['Shift', 'Control', 'Alt', 'Meta'] satisfies React.ModifierKey[];
      let modifierKeys = modifiers.filter(modifier => e.getModifierState(modifier));
      let keys = modifierKeys.length > 0 ? `${modifierKeys.join('+')}+${e.key}` : e.key;
      let handler = shortcuts[keys];
      if (handler) {
        let result = handler();
        if (result === true || result === undefined) {
          e.preventDefault();
          return;
        }
      }

      e.continuePropagation();
    },
    onKeyUp: props.onKeyUp
  });

  let {focusableProps} = useFocusable(props, ref);
  let {labelProps, fieldProps, descriptionProps} = useField({
    ...props,
    labelElementType: 'span'
  });

  return {
    labelProps: {
      ...labelProps,
      onClick: () => {
        if (!props.isDisabled) {
          ref.current?.focus();

          // Show the focus ring so the user knows where focus went
          setInteractionModality('keyboard');
        }
      }
    },
    descriptionProps,
    tokenFieldProps: mergeProps(focusableProps, keyboardProps, fieldProps, {
      onPaste: props.onPaste,
      onCopy: props.onCopy,
      onCut: props.onCut,
      contentEditable: !isDisabled && !isReadOnly,
      suppressContentEditableWarning: true,
      role,
      'aria-multiline': multiline,
      'aria-details': ariaDetails,
      'aria-readonly': isReadOnly,
      'aria-disabled': isDisabled,
      style: {whiteSpace: 'pre-wrap'}
    })
  };
}

function indexOfNode(node: Node) {
  let index = 0;
  let n: Node | null = node;

  while ((n = n.previousSibling)) {
    index++;
  }
  return index;
}

export function getSelection(container: Element): [Position, Position] | null {
  let selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  let range = selection.getRangeAt(0);
  return rangeToPositions(container, range);
}

function rangeToPositions(container: Element, range: Range | StaticRange): [Position, Position] {
  let start = getPosition(container, range.startContainer, range.startOffset);
  let end = getPosition(container, range.endContainer, range.endOffset);
  return [start, end];
}

function getPosition(container: Element, node: Node, offset: number): Position {
  if (node === container) {
    return {index: offset, offset: 0};
  }

  let originalNode = node;
  while (node.parentNode !== container) {
    node = node.parentNode!;
  }

  let index = indexOfNode(node);
  if (node.nodeType === Node.ELEMENT_NODE) {
    let tokenNode = node.childNodes[1];
    let atEnd: boolean;
    let endOffset = 0;
    if (originalNode === tokenNode) {
      // Cursor is inside the token.
      atEnd = offset > 0;
    } else if (originalNode === node) {
      // Cursor is inside the wrapper element.
      atEnd = offset > 1;
    } else {
      // Cursor is on one of the zero width spaces.
      atEnd = originalNode !== tokenNode.previousSibling;
      // If the offset is greater than 1, the browser is trying to insert text into
      // the zero width space node. This will actually end up in the next text node.
      endOffset = atEnd && offset > 1 ? offset - 1 : 0;
    }

    offset = atEnd ? (tokenNode?.textContent?.length ?? 0) : 0;

    // Several positions are equivalent due to the zero width spaces around tokens.
    // Normalize offset to the end of the preceding text node, or the beginning of the following node.
    if (offset === 0 && node.previousSibling?.nodeType === Node.TEXT_NODE) {
      index--;
      offset = node.previousSibling?.textContent?.length ?? 0;
    } else if (atEnd) {
      index++;
      offset = endOffset;
    }
  }
  return {index, offset};
}

let isProgrammaticSelectionChange = Symbol('isProgrammaticSelectionChange');

function setCursor(root: Element, pos: Position, fireEvent = false) {
  setSelection(root, pos, pos, fireEvent);
}

// Exported for tests.
export function setSelection(root: Element, start: Position, end: Position, fireEvent = false) {
  let selection = window.getSelection();
  if (selection) {
    let range = createDOMRange(root, start, end);
    root[isProgrammaticSelectionChange] = !fireEvent;
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function positionToDOMRange(root: Element, pos: Position): Range {
  return createDOMRange(root, pos, pos);
}

function createDOMRange(root: Element, start: Position, end: Position): Range {
  let range = document.createRange();
  let startChild = root.childNodes[start.index];
  if (!startChild) {
    range.setStart(root, Math.min(root.childNodes.length, start.index));
  } else if (startChild.nodeType === Node.ELEMENT_NODE) {
    // Place the cursor outside the token wrapper element.
    if (start.offset > 0) {
      range.setStartAfter(startChild);
    } else {
      range.setStartBefore(startChild);
    }
  } else {
    range.setStart(startChild, start.offset);
  }

  let endChild = root.childNodes[end.index];
  if (!endChild) {
    range.setEnd(root, Math.min(root.childNodes.length, end.index));
  } else if (endChild.nodeType === Node.ELEMENT_NODE) {
    if (end.offset > 0) {
      range.setEndAfter(endChild);
    } else {
      range.setEndBefore(endChild);
    }
  } else {
    range.setEnd(endChild, end.offset);
  }
  return range;
}

function isSamePosition(a: Position, b: Position): boolean {
  return a.index === b.index && a.offset === b.offset;
}

// Parse and validate segments from clipboard/drag data. Returns null if the data is not valid
// JSON or does not match the expected shape, so malformed or untrusted data is ignored rather
// than throwing or being inserted into the field.
function parseSegments(json: string): TokenFieldSegment[] | null {
  try {
    let data = JSON.parse(json);
    if (Array.isArray(data) && data.length > 0 && data.every(isValidSegment)) {
      return data;
    }
  } catch {
    // Ignore invalid clipboard data.
  }
  return null;
}

function isValidSegment(segment: unknown): segment is TokenFieldSegment {
  return (
    typeof segment === 'object' &&
    segment != null &&
    ((segment as TokenFieldSegment).type === 'text' ||
      (segment as TokenFieldSegment).type === 'token') &&
    typeof (segment as TokenFieldSegment).text === 'string'
  );
}

function useSelectionChange(ref: React.RefObject<Element | null>, handler: () => void) {
  useEvent(useRef(typeof document !== 'undefined' ? document : null), 'selectionchange', () => {
    if (ref.current && ref.current[isProgrammaticSelectionChange]) {
      ref.current[isProgrammaticSelectionChange] = false;
      return;
    }

    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !ref.current) {
      return;
    }

    let range = selection.getRangeAt(0);
    if (range.intersectsNode(ref.current)) {
      handler();
    }
  });
}

function useMutationTracker(ref: React.RefObject<Element | null>) {
  let mutationTracker = useRef<(() => void) | null>(null);

  // Disconnect the mutation observer if the field unmounts mid-composition.
  useLayoutEffect(
    () => () => {
      mutationTracker.current?.();
      mutationTracker.current = null;
    },
    []
  );

  return useMemo(
    () => ({
      start() {
        // Android sometimes fires two compositionstart events in a row, without a compositionend.
        // In that case, reuse the existing tracker.
        mutationTracker.current ||= trackMutations(ref.current!);
      },
      stop() {
        mutationTracker.current?.();
        mutationTracker.current = null;
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps - conflicts with compiler
    []
  );
}

// Tracks mutations to the DOM until the returned function is called,
// at which point the mutations are reverted.
function trackMutations(element: Element) {
  let mutations: MutationRecord[] = [];
  let observer = new MutationObserver(records => {
    mutations.push(...records);
  });

  observer.observe(element, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });

  return () => {
    mutations.push(...observer.takeRecords());
    observer.disconnect();

    for (let record of mutations.reverse()) {
      switch (record.type) {
        case 'childList':
          for (let node of record.removedNodes) {
            record.target.insertBefore(node, record.nextSibling);
          }
          for (let node of record.addedNodes) {
            record.target.removeChild(node);
          }
          break;
        case 'characterData':
          record.target.nodeValue = record.oldValue;
          break;
      }
    }
  };
}
