import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {useContextProps, WithRef} from './utils';

export const GroupContext = createContext<WithRef<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Group(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, GroupContext);
  return (
    <div {...props} ref={ref as ForwardedRef<HTMLDivElement>}>
      {props.children}
    </div>
  );
}

const _Group = forwardRef(Group);
export {_Group as Group};
