import './App.css';
import {Provider, defaultTheme, Item} from '@adobe/react-spectrum'
import Lighting from './Lighting';
import {useState} from 'react'
import BodyContent from './BodyContent';
import {TagGroup} from '@react-spectrum/tag';

function App() {
  let [selected, setSelection] = useState(false);

  return (
    <Provider theme={defaultTheme}
              colorScheme={selected ? "light" : "dark"}
              height="100%">
      <div className="content-padding">
        <Lighting selected={selected} switch={setSelection}/>
        <TagGroup aria-label="Static TagGroup items example">
          <Item>News</Item>
          <Item>Travel</Item>
          <Item>Gaming</Item>
          <Item>Shopping</Item>
        </TagGroup>
        <BodyContent />
      </div>
    </Provider>
  );
}

export default App;
