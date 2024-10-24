export function createShadowRoot() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  const shadowRoot = div.attachShadow({mode: 'open'});
  return {shadowHost: div, shadowRoot};
}
