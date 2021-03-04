import React from "react";
import "./Sidebar.css";
import { useComponents } from "../react";
import useSelectedStory from "../useSelectedStory";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
    let [selectedStory, setSelectedStory] = useSelectedStory();
    let components = useComponents();
    return (
        <div className="Sidebar">
            {
                Array.from(components.values()).map(c => {
                    return [
                        <SidebarItem key={c.name} name={c.name} indent={0} defaultOpen={c.name === selectedStory[0]}>
                        {
                            Array.from(c.stories.values()).map(s => {
                                let story = [c.name, s.name];
                                let selected = JSON.stringify(selectedStory) === JSON.stringify(story);
                                return <SidebarItem
                                    key={c.name + ":" + s.name}
                                    selected={selected}
                                    name={s.name}
                                    indent={1}
                                    action={(() => {
                                        setSelectedStory(story);
                                    })}
                                />
                            })
                        }
                        </SidebarItem>
                    ]
                })
            }
        </div>
    )
}