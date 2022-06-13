import './App.css';
import {Provider, defaultTheme} from '@adobe/react-spectrum'
import Lighting from './Lighting';
import React from 'react'
import BodyContent from './BodyContent';

function App() {
  let [selected, setSelection] = React.useState(false);

  // changes the background color of the document based on the status of 'selected'
  // React.useEffect(() => {
  //   document.body.style.backgroundColor = selected ? "#f5f5f5" : "#1e1e1e";

  //   return () => {
  //     document.body.style.backgroundColor = selected ? "#f5f5f5" : "#1e1e1e";
  //   };
  // }, [selected]);

  return (
    <Provider theme={defaultTheme} 
              colorScheme={selected ? "light" : "dark"}
              margin="size-600"
              height="100%">
      <Lighting selected={selected} switch={setSelection}/>
      <BodyContent />
    </Provider>
  );
}

export default App;
