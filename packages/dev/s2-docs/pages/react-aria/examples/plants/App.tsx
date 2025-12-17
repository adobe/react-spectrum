"use client";
import {AlertDialog} from 'tailwind-starter/AlertDialog';
import {Button} from 'tailwind-starter/Button';
import {Checkbox} from 'tailwind-starter/Checkbox';
import {FilterIcon, PlusIcon, RefreshCw, SlidersIcon} from 'lucide-react';
import {DialogTrigger, Heading, Key, Selection, SortDescriptor, TooltipTrigger} from 'react-aria-components';
import {Dialog} from 'tailwind-starter/Dialog';
import {Menu, MenuItem, MenuTrigger} from 'tailwind-starter/Menu';
import {Modal} from 'tailwind-starter/Modal';
import plants, {Plant} from './plants';
import {Popover} from 'tailwind-starter/Popover';
import React, {useState} from 'react';
import {SearchField} from 'tailwind-starter/SearchField';
import {Tag, TagGroup} from 'tailwind-starter/TagGroup';
import {Tooltip} from 'tailwind-starter/Tooltip';
import {useCollator, useFilter} from 'react-aria';
import {getSunlight, sunIcons, wateringIcons} from './Labels';
import {PlantTable} from './PlantTable';
import {PlantDialog} from './PlantDialog';
import {PlantList} from './PlantList';

export default function App(): React.ReactNode {
  let [allItems, setAllItems] = useState<Plant[]>(() => plants.map(p => ({...p, isFavorite: false})));
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'common_name',
    direction: 'ascending'
  });

  let [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(['favorite', 'common_name', 'sunlight', 'watering', 'actions']));

  // Filter state.
  let [search, setSearch] = useState('');
  let [favorite, setFavorite] = useState(false);
  let [cycles, setCycles] = useState<Selection>(new Set());
  let [sunlight, setSunlight] = useState<Selection>(new Set());
  let [watering, setWatering] = useState<Selection>(new Set());

  // Filter and sort items.
  let {contains} = useFilter({sensitivity: 'base'});
  let collator = useCollator();
  let dir = sortDescriptor.direction === 'descending' ? -1 : 1;
  let items = allItems
    .filter(item =>
      (contains(item.common_name, search) || contains(item.scientific_name.join(''), search))
        && (!favorite || item.isFavorite)
        && (cycles === 'all' || cycles.size === 0 || cycles.has(item.cycle))
        && (sunlight === 'all' || sunlight.size === 0 || sunlight.has(getSunlight(item)))
        && (watering === 'all' || watering.size === 0 || watering.has(item.watering))
    )
    .sort((a: any, b: any) => collator.compare(a[sortDescriptor.column!], b[sortDescriptor.column!]) * dir);

  // Count applied filters for button badge.
  let filters = 0;
  if (favorite) {
    filters++;
  }
  if (cycles !== 'all') {
    filters += cycles.size;
  }
  if (sunlight !== 'all') {
    filters += sunlight.size;
  }
  if (watering !== 'all') {
    filters += watering.size;
  }

  let clearFilters = () => {
    setFavorite(false);
    setCycles(new Set());
    setSunlight(new Set());
    setWatering(new Set());
  };

  // Toggle whether an item is a favorite.
  let onFavoriteChange = (id: number, isFavorite: boolean) => {
    setAllItems(allItems => {
      let items = [...allItems];
      let index = items.findIndex(item => item.id === id);
      items[index] = {...items[index], isFavorite};
      return items;
    });
  };

  // Add, edit, and delete items.
  let addItem = (item: Plant) => {
    setAllItems(allItems => [...allItems, item]);
  };

  let editItem = (item: Plant) => {
    setAllItems(allItems => {
      let items = [...allItems];
      let index = items.findIndex(i => i.id === item.id);
      items[index] = item;
      return items;
    });
  };

  let deleteItem = () => {
    setAllItems(allItems => {
      if (!actionItem) {
        return allItems;
      }

      let items = [...allItems];
      let index = items.findIndex(item => item.id === actionItem!.id);
      items.splice(index, 1);
      return items;
    });
  };

  let [dialog, setDialog] = useState<Key | null>(null);
  let [actionItem, setActionItem] = useState<Plant | null>(null);
  let onEdit = (item: Plant) => {
    setDialog('edit');
    setActionItem(item);
  };

  let onDelete = (item: Plant) => {
    setDialog('delete');
    setActionItem(item);
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-[600px] mx-auto">
      <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.1fr_auto_auto_1fr_auto] gap-2 items-end">
        <SearchField
          aria-label="Search plants"
          placeholder="Search plants"
          value={search}
          onChange={setSearch}
          className="col-span-3 sm:col-span-1" />

        {/* Filters */}
        <DialogTrigger>
          <TooltipTrigger>
            <Button aria-label="Filters" variant="secondary" className="!w-9 !h-9 shrink-0 relative">
              <FilterIcon aria-hidden className="block w-5 h-5 shrink-0" />
              {filters > 0 && <div className="absolute -top-2 -right-2 rounded-full h-4 aspect-square text-white text-xs bg-blue-600">{filters}</div>}
            </Button>
            <Tooltip>Filters</Tooltip>
          </TooltipTrigger>
          <Popover showArrow>
            <Dialog className="outline outline-0 p-4 max-h-[inherit] overflow-auto w-[350px]">
              <Heading slot="title" className="text-lg font-semibold m-0 mb-2">Filters</Heading>
              {filters > 0 && <Button onPress={clearFilters} variant="secondary" className="absolute top-4 right-4 h-auto py-1 px-2 text-xs">Clear</Button>}
              <div className="flex flex-col gap-4">
                <Checkbox isSelected={favorite} onChange={setFavorite}>Favorite</Checkbox>
                <TagGroup label="Cycle" selectionMode="multiple" selectedKeys={cycles} onSelectionChange={setCycles} escapeKeyBehavior="none">
                  <Tag id="Annual" color="green" textValue="Annual"><RefreshCw className="w-4 h-4 shrink-0" /> Annual</Tag>
                  <Tag id="Perennial" color="green" textValue="Perennial"><RefreshCw className="w-4 h-4 shrink-0" /> Perennial</Tag>
                </TagGroup>
                <TagGroup label="Sunlight" selectionMode="multiple" selectedKeys={sunlight} onSelectionChange={setSunlight} escapeKeyBehavior="none">
                  <Tag id="full sun" color="yellow" textValue="Full Sun">{sunIcons['full sun']} Full Sun</Tag>
                  <Tag id="part sun" color="yellow" textValue="Part Sun">{sunIcons['part sun']} Part Sun</Tag>
                  <Tag id="part shade" color="yellow" textValue="Part Shade">{sunIcons['part shade']} Part Shade</Tag>
                </TagGroup>
                <TagGroup label="Watering" selectionMode="multiple" selectedKeys={watering} onSelectionChange={setWatering} escapeKeyBehavior="none">
                  <Tag id="Frequent" color="blue" textValue="Frequent">{wateringIcons['Frequent']} Frequent</Tag>
                  <Tag id="Average" color="blue" textValue="Average">{wateringIcons['Average']} Average</Tag>
                  <Tag id="Minimum" color="blue" textValue="Minimum">{wateringIcons['Minimum']} Minimum</Tag>
                </TagGroup>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>

        {/* Columns */}
        <MenuTrigger>
          <TooltipTrigger>
            <Button aria-label="Columns" variant="secondary" className="!w-9 !h-9 shrink-0 hidden sm:flex">
              <SlidersIcon aria-hidden className="block w-5 h-5" />
            </Button>
            <Tooltip>Columns</Tooltip>
          </TooltipTrigger>
          <Menu selectionMode="multiple" selectedKeys={visibleColumns} onSelectionChange={setVisibleColumns}>
            <MenuItem id="common_name">Name</MenuItem>
            <MenuItem id="cycle">Cycle</MenuItem>
            <MenuItem id="sunlight">Sunlight</MenuItem>
            <MenuItem id="watering">Watering</MenuItem>
          </Menu>
        </MenuTrigger>

        <DialogTrigger>
          <Button aria-label="Add plant" variant="secondary" className="!w-9 !h-9 shrink-0 col-start-5">
            <PlusIcon aria-hidden className="block w-5 h-5" />
          </Button>
          <Modal>
            <PlantDialog onSave={addItem} />
          </Modal>
        </DialogTrigger>
      </div>
      {/* List view for mobile */}
      <PlantList
        items={items}
        onFavoriteChange={onFavoriteChange}
        onEdit={onEdit}
        onDelete={onDelete} />
      {/* Table view for desktop */}
      <PlantTable
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        visibleColumns={visibleColumns}
        items={items}
        onFavoriteChange={onFavoriteChange}
        onEdit={onEdit}
        onDelete={onDelete} />
      <Modal isOpen={dialog === 'delete'} onOpenChange={() => setDialog(null)}>
        <AlertDialog title="Delete Plant" variant="destructive" actionLabel="Delete" onAction={deleteItem}>
          Are you sure you want to delete "{actionItem?.common_name}"?
        </AlertDialog>
      </Modal>
      <Modal isOpen={dialog === 'edit'} onOpenChange={() => setDialog(null)}>
        <PlantDialog item={actionItem} onSave={editItem} />
      </Modal>
    </div>
  );
}
