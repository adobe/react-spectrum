import {Card, Content, Link, Text} from '@react-spectrum/s2';
import Download from '@react-spectrum/s2/icons/Download';
import {spawnSync} from 'child_process';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const gitHash = process.env.GIT_HASH || spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();

const preview = style({
  height: 'calc(100% + var(--card-padding-y) * 2)',
  aspectRatio: 'square',
  contain: 'strict',
  marginStart: 'calc(var(--card-padding-x) * -1)',
  marginEnd: '--card-padding-x',
  marginY: 'calc(var(--card-padding-y) * -1)'
});

export function StarterKits() {
  return (
    <section className={style({display: 'flex', gap: 16, flexWrap: 'wrap'})}>
      <div className={style({display: 'flex', flexDirection: 'column', gap: 8})}>
        <Card href={`../react-aria-starter.${gitHash}.zip`}>
          <div className={style({display: 'flex', alignItems: 'center'})}>
            <svg viewBox="0 0 1000 1000" className={preview}>
              <rect fill="#639" width="100%" height="100%" />
              <path fill="#fff" d="m358.1,920c-64.23-.06-103.86-36.23-103.1-102.79,0,0,0-168.39,0-168.39,0-33.74,9.88-59.4,29.64-76.96,35.49-34.19,117.83-36.27,152.59.52,21.42,18.89,29.5,57.48,27.58,93.49h-73.72c.56-14.15-.19-35.58-8.51-43.65-10.81-14.63-39.36-12.91-46.91,2.32-4.64,8.26-6.96,20.49-6.96,36.67v146.18c0,30.65,10.65,46.15,31.96,46.49,9.96,0,17.53-3.62,22.68-10.85,7.19-8.58,8.31-27.58,7.73-41.32h73.72c5.04,70.07-36.32,119.16-106.71,118.29Zm234.04,0c-71.17.98-103.01-49.66-101.04-118.29h69.59c-1.93,29.92,8.35,57.17,32.99,55.27,10.99,0,18.73-3.44,23.2-10.33,8.5-12.59,10.09-48.95-2.06-63.02-8.49-13.55-39.03-25.51-55.16-33.57-23.03-11.02-39.61-24.1-49.75-39.26-22.87-33.64-20.75-107.48,11.34-137.4,31.18-36.92,112.61-38.62,143.82-.77,19.25,19.51,27.66,57.9,26.03,93.23h-67.02c.57-14.52-.8-37.95-6.44-46.49-3.95-7.23-11.43-10.85-22.42-10.85-19.59,0-29.38,11.71-29.38,35.12.21,24.86,9.9,35.06,32.48,45.45,29.24,11.36,66.42,30.76,79.9,54.24,40.2,71.54,12.62,180.82-86.09,176.65Zm224.76,0c-71.17.98-103.01-49.66-101.04-118.29h69.59c-1.93,29.92,8.35,57.17,32.99,55.27,10.99,0,18.73-3.44,23.2-10.33,8.5-12.59,10.09-48.95-2.06-63.02-8.49-13.55-39.03-25.51-55.16-33.57-23.03-11.02-39.61-24.1-49.75-39.26-22.87-33.64-20.75-107.48,11.34-137.4,31.18-36.92,112.61-38.62,143.82-.77,19.25,19.51,27.66,57.9,26.03,93.23h-67.02c.57-14.52-.8-37.95-6.44-46.49-3.95-7.23-11.43-10.85-22.42-10.85-19.59,0-29.38,11.71-29.38,35.12.21,24.86,9.9,35.06,32.48,45.45,29.24,11.36,66.42,30.76,79.9,54.24,40.2,71.54,12.62,180.82-86.09,176.65Z" />
            </svg>
            <Content styles={style({padding: 0, flexGrow: 1})}>
              <Text slot="title">Vanilla CSS</Text>
              <Text slot="description">Download ZIP</Text>
            </Content>
            <Download />
          </div>
        </Card>
        <Link isStandalone variant="secondary" href="../react-aria-starter/index.html" target="_blank" UNSAFE_style={{width: 'fit-content'}}>Preview</Link>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
        <Card href={`../react-aria-tailwind-starter.${gitHash}.zip`}>
          <div className={style({display: 'flex', alignItems: 'center'})}>
            <svg fill="none" viewBox="-4 -4 62 41" className={preview}>
              <g clipPath="url(#prefix__clip0)">
                <path fill="#38bdf8" fillRule="evenodd" d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z" clipRule="evenodd" />
              </g>
              <defs>
                <clipPath id="prefix__clip0">
                  <path fill="#fff" d="M0 0h54v32.4H0z" />
                </clipPath>
              </defs>
            </svg>
            <Content styles={style({padding: 0, flexGrow: 1})}>
              <Text slot="title">Tailwind CSS</Text>
              <Text slot="description">Download ZIP</Text>
            </Content>
            <Download />
          </div>
        </Card>
        <Link isStandalone variant="secondary" href="../react-aria-tailwind-starter/index.html" target="_blank" UNSAFE_style={{width: 'fit-content'}}>Preview</Link>
      </div>
    </section>
  );
}
