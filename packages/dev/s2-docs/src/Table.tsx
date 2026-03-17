'use client';
import {mergeStyles} from '../../../@react-spectrum/s2/style/runtime';
import React, {HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes} from 'react';
import {style, StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};

const table = style({
  font: 'ui',
  backgroundColor: 'gray-25',
  borderRadius: 'default',
  borderColor: 'gray-300',
  borderWidth: 1,
  borderStyle: 'solid',
  overflow: 'hidden',
  borderSpacing: 0,
  width: 'full'
});

const tableHeader = style({
  backgroundColor: 'gray-75',
  borderTopRadius: 'default',
  display: {
    default: 'none',
    sm: '[table-header-group]'
  }
});

const tableBody = style({
  backgroundColor: 'gray-25'
});

const tableColumn = style({
  paddingX: 16,
  textAlign: 'start',
  fontWeight: 'bold',
  borderColor: 'gray-300',
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  height: 32,
  boxSizing: 'border-box'
});

const tableCell = style({
  paddingX: 16,
  height: {
    sm: {
      align: {
        center: 40
      }
    }
  },
  paddingTop: {
    default: 4,
    sm: {
      align: {
        top: 4,
        center: 0,
        bottom: 12
      }
    }
  },
  paddingBottom: {
    default: {
      ':last-child': 4,
      align: {
        bottom: 0
      }
    },
    sm: {
      align: {
        top: 12,
        center: 0,
        bottom: 0
      }
    }
  },
  borderWidth: 0,
  borderBottomWidth: {
    default: 0,
    ':last-child': 1,
    sm: 1,
    ':is(tbody:last-child > tr:last-child > *)': 0,
    isBorderHidden: 0
  },
  borderStyle: 'solid',
  borderColor: 'gray-300',
  boxSizing: 'border-box',
  display: {
    default: 'block',
    sm: '[table-cell]'
  }
});

export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return <table {...props} className={table} />;
}

export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={tableHeader} />;
}

export function TableColumn(props: ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return <th {...props} className={tableColumn} />;
}

export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} className={tableBody} />;
}

export function TableRow(props: HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  hideBorder?: boolean,
  styles?: StyleString
}

export function TableCell({hideBorder, styles, ...props}: TableCellProps) {
  let align = 'center';
  if (hideBorder) {
    align = 'bottom';
  } else if (props.colSpan) {
    align = 'top';
  }
  return <td {...props} className={mergeStyles(tableCell({isBorderHidden: hideBorder, align}), styles)} />;
}
