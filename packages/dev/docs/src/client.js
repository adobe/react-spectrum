import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Link} from '@react-spectrum/link';
import ReactDOM from 'react-dom';
import React, {useState, useRef, useEffect} from 'react';
import {Provider} from '@react-spectrum/provider';
import {theme} from '@react-spectrum/theme-default';
import {Text} from '@react-spectrum/typography';
import {Divider} from '@react-spectrum/divider';
import {BreadcrumbItem, Breadcrumbs} from '@react-spectrum/breadcrumbs';

let headers = document.querySelectorAll('th[colspan]');
for (let header of headers) {
  header.addEventListener('click', () => {
    if (header.dataset.expanded) {
      delete header.dataset.expanded;
    } else {
      header.dataset.expanded = true;
    }
    
    let node = header.parentNode.nextSibling;
    while (node) {
      node.hidden = !node.hidden;

      node = node.nextSibling;
    }
  });
}

let links = document.querySelectorAll('article > table a[data-link]');
for (let link of links) {
  let id = link.dataset.link;
  let target = document.getElementById(id);
  let container = document.createElement('span');

  ReactDOM.render(
    <Provider theme={theme} UNSAFE_style={{display: 'inline', background: 'none'}}>
      <DialogTrigger type="popover">
        <Link isQuiet data-link={link.dataset.link}>{link.textContent}</Link>
        <LinkPopover id={link.dataset.link} />
      </DialogTrigger>
    </Provider>
  , container);

  link.parentNode.replaceChild(container, link);
}

function LinkPopover({id}) {
  let ref = useRef();
  let [breadcrumbs, setBreadcrumbs] = useState([document.getElementById(id)])

  useEffect(() => {
    let links = ref.current.querySelectorAll('[data-link]');
    for (let link of links) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        setBreadcrumbs([...breadcrumbs, document.getElementById(link.dataset.link)]);
      });
    }
  }, [breadcrumbs]);

  return (
    <Dialog>
      <Header>
        <Breadcrumbs isHeading headingAriaLevel={3}>
          {breadcrumbs.map((b, i) => 
            <BreadcrumbItem 
              onPress={() => setBreadcrumbs(breadcrumbs.slice(0, i + 1))}>
              {b.dataset.title}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>
      </Header>
      <Divider size="M" />
      <Content>
        <div ref={ref} dangerouslySetInnerHTML={{__html: breadcrumbs[breadcrumbs.length -  1].innerHTML}} />
      </Content>
    </Dialog>
  );
}
