'use strict';

const React = require('react');

const make = (name) => {
  let C = React.forwardRef(function (props, ref) {
    return React.createElement(name, {...props, ref});
  });
  C.displayName = name;
  return C;
};

const Svg = make('Svg');
const Circle = make('Circle');
const Rect = make('Rect');
const Path = make('Path');
const G = make('G');
const Line = make('Line');
const Polygon = make('Polygon');
const Polyline = make('Polyline');
const Defs = make('Defs');
const LinearGradient = make('LinearGradient');
const Stop = make('Stop');
const Ellipse = make('Ellipse');
const Text = make('SvgText');
const TSpan = make('TSpan');

module.exports = {
  __esModule: true,
  default: Svg,
  Svg,
  Circle,
  Rect,
  Path,
  G,
  Line,
  Polygon,
  Polyline,
  Defs,
  LinearGradient,
  Stop,
  Ellipse,
  Text,
  TSpan
};
