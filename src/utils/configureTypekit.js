export default function configureTypekit(typeKitId) {
  const config = {
    kitId: typeKitId,
    scriptTimeout: 3000
  };

  if (!window.Typekit) { // we load the typescript only once
    const h = document.getElementsByTagName('html')[0];
    h.className += ' wf-loading';

    const t = setTimeout(() => {
      h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, ' ');
      h.className += ' wf-inactive';
    }, config.scriptTimeout);

    const tk = document.createElement('script');
    let d = false;

    tk.src = `//use.typekit.net/${config.kitId}.js`;
    tk.type = 'text/javascript';
    tk.async = 'true';
    tk.onload = tk.onreadystatechange = function onload() {
      const a = this.readyState;
      if (d || a && a !== 'complete' && a !== 'loaded') {
        return;
      }
      d = true;
      clearTimeout(t);
      try {
        window.Typekit.load(config);
      } catch (b) { /* empty */ }
    };

    const s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(tk, s);
  }
}
