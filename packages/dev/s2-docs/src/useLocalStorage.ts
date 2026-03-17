import {useState, useSyncExternalStore} from 'react';

export function useLocalStorage(key: string, defaultValue: string): [string, (value: string) => void] {
  let [store] = useState(() => new Store(key, defaultValue));
  let value = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  return [value, store.setValue];
}

class Store {
  key: string;
  defaultValue: string;
  subscriptions: Set<() => void>;

  constructor(key: string, defaultValue: string) {
    this.key = 's2.' + key;
    this.defaultValue = defaultValue;
    this.subscriptions = new Set();
  }

  subscribe = (fn: () => void) => {
    if (!this.key) {
      return () => {};
    }

    let onStorage = (e: StorageEvent) => {
      if (e.key === this.key) {
        fn();
      }
    };

    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
    };
  };

  getSnapshot = () => {
    if (!this.key) {
      return this.defaultValue;
    }
    
    let search = new URLSearchParams(location.search);
    return search.get(this.key) ?? localStorage.getItem(this.key) ?? this.defaultValue;
  };

  getServerSnapshot = () => {
    return this.defaultValue;
  };

  setValue = (value: string) => {
    if (!this.key) {
      return;
    }

    let oldValue = this.getSnapshot();
    localStorage.setItem(this.key, value);

    let search = new URLSearchParams(location.search);
    if (search.has(this.key)) {
      search.set(this.key, value);
      let url = new URL('?' + search.toString(), location.href);
      history.replaceState(null, '', url.toString());
    }

    window.dispatchEvent(new StorageEvent('storage', {
      key: this.key,
      oldValue,
      newValue: value
    }));
  };
}
