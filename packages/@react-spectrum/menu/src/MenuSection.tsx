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

import {classNames} from '@react-spectrum/utils';
import {getChildNodes} from '@react-stately/collections';
import {MenuItem} from './MenuItem';
import {Node} from '@react-types/shared';
import React, {Fragment, Key} from 'react';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {TreeState} from '@react-stately/tree';
import {useMenuSection} from '@react-aria/menu';
import {useSeparator} from '@react-aria/separator';
// TODO: get rid of these imports when I make SubMenu and SubMenuTrigger
import { ContextualHelpTrigger } from './ContextualHelpTrigger';
import { Content } from '@react-spectrum/view';
import { Dialog } from '@react-spectrum/dialog';
import { Heading } from '@react-spectrum/text';
import { ListBox } from '@react-spectrum/listbox';
import { CollectionElement } from '@react-types/shared';

interface MenuSectionProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  onAction?: (key: Key) => void,
  // TODO: Note this prop, basically sends the Menu's user provided render function to MenuSection so that the
  // SubMenu knows what to render. Maybe don't need it, perhaps we just use each item's childNodes and render sections + items accordingly like Menu does it?
  menuRenderer?: (item: T) => CollectionElement<T>
}

/** @private */
export function MenuSection<T>(props: MenuSectionProps<T>) {
  let {item: section, state, onAction, menuRenderer} = props;
  let {itemProps, headingProps, groupProps} = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label']
  });

  let {separatorProps} = useSeparator({
    elementType: 'li'
  });

  return (
    <Fragment>
      {section.key !== state.collection.getFirstKey() &&
        <li
          {...separatorProps}
          className={classNames(
            styles,
            'spectrum-Menu-divider'
          )} />
      }
      <li {...itemProps}>
        {section.rendered &&
          <span
            {...headingProps}
            className={
              classNames(
                styles,
                'spectrum-Menu-sectionHeading'
              )
            }>
            {section.rendered}
          </span>
        }
        <ul
          {...groupProps}
          className={
            classNames(
              styles,
              'spectrum-Menu'
            )
          }>
          {[...getChildNodes(section, state.collection)].map(node => {
            let menuItem = (
              <MenuItem
                key={node.key}
                item={node}
                state={state}
                onAction={onAction} />
            );

            // TODO: need to make a MenuItem with childItems have a trigger here too
            if (node.hasChildNodes) {
              // console.log('section and trigger item', section, node)
              console.log('item childNodes', [...node.childNodes], node)
              menuItem = (
                // This would be SubMenuTrigger?
                <ContextualHelpTrigger isSubMenu targetKey={node.key}>
                  {menuItem}
                  {/* SubMenu or Menu call would go here */}

                  <Dialog>
                    <Heading>blah</Heading>
                    <Content>
                      {/* TODO need the Menu's original renderer so the SubMenu use the MenuItem's childItems to render the desired content */}
                      {/* Actually maybe don't because we could just pass the node to the SubMenu and have it use the child nodes to render the proper stuff */}
                      <ListBox items={node.props.childItems}>
                        {menuRenderer ? menuRenderer : node.props.children}
                      </ListBox>
                    </Content>
                  </Dialog>

                  {/* TODO: below fails, try using SubMenu when that is created */}
                  {/* <Menu items={item.props.childItems}>
                    {typeof children === 'function' ? children : item.props.children}
                  </Menu> */}

                </ContextualHelpTrigger>
              );
            }

            if (node.wrapper) {
              menuItem = node.wrapper(menuItem);
            }

            return menuItem;
          })}
        </ul>
      </li>
    </Fragment>
  );
}
