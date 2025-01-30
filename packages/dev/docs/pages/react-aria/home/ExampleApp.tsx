/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AlertDialog} from 'tailwind-starter/AlertDialog';
import {Arrow} from './components';
import {Button} from 'tailwind-starter/Button';
import {Cell, Column, Row, TableHeader} from 'tailwind-starter/Table';
import {Checkbox} from 'tailwind-starter/Checkbox';
import {CloudSun, Dessert, Droplet, Droplets, FilterIcon, Mail, MoreHorizontal, PencilIcon, PlusIcon, RefreshCw, ShareIcon, SlidersIcon, StarIcon, Sun, SunDim, TrashIcon, Twitter} from 'lucide-react';
import {ColumnProps, Dialog, DialogTrigger, DropZone, Form, Heading, isFileDropItem, Key, MenuTrigger, ModalOverlay, ModalOverlayProps, Modal as RACModal, ResizableTableContainer, Selection, SortDescriptor, SubmenuTrigger, Table, TableBody, Text, ToggleButton, ToggleButtonProps, TooltipTrigger} from 'react-aria-components';
import {ComboBox, ComboBoxItem} from 'tailwind-starter/ComboBox';
import {DatePicker} from 'tailwind-starter/DatePicker';
import {focusRing} from 'tailwind-starter/utils';
import {getLocalTimeZone, today} from '@internationalized/date';
import {GridList, GridListItem} from 'tailwind-starter/GridList';
import {Menu, MenuItem} from 'tailwind-starter/Menu';
import {Modal} from 'tailwind-starter/Modal';
import plants from './plants';
import {Popover} from 'tailwind-starter/Popover';
import React, {ReactElement, UIEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {SearchField} from 'tailwind-starter/SearchField';
import {Select, SelectItem} from 'tailwind-starter/Select';
import {Tag, TagGroup} from 'tailwind-starter/TagGroup';
import {TextField} from 'tailwind-starter/TextField';
import {Tooltip} from 'tailwind-starter/Tooltip';
import {tv} from 'tailwind-variants';
import {useCollator, useFilter, VisuallyHidden} from 'react-aria';
import {useMediaQuery} from '@react-spectrum/utils';

type Plant = typeof plants[0] & {isFavorite: boolean};

const allColumns: ColumnProps[] = [
  {id: 'favorite', children: <VisuallyHidden>Favorite</VisuallyHidden>, width: 40, minWidth: 40},
  {id: 'common_name', children: 'Name', minWidth: 150, allowsSorting: true},
  {id: 'cycle', children: 'Cycle', defaultWidth: 120, allowsSorting: true},
  {id: 'sunlight', children: 'Sunlight', defaultWidth: 120, allowsSorting: true},
  {id: 'watering', children: 'Watering', defaultWidth: 120, allowsSorting: true},
  {id: 'actions', children: <VisuallyHidden>Actions</VisuallyHidden>, width: 44, minWidth: 44}
];

let hideOnScroll = document.getElementById('hideOnScroll');

export function ExampleApp() {
  let [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'common_name',
    direction: 'ascending'
  });

  let [allItems, setAllItems] = useState(() => plants.map(p => ({...p, isFavorite: false})));
  let [search, setSearch] = useState('');
  let [favorite, setFavorite] = useState(false);
  let [cycles, setCycles] = useState<Selection>(new Set());
  let [sunlight, setSunlight] = useState<Selection>(new Set());
  let [watering, setWatering] = useState<Selection>(new Set());

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

  let [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(['favorite', 'common_name', 'sunlight', 'watering', 'actions']));
  let columns = useMemo(() => {
    let res = allColumns.filter(c => visibleColumns === 'all' || visibleColumns.has(c.id!));
    res[1] = {...res[1], isRowHeader: true};
    return res;
  }, [visibleColumns]);

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

  let toggleFavorite = (id: number, isFavorite: boolean) => {
    setAllItems(allItems => {
      let items = [...allItems];
      let index = items.findIndex(item => item.id === id);
      items[index] = {...items[index], isFavorite};
      return items;
    });
  };

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

  let [isScrolled, setScrolled] = useState(false);
  let onScroll = (e: UIEvent<HTMLDivElement>) => {
    if (hideOnScroll) {
      let newIsScrolled = e.currentTarget.scrollTop > 0 || e.currentTarget.scrollLeft > 0;
      if (newIsScrolled !== isScrolled) {
        setScrolled(newIsScrolled);
      }
    }
  };

  let hasAtLeast4Items = items.length >= 4;
  useEffect(() => {
    if (hideOnScroll) {
      hideOnScroll.style.opacity = isScrolled || !hasAtLeast4Items ? '0' : '1';
    }
  }, [isScrolled, hasAtLeast4Items]);

  let [dialog, setDialog] = useState<Key | null>(null);
  let [actionItem, setActionItem] = useState<Plant | null>(null);
  let onAction = (item: typeof items[0], action: Key) => {
    switch (action) {
      case 'favorite':
        toggleFavorite(item.id, !item.isFavorite);
        break;
      default:
        setDialog(action);
        setActionItem(item);
        break;
    }
  };

  let onDialogClose = () => setDialog(null);

  let isSmall = useMediaQuery('(max-width: 640px)');

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1.1fr_auto_auto_1fr_auto] gap-2 items-end">
        <SearchField aria-label="Search" value={search} onChange={setSearch} className="col-span-3 sm:col-span-1" />
        <DialogTrigger>
          <TooltipTrigger>
            <Button aria-label="Filters" variant="secondary" className="w-9 h-9 shrink-0 p-0 relative">
              <FilterIcon aria-hidden className="inline w-5 h-5" />
              {filters > 0 && <div className="absolute -top-2 -right-2 rounded-full h-4 aspect-square text-white text-xs bg-blue-600">{filters}</div>}
            </Button>
            <Tooltip>Filters</Tooltip>
          </TooltipTrigger>
          <Popover showArrow>
            <Dialog className="outline outline-0 p-4 max-h-[inherit] overflow-auto w-[350px]">
              <Heading slot="title" className="text-lg font-semibold mb-2">Filters</Heading>
              {filters > 0 && <Button onPress={clearFilters} variant="secondary" className="absolute top-4 right-4 py-1 px-2 text-xs">Clear</Button>}
              <div className="flex flex-col gap-4">
                <Checkbox isSelected={favorite} onChange={setFavorite}>Favorite</Checkbox>
                <TagGroup label="Cycle" selectionMode="multiple" selectedKeys={cycles} onSelectionChange={setCycles}>
                  <Tag id="Annual" color="green" textValue="Annual"><RefreshCw className="w-4 h-4 shrink-0" /> Annual</Tag>
                  <Tag id="Perennial" color="green" textValue="Perennial"><RefreshCw className="w-4 h-4 shrink-0" /> Perennial</Tag>
                </TagGroup>
                <TagGroup label="Sunlight" selectionMode="multiple" selectedKeys={sunlight} onSelectionChange={setSunlight}>
                  <Tag id="full sun" color="yellow" textValue="Full Sun">{sunIcons['full sun']} Full Sun</Tag>
                  <Tag id="part sun" color="yellow" textValue="Part Sun">{sunIcons['part sun']} Part Sun</Tag>
                  <Tag id="part shade" color="yellow" textValue="Part Shade">{sunIcons['part shade']} Part Shade</Tag>
                </TagGroup>
                <TagGroup label="Watering" selectionMode="multiple" selectedKeys={watering} onSelectionChange={setWatering}>
                  <Tag id="Frequent" color="blue" textValue="Frequent">{wateringIcons['Frequent']} Frequent</Tag>
                  <Tag id="Average" color="blue" textValue="Average">{wateringIcons['Average']} Average</Tag>
                  <Tag id="Minimum" color="blue" textValue="Minimum">{wateringIcons['Minimum']} Minimum</Tag>
                </TagGroup>
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
        <MenuTrigger>
          <TooltipTrigger>
            <Button aria-label="Columns" variant="secondary" className="w-9 h-9 shrink-0 p-0 hidden sm:block">
              <SlidersIcon aria-hidden className="inline w-5 h-5" />
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
          <Button aria-label="Add plant" variant="secondary" className="w-9 h-9 shrink-0 p-0 col-start-5">
            <PlusIcon aria-hidden className="inline w-5 h-5" />
          </Button>
          <PlantModal>
            <PlantDialog onSave={addItem} />
          </PlantModal>
        </DialogTrigger>
      </div>
      {isSmall &&
        <GridList aria-label="My plants" selectionMode="multiple" items={items} className="flex-1 w-full">
          {item => (
            <GridListItem textValue={item.common_name}>
              <div className="grid grid-cols-[40px_1fr_auto] gap-x-2 w-full">
                <img alt="" src={item.default_image?.thumbnail} className="inline rounded-sm row-span-3 object-contain h-[40px]" />
                <span className="truncate capitalize">{item.common_name}</span>
                <span className="truncate text-xs text-gray-600 dark:text-zinc-400 col-start-2 row-start-2">{item.scientific_name}</span>
                <MenuTrigger>
                  <Button aria-label="Actions" variant="icon" className="row-span-2 place-self-center"><MoreHorizontal className="w-5 h-5" /></Button>
                  <Menu placement="bottom end" onAction={action => onAction(item, action)}>
                    <MenuItem id="favorite"><StarIcon aria-hidden className="w-4 h-4" /> {item.isFavorite ? 'Unfavorite' : 'Favorite'}</MenuItem>
                    <MenuItem id="edit"><PencilIcon aria-hidden className="w-4 h-4" /> Edit…</MenuItem>
                    <MenuItem id="delete"><TrashIcon aria-hidden className="w-4 h-4" /> Delete…</MenuItem>
                    <SubmenuTrigger>
                      <MenuItem aria-label="Share">
                        <ShareIcon aria-hidden className="w-4 h-4" />
                        Share
                      </MenuItem>
                      <Menu>
                        <MenuItem href={`https://x.com/intent/tweet?text=${encodeURIComponent(item.common_name)}`} target="blank" rel="noopener noreferrer" aria-label="X"><Twitter aria-hidden className="w-4 h-4" /> X…</MenuItem>
                        <MenuItem href={`mailto:abc@example.com?subject=${encodeURIComponent(item.common_name)}`} target="blank" rel="noopener noreferrer" aria-label="Email"><Mail aria-hidden className="w-4 h-4" /> Email…</MenuItem>
                      </Menu>
                    </SubmenuTrigger>
                  </Menu>
                </MenuTrigger>
              </div>
            </GridListItem>
          )}
        </GridList>
      }
      {!isSmall && <ResizableTableContainer className="flex-1 w-full overflow-auto scroll-pt-[2.281rem] relative border border-gray-200 dark:border-zinc-700 rounded-lg" onScroll={onScroll}>
        <Table aria-label="My plants" selectionMode="multiple" sortDescriptor={sortDescriptor} onSortChange={setSortDescriptor}>
          <TableHeader columns={columns}>
            {column => <Column {...column} />}
          </TableHeader>
          <TableBody items={items} dependencies={[columns]}>
            {item => (
              <Row columns={columns}>
                {column => {
                  switch (column.id) {
                    case 'favorite':
                      return (
                        <Cell>
                          <FavoriteButton isSelected={item.isFavorite} onChange={v => toggleFavorite(item.id, v)} />
                        </Cell>
                      );
                    case 'common_name':
                      return (
                        <Cell textValue={item.common_name}>
                          <div className="grid grid-cols-[40px_1fr] gap-x-2">
                            <img alt="" src={item.default_image?.thumbnail} className="inline rounded-sm row-span-2 object-contain h-[40px]" />
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
                          <MenuTrigger>
                            <Button aria-label="Actions" variant="icon">
                              <MoreHorizontal aria-hidden className="w-5 h-5" />
                            </Button>
                            <Menu onAction={action => onAction(item, action)}>
                              <MenuItem id="favorite"><StarIcon aria-hidden className="w-4 h-4" /> {item.isFavorite ? 'Unfavorite' : 'Favorite'}</MenuItem>
                              <MenuItem id="edit"><PencilIcon aria-hidden className="w-4 h-4" /> Edit…</MenuItem>
                              <MenuItem id="delete"><TrashIcon aria-hidden className="w-4 h-4" /> Delete…</MenuItem>
                              <SubmenuTrigger>
                                <MenuItem aria-label="Share">
                                  <ShareIcon aria-hidden className="w-4 h-4" />
                                  Share
                                </MenuItem>
                                <Menu>
                                  <MenuItem href={`https://x.com/intent/tweet?text=${encodeURIComponent(item.common_name)}`} target="blank" rel="noopener noreferrer" aria-label="X"><Twitter aria-hidden className="w-4 h-4" /> X…</MenuItem>
                                  <MenuItem href={`mailto:abc@example.com?subject=${encodeURIComponent(item.common_name)}`} target="blank" rel="noopener noreferrer" aria-label="Email"><Mail aria-hidden className="w-4 h-4" /> Email…</MenuItem>
                                </Menu>
                              </SubmenuTrigger>
                            </Menu>
                          </MenuTrigger>
                        </Cell>
                      );
                    default:
                      return <></>;
                  }
                }}
              </Row>
            )}
          </TableBody>
        </Table>
      </ResizableTableContainer>}
      <Modal isOpen={dialog === 'delete'} onOpenChange={onDialogClose}>
        <AlertDialog title="Delete Plant" variant="destructive" actionLabel="Delete" onAction={deleteItem}>
          Are you sure you want to delete "{actionItem?.common_name}"?
        </AlertDialog>
      </Modal>
      <PlantModal isOpen={dialog === 'edit'} onOpenChange={onDialogClose}>
        <PlantDialog item={actionItem} onSave={editItem} />
      </PlantModal>
    </div>
  );
}

const labelStyles = {
  gray: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-600',
  green: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-300/20 dark:text-green-400 dark:border-green-300/10',
  yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-300/20 dark:text-yellow-400 dark:border-yellow-300/10',
  blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-400/20 dark:text-blue-300 dark:border-blue-400/10'
};

function Label({color, icon, children}: {color: keyof typeof labelStyles, icon: React.ReactNode, children: React.ReactNode}) {
  return <span className={`${labelStyles[color]} text-xs rounded-full border px-2 flex items-center max-w-fit gap-1`}>{icon} <span className="truncate capitalize">{children}</span></span>;
}

const cycleIcon = <RefreshCw aria-hidden="true" className="w-4 h-4 shrink-0" />;
function CycleLabel({cycle}: {cycle: string}) {
  return <Label color="green" icon={cycleIcon}>{cycle}</Label>;
}

const sunIcons: Record<string, ReactElement> = {
  'full sun': <Sun aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'part sun': <SunDim aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'part shade': <CloudSun aria-hidden="true" className="w-4 h-4 shrink-0" />
};

const sunColors: Record<string, keyof typeof labelStyles> = {
  'full sun': 'yellow',
  'part sun': 'yellow',
  'part shade': 'gray'
};

function SunLabel({sun}: {sun: string}) {
  return <Label color={sunColors[sun]} icon={sunIcons[sun]}>{sun}</Label>;
}

function getSunlight(item: Plant) {
  return (item.sunlight.find(s => s.startsWith('part')) || item.sunlight[0]).split('/')[0];
}

const wateringIcons: Record<string, ReactElement> = {
  'Frequent': <Droplets aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'Average': <Droplet aria-hidden="true" className="w-4 h-4 shrink-0" />,
  'Minimum': <Dessert aria-hidden="true" className="w-4 h-4 shrink-0" />
};

const wateringColors: Record<string, keyof typeof labelStyles> = {
  'Frequent': 'blue',
  'Average': 'blue',
  'Minimum': 'gray'
};

function WateringLabel({watering}: {watering: string}) {
  return <Label color={wateringColors[watering]} icon={wateringIcons[watering]}>{watering}</Label>;
}

function PlantDialog({item, onSave}: {item?: Plant | null, onSave: (item: Plant) => void}) {
  let [droppedImage, setDroppedImage] = useState(item?.default_image?.thumbnail);
  return (
    <Dialog className="outline outline-0 relative">
      {({close}) => (
        <>
          <Heading
            slot="title"
            className="text-2xl font-semibold leading-6 my-0 text-slate-700 dark:text-zinc-300">
            {item ? 'Edit Plant' : 'Add Plant'}
          </Heading>
          <Form
            onSubmit={e => {
              e.preventDefault();
              close();
              let data = Object.fromEntries(new FormData(e.currentTarget)) as any;
              data.sunlight = [data.sunlight];
              data.scientific_name = [data.scientific_name];
              data.default_image = {thumbnail: data.image};
              data.id = item?.id || Date.now();
              data.isFavorite = item?.isFavorite || false;
              onSave(data);
            }}
            className="mt-6 flex flex-col gap-3">
            <div className="flex gap-4">
              <DropZone
                getDropOperation={types => types.has('image/jpeg') || types.has('image/png') ? 'copy' : 'cancel'}
                onDrop={async e => {
                  let item = e.items.filter(isFileDropItem).find(item => (item.type === 'image/jpeg' || item.type === 'image/png'));
                  if (item) {
                    setDroppedImage(URL.createObjectURL(await item.getFile()));
                  }
                }}
                className="w-24 sm:w-32 p-2 flex items-center justify-center shrink-0 border-2 border-gray-400 border-dashed rounded-xl text-gray-500 dark:text-gray-300 focus-visible:border-blue-600 forced-colors:focus-visible:border-[Highlight] focus-visible:border-solid drop-target:border-blue-600 forced-colors:drop-target:border-[Highlight] drop-target:border-solid drop-target:bg-blue-200 dark:drop-target:bg-blue-800/60 drop-target:text-blue-600 dark:drop-target:text-blue-300">
                {droppedImage
                  ? <img alt="" src={droppedImage} className="w-full h-full object-contain aspect-square" />
                  : <Text slot="label" className="italic text-sm text-center">Drop or paste image here</Text>
                }
                <input type="hidden" name="image" value={droppedImage} />
              </DropZone>
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <ComboBox label="Common Name" name="common_name" isRequired items={plants} defaultInputValue={item?.common_name} allowsCustomValue autoFocus={navigator.maxTouchPoints === 0}>
                  {plant => <ComboBoxItem>{plant.common_name}</ComboBoxItem>}
                </ComboBox>
                <TextField label="Scientific Name" name="scientific_name" isRequired defaultValue={item?.scientific_name?.join('')} />
              </div>
            </div>
            <Select label="Cycle" name="cycle" isRequired defaultSelectedKey={item?.cycle}>
              <SelectItem id="Perennial" textValue="Perennial">{cycleIcon} Perennial</SelectItem>
              <SelectItem id="Annual" textValue="Annual">{cycleIcon} Annual</SelectItem>
            </Select>
            <Select label="Sunlight" name="sunlight" isRequired defaultSelectedKey={item ? getSunlight(item) : undefined}>
              <SelectItem id="full sun" textValue="Full Sun">{sunIcons['full sun']} Full Sun</SelectItem>
              <SelectItem id="part sun" textValue="Part Sun">{sunIcons['part sun']} Part Sun</SelectItem>
              <SelectItem id="part shade" textValue="Part Shade">{sunIcons['part shade']} Part Shade</SelectItem>
            </Select>
            <Select label="Watering" name="watering" isRequired defaultSelectedKey={item?.watering}>
              <SelectItem id="Frequent" textValue="Frequent">{wateringIcons['Frequent']} Frequent</SelectItem>
              <SelectItem id="Average" textValue="Average">{wateringIcons['Average']} Average</SelectItem>
              <SelectItem id="Minimum" textValue="Minimum">{wateringIcons['Minimum']} Minimum</SelectItem>
            </Select>
            <DatePicker label="Date Planted" isRequired defaultValue={item ? today(getLocalTimeZone()) : null} />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onPress={close}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {item ? 'Save' : 'Add'}
              </Button>
            </div>
          </Form>
        </>
      )}
    </Dialog>
  );
}

function PlantModal(props: ModalOverlayProps) {
  let [isResized, setResized] = useState(false);
  let observed = useRef<HTMLElement | null>(null);
  let resizeObserver = useRef<ResizeObserver | null>(null);
  let ref = useCallback((element: HTMLDivElement) => {
    if (resizeObserver.current && observed.current) {
      resizeObserver.current.unobserve(observed.current);
      resizeObserver.current = null;
      observed.current = null;
    }

    if (element) {
      let height = element.clientHeight;
      if (element.scrollHeight > element.clientHeight) {
        setResized(true);
        return;
      }

      let observer = new ResizeObserver(() => {
        if (element.clientHeight !== height) {
          setResized(true);
        }
      });

      observer.observe(element);
      resizeObserver.current = observer;
      observed.current = element;
    } else {
      setResized(false);
    }
  }, []);

  return (
    <ModalOverlay
      {...props}
      className={({isEntering, isExiting}) => `
      fixed top-0 left-0 w-full h-(--visual-viewport-height) isolate z-20 bg-black/[15%] flex items-center justify-center p-4 text-center backdrop-blur-lg
      ${isEntering ? 'animate-in fade-in duration-200 ease-out' : ''}
      ${isExiting ? 'animate-out fade-out duration-200 ease-in' : ''}
    `}>
      {({isEntering, isExiting}) => (<>
        {!isResized &&
          <div
            data-react-aria-top-layer="true"
            className={`fixed top-0 left-0 w-full h-(--visual-viewport-height) z-30 hidden sm:flex items-center justify-center pointer-events-none [filter:drop-shadow(0_0_3px_white)] dark:filter-none
              ${isEntering ? 'animate-in zoom-in-105 ease-out duration-200' : ''}
              ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
            `}>
            <svg viewBox="0 0 700 620" width={700} height={620}>
              <Arrow textX={52} x1={88} x2={130} y={50} href="Dialog.html">Dialog</Arrow>
              <Arrow textX={34} x1={88} x2={150} y={150} href="DropZone.html">DropZone</Arrow>
              <Arrow textX={54} x1={88} x2={150} y={272} href="Select.html">Select</Arrow>
              <Arrow textX={32} x1={88} x2={150} y={492} href="DatePicker.html">DatePicker</Arrow>
              <Arrow textX={616} x1={550} x2={612} y={126} marker="markerStart" href="ComboBox.html">ComboBox</Arrow>
              <Arrow textX={616} x1={550} x2={612} y={198} marker="markerStart" href="TextField.html">TextField</Arrow>
              <Arrow points="560,90 590,90 590,338 612,338 590,338 590,585 560,585" textX={616} y={338} marker="none" href="Form.html">Form</Arrow>
            </svg>
          </div>
        }
        <RACModal
          {...props}
          ref={ref}
          className={({isEntering, isExiting}) => `
          w-full max-w-md max-h-full overflow-auto rounded-2xl bg-white dark:bg-zinc-800/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:!bg-[Canvas] p-6 text-left align-middle shadow-2xl bg-clip-padding border border-black/10 dark:border-white/10
          ${isEntering ? 'animate-in zoom-in-105 ease-out duration-200' : ''}
          ${isExiting ? 'animate-out zoom-out-95 ease-in duration-200' : ''}
        `} />
      </>)}
    </ModalOverlay>
  );
}

const favoriteButtonStyles = tv({
  extend: focusRing,
  base: 'group cursor-default align-middle rounded-sm',
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
