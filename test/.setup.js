import {jsdom} from 'jsdom';

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
