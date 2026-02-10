'use client';
import { Tag, TagGroup } from "@react-spectrum/s2";
import { Resizable } from "./DarkMode";
import { useRef } from "react";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

let items: any[] = [];
for (let i = 0; i < 100; i++) {
  items.push({id: i, name: 'Item ' + i});
}

export function Collapsing() {
  let containerRef = useRef(null);
  return (
    <div ref={containerRef} className={style({position: 'relative'})}>
      <Resizable containerRef={containerRef}>
        <TagGroup aria-label="Collapsible tags" items={items} maxRows={2}>
          {item => <Tag>{item.name}</Tag>}
        </TagGroup>
      </Resizable>
    </div>
  )
}
