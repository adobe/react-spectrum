import got from 'got';

export const readTemplates = async () => {
  // TODO: Before merging, update to https://api.github.com/repos/adobe/react-spectrum/contents/packages/react-aria-components/scripts/create-react-aria-components/templates
  let res = await got('https://api.github.com/repositories/208362715/contents/packages/react-aria-components/scripts/create-react-aria-components/templates?ref=create-react-aria-components').catch((e) => e);
  // TODO handle error
  return JSON.parse(res.body).map((t) => t.name);
};
