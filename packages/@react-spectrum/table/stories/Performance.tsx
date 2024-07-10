import {ActionButton} from '@react-spectrum/button';
import {Cell, Column, Row, TableBody, TableHeader, TableView} from '../src';
import {Checkbox} from '@react-spectrum/checkbox';
import {faker} from '@faker-js/faker';
import {Icon} from '@react-spectrum/icon';
import {Item, TagGroup} from '@react-spectrum/tag';
import {Link} from '@react-spectrum/link';
import {ProgressBar} from '@react-spectrum/progress';
import React from 'react';
import {SpectrumStatusLightProps} from '@react-types/statuslight';
import {Text} from '@react-spectrum/text';

export const DATA_SIZE = 10000;
export const COLUMN_SIZE = 50;
export const TABLE_HEIGHT = 600;

const columnDefinitions = [
  {name: 'Airline', type: 'TEXT'},
  {name: 'Destinations', type: 'TAGS'},
  {name: 'Scheduled At', type: 'DATETIME'},
  {name: 'Status', type: 'STATUS'},
  {name: 'Rating', type: 'RATING'},
  {name: 'Progress', type: 'PROGRESS'},
  {name: 'URL', type: 'URL'},
  {name: 'Overbooked', type: 'CHECKBOX'},
  {name: 'Take Action', type: 'BUTTON'}
] as const;

export const flightStatuses = {
  ON_SCHEDULE: 'On Schedule',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled',
  BOARDING: 'Boarding'
};

export const flightStatusVariant: Record<
  keyof typeof flightStatuses,
  SpectrumStatusLightProps['variant']
> = {
  ON_SCHEDULE: 'positive',
  DELAYED: 'notice',
  CANCELLED: 'negative',
  BOARDING: 'info'
};

const getData = (rowNumber: number, columnNumber: number) => {
  const columns = columnDefinitions.concat([...Array(columnNumber - columnDefinitions.length)].map(() =>
    faker.helpers.arrayElement(columnDefinitions)
  ));
  return {
    columns,
    data: [...Array(rowNumber)].map(() => {
      return columns.map((column) => {
        switch (column.type) {
          case 'TEXT':
            return {rawValue: faker.airline.airline().name};
          case 'URL': {
            const url = faker.internet.url();
            return {rawValue: url, url};
          }
          case 'TAGS': {
            const airports = faker.helpers
              .multiple(faker.airline.airport, {
                count: {min: 1, max: 7}
              })
              .map((airport) => airport.iataCode);
            return {rawValue: airports.join(', '), data: airports};
          }
          case 'STATUS': {
            const [flightKey, flightStatus] =
              faker.helpers.objectEntry(flightStatuses);
            return {
              rawValue: flightStatus,
              variant: flightStatusVariant[flightKey]
            };
          }
          case 'DATETIME':
            return {rawValue: faker.date.future()};
          case 'RATING': {
            const rating = faker.number.int({min: 0, max: 5});
            return {rawValue: rating, data: rating};
          }
          case 'PROGRESS': {
            const progress = faker.number.int({min: 0, max: 100});
            return {rawValue: progress, data: progress};
          }
          case 'CHECKBOX':
            return {rawValue: faker.datatype.boolean()};
          case 'BUTTON':
            return {rawValue: 'View Details'};
        }
      });
    })
  };
};

export function Performance() {
  const {data, columns} = getData(DATA_SIZE, COLUMN_SIZE);
  return (
    <TableView
      height={TABLE_HEIGHT}
      width={800}
      aria-label="Example table with static contents"
      selectionMode="multiple">
      <TableHeader>
        {columns.map((col, i) => (
          <Column key={`col-${i}`}>{col.name}</Column>
        ))}
      </TableHeader>
      <TableBody>
        {data.map((row, rowId) => (
          <Row key={rowId}>
            {row.map((cell, colIndex) => {
              const cellId = `row${rowId}-col${colIndex}`;
              switch (columns[colIndex].type) {
                case 'TEXT':
                  return <Cell key={cellId}>{cell.rawValue as string}</Cell>;
                case 'DATETIME':
                  return (
                    <Cell key={cellId}>{cell.rawValue.toLocaleString()}</Cell>
                  );
                case 'STATUS':
                  return (
                    <Cell key={cellId}>
                      <TagGroup aria-label="Flight Status">
                        <Item textValue={cell.rawValue as string}>
                          <CircleIcon color={cell.variant} />
                          <Text>{cell.rawValue as string}</Text>
                        </Item>
                      </TagGroup>
                    </Cell>
                  );
                case 'URL':
                  return (
                    <Cell key={cellId}>
                      <Link href={cell.url}>{cell.rawValue as string}</Link>
                    </Cell>
                  );
                case 'BUTTON':
                  return (
                    <Cell key={cellId}>
                      <ActionButton>{cell.rawValue as string}</ActionButton>
                    </Cell>
                  );
                case 'CHECKBOX':
                  return (
                    <Cell key={cellId}>
                      <Checkbox isEmphasized defaultSelected={cell.rawValue as boolean} aria-label="checkbox" />
                    </Cell>
                  );
                case 'TAGS':
                  return (
                    <Cell key={cellId}>
                      <TagGroup aria-label="Cities">
                        {(cell.data as string[]).map((tag, tagId) => (
                          <Item key={tagId} textValue={tag}>
                            <Text>{tag}</Text>
                          </Item>
                        ))}
                      </TagGroup>
                    </Cell>
                  );
                case 'RATING':
                  return (
                    <Cell key={cellId}>
                      {[...Array(5)].map((_, rate) => (
                        <StarIcon key={rate} isHidden={rate > (data as any).rate} />
                      ))}
                    </Cell>
                  );
                case 'PROGRESS':
                  return (
                    <Cell key={cellId}>
                      <ProgressBar value={cell.data as number} aria-label="Progress" />
                    </Cell>
                  );
                default:
                  return <Cell> </Cell>;
              }
            })}
          </Row>
        ))}
      </TableBody>
    </TableView>
  );
}

const CircleIcon = (props) => (
  <Icon {...props}>
    <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle r="18" cx="18" cy="18" />
    </svg>
  </Icon>
);

const StarIcon = (props) => {
  return (
    <Icon {...props}>
      <svg viewBox="0 0 36 36">
        <path d="M18.477.593,22.8,12.029l12.212.578a.51.51,0,0,1,.3.908l-9.54,7.646,3.224,11.793a.51.51,0,0,1-.772.561L18,26.805,7.78,33.515a.51.51,0,0,1-.772-.561l3.224-11.793L.692,13.515a.51.51,0,0,1,.3-.908L13.2,12.029,17.523.593A.51.51,0,0,1,18.477.593Z" />
      </svg>
    </Icon>
  );
};
