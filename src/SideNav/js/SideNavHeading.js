import React from 'react';
import SideNavItem from './SideNavItem';

export default function SideNavHeading({label, ...props}) {
  return (
    <SideNavItem header={label} {...props} defaultExpanded />
  );
}
