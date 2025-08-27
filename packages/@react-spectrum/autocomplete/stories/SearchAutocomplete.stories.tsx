
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

import {action} from '@storybook/addon-actions';
import {Avatar} from '@react-spectrum/avatar';
import {ComponentMeta, ComponentStoryObj} from '@storybook/react';
import Filter from '@spectrum-icons/workflow/Filter';
import {Flex} from '@react-spectrum/layout';
import {Item, SearchAutocomplete} from '@react-spectrum/autocomplete';
import {mergeProps} from '@react-aria/utils';
import React from 'react';
import {Text} from '@react-spectrum/text';
import {useAsyncList} from '@react-stately/data';


type SearchAutocompleteStory = ComponentStoryObj<typeof SearchAutocomplete>;

export default {
  title: 'SearchAutocomplete',
  component: SearchAutocomplete,
  render: (args) => (
    <SearchAutocomplete label="Search with Autocomplete" {...args}>
      <Item>Aerospace</Item>
      <Item>Mechanical</Item>
      <Item>Civil</Item>
      <Item>Biomedical</Item>
      <Item>Nuclear</Item>
      <Item>Industrial</Item>
      <Item>Chemical</Item>
      <Item>Agricultural</Item>
      <Item>Electrical</Item>
    </SearchAutocomplete>
  ),
  args: {
    label: 'Search with Autocomplete',
    onOpenChange: action('onOpenChange'),
    onInputChange: action('onInputChange'),
    onSelectionChange: action('onSelectionChange'),
    onBlur: action('onBlur'),
    onFocus: action('onFocus'),
    onSubmit: action('onSubmit'),
    onClear: action('onClear')
  },
  argTypes: {
    defaultItems: {
      table: {
        disable: true
      }
    },
    contextualHelp: {
      table: {
        disable: true
      }
    },
    onOpenChange: {
      table: {
        disable: true
      }
    },
    disabledKeys: {
      table: {
        disable: true
      }
    },
    inputValue: {
      table: {
        disable: true
      }
    },
    defaultInputValue: {
      table: {
        disable: true
      }
    },
    defaultSelectedKey: {
      table: {
        disable: true
      }
    },
    selectedKey: {
      table: {
        disable: true
      }
    },
    onInputChange: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    onBlur: {
      table: {
        disable: true
      }
    },
    onFocus: {
      table: {
        disable: true
      }
    },
    label: {
      control: 'text'
    },
    'aria-label': {
      control: 'text'
    },
    isDisabled: {
      control: 'boolean'
    },
    isQuiet: {
      control: 'boolean'
    },
    isReadOnly: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    },
    isRequired: {
      control: 'boolean'
    },
    necessityIndicator: {
      control: 'select',
      options: ['icon', 'label']
    },
    labelAlign: {
      control: 'select',
      options: ['end', 'start']
    },
    labelPosition: {
      control: 'select',
      options: ['top', 'side']
    },
    loadingState: {
      control: 'select',
      options: ['idle', 'loading', 'loadingMore', 'filtering']
    },
    validationState: {
      control: 'select',
      options: [null, 'valid', 'invalid']
    },
    description: {
      control: 'text'
    },
    errorMessage: {
      control: 'text'
    },
    menuTrigger: {
      control: 'select',
      options: ['focus', 'manual']
    },
    direction: {
      control: 'radio',
      options: ['top', 'bottom']
    },
    align: {
      control: 'radio',
      options: ['start', 'end']
    },
    width: {
      control: {
        type: 'radio',
        options: [null, '100px', '480px', 'size-4600']
      }
    },
    menuWidth: {
      control: {
        type: 'radio',
        options: [null, '100px', '480px', 'size-4600']
      }
    }
  }
} as ComponentMeta<typeof SearchAutocomplete>;

let items = [
  {id: 1, name: 'Aerospace'},
  {id: 2, name: 'Mechanical'},
  {id: 3, name: 'Civil'},
  {id: 4, name: 'Biomedical'},
  {id: 5, name: 'Nuclear'},
  {id: 6, name: 'Industrial'},
  {id: 7, name: 'Chemical'},
  {id: 8, name: 'Agricultural'},
  {id: 9, name: 'Electrical'}
];

export const Default: SearchAutocompleteStory = {
  name: 'static items'
};

export const Dynamic: SearchAutocompleteStory = {
  args: {defaultItems: items},
  render: (args) => (
    <SearchAutocomplete defaultItems={items} {...args}>
      {(item: any) => <Item>{item.name}</Item>}
    </SearchAutocomplete>
  ),
  name: 'dynamic items'
};

export const NoItems: SearchAutocompleteStory = {
  ...Dynamic,
  args: {defaultItems: []},
  name: 'no items'
};

export const MappedItems: SearchAutocompleteStory = {
  render: (args) => (
    <SearchAutocomplete label="Search with Autocomplete" {...args}>
      {items.map((item) => (
        <Item key={item.id}>
          {item.name}
        </Item>
      ))}
    </SearchAutocomplete>
  ),
  name: 'with mapped items'
};


function CustomOnSubmit(props) {
  let [searchTerm, setSearchTerm] = React.useState('');

  let onSubmit = (value, key) => {
    if (value) {
      setSearchTerm(value);
    } else if (key) {
      let term = items.find(o => o.id === key)?.name;
      setSearchTerm(term ? term : '');
    }
  };

  return (
    <Flex direction="column">
      <SearchAutocomplete defaultItems={items} label="Search with Autocomplete" {...mergeProps(props, {onSubmit})}>
        {(item: any) => <Item>{item.name}</Item>}
      </SearchAutocomplete>
      <div>
        Search results for: {searchTerm}
      </div>
    </Flex>
  );
}

export const noVisibleLabel: SearchAutocompleteStory = {
  args: {label: undefined, 'aria-label': 'Search Autocomplete'},
  name: 'No visible label'
};

export const customOnSubmit: SearchAutocompleteStory = {
  render: (args) => <CustomOnSubmit {...args} />,
  name: 'custom onSubmit'
};

export const iconFilter: SearchAutocompleteStory = {
  args: {icon: <Filter />},
  name: 'icon: Filter'
};

export const iconNull: SearchAutocompleteStory = {
  args: {icon: null},
  name: 'icon: null'
};

export const WithAvatars: SearchAutocompleteStory = {
  args: {label: 'Search users'},
  render: (args) => (
    <SearchAutocomplete {...args}>
      <Item textValue="User 1">
        <Avatar src="https://i.imgur.com/kJOwAdv.png" />
        <Text>User 1</Text>
      </Item>
      <Item textValue="User 2">
        <Avatar src="https://i.imgur.com/kJOwAdv.png" />
        <Text>User 2</Text>
      </Item>
      <Item textValue="User 3">
        <Avatar src="https://i.imgur.com/kJOwAdv.png" />
        <Text>User 3</Text>
      </Item>
      <Item textValue="User 4">
        <Avatar src="https://i.imgur.com/kJOwAdv.png" />
        <Text>User 4</Text>
      </Item>
    </SearchAutocomplete>
  )
};

interface Character {
  name: string
}

function AsyncLoadingExample() {
  let list = useAsyncList<Character>({
    async load({signal, cursor, filterText}) {
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      // If no cursor is available, then we're loading the first page,
      // filtering the results returned via a query string that
      // mirrors the SearchAutocomplete input text.
      // Otherwise, the cursor is the next URL to load,
      // as returned from the previous page.
      let res = await fetch(cursor || `https://swapi.py4e.com/api/people/?search=${filterText}`, {signal});
      let json = await res.json();

      return {
        items: json.results,
        cursor: json.next
      };
    }
  });

  return (
    <SearchAutocomplete
      label="Star Wars Character Lookup"
      items={list.items}
      inputValue={list.filterText}
      onInputChange={list.setFilterText}
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}>
      {item => <Item key={item.name}>{item.name}</Item>}
    </SearchAutocomplete>
  );
}

export const AsyncList: SearchAutocompleteStory = {
  render: (args) => (
    <AsyncLoadingExample {...args} />
  )
};
