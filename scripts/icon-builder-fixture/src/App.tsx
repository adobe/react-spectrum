/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import '@react-spectrum/s2/page.css';
import {
  ActionButton,
  Text
} from '@react-spectrum/s2';
import AlignRight from '@react-spectrum/icon-library-test/AlignRight';
import ThreeD from '@react-spectrum/icon-library-test/S2_lin_3D_48';

function App() {
  return (
    <main>
      <ActionButton>
        <AlignRight />
        <Text>Action Button</Text>
      </ActionButton>
      <ThreeD />
    </main>
  );
}

export default App;
