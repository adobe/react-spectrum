// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Update to use new API', `
import {Tabs, TabList, TabPanels, Item} from '@adobe/react-spectrum';

<Tabs aria-label="History of Ancient Rome">
  <TabList>
    <Item key="FoR">Founding of Rome</Item>
    <Item key="MaR">Monarchy and Republic</Item>
    <Item key="Emp">Empire</Item>
  </TabList>
  <TabPanels>
    <Item key="FoR">
      Arma virumque cano, Troiae qui primus ab oris.
    </Item>
    <Item key="MaR">
      Senatus Populusque Romanus.
    </Item>
    <Item key="Emp">
      Alea jacta est.
    </Item>
  </TabPanels>
</Tabs>
`);

test('Remove isEmphasized', `
import {Tabs, TabList, TabPanels, Item} from '@adobe/react-spectrum';
let isEmphasized = true;
let props = {isEmphasized: true};
<div>
  <Tabs aria-label="History of Ancient Rome" isEmphasized>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" isEmphasized={true}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" isEmphasized={false}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" isEmphasized={isEmphasized}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" {...props}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
</div>
`);

test('Remove isQuiet', `
import {Tabs, TabList, TabPanels, Item} from '@adobe/react-spectrum';
let isQuiet = true;
let props = {isQuiet: true};
<div>
  <Tabs aria-label="History of Ancient Rome" isQuiet>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" isQuiet={true}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" isQuiet={false}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" isQuiet={isQuiet}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
  <Tabs aria-label="History of Ancient Rome" {...props}>
    <TabList>
      <Item key="FoR">Founding of Rome</Item>
      <Item key="MaR">Monarchy and Republic</Item>
      <Item key="Emp">Empire</Item>
    </TabList>
    <TabPanels>
      <Item key="FoR">
        Arma virumque cano, Troiae qui primus ab oris.
      </Item>
      <Item key="MaR">
        Senatus Populusque Romanus.
      </Item>
      <Item key="Emp">
        Alea jacta est.
      </Item>
    </TabPanels>
  </Tabs>
</div>
`);

test('Move items from Tabs to TabList', `
import {Tabs, TabList, TabPanels, Item} from '@adobe/react-spectrum';

let items = [
  {name: 'Tab 1', children: 'Tab Body 1'},
  {name: 'Tab 2', children: 'Tab Body 2'},
  {name: 'Tab 3', children: 'Tab Body 3'},
  {name: 'Tab 4', children: 'Tab Body 4'},
  {name: 'Tab 5', children: 'Tab Body 5'},
  {name: 'Tab 6', children: 'Tab Body 6'}
];

<Tabs aria-label="Dynamic tabs" items={tabs}>
  <TabList>
    {(item) => (
      <Item key={item.name}>
        {item.name}
      </Item>
    )}
  </TabList>
  <TabPanels>
    {(item) => (
      <Item key={item.name}>
        {item.children}
      </Item>
    )}
  </TabPanels>
</Tabs>
`);
