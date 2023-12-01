const path = require('path');

const StyleDictionary = require('style-dictionary');
const CSSSetsFormatter = require('style-dictionary-sets').CSSSetsFormatter;
const NameKebabTransfom = require('style-dictionary-sets').NameKebabTransfom;
const AttributeSetsTransform =
    require('style-dictionary-sets').AttributeSetsTransform;
const CSSOpenTypeTransform =
    require('style-dictionary-sets').CSSOpenTypeTransform;

StyleDictionary.registerTransform(CSSOpenTypeTransform);
StyleDictionary.registerTransform(NameKebabTransfom);
StyleDictionary.registerTransform(AttributeSetsTransform);
StyleDictionary.registerFormat(CSSSetsFormatter);

/**
 * @note This references the package.json because we want the root folder and
 * not a nested folder which might be returned if the `main` property
 * in the package.json is present.
 */
const tokensPath = require.resolve('@adobe/spectrum-tokens/package.json');
const tokensDir = path.dirname(tokensPath);
const setNames = ['desktop', 'mobile', 'light', 'dark', 'darkest'];

module.exports = {
  source: [`${tokensDir}/src/*.json`],
  platforms: {
    CSS: {
      buildPath: 'dist/css/',
      transforms: [
        AttributeSetsTransform.name,
        NameKebabTransfom.name,
        CSSOpenTypeTransform.name
      ],
      prefix: 'spectrum',
      files: [
        generateFileConfig(),
        ...['spectrum', 'express'].map((subSystemName) =>
                    generateFileConfig({subSystemName})
                ),
        ...setNames.map((context) => generateFileConfig({setName: context})),
        ...setNames.map((context) =>
                    generateFileConfig({
                      setName: context,
                      subSystemName: 'spectrum'
                    })
                ),
        ...setNames.map((context) =>
                    generateFileConfig({
                      setName: context,
                      subSystemName: 'express'
                    })
                )
      ]
    }
  }
};

function generateFileConfig({setName, subSystemName} = {}) {
  const baseConfig = {
    format: 'css/sets',
    options: {
      showFileHeader: false,
      outputReferences: true
    }
  };

  const sets = [setName, subSystemName].filter(Boolean);
  if (!sets.length) {
    return {
      ...baseConfig,
      destination: 'global-vars.css',
      filter: (token) => !token.path.includes('sets'),
      options: {
        ...baseConfig.options,
        selector: '.spectrum'
      }
    };
  }

  const isGlobal = !setName;
  const isSpectrum = subSystemName && subSystemName === 'spectrum';

  let selector = '';
  if (isGlobal || (subSystemName && !isSpectrum)) {
        // postfix the selector with the subsystem name
    selector = `.spectrum${
            subSystemName && !isSpectrum ? `--${subSystemName}` : ''
        }`;
  }

  let scope =
        {
          desktop: 'medium',
          mobile: 'large'
        }[setName] ?? setName;

  if (isGlobal) {scope = 'global';} else if (setName && scope) {
    selector += `.spectrum--${scope}`;
  }

  const selectors = [
    selector ?? null,
        // Apply all light colors as lightest for backwards compat
        // @todo does this need a deprecation notice?
    setName === 'light' ? selector.replace('light', 'lightest') : null
  ].filter(Boolean);

  const getSets = (token) =>
        token.path.filter((_, idx, array) => array[idx - 1] === 'sets');

  function filter(token) {
        // Fetch the sets for this token
    const tokenSets = getSets(token);

    if (tokenSets.includes('wireframe')) {return false;}

    if (!setName) {
      if (!subSystemName && tokenSets.length === 0) {
        return true;
      }

      if (
                subSystemName &&
                tokenSets.length === 1 &&
                tokenSets.includes(subSystemName)
            ) {
        return true;
      }
    } else {
      if (!tokenSets.includes(setName)) {return false;}

      if (!subSystemName && tokenSets.length === 1) {
        return true;
      }

      if (
                subSystemName &&
                tokenSets.length === 2 &&
                tokenSets.includes(subSystemName)
            ) {
        return true;
      }
    }

    return false;
  }

  return {
    ...baseConfig,
    destination: `${subSystemName ? `${subSystemName}/` : ''}${scope}-vars.css`,
    filter,
    options: {
      ...baseConfig.options,
      selector: selectors.join(', '),
      sets
    }
  };
}
