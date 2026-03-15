'use client';
import React from "react";
import {
  DisclosureGroup as AriaDisclosureGroup,
  DisclosureGroupProps as AriaDisclosureGroupProps,
} from "react-aria-components";

export interface DisclosureGroupProps extends AriaDisclosureGroupProps {
  children: React.ReactNode
}

export function DisclosureGroup({ children, ...props }: DisclosureGroupProps) {
  return (
    <AriaDisclosureGroup {...props}>
      {children}
    </AriaDisclosureGroup>
  );
}
