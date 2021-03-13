import React, { useState } from "react";
import useLocalStorage from "../../useLocalStorage";
import "./SidebarItem.css";

export default function SidebarItem(props: { name: string, selected?: boolean, indent: number, defaultOpen?: boolean, action?: any, children?: any }) {
    let { name, selected, defaultOpen, indent, action, ...rest } = props;
    let [open, setOpen] = useLocalStorage(name, false);
    action ??= () => setOpen(!open);
    return (
        <div className={"SidebarItem" + (selected ? " selected" : "")} style={{ paddingLeft: indent * 16 }} {...rest}>
            <div className="SidebarItem_Title" onClick={action}>
                { props.name }
            </div>
            {
                !open ? null : <div className="SidebarItem_Children">
                    { props.children }
                </div>
            }
        </div>
    )
}
