import React from "react";
import { theme as defaultTheme } from "@react-spectrum/theme-default";
import { Provider } from "@react-spectrum/provider";
import Sample from "./Sample";
// import Storybook from "./@storybook/Storybook";
// import "./App.css";
// import Header from "./@storybook/Storybook/Header";

export default function App() {
    return (
        <Provider id="storybook" key="provider" theme={defaultTheme}>
            <Sample />
        </Provider>
    );

    // return [
    //     <Sample />
    //     // <Header />,
    //     // <Storybook key="storybook" />,
    // ]
}