import got from 'got';

export const readComponents = async (template) => {
  // TODO: Before merging, update to https://api.github.com/repos/adobe/react-spectrum/contents/packages/react-aria-components/scripts/create-react-aria-components/templates/${template}/components
  let res = await got(`https://api.github.com/repositories/208362715/contents/packages/react-aria-components/scripts/create-react-aria-components/templates/${template}/components?ref=create-react-aria-components`).catch((e) => e);
    // TODO handle error
  let components = JSON.parse(res.body).filter((t) => t.name !== 'package.json').map((t) => t.name);
  return components;
};
