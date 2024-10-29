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

import React, { useState } from "react";
import "@react-spectrum/s2/page.css";
import {
  ActionButton,
  ActionMenu,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  LinkButton,
  Menu,
  MenuItem,
  MenuTrigger,
  SubmenuTrigger,
  Text,
  ToggleButton,
} from "@react-spectrum/s2";
import Edit from "@react-spectrum/s2/icons/Edit";
import Section from "./components/Section";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

const Lazy = React.lazy(() => import('./Lazy'));

function App() {
  let [isLazyLoaded, setLazyLoaded] = useState(false);
  return (
    <main>
      <Heading
        styles={style({ font: "heading-xl", textAlign: "center" })}
        level={1}
      >
        Spectrum 2 + Webpack
      </Heading>
      <div
        className={style({
          maxWidth: 288,
          margin: "auto",
        })}
      >
        <Divider />
      </div>
      <div
        className={style({
          display: "flex",
          flexDirection: "column",
          gap: 16,
          alignItems: "center"
        })}
      >
        <Section title="Buttons">
          <ButtonGroup>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <ActionButton>
              <Edit />
              <Text>Action Button</Text>
            </ActionButton>
            <ToggleButton>Toggle Button</ToggleButton>
            <LinkButton
              variant="primary"
              href="https://adobe.com"
              target="_blank"
            >
              Link Button
            </LinkButton>
          </ButtonGroup>
        </Section>

        <Section title="Collections">
          <ActionMenu>
            <MenuItem>Action Menu Item 1</MenuItem>
            <MenuItem>Action Menu Item 2</MenuItem>
            <MenuItem>Action Menu Item 3</MenuItem>
          </ActionMenu>
          <MenuTrigger>
            <ActionButton>Menu</ActionButton>
            <Menu onAction={(key) => alert(key.toString())}>
              <MenuItem id="cut">Cut</MenuItem>
              <MenuItem id="copy">Copy</MenuItem>
              <MenuItem id="paste">Paste</MenuItem>
              <MenuItem id="replace">Replace</MenuItem>
              <SubmenuTrigger>
                <MenuItem id="share">Share</MenuItem>
                <Menu onAction={(key) => alert(key.toString())}>
                  <MenuItem id="copy-ink">Copy Link</MenuItem>
                  <SubmenuTrigger>
                    <MenuItem id="email">Email</MenuItem>
                    <Menu onAction={(key) => alert(key.toString())}>
                      <MenuItem id="attachment">Email as Attachment</MenuItem>
                      <MenuItem id="link">Email as Link</MenuItem>
                    </Menu>
                  </SubmenuTrigger>
                  <MenuItem id="sms">SMS</MenuItem>
                </Menu>
              </SubmenuTrigger>
              <MenuItem id="delete">Delete</MenuItem>
            </Menu>
          </MenuTrigger>
          <MenuTrigger>
            <ActionButton>Menu Trigger</ActionButton>
            <Menu>
              <MenuItem href="/foo" routerOptions={{ scroll: false }}>
                Link to /foo
              </MenuItem>
              <MenuItem>Cut</MenuItem>
              <MenuItem>Copy</MenuItem>
              <MenuItem>Paste</MenuItem>
            </Menu>
          </MenuTrigger>
        </Section>

        {!isLazyLoaded && <ActionButton onPress={() => setLazyLoaded(true)}>Load more</ActionButton>}
        {isLazyLoaded && <React.Suspense fallback={<>Loading</>}>
          <Lazy />
        </React.Suspense>}
      </div>
    </main>
  );
}

export default App;
