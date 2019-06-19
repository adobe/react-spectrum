let React = require('react');

module.exports = function(props) {
  return React.createElement('svg', props, React.createElement('path', {d: 'M 10,150 L 70,10 L 130,150 z'}));
};
