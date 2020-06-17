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

import {Cell, Column, Row, Table, TableBody, TableHeader} from '@react-spectrum/table';
import js from 'highlight.js/lib/languages/javascript';
import Lowlight from 'react-lowlight';
import React, {useEffect, useState} from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

Lowlight.registerLanguage('js', js);

let columns = [
  {name: 'Name', key: 'name', width: '20%'},
  {name: 'Icon', key: 'icon', width: '10%'},
  {name: 'Import', key: 'import', width: '70%'}
];

const icons = {
  workflow: {
    // @ts-ignore
    import: () => import('@adobe/spectrum-css-workflow-icons'),
    importTemplate: name => {
      // Add _ to the icon name import if it starts with a number
      let defaultExport = name.match(/^\d/) ? `_${name}` : name;
      return `import ${defaultExport} from '@spectrum-icons/workflow/${name}';`;
    },
    srcTemplate: name => `https://spectrum.adobe.com/static/icons/workflow_18/Smock_${name}_18_N.svg`
  }
};

function debounce(func, wait) {
  let timeout;
  return function () {
    let later = () => func.apply(this, arguments);
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default function IconTable(props: {iconPackage: string}) {
  let [tableState, setTableState] = useState({items: [], originalItems: [], loading: false});

  function onSearchClear() {
    setTableState(Object.assign({}, tableState, {items: [...tableState.originalItems], loading: false}));
  }

  const onSearch = debounce((value) => {
    setTableState(Object.assign({}, tableState, {
      loading: false,
      items: tableState.originalItems.filter(oi => oi.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
    }));
  }, 400);

  useEffect(() => {
    const packageMeta = icons[props.iconPackage];
    packageMeta.import().then(i => {
      let originalItems = i.map(name => {
        name = name.split('.')[0];
        return {
          name,
          icon: <img alt={`${name} icon`} src={packageMeta.srcTemplate(name)} width={36} height={36} />,
          import: <Lowlight language="js" value={packageMeta.importTemplate(name)} inline className={typographyStyles['spectrum-Code4']} />
        };
      });
      setTableState({items: [...originalItems], loading: false, originalItems});
    });
  }, [props.iconPackage]);

  return (
    <>
      <SearchField
        aria-label="Find an icon"
        defaultValue=""
        placeholder="Find an icon"
        onClear={onSearchClear}
        onChange={onSearch}
        marginBottom="20px" />
      <Table width="100%" height={500} selectionMode="none">
        <TableHeader columns={columns} columnKey="key">
          {column => <Column width={column.width}>{column.name}</Column>}
        </TableHeader>
        <TableBody items={tableState.items} isLoading={tableState.loading} itemKey="name">
          {item => <Row>{key => <Cell>{item[key]}</Cell>}</Row>}
        </TableBody>
      </Table>
    </>
  );
}
