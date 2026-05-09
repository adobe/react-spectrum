import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {Item} from 'react-stately/Item';
import {
  AlertDialog,
  Badge,
  Button,
  Checkbox,
  Dialog,
  Heading,
  InlineAlert,
  ListBox,
  Meter,
  Modal,
  Picker,
  Popover,
  ProgressBar,
  Provider,
  Radio,
  RadioGroup,
  SearchField,
  StatusLight,
  Switch,
  Text,
  TextField,
  ToastContainer,
  ToastQueue,
  Tooltip,
  Tray,
  View,
  darkTheme,
  lightTheme
} from '@react-spectrum/native';

export default function App() {
  let [isDark, setDark] = useState(false);
  let [notificationsEnabled, setNotificationsEnabled] = useState(true);
  let [selectedPlan, setSelectedPlan] = useState('team');
  let [isModalOpen, setModalOpen] = useState(false);
  let [isTrayOpen, setTrayOpen] = useState(false);
  let [isAlertOpen, setAlertOpen] = useState(false);
  let [isPopoverOpen, setPopoverOpen] = useState(false);
  let [pickerValue, setPickerValue] = useState<string | null>(null);

  return (
    <Provider colorScheme={isDark ? 'dark' : 'light'} theme={isDark ? darkTheme : lightTheme}>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: isDark ? darkTheme.colors.background : lightTheme.colors.background,
          gap: 20,
          minHeight: '100%',
          padding: 24,
          paddingTop: 56
        }}>
        <View className="gap-200">
          <Heading level={1}>React Spectrum Native</Heading>
          <Text>
            Smoke app for the current Expo React Native package surface.
          </Text>
        </View>

        <View className="gap-300">
          <Button variant="accent" onPress={() => setDark(value => !value)}>
            {isDark ? 'Use light theme' : 'Use dark theme'}
          </Button>
          <Button variant="secondary">Secondary action</Button>
        </View>

        <View className="gap-300">
          <TextField
            label="Project name"
            defaultValue="Mobile design system"
            description="TextField uses the shared Field foundation."
          />
          <SearchField label="Search components" placeholder="Button, Switch, Meter" />
        </View>

        <View className="gap-300">
          <Checkbox defaultSelected description="Validates checkbox state and helper text.">
            Include accessibility states
          </Checkbox>
          <Switch isSelected={notificationsEnabled} onChange={setNotificationsEnabled}>
            Enable notifications
          </Switch>
        </View>

        <RadioGroup
          label="Plan"
          value={selectedPlan}
          onChange={setSelectedPlan}
          orientation="vertical">
          <Radio value="solo">Solo</Radio>
          <Radio value="team">Team</Radio>
          <Radio value="enterprise">Enterprise</Radio>
        </RadioGroup>

        <View className="gap-300">
          <ProgressBar label="Migration progress" value={42} showValueLabel />
          <Meter label="Coverage" value={68} showValueLabel variant="positive" />
        </View>

        <View className="gap-300">
          <Heading level={2}>Overlays</Heading>
          <Button onPress={() => setModalOpen(true)} variant="secondary">
            Open Modal
          </Button>
          <Button onPress={() => setTrayOpen(true)} variant="secondary">
            Open Tray
          </Button>
          <Button onPress={() => setAlertOpen(true)} variant="negative">
            Confirm destructive action
          </Button>
          <Button onPress={() => setPopoverOpen(true)} variant="secondary">
            Open Popover
          </Button>
          <Button
            onPress={() => ToastQueue.positive('Saved', {actionLabel: 'Undo'})}
            variant="primary">
            Show toast
          </Button>
          <Tooltip tip="Long-press for help">
            <Text>Press and hold here</Text>
          </Tooltip>
        </View>

        <View className="gap-300">
          <Heading level={2}>Collections</Heading>
          <Picker
            label="Colour scheme"
            onSelectionChange={key => setPickerValue(String(key))}
            placeholder="Select a scheme"
            selectedKey={pickerValue}>
            <Item key="light">Light</Item>
            <Item key="dark">Dark</Item>
            <Item key="system">System default</Item>
          </Picker>
          {pickerValue != null && (
            <Text>Selected: {pickerValue}</Text>
          )}
          <ListBox
            aria-label="Priority"
            onSelectionChange={keys => {}}
            selectionMode="multiple">
            <Item key="low">Low</Item>
            <Item key="medium">Medium</Item>
            <Item key="high">High</Item>
          </ListBox>
        </View>

        <InlineAlert heading="Step 12 done" variant="positive">
          ListBox and Picker wired with react-stately. Menu, Tabs, ComboBox, and Table remain stubs.
        </InlineAlert>

        <View className="flex-row flex-wrap gap-200">
          <Badge variant="accent">alpha</Badge>
          <StatusLight variant="positive">Overlay foundation landed</StatusLight>
        </View>

        <Modal isOpen={isModalOpen} onOpenChange={setModalOpen}>
          <Heading level={2}>Modal</Heading>
          <Text>Tap the scrim or hardware back to close.</Text>
          <Button onPress={() => setModalOpen(false)} variant="primary">
            Done
          </Button>
        </Modal>

        <Tray isOpen={isTrayOpen} onOpenChange={setTrayOpen}>
          <Heading level={2}>Tray</Heading>
          <Text>Bottom-anchored sheet.</Text>
          <Button onPress={() => setTrayOpen(false)} variant="secondary">
            Close
          </Button>
        </Tray>

        <AlertDialog
          cancelLabel="Cancel"
          isOpen={isAlertOpen}
          onOpenChange={setAlertOpen}
          onPrimaryAction={() => ToastQueue.negative('Deleted')}
          primaryActionLabel="Delete"
          title="Delete this project?"
          variant="destructive">
          This action cannot be undone.
        </AlertDialog>

        <Popover
          anchorRect={{height: 0, width: 0, x: 100, y: 600}}
          isOpen={isPopoverOpen}
          onOpenChange={setPopoverOpen}
          placement="top">
          <Text>Anchored to position (100, 600).</Text>
        </Popover>
      </ScrollView>
      <ToastContainer />
    </Provider>
  );
}
