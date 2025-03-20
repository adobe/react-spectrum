'use client';

import { Breadcrumb, Breadcrumbs, DialogTrigger, Popover } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import React, { createContext, useContext, useState } from 'react';
import { ColorLink } from "./Link";

const TypeLinkContext = createContext(null);

export function TypeLink({name, children}) {
  let [breadcrumbs, setBreadcrumbs] = useState([{id: 0, name, children}]);
  let ctx = useContext(TypeLinkContext);

  if (ctx) {
    return (
      <ColorLink onPress={() => ctx.push(name, children)}>{name}</ColorLink>
    );
  }
  
  let cur = breadcrumbs.at(-1)!;
  let push = (name, children) => {
    setBreadcrumbs(breadcrumbs => [...breadcrumbs, {id: breadcrumbs.length, name, children}]);
  }

  return (
    <DialogTrigger>
      <ColorLink className={style({color: 'red-1000'})}>{name}</ColorLink>
      <Popover styles={style({maxWidth: 600})}>
        <div className={style({padding: 12})}>
          <Breadcrumbs
            size="L"
            items={breadcrumbs}
            onAction={id => setBreadcrumbs(breadcrumbs.slice(0, id + 1))}
            styles={style({marginBottom: 16})}>
            {item => <Breadcrumb>{item.name}</Breadcrumb>}
          </Breadcrumbs>
          <TypeLinkContext.Provider value={{push}}>
            {cur.children}
          </TypeLinkContext.Provider>
        </div>
      </Popover>
    </DialogTrigger>
  );
}
