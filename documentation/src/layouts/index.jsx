import Header from '../components/Header';
import Provider from '@react/react-spectrum/Provider';
import React from 'react';
import updateDocumentLang from '../utils/updateDocumentLang';
import updateDocumentTitle from '../utils/updateDocumentTitle';
import './css/index.css';

export default class MainLayout extends React.Component {
  componentDidMount() {
    updateDocumentLang();
    updateDocumentTitle();
  }

  render() {
    const {children} = this.props;
    return (
      <Provider theme="dark" className="page">
        <Header />
        <div className="page-main">
          <main id="main" className="page-content">
            <div className="documentation">
              {children()}
            </div>
          </main>
        </div>
      </Provider>
    );
  }
}
