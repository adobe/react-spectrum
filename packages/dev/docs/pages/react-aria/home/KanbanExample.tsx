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
import {Button, DropIndicator, GridList, GridListItem, isTextDropItem, Text, useDragAndDrop} from 'react-aria-components';
import {ListData, useListData} from 'react-stately';
import React from 'react';

const tickets = [
  {
    'title': 'UI Button Alignment Issue',
    'description': 'Buttons in the Settings menu are misaligned on smaller screens.',
    'id': '#101',
    'assignee': 'Gilberto Miguel',
    'avatar': 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-15',
    'status': 'Open'
  },
  {
    'title': 'Login Page Redesign',
    'description': 'Requesting a redesign of the login page to improve user experience.',
    'id': '#102',
    'assignee': 'Maia Pettegree',
    'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-16',
    'status': 'Open'
  },
  {
    'title': 'Database Connection Error',
    'description': 'Users are experiencing intermittent connection errors when accessing the database.',
    'id': '#103',
    'assignee': 'Mike Johnson',
    'avatar': 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-17',
    'status': 'In Progress'
  },
  {
    'title': 'Feature: Dark Mode',
    'description': 'Implement a dark mode option for improved accessibility and user preference.',
    'id': '#104',
    'assignee': 'Sarah Lee',
    'avatar': 'https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-18',
    'status': 'Open'
  },
  {
    'title': 'Missing User Profile Pictures',
    'description': 'Some user profile pictures are not displaying properly in the user dashboard.',
    'id': '#105',
    'assignee': 'David Chen',
    'avatar': 'https://images.unsplash.com/photo-1528763380143-65b3ac89a3ff?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-19',
    'status': 'Open'
  },
  {
    'title': 'Performance Optimization',
    'description': 'Requesting performance optimization for the application to reduce load times.',
    'id': '#106',
    'assignee': 'Sarah Lee',
    'avatar': 'https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-20',
    'status': 'Closed'
  },
  {
    'title': 'Broken Link on Homepage',
    'description': 'The "Learn More" link on the homepage is leading to a 404 error.',
    'id': '#107',
    'assignee': 'Alex Turner',
    'avatar': 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-21',
    'status': 'Open'
  },
  {
    'title': 'Feature: Export to PDF',
    'description': 'Implement a feature to allow users to export their data to PDF format.',
    'id': '#108',
    'assignee': 'Maia Pettegree',
    'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-22',
    'status': 'Open'
  },
  {
    'title': 'Mobile Responsiveness Issue',
    'description': 'The application is not rendering properly on certain mobile devices.',
    'id': '#109',
    'assignee': 'Kevin Williams',
    'avatar': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80',
    'date': '2023-09-23',
    'status': 'Open'
  },
  {
    'title': 'Feature: Two-Factor Authentication',
    'description': 'Requesting the addition of two-factor authentication for improved security.',
    'id': '#110',
    'assignee': 'Maia Pettegree',
    'avatar': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    'date': '2023-09-24',
    'status': 'In Progress'
  }
];

export function KanbanBoard() {
  let list = useListData({
    initialItems: tickets
  });

  return (
    <div className="grid grid-cols-[repeat(3,minmax(280px,1fr))] md:justify-center gap-4 -mx-8 px-8 py-8 overflow-auto relative snap-x snap-mandatory no-scrollbar">
      <Column status="Open" list={list} itemClassName="selected:bg-green-100 selected:border-green-500 dark:selected:bg-green-900 dark:selected:border-green-700" />
      <Column status="In Progress" list={list} itemClassName="selected:bg-blue-100 selected:border-blue-500 dark:selected:bg-blue-900 dark:selected:border-blue-700" />
      <Column status="Closed" list={list} itemClassName="selected:bg-red-100 selected:border-red-500 dark:selected:bg-red-900 dark:selected:border-red-700" />
    </div>
  );
}

interface ColumnProps {
  list: ListData<typeof tickets[0]>,
  status: string,
  itemClassName?: string
}

function Column({list, status, itemClassName}: ColumnProps) {
  let items = list.items.filter(t => t.status === status);

  let {dragAndDropHooks} = useDragAndDrop({
    // Provide drag data in a custom format as well as plain text.
    getItems(keys) {
      return [...keys].map((id) => ({
        'issue-id': String(id),
        'text/plain': list.getItem(id)?.title ?? ''
      }));
    },

    renderDropIndicator(target) {
      return (
        <DropIndicator target={target} className="h-0 -my-1.5 -translate-y-[5px] -mx-2 invisible drop-target:visible">
          <svg height={10} className="w-full stroke-blue-500 fill-none forced-colors:stroke-[Highlight]">
            <circle cx={5} cy={5} r={5 - 1} strokeWidth={2} />
            <line x1={20} x2="100%" transform="translate(-10 0)" y1={5} y2={5} strokeWidth={2} />
            <circle cx="100%" cy={5} r={5 - 1} transform="translate(-5 0)" strokeWidth={2} />
          </svg>
        </DropIndicator>
      );
    },

    // Accept drops with the custom format.
    acceptedDragTypes: ['issue-id'],

    // Ensure items are always moved rather than copied.
    getDropOperation: () => 'move',

    // Handle drops between items from other lists.
    async onInsert(e) {
      let ids = await Promise.all(
        e.items.filter(isTextDropItem).map(item => item.getText('issue-id'))
      );
      for (let id of ids) {
        list.update(id, {...list.getItem(id)!, status});
      }
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, ids);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, ids);
      }
    },

    // Handle drops on the collection when empty.
    async onRootDrop(e) {
      let ids = await Promise.all(
        e.items.filter(isTextDropItem).map(item => item.getText('issue-id'))
      );
      for (let id of ids) {
        list.update(id, {...list.getItem(id)!, status});
      }
    },

    // Handle reordering items within the same list.
    onReorder(e) {
      if (e.target.dropPosition === 'before') {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === 'after') {
        list.moveAfter(e.target.key, e.keys);
      }
    }
  });

  return (
    <section className="flex flex-col gap-2 snap-center">
      <header>
        <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 my-0">{status}</h3>
        <span className="text-sm text-zinc-700 dark:text-zinc-400">{items.length} {items.length === 1 ? 'task' : 'tasks'}</span>
      </header>
      <GridList
        items={items}
        aria-label={status}
        selectionMode="multiple"
        dragAndDropHooks={dragAndDropHooks}
        renderEmptyState={() => 'No tasks.'}
        className="h-[320px] p-2 md:p-4 overflow-y-auto overflow-x-hidden relative outline outline-0 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-sm border border-black/10 dark:border-white/10 bg-clip-padding text-gray-700 dark:text-zinc-400 flex flex-col gap-3 rounded-xl shadow-xl drop-target:bg-blue-200 dark:drop-target:bg-blue-800/60 drop-target:outline-2 outline-blue-500 forced-colors:outline-[Highlight] -outline-offset-2 empty:items-center empty:justify-center">
        {item => <Card item={item} className={itemClassName} />}
      </GridList>
    </section>
  );
}

interface CardProps {
  id?: string,
  item: typeof tickets[0],
  className?: string
}

function Card({id, item, className}: CardProps) {
  return (
    <GridListItem id={id} textValue={item.title} className={`group grid grid-cols-[1fr_auto] gap-1 p-2 rounded-lg border border-solid border-black/10 hover:border-black/20 dark:border-white/10 dark:hover:border-white/20 forced-colors:border-[ButtonBorder]! bg-white/80 dark:bg-zinc-900/70 bg-clip-padding hover:shadow-md selected:shadow-md dragging:opacity-50 transition text-slate-700 dark:text-slate-200 cursor-default select-none outline outline-0 outline-offset-2 focus-visible:outline-2 outline-blue-500 forced-colors:outline-[Highlight] forced-colors:text-[ButtonText]! forced-colors:selected:bg-[Highlight]! forced-colors:selected:text-[HighlightText]! forced-color-adjust-none ${className}`}>
      <span className="font-bold truncate">{item.title}</span>
      <span className="text-sm justify-self-end">{item.id}</span>
      <Text slot="description" className="text-sm line-clamp-2 col-span-2 text-slate-500 dark:text-zinc-300 forced-colors:text-inherit!">{item.description}</Text>
      <span className="flex items-center gap-1">
        <img src={item.avatar} alt="" className="h-4 w-4 rounded-full" />
        <span className="text-sm">{item.assignee}</span>
      </span>
      <Button slot="drag" className="bg-transparent border-none text-gray-500 dark:text-zinc-300 text-base leading-none w-fit aspect-square p-0 justify-self-end outline outline-0 focus-visible:outline-2 outline-blue-500 forced-colors:outline-[Highlight] rounded-xs sr-only group-focus-visible:not-sr-only focus:not-sr-only forced-colors:group-selected:text-[HighlightText] forced-colors:group-selected:outline-[HighlightText]">≡</Button>
    </GridListItem>
  );
}
