/*
 * Copyright 2022 Adobe. All rights reserved.
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
  Button,
  Label,
  Tag,
  TagGroup,
  TagGroupProps,
  TagList,
  TagProps
} from 'react-aria-components';
import {Collection, Node} from '@react-types/shared';
import {CollectionBuilder} from '@react-aria/collections';
import React, {ForwardedRef, forwardRef, useMemo, useState} from 'react';

export default {
  title: 'React Aria Components'
};

export const TagGroupExample = (props: TagGroupProps) => (
  <TagGroup {...props}>
    <Label>Categories</Label>
    <TagList style={{display: 'flex', gap: 4}}>
      <MyTag href="https://nytimes.com">News</MyTag>
      <MyTag>Travel</MyTag>
      <MyTag>Gaming</MyTag>
      <MyTag>Shopping</MyTag>
    </TagList>
  </TagGroup>
);

TagGroupExample.args = {
  selectionMode: 'none',
  selectionBehavior: 'toggle'
};

TagGroupExample.argTypes = {
  selectionMode: {
    control: {
      type: 'inline-radio',
      options: ['none', 'single', 'multiple']
    }
  },
  selectionBehavior: {
    control: {
      type: 'inline-radio',
      options: ['toggle', 'replace']
    }
  }
};

function MyTag(props: TagProps) {
  return (
    <Tag
      {...props}
      style={({isSelected}) => ({border: '1px solid gray', borderRadius: 4, padding: '0 4px', background: isSelected ? 'black' : '', color: isSelected ? 'white' : '', cursor: props.href ? 'pointer' : 'default'})} />
  );
}


export const TagGroupCollapsingExample = (props: TagGroupProps & {maxTags?: number}) => {
  let {maxTags = 2, ...otherProps} = props;
  let [showAll, setShowAll] = useState(false);
  let onTagGroupAction = () => {
    setShowAll(val => !val);
  };

  return (
    <CustomTagGroup {...otherProps} count={maxTags} showAll={showAll} onTagGroupAction={onTagGroupAction}>
      <Label>Categories</Label>
      <TagList style={{display: 'flex', gap: 4}}>
        {props.children}
      </TagList>
    </CustomTagGroup>
  );
};

let CustomTagGroup = forwardRef((props: TagGroupProps & {onTagGroupAction: () => void, count: number, showAll: boolean}, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <CollectionBuilder content={props.children}>
      {collection => <CustomTagGroupInner props={props} forwardedRef={ref} collection={collection} />}
    </CollectionBuilder>
  );
});

function CustomTagGroupInner({props, forwardedRef: ref, collection}: {props: TagGroupProps & {onTagGroupAction: () => void, count: number, showAll: boolean}, forwardedRef: ForwardedRef<HTMLDivElement>, collection: Collection<Node<unknown>>}) {
  let {count, onTagGroupAction, showAll, ...otherProps} = props;

  let items = useMemo(
    () => Array.from(collection).slice(0, showAll ? collection.size : count),
    [collection, count, showAll]
  );

  return (
    <>
      <TagGroup {...otherProps} ref={ref}>
        <Label>Categories</Label>
        <TagList style={{display: 'flex', gap: 4}} items={items}>
          {item => <Tag {...item.props} />}
        </TagList>
        {(count !== collection.size || showAll) && <Button onPress={onTagGroupAction}>{showAll ? 'Collapse' : 'Show All'}</Button>}
      </TagGroup>
    </>
  );
}

TagGroupCollapsingExample.args = {
  selectionMode: 'none',
  selectionBehavior: 'toggle',
  children: (
    <>
      <MyTag href="https://nytimes.com">News</MyTag>
      <MyTag>Travel</MyTag>
      <MyTag>Gaming</MyTag>
      <MyTag>Shopping</MyTag>
    </>
  )
};

TagGroupCollapsingExample.argTypes = {
  selectionMode: {
    control: {
      type: 'inline-radio',
      options: ['none', 'single', 'multiple']
    }
  },
  selectionBehavior: {
    control: {
      type: 'inline-radio',
      options: ['toggle', 'replace']
    }
  },
  maxTags: {
    control: {
      type: 'number'
    }
  }
};
