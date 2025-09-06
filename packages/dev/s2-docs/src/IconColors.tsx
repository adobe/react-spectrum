'use client';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

function ColorSwatch({name}) {
  return (
    <div className={style({display: 'flex', gap: 8, marginBottom: 4, font: 'ui', alignItems: 'center', breakInside: 'avoid'})}>
      <div
        className={style({
          backgroundColor: {
            color: {
              white: 'white',
              black: 'black',
              accent: 'accent',
              neutral: 'neutral',
              negative: 'negative',
              informative: 'informative',
              positive: 'positive',
              notice: 'notice',
              gray: 'gray',
              red: 'red',
              orange: 'orange',
              yellow: 'yellow',
              chartreuse: 'chartreuse',
              celery: 'celery',
              seafoam: 'seafoam',
              cyan: 'cyan',
              blue: 'blue',
              indigo: 'indigo',
              purple: 'purple',
              fuchsia: 'fuchsia',
              magenta: 'magenta',
              pink: 'pink',
              turquoise: 'turquoise',
              cinnamon: 'cinnamon',
              brown: 'brown',
              silver: 'silver'
            }
          },
          size: 20,
          borderRadius: 'sm',
          borderWidth: 1,
          borderColor: 'gray-1000/15',
          borderStyle: 'solid'
        })({color: name})} />
      <div>{name}</div>
    </div>
  );
}

export function IconColors() {
  return (
    <div style={{columnWidth: 100}}>
      <ColorSwatch name="white" />
      <ColorSwatch name="black" />
      <ColorSwatch name="accent" />
      <ColorSwatch name="neutral" />
      <ColorSwatch name="negative" />
      <ColorSwatch name="informative" />
      <ColorSwatch name="positive" />
      <ColorSwatch name="notice" />
      <ColorSwatch name="gray" />
      <ColorSwatch name="red" />
      <ColorSwatch name="orange" />
      <ColorSwatch name="yellow" />
      <ColorSwatch name="chartreuse" />
      <ColorSwatch name="celery" />
      <ColorSwatch name="seafoam" />
      <ColorSwatch name="cyan" />
      <ColorSwatch name="blue" />
      <ColorSwatch name="indigo" />
      <ColorSwatch name="purple" />
      <ColorSwatch name="fuchsia" />
      <ColorSwatch name="magenta" />
      <ColorSwatch name="pink" />
      <ColorSwatch name="turquoise" />
      <ColorSwatch name="cinnamon" />
      <ColorSwatch name="brown" />
      <ColorSwatch name="silver" />
    </div>
  );
}
