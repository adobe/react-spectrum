import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {BackHandler, View} from 'react-native';

interface PortalEntry {
  children: ReactNode;
  dismissOnBack?: boolean;
  key: string;
  layer: number;
  onDismiss?: () => void;
}

export interface PortalMountOptions {
  dismissOnBack?: boolean;
  layer?: number;
  onDismiss?: () => void;
}

interface PortalContextValue {
  mount(key: string, children: ReactNode, options?: PortalMountOptions): void;
  unmount(key: string): void;
  entries: readonly PortalEntry[];
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({children}: {children?: ReactNode}) {
  let [entries, setEntries] = useState<PortalEntry[]>([]);
  let sortedEntries = useMemo(
    () => [...entries].sort((a, b) => a.layer - b.layer),
    [entries]
  );

  let unmount = useCallback((key: string) => {
    setEntries(current => current.filter(entry => entry.key !== key));
  }, []);

  let value = useMemo<PortalContextValue>(
    () => ({
      entries: sortedEntries,
      mount(key, portalChildren, options = {}) {
        setEntries(current => [
          ...current.filter(entry => entry.key !== key),
          {
            children: portalChildren,
            dismissOnBack: options.dismissOnBack,
            key,
            layer: options.layer ?? 0,
            onDismiss: options.onDismiss
          }
        ]);
      },
      unmount
    }),
    [sortedEntries, unmount]
  );

  useEffect(() => {
    if (sortedEntries.length === 0) {
      return;
    }

    let subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      let dismissible = [...sortedEntries].reverse().find(entry => entry.dismissOnBack);
      if (!dismissible) {
        return false;
      }

      dismissible.onDismiss?.();
      unmount(dismissible.key);
      return true;
    });

    return () => subscription.remove();
  }, [sortedEntries, unmount]);

  return (
    <PortalContext.Provider value={value}>
      {children}
      <View
        pointerEvents="box-none"
        style={{bottom: 0, left: 0, position: 'absolute', right: 0, top: 0}}>
        {sortedEntries.map(entry => (
          <React.Fragment key={entry.key}>{entry.children}</React.Fragment>
        ))}
      </View>
    </PortalContext.Provider>
  );
}

export function usePortal() {
  return useContext(PortalContext);
}
