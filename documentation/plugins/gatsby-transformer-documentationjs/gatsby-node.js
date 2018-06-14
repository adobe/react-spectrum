"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var documentation = require(`documentation`);
var crypto = require(`crypto`);
var digest = function digest(str) {
  return crypto.createHash(`md5`).update(str).digest(`hex`);
};
var remark = require(`remark`);
var _ = require(`lodash`);
var Prism = require(`prismjs`);

var stringifyMarkdownAST = function stringifyMarkdownAST() {
  var node = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ``;

  if (_.isString(node)) {
    return node;
  } else {
    return remark().stringify(node);
  }
};

var commentId = function commentId(parentId, commentNumber) {
  return `documentationJS ${parentId} comment #${commentNumber}`;
};
var descriptionId = function descriptionId(parentId, name) {
  return `${parentId}--DocumentationJSComponentDescription--${name}`;
};

function createDescriptionNode(node, docNodeId, markdownStr, name, boundActionCreators) {
  var createNode = boundActionCreators.createNode;


  var descriptionNode = {
    id: descriptionId(docNodeId, name),
    parent: node.id,
    children: [],
    internal: {
      type: `DocumentationJSComponentDescription`,
      mediaType: `text/markdown`,
      content: markdownStr,
      contentDigest: digest(markdownStr)
    }
  };

  node.children = node.children.concat([descriptionNode.id]);
  createNode(descriptionNode);

  return descriptionNode.id;
}

function formatMethod(method) {
  let res = [...(method.modifiers || []), `${method.name}(${method.params.map(formatParam).join(', ')})`].join(' ');
  if (method.returns && method.returns[0] && method.returns[0].type.name) {
    res += ': ' + method.returns[0].type.name;
  }

  return res;
}

function formatParam(param) {
  let p = param.name;
  if (param.type) {
    p += ': ' + param.type.name;
  }

  if (param.default) {
    p += ' = ' + param.default;
  }

  return p;
}

/**
 * Implement the onCreateNode API to create documentation.js nodes
 * @param {Object} super this is a super param
 */
exports.onCreateNode = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref) {
    var node = _ref.node,
        loadNodeContent = _ref.loadNodeContent,
        boundActionCreators = _ref.boundActionCreators;
    var createNode, createParentChildLink, documentationJson;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = boundActionCreators.createNode, createParentChildLink = boundActionCreators.createParentChildLink;

            if (!(node.internal.mediaType !== `application/javascript` || node.internal.type !== `File`)) {
              _context.next = 3;
              break;
            }

            return _context.abrupt("return", null);

          case 3:
            documentationJson = void 0;
            _context.prev = 4;
            _context.next = 7;
            return documentation.build(node.absolutePath, {
              shallow: true
            });

          case 7:
            documentationJson = _context.sent;
            _context.next = 12;
            break;

          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](4);

          case 12:
            if (!(documentationJson && documentationJson.length > 0)) {
              _context.next = 17;
              break;
            }

            documentationJson.forEach(function (docsJson, i) {
              // var picked = _.pick(docsJson, [`kind`, `memberof`, `name`, `scope`, 'members']);
              var picked = _.cloneDeep(docsJson);

              // Defaults
              picked.params = [{ name: ``, type: { type: ``, name: `` } }];
              picked.returns = [{ type: { type: ``, name: `` } }];
              picked.examples = [{ raw: ``, highlighted: `` }];

              // Prepare various sub-pieces.
              if (docsJson.description) {
                picked.description___NODE = createDescriptionNode(node, commentId(node.id, i), stringifyMarkdownAST(docsJson.description), `comment.description`, boundActionCreators);
              }

              var transformParam = function transformParam(param) {
                if (param.description) {
                  param.description___NODE = createDescriptionNode(node, commentId(node.id, i), stringifyMarkdownAST(param.description), param.name, boundActionCreators);
                  delete param.description;
                }
                delete param.lineNumber;

                // When documenting destructured parameters, the name
                // is parent.child where we just want the child.
                if (param.name.split(`.`).length > 1) {
                  param.name = param.name.split(`.`).slice(-1).join(`.`);
                }

                if (param.properties) {
                  param.properties = param.properties.map(transformParam);
                }

                return param;
              };

              if (docsJson.params) {
                picked.params = docsJson.params.map(transformParam);
              }

              if (docsJson.returns) {
                picked.returns = docsJson.returns.map(function (ret) {
                  if (ret.description) {
                    ret.description___NODE = createDescriptionNode(node, commentId(node.id, i), stringifyMarkdownAST(ret.description), ret.title, boundActionCreators);
                  }

                  return ret;
                });
              }

              if (docsJson.members) {
                picked.members.instance = docsJson.members.instance.map(function (ret) {
                  if (ret.description) {
                    ret.description___NODE = createDescriptionNode(node, commentId(node.id, i), stringifyMarkdownAST(ret.description), ret.name, boundActionCreators);
                    delete ret.description;
                  }

                  let signature = formatMethod(ret);
                  ret.signature = {
                    text: signature,
                    highlighted: Prism.highlight(signature, Prism.languages.javascript)
                  };

                  return ret;
                });
              }

              if (docsJson.examples) {
                picked.examples = docsJson.examples.map(function (example) {
                  return {
                    raw: example.description,
                    highlighted: Prism.highlight(example.description, Prism.languages.javascript)
                  };
                });
              }

              var strContent = JSON.stringify(picked, null, 4);

              var docNode = (0, _extends3.default)({}, picked, {
                commentNumber: i,
                id: commentId(node.id, i),
                parent: node.id,
                children: [],
                internal: {
                  contentDigest: digest(strContent),
                  type: `DocumentationJs`
                }
              });

              createParentChildLink({ parent: node, child: docNode });
              createNode(docNode);
            });

            return _context.abrupt("return", true);

          case 17:
            return _context.abrupt("return", null);

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[4, 10]]);
  }));

  return function (_x2) {
    return _ref2.apply(this, arguments);
  };
}();