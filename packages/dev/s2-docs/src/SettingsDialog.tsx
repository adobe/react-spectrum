'use client';

import {ActionButton, Content, Dialog, DialogTrigger, Divider, Heading, Picker, PickerItem, Text, ToggleButton, ToggleButtonGroup} from '@react-spectrum/s2';
import {type ColorSchemePreference, type PackageManager, type StyleSolution, useSettings, type VanillaCSSTheme} from './SettingsContext';
import Contrast from '@react-spectrum/s2/icons/Contrast';
import DeviceDesktop from '@react-spectrum/s2/icons/DeviceDesktop';
import Lighten from '@react-spectrum/s2/icons/Lighten';
import React from 'react';
import SettingsIcon from '@react-spectrum/s2/icons/Settings';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const settingGroupStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8
});

const sectionStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 16
});

const sectionHeadingStyle = style({
  font: 'heading-xs',
  color: 'heading',
  marginBottom: 0,
  marginTop: 0
});

const settingsContainerStyle = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 24
});

const labelStyle = style({
  font: 'ui-sm',
  fontWeight: 'medium'
});

export function SettingsDialog() {
  let {
    colorScheme,
    setColorScheme,
    packageManager,
    setPackageManager,
    styleSolution,
    setStyleSolution,
    vanillaCSSTheme,
    setVanillaCSSTheme
  } = useSettings();

  return (
    <DialogTrigger>
      <ActionButton isQuiet size="XS">
        <SettingsIcon />
        <Text>Settings</Text>
      </ActionButton>
      <Dialog isDismissible>
        <Heading slot="title">Settings</Heading>
        <Content>
          <div className={settingsContainerStyle}>
            <section className={sectionStyle}>
              <h3 className={sectionHeadingStyle}>Global</h3>
              <div className={settingGroupStyle}>
                <span className={labelStyle}>Color scheme</span>
                <ToggleButtonGroup
                  aria-label="Color scheme"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([colorScheme])}
                  onSelectionChange={(keys) => {
                    let selected = [...keys][0] as ColorSchemePreference;
                    setColorScheme(selected);
                  }}>
                  <ToggleButton id="system">
                    <DeviceDesktop />
                    <Text>System</Text>
                  </ToggleButton>
                  <ToggleButton id="light">
                    <Lighten />
                    <Text>Light</Text>
                  </ToggleButton>
                  <ToggleButton id="dark">
                    <Contrast />
                    <Text>Dark</Text>
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className={settingGroupStyle}>
                <span className={labelStyle}>Package manager</span>
                <ToggleButtonGroup
                  aria-label="Package manager"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([packageManager])}
                  onSelectionChange={(keys) => {
                    let selected = [...keys][0] as PackageManager;
                    setPackageManager(selected);
                  }}>
                  <ToggleButton id="npm">
                    npm
                  </ToggleButton>
                  <ToggleButton id="yarn">
                    yarn
                  </ToggleButton>
                  <ToggleButton id="pnpm">
                    pnpm
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </section>

            <Divider />

            <section className={sectionStyle}>
              <h3 className={sectionHeadingStyle}>React Aria</h3>
              <div className={settingGroupStyle}>
                <span className={labelStyle}>Styling solution</span>
                <ToggleButtonGroup
                  aria-label="Styling solution"
                  selectionMode="single"
                  disallowEmptySelection
                  selectedKeys={new Set([styleSolution])}
                  onSelectionChange={(keys) => {
                    let selected = [...keys][0] as StyleSolution;
                    setStyleSolution(selected);
                  }}>
                  <ToggleButton id="Vanilla CSS">
                    Vanilla CSS
                  </ToggleButton>
                  <ToggleButton id="Tailwind">
                    Tailwind
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              {styleSolution === 'Vanilla CSS' && (
                <Picker
                  label="Vanilla CSS Theme"
                  value={vanillaCSSTheme}
                  onChange={(value) => setVanillaCSSTheme(value as VanillaCSSTheme)}>
                  <PickerItem id="indigo">Indigo</PickerItem>
                  <PickerItem id="blue">Blue</PickerItem>
                  <PickerItem id="cyan">Cyan</PickerItem>
                  <PickerItem id="turquoise">Turquoise</PickerItem>
                  <PickerItem id="green">Green</PickerItem>
                  <PickerItem id="yellow">Yellow</PickerItem>
                  <PickerItem id="orange">Orange</PickerItem>
                  <PickerItem id="red">Red</PickerItem>
                  <PickerItem id="pink">Pink</PickerItem>
                  <PickerItem id="purple">Purple</PickerItem>
                </Picker>
              )}
            </section>
          </div>
        </Content>
      </Dialog>
    </DialogTrigger>
  );
}
