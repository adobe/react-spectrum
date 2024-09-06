import tokens from '@adobe/spectrum-tokens/dist/json/variables.json' assert {type: 'json'};
import Color from 'colorjs.io';

const staticColors = {
  'static-blue': 'rgb(0, 87, 191)',
  'static-gray-50': 'rgb(255, 255, 255)',
  'static-gray-75': 'rgb(255, 255, 255)',
  'static-gray-100': 'rgb(255, 255, 255)',
  'static-gray-200': 'rgb(235, 235, 235)',
  'static-gray-300': 'rgb(217, 217, 217)',
  'static-gray-400': 'rgb(179, 179, 179)',
  'static-gray-500': 'rgb(146, 146, 146)',
  'static-gray-600': 'rgb(110, 110, 110)',
  'static-gray-700': 'rgb(71, 71, 71)',
  'static-gray-800': 'rgb(34, 34, 34)',
  'static-gray-900': 'rgb(0, 0, 0)',
  'static-blue-200': 'rgb(130, 193, 251)',
  'static-blue-300': 'rgb(98, 173, 247)',
  'static-blue-400': 'rgb(66, 151, 244)',
  'static-blue-500': 'rgb(27, 127, 245)',
  'static-blue-600': 'rgb(4, 105, 227)',
  'static-blue-700': 'rgb(0, 87, 190)',
  'static-blue-800': 'rgb(0, 72, 153)',
  'static-red-400': 'rgb(237, 64, 48)',
  'static-red-500': 'rgb(217, 28, 21)',
  'static-red-600': 'rgb(187, 2, 2)',
  'static-red-700': 'rgb(154, 0, 0)',
  'static-orange-400': 'rgb(250, 139, 26)',
  'static-orange-500': 'rgb(233, 117, 0)',
  'static-orange-600': 'rgb(209, 97, 0)',
  'static-orange-700': 'rgb(182, 80, 0)',
  'static-green-400': 'rgb(29, 169, 115)',
  'static-green-500': 'rgb(0, 148, 97)',
  'static-green-600': 'rgb(0, 126, 80)',
  'static-green-700': 'rgb(0, 105, 65)',
  'static-celery-200': 'rgb(126, 229, 114)',
  'static-celery-300': 'rgb(87, 212, 86)',
  'static-celery-400': 'rgb(48, 193, 61)',
  'static-celery-500': 'rgb(15, 172, 38)',
  'static-celery-600': 'rgb(0, 150, 20)',
  'static-celery-700': 'rgb(0, 128, 15)',
  'static-chartreuse-300': 'rgb(176, 222, 27)',
  'static-chartreuse-400': 'rgb(157, 203, 13)',
  'static-chartreuse-500': 'rgb(139, 182, 4)',
  'static-chartreuse-600': 'rgb(122, 162, 0)',
  'static-chartreuse-700': 'rgb(106, 141, 0)',
  'static-yellow-200': 'rgb(250, 237, 123)',
  'static-yellow-300': 'rgb(250, 224, 23)',
  'static-yellow-400': 'rgb(238, 205, 0)',
  'static-yellow-500': 'rgb(221, 185, 0)',
  'static-yellow-600': 'rgb(201, 164, 0)',
  'static-yellow-700': 'rgb(181, 144, 0)',
  'static-magenta-200': 'rgb(253, 127, 175)',
  'static-magenta-300': 'rgb(242, 98, 157)',
  'static-magenta-400': 'rgb(226, 68, 135)',
  'static-magenta-500': 'rgb(205, 40, 111)',
  'static-magenta-600': 'rgb(179, 15, 89)',
  'static-magenta-700': 'rgb(149, 0, 72)',
  'static-fuchsia-400': 'rgb(228, 93, 230)',
  'static-fuchsia-500': 'rgb(211, 63, 212)',
  'static-fuchsia-600': 'rgb(188, 39, 187)',
  'static-fuchsia-700': 'rgb(163, 10, 163)',
  'static-purple-400': 'rgb(178, 121, 250)',
  'static-purple-500': 'rgb(161, 93, 246)',
  'static-purple-600': 'rgb(142, 67, 234)',
  'static-purple-700': 'rgb(120, 43, 216)',
  'static-purple-800': 'rgb(98, 23, 190)',
  'static-indigo-200': 'rgb(178, 181, 255)',
  'static-indigo-300': 'rgb(155, 159, 255)',
  'static-indigo-400': 'rgb(132, 137, 253)',
  'static-indigo-500': 'rgb(109, 115, 246)',
  'static-indigo-600': 'rgb(87, 93, 232)',
  'static-indigo-700': 'rgb(68, 74, 208)',
  'static-seafoam-200': 'rgb(75, 206, 199)',
  'static-seafoam-300': 'rgb(32, 187, 180)',
  'static-seafoam-400': 'rgb(0, 166, 160)',
  'static-seafoam-500': 'rgb(0, 145, 139)',
  'static-seafoam-600': 'rgb(0, 124, 118)',
  'static-seafoam-700': 'rgb(0, 103, 99)',
};

function colorToken(token) {
  return {
    default: token.sets.light.value,
    dark: token.sets.dark.value
  };
}

function colorScale(scale) {
  let res = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token.replace('-color', '')] = colorToken(tokens[token]);
    }
  }
  return res;
}

const s2Colors = {
  ...colorScale('gray'),
  ...colorScale('blue'),
  ...colorScale('red'),
  ...colorScale('orange'),
  ...colorScale('yellow'),
  ...colorScale('chartreuse'),
  ...colorScale('celery'),
  ...colorScale('green'),
  ...colorScale('seafoam'),
  ...colorScale('cyan'),
  ...colorScale('indigo'),
  ...colorScale('purple'),
  ...colorScale('fuchsia'),
  ...colorScale('magenta'),
  ...colorScale('pink'),
  ...colorScale('turquoise'),
  ...colorScale('brown'),
  ...colorScale('silver'),
  ...colorScale('cinnamon'),
};

function buildMapping(colorScheme) {
  let mapping = {};
  for (let staticColor in staticColors) {
    let staticColorObject = new Color(staticColors[staticColor]);
    let closest = null;
    let closestDelta = Infinity;
    for (let s2Color in s2Colors) {
      let s2ColorObject = new Color(s2Colors[s2Color][colorScheme]);
      let delta = staticColorObject.distance(s2ColorObject, 'oklab');
      if (delta < closestDelta) {
        closestDelta = delta;
        closest = s2Color;
      }
    }
    mapping[staticColor] = closest;
  }
  return mapping;
}

let light = buildMapping('default');
let dark = buildMapping('dark');
let merged = {};
for (let key in light) {
  merged[key] = {
    default: light[key],
    dark: dark[key]
  };
}

console.log(merged)
