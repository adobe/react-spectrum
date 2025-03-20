import { InterfaceType, setLinks } from "./types";
import React from 'react';

export function PropTable({component, links}) {
  setLinks(links);
  return <InterfaceType properties={component.props.properties} showRequired isComponent name={component.name} />;
}
