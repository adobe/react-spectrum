import {Item, TabList, TabPanels, Tabs} from '@adobe/react-spectrum'
import TodoList from './TodoList';
import JournalList from './JournalList';

function BodyContent(){
    return(

      <Tabs aria-label="Different Productivity Tabs">
        <TabList>
          <Item key="TdL">To-do List</Item>
          <Item key="DJ">Daily Journal</Item>
        </TabList>
        <TabPanels>
          <Item key="TdL">
            <TodoList />
          </Item>
          <Item key="DJ">
              <JournalList />
          </Item>
        </TabPanels>
      </Tabs>
    )
}

export default BodyContent;