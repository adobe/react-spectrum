import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

if (ReactDOM.version.startsWith('18')) {
  let ReactDOMClient = require('react-dom/client');
  const root = ReactDOMClient.createRoot(
    document.getElementById('root')
  );
  root.render(
      <App />
  );
} else {
  ReactDOM.render(
    <App />, document.getElementById("root")
  )
}
