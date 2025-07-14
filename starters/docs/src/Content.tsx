import {
  Heading as AriaHeading,
  HeadingProps,
  Text as AriaText,
  TextProps
} from 'react-aria-components';

export function Heading(props: HeadingProps) {
  return <AriaHeading {...props} />;
};

export function Text(props: TextProps) {
  return <AriaText {...props} />;
};
