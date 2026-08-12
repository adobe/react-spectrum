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

import {ActionButton} from '@react-spectrum/s2/ActionButton';
import Attach from '@react-spectrum/s2/icons/Attach';
import {Attachment, AttachmentList, AttachmentListProps} from './AttachmentList';
import {Autocomplete} from 'react-aria-components/Autocomplete';
import {Button} from '@react-spectrum/s2/Button';
import {Cell} from './loader/data';
import {CenterBaseline} from '@react-spectrum/s2/CenterBaseline';
import {
  color,
  css,
  iconStyle,
  style,
  StyleString
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  createContext,
  createRef,
  forwardRef,
  use,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {FocusableRef} from '@react-types/shared';
import {getInteractionModality} from 'react-aria/private/interactions/useFocusVisible';
import {IconContext} from '@react-spectrum/s2';
// @ts-ignore
import {Image, Text} from '@react-spectrum/s2/Card';
import intlMessages from '../intl/*.json';
import {isFileDropItem, useDrop} from 'react-aria-components/useDrop';
import {Link} from '@react-spectrum/s2/Link';
import {Menu, MenuItem, MenuItemProps, MenuTrigger} from '@react-spectrum/s2/Menu';
import Microphone from '@react-spectrum/s2/icons/Microphone';
import {PixelLoader} from './loader/react';
import Plus from '@react-spectrum/s2/icons/Add';
import {Popover, PopoverProps} from '@react-spectrum/s2/Popover';
import {
  Position,
  TokenFieldSegment,
  TokenFieldValue,
  TokenSegment
} from 'react-stately/useTokenFieldState';
import {PromptFieldContainer} from './PromptFieldContainer';
import {PromptFocusContext} from './Chat';
import Send from '@react-spectrum/s2/icons/ArrowUpSend';
import {setTokenFieldSelection} from 'react-aria/useTokenField';
import Stop from '@react-spectrum/s2/icons/StopProcessing';
import {ToggleButton} from '@react-spectrum/s2/ToggleButton';
import {
  Token,
  TokenField,
  tokenFieldPositionToDOMRange,
  TokenInput,
  TokenProps
} from 'react-aria-components/TokenField';
import {Tooltip, TooltipTrigger} from '@react-spectrum/s2/Tooltip';
import {useControlledState} from 'react-stately/useControlledState';
import {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';
import {useFocusableRef} from './useDOMRef';
import {useFocusWithin} from 'react-aria/useFocusWithin';
import {useLocale} from 'react-aria/I18nProvider';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useVoiceInput, VoiceInputErrorCode} from './useVoiceInput';

export interface PromptFieldAttachment {
  id: string;
  file: File;
  image: string;
}

export interface PromptFieldProps {
  children: React.ReactNode;
  acceptedAttachmentTypes?: string[];
  value?: PromptFieldValue;
  defaultValue?: PromptFieldValue;
  onChange?: (value: PromptFieldValue) => void;
  attachments?: PromptFieldAttachment[];
  defaultAttachments?: PromptFieldAttachment[];
  onAttachmentsChange?: (attachments: PromptFieldAttachment[]) => void;
  onSubmit?: (prompt: TokenFieldValue, attachments: PromptFieldAttachment[]) => void;
  isGenerating?: boolean;
  onStop?: () => void;
  onAddAttachments?: (attachments: PromptFieldAttachment[]) => void;
  onRemoveAttachments?: (attachments: PromptFieldAttachment[]) => void;
  styles?: StyleString;
  variant?: 'balanced' | 'prominent' | 'subtle';
  brandColor?: string;
}

interface PromptFieldState {
  attachments: PromptFieldAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<PromptFieldAttachment[]>>;
  acceptedAttachmentTypes?: string[];
  prompt: PromptFieldValue;
  setPrompt: React.Dispatch<React.SetStateAction<PromptFieldValue>>;
  inputRef: React.RefObject<HTMLDivElement | null>;
  onSubmit?: () => void;
  onStop?: () => void;
  isGenerating: boolean;
  onAddAttachments?: (attachments: PromptFieldAttachment[]) => void;
  onRemoveAttachments?: (attachments: PromptFieldAttachment[]) => void;
  isListening: boolean;
  setListening: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO: make this customizable
const tokenRegex = /(?<=\s|^)(https?:\/\/)?(www\.)?([^/\s]+\.[a-z]{2,}(\/\S+)?)(?=\s)/g;
function tokenizeURLs(text: string): TokenFieldSegment[] {
  if (text.length === 0) {
    return [{type: 'text', text}];
  }

  tokenRegex.lastIndex = 0;

  let match: RegExpExecArray | null = null;
  let start = 0;
  let segments: TokenFieldSegment[] = [];
  while ((match = tokenRegex.exec(text))) {
    if (match.index > start) {
      segments.push({type: 'text', text: text.slice(start, match.index)});
    }
    segments.push({type: 'token', text: match[3], value: {type: 'url', url: match[0]}});
    start = match.index + match[0].length;
  }

  if (start < text.length) {
    segments.push({type: 'text', text: text.slice(start)});
  }

  return segments;
}

interface UrlTokenValue {
  type: 'url';
  url: string;
}

interface PlaceholderTokenValue {
  type: 'placeholder';
  placeholderType: 'token';
  /** Anchor character to insert when the user starts typing (e.g. '@'). */
  anchor: string;
  /** Expected value type to filter completions by. */
  valueType: string | null;
}

interface PlaceholderTextTokenValue {
  type: 'placeholder';
  placeholderType: 'text';
}

interface AnchorTokenValue {
  type: 'anchor';
  valueType: string;
}

interface CustomTokenValue {
  type: 'custom';
  [key: string]: any;
}

export type PromptFieldTokenValue =
  | UrlTokenValue
  | PlaceholderTokenValue
  | PlaceholderTextTokenValue
  | AnchorTokenValue
  | CustomTokenValue;

export class PromptFieldValue extends TokenFieldValue<PromptFieldTokenValue> {
  tokenize(text: string): TokenFieldSegment[] {
    return tokenizeURLs(text);
  }

  replaceRangeWithSegments(
    start: Position,
    end: Position,
    segments: TokenFieldSegment[],
    coalesce = true
  ): this {
    let slice = this.slice(start, end).segments;
    let token = slice[0];
    if (
      slice.length === 1 &&
      token.type === 'token' &&
      token.value?.type === 'placeholder' &&
      token.value.placeholderType === 'token' &&
      segments.length === 1 &&
      segments[0].type === 'text' &&
      !segments[0].text.startsWith(token.value.anchor)
    ) {
      segments = [
        {
          type: 'token',
          text: token.value.anchor,
          value: {type: 'anchor', valueType: token.value.valueType}
        },
        ...segments
      ];
    }
    return super.replaceRangeWithSegments(start, end, segments, coalesce);
  }
}

const PromptFieldContext = createContext<PromptFieldState>({
  attachments: [],
  setAttachments: () => {},
  prompt: new PromptFieldValue([]),
  setPrompt: () => {},
  inputRef: createRef(),
  isGenerating: false,
  isListening: false,
  setListening: () => {}
});

// to communicate the anchor position to the menu items in the completion popover
// need this so we can replace the inline filter text rather than inserting it at the current caret
// aka the difference between a slash command and using the + menu which won't have filter text
const PromptCompletionAnchorContext = createContext<Position | null>(null);

function matchMimeType(mimeType: string, acceptedMimeTypes: string[]): boolean {
  return acceptedMimeTypes.some(type => {
    if (type === '*/*') {
      return true;
    }
    if (type.endsWith('/*')) {
      return mimeType.startsWith(type.slice(0, -2));
    }
    return mimeType === type;
  });
}

export const PromptField = forwardRef(function PromptField(
  props: PromptFieldProps,
  ref: FocusableRef<HTMLDivElement>
) {
  let {
    children,
    acceptedAttachmentTypes,
    isGenerating,
    onStop,
    styles,
    onAddAttachments,
    onRemoveAttachments,
    variant = 'balanced',
    brandColor
  } = props;
  // Not using RAC DropZone because it adds its own focusable button,
  // and we want to avoid an extra tab. We support pasting files directly into the input.
  let inputRef = useRef<HTMLDivElement>(null);
  let domRef = useFocusableRef(ref, inputRef);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let [prompt, setPrompt] = useControlledState(
    props.value,
    props.defaultValue ?? new PromptFieldValue([]),
    props.onChange
  );
  let [attachments, setAttachments] = useControlledState(
    props.attachments,
    props.defaultAttachments ?? [],
    props.onAttachmentsChange
  );
  let {dropProps, isDropTarget} = useDrop({
    ref: inputRef,
    hasDropButton: true,
    isDisabled: !acceptedAttachmentTypes,
    getDropOperation(types) {
      return acceptedAttachmentTypes && types.has(acceptedAttachmentTypes) ? 'copy' : 'cancel';
    },
    async onDrop(e) {
      let files = await Promise.all(
        e.items
          .filter(isFileDropItem)
          .filter(item => matchMimeType(item.type, acceptedAttachmentTypes!))
          .map(async item => ({
            id: crypto.randomUUID(),
            file: await item.getFile(),
            image: item.type.startsWith('image/') ? URL.createObjectURL(await item.getFile()) : ''
          }))
      );
      onAddAttachments?.(files);
      setAttachments(attachments => [...attachments, ...files]);
    }
  });

  let [isListening, setListening] = useState(false);
  let {onFocusChange} = useContext(PromptFocusContext);
  let {focusWithinProps} = useFocusWithin({onFocusWithinChange: onFocusChange});

  let isPromptControlled = props.value !== undefined;
  let isAttachmentsControlled = props.attachments !== undefined;
  let onSubmit = () => {
    if (prompt.segments.length === 0) {
      return;
    }

    props.onSubmit?.(prompt, attachments);
    if (!isPromptControlled) {
      setPrompt(new PromptFieldValue([]));
    }
    if (!isAttachmentsControlled) {
      setAttachments([]);
    }
    inputRef.current?.focus();
  };

  return (
    <PromptFieldContext.Provider
      value={{
        attachments,
        setAttachments,
        acceptedAttachmentTypes,
        prompt,
        setPrompt,
        inputRef,
        onSubmit,
        isGenerating: isGenerating ?? false,
        isListening,
        setListening,
        onStop,
        onAddAttachments,
        onRemoveAttachments
      }}>
      <div ref={domRef} {...focusWithinProps}>
        <PromptFieldContainer
          {...dropProps}
          role="group"
          variant={variant}
          brandColor={brandColor}
          isGenerating={isGenerating ?? false}
          isDropTarget={isDropTarget}
          styles={styles}
          inputRef={inputRef}>
          {children}
        </PromptFieldContainer>
        <p className={style({font: 'ui-sm', textAlign: 'center'})}>
          {stringFormatter.format('promptfield.aiDisclaimer')}{' '}
          <Link
            variant="secondary"
            href="https://www.adobe.com/legal/licenses-terms/adobe-gen-ai-user-guidelines.html"
            target="_blank">
            {stringFormatter.format('promptfield.aiUserGuidlines')}
          </Link>
        </p>
      </div>
    </PromptFieldContext.Provider>
  );
});

export interface PromptFieldAttachmentListProps extends AttachmentListProps<PromptFieldAttachment> {
  children?: (attachment: PromptFieldAttachment) => React.ReactNode;
}

export function PromptFieldAttachmentList(props: PromptFieldAttachmentListProps) {
  let {children} = props;
  let {attachments, setAttachments, onRemoveAttachments, inputRef} = useContext(PromptFieldContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  if (attachments.length === 0) {
    return null;
  }

  return (
    <AttachmentList
      {...props}
      aria-label={stringFormatter.format('promptfield.attachments')}
      onRemove={keys => {
        let removedAttachments = attachments.filter(attachment => keys.has(attachment.id));
        onRemoveAttachments?.(removedAttachments);
        setAttachments(attachments => attachments.filter(attachment => !keys.has(attachment.id)));
        if (removedAttachments.length === attachments.length) {
          inputRef.current?.focus();
        }
      }}
      items={attachments}>
      {children ||
        (attachment => (
          <Attachment>
            {attachment.image && <Image src={attachment.image} slot="thumbnail" />}
          </Attachment>
        ))}
    </AttachmentList>
  );
}

export interface PromptTokenFieldProps {
  completionTrigger?: RegExp;
  renderCompletions?: (
    filterValue: string,
    valueType: string | null
  ) => React.ReactNode[] | null | Promise<React.ReactNode[] | null>;
  children?: (segment: TokenSegment<PromptFieldTokenValue>) => React.ReactElement;
  pixelLoader?: Cell[] | Cell[][];
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  // TODO: temp api for coworker so that the weird popover shrinking behavior
  // doesn't appear when rendering near edge of page
  menuWidth?: number;
}

export function PromptTokenField(props: PromptTokenFieldProps) {
  let {
    completionTrigger,
    renderCompletions,
    children,
    pixelLoader,
    placeholder,
    menuWidth,
    onKeyDown: onKeyDownProp
  } = props;
  let {
    prompt,
    setPrompt,
    acceptedAttachmentTypes,
    setAttachments,
    onAddAttachments,
    inputRef,
    onSubmit,
    isGenerating,
    isListening
  } = useContext(PromptFieldContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let [isFocused, setFocused] = useState(false);

  let [filterAnchor, filterValue, filterType] = useMemo(() => {
    // If on a placeholder token, show suggestions.
    let slice = prompt.slice(prompt.selectedRange.start, prompt.selectedRange.end);
    let segment = slice.segments.length === 1 ? slice.segments[0] : null;
    if (
      segment?.type === 'token' &&
      segment.value?.type === 'placeholder' &&
      segment.value.placeholderType === 'token'
    ) {
      return [prompt.selectedRange.start, '', segment.value.valueType ?? null];
    }

    if (completionTrigger) {
      // Find a preceding anchor token. This tells us what kind of object to filter for.
      let anchorTokenIndex = -1;
      let filterType: string | null = null;
      for (
        let index = Math.min(prompt.selectedRange.anchor.index, prompt.segments.length - 1);
        index >= 0;
        index--
      ) {
        let segment = prompt.segments[index];
        if (segment.type === 'token' && segment.value?.type === 'anchor') {
          anchorTokenIndex = index;
          filterType = segment.value?.valueType;
          break;
        }
      }

      let filterAnchor = prompt.findText(
        prompt.caretPosition,
        TokenFieldValue.Direction.Backward,
        completionTrigger
      );

      // If anchor token is after text anchor, use it.
      if (anchorTokenIndex >= 0 && (!filterAnchor || anchorTokenIndex > filterAnchor.index)) {
        filterAnchor = {index: anchorTokenIndex, offset: 0};
      }

      // Filter text is the text between the anchor and the caret position.
      if (filterAnchor != null) {
        let filterValue = prompt.slice(filterAnchor, prompt.caretPosition).toString();
        return [filterAnchor, filterValue, filterType];
      }
    }
    return [null, null, null];
  }, [completionTrigger, prompt]);

  let items = useMemo(() => {
    return filterValue != null ? renderCompletions?.(filterValue, filterType) : null;
  }, [filterValue, filterType, renderCompletions]);

  let tab = (dir: number) => {
    // TODO: should we support tabbing to all tokens or only placeholders?
    let nextPrompt = selectNextPlaceholder(prompt, dir);
    if (nextPrompt) {
      setPrompt(nextPrompt);
      return true;
    }
    return false;
  };

  let {keyboardProps} = useKeyboard({
    onKeyDown: onKeyDownProp,
    shortcuts: {
      Tab: () => tab(1),
      'Shift+Tab': () => tab(-1)
    }
  });

  return (
    <div
      className={style({
        display: 'flex',
        gap: 12,
        alignItems: 'baseline',
        color: {
          default: 'transparent-overlay-600',
          isFocused: 'body',
          forcedColors: 'ButtonText'
        },
        transition: 'default',
        transitionDuration: 350,
        paddingStart: 4,
        width: 'full',
        '--loader-color': {
          type: 'color',
          value: {
            default: 'gray-1000',
            isFocused: 'body',
            forcedColors: 'ButtonText'
          }
        },
        '--loader-opacity': {
          type: 'opacity',
          value: {
            default: 0.51,
            isFocused: 1,
            forcedColors: 1
          }
        }
      })({isFocused: isFocused || prompt.segments.length > 0})}>
      <CenterBaseline>
        <PixelLoader
          isPlaying={isGenerating}
          icon={pixelLoader}
          color="var(--loader-color)"
          className={style({
            opacity: '--loader-opacity',
            transition: 'opacity',
            transitionDuration: 350
          })}
        />
      </CenterBaseline>
      <Autocomplete>
        <TokenField
          value={prompt}
          onChange={setPrompt}
          allowsNewlines
          className={style({flexGrow: 1})}
          aria-label={stringFormatter.format('promptfield.label')}
          isReadOnly={isListening}
          onSubmit={onSubmit}
          onKeyDown={keyboardProps.onKeyDown}
          onFocus={e => {
            if (e.isTrusted) {
              setFocused(true);

              // If shift tabbing into the prompt field, select the last placeholder if any.
              if (
                e.relatedTarget &&
                getInteractionModality() === 'keyboard' &&
                e.currentTarget.compareDocumentPosition(e.relatedTarget) &
                  Node.DOCUMENT_POSITION_FOLLOWING
              ) {
                let lastPlaceholder = prompt.segments.findLastIndex(
                  s => s.type === 'token' && s.value?.type === 'placeholder'
                );
                if (lastPlaceholder >= 0) {
                  setPrompt(value =>
                    value.withSelectedRange(
                      new TokenFieldValue.SelectedRange(
                        {index: lastPlaceholder, offset: 0},
                        {index: lastPlaceholder, offset: 1}
                      )
                    )
                  );
                }
              }
            }
          }}
          onBlur={e => {
            if (e.isTrusted) {
              setFocused(false);
            }
          }}
          onPaste={
            acceptedAttachmentTypes
              ? e => {
                  let clipboardData = e.clipboardData as DataTransfer;
                  let attachments: PromptFieldAttachment[] = [];
                  for (let item of clipboardData.items) {
                    if (matchMimeType(item.type, acceptedAttachmentTypes)) {
                      let file = item.getAsFile()!;
                      attachments.push({
                        id: crypto.randomUUID(),
                        file,
                        image: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
                      });
                    }
                  }
                  if (attachments.length > 0) {
                    onAddAttachments?.(attachments);
                    setAttachments(prev => [...prev, ...attachments]);
                  }
                }
              : undefined
          }>
          <TokenInput
            data-placeholder={placeholder || stringFormatter.format('promptfield.placeholder')}
            ref={inputRef}
            className={
              css('&:empty::before { content: attr(data-placeholder); }') +
              style({
                font: 'body',
                color: {
                  default: 'neutral',
                  ':empty': {
                    default: 'gray-600',
                    forcedColors: 'GrayText'
                  }
                },
                width: 'full',
                outlineStyle: 'none',
                cursor: 'text'
              })
            }>
            {useCallback(
              (token: TokenSegment<PromptFieldTokenValue>) => {
                if (token.value?.type === 'anchor') {
                  return <Token>{token.text}</Token>;
                } else {
                  return children ? (
                    children(token)
                  ) : (
                    <PromptToken token={token}>{token.text}</PromptToken>
                  );
                }
              },
              [children]
            )}
          </TokenInput>
        </TokenField>
        <PromptTokenFieldPopover
          filterAnchor={filterAnchor}
          items={useDeferredValue(items)}
          isFocused={isFocused}
          menuWidth={menuWidth}
        />
      </Autocomplete>
    </div>
  );
}

export interface PromptTokenFieldPopoverProps extends Omit<PopoverProps, 'shouldSkipAnimation'> {
  filterAnchor?: Position | null;
  items?: React.ReactNode[] | null | Promise<React.ReactNode[] | null>;
  isFocused?: boolean;
  // TODO: temp for coworker see above comment
  menuWidth?: number;
}

function PromptTokenFieldPopover(props: PromptTokenFieldPopoverProps) {
  let {filterAnchor, items, isFocused, menuWidth} = props;
  let {inputRef, prompt} = useContext(PromptFieldContext);

  let resolvedItems = items instanceof Promise ? use(items) : items;
  let isOpen =
    isFocused && filterAnchor != null && resolvedItems != null && resolvedItems.length > 0;

  // Cache items so that popover content doesn't flicker to empty while animating out
  let [menuItems, setMenuItems] = useState(resolvedItems);
  if (resolvedItems !== menuItems && resolvedItems != null && resolvedItems.length > 0) {
    setMenuItems(resolvedItems);
  }

  let key = 'popover';
  if (filterAnchor) {
    // If on a token, anchor to the end of the previous text segment.
    if (filterAnchor.index > 0 && filterAnchor.offset === 0) {
      filterAnchor = {
        index: filterAnchor.index - 1,
        offset: prompt.segments[filterAnchor.index - 1].text.length
      };
    }
    // Reposition the popover when the anchor changes.
    key = `${filterAnchor.index}:${filterAnchor.offset}`;
  }

  return (
    <Popover
      triggerRef={inputRef}
      isOpen={isOpen}
      isNonModal
      hideArrow
      placement="bottom start"
      UNSAFE_style={menuWidth != null ? {width: menuWidth} : undefined}
      key={key}
      getTargetRect={target => {
        return tokenFieldPositionToDOMRange(target, filterAnchor!).getBoundingClientRect();
      }}>
      <PromptCompletionAnchorContext.Provider value={filterAnchor ?? null}>
        <Menu>{menuItems}</Menu>
      </PromptCompletionAnchorContext.Provider>
    </Popover>
  );
}

export interface PromptTokenProps extends Omit<TokenProps, 'children' | 'render'> {
  token: TokenSegment<PromptFieldTokenValue>;
  children: React.ReactNode;
}

export function PromptToken(props: PromptTokenProps) {
  return (
    <Token
      {...props}
      className={renderProps =>
        style({
          font: 'ui',
          backgroundColor: {
            default: 'transparent-overlay-1000/10',
            isSelected: 'blue-800',
            // Firefox ignores completely transparent selection colors, so we need to use a nearly transparent color instead
            '::selection': '[#ffffff01]'
          },
          color: {
            default: 'body',
            isSelected: 'white'
          },
          outlineStyle: {
            default: 'solid',
            isPlaceholder: 'dashed'
          },
          outlineWidth: 1,
          outlineColor: {
            default: 'transparent-overlay-1000/10',
            isPlaceholder: 'transparent-overlay-1000/40'
          },
          outlineOffset: -1,
          borderRadius: 'pill',
          boxShadow: `[inset 0 24px 32px 0 ${color('transparent-white-50')}, 0 8px 32px 0 ${color('transparent-black-50')}]`,
          paddingX: 8,
          // not using inline-flex here due to a text selection bug in WebKit.
          paddingY: space(3),
          lineHeight: '[1em]',
          cursor: 'default',
          '--iconPrimary': {
            type: 'fill',
            value: 'currentColor'
          }
        })({...renderProps, isPlaceholder: props.token.value?.type === 'placeholder'})
      }>
      <IconContext.Provider
        value={{
          styles: style({
            size: 14,
            display: 'inline-block',
            verticalAlign: '[-0.18em]',
            marginEnd: 4
          })
        }}>
        {props.children}
      </IconContext.Provider>
    </Token>
  );
}

export interface PromptFieldToolbarProps {
  children: React.ReactNode;
}

export function PromptFieldToolbar(props: PromptFieldToolbarProps) {
  let {children} = props;
  return (
    <div
      className={style({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16
      })}>
      {children}
    </div>
  );
}

export interface PromptFieldSubmitButtonProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function PromptFieldSubmitButton(props: PromptFieldSubmitButtonProps) {
  let {prompt, isGenerating, onSubmit, onStop} = useContext(PromptFieldContext);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  return (
    <Button
      variant="primary"
      staticColor="auto"
      // TODO: should it be possible to submit a prompt with only attachments?
      isDisabled={prompt.segments.length === 0 && !isGenerating}
      aria-label={
        isGenerating
          ? stringFormatter.format('promptfield.stopButton')
          : stringFormatter.format('promptfield.submitButton')
      }
      onPress={isGenerating ? onStop : onSubmit}>
      {isGenerating ? <Stop /> : <Send />}
    </Button>
  );
}

export interface PromptFieldVoiceButtonProps {
  lang?: string;
  isDisabled?: boolean;
  onError?: (code: VoiceInputErrorCode) => void;
  onToggle?: (isListening: boolean) => void;
}

export function PromptFieldVoiceButton(props: PromptFieldVoiceButtonProps) {
  let {lang: langProp, isDisabled: isDisabledProp, onError, onToggle} = props;
  let {locale} = useLocale();
  let lang = langProp ?? locale;
  let {prompt, setPrompt, inputRef, setListening} = useContext(PromptFieldContext);
  let isDisabled = isDisabledProp;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  let basePromptRef = useRef<TokenFieldValue>(prompt);
  let updateBasePrompt = useEffectEvent(() => {
    basePromptRef.current = prompt;
  });

  let {
    isSupported,
    isListening: isVoiceListening,
    transcript,
    toggle,
    stop
  } = useVoiceInput({lang, onError, onListeningChange: setListening});

  let restoreFocus = useEffectEvent(() => {
    if (!inputRef.current) {
      return;
    }
    // similar to useInsertPromptSegment, calling programatic focus on the input causes the caret positioning
    // to be inaccurate
    let finalPrompt = buildVoicePrompt(basePromptRef.current, transcript);
    inputRef.current.focus();
    setTokenFieldSelection(inputRef.current, finalPrompt.selectedRange);
    setPrompt(finalPrompt);
  });

  let onToggleEvent = useEffectEvent((isListening: boolean) => {
    onToggle?.(isListening);
  });

  let wasListeningRef = useRef(false);
  useEffect(() => {
    if (isVoiceListening) {
      updateBasePrompt();
      wasListeningRef.current = true;
      onToggleEvent(true);
    } else if (wasListeningRef.current) {
      wasListeningRef.current = false;
      restoreFocus();
      onToggleEvent(false);
    }
  }, [isVoiceListening]);

  let applyVoiceTranscript = useEffectEvent(() => {
    if (!transcript || !isVoiceListening) {
      return;
    }

    setPrompt(buildVoicePrompt(basePromptRef.current, transcript));
  });
  useEffect(() => {
    applyVoiceTranscript();
  }, [transcript, isVoiceListening]);

  useEffect(() => {
    if (isDisabled && isVoiceListening) {
      stop();
    }
  }, [isDisabled, isVoiceListening, stop]);

  if (!isSupported) {
    return null;
  }

  let label = isVoiceListening
    ? stringFormatter.format('voicebutton.stopListening')
    : stringFormatter.format('voicebutton.startListening');

  return (
    <TooltipTrigger>
      <ToggleButton
        staticColor="auto"
        isQuiet
        isSelected={isVoiceListening}
        isDisabled={isDisabled}
        aria-label={label}
        onPress={toggle}>
        <Microphone />
      </ToggleButton>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}

function buildVoicePrompt(base: TokenFieldValue, voiceText: string): PromptFieldValue {
  if (!voiceText) {
    return base as PromptFieldValue;
  }
  return base.replaceRange(base.caretPosition, base.caretPosition, voiceText) as PromptFieldValue;
}

export interface InsertMenuItemProps {
  children: React.ReactNode;
}

export function InsertMenuButton(props: InsertMenuItemProps) {
  let {children} = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  return (
    <MenuTrigger>
      <ActionButton
        isQuiet
        staticColor="auto"
        aria-label={stringFormatter.format('promptfield.insertButton')}>
        <Plus />
      </ActionButton>
      <Menu>{children}</Menu>
    </MenuTrigger>
  );
}

export function AttachFileMenuItem() {
  let {acceptedAttachmentTypes, setAttachments, onAddAttachments} = useContext(PromptFieldContext);
  return (
    <MenuItem
      onAction={() => {
        let input = document.createElement('input');
        input.type = 'file';
        if (acceptedAttachmentTypes) {
          input.accept = acceptedAttachmentTypes.join(',');
        }
        input.multiple = true;
        input.onchange = e => {
          let files = (e.currentTarget as HTMLInputElement).files;
          if (files && acceptedAttachmentTypes) {
            let attachments = Array.from(files)
              .filter(file => matchMimeType(file.type, acceptedAttachmentTypes))
              .map(file => ({
                id: crypto.randomUUID(),
                file,
                image: file.type.startsWith('image/') ? URL.createObjectURL(file) : ''
              }));
            if (attachments.length > 0) {
              onAddAttachments?.(attachments);
              setAttachments(prev => [...prev, ...attachments]);
            }
          }
        };
        input.click();
      }}>
      <Attach />
      <Text>Attach a file</Text>
    </MenuItem>
  );
}

// either replace the filter text (aka token replace) or insert value at current caret position (aka plain text inject)
function useInsertPromptSegment(segments: TokenFieldSegment[]) {
  let {setPrompt, inputRef} = useContext(PromptFieldContext);
  let anchor = useContext(PromptCompletionAnchorContext);
  let pendingCaret = useRef<Position | null>(null);
  return () => {
    setPrompt(value => {
      // Add a space only if not already followed by one, but move the cursor past the space in any case.
      let space = value.findText(value.caretPosition, TokenFieldValue.Direction.Forward, ' ');
      let hasFollowingSpace =
        space && value.slice(value.caretPosition, space).segments.length === 0;
      let insert: TokenFieldSegment[] = [...segments, {type: 'text', text: ' '}];
      let endPosition = value.caretPosition;
      if (hasFollowingSpace && space) {
        space.offset++;
        endPosition = space;
      }
      let newValue = value.replaceRangeWithSegments(
        anchor ?? value.caretPosition,
        endPosition,
        insert,
        false // Don't coalesce in undo/redo history.
      );
      pendingCaret.current = newValue.caretPosition;
      return newValue;
    });

    if (anchor == null) {
      // Wait for popover animation, then restore cursor to after the inserted content.
      setTimeout(() => {
        if (inputRef.current && pendingCaret.current) {
          let position = pendingCaret.current;
          let range = new TokenFieldValue.SelectedRange(position);
          pendingCaret.current = null;
          inputRef.current.focus();
          // we need to update the position manually since TokenField's update caret logic only happens if the field is focused
          // but this insert can happen from the + menu aka the field isn't focused until this gets called which is too late
          setTokenFieldSelection(inputRef.current, range);
          // the above focus and setCursor call can cause the internally tracked caret position to be reset incorrectly
          // seemingly due to TokenField's isProgrammaticSelectionChange being flipped to false by setCursor and thus reset to 0 by the .focus
          // fix this by resetting to proper position below
          // happens when injecting multiple tokens one after another via + menu
          setPrompt(value => value.withSelectedRange(range));
        }
      }, 400);
    }
  };
}

export interface InsertTokenMenuItemProps extends Omit<
  MenuItemProps,
  | 'UNSAFE_className'
  | 'UNSAFE_style'
  | 'download'
  | 'href'
  | 'hrefLang'
  | 'ping'
  | 'referrerPolicy'
  | 'rel'
  | 'routerOptions'
  | 'target'
  | 'value'
> {
  token: TokenSegment<PromptFieldTokenValue>;
}

export function InsertTokenMenuItem(props: InsertTokenMenuItemProps) {
  let insert = useInsertPromptSegment([props.token]);

  return (
    <MenuItem
      {...props}
      onAction={() => {
        insert();
        props.onAction?.();
      }}
    />
  );
}

export interface InsertTextMenuItemProps extends Omit<
  MenuItemProps,
  | 'UNSAFE_className'
  | 'UNSAFE_style'
  | 'download'
  | 'href'
  | 'hrefLang'
  | 'ping'
  | 'referrerPolicy'
  | 'rel'
  | 'routerOptions'
  | 'target'
  | 'value'
> {
  text: string;
}

export function InsertTextMenuItem(props: InsertTextMenuItemProps) {
  let insert = useInsertPromptSegment([{type: 'text', text: props.text}]);

  return (
    <MenuItem
      {...props}
      onAction={() => {
        insert();
        props.onAction?.();
      }}
    />
  );
}

export interface CommandMenuItemProps extends Omit<
  MenuItemProps,
  | 'UNSAFE_className'
  | 'UNSAFE_style'
  | 'download'
  | 'href'
  | 'hrefLang'
  | 'ping'
  | 'referrerPolicy'
  | 'rel'
  | 'routerOptions'
  | 'target'
> {}
// specifically for menu items that only trigger a callback in the autocomplete menu
// since they dont end up inserting a token or text, we need to clear the partial text that the user used
// to filter the menu
export function CommandMenuItem(props: CommandMenuItemProps) {
  let insert = useInsertPromptSegment([]);
  return (
    <MenuItem
      {...props}
      onAction={() => {
        insert();
        props.onAction?.();
      }}
    />
  );
}
