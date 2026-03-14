import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import Button from './Button';
import Card from './Card';
import Icon from './Icon';

const Header = () => {
  return (
    <header className={style({ fontSize: 'ui-xl', fontWeight: 'bold', gridArea: 'header' })}>
      <h1>Header</h1>
    </header>
  );
};

const Nav = () => {
  return (
    <nav className={style({backgroundColor: 'cyan-400', color: 'magenta-400', gridArea: 'nav'})}>
      <h1>Nav</h1>
    </nav>
  );
};

const Main = () => {
  return (
    <main className={style({backgroundColor: 'cyan-400', color: 'magenta-400', gridArea: 'main'})}>
      <h1>Main</h1>
      <Button label="Click me" />
      <Card />
      <Icon />
    </main>
  );
};

const Footer = () => {
  return (
    <footer className={style({backgroundColor: 'cyan-400', color: 'magenta-400', gridArea: 'footer'})}>
      <h1>Footer</h1>
    </footer>
  );
};

const appStyles = style({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  gridTemplateAreas: {
    default: ['header', 'nav main', 'footer'],
  },
  gridTemplateRows: ['auto', '1fr', 'auto'],
  gridTemplateColumns: ['1fr', '1fr'],
  gridGap: 8,
  gridAutoFlow: 'row',
  gridAutoColumns: '1fr',
  gridAutoRows: 'auto',
});

const App = () => {
  return (
    <div className={appStyles}>
      <Header />
      <Nav />
      <Main />
      <Footer />
    </div>
  );
};

export default App;