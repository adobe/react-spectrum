'use client';

import {Content, Heading, IllustratedMessage} from '@react-spectrum/s2';
import {getBaseUrl} from './pageUtils';
// @ts-ignore
import {getLibraryFromPage} from './library';
import {iconList, useIconFilter} from './IconSearchView';
import {Key} from 'react-aria-components';

import {type Library, TAB_DEFS} from './constants';
// @ts-ignore
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
import {Page} from '@parcel/rsc';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export interface SearchableItem {
  name: string,
  tags: string[],
  date?: string
}

export interface ComponentItem {
  id: string,
  name: string,
  href: string,
  section: string,
  tags: string[],
  description?: string,
  date?: string
}

export interface Section {
  id: string,
  name: string,
  children: ComponentItem[]
}

export interface Tag {
  id: string,
  name: string,
  href?: string
}

/**
 * Strips markdown link syntax from a string, keeping only the link text.
 */
export function stripMarkdown(description: string | undefined): string {
  return (description || '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
}

/**
 * Transforms a page into a ComponentItem for search/display.
 */
export function transformPageToComponentItem(page: Page): ComponentItem {
  const title = getPageTitle(page);
  const section: string = getSearchSection(page);
  const tags: string[] = (page.exports?.tags || page.exports?.keywords as string[]) || [];
  const description: string = stripMarkdown(page.exports?.description);
  const date: string | undefined = page.exports?.date;
  return {
    id: page.url,
    name: title,
    href: page.url,
    section,
    tags,
    description,
    date
  };
}

const END_SECTIONS = ['blog', 'releases'];

/**
 * Builds sections from pages for a given library.
 * Sorts sections with 'Components' first.
 */
export function buildSectionsFromPages(pages: Page[], library: Library): Section[] {
  const filteredPages = pages.filter(page =>
    getLibraryFromPage(page) === library &&
    !page.exports?.hideFromSearch
  );

  const components = filteredPages.map(transformPageToComponentItem);

  const sectionNames = Array.from(new Set(components.map(c => c.section || 'Components')));

  return sectionNames
    .map(sectionName => ({
      id: sectionName.toLowerCase(),
      name: sectionName,
      children: components.filter(c => (c.section || 'Components') === sectionName)
    }))
    .sort((a, b) => {
      if (a.id === 'components') {
        return -1;
      }
      if (b.id === 'components') {
        return 1;
      }
      let ai = END_SECTIONS.indexOf(a.id);
      let bi = END_SECTIONS.indexOf(b.id);
      if (ai >= 0) {
        return bi < 0 ? 1 : (ai - bi);
      }
      if (bi >= 0) {
        return ai < 0 ? -1 : (bi - ai);
      }
      return a.name.localeCompare(b.name);
    });
}

/**
 * Gets items for a given section selection (handles 'all' and specific sections).
 */
export function getItemsForSection(
  sections: Section[],
  sectionId: string,
  searchValue: string,
  resourceTagIds: string[] = []
): ComponentItem[] {
  // Check if this is a resource tag (e.g., icons) - return empty, handled separately
  if (resourceTagIds.includes(sectionId)) {
    return [];
  }

  let items: ComponentItem[];
  if (sectionId === 'all') {
    items = sections.flatMap(s => s.children);
    if (searchValue.trim().length > 0) {
      items = sortSearchItems(items, searchValue, createSearchOptions<ComponentItem>());
    } else {
      items = sortItemsForDisplay(items, searchValue);
    }
  } else {
    items = sections.find(s => s.id === sectionId)?.children || [];
    items = sortItemsForDisplay(items, searchValue);
  }

  return items;
}

/**
 * Filters sections based on search value.
 */
export function filterSections(sections: Section[], searchValue: string): Section[] {
  if (!searchValue) {
    return sections;
  }

  const allItems = sections.flatMap(section => section.children);
  const sortedItems = filterAndSortSearchItems(allItems, searchValue, createSearchOptions<ComponentItem>());

  const resultsBySection = new Map<string, ComponentItem[]>();
  sortedItems.forEach(item => {
    const section = item.section || 'Components';
    if (!resultsBySection.has(section)) {
      resultsBySection.set(section, []);
    }
    resultsBySection.get(section)!.push(item);
  });

  return sections
    .map(section => ({
      ...section,
      children: resultsBySection.get(section.name) || []
    }))
    .filter(section => section.children.length > 0);
}

/**
 * Hook to build and manage sections for a library with search filtering.
 */
export function useLibrarySections(pages: Page[], library: Library, searchValue: string) {
  const sections = useMemo(
    () => buildSectionsFromPages(pages, library),
    [pages, library]
  );

  const filteredSections = useMemo(
    () => filterSections(sections, searchValue),
    [sections, searchValue]
  );

  const getSectionNames = useCallback(() => {
    return sections.map(s => s.name);
  }, [sections]);

  return {sections, filteredSections, getSectionNames};
}

/**
 * Creates search options for filtering/sorting Page objects directly.
 */
export function createSearchOptionsForPages(): SearchOptions<Page> {
  return {
    getName: (page: Page) => getPageTitle(page),
    getTags: (page: Page) => page.exports?.tags || [],
    getDate: (page: Page) => page.exports?.date,
    shouldUseDateSort: (page: Page) => {
      const section = getSearchSection(page);
      return section === 'Blog' || section === 'Releases';
    }
  };
}

export interface SearchOptions<T> {
  /**
   * Function to extract the name from an item.
   */
  getName: (item: T) => string,
  /**
   * Function to extract tags from an item.
   */
  getTags: (item: T) => string[],
  /**
   * Optional function to extract date from an item for date-based sorting.
   */
  getDate?: (item: T) => string | undefined,
  /**
   * Optional function to determine if an item should use date-based sorting.
   * If not provided, all items use alphabetical sorting.
   */
  shouldUseDateSort?: (item: T) => boolean
}

export function filterSearchItems<T>(
  items: T[],
  searchValue: string,
  options: SearchOptions<T>
): T[] {
  if (!searchValue.trim()) {
    return items;
  }

  const searchLower = searchValue.toLowerCase();
  const {getName, getTags} = options;

  return items.filter(item => {
    const name = getName(item).toLowerCase();
    const tags = getTags(item);
    const nameMatch = name.includes(searchLower);
    const tagMatch = tags.some(tag => tag.toLowerCase().includes(searchLower));
    return nameMatch || tagMatch;
  });
}

/**
 * Sorts items to prioritize `startsWith` matches, then `includes` matches, then tag matches.
 */
export function sortSearchItems<T>(
  items: T[],
  searchValue: string,
  options: SearchOptions<T>
): T[] {
  if (!searchValue.trim()) {
    return items;
  }

  const searchLower = searchValue.toLowerCase();
  const {getName, getDate, shouldUseDateSort} = options;

  return [...items].sort((a, b) => {
    const aName = getName(a).toLowerCase();
    const bName = getName(b).toLowerCase();
    const aNameStartsWith = aName.startsWith(searchLower);
    const bNameStartsWith = bName.startsWith(searchLower);
    const aNameIncludes = aName.includes(searchLower);
    const bNameIncludes = bName.includes(searchLower);

    // Check if either item should use date sorting
    const aUseDateSort = shouldUseDateSort ? shouldUseDateSort(a) : false;
    const bUseDateSort = shouldUseDateSort ? shouldUseDateSort(b) : false;
    const bothUseDateSort = aUseDateSort && bUseDateSort;

    // Prioritize startsWith matches
    if (aNameStartsWith && !bNameStartsWith) {
      return -1;
    }
    if (!aNameStartsWith && bNameStartsWith) {
      return 1;
    }

    // If both start with, sort by date (if both use date sort) or alphabetically
    if (aNameStartsWith && bNameStartsWith) {
      if (bothUseDateSort && getDate) {
        const aDate = getDate(a);
        const bDate = getDate(b);
        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        } else if (aDate && !bDate) {
          return 1;
        } else if (!aDate && bDate) {
          return -1;
        }
      }
      return aName.localeCompare(bName);
    }

    // Prioritize includes matches over tag matches
    if (aNameIncludes && !bNameIncludes) {
      return -1;
    }
    if (!aNameIncludes && bNameIncludes) {
      return 1;
    }

    // If both match by name (includes), sort by date (if both use date sort) or alphabetically
    if (aNameIncludes && bNameIncludes) {
      if (bothUseDateSort && getDate) {
        const aDate = getDate(a);
        const bDate = getDate(b);
        if (aDate && bDate) {
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        } else if (aDate && !bDate) {
          return 1;
        } else if (!aDate && bDate) {
          return -1;
        }
      }
      return aName.localeCompare(bName);
    }

    // If both match by tag, maintain original order
    return 0;
  });
}

export function filterAndSortSearchItems<T>(
  items: T[],
  searchValue: string,
  options: SearchOptions<T>
): T[] {
  const filtered = filterSearchItems(items, searchValue, options);
  return sortSearchItems(filtered, searchValue, options);
}

export function getPageTitle(page: Page): string {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}

/**
 * Gets the search section for a page, preferring `searchSection` over `section`.
 * This allows pages to appear in a different section in search results than in navigation.
 */
export function getSearchSection(page: Page): string {
  return (page.exports?.searchSection as string) ?? (page.exports?.group as string) ?? (page.exports?.section as string) ?? 'Components';
}

export function getOrderedLibraries(currentPage: Page) {
  const allLibraries = (Object.keys(TAB_DEFS) as Library[]).map(id => ({id, ...TAB_DEFS[id]}));
  const currentLibId = getLibraryFromPage(currentPage);
  const currentIndex = allLibraries.findIndex(lib => lib.id === currentLibId);
  if (currentIndex > 0) {
    const currentLib = allLibraries.splice(currentIndex, 1)[0];
    allLibraries.unshift(currentLib);
  }
  return allLibraries;
}


export function getResourceTags(library: Library): Tag[] {
  if (library === 'react-spectrum') {
    return [{id: 'icons', name: 'Icons'}, {id: 'v3', name: 'React Spectrum v3', href: getBaseUrl('s2') + '/v3/getting-started.html'}];
  }
  return [];
}

export function useFilteredIcons(searchValue: string) {
  const iconFilter = useIconFilter();
  return useMemo(() => {
    if (!searchValue.trim()) {
      return iconList;
    }
    return iconList.filter(item => iconFilter(item.id, searchValue));
  }, [searchValue, iconFilter]);
}

export function useSearchTagSelection(
  searchValue: string,
  sectionTags: Tag[],
  resourceTags: Tag[],
  initialTagId: string,
  isOpen: boolean
) {
  const [selectedTagId, setSelectedTagId] = useState<string>(initialTagId);
  const [hasAllBeenShown, setHasAllBeenShown] = useState<boolean>(false);
  const prevSearchWasEmptyRef = useRef<boolean>(true);

  // Ensure selected tag is valid for the current library
  const baseSectionIds = sectionTags.map(s => s.id);
  const resourceTagIds = resourceTags.map(t => t.id);
  const allBaseIds = useMemo(() => [...baseSectionIds, ...resourceTagIds], [baseSectionIds, resourceTagIds]);
  const isResourceSelected = selectedTagId && resourceTagIds.includes(selectedTagId);

  // "All" tag is shown when search starts (first time search value is non-empty and no resource is selected)
  const shouldTriggerAll = searchValue.trim().length > 0 && !isResourceSelected;

  // Track if "All" has been shown, and once shown, keep showing it
  if (shouldTriggerAll && !hasAllBeenShown) {
    setHasAllBeenShown(true);
  } else if (!isOpen && hasAllBeenShown) {
    setHasAllBeenShown(false);
  }

  const sectionIds = useMemo(() => {
    return hasAllBeenShown ? ['all', ...allBaseIds] : allBaseIds;
  }, [hasAllBeenShown, allBaseIds]);

  let defaultTagId = sectionIds.includes(initialTagId) ? initialTagId : sectionIds[0] || 'components';
  if (!selectedTagId || !sectionIds.includes(selectedTagId) || (!isOpen && selectedTagId !== defaultTagId)) {
    setSelectedTagId(defaultTagId);
  }

  // Auto-select "All" when search starts (unless resource is selected)
  useEffect(() => {
    const isEmpty = searchValue.trim().length === 0;
    if (prevSearchWasEmptyRef.current && !isEmpty && !isResourceSelected) {
      setSelectedTagId('all');
    }
    prevSearchWasEmptyRef.current = isEmpty;
  }, [searchValue, isResourceSelected]);

  return [selectedTagId, setSelectedTagId] as const;
}

export function useSectionTagsForDisplay(
  sections: Section[],
  searchValue: string,
  selectedTagId: string,
  resourceTagIds: string[],
  isOpen: boolean
): Tag[] {
  const [hasAllBeenShown, setHasAllBeenShown] = useState<boolean>(false);

  // Track if "All" should be triggered (search value exists and no resource is selected)
  const shouldTriggerAll = searchValue.trim().length > 0 && !resourceTagIds.includes(selectedTagId);

  // Once "All" has been shown, keep showing it
  if (shouldTriggerAll && !hasAllBeenShown) {
    setHasAllBeenShown(true);
  } else if (!isOpen && hasAllBeenShown) {
    setHasAllBeenShown(false);
  }

  return useMemo(() => {
    const base = sections.map(s => ({id: s.id, name: s.name}));
    if (hasAllBeenShown) {
      return [{id: 'all', name: 'All'}, ...base];
    }
    return base;
  }, [sections, hasAllBeenShown]);
}

export function sortItemsForDisplay<T extends {name: string, href: string, date?: string}>(items: T[], searchValue: string): T[] {
  if (searchValue.trim().length === 0) {
    return [...items].sort((a, b) => {
      const aIsIntro = a.href.endsWith('/');
      const bIsIntro = b.href.endsWith('/');

      // Date sorting for Blog/Releases
      if (a.date && b.date) {
        const aDate = new Date(a.date);
        const bDate = new Date(b.date);
        return bDate.getTime() - aDate.getTime();
      } else if (a.date && !b.date) {
        return 1;
      } else if (!a.date && b.date) {
        return -1;
      }

      // Introduction first
      if (aIsIntro && !bIsIntro) {
        return -1;
      }
      if (!aIsIntro && bIsIntro) {
        return 1;
      }
      // Sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }
  return items;
}

export function createSearchOptions<T extends {name: string, tags: string[], date?: string, section?: string}>() {
  return {
    getName: (item: T) => item.name,
    getTags: (item: T) => item.tags,
    getDate: (item: T) => item.date,
    shouldUseDateSort: (item: T) => {
      const section = item.section;
      return section === 'Blog' || section === 'Releases';
    }
  };
}

export function SearchEmptyState({searchValue, libraryLabel}: {searchValue: string, libraryLabel: string}) {
  return (
    <IllustratedMessage styles={style({margin: 32})}>
      <NoSearchResults />
      <Heading>No results</Heading>
      {searchValue.trim().length > 0 ? (
        <Content>
          No results found for <strong className={style({fontWeight: 'bold'})}>{searchValue}</strong> in {libraryLabel}.
        </Content>
      ) : (
        <Content>
          No results found in {libraryLabel}.
        </Content>
      )}
    </IllustratedMessage>
  );
}

export const LazyIconSearchView = React.lazy(() =>
  import('./IconSearchView').then(({IconSearchView}) => ({default: IconSearchView}))
);

export interface SearchMenuStateOptions {
  pages: Page[],
  currentPage: Page,
  initialSearchValue?: string,
  initialTag?: string,
  isOpen: boolean
}

export interface SearchMenuState {
  // Library state
  selectedLibrary: Library,
  setSelectedLibrary: (library: Library) => void,
  orderedLibraries: ReturnType<typeof getOrderedLibraries>,

  // Search state
  searchValue: string,
  setSearchValue: (value: string) => void,

  // Section state
  sections: Section[],
  filteredSections: Section[],
  sectionTags: Tag[],
  sectionTagsForDisplay: Tag[],

  // Resource tags (icons, etc.)
  resourceTags: Tag[],
  resourceTagIds: string[],

  // Tag selection
  selectedTagId: string,
  setSelectedTagId: (id: string) => void,
  handleTagSelectionChange: (keys: Iterable<Key>) => void,

  // Icons
  filteredIcons: typeof iconList,
  iconFilter: ReturnType<typeof useIconFilter>,
  isIconsSelected: boolean,

  // Computed items
  selectedItems: ComponentItem[],
  selectedSectionName: string,

  // Helpers
  getPlaceholderText: (libraryLabel: string) => string
}

export function useSearchMenuState(options: SearchMenuStateOptions): SearchMenuState {
  const {pages, currentPage, initialSearchValue = '', initialTag} = options;

  // Library state
  const currentLibrary = getLibraryFromPage(currentPage);
  const [selectedLibrary, setSelectedLibrary] = useState<Library>(currentLibrary);
  const orderedLibraries = useMemo(() => getOrderedLibraries(currentPage), [currentPage]);

  // Search state
  const [searchValue, setSearchValue] = useState(initialSearchValue);

  // Build sections for the selected library
  const {sections, filteredSections} = useLibrarySections(
    pages || [],
    selectedLibrary,
    searchValue
  );

  // Section and resource tags
  const sectionTags = useMemo(() => sections.map(s => ({id: s.id, name: s.name})), [sections]);
  const resourceTags = useMemo(() => getResourceTags(selectedLibrary), [selectedLibrary]);
  const resourceTagIds = useMemo(() => resourceTags.map(t => t.id), [resourceTags]);

  // Compute initial selected section
  const initialSelectedSection = useMemo(() => {
    const currentSection = sections.find(s =>
      s.children.some(c => c.href === currentPage.url)
    );
    return initialTag || currentSection?.id || currentPage.exports?.section?.toLowerCase() || 'components';
  }, [initialTag, currentPage, sections]);

  // Tag selection
  const [selectedTagId, setSelectedTagId] = useSearchTagSelection(
    searchValue,
    sectionTags,
    resourceTags,
    initialSelectedSection,
    options.isOpen
  );

  // Section tags for display (includes "All" when searching)
  const sectionTagsForDisplay = useSectionTagsForDisplay(
    sections,
    searchValue,
    selectedTagId,
    resourceTagIds,
    options.isOpen
  );

  // Icons
  const filteredIcons = useFilteredIcons(searchValue);
  const iconFilter = useIconFilter();
  const isIconsSelected = selectedTagId === 'icons';

  // Handler for tag selection change (works with TagGroup's onSelectionChange)
  const handleTagSelectionChange = useCallback((keys: Iterable<Key>) => {
    const firstKey = Array.from(keys)[0] as string;
    if (firstKey) {
      setSelectedTagId(firstKey);
    }
  }, [setSelectedTagId]);

  // Computed selected items
  const selectedItems = useMemo(() => {
    return getItemsForSection(filteredSections, selectedTagId, searchValue, resourceTagIds);
  }, [filteredSections, selectedTagId, searchValue, resourceTagIds]);

  // Computed section name for aria-label
  const selectedSectionName = useMemo(() => {
    if (selectedTagId === 'all') {
      return 'All';
    }
    return (filteredSections.find(s => s.id === selectedTagId)?.name)
      || (sections.find(s => s.id === selectedTagId)?.name)
      || 'Items';
  }, [filteredSections, sections, selectedTagId]);

  // Helper to get placeholder text based on selected resource tag
  const getPlaceholderText = useCallback((libraryLabel: string) => {
    const selectedResourceTag = resourceTags.find(tag => tag.id === selectedTagId);
    return selectedResourceTag
      ? `Search ${selectedResourceTag.name}`
      : `Search ${libraryLabel}`;
  }, [resourceTags, selectedTagId]);

  // Reset search value after search menu closes.
  if (!options.isOpen && searchValue) {
    setSearchValue('');
  }

  return {
    // Library state
    selectedLibrary,
    setSelectedLibrary,
    orderedLibraries,

    // Search state
    searchValue,
    setSearchValue,

    // Section state
    sections,
    filteredSections,
    sectionTags,
    sectionTagsForDisplay,

    // Resource tags
    resourceTags,
    resourceTagIds,

    // Tag selection
    selectedTagId,
    setSelectedTagId,
    handleTagSelectionChange,

    // Icons
    filteredIcons,
    iconFilter,
    isIconsSelected,

    // Computed items
    selectedItems,
    selectedSectionName,

    // Helpers
    getPlaceholderText
  };
}
