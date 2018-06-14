import Heading from '@react/react-spectrum/Heading';
import Link from './components/Link';
import React from 'react';

export default {
  a: props => <Link {...props} target={/^http/.test(props.href) ? '_blank' : null} />,
  h1: props => <Heading size={1} {...props} />,
  h2: props => <Heading size={2} {...props} />,
  h3: props => <Heading size={3} {...props} />,
  h4: props => <Heading size={4} {...props} />
};
