import './App.css';
import TodoList from './TodoList';
import {Provider, useProvider, defaultTheme} from '@adobe/react-spectrum'
import Lighting from './Lighting';
import React from 'react'
import {Footer} from '@adobe/react-spectrum'
import BodyContent from './BodyContent';
function App() {
  let [selected, setSelection] = React.useState(false);

  React.useEffect(() => {
    // document.body.style.backgroundColor = "##f5f5f5";

    return () => {
      // console.log("changed");
      document.body.style.backgroundColor = selected ? "#1e1e1e" : "#f5f5f5";
    };
  }, [selected]);

  return (
    // <Provider theme={defaultTheme} 
    //           colorScheme={selected ? "light" : "dark"}
    //           margin="size-600">
    //   <Lighting selected={selected} switch={setSelection}/>
    //   <TodoList />
    // </Provider>

    <Provider theme={defaultTheme} 
              colorScheme={selected ? "light" : "dark"}
              margin="size-600">
      <Lighting selected={selected} switch={setSelection}/>
      <BodyContent />
    </Provider>
  );
}

export default App;
