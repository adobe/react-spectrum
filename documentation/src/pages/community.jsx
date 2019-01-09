import Community from '../../content/community.mdx';
import mdxComponents from '../mdx_components';
import React from 'react';
import updateDocumentLang from '../utils/updateDocumentLang';
import updateDocumentTitle from '../utils/updateDocumentTitle';

export default class CommunityPage extends React.Component {
  componentDidMount() {
    updateDocumentLang();
    updateDocumentTitle('Community');
  }

  render() {
    return <Community components={mdxComponents} />;
  }
}
