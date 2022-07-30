import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {useContextProps, WithRef} from './utils';

export const GroupContext = createContext<WithRef<HTMLAttributes<HTMLElement>, HTMLDivElement>>({});

function Group(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, GroupContext);
  return (
    <div {...props} ref={ref}>
      {props.children}
    </div>
  );
}

const _Group = forwardRef(Group);
export {_Group as Group};
