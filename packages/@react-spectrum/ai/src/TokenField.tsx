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

import {announce} from 'react-aria/private/live-announcer/LiveAnnouncer';
import {
  Direction,
  Position,
  TokenFieldSegment,
  TokenSegment,
  TokenSegmentList
} from './TokenSegmentList';
import {FieldInputContext} from 'react-aria-components/Autocomplete';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FocusableProps} from '@react-types/shared';
import {isMac} from 'react-aria/private/utils/platform';
import {mergeProps} from 'react-aria/mergeProps';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {ForwardedRef, forwardRef, HTMLAttributes, useMemo, useRef, useState} from 'react';
import {RenderProps, StyleRenderProps, useRenderProps} from 'react-aria-components/useRenderProps';
import {SlotProps, useSlottedContext} from 'react-aria-components/slots';
import {useControlledState} from 'react-stately/useControlledState';
import {useEvent} from 'react-aria/private/utils/useEvent';
import {useFocusable} from 'react-aria/useFocusable';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useKeyboard} from 'react-aria/useKeyboard';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useLocale} from 'react-aria/I18nProvider';
import {useObjectRef} from 'react-aria/useObjectRef';

export type {TokenFieldSegment};

interface TokenFieldRenderProps {
  isReadOnly: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
}

export interface TokenFieldProps
  extends StyleRenderProps<TokenFieldRenderProps>, SlotProps, FocusableProps {
  value?: TokenSegmentList;
  defaultValue?: TokenSegmentList;
  onChange?: (value: TokenSegmentList) => void;
  children: (segment: TokenSegment) => React.ReactElement;
  multiline?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  onPaste?: (e: ClipboardEvent) => void;
  onSubmit?: () => void;
}

export const CLIPBOARD_MIME_TYPE = 'application/vnd.react-aria.tokens+json';

export const TokenField = forwardRef(function TokenField(
  props: TokenFieldProps,
  forwardedRef: ForwardedRef<HTMLDivElement | null>
) {
  let {
    value: valueProp,
    defaultValue: defaultValueProp = new TokenSegmentList([]),
    onChange,
    children,
    multiline = false,
    isReadOnly = false,
    isDisabled = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy
  } = props;

  let fieldCtx = useSlottedContext(FieldInputContext, props.slot);
  let {
    value: _autocompleteValue,
    onChange: onAutocompleteChange,
    ref: autocompleteRef,
    ...autocompleteProps
  } = fieldCtx ?? {};

  let ref = useObjectRef(forwardedRef);
  let [state, setState] = useControlledState(valueProp, defaultValueProp, onChange);
  let {locale} = useLocale();
  let graphemeSegmenter = useMemo(
    () => new Intl.Segmenter(locale, {granularity: 'grapheme'}),
    [locale]
  );
  let wordSegmenter = useMemo(() => new Intl.Segmenter(locale, {granularity: 'word'}), [locale]);

  let dropPosition = useRef<Position | null>(null);
  let transferredData = useRef<TokenFieldSegment[] | null>(null);

  let apply = (fn: (value: TokenSegmentList) => TokenSegmentList) => {
    setState(value => {
      let newValue = fn(value);
      onAutocompleteChange?.(newValue.toString());
      return newValue;
    });
  };

  let caretPosition = useRef<Position | null>(null);
  useLayoutEffect(() => {
    if (ref.current && state.caretPosition && state.caretPosition !== caretPosition.current) {
      setCursor(ref.current, state.caretPosition);
      caretPosition.current = state.caretPosition;
    }
  });

  // Handle text editing commands and prevent browser default behavior.
  useEvent(ref, 'beforeinput', e => {
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
      case 'insertFromPaste':
      case 'insertFromYank':
      case 'insertFromDrop': {
        let data: TokenFieldSegment[] = [{type: 'text', text: e.data ?? ''}];
        if (transferredData.current) {
          data = transferredData.current;
          transferredData.current = null;
        } else if (e.dataTransfer) {
          if (e.dataTransfer.types.includes(CLIPBOARD_MIME_TYPE)) {
            data = JSON.parse(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE));
          } else if (e.dataTransfer.types.includes('text/plain')) {
            data[0].text = e.dataTransfer.getData('text/plain');
          }
        }

        if (e.inputType === 'insertFromDrop' && dropPosition.current) {
          start = end = dropPosition.current;
          dropPosition.current = null;
        }

        apply(tokens =>
          tokens.replaceRangeWithSegments(
            start,
            end,
            data,
            e.inputType === 'insertText' // Don't coalesce paste/drop events with other edits.
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
      case 'deleteByCut': {
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

  // Composition events are not cancelable, so we need to store the start position and update the value in the compositionend event.
  let compositionStart = useRef<[Position, Position] | null>(null);
  useEvent(ref, 'compositionstart', () => {
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    let range = selection.getRangeAt(0);
    compositionStart.current = rangeToPositions(ref.current!, range);
  });

  useEvent(ref, 'compositionend', e => {
    let range = compositionStart.current;
    if (range) {
      apply(tokens => tokens.replaceRange(range[0], range[1], e.data));
    }
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
    let slice = state.slice(start, end);
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
      transferredData.current = JSON.parse(e.clipboardData.getData(CLIPBOARD_MIME_TYPE));
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
      transferredData.current = JSON.parse(e.dataTransfer.getData(CLIPBOARD_MIME_TYPE));
    }
  });

  useSelectionChange(ref, () => {
    state.endCoalescing();

    // When the cursor moves next to a token, announce it.
    // Otherwise the screen reader will only announce the first/last character.
    if (window.getSelection()?.isCollapsed) {
      let [start, end] = getSelection(ref.current!)!;
      if (start.index === end.index && start.offset === 0) {
        let segment = state.segments[start.index];
        if (segment?.type === 'token') {
          announce(segment.text, 'assertive');
        }
      } else if (start.offset === state.segments[start.index].text.length) {
        let segment = state.segments[start.index + 1];
        if (segment?.type === 'token') {
          announce(segment.text, 'assertive');
        }
      }

      // Update the caret position in the value.
      setState(value => value.withCaretPosition(end));
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

      let start = state.findLineBoundary(selection[0], Direction.Backward);
      let end = state.findLineBoundary(selection[1], Direction.Forward);
      if (start && end) {
        e.preventDefault();
        setSelection(ref.current!, start, end, true);
      }
    }
  });

  // Firefox does not allow placing the cursor between adjacent tokens, so navigate manually.
  let moveSelection = (segmenter: Intl.Segmenter, direction: Direction, extend = false) => {
    let selection = getSelection(ref.current!);
    if (!selection) {
      return false;
    }
    let originalPos = direction === Direction.Backward ? selection[0] : selection[1];
    let pos =
      extend || isCollapsed(selection[0], selection[1])
        ? state.findBoundaryWithSegmenter(originalPos, segmenter, direction)
        : originalPos;
    if (pos) {
      let [start, end] =
        direction === Direction.Backward
          ? [pos, extend ? selection[1] : pos]
          : [extend ? selection[0] : pos, pos];
      setSelection(ref.current!, start, end, true);
      return true;
    }
    return false;
  };

  let mod = isMac() ? 'Meta' : 'Control';
  let wordModKey = isMac() ? 'Alt' : 'Control';
  let shortcuts: Record<string, () => boolean | void> = {
    [`${mod}+z`]: () => {
      apply(state => state.undo());
    },
    [isMac() ? 'Shift+Meta+z' : 'Control+y']: () => {
      apply(state => state.redo());
    },
    ArrowLeft: () => {
      return moveSelection(graphemeSegmenter, Direction.Backward);
    },
    [`${wordModKey}+ArrowLeft`]: () => {
      return moveSelection(wordSegmenter, Direction.Backward);
    },
    'Shift+ArrowLeft': () => {
      return moveSelection(graphemeSegmenter, Direction.Backward, true);
    },
    [`Shift+${wordModKey}+ArrowLeft`]: () => {
      return moveSelection(wordSegmenter, Direction.Backward, true);
    },
    ArrowRight: () => {
      return moveSelection(graphemeSegmenter, Direction.Forward);
    },
    [`${wordModKey}+ArrowRight`]: () => {
      return moveSelection(wordSegmenter, Direction.Forward);
    },
    'Shift+ArrowRight': () => {
      return moveSelection(graphemeSegmenter, Direction.Forward, true);
    },
    [`Shift+${wordModKey}+ArrowRight`]: () => {
      return moveSelection(wordSegmenter, Direction.Forward, true);
    },
    Home: () => {
      // Browsers do not behave consistently when there are tokens.
      let selection = getSelection(ref.current!);
      if (!selection) {
        return false;
      }
      let boundary = state.findLineBoundary(selection[0], Direction.Backward);
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
      let boundary = state.findLineBoundary(selection[1], Direction.Forward);
      if (boundary) {
        setCursor(ref.current!, boundary, true);
        return true;
      }
      return false;
    }
  };

  let {keyboardProps} = useKeyboard({
    onKeyDown: e => {
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
    }
  });

  let {isFocused, isFocusVisible, focusProps} = useFocusRing();
  let {focusableProps} = useFocusable(props, ref);

  let renderProps = useRenderProps({
    ...props,
    children: undefined,
    defaultClassName: 'react-aria-TokenField',
    values: {
      isFocused,
      isFocusVisible,
      isDisabled,
      isReadOnly
    }
  });

  let DOMProps = filterDOMProps(props, {global: true});

  return (
    <div
      {...mergeProps(
        DOMProps,
        renderProps,
        focusProps,
        focusableProps,
        autocompleteProps as HTMLAttributes<HTMLDivElement>,
        keyboardProps,
        {onPaste: props.onPaste}
      )}
      ref={mergeRefs(ref, autocompleteRef as any)}
      role="textbox"
      contentEditable="true"
      suppressContentEditableWarning
      aria-multiline={multiline}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}
      data-readonly={isReadOnly || undefined}
      style={{...renderProps.style, whiteSpace: 'pre-wrap'}}>
      {state.segments.map((v, i) => {
        switch (v.type) {
          case 'token': {
            let token = children(v);
            return (
              // Wrap tokens in zero-width spaces so the cursor is placed correctly.
              <span key={i}>
                {'\u200b'}
                {token}
                {'\u200b'}
              </span>
            );
          }
          case 'text':
            return v.text;
        }
      })}
      {/* Force cursor to the next line if the last segment ends with a newline. */}
      {state.segments.at(-1)?.text.endsWith('\n') && <br />}
    </div>
  );
});

interface TokenRenderProps {
  isSelected: boolean;
  isDisabled: boolean;
}

export interface TokenProps extends RenderProps<TokenRenderProps, 'span'> {}

export const Token = forwardRef(function Token(
  props: TokenProps,
  ref: ForwardedRef<HTMLSpanElement>
) {
  let objectRef = useObjectRef(ref);
  let [isSelected, setSelected] = useState(false);

  useEvent(useRef(document), 'selectionchange', () => {
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !objectRef.current) {
      return;
    }

    let range = selection.getRangeAt(0);
    if (!range.collapsed && range.intersectsNode(objectRef.current)) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  });

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-Token',
    values: {
      isSelected,
      isDisabled: false
    }
  });

  return (
    <span
      ref={objectRef}
      {...renderProps}
      contentEditable="false"
      suppressContentEditableWarning
      data-selected={isSelected || undefined}
      style={{
        ...renderProps.style,
        userSelect: 'all',
        WebkitUserSelect: 'all'
      }}>
      {renderProps.children}
    </span>
  );
});

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

export function rangeToPositions(
  container: Element,
  range: Range | StaticRange
): [Position, Position] {
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
    if (originalNode === tokenNode) {
      // Cursor is inside the token.
      offset = offset > 0 ? (tokenNode?.textContent?.length ?? 0) : 0;
    } else if (originalNode === node) {
      // Cursor is inside the wrapper element.
      offset = offset <= 1 ? 0 : (tokenNode?.textContent?.length ?? 0);
    } else {
      // Cursor is on one of the zero width spaces.
      offset =
        originalNode === tokenNode.previousSibling ? 0 : (tokenNode?.textContent?.length ?? 0);
    }
    return {index, offset};
  }
  return {index, offset};
}

let isProgrammaticSelectionChange = false;

// TODO: do we want to export these?
export function setCursor(root: Element, pos: Position, fireEvent = false) {
  setSelection(root, pos, pos, fireEvent);
}

export function setSelection(root: Element, start: Position, end: Position, fireEvent = false) {
  let selection = window.getSelection();
  if (selection) {
    let range = createDOMRange(root, start, end);
    isProgrammaticSelectionChange = !fireEvent;
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function positionToDOMRange(root: Element, pos: Position): Range {
  return createDOMRange(root, pos, pos);
}

function createDOMRange(root: Element, start: Position, end: Position): Range {
  let range = document.createRange();
  let child = root.childNodes[start.index];
  if (!child) {
    range.setStart(root, Math.min(root.childNodes.length, start.index));
  } else if (child.nodeType === Node.ELEMENT_NODE) {
    // Place the cursor in one of the zero width space nodes.
    range.setStart(child, start.offset > 0 ? 2 : 0);
  } else {
    // Place the cursor in the text node.
    range.setStart(child, start.offset);
  }
  child = root.childNodes[end.index];
  if (!child) {
    range.setEnd(root, Math.min(root.childNodes.length, end.index));
  } else if (child.nodeType === Node.ELEMENT_NODE) {
    range.setEnd(child, end.offset > 0 ? 2 : 0);
  } else {
    range.setEnd(child, end.offset);
  }
  return range;
}

function useSelectionChange(ref: React.RefObject<Element | null>, handler: () => void) {
  useEvent(useRef(document), 'selectionchange', () => {
    if (isProgrammaticSelectionChange) {
      isProgrammaticSelectionChange = false;
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

function isCollapsed(pos1: Position, pos2: Position) {
  return pos1.index === pos2.index && pos1.offset === pos2.offset;
}
