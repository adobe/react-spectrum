'use strict';

const React = require('react');
const RN = require('./react-native');

const passthrough = (Component) =>
  React.forwardRef(function (props, ref) {
    return React.createElement(Component, {...props, ref});
  });

const Animated = {
  View: passthrough(RN.View),
  Text: passthrough(RN.Text),
  ScrollView: passthrough(RN.ScrollView),
  Image: passthrough(RN.Image),
  createAnimatedComponent: (C) => passthrough(C)
};

const useSharedValue = (initial) => ({value: initial});
const useAnimatedStyle = (fn) => fn();
const useDerivedValue = (fn) => ({value: fn()});
const withTiming = (toValue) => toValue;
const withSpring = (toValue) => toValue;
const withDelay = (_, value) => value;
const withSequence = (...values) => values[values.length - 1];
const withRepeat = (value) => value;
const cancelAnimation = () => {};
const useAnimatedReaction = () => {};
const runOnJS = (fn) => fn;
const runOnUI = (fn) => fn;
const interpolate = (value) => value;
const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  in: (fn) => fn,
  out: (fn) => fn,
  inOut: (fn) => fn,
  bezier: () => (t) => t
};

module.exports = {
  __esModule: true,
  default: Animated,
  ...Animated,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  cancelAnimation,
  useAnimatedReaction,
  runOnJS,
  runOnUI,
  interpolate,
  Easing,
  Extrapolate: {CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity'}
};
