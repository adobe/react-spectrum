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
  AlertDialog,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  ColorWheel,
  ComboBox,
  ComboBoxItem,
  Content,
  ContextualHelp,
  Dialog,
  DialogContainer,
  DialogTrigger,
  Divider,
  DropZone,
  Footer,
  Form,
  Header,
  Heading,
  IllustratedMessage,
  Image,
  InlineAlert,
  Keyboard,
  Link,
  LinkButton,
  Menu,
  MenuItem,
  MenuTrigger,
  Meter,
  NumberField,
  Picker,
  PickerItem,
  ProgressBar,
  ProgressCircle,
  Radio,
  RadioGroup,
  RangeSlider,
  SearchField,
  Slider,
  StatusLight,
  SubmenuTrigger,
  Switch,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tag,
  TagGroup,
  Text,
  TextArea,
  TextField,
  ToggleButton,
  Tooltip,
  TooltipTrigger,
} from "@react-spectrum/s2";
import Edit from "@react-spectrum/s2/icons/Edit";
import Cloud from "@react-spectrum/s2/illustrations/linear/Cloud";
import DropToUpload from "@react-spectrum/s2/illustrations/linear/DropToUpload";
import Section from "./components/Section";
import { style } from "@react-spectrum/s2/style" with { type: "macro" };

function App() {
  let [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <main>
      <Heading
        styles={style({ font: "heading-xl", textAlign: "center" })}
        level={1}
      >
        Spectrum 2 + Parcel
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

        <Section title="Color">
          <ColorField label="Primary Color" />
          <ColorSwatchPicker>
            <ColorSwatch color="#A00" />
            <ColorSwatch color="#f80" />
            <ColorSwatch color="#080" />
            <ColorSwatch color="#08f" />
            <ColorSwatch color="#088" />
            <ColorSwatch color="#008" />
          </ColorSwatchPicker>
          <ColorSlider defaultValue="#7f0000" channel="red" />
          <ColorArea defaultValue="#7f0000" />
          <ColorWheel defaultValue="hsl(30, 100%, 50%)" />
        </Section>

        <Section title="Drag and Drop">
          <DropZone>
            <IllustratedMessage>
              <DropToUpload />
              <Heading>Drag and drop your file</Heading>
              <Content>Or, select a file from your computer</Content>
            </IllustratedMessage>
          </DropZone>
        </Section>

        <Section title="Forms">
          <Form
            styles={style({
              maxWidth: 288,
            })}
          >
            <CheckboxGroup label="Favorite sports">
              <Checkbox value="soccer">Soccer</Checkbox>
              <Checkbox value="baseball">Baseball</Checkbox>
              <Checkbox value="basketball">Basketball</Checkbox>
            </CheckboxGroup>
            <NumberField label="Width" defaultValue={1024} minValue={0} />
            <RadioGroup label="Favorite pet">
              <Radio value="dogs">Dogs</Radio>
              <Radio value="cats">Cats</Radio>
            </RadioGroup>
            <SearchField label="Search" />
            <Switch>Low power mode</Switch>
            <TextArea label="Description" />
            <TextField label="Email" />
            <TextField label="Password" />
          </Form>
        </Section>

        <Section title="Navigation">
          <Breadcrumbs>
            <Breadcrumb id="home">Home</Breadcrumb>
            <Breadcrumb id="trendy">Trendy</Breadcrumb>
            <Breadcrumb id="march 2020 assets">March 2020 Assets</Breadcrumb>
          </Breadcrumbs>
          <Link
            href="https://www.imdb.com/title/tt6348138/"
            target="_blank"
            rel="noreferrer"
          >
            The missing link.
          </Link>
          <Link href="/foo">Foo</Link>
          <Tabs aria-label="History of Ancient Rome">
            <TabList>
              <Tab id="FoR">Founding of Rome</Tab>
              <Tab id="MaR">Monarchy and Republic</Tab>
              <Tab id="Emp">Empire</Tab>
            </TabList>
            <TabPanel id="FoR">
              Arma virumque cano, Troiae qui primus ab oris.
            </TabPanel>
            <TabPanel id="MaR">Senatus Populusque Romanus.</TabPanel>
            <TabPanel id="Emp">Alea jacta est.</TabPanel>
          </Tabs>
        </Section>

        <Section title="Overlays">
          <DialogTrigger>
            <ActionButton>Save</ActionButton>
            <AlertDialog
              title="Low Disk Space"
              variant="warning"
              primaryActionLabel="Confirm"
            >
              You are running low on disk space. Delete unnecessary files to
              free up space.
            </AlertDialog>
          </DialogTrigger>

          <ContextualHelp variant="info">
            <Heading>Need help?</Heading>
            <Content>
              <Text>
                If you are having issues accessing your account, contact our
                customer support team for help.
              </Text>
            </Content>
          </ContextualHelp>

          <ActionButton onPress={() => setIsDialogOpen(true)}>
            Show Dialog
          </ActionButton>
          <DialogContainer onDismiss={() => setIsDialogOpen(false)}>
            {isDialogOpen && (
              <AlertDialog
                title="Delete"
                variant="destructive"
                primaryActionLabel="Delete"
              >
                Are you sure you want to delete this item?
              </AlertDialog>
            )}
          </DialogContainer>

          <DialogTrigger>
            <ActionButton>Check connectivity</ActionButton>
            <Dialog>
              {(close) => (
                <>
                  <Heading>Internet Speed Test</Heading>
                  <Header>Connection status: Connected</Header>

                  <Content>
                    <Text>Start speed test?</Text>
                  </Content>
                  <ButtonGroup>
                    <Button variant="secondary" onPress={close}>
                      Cancel
                    </Button>
                    <Button variant="accent" onPress={close}>
                      Confirm
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </Dialog>
          </DialogTrigger>

          <DialogTrigger type="popover">
            <ActionButton>Disk Status</ActionButton>
            <Dialog>
              <Heading>C://</Heading>

              <Content>
                <Text>50% disk space remaining.</Text>
              </Content>
            </Dialog>
          </DialogTrigger>

          <TooltipTrigger>
            <ActionButton aria-label="Edit Name">
              <Edit />
            </ActionButton>
            <Tooltip>Change Name</Tooltip>
          </TooltipTrigger>
        </Section>

        <Section title="Pickers">
          <ComboBox label="Favorite Animal">
            <ComboBoxItem id="red panda">Red Panda</ComboBoxItem>
            <ComboBoxItem id="cat">Cat</ComboBoxItem>
            <ComboBoxItem id="dog">Dog</ComboBoxItem>
            <ComboBoxItem id="aardvark">Aardvark</ComboBoxItem>
            <ComboBoxItem id="kangaroo">Kangaroo</ComboBoxItem>
            <ComboBoxItem id="snake">Snake</ComboBoxItem>
          </ComboBox>

          <Picker label="Choose frequency">
            <PickerItem id="rarely">Rarely</PickerItem>
            <PickerItem id="sometimes">Sometimes</PickerItem>
            <PickerItem id="always">Always</PickerItem>
          </Picker>
        </Section>

        <Section title="Sliders">
          <RangeSlider label="Range" defaultValue={{ start: 12, end: 36 }} />

          <Slider label="Cookies to buy" defaultValue={12} />
        </Section>

        <Section title="Status">
          <Badge variant="positive">Badge</Badge>

          <Meter label="Storage space" variant="positive" value={35} />

          <ProgressBar label="Loading…" value={50} />

          <ProgressBar label="Loading…" isIndeterminate />

          <ProgressCircle aria-label="Loading…" value={50} />

          <ProgressCircle aria-label="Loading…" isIndeterminate />

          <StatusLight variant="positive">Ready</StatusLight>

          <TagGroup aria-label="Static TagGroup items example">
            <Tag>News</Tag>
            <Tag>Travel</Tag>
            <Tag>Gaming</Tag>
            <Tag>Shopping</Tag>
          </TagGroup>
          <InlineAlert>
            <Heading>Payment Information</Heading>
            <Content>
              Enter your billing address, shipping address, and payment method
              to complete your purchase.
            </Content>
          </InlineAlert>
        </Section>

        <Section title="Content">
          <Avatar
            src="https://i.imgur.com/kJOwAdv.png"
            alt="default Adobe avatar"
          />

          <AvatarGroup aria-label="Users">
            <Avatar
              src="https://i.imgur.com/kJOwAdv.png"
              alt="default Adobe avatar"
            />
            <Avatar
              src="https://i.imgur.com/kJOwAdv.png"
              alt="default Adobe avatar"
            />
            <Avatar
              src="https://i.imgur.com/kJOwAdv.png"
              alt="default Adobe avatar"
            />
            <Avatar
              src="https://i.imgur.com/kJOwAdv.png"
              alt="default Adobe avatar"
            />
          </AvatarGroup>

          <Content>Content is king</Content>

          <Footer>&copy; All rights reserved.</Footer>

          <Header>Cute cats</Header>

          <Heading level={4}>Edit</Heading>

          <IllustratedMessage>
            <Cloud />
            <Heading>No results</Heading>
            <Content>Try another search</Content>
          </IllustratedMessage>

          <Image src="https://i.imgur.com/Z7AzH2c.png" alt="Sky and roof" />

          <Keyboard>⌘V</Keyboard>

          <Text>Paste</Text>
        </Section>
      </div>
    </main>
  );
}

export default App;
