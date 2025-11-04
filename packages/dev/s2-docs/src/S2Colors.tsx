import {colorSwatch, getColorScale} from './color.macro' with {type: 'macro'};
import {Disclosure, DisclosurePanel, DisclosureTitle} from '@react-spectrum/s2';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export function S2Colors() {
  return (
    <>
      <Disclosure isQuiet>
        <DisclosureTitle>Background colors</DisclosureTitle>
        <DisclosurePanel>
          <p>The backgroundColor property supports the following values, in addition to the semantic and global colors shown below. These colors are specifically chosen to be used as backgrounds, so prefer them over global colors where possible.</p>
          <div className="sb-unstyled" style={{columnWidth: 120}}>
            <Color name="base" className={colorSwatch('base')} />
            <Color name="layer-1" className={colorSwatch('layer-1')} />
            <Color name="layer-2" className={colorSwatch('layer-2')} />
            <Color name="pasteboard" className={colorSwatch('pasteboard')} />
            <Color name="elevated" className={colorSwatch('elevated')} />
            <Color name="accent" className={colorSwatch('accent')} />
            <Color name="accent-subtle" className={colorSwatch('accent-subtle')} />
            <Color name="neutral" className={colorSwatch('neutral')} />
            <Color name="neutral-subdued" className={colorSwatch('neutral-subdued')} />
            <Color name="neutral-subtle" className={colorSwatch('neutral-subtle')} />
            <Color name="negative" className={colorSwatch('negative')} />
            <Color name="negative-subtle" className={colorSwatch('negative-subtle')} />
            <Color name="informative" className={colorSwatch('informative')} />
            <Color name="informative-subtle" className={colorSwatch('informative-subtle')} />
            <Color name="positive" className={colorSwatch('positive')} />
            <Color name="positive-subtle" className={colorSwatch('positive-subtle')} />
            <Color name="notice" className={colorSwatch('notice')} />
            <Color name="notice-subtle" className={colorSwatch('notice-subtle')} />
            <Color name="gray" className={colorSwatch('gray')} />
            <Color name="gray-subtle" className={colorSwatch('gray-subtle')} />
            <Color name="red" className={colorSwatch('red')} />
            <Color name="red-subtle" className={colorSwatch('red-subtle')} />
            <Color name="orange" className={colorSwatch('orange')} />
            <Color name="orange-subtle" className={colorSwatch('orange-subtle')} />
            <Color name="yellow" className={colorSwatch('yellow')} />
            <Color name="yellow-subtle" className={colorSwatch('yellow-subtle')} />
            <Color name="chartreuse" className={colorSwatch('chartreuse')} />
            <Color name="chartreuse-subtle" className={colorSwatch('chartreuse-subtle')} />
            <Color name="celery" className={colorSwatch('celery')} />
            <Color name="celery-subtle" className={colorSwatch('celery-subtle')} />
            <Color name="green" className={colorSwatch('green')} />
            <Color name="green-subtle" className={colorSwatch('green-subtle')} />
            <Color name="seafoam" className={colorSwatch('seafoam')} />
            <Color name="seafoam-subtle" className={colorSwatch('seafoam-subtle')} />
            <Color name="cyan" className={colorSwatch('cyan')} />
            <Color name="cyan-subtle" className={colorSwatch('cyan-subtle')} />
            <Color name="blue" className={colorSwatch('blue')} />
            <Color name="blue-subtle" className={colorSwatch('blue-subtle')} />
            <Color name="indigo" className={colorSwatch('indigo')} />
            <Color name="indigo-subtle" className={colorSwatch('indigo-subtle')} />
            <Color name="purple" className={colorSwatch('purple')} />
            <Color name="purple-subtle" className={colorSwatch('purple-subtle')} />
            <Color name="fuchsia" className={colorSwatch('fuchsia')} />
            <Color name="fuchsia-subtle" className={colorSwatch('fuchsia-subtle')} />
            <Color name="magenta" className={colorSwatch('magenta')} />
            <Color name="magenta-subtle" className={colorSwatch('magenta-subtle')} />
            <Color name="pink" className={colorSwatch('pink')} />
            <Color name="pink-subtle" className={colorSwatch('pink-subtle')} />
            <Color name="turquoise" className={colorSwatch('turquoise')} />
            <Color name="turquoise-subtle" className={colorSwatch('turquoise-subtle')} />
            <Color name="cinnamon" className={colorSwatch('cinnamon')} />
            <Color name="cinnamon-subtle" className={colorSwatch('cinnamon-subtle')} />
            <Color name="brown" className={colorSwatch('brown')} />
            <Color name="brown-subtle" className={colorSwatch('brown-subtle')} />
            <Color name="silver" className={colorSwatch('silver')} />
            <Color name="silver-subtle" className={colorSwatch('silver-subtle')} />
            <Color name="disabled" className={colorSwatch('disabled')} />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>Text colors</DisclosureTitle>
        <DisclosurePanel>
          <p>The color property supports the following values, in addition to the semantic and global colors shown below. These colors are specifically chosen to be used as text colors, so prefer them over global colors where possible.</p>
          <div className="sb-unstyled" style={{columnWidth: 120}}>
            <Color name="accent" className={colorSwatch('accent', 'color')} />
            <Color name="neutral" className={colorSwatch('neutral', 'color')} />
            <Color name="neutral-subdued" className={colorSwatch('neutral-subdued', 'color')} />
            <Color name="negative" className={colorSwatch('negative', 'color')} />
            <Color name="disabled" className={colorSwatch('disabled', 'color')} />
            <Color name="heading" className={colorSwatch('heading', 'color')} />
            <Color name="title" className={colorSwatch('title', 'color')} />
            <Color name="body" className={colorSwatch('body', 'color')} />
            <Color name="detail" className={colorSwatch('detail', 'color')} />
            <Color name="code" className={colorSwatch('code', 'color')} />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet>
        <DisclosureTitle>Semantic colors</DisclosureTitle>
        <DisclosurePanel>
          <p>The following values are available across all color properties. Prefer to use semantic colors over global colors when they represent a specific meaning.</p>
          <div className="sb-unstyled" style={{columnWidth: 120}}>
            <ColorScale scale={getColorScale('accent-color')} />
            <ColorScale scale={getColorScale('informative-color')} />
            <ColorScale scale={getColorScale('negative-color')} />
            <ColorScale scale={getColorScale('notice-color')} />
            <ColorScale scale={getColorScale('positive-color')} />
          </div>
        </DisclosurePanel>
      </Disclosure>
      <Disclosure isQuiet styles={style({marginBottom: 16})}>
        <DisclosureTitle>Global colors</DisclosureTitle>
        <DisclosurePanel>
          <p>The following values are available across all color properties.</p>
          <div className="sb-unstyled" style={{columnWidth: 120}}>
            <ColorScale scale={getColorScale('gray')} />
            <ColorScale scale={getColorScale('blue')} />
            <ColorScale scale={getColorScale('red')} />
            <ColorScale scale={getColorScale('orange')} />
            <ColorScale scale={getColorScale('yellow')} />
            <ColorScale scale={getColorScale('chartreuse')} />
            <ColorScale scale={getColorScale('celery')} />
            <ColorScale scale={getColorScale('green')} />
            <ColorScale scale={getColorScale('seafoam')} />
            <ColorScale scale={getColorScale('cyan')} />
            <ColorScale scale={getColorScale('indigo')} />
            <ColorScale scale={getColorScale('purple')} />
            <ColorScale scale={getColorScale('fuchsia')} />
            <ColorScale scale={getColorScale('magenta')} />
            <ColorScale scale={getColorScale('pink')} />
            <ColorScale scale={getColorScale('turquoise')} />
            <ColorScale scale={getColorScale('brown')} />
            <ColorScale scale={getColorScale('silver')} />
            <ColorScale scale={getColorScale('cinnamon')} />
          </div>
        </DisclosurePanel>
      </Disclosure>
    </>
  );
}

function ColorScale({scale}) {
  return scale.map(([name, className]) => (
    <Color key={name} name={name} className={className} />
  ));
}

function Color({name, className}) {
  return (
    <div className={style({display: 'flex', gap: 8, marginBottom: 4, font: 'ui', alignItems: 'center', breakInside: 'avoid'})}>
      <div className={typeof className === 'function' ? className({}) : className} />
      <div className="sb-unstyled">{name}</div>
    </div>
  );
}

export function IconColors() {
  return (
    <div className="sb-unstyled" style={{columnWidth: 100}}>
      <Color name="white" className={colorSwatch('white', 'fill')} />
      <Color name="black" className={colorSwatch('black', 'fill')} />
      <Color name="accent" className={colorSwatch('accent', 'fill')} />
      <Color name="neutral" className={colorSwatch('neutral', 'fill')} />
      <Color name="negative" className={colorSwatch('negative', 'fill')} />
      <Color name="informative" className={colorSwatch('informative', 'fill')} />
      <Color name="positive" className={colorSwatch('positive', 'fill')} />
      <Color name="notice" className={colorSwatch('notice', 'fill')} />
      <Color name="gray" className={colorSwatch('gray', 'fill')} />
      <Color name="red" className={colorSwatch('red', 'fill')} />
      <Color name="orange" className={colorSwatch('orange', 'fill')} />
      <Color name="yellow" className={colorSwatch('yellow', 'fill')} />
      <Color name="chartreuse" className={colorSwatch('chartreuse', 'fill')} />
      <Color name="celery" className={colorSwatch('celery', 'fill')} />
      <Color name="seafoam" className={colorSwatch('seafoam', 'fill')} />
      <Color name="cyan" className={colorSwatch('cyan', 'fill')} />
      <Color name="blue" className={colorSwatch('blue', 'fill')} />
      <Color name="indigo" className={colorSwatch('indigo', 'fill')} />
      <Color name="purple" className={colorSwatch('purple', 'fill')} />
      <Color name="fuchsia" className={colorSwatch('fuchsia', 'fill')} />
      <Color name="magenta" className={colorSwatch('magenta', 'fill')} />
      <Color name="pink" className={colorSwatch('pink', 'fill')} />
      <Color name="turquoise" className={colorSwatch('turquoise', 'fill')} />
      <Color name="cinnamon" className={colorSwatch('cinnamon', 'fill')} />
      <Color name="brown" className={colorSwatch('brown', 'fill')} />
      <Color name="silver" className={colorSwatch('silver', 'fill')} />
    </div>
  );
}
