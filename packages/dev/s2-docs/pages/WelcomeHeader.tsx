import {ProductCard, Content, Footer, Text, LinkButton} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
// @ts-ignore
import {TAB_DEFS} from '../src/constants';
// @ts-ignore
import url from 'url:../assets/wallpaper_collaborative_S2_desktop.webp';

export function WelcomeHeader() {
  return (
    <header
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover'
      }}
      className={style({
        paddingX: 48,
        paddingY: 96,
        marginTop: {
          default: -12,
          lg: -40
        },
        marginX: {
          default: -12,
          lg: -40
        },
        marginBottom: 48
      })}>
      <h1 className={style({font: 'heading-2xl', color: 'white'})}>
        React Spectrum Libraries
      </h1>
    </header>
  );
}

export function LibraryCards() {
  return (
    <div className={style({display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: {default: 'center', lg: 'start'}})}>
      <ProductCard size="L">
        {TAB_DEFS['react-spectrum'].icon}
        <Content>
          <Text slot="title">{TAB_DEFS['react-spectrum'].label}</Text>
          <Text slot="description">{TAB_DEFS['react-spectrum'].description}</Text>
        </Content>
        <Footer>
          <LinkButton href="s2/" variant="accent">Get started</LinkButton>
        </Footer>
      </ProductCard>

      <ProductCard size="L">
        {TAB_DEFS['react-aria'].icon}
        <Content>
          <Text slot="title">{TAB_DEFS['react-aria'].label}</Text>
          <Text slot="description">{TAB_DEFS['react-aria'].description}</Text>
        </Content>
        <Footer>
          <LinkButton href="react-aria/" variant="accent">Explore</LinkButton>
        </Footer>
      </ProductCard>
    </div>
  );
}
