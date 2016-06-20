'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storybook = require('@kadira/storybook');

var _Table = require('../Table');

var _Table2 = _interopRequireDefault(_Table);

var _THead = require('../THead');

var _THead2 = _interopRequireDefault(_THead);

var _TBody = require('../TBody');

var _TBody2 = _interopRequireDefault(_TBody);

var _TR = require('../TR');

var _TR2 = _interopRequireDefault(_TR);

var _TH = require('../TH');

var _TH2 = _interopRequireDefault(_TH);

var _TD = require('../TD');

var _TD2 = _interopRequireDefault(_TD);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storybook.storiesOf)('Table', module).add('Default', function () {
  return render();
}).add('hover: true', function () {
  return render({ hover: true });
}).add('bordered: true', function () {
  return render({ bordered: true });
});

function render() {
  var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return _react2.default.createElement(
    _Table2.default,
    props,
    _react2.default.createElement(
      _THead2.default,
      null,
      _react2.default.createElement(
        _TR2.default,
        null,
        _react2.default.createElement(
          _TH2.default,
          null,
          'Pet Name'
        ),
        _react2.default.createElement(
          _TH2.default,
          null,
          'Type'
        ),
        _react2.default.createElement(
          _TH2.default,
          null,
          'Good/Bad'
        )
      )
    ),
    _react2.default.createElement(
      _TBody2.default,
      null,
      _react2.default.createElement(
        _TR2.default,
        null,
        _react2.default.createElement(
          _TD2.default,
          null,
          'Mongo'
        ),
        _react2.default.createElement(
          _TD2.default,
          null,
          'Chihuahua'
        ),
        _react2.default.createElement(
          _TD2.default,
          null,
          'Bad'
        )
      ),
      _react2.default.createElement(
        _TR2.default,
        null,
        _react2.default.createElement(
          _TD2.default,
          null,
          'Tiny'
        ),
        _react2.default.createElement(
          _TD2.default,
          null,
          'Great Dane'
        ),
        _react2.default.createElement(
          _TD2.default,
          null,
          'Bad'
        )
      ),
      _react2.default.createElement(
        _TR2.default,
        null,
        _react2.default.createElement(
          _TD2.default,
          null,
          'Jaws'
        ),
        _react2.default.createElement(
          _TD2.default,
          null,
          'Pit Bull'
        ),
        _react2.default.createElement(
          _TD2.default,
          null,
          'Good'
        )
      )
    )
  );
}