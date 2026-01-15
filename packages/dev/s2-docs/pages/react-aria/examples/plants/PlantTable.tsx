import {Cell, Column, Row, Table, TableHeader, TableBody} from 'tailwind-starter/Table';
import {StarIcon} from 'lucide-react';
import {ColumnProps, Key, SortDescriptor, ToggleButton, ToggleButtonProps, VisuallyHidden} from 'react-aria-components';
import {focusRing} from 'tailwind-starter/utils';
import {Plant} from './plants';
import React, {useMemo} from 'react';
import {tv} from 'tailwind-variants';
import {CycleLabel, getSunlight, SunLabel, WateringLabel} from './Labels';
import {PlantActionMenu} from './PlantActionMenu';

const allColumns: ColumnProps[] = [
  {id: 'favorite', children: <VisuallyHidden>Favorite</VisuallyHidden>, width: 40, minWidth: 40},
  {id: 'common_name', children: 'Name', minWidth: 150, allowsSorting: true},
  {id: 'cycle', children: 'Cycle', defaultWidth: 120, allowsSorting: true},
  {id: 'sunlight', children: 'Sunlight', defaultWidth: 120, allowsSorting: true},
  {id: 'watering', children: 'Watering', defaultWidth: 120, allowsSorting: true},
  {id: 'actions', children: <VisuallyHidden>Actions</VisuallyHidden>, width: 64, minWidth: 64}
];

interface PlantTableProps {
  sortDescriptor: SortDescriptor,
  onSortChange: (sortDescriptor: SortDescriptor) => void,
  visibleColumns: 'all' | Set<Key>,
  items: Plant[],
  onFavoriteChange: (id: number, isFavorite: boolean) => void,
  onEdit: (item: Plant) => void,
  onDelete: (item: Plant) => void
}

export function PlantTable(props: PlantTableProps): React.ReactNode {
  let {sortDescriptor, onSortChange, visibleColumns, items, onFavoriteChange, onEdit, onDelete} = props;
  let columns = useMemo(() => {
    let res = allColumns.filter(c => visibleColumns === 'all' || visibleColumns.has(c.id!));
    res[1] = {...res[1], isRowHeader: true};
    return res;
  }, [visibleColumns]);
  
  return (
    <Table
      aria-label="My plants"
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      onSortChange={onSortChange}
      className="h-[320px] hidden md:block">
      <TableHeader columns={columns}>
        {column => <Column {...column} />}
      </TableHeader>
      <TableBody
        items={items}
        dependencies={[columns]}
        renderEmptyState={() => 'No results. Try changing the filters.'}>
        {item => (
          <Row columns={columns}>
            {column => {
              switch (column.id) {
                case 'favorite':
                  return (
                    <Cell>
                      <FavoriteButton isSelected={item.isFavorite} onChange={v => onFavoriteChange(item.id, v)} />
                    </Cell>
                  );
                case 'common_name':
                  return (
                    <Cell textValue={item.common_name}>
                      <div className="grid grid-cols-[40px_1fr] gap-x-2">
                        <img alt="" src={item.default_image?.thumbnail} className="inline rounded-sm row-span-2 object-contain h-[40px] w-[40px]" />
                        <span className="truncate capitalize">{item.common_name}</span>
                        <span className="truncate text-xs text-gray-600 dark:text-zinc-400">{item.scientific_name}</span>
                      </div>
                    </Cell>
                  );
                case 'cycle':
                  return <Cell><CycleLabel cycle={item.cycle} /></Cell>;
                case 'sunlight':
                  return <Cell><SunLabel sun={getSunlight(item)} /></Cell>;
                case 'watering':
                  return <Cell><WateringLabel watering={item.watering} /></Cell>;
                case 'actions':
                  return (
                    <Cell>
                      <PlantActionMenu
                        item={item}
                        onFavoriteChange={onFavoriteChange}
                        onEdit={onEdit}
                        onDelete={onDelete} />
                    </Cell>
                  );
                default:
                  return <></>;
              }
            } }
          </Row>
        )}
      </TableBody>
    </Table>
  );
}

const favoriteButtonStyles = tv({
  extend: focusRing,
  base: 'group cursor-default align-middle rounded-sm border-0 bg-transparent p-0',
  variants: {
    isSelected: {
      false: 'text-gray-500 dark:text-zinc-400 pressed:text-gray-600 dark:pressed:text-zinc-300',
      true: 'text-gray-700 dark:text-slate-300 pressed:text-gray-800 dark:pressed:text-slate-200'
    }
  }
});

function FavoriteButton(props: ToggleButtonProps) {
  return (
    <ToggleButton aria-label="Favorite" {...props} className={favoriteButtonStyles}>
      <StarIcon className="w-5 h-5 fill-white dark:fill-zinc-900 group-selected:fill-current" />
    </ToggleButton>
  );
}
