import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
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
        marginTop: -40,
        marginX: -40,
        marginBottom: 48
      })}>
      <h1 className={style({font: 'heading-2xl', color: 'white'})}>
        React Spectrum Libraries
      </h1>
    </header>
  );
}
