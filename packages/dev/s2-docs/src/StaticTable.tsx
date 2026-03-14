import {Code} from './Code';
import React, {ReactNode} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';

const codeStyle = style({font: {default: 'code-xs', lg: 'code-sm'}});

export interface StaticTableProps {
  /** Column headers, e.g., ['Spectrum 1', 'Spectrum 2']. */
  headers: ReactNode[],
  /** Rows of data. Each row must have the same length as headers. */
  rows: Array<Array<ReactNode | string | number>>,
  /** Zero-based column indices to render as inline code. */
  codeColumns?: number[],
  /** Optional language per code column index (e.g., {0: 'tsx', 1: 'css'}). */
  langPerColumn?: Record<number, string>
}

export function StaticTable({headers, rows, codeColumns = [], langPerColumn}: StaticTableProps) {
  let codeColumnSet = new Set(codeColumns);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header, index) => (
            <TableColumn key={index}>{header}</TableColumn>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {row.map((cell, colIndex) => (
              <TableCell key={colIndex}>
                {codeColumnSet.has(colIndex)
                  ? <span className={codeStyle}><Code lang={langPerColumn?.[colIndex]}>{String(cell)}</Code></span>
                  : <>{cell}</>
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default StaticTable;
