import fs from 'fs';
import tokens from '@adobe/spectrum-tokens/dist/json/variables.json' with {type: 'json'};

function colorToken(token) {
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

function weirdColorToken(token) {
  return `light-dark(${token.sets.light.sets.light.value}, ${token.sets.dark.sets.dark.value})`;
}

fs.writeFileSync(
  import.meta.dirname + '/../page.css',
  `:where(:root, :host) {
  --s2-color-scheme: light dark;
  color-scheme: var(--s2-color-scheme);
  --s2-container-bg: ${colorToken(tokens['background-base-color'])};
  background: var(--s2-container-bg);
  --s2-scale: 1;
  --s2-font-size-base: 14;

  /* For backward compatibility in two cases:
   *   1. When a component compiled with an earlier version of S2 is embedded in a newer provider.
   *   2. When S2 CSS is compiled with lightningcss, setting color-scheme via a variable does not work. */
  --lightningcss-light: initial;
  --lightningcss-dark: ;

  @media (prefers-color-scheme: dark) {
    --lightningcss-light: ;
    --lightningcss-dark: initial;
  }

  @media not ((hover: hover) and (pointer: fine)) {
    --s2-scale: 1.25;
    --s2-font-size-base: 17;
  }

  &[data-color-scheme=light] {
    --s2-color-scheme: light;
    --lightningcss-light: initial;
    --lightningcss-dark: ;
  }

  &[data-color-scheme=dark] {
    --s2-color-scheme: dark;
    --lightningcss-light: ;
    --lightningcss-dark: initial;
  }

  &[data-background=layer-1] {
    --s2-container-bg: ${colorToken(tokens['background-layer-1-color'])};
  }

  &[data-background=layer-2] {
    --s2-container-bg: ${weirdColorToken(tokens['background-layer-2-color'])};
  }
}
`
);
