/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ProviderContext} from '@react-types/provider';
import React from 'react';

// Context is placed in a separate file to avoid fast refresh issue where the old provider context values
// are immediately replaced with the null default. Stopgap solution until we fix this in parcel.
export const Context = React.createContext<ProviderContext | null>(null);
Context.displayName = 'ProviderContext';
