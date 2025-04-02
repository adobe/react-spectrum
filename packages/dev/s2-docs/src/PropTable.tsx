import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { InterfaceType, renderHTMLfromMarkdown, setLinks } from "./types";
import React from 'react';

export function PropTable({component, links}) {
  setLinks(links);
  return (
    <>
      {component.description && <p className={style({font: 'body'})}>{renderHTMLfromMarkdown(component.description, {forceInline: false})}</p>}
      <InterfaceType properties={component.props.properties} showRequired isComponent name={component.name} />
    </>
  );
}
