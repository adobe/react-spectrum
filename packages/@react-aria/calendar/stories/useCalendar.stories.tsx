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

import {Example} from './Example';
import React from 'react';

export default {
  title: 'Date and Time/useCalendar'
};

export const Days3 = () => <Example visibleDuration={{days: 3}} />;

Days3.story = {
  name: 'days: 3'
};

export const Weeks1 = () => <Example visibleDuration={{weeks: 1}} />;

Weeks1.story = {
  name: 'weeks: 1'
};

export const Weeks2 = () => <Example visibleDuration={{weeks: 2}} />;

Weeks2.story = {
  name: 'weeks: 2'
};

export const Months1 = () => <Example visibleDuration={{months: 1}} />;

Months1.story = {
  name: 'months: 1'
};
