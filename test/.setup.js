import {jsdom} from 'jsdom';
import {Module} from 'module';
import path from 'path';
import configure from 'enzyme-adapter-react-helper';

const exposedProperties = [ 'window', 'navigator', 'document' ];

global.document = jsdom('<html><body></body></html>', {features: {QuerySelector: true}});
global.window = document.defaultView;
Object.keys(document.defaultView).forEach(property => {
  if (typeof global[property] === 'undefined') {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

// Override require resolution so icons work without copying them into src/
var oldResolveFilename = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain) {
  if (/Icon\/([^\/\.]+)$/.test(request)) {
    request = '@react/react-spectrum-icons/dist/' + path.basename(request);
  } else if (/\.\.\/js\/Icon/.test(request)) {
    request = path.resolve(__dirname + '/../src/Icon/js/Icon.js');
  }

  return oldResolveFilename.call(this, request, parent, isMain);
};

configure();
