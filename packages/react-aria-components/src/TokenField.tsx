import React, {ForwardedRef, forwardRef, HTMLAttributes, useMemo, useRef} from 'react';
import {useControlledState} from 'react-stately/useControlledState';
import {useEvent} from 'react-aria/private/utils/useEvent';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {Direction, Position, TokenFieldSegment, TokenSegmentList} from './TokenSegmentList';
import {isCtrlKeyPressed} from 'react-aria/private/utils/keyboard';
import {isMac} from 'react-aria/private/utils/platform';
import {useObjectRef} from 'react-aria/useObjectRef';
import {SlotProps, useSlottedContext} from './utils';
import {FieldInputContext} from './Autocomplete';
import {mergeRefs} from 'react-aria/mergeRefs';

export type {TokenFieldSegment};

export interface TokenFieldProps extends SlotProps {
  /** Structured document: text runs and atomic tokens. */
  value?: TokenSegmentList;
  defaultValue?: TokenSegmentList;
  onChange?: (value: TokenSegmentList) => void;
  tokenRegex?: RegExp | null;
  /** When false (default), newline insertion is blocked. */
  multiline?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
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
    tokenRegex = null,
    multiline = false,
    isReadOnly = false,
    isDisabled = false,
    id,
    className,
    style,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy
  } = props;

  let fieldCtx = useSlottedContext(FieldInputContext, props.slot);
  let {
    value: autocompleteValue,
    onChange: onAutocompleteChange,
    ref: autocompleteRef,
    ...autocompleteProps
  } = fieldCtx ?? {};

  let ref = useObjectRef(forwardedRef);
  let [state, setState] = useControlledState(valueProp, defaultValueProp, onChange);
  let graphemeSegmenter = useMemo(() => new Intl.Segmenter('en-US', {granularity: 'grapheme'}), []);
  let wordSegmenter = useMemo(() => new Intl.Segmenter('en-US', {granularity: 'word'}), []);

  let dropPosition = useRef<Position | null>(null);

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
      setSelection(ref.current, state.caretPosition);
      caretPosition.current = state.caretPosition;
    }
  });

  useEvent(ref, 'beforeinput', e => {
    let selection = window.getSelection();
    let range = selection?.getRangeAt(0)!;
    let [start, end] = rangeToPositions(range);

    // console.log(start, end)

    // https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
    // console.log(e.inputType);
    switch (e.inputType) {
      case 'insertText':
      case 'insertReplacementText':
      case 'insertFromPaste':
      case 'insertFromYank':
      case 'insertFromDrop': {
        let data: TokenFieldSegment[] = [{type: 'text', text: e.data ?? ''}];
        if (e.dataTransfer) {
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
      case 'insertLineBreak':
      case 'insertParagraph': {
        // apply((tokens) => tokens.replaceRange(start, end, '\n'));
        apply(tokens => tokens.insertToken(start));
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

  let compositionStart = useRef<[Position, Position] | null>(null);
  useEvent(ref, 'compositionstart', () => {
    let selection = window.getSelection();
    let range = selection?.getRangeAt(0)!;
    compositionStart.current = rangeToPositions(range);
  });

  useEvent(ref, 'compositionend', e => {
    let range = compositionStart.current;
    if (range) {
      apply(tokens => tokens.replaceRange(range[0], range[1], e.data));
    }
  });

  // Store the cursor position on drop so we know where to insert when the insertFromDrop event occurs.
  useEvent(ref, 'drop', e => {
    if (typeof document.caretPositionFromPoint === 'function') {
      let pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) {
        dropPosition.current = getPosition(pos.offsetNode, pos.offset);
      }
    } else if (typeof document.caretRangeFromPoint === 'function') {
      let range = document.caretRangeFromPoint(e.clientX, e.clientY);
      if (range) {
        dropPosition.current = getPosition(range.startContainer, range.startOffset);
      }
    }
  });

  let writeClipboardData = (e: ClipboardEvent | DragEvent) => {
    if ('clipboardData' in e) {
      e.preventDefault();
    }
    let selection = window.getSelection();
    let range = selection?.getRangeAt(0)!;
    let [start, end] = rangeToPositions(range);
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
  useSelectionChange(ref, () => state.endCoalescing());

  useEvent(ref, 'keydown', e => {
    if (e.key === 'z' && isCtrlKeyPressed(e) && !e.shiftKey) {
      e.preventDefault();
      apply(state => state.undo());
    } else if (isMac() ? e.key === 'z' && e.metaKey && e.shiftKey : e.key === 'y' && e.ctrlKey) {
      e.preventDefault();
      apply(state => state.redo());
    }
  });

  return (
    <div
      ref={mergeRefs(ref, autocompleteRef as any)}
      role="textbox"
      contentEditable="true"
      suppressContentEditableWarning
      {...(autocompleteProps as HTMLAttributes<HTMLDivElement>)}
      style={{padding: 4, whiteSpace: 'pre-wrap'}}>
      {state.segments.map((v, i) => {
        switch (v.type) {
          case 'token':
            return <Token key={i}>{v.text}</Token>;
          case 'text':
            return v.text;
        }
      })}
    </div>
  );
});

function Token({children}) {
  return (
    <span
      contentEditable="false"
      suppressContentEditableWarning
      style={{
        border: '1px solid gray',
        borderRadius: 4,
        padding: '0 2px',
        // marginRight: 4,
        userSelect: 'all',
        WebkitUserSelect: 'all'
      }}>
      {children}
    </span>
  );
}

function indexOfNode(node: Node) {
  let index = 0;
  let n: Node | null = node;

  while ((n = n.previousSibling)) {
    index++;
  }
  return index;
}

function rangeToPositions(range: Range | StaticRange): [Position, Position] {
  let start = getPosition(range.startContainer, range.startOffset);
  let end = getPosition(range.endContainer, range.endOffset);
  return [start, end];
}

function getPosition(node: Node, offset: number): Position {
  if (node.nodeType === Node.ELEMENT_NODE) {
    return {index: offset, offset: 0};
  }
  let index = indexOfNode(node);
  return {index, offset};
}

let isProgrammaticSelectionChange = false;

function setSelection(root: Element, pos: Position) {
  let selection = window.getSelection();
  if (selection) {
    let range = document.createRange();
    let child = root.childNodes[pos.index];
    if (!child || child.nodeType === Node.ELEMENT_NODE) {
      range.setStart(root, pos.offset > 0 ? pos.index + 1 : pos.index);
    } else {
      range.setStart(child, pos.offset);
    }
    range.collapse(true);

    isProgrammaticSelectionChange = true;
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function useSelectionChange(ref: React.RefObject<Element | null>, handler: () => void) {
  useEvent(useRef(document), 'selectionchange', () => {
    if (isProgrammaticSelectionChange) {
      isProgrammaticSelectionChange = false;
      return;
    }

    let selection = window.getSelection();
    let range = selection?.getRangeAt(0)!;
    if (ref.current && ref.current.contains(range?.commonAncestorContainer)) {
      handler();
    }
  });
}
