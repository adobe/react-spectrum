import React from "react";
import { theme as defaultTheme } from "@react-spectrum/theme-default";
import { Provider } from "@react-spectrum/provider";
import Sample from "./Sample";
import Storybook from "./@storybook/Storybook";
import Header from "./@storybook/Storybook/Header";
import "./App.css";

export default function App() {
    return [
        <Header />,
        <Provider id="storybook" key="provider" theme={defaultTheme}>
            <Sample />
        </Provider>,
        <Storybook key="storybook" />,
    ]
}