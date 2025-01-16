import {calculateColumnSizes} from '../src/TableUtils';
import {TableColumnLayout} from '../src/TableColumnLayout';

describe('TableUtils', () => {
  describe('column building', () => {
    it('real life case 1', () => {
      let controlledWidths = new Map([['name', '0.9982425307557117fr'], ['type', 286], ['level', '4fr']]);
      let tableWidth = [284, 284, 1140].reduce((acc, width) => acc + width, 0);
      let widths = calculateColumnSizes(
        tableWidth,
        [{key: 'name', width: '0.9982425307557117fr'}, {key: 'type', width: '286'}, {key: 'level', width: '4fr'}],
        controlledWidths,
        () => 150,
        () => 50
      );
      expect(widths).toStrictEqual([284, 286, 1138]);
    });

    it('real life case 2', () => {
      let controlledWidths = new Map([['name', 235], ['type', 235], ['level', '4fr'], ['height', 150]]);
      let tableWidth = [284, 284, 1140].reduce((acc, width) => acc + width, 0);
      let widths = calculateColumnSizes(
        tableWidth,
        [{key: 'name', width: '1fr'}, {key: 'type', width: '1fr'}, {key: 'height'}, {key: 'weight'}, {key: 'level', width: '4fr'}],
        controlledWidths,
        () => 150,
        () => 50
      );
      expect(widths).toStrictEqual([235, 235, 150, 150, 938]);
    });

    it('real life case 3', () => {
      let tableWidth = 1000;
      let columns = [
        {key: 'id', label: 'ID', maxWidth: '5%'},
        {key: 'name', label: 'Name', allowsToggle: false, minWidth: '20%'},
        {key: 'info', hideHeader: true, allowsToggle: false},
        {key: 'hp', label: 'HP', align: 'right', maxWidth: '5%'},
        {key: 'attack', label: 'Attack', align: 'right', maxWidth: '5%'},
        {key: 'defense', label: 'Defense', align: 'right', maxWidth: '5%'},
        {key: 'speed', label: 'Speed', align: 'right', maxWidth: '5%'},
        {key: 'total', label: 'Total', align: 'right', maxWidth: '5%'},
        {key: 'weight', label: 'Weight', align: 'right', maxWidth: '5%'},
        {key: 'height', label: 'Height', align: 'right', maxWidth: '5%'},
        {key: 'abilities', label: 'Abilities', minWidth: '20%'}
      ];
      let widths = calculateColumnSizes(
        tableWidth,
        columns,
        new Map(),
        (index) => {
          if (columns[index].hideHeader) {
            return 30;
          }
          return '1fr';
        },
        () => 25
      );
      expect(widths).toStrictEqual([50, 285, 30, 50, 50, 50, 50, 50, 50, 50, 285]);
    });

    it('real life case 4', () => {
      let controlledWidths = new Map();
      let tableWidth = 300;
      let widths = calculateColumnSizes(
        tableWidth,
        [{key: 'name', width: 100}, {key: 'type', width: 150}, {key: 'weight', width: 200}, {key: 'level', width: '1fr'}],
        controlledWidths,
        () => '1fr',
        () => 50
      );
      expect(widths).toStrictEqual([100, 150, 200, 50]);
    });

    it('defaultWidths', () => {
      let tableWidth = 800;
      let widths = calculateColumnSizes(
        tableWidth,
        [{key: 'name', defaultWidth: '1fr'}, {key: 'type', defaultWidth: '1fr'}, {key: 'level', width: '4fr'}],
        new Map(),
        () => 150,
        () => 50
      );
      expect(widths).toStrictEqual([133, 134, 533]);
    });
  });

  describe('table column layout', () => {
    it('should generate column widths with defaults if none are provided', () => {
      let layout = new TableColumnLayout();
      let collection = {columns: [{key: 'name', props: {}}, {key: 'type', props: {}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {}}]};
      let columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', undefined], ['type', undefined], ['height', undefined], ['weight', undefined], ['level', undefined]])
      );

      expect(columns).toStrictEqual(new Map([['name', 200], ['type', 200], ['height', 200], ['weight', 200], ['level', 200]]));
    });
  });

  describe('resizing', () => {
    it('can resize both controlled and uncontrolled columns', () => {
      let layout = new TableColumnLayout({
        getDefaultWidth: () => 150,
        getDefaultMinWidth: () => 50
      });
      let collection = {columns: [{key: 'name', props: {width: '1fr'}}, {key: 'type', props: {width: '1fr'}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: '5fr'}}]};
      let columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', '1fr'], ['type', '1fr'], ['height', 150], ['weight', 150], ['level', '5fr']])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 150], ['weight', 150], ['level', 500]]));

      let resizedColumns = layout.resizeColumnWidth(
        collection,
        new Map([['height', 150], ['weight', 150]]),
        'height',
        200
      );
      expect(resizedColumns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 200], ['weight', 150], ['level', '5fr']]));

      collection = {columns: [{key: 'name', props: {width: 100}}, {key: 'type', props: {width: 100}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: '5fr'}}]};
      columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', 100], ['type', 100], ['height', 200], ['weight', 150], ['level', '5fr']])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 200], ['weight', 150], ['level', 450]]));

      resizedColumns = layout.resizeColumnWidth(
        collection,
        new Map([['height', 200], ['weight', 150]]),
        'type',
        50
      );
      expect(resizedColumns).toStrictEqual(new Map([['name', 100], ['type', 50], ['height', 200], ['weight', 150], ['level', '5fr']]));

      collection = {columns: [{key: 'name', props: {width: 100}}, {key: 'type', props: {width: 50}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: '5fr'}}]};
      columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', 100], ['type', 50], ['height', 200], ['weight', 150], ['level', '5fr']])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 50], ['height', 200], ['weight', 150], ['level', 500]]));
    });

    it('can resize to bigger than the table', () => {
      let layout = new TableColumnLayout({
        getDefaultWidth: () => 150,
        getDefaultMinWidth: () => 50
      });
      let collection = {columns: [{key: 'name', props: {width: '1fr'}}, {key: 'type', props: {width: '1fr'}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: '5fr'}}]};
      let columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', '1fr'], ['type', '1fr'], ['height', 150], ['weight', 150], ['level', '5fr']])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 150], ['weight', 150], ['level', 500]]));

      let resizedColumns = layout.resizeColumnWidth(
        collection,
        new Map([['height', 150], ['weight', 150]]),
        'height',
        1000
      );
      expect(resizedColumns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 1000], ['weight', 150], ['level', '5fr']]));

      collection = {columns: [{key: 'name', props: {width: 100}}, {key: 'type', props: {width: 100}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: '5fr'}}]};
      columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', 100], ['type', 100], ['height', 1000], ['weight', 150], ['level', '5fr']])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 1000], ['weight', 150], ['level', 50]]));

    });

    it('can resize a later column smaller', () => {
      let layout = new TableColumnLayout({
        getDefaultWidth: () => 150,
        getDefaultMinWidth: () => 50
      });
      let collection = {columns: [{key: 'name', props: {width: '1fr'}}, {key: 'type', props: {width: '1fr'}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: '5fr'}}]};
      let columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', '1fr'], ['type', '1fr'], ['height', 150], ['weight', 150], ['level', '5fr']])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 150], ['weight', 150], ['level', 500]]));

      let resizedColumns = layout.resizeColumnWidth(
        collection,
        new Map([['height', 150], ['weight', 150]]),
        'level',
        400
      );
      expect(resizedColumns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 150], ['weight', 150], ['level', 400]]));

      collection = {columns: [{key: 'name', props: {width: 100}}, {key: 'type', props: {width: 100}}, {key: 'height', props: {}}, {key: 'weight', props: {}}, {key: 'level', props: {width: 400}}]};
      columns = layout.buildColumnWidths(
        1000,
        collection,
        new Map([['name', 100], ['type', 100], ['height', 150], ['weight', 150], ['level', 400]])
      );
      expect(columns).toStrictEqual(new Map([['name', 100], ['type', 100], ['height', 150], ['weight', 150], ['level', 400]]));

    });
  });
});
