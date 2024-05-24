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
  CollectionRenderer,
  CollectionRendererContext,
  Label,
  Tag,
  TagGroup,
  TagGroupProps,
  TagList,
  TagProps
} from 'react-aria-components';
import {Node} from '@react-types/shared';
import React, {useContext, useMemo, useState} from 'react';

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
  return <Tag {...props} style={({isSelected}) => ({border: '1px solid gray', borderRadius: 4, padding: '0 4px', background: isSelected ? 'black' : '', color: isSelected ? 'white' : '', cursor: props.href ? 'pointer' : 'default'})} />;
}


export const TagGroupCollapsingExample = (props: TagGroupProps & {maxTags?: number}) => {
  let {maxTags, ...otherProps} = props;
  let [showAll, setShowAll] = useState(false);
  let onAction = () => {
    setShowAll(val => !val);
  };
  return (
    <CollapsingCollection count={maxTags} showAll={showAll} onAction={onAction}>
      <TagGroup {...otherProps}>
        <Label>Categories</Label>
        <TagList style={{display: 'flex', gap: 4}}>
          <MyTag href="https://nytimes.com">News</MyTag>
          <MyTag>Travel</MyTag>
          <MyTag>Gaming</MyTag>
          <MyTag>Shopping</MyTag>
        </TagList>
      </TagGroup>
    </CollapsingCollection>
  );
};

TagGroupCollapsingExample.args = {
  selectionMode: 'none',
  selectionBehavior: 'toggle'
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

// Context for passing the count for the custom renderer
interface ICollapseContext {
  count?: number, onAction: () => void, showAll: boolean
}
let CollapseContext = React.createContext<ICollapseContext>({onAction: () => {}, showAll: false});

function CollapsingCollection({children, count, onAction, showAll}) {
  return (
    <CollapseContext.Provider value={{count, onAction, showAll}}>
      <CollectionRendererContext.Provider value={CollapsingCollectionRenderer}>
        {children}
      </CollectionRendererContext.Provider>
    </CollapseContext.Provider>
  );
}

let CollapsingCollectionRenderer: CollectionRenderer = (collection) => {
  let {count, onAction, showAll} = useContext(CollapseContext);
  let children = useMemo(() => {
    let result: Node<unknown>[] = [];
    let index = 0;
    for (let key of collection.getKeys()) {
      result.push(collection.getItem(key)!);
      index++;
      if (!showAll && count != null && !Number.isNaN(count) && index >= count) {
        break;
      }
    }
    return result;
  }, [collection, count, showAll]);
  return (
    <>
      {children.map(node => node.render?.(node))}
      {children.length !== collection.size && <Button onPress={onAction}>Show All</Button>}
      {showAll && <Button onPress={onAction}>Collapse</Button>}
    </>
  );
};
