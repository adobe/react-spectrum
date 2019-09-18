import Button from '@react/react-spectrum/Button';
import Example from '../../content/example.mdx';
import GatsbyLink from 'gatsby-link';
import Heading from '@react/react-spectrum/Heading';
import Link from '../components/Link';
import React from 'react';
import Rule from '@react/react-spectrum/Rule';
import updateDocumentLang from '../utils/updateDocumentLang';
import updateDocumentTitle from '../utils/updateDocumentTitle';

export default class Index extends React.Component {
  componentDidMount() {
    updateDocumentLang();
    updateDocumentTitle('React Spectrum');
  }

  render() {
    return (
      <div className="homepage">
        <section className="hero">
          <Heading size={1}>React Spectrum</Heading>
          <Heading size={3}>Spectrum UI components in React</Heading>
          <Button variant="cta" element={GatsbyLink} to="/guides/getting_started">Get Started</Button>
          <Button variant="secondary" element="a" href="https://github.com/adobe/react-spectrum" target="_blank">Github</Button>
        </section>
        <Rule />
        <section className="features">
          <section className="feature">
            <Heading variant="pageTitle"><span aria-hidden>⚡️</span> Powered by Spectrum</Heading>
            <p><Link href="http://spectrum.corp.adobe.com" target="_blank">Spectrum</Link> is Adobe's shared design system, which provides a consistent look and feel to all Adobe applications.</p>
          </section>

          <section className="feature">
            <Heading variant="pageTitle"><span aria-hidden>⚛️</span> Built with React</Heading>
            <p><Link href="http://reactjs.org" target="_blank">React</Link> is a frontend component library from Facebook. react-spectrum builds on this foundation to deliver a rich component library.</p>
          </section>

          <section className="feature">
            <Heading variant="pageTitle"><span aria-hidden>♿️</span> Accessible for all</Heading>
            <p>Accessibility is built into each component in react-spectrum, including keyboard support, screen reader integration, and more.</p>
          </section>
        </section>
        <section className="example">
          <Heading variant="display">Example</Heading>
          <Example />
        </section>
      </div>
    );
  }
}
