import {Link} from '@react-spectrum/link';
import LinkOut from '@spectrum-icons/workflow/LinkOut';
import React from 'react';
import {ResourceCard} from '@react-spectrum/docs/src/ResourceCard';
import {spawnSync} from 'child_process';

const gitHash = process.env.GIT_HASH || spawnSync('git', ['rev-parse', '--short', 'HEAD']).stdout.toString().trim();

export function StarterKits({component, tailwindComponent = component}) {
  let query = component ? `?path=/docs/${component}--docs` : '';
  let tailwindQuery = tailwindComponent ? `?path=/docs/${tailwindComponent}--docs` : '';
  return (
    <section style={{display: 'flex', columnGap: 16, flexWrap: 'wrap'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <ResourceCard
          type="Storybook"
          url={`../react-aria-starter.${gitHash}.zip`}
          style={{marginTop: 36, marginBottom: 0}} />
        <Link variant="secondary" href={`../react-aria-starter/index.html${query}`} target="_blank" UNSAFE_style={{width: 'fit-content'}}>Preview<LinkOut size="XXS" marginStart="size-75" UNSAFE_style={{verticalAlign: 'middle'}} /></Link>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
        <ResourceCard
          type="Tailwind"
          url={`../react-aria-tailwind-starter.${gitHash}.zip`}
          style={{marginTop: 36, marginBottom: 0}} />
        <Link variant="secondary" href={`../react-aria-tailwind-starter/index.html${tailwindQuery}`} target="_blank" UNSAFE_style={{width: 'fit-content'}}>Preview<LinkOut size="XXS" marginStart="size-75" UNSAFE_style={{verticalAlign: 'middle'}} /></Link>
      </div>
    </section>
  );
}
