import React from 'react';

const REACT_VERSION = React.version;
const REACT_MAJOR_VERSION = parseInt(REACT_VERSION.split('.')[0], 10);

export {REACT_VERSION, REACT_MAJOR_VERSION};
