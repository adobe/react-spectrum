import Head from "next/head";
import styles from "../styles/Home.module.css";
import React, { useState } from "react";
import {
  ActionMenu,
  Item,
  Menu,
  MenuTrigger,
  ListView,
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
  TimeField,
  Badge,
  LabeledValue,
  Picker,
  ActionButton,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Cell,
  Checkbox,
  CheckboxGroup,
  Column,
  Divider,
  Flex,
  Form,
  Heading,
  Image,
  Link,
  ListBox,
  LogicButton,
  NumberField,
  Radio,
  RadioGroup,
  Row,
  SearchField,
  Switch,
  TableBody,
  TableHeader,
  TableView,
  TabList,
  TabPanels,
  Tabs,
  Text,
  TextArea,
  TextField,
  ToggleButton,
  DialogTrigger,
  AlertDialog,
  ContextualHelp,
  Content,
  Dialog,
  Header,
  TooltipTrigger,
  Tooltip,
  ComboBox,
  RangeSlider,
  Slider,
  Meter,
  ProgressBar,
  ProgressCircle,
  StatusLight,
  Footer,
  IllustratedMessage,
  Keyboard,
  View,
  Well,
  DialogContainer,
  Avatar,
  TagGroup,
  InlineAlert,
  ColorArea,
  ColorField,
  ColorSlider,
  ColorWheel,
  ColorSwatchPicker,
  ColorSwatch,
  Accordion,
  Disclosure,
  DisclosureTitle,
  DisclosurePanel
} from "@adobe/react-spectrum";
import {AutocompleteExample} from "../components/AutocompleteExample";
import Edit from "@spectrum-icons/workflow/Edit";
import NotFound from "@spectrum-icons/illustrations/NotFound";
import Section from "../components/Section";
import ReorderableListView from "../components/ReorderableListView";
import {ToastQueue} from '@react-spectrum/toast';
import {SubmenuTrigger} from "@react-spectrum/menu";

let nestedItems = [
  {foo: 'Lvl 1 Foo 1', bar: 'Lvl 1 Bar 1', baz: 'Lvl 1 Baz 1', childRows: [
    {foo: 'Lvl 2 Foo 1', bar: 'Lvl 2 Bar 1', baz: 'Lvl 2 Baz 1', childRows: [
      {foo: 'Lvl 3 Foo 1', bar: 'Lvl 3 Bar 1', baz: 'Lvl 3 Baz 1'}
    ]},
    {foo: 'Lvl 2 Foo 2', bar: 'Lvl 2 Bar 2', baz: 'Lvl 2 Baz 2'}
  ]}
];

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

export default function Home() {
  let [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className={styles.container}>
      <Head>
        <title>React Spectrum + NextJS</title>
        <meta name="description" content="React Spectrum + NextJS" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Heading level={1}>
          React Spectrum +{" "}
          <Link>
            <a href="https://nextjs.org">Next.js</a>
          </Link>
        </Heading>

        <Flex direction="column" gap="size-125">
          <Section title="Buttons">
            <ButtonGroup>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <ActionButton>
                <Edit />
                <Text>Action Button</Text>
              </ActionButton>
              <LogicButton variant="and">Logic Button</LogicButton>
              <ToggleButton>Toggle Button</ToggleButton>
            </ButtonGroup>
          </Section>

          <Section title="Collections">
            <ActionMenu>
              <Item>Action Menu Item 1</Item>
              <Item>Action Menu Item 2</Item>
              <Item>Action Menu Item 3</Item>
            </ActionMenu>
            <ListBox width="size-2400" aria-label="Listbox">
              <Item>ListBox Item 1</Item>
              <Item>ListBox Item 2</Item>
              <Item>ListBox Item 3</Item>
            </ListBox>
            <ListView
              selectionMode="multiple"
              aria-label="Static ListView items example"
              maxWidth="size-6000"
            >
              <Item>Adobe Photoshop</Item>
              <Item>Adobe InDesign</Item>
              <Item>Adobe AfterEffects</Item>
              <Item>Adobe Illustrator</Item>
              <Item>Adobe Lightroom</Item>
            </ListView>
            <ReorderableListView />
            <MenuTrigger>
              <ActionButton>Menu</ActionButton>
              <Menu onAction={(key) => ToastQueue.positive(key.toString())}>
                <Item key="cut">Cut</Item>
                <Item key="copy">Copy</Item>
                <Item key="paste">Paste</Item>
                <Item key="replace">Replace</Item>
                <SubmenuTrigger>
                  <Item key="share">Share</Item>
                  <Menu onAction={(key) => ToastQueue.positive(key.toString())}>
                    <Item key="copy-ink">Copy Link</Item>
                    <SubmenuTrigger>
                      <Item key="email">Email</Item>
                      <Menu onAction={(key) => ToastQueue.positive(key.toString())}>
                        <Item key="attachment">Email as Attachment</Item>
                        <Item key="link">Email as Link</Item>
                      </Menu>
                    </SubmenuTrigger>
                    <Item key="sms">SMS</Item>
                  </Menu>
                </SubmenuTrigger>
                <Item key="delete">Delete</Item>
              </Menu>
            </MenuTrigger>
            <MenuTrigger>
              <ActionButton>Menu Trigger</ActionButton>
              <Menu>
                <Item href="/foo" routerOptions={{scroll: false}}>Link to /foo</Item>
                <Item>Cut</Item>
                <Item>Copy</Item>
                <Item>Paste</Item>
              </Menu>
            </MenuTrigger>
            <TableView
              aria-label="Example table with static contents"
              selectionMode="multiple"
            >
              <TableHeader>
                <Column>Name</Column>
                <Column>Type</Column>
                <Column align="end">Date Modified</Column>
              </TableHeader>
              <TableBody>
                <Row>
                  <Cell>Games</Cell>
                  <Cell>File folder</Cell>
                  <Cell>6/7/2020</Cell>
                </Row>
                <Row>
                  <Cell>Program Files</Cell>
                  <Cell>File folder</Cell>
                  <Cell>4/7/2021</Cell>
                </Row>
                <Row>
                  <Cell>bootmgr</Cell>
                  <Cell>System file</Cell>
                  <Cell>11/20/2010</Cell>
                </Row>
                <Row>
                  <Cell>log.txt</Cell>
                  <Cell>Text Document</Cell>
                  <Cell>1/18/2016</Cell>
                </Row>
              </TableBody>
            </TableView>
            <TableView aria-label="example table with nested rows" UNSTABLE_allowsExpandableRows width={500} height={200} >
              <TableHeader columns={columns}>
                {column => <Column>{column.name}</Column>}
              </TableHeader>
              <TableBody items={nestedItems}>
                {(item: any) =>
                  (<Row key={item.foo} UNSTABLE_childItems={item.childRows}>
                    {(key) => {
                      return <Cell>{item[key.toString()]}</Cell>;
                    }}
                  </Row>)
                }
              </TableBody>
            </TableView>
            <AutocompleteExample />
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

          <Section title="Date and Time">
            <Calendar aria-label="Event date" />

            <DateField label="Event date" />

            <DatePicker label="Event date" />

            <DateRangePicker label="Date range" />

            <RangeCalendar aria-label="Trip dates" />

            <TimeField label="Event time" />
          </Section>

          <Section title="Forms">
            <Form maxWidth="size-3600">
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
              <Item key="home">Home</Item>
              <Item key="trendy">Trendy</Item>
              <Item key="march 2020 assets">March 2020 Assets</Item>
            </Breadcrumbs>

            <Link
              href="https://www.imdb.com/title/tt6348138/"
              target="_blank"
              rel="noreferrer">
              The missing link.
            </Link>
            <Link href="/foo">Foo</Link>

            <Tabs aria-label="History of Ancient Rome">
              <TabList>
                <Item key="FoR">Founding of Rome</Item>
                <Item key="MaR">Monarchy and Republic</Item>
                <Item key="Emp">Empire</Item>
              </TabList>
              <TabPanels>
                <Item key="FoR">
                  Arma virumque cano, Troiae qui primus ab oris.
                </Item>
                <Item key="MaR">Senatus Populusque Romanus.</Item>
                <Item key="Emp">Alea jacta est.</Item>
              </TabPanels>
            </Tabs>

            <h3>Accordion</h3>
            <Accordion>
              <Disclosure id="files">
                <DisclosureTitle>
                  Files
                </DisclosureTitle>
                <DisclosurePanel>
                  <p>Files content</p>
                </DisclosurePanel>
              </Disclosure>
              <Disclosure id="people">
                <DisclosureTitle>
                  People
                </DisclosureTitle>
                <DisclosurePanel>
                  <p>People content</p>
                </DisclosurePanel>
              </Disclosure>
            </Accordion>

            <h3>Disclosure</h3>
            <Disclosure>
              <DisclosureTitle>System Requirements</DisclosureTitle>
              <DisclosurePanel>
                <p>Details about system requirements here.</p>
              </DisclosurePanel>
            </Disclosure>
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
              {(close) => (
                <Dialog>
                  <Heading>Internet Speed Test</Heading>
                  <Header>Connection status: Connected</Header>
                  <Divider />
                  <Content>
                    <Text>Start speed test?</Text>
                  </Content>
                  <ButtonGroup>
                    <Button variant="secondary" onPress={close}>
                      Cancel
                    </Button>
                    <Button variant="cta" onPress={close}>
                      Confirm
                    </Button>
                  </ButtonGroup>
                </Dialog>
              )}
            </DialogTrigger>

            <DialogTrigger type="popover">
              <ActionButton>Disk Status</ActionButton>
              <Dialog>
                <Heading>C://</Heading>
                <Divider />
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

            <Heading level={2}>Pickers</Heading>
            <Divider />

            <ComboBox label="Favorite Animal">
              <Item key="red panda">Red Panda</Item>
              <Item key="cat">Cat</Item>
              <Item key="dog">Dog</Item>
              <Item key="aardvark">Aardvark</Item>
              <Item key="kangaroo">Kangaroo</Item>
              <Item key="snake">Snake</Item>
            </ComboBox>

            <Picker label="Choose frequency">
              <Item key="rarely">Rarely</Item>
              <Item key="sometimes">Sometimes</Item>
              <Item key="always">Always</Item>
            </Picker>
          </Section>

          <Section title="Sliders">
            <RangeSlider label="Range" defaultValue={{ start: 12, end: 36 }} />

            <Slider label="Cookies to buy" defaultValue={12} />
          </Section>

          <Section title="Status">
            <Badge variant="positive">Badge</Badge>

            <LabeledValue label="Labeled Value" value="Budget.xls" />

            <Meter label="Storage space" variant="positive" value={35} />

            <ProgressBar label="Loading…" value={50} />

            <ProgressBar label="Loading…" isIndeterminate />

            <ProgressCircle aria-label="Loading…" value={50} />

            <ProgressCircle aria-label="Loading…" isIndeterminate />

            <StatusLight variant="positive">Ready</StatusLight>

            <TagGroup aria-label="Static TagGroup items example">
              <Item>News</Item>
              <Item>Travel</Item>
              <Item>Gaming</Item>
              <Item>Shopping</Item>
            </TagGroup>
            <InlineAlert>
              <Heading>Payment Information</Heading>
              <Content>Enter your billing address, shipping address, and payment method to complete your purchase.</Content>
            </InlineAlert>
          </Section>

          <Section title="Content">
            <Avatar src="https://i.imgur.com/kJOwAdv.png" alt="default Adobe avatar" />

            <Content>Content is king</Content>

            <Flex direction="column" gap="size-125">
              <Text>Content above</Text>
              <Divider />
              <Text>Content below</Text>
            </Flex>

            <Footer>&copy; All rights reserved.</Footer>

            <Header>Cute cats</Header>

            <Heading level={4}>Edit</Heading>

            <IllustratedMessage>
              <NotFound />
              <Heading>No results</Heading>
              <Content>Try another search</Content>
            </IllustratedMessage>

            <Image src="https://i.imgur.com/Z7AzH2c.png" alt="Sky and roof" />

            <Keyboard>⌘V</Keyboard>

            <Text>Paste</Text>

            <View
              borderWidth="thin"
              borderColor="dark"
              borderRadius="medium"
              padding="size-250"
            >
              <TextField label="Name" />
            </View>

            <Well>
              Better a little which is well done, than a great deal imperfectly.
            </Well>
          </Section>
        </Flex>
      </main>
    </div>
  );
}
