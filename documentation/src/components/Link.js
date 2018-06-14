import GatsbyLink from "gatsby-link";
import SpectrumLink from '@react/react-spectrum/Link';
import React from 'react';

const Link = ({ children, href, ...other }) => {
  // Tailor the following test to your environment.
  // This example assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const external = /http/.test(href);

  // Use gatsby-link for internal links, and <a> for others
  if (!external) {
    return (
      <GatsbyLink to={href} className="spectrum-Link" {...other}>
        {children}
      </GatsbyLink>
    );
  }
  return (
    <SpectrumLink href={href} {...other}>
      {children}
    </SpectrumLink>
  );
};

export default Link;
