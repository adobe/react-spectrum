/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
'use client';
import {Button} from 'tailwind-starter/Button';
import {CircleUser} from 'lucide-react';
import {Dialog, DialogTrigger, Heading} from 'react-aria-components';
import {Popover} from 'tailwind-starter/Popover';
import React from 'react';
import {TextField} from 'tailwind-starter/TextField';

export function FocusExample() {
  return (
    <div className="flex items-center justify-center h-full">
      <DialogTrigger>
        <Button variant="secondary" className="w-9 h-9 p-0" aria-label="Account"><CircleUser aria-hidden className="inline w-5 h-5" /></Button>
        <Popover showArrow className="w-[250px]">
          <Dialog className="outline outline-0 p-4 overflow-auto flex flex-col gap-2">
            <Heading slot="title" className="text-lg font-semibold m-0 mb-2">Your Account</Heading>
            <TextField label="First Name" defaultValue="Devon" autoFocus={navigator.maxTouchPoints === 0} />
            <TextField label="Last Name" defaultValue="Govett" />
          </Dialog>
        </Popover>
      </DialogTrigger>
    </div>
  );
}
