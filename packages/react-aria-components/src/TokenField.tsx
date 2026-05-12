import React, {useMemo, useRef} from 'react';
import {useControlledState} from 'react-stately/useControlledState';
import {useEvent} from 'react-aria/private/utils/useEvent';
import {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
import {Change, Direction, Position, TokenFieldSegment, TokenSegmentList} from './TokenSegmentList';
import {isCtrlKeyPressed} from 'react-aria/private/utils/keyboard';
import {isMac} from 'react-aria/private/utils/platform';

export type {TokenFieldSegment};

export interface TokenFieldProps {
  /** Structured document: text runs and atomic tokens. */
  value?: TokenFieldSegment[];
  defaultValue?: TokenFieldSegment[];
  onChange?: (value: TokenFieldSegment[]) => void;
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

export function TokenField(props: TokenFieldProps) {
  let {
    value: valueProp,
    defaultValue: defaultValueProp = [],
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

  let ref = useRef<HTMLDivElement | null>(null);
  let [state, setState] = useControlledState(valueProp, defaultValueProp, onChange);
  let graphemeSegmenter = useMemo(() => new Intl.Segmenter('en-US', {granularity: 'grapheme'}), []);
  let wordSegmenter = useMemo(() => new Intl.Segmenter('en-US', {granularity: 'word'}), []);

  let nextCaretPosition = useRef<Position | null>(null);
  let dropPosition = useRef<Position | null>(null);

  let undoManager = useRef(new UndoManager());

  let apply = (fn: (value: TokenSegmentList) => Change, coalesce = true) => {
    setState(value => {
      let tokens = new TokenSegmentList(value, {tokenRegex});
      let {value: newValue, caret, undo} = fn(tokens);
      nextCaretPosition.current = caret;

      if (undo) {
        undoManager.current.push(() => apply(undo), coalesce);
      }

      return newValue;
    });
  };

  useLayoutEffect(() => {
    if (ref.current && nextCaretPosition.current) {
      setSelection(ref.current, nextCaretPosition.current);
      nextCaretPosition.current = null;
    }
  });

  useEvent(ref, 'beforeinput', e => {
    let selection = window.getSelection();
    let range = selection?.getRangeAt(0)!;
    let [start, end] = rangeToPositions(range);

    // console.log(start, end)

    // https://www.w3.org/TR/input-events-2/#interface-InputEvent-Attributes
    console.log(e.inputType);
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

        apply(
          tokens => tokens.replaceRangeWithSegments(start, end, data),
          // Don't coalesce paste/drop events with other edits.
          e.inputType === 'insertText'
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
    let segments = new TokenSegmentList(state).slice(start, end);
    let dataTransfer = 'clipboardData' in e ? e.clipboardData : e.dataTransfer;
    dataTransfer?.setData(CLIPBOARD_MIME_TYPE, JSON.stringify(segments));
    dataTransfer?.setData('text/plain', segments.map(s => s.text).join(''));

    if (e.type === 'cut') {
      apply(tokens => tokens.replaceRange(start, end, ''));
    }
  };

  useEvent(ref, 'copy', writeClipboardData);
  useEvent(ref, 'cut', writeClipboardData);
  useEvent(ref, 'dragstart', writeClipboardData);
  useSelectionChange(ref, () => undoManager.current.endCoalescing());

  useEvent(ref, 'keydown', e => {
    if (e.key === 'z' && isCtrlKeyPressed(e) && !e.shiftKey) {
      e.preventDefault();
      undoManager.current.undo();
    } else if (isMac() ? e.key === 'z' && e.metaKey && e.shiftKey : e.key === 'y' && e.ctrlKey) {
      e.preventDefault();
      undoManager.current.redo();
    }
  });

  return (
    <div
      ref={ref}
      role="textbox"
      contentEditable="true"
      suppressContentEditableWarning
      style={{padding: 4, whiteSpace: 'pre-wrap'}}>
      {state.map((v, i) => {
        switch (v.type) {
          case 'token':
            return <Token key={i}>{v.text}</Token>;
          case 'text':
            return v.text;
        }
      })}
    </div>
  );
}

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
      range.setStart(root, pos.index);
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

type UndoOp = () => void;
type UndoGroup = UndoOp[];

class UndoManager {
  private undoStack: UndoGroup[] = [];
  private redoStack: UndoGroup[] = [];
  private state: 'undo' | 'redo' | null = null;
  private isCoalescing = false;

  private pushToStack(stack: UndoGroup[], op: UndoOp, coalesce = true) {
    if (this.isCoalescing && coalesce && stack.length > 0) {
      stack[stack.length - 1].unshift(op);
    } else {
      stack.push([op]);
    }
    this.isCoalescing = coalesce;
  }

  endCoalescing() {
    this.isCoalescing = false;
  }

  push(op: UndoOp, coalesce = true) {
    switch (this.state) {
      case null:
        this.pushToStack(this.undoStack, op, coalesce);
        this.redoStack = [];
        break;
      case 'undo':
        this.pushToStack(this.redoStack, op, coalesce);
        break;
      case 'redo':
        this.pushToStack(this.undoStack, op, coalesce);
        break;
    }
  }

  undo() {
    let group = this.undoStack.pop();
    if (group) {
      this.state = 'undo';
      group.forEach(op => op());
      this.state = null;
    }
  }

  redo() {
    let group = this.redoStack.pop();
    if (group) {
      this.state = 'redo';
      group.forEach(op => op());
      this.state = null;
    }
  }
}
