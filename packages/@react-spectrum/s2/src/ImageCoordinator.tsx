import {Context, createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useReducer} from 'react';

interface ImageCoordinatorProps {
  children: ReactNode,
  timeout?: number,
  group?: ImageGroup
}

export type ImageGroup = Context<ImageGroupValue>;

interface ImageGroupValue {
  revealAll: boolean,
  register(url: string): void,
  unregister(url: string): void,
  load(url: string): void
}

const defaultContext: ImageGroupValue = {
  revealAll: true,
  register() {},
  unregister() {},
  load() {}
};

export const DefaultImageGroup = createContext<ImageGroupValue>(defaultContext);

export function createImageGroup(): ImageGroup {
  return createContext(defaultContext);
}

interface State {
  loadedAll: boolean,
  timedOut: boolean,
  loadStartTime: number,
  loaded: Map<string, boolean>
}

type Action = 
  | {type: 'register', url: string}
  | {type: 'unregister', url: string}
  | {type: 'load', url: string}
  | {type: 'timeout'};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'register': {
      if (state.loaded.get(action.url) !== false) {
        let loaded = new Map(state.loaded);
        loaded.set(action.url, false);
        return {
          loadedAll: false,
          // If we had previously loaded all items, then reset the timed out state
          // since this is the first item of a new batch.
          timedOut: state.loadedAll ? false : state.timedOut,
          loadStartTime: state.loadedAll ? Date.now() : state.loadStartTime,
          loaded
        };
      }
      return state;
    }
    case 'unregister': {
      if (state.loaded.has(action.url)) {
        let loaded = new Map(state.loaded);
        loaded.delete(action.url);
        return {
          loadedAll: isAllLoaded(loaded),
          timedOut: state.timedOut,
          loadStartTime: state.loadStartTime,
          loaded
        };
      }
      return state;
    }
    case 'load': {
      if (state.loaded.get(action.url) === false) {
        let loaded = new Map(state.loaded);
        loaded.set(action.url, true);
        return {
          loadedAll: isAllLoaded(loaded),
          timedOut: state.timedOut,
          loadStartTime: state.loadStartTime,
          loaded
        };
      }
      return state;
    }
    case 'timeout': {
      if (!state.loadedAll && !state.timedOut) {
        return {
          ...state,
          timedOut: true
        };
      }
      return state;
    }
    default:
      return state;
  }
}

function isAllLoaded(loaded: Map<string, boolean>) {
  for (let isLoaded of loaded.values()) {
    if (!isLoaded) {
      return false;
    }
  }
  return true;
}

export function ImageCoordinator(props: ImageCoordinatorProps) {
  // If we are already inside another ImageList, just pass
  // through children and coordinate loading at the root.
  let ctx = useContext(props.group || DefaultImageGroup);
  if (ctx !== defaultContext) {
    return props.children;
  }

  return <ImageCoordinatorRoot {...props} />;
}

function ImageCoordinatorRoot(props: ImageCoordinatorProps) {
  let {children, timeout = 5000, group = DefaultImageGroup} = props;
  let [{loadedAll, timedOut, loadStartTime}, dispatch] = useReducer(reducer, {
    loadedAll: true,
    timedOut: false,
    loadStartTime: 0,
    loaded: new Map()
  });
  
  let register = useCallback((url: string) => dispatch({type: 'register', url}), []);
  let unregister = useCallback((url: string) => dispatch({type: 'unregister', url}), []);
  let load = useCallback((url: string) => dispatch({type: 'load', url}), []);

  useEffect(() => {
    if (!loadedAll) {
      let timeoutId = setTimeout(() => {
        dispatch({type: 'timeout'});
      }, loadStartTime + timeout - Date.now());

      return () => clearTimeout(timeoutId);
    }
  }, [loadStartTime, loadedAll, timeout]);

  let revealAll = loadedAll || timedOut;
  return useMemo(() => (
    <group.Provider value={{revealAll, register, unregister, load}}>
      {children}
    </group.Provider>
  ), [group, children, revealAll, register, unregister, load]);
}
