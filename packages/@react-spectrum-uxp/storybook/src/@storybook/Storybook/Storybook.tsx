import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import "./Storybook.css";
import "../importStories";
import { Provider } from "@react-spectrum/provider";
import { theme as defaultTheme } from "@react-spectrum/theme-default";

export default function Storybook() {
    return (
        <Provider id="storybook" key="provider" theme={defaultTheme}>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Sidebar />
                <MainContent />
            </div>
        </Provider>
    )
}