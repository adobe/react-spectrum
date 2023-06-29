import { createRoot } from "react-dom/client";
import { App } from './App';

let root = createRoot(document.getElementById('root'));
root.render(<App />);

// TODO: check on react-dom's version didn't work, figure out later
// The below is for when react 17 is installed
// import ReactDOM from 'react-dom';
// ReactDOM.render(
//   <App />, document.getElementById("root")
// )
