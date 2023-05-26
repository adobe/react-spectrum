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
} from "@adobe/react-spectrum";
import Edit from "@spectrum-icons/workflow/Edit";
import NotFound from "@spectrum-icons/illustrations/NotFound";
import Section from "../components/Section";
import {
  ColorArea,
  ColorField,
  ColorSlider,
  ColorWheel,
} from "@react-spectrum/color";
import ReorderableListView from "../components/ReorderableListView";
import {TagGroup} from '@react-spectrum/tag';
import {ToastQueue} from '@react-spectrum/toast';

export default function Home() {
  let [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className={styles.container}>
      <Head>
        <title>React Spectrum + NextJS</title>
        <meta name="description" content="React Spectrum + NextJS" />
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
              <Menu onAction={(key) => ToastQueue.positive(key)}>
                <Item key="cut">Cut</Item>
                <Item key="copy">Copy</Item>
                <Item key="paste">Paste</Item>
                <Item key="replace">Replace</Item>
              </Menu>
            </MenuTrigger>
            <MenuTrigger>
              <ActionButton>Menu Trigger</ActionButton>
              <Menu>
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
          </Section>

          <Section title="Color">
            <ColorArea defaultValue="#7f0000" />
            <ColorField label="Primary Color" />
            <ColorSlider defaultValue="#7f0000" channel="red" />
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

            <Link>
              <a
                href="https://www.imdb.com/title/tt6348138/"
                target="_blank"
                rel="noreferrer"
              >
                The missing link.
              </a>
            </Link>

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
