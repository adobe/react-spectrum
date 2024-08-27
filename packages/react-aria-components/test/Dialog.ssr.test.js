/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {screen, testSSR} from '@react-spectrum/test-utils-internal';

describe('Dialog SSR', function () {
  it('should render without errors', async function () {
    await testSSR(__filename, `
      import {Button, Dialog, DialogTrigger, Heading, Input, Label, Modal, TextField} from '../';

      <React.StrictMode>
        <DialogTrigger isOpen>
          <Button>Sign up…</Button>
          <Modal>
            <Dialog>
              {({ close }) => (
                <form>
                  <Heading slot="title">Sign up</Heading>
                  <TextField autoFocus>
                    <Label>First Name:</Label>
                    <Input />
                  </TextField>
                  <TextField>
                    <Label>Last Name:</Label>
                    <Input />
                  </TextField>
                  <Button onPress={close}>
                    Submit
                  </Button>
                </form>
              )}
            </Dialog>
          </Modal>
        </DialogTrigger>
      </React.StrictMode>
    `, () => {
      // Assert that server rendered stuff into the HTML.
      let dialog = screen.queryByRole('dialog');
      expect(dialog).toBeNull();
    });

    // Assert that hydrated UI matches what we expect.
    let dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});
