import "./shim";
import React, { createElement } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import foo from "./foo";
import Bar from "./bar";

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
