'use client';

import {Content, Heading, IllustratedMessage} from '@react-spectrum/s2';
import {getLibraryFromPage} from './library';
// @ts-ignore
import {iconList, useIconFilter} from './IconSearchView';
import {type Library, TAB_DEFS} from './constants';
// eslint-disable-next-line monorepo/no-internal-import
import NoSearchResults from '@react-spectrum/s2/illustrations/linear/NoSearchResults';
// @ts-ignore
import {Page} from '@parcel/rsc';
import React, {useEffect, useMemo, useRef, useState} from 'react';
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
  name: string
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
    return [{id: 'icons', name: 'Icons'}];
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
  initialTagId: string
) {
  const [selectedTagId, setSelectedTagId] = useState<string>(initialTagId);
  const prevSearchWasEmptyRef = useRef<boolean>(true);

  // Ensure selected tag is valid for the current library
  const baseSectionIds = sectionTags.map(s => s.id);
  const resourceTagIds = resourceTags.map(t => t.id);
  const allBaseIds = useMemo(() => [...baseSectionIds, ...resourceTagIds], [baseSectionIds, resourceTagIds]);
  const isResourceSelected = selectedTagId && resourceTagIds.includes(selectedTagId);
  const sectionIds = useMemo(() => {
    return searchValue.trim().length > 0 && !isResourceSelected ? ['all', ...allBaseIds] : allBaseIds;
  }, [searchValue, isResourceSelected, allBaseIds]);
  
  useEffect(() => {
    if (!selectedTagId || !sectionIds.includes(selectedTagId)) {
      setSelectedTagId(sectionIds[0] || 'components');
    }
  }, [selectedTagId, sectionIds, setSelectedTagId]);

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
  resourceTagIds: string[]
): Tag[] {
  return useMemo(() => {
    const base = sections.map(s => ({id: s.id, name: s.name}));
    if (searchValue.trim().length > 0 && !resourceTagIds.includes(selectedTagId)) {
      return [{id: 'all', name: 'All'}, ...base];
    }
    return base;
  }, [sections, searchValue, selectedTagId, resourceTagIds]);
}

export function sortItemsForDisplay<T extends {name: string, date?: string}>(items: T[], searchValue: string): T[] {
  if (searchValue.trim().length === 0) {
    return [...items].sort((a, b) => {
      const aIsIntro = a.name === 'Introduction';
      const bIsIntro = b.name === 'Introduction';

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
      return 0;
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
