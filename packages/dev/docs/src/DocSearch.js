import algoliasearch from 'algoliasearch/lite';
import docsStyle from './docs.css';
import DOMPurify from 'dompurify';
import {Item, SearchAutocomplete, Section} from '@react-spectrum/autocomplete';
import React, {useState} from 'react';
import {Text} from '@adobe/react-spectrum';
import {ThemeProvider} from './ThemeSwitcher';

export default function DocSearch() {
  const client = algoliasearch('1V1Q59JVTR', '44a7e2e7508ff185f25ac64c0a675f98');
  const searchIndex = client.initIndex('react-spectrum');
  const searchOptions = {
    distinct: 1,
    highlightPreTag: `<mark class="${docsStyle.docSearchBoxMark}">`,
    highlightPostTag: '</mark>'
  };

  const sectionTitles = {
    'react-aria': 'React Aria',
    'react-spectrum': 'React Spectrum',
    'react-stately': 'React Stately',
    'internationalized': 'Internationalized',
    'blog': 'Blog',
    'architecture': 'Architecture',
    'contribute': 'Contribute',
    'releases': 'Releases',
    'support': 'Support'
  };

  const [searchValue, setSearchValue] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  let updatePredictions = ({hits}) => {
    setPredictions(hits);
    let sections = [];
    hits.forEach(prediction => {
      let hierarchy = prediction.hierarchy;
      let objectID = prediction.objectID;
      let url = prediction.url;
      let sectionTitle;
      for (const [path, title] of Object.entries(sectionTitles)) {
        let regexp = new RegExp('^.+//.+/' + path + '[/.].+$', 'i');
        if (url.match(regexp)) {
          sectionTitle = title;
          break;
        }
      }
      if (!sectionTitle) {
        sectionTitle = 'Documentation';
      }
      let section = sections.find(section => section.title === sectionTitle);
      if (!section) {
        section = {title: sectionTitle, items: []};
        sections.push(section);
      }
      let text = [];
      let textValue = [];
      for (let i = 1; i < 6; i++) {
        if (hierarchy[`lvl${i}`]) {
          text.push(prediction._highlightResult.hierarchy[`lvl${i}`].value);
          textValue.push(hierarchy[`lvl${i}`]);
        }
      }
      section.items.push(
        <Item key={objectID} textValue={textValue.join(' | ')}>
          <Text><span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(text.join(' | '))}} /></Text>
          {
            prediction.content &&
            <Text slot="description">
              <span dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(prediction._snippetResult.content.value)}} />
            </Text>
          }
        </Item>
      );
    });
    let titles = Object.values(sectionTitles);
    sections = sections.sort((a, b) => titles.indexOf(a.title) < titles.indexOf(b.title) ? -1 : 1);
    let suggestions = sections.map((section, index) => <Section key={`${index}-${section.title}`} title={section.title}>{section.items}</Section>);
    setSuggestions(suggestions);
  };

  let onInputChange = (query) => {
    if (!query && predictions) {
      setPredictions(null);
      setSuggestions(null);
    }
    setSearchValue(query);
    searchIndex
      .search(
        query,
        searchOptions
      )
      .then(updatePredictions);
  };

  let onSubmit = (value, key) => {
    if (key) {
      let prediction = predictions.find(prediction => key === prediction.objectID);
      let url = prediction.url;
      window.location.href = `${window.location.hostname === 'reactspectrum.blob.core.windows.net' ? window.location.href.replace(/(.+\/docs\/)(.+)/, '$1') : '/'}${url.replace('https://react-spectrum.adobe.com/', '')}`;
    }
  };

  return (
    <ThemeProvider UNSAFE_className={docsStyle.docSearchBoxThemeProvider}>
      <span role="search">
        <SearchAutocomplete
          aria-label="Search"
          UNSAFE_className={docsStyle.docSearchBox}
          id="algolia-doc-search"
          value={searchValue}
          onInputChange={onInputChange}
          onSubmit={onSubmit}>
          {suggestions}
        </SearchAutocomplete>
      </span>
    </ThemeProvider>
  );
}
