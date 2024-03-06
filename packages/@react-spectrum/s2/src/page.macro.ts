import tokens from '@adobe/spectrum-tokens/dist/json/variables.json';
import {MacroContext} from '@parcel/macros';

function colorToken(token: typeof tokens['gray-25']) {
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

function weirdColorToken(token: typeof tokens['background-layer-2-color']) {
  return `light-dark(${token.sets.light.sets.light.value}, ${token.sets.dark.sets.dark.value})`;
}

export function generatePageStyles(this: MacroContext | void) {
  this?.addAsset({
    type: 'css',
    content: `html {
      color-scheme: light dark;
      background: ${colorToken(tokens['background-base-color'])};
      -webkit-tap-highlight-color: rgba(0,0,0,0); /* Prevent tap highlights */
    
      &[data-theme=light] {
        color-scheme: light;
      }
    
      &[data-theme=dark] {
        color-scheme: dark;
      }
    
      &[data-background=layer-1] {
        background: ${colorToken(tokens['background-layer-1-color'])};
      }
    
      &[data-background=layer-2] {
        background: ${weirdColorToken(tokens['background-layer-2-color'])};
      }
    }`
  });
}
