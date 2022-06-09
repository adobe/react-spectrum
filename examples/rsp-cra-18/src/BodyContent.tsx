import {Item, TabList, TabPanels, Tabs} from '@adobe/react-spectrum'
import TodoList from './TodoList';
import JournalList from './JournalList';

function BodyContent(){
    return(

      <Tabs aria-label="History of Ancient Rome">
      <TabList>
        <Item key="FoR">To-do List</Item>
        <Item key="MaR">Daily Journal</Item>
      </TabList>
      <TabPanels>
        <Item key="FoR">
          <TodoList />
        </Item>
        <Item key="MaR">
            <JournalList />
        </Item>
      </TabPanels>
      </Tabs>

    )
}

export default BodyContent;