import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

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

const tableRow = style({
});

const tableCell = style({
  paddingX: 16,
  height: {
    align: {
      center: 40
    }
  },
  paddingTop: {
    align: {
      top: 4,
      center: 0,
      bottom: 12
    }
  },
  paddingBottom: {
    align: {
      top: 12,
      center: 0,
      bottom: 0
    }
  },
  borderWidth: 0,
  borderBottomWidth: {
    default: 1,
    ':is(tbody:last-child > tr:last-child > &)': 0,
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

export function Table(props) {
  return <table {...props} className={table} />;
}

export function TableHeader(props) {
  return <thead {...props} className={tableHeader} />;
}

export function TableColumn(props) {
  return <th {...props} className={tableColumn} />;
}

export function TableBody(props) {
  return <tbody {...props} className={tableBody} />;
}

export function TableRow(props) {
  return <tr {...props} className={tableRow} />;
}

export function TableCell({hideBorder, styles, ...props}) {
  let align = 'center';
  if (hideBorder) {
    align = 'bottom';
  } else if (props.colSpan) {
    align = 'top';
  }
  return <td {...props} className={tableCell({isBorderHidden: hideBorder, align}) + (styles || '')} />;
}
