import React from 'react';
import updateDocumentLang from '../utils/updateDocumentLang';
import updateDocumentTitle from '../utils/updateDocumentTitle';

export default class ErrorPage extends React.Component {
  componentDidMount() {
    updateDocumentLang();
    updateDocumentTitle('404');
  }

  render() {
    return <h1>404</h1>;
  }
}
