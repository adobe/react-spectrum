'use strict';

const React = require('react');

const passthroughHostFactory = (displayName) => {
  let Component = React.forwardRef(function (props, ref) {
    let {children, ...rest} = props;
    return React.createElement(displayName, {...rest, ref}, children);
  });
  Component.displayName = displayName;
  return Component;
};

const View = passthroughHostFactory('View');
const Text = passthroughHostFactory('Text');
const ScrollView = passthroughHostFactory('ScrollView');
const Image = passthroughHostFactory('Image');
const Modal = passthroughHostFactory('Modal');
const SafeAreaView = passthroughHostFactory('SafeAreaView');

const Pressable = React.forwardRef(function Pressable(props, ref) {
  let {children, ...rest} = props;
  return React.createElement(
    'Pressable',
    {...rest, ref},
    typeof children === 'function' ? children({pressed: false}) : children
  );
});
Pressable.displayName = 'Pressable';

const TextInput = React.forwardRef(function TextInput(props, ref) {
  return React.createElement('TextInput', {...props, ref});
});
TextInput.displayName = 'TextInput';

const Switch = React.forwardRef(function Switch(props, ref) {
  let {value, onValueChange, ...rest} = props;
  return React.createElement('Switch', {
    ...rest,
    value,
    onValueChange,
    ref
  });
});
Switch.displayName = 'Switch';

const StyleSheet = {
  create(styles) {
    return styles;
  },
  flatten(style) {
    if (Array.isArray(style)) {
      return style.reduce(
        (acc, item) => Object.assign(acc, StyleSheet.flatten(item) || {}),
        {}
      );
    }
    return style || {};
  },
  hairlineWidth: 1,
  absoluteFillObject: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}
};

const Platform = {
  OS: 'ios',
  Version: 17,
  select: (obj) => (obj.ios !== undefined ? obj.ios : obj.default),
  isPad: false,
  isTV: false
};

const Dimensions = {
  get: () => ({width: 375, height: 667, scale: 2, fontScale: 1}),
  addEventListener: () => ({remove: () => {}}),
  removeEventListener: () => {}
};

const Animated = {
  View,
  Text,
  ScrollView,
  Image,
  Value: class {
    constructor(v) {
      this.value = v;
    }
    setValue(v) {
      this.value = v;
    }
    interpolate() {
      return this;
    }
  },
  timing: () => ({start: (cb) => cb && cb({finished: true}), stop: () => {}}),
  spring: () => ({start: (cb) => cb && cb({finished: true}), stop: () => {}}),
  parallel: () => ({start: (cb) => cb && cb({finished: true}), stop: () => {}}),
  sequence: () => ({start: (cb) => cb && cb({finished: true}), stop: () => {}}),
  createAnimatedComponent: (C) => C,
  event: () => () => {}
};

const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
  bezier: () => (t) => t
};

const I18nManager = {
  isRTL: false,
  forceRTL: () => {},
  allowRTL: () => {},
  swapLeftAndRightInRTL: () => {}
};

const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(false),
  isScreenReaderEnabled: () => Promise.resolve(false),
  addEventListener: () => ({remove: () => {}}),
  removeEventListener: () => {},
  announceForAccessibility: () => {}
};

const BackHandler = {
  addEventListener: () => ({remove: () => {}}),
  removeEventListener: () => {},
  exitApp: () => {}
};

const Keyboard = {
  addListener: () => ({remove: () => {}}),
  removeListener: () => {},
  dismiss: () => {}
};

const NativeModules = {};

const Linking = {
  openURL: () => Promise.resolve(),
  canOpenURL: () => Promise.resolve(false),
  addEventListener: () => ({remove: () => {}}),
  removeEventListener: () => {}
};

const Appearance = {
  getColorScheme: () => 'light',
  addChangeListener: () => ({remove: () => {}})
};

const findNodeHandle = () => 1;

const UIManager = {
  measureInWindow: (_node, cb) => cb(0, 0, 0, 0)
};

module.exports = {
  AccessibilityInfo,
  Animated,
  Appearance,
  BackHandler,
  Dimensions,
  Easing,
  I18nManager,
  Image,
  Keyboard,
  Linking,
  Modal,
  NativeModules,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  UIManager,
  View,
  findNodeHandle
};
