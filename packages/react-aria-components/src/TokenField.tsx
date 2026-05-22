import {announce} from 'react-aria/private/live-announcer/LiveAnnouncer';
import {Direction, Position, TokenFieldSegment, TokenSegmentList} from './TokenSegmentList';
import {FieldInputContext} from './Autocomplete';
import {isCtrlKeyPressed} from 'react-aria/private/utils/keyboard';
import {isMac} from 'react-aria/private/utils/platform';
import {mergeRefs} from 'react-aria/mergeRefs';
import React, {
  ForwardedRef,
  forwardRef,
  Fragment,
  HTMLAttributes,
  useMemo,
  useRef,
  useState
} from 'react';
import {RenderProps, StyleRenderProps, useRenderProps} from './utils';
import {SlotProps, useSlottedContext} from './utils';
import {useControlledState} from 'react-stately/useControlledState';
import {useEvent} from 'react-aria/private/utils/useEvent';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {useObjectRef} from 'react-aria/useObjectRef';

export type {TokenFieldSegment};

interface TokenFieldRenderProps {
  isReadOnly: boolean;
  isDisabled: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
}

export interface TokenFieldProps extends StyleRenderProps<TokenFieldRenderProps>, SlotProps {
  value?: TokenSegmentList;
  defaultValue?: TokenSegmentList;
  onChange?: (value: TokenSegmentList) => void;
  children: (segment: TokenFieldSegment) => React.ReactElement;
  multiline?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
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

  useEvent(ref, 'beforeinput', e => {
    let selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    let range = selection.getRangeAt(0);
    let [start, end] = rangeToPositions(ref.current!, range);

    // https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
    // console.log(e.inputType);
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
    }
  });

  useEvent(ref, 'keydown', e => {
    if (e.key === 'z' && isCtrlKeyPressed(e) && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      apply(state => state.undo());
    } else if (isMac() ? e.key === 'z' && e.metaKey && e.shiftKey : e.key === 'y' && e.ctrlKey) {
      e.preventDefault();
      e.stopPropagation();
      apply(state => state.redo());
    } else if (e.key === 'ArrowLeft' && !e.metaKey) {
      // Firefox does not allow placing the cursor between adjacent tokens, so navigate manually.
      let selection = getSelection(ref.current!);
      if (!selection) {
        return;
      }
      let start = state.findBoundaryWithSegmenter(
        selection[0],
        e.altKey ? wordSegmenter : graphemeSegmenter,
        Direction.Backward
      );
      if (start) {
        e.preventDefault();
        e.stopPropagation();
        setSelection(ref.current!, start, e.shiftKey ? selection[1] : start, true);
      }
    } else if (e.key === 'ArrowRight' && !e.metaKey) {
      let selection = getSelection(ref.current!);
      if (!selection) {
        return;
      }
      let end = state.findBoundaryWithSegmenter(
        selection[1],
        e.altKey ? wordSegmenter : graphemeSegmenter,
        Direction.Forward
      );
      if (end) {
        e.preventDefault();
        e.stopPropagation();
        setSelection(ref.current!, e.shiftKey ? selection[0] : end, end, true);
      }
    } else if (e.key === 'Home') {
      // Browsers do not behave consistently when there are tokens.
      let selection = getSelection(ref.current!);
      if (!selection) {
        return;
      }
      let boundary = state.findLineBoundary(selection[0], Direction.Backward);
      if (boundary) {
        e.preventDefault();
        e.stopPropagation();
        setCursor(ref.current!, boundary, true);
      }
    } else if (e.key === 'End') {
      let selection = getSelection(ref.current!);
      if (!selection) {
        return;
      }
      let boundary = state.findLineBoundary(selection[1], Direction.Forward);
      if (boundary) {
        e.preventDefault();
        e.stopPropagation();
        setCursor(ref.current!, boundary, true);
      }
    }
  });

  let {isFocused, isFocusVisible, focusProps} = useFocusRing();

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

  return (
    <div
      {...renderProps}
      {...focusProps}
      {...(autocompleteProps as HTMLAttributes<HTMLDivElement>)}
      ref={mergeRefs(ref, autocompleteRef as any)}
      role="textbox"
      contentEditable="true"
      suppressContentEditableWarning
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
            return <Fragment key={i}>{token}</Fragment>;
          }
          case 'text':
            return v.text;
        }
      })}
    </div>
  );
});

interface TokenRenderProps {
  isSelected: boolean;
  isDisabled: boolean;
}

interface TokenProps extends RenderProps<TokenRenderProps> {}

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

function getSelection(container: Element): [Position, Position] | null {
  let selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  let range = selection.getRangeAt(0);
  return rangeToPositions(container, range);
}

function rangeToPositions(container: Element, range: Range | StaticRange): [Position, Position] {
  let start = getPosition(container, range.startContainer, range.startOffset, false);
  let end = getPosition(container, range.endContainer, range.endOffset, !range.collapsed);
  return [start, end];
}

function getPosition(container: Element, node: Node, offset: number, end = false): Position {
  if (node === container) {
    return {index: offset, offset: 0};
  }

  let index = indexOfNode(node);
  if (node.nodeType === Node.ELEMENT_NODE) {
    return {index, offset: end ? (node.textContent?.length ?? 0) : 0};
  }
  return {index, offset};
}

let isProgrammaticSelectionChange = false;

function setCursor(root: Element, pos: Position, fireEvent = false) {
  setSelection(root, pos, pos, fireEvent);
}

function setSelection(root: Element, start: Position, end: Position, fireEvent = false) {
  let selection = window.getSelection();
  if (selection) {
    let range = createDOMRange(root, start, end);
    isProgrammaticSelectionChange = !fireEvent;
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// TODO: do we want to export this?
export function positionToDOMRange(root: Element, pos: Position): Range {
  return createDOMRange(root, pos, pos);
}

function createDOMRange(root: Element, start: Position, end: Position): Range {
  let range = document.createRange();
  let child = root.childNodes[start.index];
  if (!child || child.nodeType === Node.ELEMENT_NODE) {
    range.setStart(root, start.offset > 0 ? start.index + 1 : start.index);
  } else {
    range.setStart(child, start.offset);
  }
  child = root.childNodes[end.index];
  if (!child || child.nodeType === Node.ELEMENT_NODE) {
    range.setEnd(root, end.offset > 0 ? end.index + 1 : end.index);
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
