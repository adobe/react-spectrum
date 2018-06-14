import Header from '../components/Header';
import Provider from '@react/react-spectrum/Provider';
import React from 'react'
import './css/index.css'

export default class MainLayout extends React.Component {
  render() {
    const { children } = this.props
    return (
      <Provider theme="dark" className="page">
        <Header />
        <main>
          {children()}
        </main>
      </Provider>
    );
  }
}
