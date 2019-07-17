import Heading from '@react/react-spectrum/Heading';
import Link from './components/Link';
import React from 'react';

export default {
  a: props => <Link {...props} target={/^http/.test(props.href) ? '_blank' : null} />,
  h1: props => <Heading variant="display" {...props} />,
  h2: props => <Heading variant="pageTitle" aria-level={2} {...props} />,
  h3: props => <Heading variant="subtitle1" aria-level={3} {...props} />,
  h4: props => <Heading variant="subtitle2" aria-level={4} {...props} />,
  h5: props => <Heading variant="subtitle3" aria-level={5} {...props} />,
  h6: props => <Heading variant="subtitle3" aria-level={6} {...props} />
};
