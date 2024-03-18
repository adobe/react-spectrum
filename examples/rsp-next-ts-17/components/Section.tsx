import { View, Heading, Divider } from "@adobe/react-spectrum";
import React, {JSX} from "react";

interface SectionProps {
  title: string;
  children: JSX.Element | JSX.Element[];
}

export default function Section(props: SectionProps) {
  let { title, children } = props;
  return (
    <View marginBottom="size-200">
      <Heading id={title.toLowerCase()} level={2}>
        {title}
      </Heading>
      <Divider marginBottom="size-100" />
      {children}
    </View>
  );
}
