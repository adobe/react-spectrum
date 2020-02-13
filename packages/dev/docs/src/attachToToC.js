import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';

const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export function attachToToC() {
  let tocLinks = document.querySelectorAll('#toc a');
  let main = document.querySelector('main');
  let headers = [];
  for (let link of tocLinks) {
    let headerId = link.href.split('#').pop();
    let header = document.querySelector(`#${headerId}`);
    headers.push({link, header});
  }

  function updateToc() {
    // this needs to be improved a little but the math hurts my head right now
    // right now it's impossible to select the last section if the last two heights combined are smaller than the viewport height
    headers.some((header, i) => {
      if ((header.header.offsetTop + header.header.getBoundingClientRect().height) > main.scrollTop) {
        let currentSelection = document.querySelectorAll(`#toc .${sideNavStyles['is-selected']}`);
        if (currentSelection) {
          currentSelection.forEach(node => node.classList.remove(sideNavStyles['is-selected']));
        }
        header.link.parentElement.classList.add(sideNavStyles['is-selected']);
        return true;
      }
    });
  }

  updateToc();

  let throttledScrollListener = throttle(updateToc, 100);
  main.addEventListener('scroll', throttledScrollListener);
  if (module.hot) {
    module.hot.dispose(() => {
      main.removeEventListener('scroll', throttledScrollListener);
    });
  }
}
