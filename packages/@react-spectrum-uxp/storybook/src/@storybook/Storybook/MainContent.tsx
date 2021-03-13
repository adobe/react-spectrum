import React from "react";
import "./MainContent.css";
import { components, getStory } from "../react";
import useSelectedStory from "../useSelectedStory";

export default function MainContent() {
    let [[componentName, storyName], setSelectedStory] = useSelectedStory();
    let story = getStory(componentName, storyName);
    return (
        <div className="MainContent">
            Hello Stuff Main Content.
            { story?.render() }
        </div>
    )
}