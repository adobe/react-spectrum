import {
  Heading as AriaHeading,
  HeadingProps,
  Text as AriaText,
  TextProps
} from 'react-aria-components';

import './Content.css';

export function Heading(props: HeadingProps) {
  return <AriaHeading {...props} />;
};

export function Text(props: TextProps) {
  return <AriaText {...props} />;
};
