const fs = require('fs');

const colors = {
  '#486EC2': '--anatomy-gray-900',
  '#496EC2': '--anatomy-gray-800',
  '#4a6fc3': '--anatomy-gray-700',
  '#718dcf': '--anatomy-gray-600',
  '#a2b6e1': '--anatomy-gray-500',
  '#beccea': '--anatomy-gray-400',
  '#DAE2F4': '--anatomy-gray-300',
  '#E5EBF7': '--anatomy-gray-200',
  '#f4f6fc': '--anatomy-gray-100',
  '#FDFDFE': '--anatomy-gray-75',
  '#FFFFFF': '--anatomy-gray-50'
};

let contents = fs.readFileSync(process.argv[process.argv.length - 1], 'utf8');
contents = contents.replace(/"(#[0-9a-f]{3,6})"/gi, (_, m) => {
  let c = nearestColor(hexToRgb(m));
  if (c) {
    return '"var(' + c + ')"';
  } else {
    console.log(m);
    return m;
  }
});

contents = contents.replace(/(fill|stroke)="rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)"/g, (m, p, r, g, b, a) => {
  let color = {
    r: parseInt(r, 10),
    g: parseInt(g, 10),
    b: parseInt(b, 10)
  };
  let nearest = nearestColor(color);
  if (nearest) {
    return `${p}="var(${nearest})" ${p}-opacity="${a}"`;
  } else {
    console.log(m);
    return m;
  }
});

contents = contents.replace(/font-family="(.*?)"/g, 'font-family="Adobe-Clean"');

fs.writeFileSync(process.argv[process.argv.length - 1], contents);

// Distance between 2 colors (in RGB)
// https://stackoverflow.com/questions/23990802/find-nearest-color-from-a-colors-list
function distance(a, b) {
  return Math.sqrt(Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2));
}

// return nearest color from array
function nearestColor(target) {
  var lowest = Number.POSITIVE_INFINITY;
  var tmp;
  let res;
  for (let color in colors) {
    tmp = distance(target, hexToRgb(color))
    if (tmp < lowest) {
      lowest = tmp;
      res = color;
    };
  }
  return colors[res];

}

function hexToRgb(hex) {
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
