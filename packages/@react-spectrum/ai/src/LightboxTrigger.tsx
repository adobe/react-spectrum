/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createContext, ReactNode, useState} from 'react';
import {Key} from '@react-types/shared';

export interface LightboxTriggerProps {
  children: ReactNode;
}

export interface LightboxTriggerContextProps {
  onAction?: (key: Key) => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  activeKey?: Key | undefined;
  setActiveKey?: (key: Key) => void;
}

export const LightboxTriggerContext = createContext<LightboxTriggerContextProps | null>(null);

export function LightboxTrigger(props: LightboxTriggerProps) {
  let [isOpen, setIsOpen] = useState<boolean>(false);
  let [activeKey, setActiveKey] = useState<Key | undefined>(undefined);

  let onAction = (key: Key) => {
    setActiveKey(key);
    setIsOpen(true);
  };

  return (
    <LightboxTriggerContext.Provider value={{isOpen, setIsOpen, onAction, activeKey, setActiveKey}}>
      {props.children}
    </LightboxTriggerContext.Provider>
  );
}
