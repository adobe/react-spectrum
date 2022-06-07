import './App.css';
import TodoList from './TodoList';
import {Provider, useProvider, defaultTheme} from '@adobe/react-spectrum'


function App() {
  return (
    <Provider theme={defaultTheme}>
      <TodoList />
    </Provider>
  );
}

export default App;
