"use client";
import {GridList, GridListItem} from 'tailwind-starter/GridList';
import {Plant} from './plants';
import {PlantActionMenu} from './PlantActionMenu';

interface PlantListProps {
  items: Plant[],
  onFavoriteChange: (id: number, isFavorite: boolean) => void,
  onEdit: (item: Plant) => void,
  onDelete: (item: Plant) => void
}

/* Rendered on mobile in place of the PlantTable */
export function PlantList(props: PlantListProps) {
  let {items, onFavoriteChange, onEdit, onDelete} = props;
  return (
    <GridList
      aria-label="My plants"
      selectionMode="multiple"
      items={items}
      renderEmptyState={() => 'No results. Try changing the filters.'}
      className="h-[320px] w-full md:!hidden">
      {item => (
        <GridListItem textValue={item.common_name}>
          <div className="grid grid-cols-[40px_1fr_auto] gap-x-2 w-full">
            <img alt="" src={item.default_image?.thumbnail} className="inline rounded-sm row-span-2 object-contain h-[40px]" />
            <span className="truncate capitalize">{item.common_name}</span>
            <span className="truncate text-xs text-gray-600 dark:text-zinc-400 col-start-2 row-start-2">{item.scientific_name}</span>
            <PlantActionMenu
              item={item}
              onFavoriteChange={onFavoriteChange}
              onEdit={onEdit}
              onDelete={onDelete} />
          </div>
        </GridListItem>
      )}
    </GridList>
  );
}
