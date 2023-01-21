import './App.css';
import {Provider, defaultTheme} from '@adobe/react-spectrum'
import Lighting from './Lighting';
import {useState} from 'react'
import BodyContent from './BodyContent';

function App() {
  let [selected, setSelection] = useState(false);

  return (
    <Provider theme={defaultTheme}
              colorScheme={selected ? "light" : "dark"}
              height="100%">
      <div className="content-padding">
        <Lighting selected={selected} switch={setSelection} />
        <BodyContent />
      </div>
    </Provider>
  );
}

export default App;
