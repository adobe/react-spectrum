import 'babel-polyfill';
import React from 'react';
import Heading from '@react/react-spectrum/Heading';
import mdxComponents from '../mdx_components';
import ComponentAPI from '../components/ComponentAPI';
import ClassAPI from '../components/ClassAPI';
import DocsPage from '../components/DocsPage';
import '../fragments';
import updateDocumentLang from '../utils/updateDocumentLang';
import updateDocumentTitle from '../utils/updateDocumentTitle';
import './css/index.css';
import './css/prism-okaidia.css';

export default class ComponentLayout extends React.Component {
  componentDidMount() {
    updateDocumentLang();
    updateDocumentTitle(this.props.data.component.displayName);
  }

  render() {
    let { children } = this.props;
    let component = this.props.data.component;
    let related = this.props.data.relatedComponents
      ? this.props.data.relatedComponents.edges.filter(edge => edge.node.docblock && !edge.node.docblock.includes('@private'))
      : [];
    let relatedClasses = this.props.data.relatedClasses && this.props.data.relatedClasses.edges.sort((a, b) =>
      a.node.name < b.node.name ? -1 : 1
    );

    related.sort((a, b) => a.node.displayName < b.node.displayName ? -1 : 1);

    let overview = children({
      ...this.props,
      components: mdxComponents
    });

    return (
      <DocsPage overview={overview} data={this.props.data} selectedItem={component.displayName}>
        <ComponentAPI component={component} />
        {related.map(edge =>
          <section key={edge.node.displayName}>
            <Heading size={1}>{edge.node.displayName}</Heading>
            <ComponentAPI component={edge.node} />
          </section>
        )}
        {relatedClasses && relatedClasses.map(edge =>
          <section key={edge.node.id}>
            <Heading size={1}>{edge.node.name}</Heading>
            <ClassAPI node={edge.node} />
          </section>
        )}
      </DocsPage>
    );
  }
}

export const pageQuery = graphql`
  query ComponentLayoutQuery($componentName: String, $relatedComponents: String, $relatedClasses: String) {
    allComponents:allComponentMetadata(sort:{fields:[displayName]}) {
      edges {
        node {
          id
          displayName
        }
      }
    }
    allClasses:allDocumentationJs(sort:{fields:[name]}) {
      edges {
        node {
          id
          name
        }
      }
    }
    component:componentMetadata(displayName:{eq:$componentName}) {
      ...componentFields
    }
    relatedComponents:allComponentMetadata(filter:{displayName:{regex:$relatedComponents}}) {
      edges {
        node {
          ...componentFields
        }
      }
    }
    relatedClasses:allDocumentationJs(filter:{name:{regex:$relatedClasses}}) {
      edges {
        node {
          ...docFields
        }
      }
    }
  }
`;
