import tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

function weirdColorToken(token: typeof tokens['background-base-color']) {
  return `light-dark(${token.sets.light.sets.light.value}, ${token.sets.dark.sets.dark.value})`;
}

export function generatePageStyles(this: any) {
  this.addAsset({
    type: 'css',
    content: `html {
      color-scheme: light dark;
      background: ${weirdColorToken(tokens['background-base-color'])};
    
      &[data-theme=light] {
        color-scheme: light;
      }
    
      &[data-theme=dark] {
        color-scheme: dark;
      }
    
      &[data-background=layer-1] {
        background: ${weirdColorToken(tokens['background-layer-1-color'])};
      }
    
      &[data-background=layer-2] {
        background: ${weirdColorToken(tokens['background-layer-2-color'])};
      }
    }`
  });
}
