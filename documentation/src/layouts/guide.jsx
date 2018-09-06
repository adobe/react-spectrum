import Header from '../components/Header';
import Link from '../components/Link';
import mdxComponents from '../mdx_components';
import path from 'path';
import Provider from '@react/react-spectrum/Provider';
import React from 'react';
import './css/index.css';
import './css/prism-okaidia.css';

export default class Guide extends React.Component {
  render() {
    let guides = this.props.data.guides.edges;

    return (
      <Provider className="page" theme="dark">
        <Header />
        <div className="page-main">
          <ul className="sidebar">
            {guides.map(guide =>
              <li><Link href={`/guides/${guide.node.slug || path.basename(guide.node.name, path.extname(guide.node.name)).toLowerCase()}`}>{guide.node.title}</Link></li>
            )}
          </ul>
          <main className="page-content">
            <div className="documentation">
                {this.props.children({
                  ...this.props,
                  components: mdxComponents
                })}
            </div>
          </main>
        </div>
      </Provider>
    );
  }
}

export const pageQuery = graphql`
  query GuideQuery {
    guides: allGuidesJson {
      edges {
        node {
          title
          name
          slug
        }
      }
    }
  }
`;
