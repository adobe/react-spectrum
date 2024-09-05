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

import {AccordionItemProps, AccordionPanelProps} from 'react-aria-components/src/Accordion';
import {AriaLabelingProps, DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {Button, Header, Heading, AccordionItem as RACAccordionItem, AccordionPanel as RACAccordionPanel} from 'react-aria-components';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {filterDOMProps} from '@react-aria/utils';
import React, {forwardRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/accordion/vars.css';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

// TODO: handle types
export interface SpectrumAccordionGroupProps extends StyleProps, DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

function AccordionGroup(props: SpectrumAccordionGroupProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  return (
    <div
      {...filterDOMProps(props)}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Accordion', styleProps.className)}>
      {props.children}
    </div>
  );
}

interface SpectrumAccordionItemProps extends AccordionItemProps, DOMProps, AriaLabelingProps  {}

function AccordionItem(props: SpectrumAccordionItemProps) {
  props = useProviderProps(props);
  return (
    <RACAccordionItem
      {...props}
      className={({isExpanded, isDisabled}) => classNames(styles, 'spectrum-Accordion-item', {
        'is-expanded': isExpanded,
        'is-disabled': isDisabled
      })}>
      {props.children}
    </RACAccordionItem>
  );
}

// TODO extend ARIA accordion panel props
export interface SpectrumAccordionPanelProps extends AccordionPanelProps, DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

function AccordionPanel(props) {
  return (
    <RACAccordionPanel className={classNames(styles, 'spectrum-Accordion-itemContent')} {...props}>
      {props.children}
    </RACAccordionPanel>
  );
}

export interface SpectrumAccordionHeaderProps extends DOMProps, AriaLabelingProps {
  children: React.ReactNode
}

function AccordionHeader(props) {
  let {direction} = useLocale();
  return (
    <Header {...props}>
      <Heading className={classNames(styles, 'spectrum-Accordion-itemHeading')}>
        <Button
          slot="trigger"
          className={({isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Accordion-itemHeader', {
            'is-hovered': isHovered,
            'focus-ring': isFocusVisible
          })}>
          {direction === 'ltr' ? (
            <ChevronRightMedium
              aria-hidden="true"
              UNSAFE_className={classNames(styles, 'spectrum-Accordion-itemIndicator')} />
              ) : (
                <ChevronLeftMedium
                  aria-hidden="true"
                  UNSAFE_className={classNames(styles, 'spectrum-Accordion-itemIndicator')} />
              )}
          {props.children}
        </Button>
      </Heading>
    </Header>
  );
}

const _AccordionGroup = forwardRef(AccordionGroup) as (props: SpectrumAccordionGroupProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof AccordionGroup>;
export {_AccordionGroup as AccordionGroup};

const _AccordionItem = forwardRef(AccordionItem) as (props: SpectrumAccordionItemProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof AccordionItem>;
export {_AccordionItem as AccordionItem};

const _AccordionPanel = forwardRef(AccordionPanel) as (props: SpectrumAccordionPanelProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof AccordionPanel>;
export {_AccordionPanel as AccordionPanel};

const _AccordionHeader = forwardRef(AccordionHeader) as (props: SpectrumAccordionHeaderProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof AccordionHeader>;
export {_AccordionHeader as AccordionHeader};
