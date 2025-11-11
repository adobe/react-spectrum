export interface SearchableItem {
  name: string,
  tags: string[],
  date?: string
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

/**
 * Filters items based on whether the name or tags include the search value.
 */
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
 * Sorts items to prioritize startsWith matches, then includes matches, then tag matches.
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
