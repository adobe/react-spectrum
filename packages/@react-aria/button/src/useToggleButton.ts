/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  RefObject
} from 'react';
import {AriaToggleButtonProps} from '@react-types/button';
import {ButtonAria, useButton} from './useButton';
import {chain} from '@react-aria/utils';
import {mergeProps} from '@react-aria/utils';
import {ToggleState} from '@react-stately/toggle';

/**
 * Provides the behavior and accessibility implementation for a toggle button component.
 * ToggleButtons allow users to toggle a selection on or off, for example switching between two states or modes.
 */

 /* eslint-disable no-redeclare */
function useToggleButton(props: AriaToggleButtonProps<'a'>, state: ToggleState, ref: RefObject<HTMLAnchorElement>): ButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
function useToggleButton(props: AriaToggleButtonProps<'area'>, state: ToggleState, ref: RefObject<HTMLAreaElement>): ButtonAria<HTMLAttributes<HTMLAreaElement>>;
function useToggleButton(props: AriaToggleButtonProps<'audio'>, state: ToggleState, ref: RefObject<HTMLAudioElement>): ButtonAria<HTMLAttributes<HTMLAudioElement>>;
function useToggleButton(props: AriaToggleButtonProps<'base'>, state: ToggleState, ref: RefObject<HTMLBaseElement>): ButtonAria<HTMLAttributes<HTMLBaseElement>>;
function useToggleButton(props: AriaToggleButtonProps<'br'>, state: ToggleState, ref: RefObject<HTMLBRElement>): ButtonAria<HTMLAttributes<HTMLBRElement>>;
function useToggleButton(props: AriaToggleButtonProps<'button'>, state: ToggleState, ref: RefObject<HTMLButtonElement>): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
function useToggleButton(props: AriaToggleButtonProps<'canvas'>, state: ToggleState, ref: RefObject<HTMLCanvasElement>): ButtonAria<HTMLAttributes<HTMLCanvasElement>>;
function useToggleButton(props: AriaToggleButtonProps<'data'>, state: ToggleState, ref: RefObject<HTMLDataElement>): ButtonAria<HTMLAttributes<HTMLDataElement>>;
function useToggleButton(props: AriaToggleButtonProps<'details'>, state: ToggleState, ref: RefObject<HTMLDetailsElement>): ButtonAria<HTMLAttributes<HTMLDetailsElement>>;
function useToggleButton(props: AriaToggleButtonProps<'dialog'>, state: ToggleState, ref: RefObject<HTMLDialogElement>): ButtonAria<HTMLAttributes<HTMLDialogElement>>;
function useToggleButton(props: AriaToggleButtonProps<'div'>, state: ToggleState, ref: RefObject<HTMLDivElement>): ButtonAria<HTMLAttributes<HTMLDivElement>>;
function useToggleButton(props: AriaToggleButtonProps<'embed'>, state: ToggleState, ref: RefObject<HTMLEmbedElement>): ButtonAria<HTMLAttributes<HTMLEmbedElement>>;
function useToggleButton(props: AriaToggleButtonProps<'fieldset'>, state: ToggleState, ref: RefObject<HTMLFieldSetElement>): ButtonAria<HTMLAttributes<HTMLFieldSetElement>>;
function useToggleButton(props: AriaToggleButtonProps<'form'>, state: ToggleState, ref: RefObject<HTMLFormElement>): ButtonAria<HTMLAttributes<HTMLFormElement>>;
function useToggleButton(props: AriaToggleButtonProps<'h1'>, state: ToggleState, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useToggleButton(props: AriaToggleButtonProps<'h2'>, state: ToggleState, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useToggleButton(props: AriaToggleButtonProps<'h3'>, state: ToggleState, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useToggleButton(props: AriaToggleButtonProps<'h4'>, state: ToggleState, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useToggleButton(props: AriaToggleButtonProps<'h5'>, state: ToggleState, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useToggleButton(props: AriaToggleButtonProps<'h6'>, state: ToggleState, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useToggleButton(props: AriaToggleButtonProps<'hr'>, state: ToggleState, ref: RefObject<HTMLHRElement>): ButtonAria<HTMLAttributes<HTMLHRElement>>;
function useToggleButton(props: AriaToggleButtonProps<'iframe'>, state: ToggleState, ref: RefObject<HTMLIFrameElement>): ButtonAria<HTMLAttributes<HTMLIFrameElement>>;
function useToggleButton(props: AriaToggleButtonProps<'img'>, state: ToggleState, ref: RefObject<HTMLImageElement>): ButtonAria<HTMLAttributes<HTMLImageElement>>;
function useToggleButton(props: AriaToggleButtonProps<'input'>, state: ToggleState, ref: RefObject<HTMLInputElement>): ButtonAria<InputHTMLAttributes<HTMLInputElement>>;
function useToggleButton(props: AriaToggleButtonProps<'label'>, state: ToggleState, ref: RefObject<HTMLLabelElement>): ButtonAria<HTMLAttributes<HTMLLabelElement>>;
function useToggleButton(props: AriaToggleButtonProps<'legend'>, state: ToggleState, ref: RefObject<HTMLLegendElement>): ButtonAria<HTMLAttributes<HTMLLegendElement>>;
function useToggleButton(props: AriaToggleButtonProps<'li'>, state: ToggleState, ref: RefObject<HTMLLIElement>): ButtonAria<HTMLAttributes<HTMLLIElement>>;
function useToggleButton(props: AriaToggleButtonProps<'link'>, state: ToggleState, ref: RefObject<HTMLLinkElement>): ButtonAria<HTMLAttributes<HTMLLinkElement>>;
function useToggleButton(props: AriaToggleButtonProps<'map'>, state: ToggleState, ref: RefObject<HTMLMapElement>): ButtonAria<HTMLAttributes<HTMLMapElement>>;
function useToggleButton(props: AriaToggleButtonProps<'menu'>, state: ToggleState, ref: RefObject<HTMLMenuElement>): ButtonAria<HTMLAttributes<HTMLMenuElement>>;
function useToggleButton(props: AriaToggleButtonProps<'meta'>, state: ToggleState, ref: RefObject<HTMLMetaElement>): ButtonAria<HTMLAttributes<HTMLMetaElement>>;
function useToggleButton(props: AriaToggleButtonProps<'meter'>, state: ToggleState, ref: RefObject<HTMLMeterElement>): ButtonAria<HTMLAttributes<HTMLMeterElement>>;
function useToggleButton(props: AriaToggleButtonProps<'object'>, state: ToggleState, ref: RefObject<HTMLObjectElement>): ButtonAria<HTMLAttributes<HTMLObjectElement>>;
function useToggleButton(props: AriaToggleButtonProps<'ol'>, state: ToggleState, ref: RefObject<HTMLOListElement>): ButtonAria<HTMLAttributes<HTMLOListElement>>;
function useToggleButton(props: AriaToggleButtonProps<'optgroup'>, state: ToggleState, ref: RefObject<HTMLOptGroupElement>): ButtonAria<HTMLAttributes<HTMLOptGroupElement>>;
function useToggleButton(props: AriaToggleButtonProps<'option'>, state: ToggleState, ref: RefObject<HTMLOptionElement>): ButtonAria<HTMLAttributes<HTMLOptionElement>>;
function useToggleButton(props: AriaToggleButtonProps<'output'>, state: ToggleState, ref: RefObject<HTMLOutputElement>): ButtonAria<HTMLAttributes<HTMLOutputElement>>;
function useToggleButton(props: AriaToggleButtonProps<'p'>, state: ToggleState, ref: RefObject<HTMLParagraphElement>): ButtonAria<HTMLAttributes<HTMLParagraphElement>>;
function useToggleButton(props: AriaToggleButtonProps<'param'>, state: ToggleState, ref: RefObject<HTMLParamElement>): ButtonAria<HTMLAttributes<HTMLParamElement>>;
function useToggleButton(props: AriaToggleButtonProps<'picture'>, state: ToggleState, ref: RefObject<HTMLPictureElement>): ButtonAria<HTMLAttributes<HTMLPictureElement>>;
function useToggleButton(props: AriaToggleButtonProps<'pre'>, state: ToggleState, ref: RefObject<HTMLPreElement>): ButtonAria<HTMLAttributes<HTMLPreElement>>;
function useToggleButton(props: AriaToggleButtonProps<'progress'>, state: ToggleState, ref: RefObject<HTMLProgressElement>): ButtonAria<HTMLAttributes<HTMLProgressElement>>;
function useToggleButton(props: AriaToggleButtonProps<'script'>, state: ToggleState, ref: RefObject<HTMLScriptElement>): ButtonAria<HTMLAttributes<HTMLScriptElement>>;
function useToggleButton(props: AriaToggleButtonProps<'select'>, state: ToggleState, ref: RefObject<HTMLSelectElement>): ButtonAria<HTMLAttributes<HTMLSelectElement>>;
function useToggleButton(props: AriaToggleButtonProps<'slot'>, state: ToggleState, ref: RefObject<HTMLSlotElement>): ButtonAria<HTMLAttributes<HTMLSlotElement>>;
function useToggleButton(props: AriaToggleButtonProps<'source'>, state: ToggleState, ref: RefObject<HTMLSourceElement>): ButtonAria<HTMLAttributes<HTMLSourceElement>>;
function useToggleButton(props: AriaToggleButtonProps<'span'>, state: ToggleState, ref: RefObject<HTMLSpanElement>): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
function useToggleButton(props: AriaToggleButtonProps<'style'>, state: ToggleState, ref: RefObject<HTMLStyleElement>): ButtonAria<HTMLAttributes<HTMLStyleElement>>;
function useToggleButton(props: AriaToggleButtonProps<'svg'>, state: ToggleState, ref: RefObject<SVGElement>): ButtonAria<HTMLAttributes<SVGElement>>;
function useToggleButton(props: AriaToggleButtonProps<'table'>, state: ToggleState, ref: RefObject<HTMLTableElement>): ButtonAria<HTMLAttributes<HTMLTableElement>>;
function useToggleButton(props: AriaToggleButtonProps<'td'>, state: ToggleState, ref: RefObject<HTMLTableDataCellElement>): ButtonAria<HTMLAttributes<HTMLTableDataCellElement>>;
function useToggleButton(props: AriaToggleButtonProps<'template'>, state: ToggleState, ref: RefObject<HTMLTemplateElement>): ButtonAria<HTMLAttributes<HTMLTemplateElement>>;
function useToggleButton(props: AriaToggleButtonProps<'textarea'>, state: ToggleState, ref: RefObject<HTMLTextAreaElement>): ButtonAria<HTMLAttributes<HTMLTextAreaElement>>;
function useToggleButton(props: AriaToggleButtonProps<'tfoot'>, state: ToggleState, ref: RefObject<HTMLTableSectionElement>): ButtonAria<HTMLAttributes<HTMLTableSectionElement>>;
function useToggleButton(props: AriaToggleButtonProps<'th'>, state: ToggleState, ref: RefObject<HTMLTableHeaderCellElement>): ButtonAria<HTMLAttributes<HTMLTableHeaderCellElement>>;
function useToggleButton(props: AriaToggleButtonProps<'thead'>, state: ToggleState, ref: RefObject<HTMLTableSectionElement>): ButtonAria<HTMLAttributes<HTMLTableSectionElement>>;
function useToggleButton(props: AriaToggleButtonProps<'time'>, state: ToggleState, ref: RefObject<HTMLTimeElement>): ButtonAria<HTMLAttributes<HTMLTimeElement>>;
function useToggleButton(props: AriaToggleButtonProps<'title'>, state: ToggleState, ref: RefObject<HTMLTitleElement>): ButtonAria<HTMLAttributes<HTMLTitleElement>>;
function useToggleButton(props: AriaToggleButtonProps<'track'>, state: ToggleState, ref: RefObject<HTMLTrackElement>): ButtonAria<HTMLAttributes<HTMLTrackElement>>;
function useToggleButton(props: AriaToggleButtonProps<'ul'>, state: ToggleState, ref: RefObject<HTMLUListElement>): ButtonAria<HTMLAttributes<HTMLUListElement>>;
function useToggleButton(props: AriaToggleButtonProps<'video'>, state: ToggleState, ref: RefObject<HTMLVideoElement>): ButtonAria<HTMLAttributes<HTMLVideoElement>>;
function useToggleButton(props: AriaToggleButtonProps<ElementType>, state: ToggleState, ref: RefObject<HTMLElement>): ButtonAria<HTMLElement>;
function useToggleButton(props: AriaToggleButtonProps<ElementType>, state: ToggleState, ref: RefObject<any>): ButtonAria<any> {
  const {isSelected} = state;
  const {isPressed, buttonProps} = useButton({
    ...props,
    onPress: chain(state.toggle, props.onPress)
  }, ref);

  return {
    isPressed,
    buttonProps: mergeProps(buttonProps, {
      'aria-pressed': isSelected
    })
  };
}

export {useToggleButton};
