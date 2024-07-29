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

// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes divider', `
import {Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<Dialog>
  <Heading>Test</Heading>
  <Divider />
  <Content>Content</Content>
</Dialog>
`);

test('Moves close function from DialogTrigger to Dialog', `
import {DialogTrigger, Button, Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<DialogTrigger>
  <Button>Test</Button>
  {(close) => 
    <Dialog>
      <Heading>Test</Heading>
      <Divider />
      <Content>Content</Content>
    </Dialog>
  }
</DialogTrigger>
`);

test('bails when it cannot move the close function', `
import {DialogTrigger, Button, Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<DialogTrigger>
  <Button>Test</Button>
  {(close) => 
    <ReusableDialog />
  }
</DialogTrigger>
`);

test('Comments out type="tray"', `
import {DialogTrigger, ActionButton, Dialog, Heading, Divider, Content, Text} from '@adobe/react-spectrum';

<DialogTrigger type="tray">
  <ActionButton>Disk Status</ActionButton>
  <Dialog>
    50% disk space remaining.
  </Dialog>
</DialogTrigger>
`);


test('Comments out if type might be "tray"', `
import {DialogTrigger, ActionButton, Dialog, Heading, Divider, Content, Text} from '@adobe/react-spectrum';

<DialogTrigger type={true ? "tray" : "popover"}>
  <ActionButton>Disk Status</ActionButton>
  <Dialog>
    50% disk space remaining.
  </Dialog>
</DialogTrigger>
`);

test('Comments out mobileType', `
import {DialogTrigger, ActionButton, Dialog, Heading, Divider, Content, Text} from '@adobe/react-spectrum';

<>
  <DialogTrigger mobileType="tray">
    <ActionButton>Disk Status</ActionButton>
    <Dialog>
      50% disk space remaining.
    </Dialog>
  </DialogTrigger>
  <DialogTrigger mobileType={true ? "tray" : "fullscreen"}>
    <ActionButton>Disk Status</ActionButton>
    <Dialog>
      50% disk space remaining.
    </Dialog>
  </DialogTrigger>
</>
`);

test('Removes onDismiss and leaves a comment', `
import {DialogTrigger, Button, Dialog, Heading, Content, Divider} from '@adobe/react-spectrum';

<DialogTrigger>
  <Button>Test</Button>
  {(close) => 
    <Dialog onDismiss={close}>
      <Heading>Test</Heading>
      <Divider />
      <Content>Content</Content>
    </Dialog>
  }
</DialogTrigger>
`);
