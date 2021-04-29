

import {
  ActionButton,
  Provider,
  defaultTheme,
  SearchField,
  Dialog,
  Content,
  DialogTrigger,
  TextField,
  Flex,
  View
} from "@adobe/react-spectrum";
import {
  Table,
  TableBody,
  TableHeader,
  Column,
  Row,
  Cell
} from "@react-spectrum/table";
import data from "./data.json";
import React, { useState } from "react";
import Info from "@spectrum-icons/workflow/Info";
import MoreSmall from "@spectrum-icons/workflow/MoreSmall";
import {storiesOf} from '@storybook/react';
import {usePress} from '@react-aria/interactions';
import {action} from '@storybook/addon-actions';

storiesOf('TableTest', module)
.add('app', () => {
  return App();
})
  .add('overflow', () => {
    return (
      <div style={{width: '60px'}}>
      <View minWidth={0}>
        <div style={{textOverflow: 'ellipsis'}}>asdfghjkjhgfdsfghjhgfd</div>
      </View>
        </div>
    )
  })
  .add('test', () => {

    function PortalExample(props) {
      let {elementType: ElementType = 'div', ...otherProps} = props;
      let {pressProps} = usePress(otherProps);
      return (
        <ElementType {...pressProps}
                     onKeyUp={action('onkeyup')}
                     onKeyDown={action('onkeydown')}
                     onFocus={action('onFocus')}
                     tabIndex="0">
          <DialogTrigger>
            <ActionButton>open</ActionButton>
            <Dialog>
              test
            </Dialog>
          </DialogTrigger>
        </ElementType>
      );
    }
    return (
      (
        <PortalExample
          onPressStart={e => {console.log(e.currentTarget); console.log(e.target); action('onpressstart')(e);}}
          onPressEnd={e => {console.log(e.currentTarget); console.log(e.target); action('onpresssend')(e);}}
          onPressChange={action('onpresschange')}
          onPress={action('onpress')}
          onPressUp={action('onpressup')} />
      )
    )
  });


function ItemActionButton({ children }) {
  return (
    <DialogTrigger>
      <ActionButton>{children}</ActionButton>
      <Dialog>
        <Content>
          <TextField label="Reply" />
        </Content>
      </Dialog>
    </DialogTrigger>
  );
}

export function App() {
  let [items, setItems] = useState(data.slice(0, 20));
  let contentMap = {
    name: (item) => item.name,
    info: (item) => (
      <ItemActionButton>
        <Info />
      </ItemActionButton>
    ),
    favorite: (item) => <div>fav</div>,
    more: (item) => (
      <ItemActionButton>
        <MoreSmall />
      </ItemActionButton>
    ),
    modified: (item) => item.modified, //.format('LLL'),
    opened: (item) => item.opened //.format('LLL'),
  };
  const cellRenderer = (item, columnKey) => {
    return <Cell>{item[columnKey]}</Cell>;

    let content = contentMap[columnKey]?.(item) ?? item[columnKey];

    return <Cell>{content}</Cell>;
  };

  let columns = [
    {
      key: "favorite",
      label: `favorite`,
      hideHeader: true,
      allowsToggle: false
    },
    {
      key: "name",
      label: `Name`,
      allowsToggle: false,
      minWidth: 400
    },
    {
      key: "info",
      label: `info`,
      hideHeader: true,
      allowsToggle: false
    },
    {
      key: "more",
      label: `more`,
      hideHeader: true,
      showDivider: true,
      allowsToggle: false
    },
    {
      key: "typeLabel",
      label: `Type`
    },
    {
      key: "tagLabel",
      label: `Tags`
    },
    {
      key: "projectRole",
      label: `Project Role`
    },
    {
      key: "reportSuiteLabel",
      label: `Report Suite`
    },
    {
      key: "ownerLabel",
      label: `Owner`
    },
    {
      key: "sharedWithLabel",
      label: `Shared With`
    },
    {
      key: "modified",
      label: `Last Modified`,
      isDate: true
    },
    {
      key: "opened",
      label: `Last Opened`,
      isDate: true
    }
  ];
  return (
    <Provider theme={defaultTheme}>
      <Flex direction="column">
        <SearchField />
        <SearchField
          onChange={(value) => {
            const newItems = data.filter((item) =>
              item.name.toLowerCase().includes(value.toLowerCase())
            );
            setItems(newItems);
          }}
        />
      </Flex>
      <Table height="800px" selectionMode="multiple">
        <TableHeader columns={columns}>
          {(column) => <Column key={column.key} minWidth={column.minWidth}>{column.label}</Column>}
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <Row key={item.id.substr(0, 10)}>
              {(columnKey) => cellRenderer(item, columnKey)}
            </Row>
          )}
        </TableBody>
      </Table>
    </Provider>
  );
}
