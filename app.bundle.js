webpackJsonp([0],[
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOSE_PULLOUT = 'CLOSE_PULLOUT';
exports.RECEIVE_THING_FOR_SHOW = 'RECEIVE_THING_FOR_SHOW';
exports.RECEIVE_THING_LIST = 'RECEIVE_THING_LIST';
exports.REQUEST_THING_LIST = 'REQUEST_THING_LIST';
exports.RESIZE_BREAKPOINT = 'RESIZE_BREAKPOINT';
exports.SET_THEME = 'SET_THEME';
exports.SHOW_THING = 'SHOW_THING';
exports.TOGGLE_PULLOUT = 'TOGGLE_PULLOUT';


/***/ }),
/* 12 */,
/* 13 */,
/* 14 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(242);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function css(className, params) {
    var ret = className;
    for (var key in params) {
        if (params[key]) {
            ret += ' ' + key;
        }
    }
    return ret;
}
exports.default = css;


/***/ }),
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(process) {/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__createStore__ = __webpack_require__(100);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__combineReducers__ = __webpack_require__(231);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__bindActionCreators__ = __webpack_require__(232);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__applyMiddleware__ = __webpack_require__(233);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__compose__ = __webpack_require__(104);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__utils_warning__ = __webpack_require__(103);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "createStore", function() { return __WEBPACK_IMPORTED_MODULE_0__createStore__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "combineReducers", function() { return __WEBPACK_IMPORTED_MODULE_1__combineReducers__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "bindActionCreators", function() { return __WEBPACK_IMPORTED_MODULE_2__bindActionCreators__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "applyMiddleware", function() { return __WEBPACK_IMPORTED_MODULE_3__applyMiddleware__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "compose", function() { return __WEBPACK_IMPORTED_MODULE_4__compose__["a"]; });







/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  Object(__WEBPACK_IMPORTED_MODULE_5__utils_warning__["a" /* default */])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}


/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_Provider__ = __webpack_require__(211);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_connectAdvanced__ = __webpack_require__(99);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__connect_connect__ = __webpack_require__(216);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "Provider", function() { return __WEBPACK_IMPORTED_MODULE_0__components_Provider__["b"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "createProvider", function() { return __WEBPACK_IMPORTED_MODULE_0__components_Provider__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "connectAdvanced", function() { return __WEBPACK_IMPORTED_MODULE_1__components_connectAdvanced__["a"]; });
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "connect", function() { return __WEBPACK_IMPORTED_MODULE_2__connect_connect__["a"]; });






/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var CONTENT_LAYOUT;
(function (CONTENT_LAYOUT) {
    CONTENT_LAYOUT[CONTENT_LAYOUT["empty"] = 0] = "empty";
    CONTENT_LAYOUT[CONTENT_LAYOUT["list"] = 1] = "list";
    CONTENT_LAYOUT[CONTENT_LAYOUT["loading"] = 2] = "loading";
    CONTENT_LAYOUT[CONTENT_LAYOUT["thing"] = 3] = "thing";
})(CONTENT_LAYOUT = exports.CONTENT_LAYOUT || (exports.CONTENT_LAYOUT = {}));
var THEME;
(function (THEME) {
    THEME[THEME["Dark"] = 0] = "Dark";
    THEME[THEME["Light"] = 1] = "Light";
})(THEME = exports.THEME || (exports.THEME = {}));
var THEME_LEVEL;
(function (THEME_LEVEL) {
    THEME_LEVEL[THEME_LEVEL["primary"] = 0] = "primary";
    THEME_LEVEL[THEME_LEVEL["secondary"] = -1] = "secondary";
    THEME_LEVEL[THEME_LEVEL["highlight"] = 1] = "highlight";
})(THEME_LEVEL = exports.THEME_LEVEL || (exports.THEME_LEVEL = {}));
exports.FONT_SIZE = {
    tiny: '10px',
    small: '12px',
    medium: '16px',
    large: '18px',
    giant: '24px',
    massive: '32px',
};


/***/ }),
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Utilities
var css_1 = __webpack_require__(16);
// Local
__webpack_require__(243);
var Label = /** @class */ (function (_super) {
    __extends(Label, _super);
    function Label(props) {
        return _super.call(this, props) || this;
    }
    Label.prototype.render = function () {
        var _a = this.props, className = _a.className, label = _a.label, fontSize = _a.fontSize;
        return (React.createElement("div", { className: css_1.default('label-container', (_b = {},
                _b[className] = !!className,
                _b)) },
            React.createElement("span", { className: 'label', style: (_c = {}, _c['fontSize'] = fontSize, _c) }, label)));
        var _b, _c;
    };
    return Label;
}(React.Component));
exports.default = Label;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var redux_1 = __webpack_require__(21);
// Local
var rootReducer_1 = __webpack_require__(257);
var rootStore = redux_1.createStore(rootReducer_1.reducer);
exports.default = rootStore;


/***/ }),
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

/***/ }),
/* 61 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__ = __webpack_require__(219);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getPrototype_js__ = __webpack_require__(224);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__ = __webpack_require__(226);




/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!Object(__WEBPACK_IMPORTED_MODULE_2__isObjectLike_js__["a" /* default */])(value) || Object(__WEBPACK_IMPORTED_MODULE_0__baseGetTag_js__["a" /* default */])(value) != objectTag) {
    return false;
  }
  var proto = Object(__WEBPACK_IMPORTED_MODULE_1__getPrototype_js__["a" /* default */])(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

/* harmony default export */ __webpack_exports__["a"] = (isPlainObject);


/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SIZE_BREAKPOINTS = {
    small: 800,
    medium: 1080,
    large: 1920,
    xlarge: 2560,
    xxlarge: Infinity,
};
var SIZE_BREAKPOINT;
(function (SIZE_BREAKPOINT) {
    SIZE_BREAKPOINT[SIZE_BREAKPOINT["small"] = 0] = "small";
    SIZE_BREAKPOINT[SIZE_BREAKPOINT["medium"] = 1] = "medium";
    SIZE_BREAKPOINT[SIZE_BREAKPOINT["large"] = 2] = "large";
    SIZE_BREAKPOINT[SIZE_BREAKPOINT["xlarge"] = 3] = "xlarge";
    SIZE_BREAKPOINT[SIZE_BREAKPOINT["xxlarge"] = 4] = "xxlarge";
})(SIZE_BREAKPOINT = exports.SIZE_BREAKPOINT || (exports.SIZE_BREAKPOINT = {}));
// Necessary due to some horrific typescript enum indexing constraint
var _SIZE_STRING_ENUM_LOOKUP = {
    small: SIZE_BREAKPOINT.small,
    medium: SIZE_BREAKPOINT.medium,
    large: SIZE_BREAKPOINT.large,
    xlarge: SIZE_BREAKPOINT.xlarge,
    xxlarge: SIZE_BREAKPOINT.xxlarge,
};
function getSizeThreshold(elementSize, breakpoints) {
    if (elementSize === void 0) { elementSize = window.innerWidth; }
    if (breakpoints === void 0) { breakpoints = exports.DEFAULT_SIZE_BREAKPOINTS; }
    var breakpoint = 'xxlarge';
    for (var value in breakpoints) {
        if (elementSize < breakpoints[value]) {
            breakpoint = value;
            break;
        }
    }
    return _SIZE_STRING_ENUM_LOOKUP[breakpoint];
}
exports.getSizeThreshold = getSizeThreshold;


/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Root
var rootStore_1 = __webpack_require__(33);
// Actions
var requestHotList_1 = __webpack_require__(259);
var setTheme_1 = __webpack_require__(260);
var showThing_1 = __webpack_require__(108);
var togglePullout_1 = __webpack_require__(261);
var MENU_ITEM_ID;
(function (MENU_ITEM_ID) {
    MENU_ITEM_ID[MENU_ITEM_ID["showThing"] = 0] = "showThing";
    MENU_ITEM_ID[MENU_ITEM_ID["showHotItems"] = 1] = "showHotItems";
    MENU_ITEM_ID[MENU_ITEM_ID["togglePullout"] = 2] = "togglePullout";
    MENU_ITEM_ID[MENU_ITEM_ID["toggleTheme"] = 3] = "toggleTheme";
})(MENU_ITEM_ID = exports.MENU_ITEM_ID || (exports.MENU_ITEM_ID = {}));
exports.DEFAULT_MENU_ITEMS = (_a = {},
    _a[MENU_ITEM_ID.showThing] = {
        label: 'Get Thing',
        icon: 'get_app',
        onClick: function () {
            rootStore_1.default.dispatch(showThing_1.default('180263'));
        },
    },
    _a[MENU_ITEM_ID.toggleTheme] = {
        label: 'Theme Toggle',
        icon: 'invert_colors',
        onClick: function () {
            rootStore_1.default.dispatch(setTheme_1.default((rootStore_1.default.getState().root.theme * -1) + 1));
        },
    },
    _a[MENU_ITEM_ID.showHotItems] = {
        label: 'Hot Items',
        icon: 'whatshot',
        onClick: function () {
            rootStore_1.default.dispatch(requestHotList_1.default());
        },
    },
    _a[MENU_ITEM_ID.togglePullout] = {
        label: 'Menu',
        icon: 'menu',
        onClick: function () {
            rootStore_1.default.dispatch(togglePullout_1.default());
        },
    },
    _a);
var _a;


/***/ }),
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */,
/* 73 */,
/* 74 */,
/* 75 */,
/* 76 */,
/* 77 */,
/* 78 */,
/* 79 */,
/* 80 */,
/* 81 */,
/* 82 */,
/* 83 */,
/* 84 */,
/* 85 */,
/* 86 */,
/* 87 */,
/* 88 */,
/* 89 */,
/* 90 */,
/* 91 */,
/* 92 */,
/* 93 */,
/* 94 */,
/* 95 */,
/* 96 */,
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(70)(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = __webpack_require__(212)();
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 98 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return subscriptionShape; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return storeShape; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_prop_types__ = __webpack_require__(97);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_prop_types__);


var subscriptionShape = __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.shape({
  trySubscribe: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired,
  tryUnsubscribe: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired,
  notifyNestedSubs: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired,
  isSubscribed: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired
});

var storeShape = __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.shape({
  subscribe: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired,
  dispatch: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired,
  getState: __WEBPACK_IMPORTED_MODULE_0_prop_types___default.a.func.isRequired
});

/***/ }),
/* 99 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (immutable) */ __webpack_exports__["a"] = connectAdvanced;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_hoist_non_react_statics__ = __webpack_require__(213);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_hoist_non_react_statics___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_hoist_non_react_statics__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_invariant__ = __webpack_require__(214);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_Subscription__ = __webpack_require__(215);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utils_PropTypes__ = __webpack_require__(98);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }








var hotReloadingVersion = 0;
var dummyState = {};
function noop() {}
function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  var selector = {
    run: function runComponentSelector(props) {
      try {
        var nextProps = sourceSelector(store.getState(), props);
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true;
          selector.props = nextProps;
          selector.error = null;
        }
      } catch (error) {
        selector.shouldComponentUpdate = true;
        selector.error = error;
      }
    }
  };

  return selector;
}

function connectAdvanced(
/*
  selectorFactory is a func that is responsible for returning the selector function used to
  compute new props from state, props, and dispatch. For example:
     export default connectAdvanced((dispatch, options) => (state, props) => ({
      thing: state.things[props.thingId],
      saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
    }))(YourComponent)
   Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
  outside of their selector as an optimization. Options passed to connectAdvanced are passed to
  the selectorFactory, along with displayName and WrappedComponent, as the second argument.
   Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
  props. Do not use connectAdvanced directly without memoizing results between calls to your
  selector, otherwise the Connect component will re-render on every state or props change.
*/
selectorFactory) {
  var _contextTypes, _childContextTypes;

  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$getDisplayName = _ref.getDisplayName,
      getDisplayName = _ref$getDisplayName === undefined ? function (name) {
    return 'ConnectAdvanced(' + name + ')';
  } : _ref$getDisplayName,
      _ref$methodName = _ref.methodName,
      methodName = _ref$methodName === undefined ? 'connectAdvanced' : _ref$methodName,
      _ref$renderCountProp = _ref.renderCountProp,
      renderCountProp = _ref$renderCountProp === undefined ? undefined : _ref$renderCountProp,
      _ref$shouldHandleStat = _ref.shouldHandleStateChanges,
      shouldHandleStateChanges = _ref$shouldHandleStat === undefined ? true : _ref$shouldHandleStat,
      _ref$storeKey = _ref.storeKey,
      storeKey = _ref$storeKey === undefined ? 'store' : _ref$storeKey,
      _ref$withRef = _ref.withRef,
      withRef = _ref$withRef === undefined ? false : _ref$withRef,
      connectOptions = _objectWithoutProperties(_ref, ['getDisplayName', 'methodName', 'renderCountProp', 'shouldHandleStateChanges', 'storeKey', 'withRef']);

  var subscriptionKey = storeKey + 'Subscription';
  var version = hotReloadingVersion++;

  var contextTypes = (_contextTypes = {}, _contextTypes[storeKey] = __WEBPACK_IMPORTED_MODULE_4__utils_PropTypes__["a" /* storeShape */], _contextTypes[subscriptionKey] = __WEBPACK_IMPORTED_MODULE_4__utils_PropTypes__["b" /* subscriptionShape */], _contextTypes);
  var childContextTypes = (_childContextTypes = {}, _childContextTypes[subscriptionKey] = __WEBPACK_IMPORTED_MODULE_4__utils_PropTypes__["b" /* subscriptionShape */], _childContextTypes);

  return function wrapWithConnect(WrappedComponent) {
    __WEBPACK_IMPORTED_MODULE_1_invariant___default()(typeof WrappedComponent == 'function', 'You must pass a component to the function returned by ' + ('connect. Instead received ' + JSON.stringify(WrappedComponent)));

    var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    var displayName = getDisplayName(wrappedComponentName);

    var selectorFactoryOptions = _extends({}, connectOptions, {
      getDisplayName: getDisplayName,
      methodName: methodName,
      renderCountProp: renderCountProp,
      shouldHandleStateChanges: shouldHandleStateChanges,
      storeKey: storeKey,
      withRef: withRef,
      displayName: displayName,
      wrappedComponentName: wrappedComponentName,
      WrappedComponent: WrappedComponent
    });

    var Connect = function (_Component) {
      _inherits(Connect, _Component);

      function Connect(props, context) {
        _classCallCheck(this, Connect);

        var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

        _this.version = version;
        _this.state = {};
        _this.renderCount = 0;
        _this.store = props[storeKey] || context[storeKey];
        _this.propsMode = Boolean(props[storeKey]);
        _this.setWrappedInstance = _this.setWrappedInstance.bind(_this);

        __WEBPACK_IMPORTED_MODULE_1_invariant___default()(_this.store, 'Could not find "' + storeKey + '" in either the context or props of ' + ('"' + displayName + '". Either wrap the root component in a <Provider>, ') + ('or explicitly pass "' + storeKey + '" as a prop to "' + displayName + '".'));

        _this.initSelector();
        _this.initSubscription();
        return _this;
      }

      Connect.prototype.getChildContext = function getChildContext() {
        var _ref2;

        // If this component received store from props, its subscription should be transparent
        // to any descendants receiving store+subscription from context; it passes along
        // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
        // Connect to control ordering of notifications to flow top-down.
        var subscription = this.propsMode ? null : this.subscription;
        return _ref2 = {}, _ref2[subscriptionKey] = subscription || this.context[subscriptionKey], _ref2;
      };

      Connect.prototype.componentDidMount = function componentDidMount() {
        if (!shouldHandleStateChanges) return;

        // componentWillMount fires during server side rendering, but componentDidMount and
        // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
        // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
        // To handle the case where a child component may have triggered a state change by
        // dispatching an action in its componentWillMount, we have to re-run the select and maybe
        // re-render.
        this.subscription.trySubscribe();
        this.selector.run(this.props);
        if (this.selector.shouldComponentUpdate) this.forceUpdate();
      };

      Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
        this.selector.run(nextProps);
      };

      Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
        return this.selector.shouldComponentUpdate;
      };

      Connect.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this.subscription) this.subscription.tryUnsubscribe();
        this.subscription = null;
        this.notifyNestedSubs = noop;
        this.store = null;
        this.selector.run = noop;
        this.selector.shouldComponentUpdate = false;
      };

      Connect.prototype.getWrappedInstance = function getWrappedInstance() {
        __WEBPACK_IMPORTED_MODULE_1_invariant___default()(withRef, 'To access the wrapped instance, you need to specify ' + ('{ withRef: true } in the options argument of the ' + methodName + '() call.'));
        return this.wrappedInstance;
      };

      Connect.prototype.setWrappedInstance = function setWrappedInstance(ref) {
        this.wrappedInstance = ref;
      };

      Connect.prototype.initSelector = function initSelector() {
        var sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions);
        this.selector = makeSelectorStateful(sourceSelector, this.store);
        this.selector.run(this.props);
      };

      Connect.prototype.initSubscription = function initSubscription() {
        if (!shouldHandleStateChanges) return;

        // parentSub's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        var parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey];
        this.subscription = new __WEBPACK_IMPORTED_MODULE_3__utils_Subscription__["a" /* default */](this.store, parentSub, this.onStateChange.bind(this));

        // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
        // the middle of the notification loop, where `this.subscription` will then be null. An
        // extra null check every change can be avoided by copying the method onto `this` and then
        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
        // listeners logic is changed to not call listeners that have been unsubscribed in the
        // middle of the notification loop.
        this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription);
      };

      Connect.prototype.onStateChange = function onStateChange() {
        this.selector.run(this.props);

        if (!this.selector.shouldComponentUpdate) {
          this.notifyNestedSubs();
        } else {
          this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate;
          this.setState(dummyState);
        }
      };

      Connect.prototype.notifyNestedSubsOnComponentDidUpdate = function notifyNestedSubsOnComponentDidUpdate() {
        // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
        // needs to notify nested subs. Once called, it unimplements itself until further state
        // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
        // a boolean check every time avoids an extra method call most of the time, resulting
        // in some perf boost.
        this.componentDidUpdate = undefined;
        this.notifyNestedSubs();
      };

      Connect.prototype.isSubscribed = function isSubscribed() {
        return Boolean(this.subscription) && this.subscription.isSubscribed();
      };

      Connect.prototype.addExtraProps = function addExtraProps(props) {
        if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props;
        // make a shallow copy so that fields added don't leak to the original selector.
        // this is especially important for 'ref' since that's a reference back to the component
        // instance. a singleton memoized selector would then be holding a reference to the
        // instance, preventing the instance from being garbage collected, and that would be bad
        var withExtras = _extends({}, props);
        if (withRef) withExtras.ref = this.setWrappedInstance;
        if (renderCountProp) withExtras[renderCountProp] = this.renderCount++;
        if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription;
        return withExtras;
      };

      Connect.prototype.render = function render() {
        var selector = this.selector;
        selector.shouldComponentUpdate = false;

        if (selector.error) {
          throw selector.error;
        } else {
          return Object(__WEBPACK_IMPORTED_MODULE_2_react__["createElement"])(WrappedComponent, this.addExtraProps(selector.props));
        }
      };

      return Connect;
    }(__WEBPACK_IMPORTED_MODULE_2_react__["Component"]);

    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = displayName;
    Connect.childContextTypes = childContextTypes;
    Connect.contextTypes = contextTypes;
    Connect.propTypes = contextTypes;

    if (process.env.NODE_ENV !== 'production') {
      Connect.prototype.componentWillUpdate = function componentWillUpdate() {
        var _this2 = this;

        // We are hot reloading!
        if (this.version !== version) {
          this.version = version;
          this.initSelector();

          // If any connected descendants don't hot reload (and resubscribe in the process), their
          // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
          // listeners, this does mean that the old versions of connected descendants will still be
          // notified of state changes; however, their onStateChange function is a no-op so this
          // isn't a huge deal.
          var oldListeners = [];

          if (this.subscription) {
            oldListeners = this.subscription.listeners.get();
            this.subscription.tryUnsubscribe();
          }
          this.initSubscription();
          if (shouldHandleStateChanges) {
            this.subscription.trySubscribe();
            oldListeners.forEach(function (listener) {
              return _this2.subscription.listeners.subscribe(listener);
            });
          }
        }
      };
    }

    return __WEBPACK_IMPORTED_MODULE_0_hoist_non_react_statics___default()(Connect, WrappedComponent);
  };
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 100 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ActionTypes; });
/* harmony export (immutable) */ __webpack_exports__["b"] = createStore;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_es_isPlainObject__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_symbol_observable__ = __webpack_require__(227);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_symbol_observable___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_symbol_observable__);



/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = {
  INIT: '@@redux/INIT'

  /**
   * Creates a Redux store that holds the state tree.
   * The only way to change the data in the store is to call `dispatch()` on it.
   *
   * There should only be a single store in your app. To specify how different
   * parts of the state tree respond to actions, you may combine several reducers
   * into a single reducer function by using `combineReducers`.
   *
   * @param {Function} reducer A function that returns the next state tree, given
   * the current state tree and the action to handle.
   *
   * @param {any} [preloadedState] The initial state. You may optionally specify it
   * to hydrate the state from the server in universal apps, or to restore a
   * previously serialized user session.
   * If you use `combineReducers` to produce the root reducer function, this must be
   * an object with the same shape as `combineReducers` keys.
   *
   * @param {Function} [enhancer] The store enhancer. You may optionally specify it
   * to enhance the store with third-party capabilities such as middleware,
   * time travel, persistence, etc. The only store enhancer that ships with Redux
   * is `applyMiddleware()`.
   *
   * @returns {Store} A Redux store that lets you read the state, dispatch actions
   * and subscribe to changes.
   */
};function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!Object(__WEBPACK_IMPORTED_MODULE_0_lodash_es_isPlainObject__["a" /* default */])(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[__WEBPACK_IMPORTED_MODULE_1_symbol_observable___default.a] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[__WEBPACK_IMPORTED_MODULE_1_symbol_observable___default.a] = observable, _ref2;
}

/***/ }),
/* 101 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__root_js__ = __webpack_require__(220);


/** Built-in value references. */
var Symbol = __WEBPACK_IMPORTED_MODULE_0__root_js__["a" /* default */].Symbol;

/* harmony default export */ __webpack_exports__["a"] = (Symbol);


/***/ }),
/* 102 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 103 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

/***/ }),
/* 104 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = compose;
/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(undefined, arguments));
    };
  });
}

/***/ }),
/* 105 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (immutable) */ __webpack_exports__["a"] = wrapMapToPropsConstant;
/* unused harmony export getDependsOnOwnProps */
/* harmony export (immutable) */ __webpack_exports__["b"] = wrapMapToPropsFunc;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_verifyPlainObject__ = __webpack_require__(106);


function wrapMapToPropsConstant(getConstant) {
  return function initConstantSelector(dispatch, options) {
    var constant = getConstant(dispatch, options);

    function constantSelector() {
      return constant;
    }
    constantSelector.dependsOnOwnProps = false;
    return constantSelector;
  };
}

// dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
// 
// A length of one signals that mapToProps does not depend on props from the parent component.
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..
function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
}

// Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
// 
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//    
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//    
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//    
function wrapMapToPropsFunc(mapToProps, methodName) {
  return function initProxySelector(dispatch, _ref) {
    var displayName = _ref.displayName;

    var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
    };

    // allow detectFactoryAndVerify to get ownProps
    proxy.dependsOnOwnProps = true;

    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
      var props = proxy(stateOrDispatch, ownProps);

      if (typeof props === 'function') {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }

      if (process.env.NODE_ENV !== 'production') Object(__WEBPACK_IMPORTED_MODULE_0__utils_verifyPlainObject__["a" /* default */])(props, displayName, methodName);

      return props;
    };

    return proxy;
  };
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 106 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = verifyPlainObject;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash_es_isPlainObject__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__warning__ = __webpack_require__(60);



function verifyPlainObject(value, displayName, methodName) {
  if (!Object(__WEBPACK_IMPORTED_MODULE_0_lodash_es_isPlainObject__["a" /* default */])(value)) {
    Object(__WEBPACK_IMPORTED_MODULE_1__warning__["a" /* default */])(methodName + '() in ' + displayName + ' must return a plain object. Instead received ' + value + '.');
  }
}

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Components
var Icon_1 = __webpack_require__(250);
var Label_1 = __webpack_require__(32);
// Utilities
var css_1 = __webpack_require__(16);
// Local
__webpack_require__(251);
var MenuItem = /** @class */ (function (_super) {
    __extends(MenuItem, _super);
    function MenuItem(props) {
        var _this = _super.call(this, props) || this;
        _this._onClick = _this._onClick.bind(_this);
        return _this;
    }
    MenuItem.prototype.render = function () {
        var _a = this.props, label = _a.label, icon = _a.icon, onClick = _a.onClick, fontSize = _a.fontSize;
        var iconProps = {
            icon: icon,
            fontSize: fontSize,
        };
        var labelProps = {
            label: label,
            fontSize: fontSize,
        };
        return (React.createElement("div", { className: css_1.default('menuItem', {
                withLabel: !!label,
                interactive: !!onClick,
            }), onClick: this._onClick },
            !!icon && (React.createElement(Icon_1.default, __assign({}, iconProps))),
            !!label && (React.createElement(Label_1.default, __assign({}, labelProps)))));
    };
    MenuItem.prototype._onClick = function (ev) {
        var onClick = this.props.onClick;
        if (onClick) {
            // ev.stopPropagation();
            // ev.preventDefault();
            onClick();
        }
    };
    return MenuItem;
}(React.Component));
exports.default = MenuItem;


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Datasources
var BggApi_1 = __webpack_require__(109);
// Root
var rootStore_1 = __webpack_require__(33);
// Local
var actionNames_1 = __webpack_require__(11);
function showThing(id) {
    BggApi_1.default.thing(function (things) {
        rootStore_1.default.dispatch(receiveThingForShow(things));
    }, { stats: 1, id: id });
    return {
        type: actionNames_1.SHOW_THING,
    };
}
exports.default = showThing;
function receiveThingForShow(thing) {
    return {
        type: actionNames_1.RECEIVE_THING_FOR_SHOW,
        thing: thing,
    };
}


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Utilities
var url_1 = __webpack_require__(256);
var ROOT_PATH = 'https://www.boardgamegeek.com/xmlapi2/';
var BggApi = /** @class */ (function () {
    function BggApi() {
    }
    BggApi.getInstance = function () {
        if (!BggApi.instance) {
            BggApi.instance = new BggApi();
        }
        if (!BggApi.parser) {
            BggApi.parser = new DOMParser();
        }
        return BggApi.instance;
    };
    BggApi.thing = function (callback, parameters) {
        function onReadyFunction() {
            if (this.readyState === XMLHttpRequest.DONE) {
                var xml = BggApi._parseResponse(this);
                callback(BggApi._mapItemXml(xml.children[0].children[0]));
            }
        }
        BggApi._request('thing', onReadyFunction, parameters);
    };
    BggApi.hot = function (callback) {
        function onReadyFunction() {
            if (this.readyState === XMLHttpRequest.DONE) {
                var xmlList = BggApi._parseResponse(this);
                callback([].slice.call(xmlList.children[0].children).map(BggApi._mapItemXml));
            }
        }
        BggApi._request('hot', onReadyFunction);
    };
    BggApi._parseResponse = function (request) {
        var xmlDom = BggApi.parser.parseFromString(request.responseText, 'application/xml');
        return xmlDom;
    };
    BggApi._mapItemXml = function (itemXml) {
        var ret = {
            id: itemXml.getAttribute('id'),
            rank: Number(itemXml.getAttribute('rank')),
            tags: {},
        };
        function extractTag(xml) {
            var tag = {
                value: '',
            };
            for (var _i = 0, _a = xml.attributes; _i < _a.length; _i++) {
                var attr = _a[_i];
                tag[attr.name] = attr.value;
            }
            if (!tag.value) {
                tag.value = xml.innerHTML;
            }
            return tag;
        }
        function generateTags(xml) {
            var tags = {};
            for (var _i = 0, _a = xml.children; _i < _a.length; _i++) {
                var tag = _a[_i];
                var tagData = void 0;
                if (tag.children.length > 0) {
                    tagData = (generateTags(tag));
                }
                else {
                    tagData = (extractTag(tag));
                }
                if (tags[tag.tagName]) {
                    if (tags[tag.tagName] instanceof Array) {
                        tags[tag.tagName].push(tagData);
                    }
                    else {
                        tags[tag.tagName] = [tags[tag.tagName], tagData];
                    }
                }
                else {
                    tags[tag.tagName] = tagData;
                }
            }
            return tags;
        }
        ret.tags = generateTags(itemXml);
        return ret;
    };
    BggApi._request = function (endPoint, onReadyFunction, parameters) {
        // Ensure instance exists
        BggApi.getInstance();
        var request = new XMLHttpRequest();
        request.onreadystatechange = onReadyFunction;
        var url = url_1.formUrl(ROOT_PATH, endPoint, parameters);
        request.open('get', url);
        request.send();
    };
    return BggApi;
}());
exports.default = BggApi;


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Local
__webpack_require__(267);
var Image = /** @class */ (function (_super) {
    __extends(Image, _super);
    function Image(props) {
        return _super.call(this, props) || this;
    }
    Image.prototype.render = function () {
        var _a = this.props, width = _a.width, height = _a.height;
        var style = {
            width: width,
            height: height,
        };
        return (React.createElement("div", { className: 'image-container ', style: style },
            React.createElement("img", __assign({ className: 'image' }, this.props))));
    };
    return Image;
}(React.Component));
exports.default = Image;


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
var ReactDom = __webpack_require__(71);
var react_redux_1 = __webpack_require__(26);
// Local
var Root_1 = __webpack_require__(238);
var rootStore_1 = __webpack_require__(33);
ReactDom.render(React.createElement(react_redux_1.Provider, { store: rootStore_1.default },
    React.createElement(Root_1.default, null)), document.getElementById('app'));


/***/ }),
/* 112 */,
/* 113 */,
/* 114 */,
/* 115 */,
/* 116 */,
/* 117 */,
/* 118 */,
/* 119 */,
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */,
/* 124 */,
/* 125 */,
/* 126 */,
/* 127 */,
/* 128 */,
/* 129 */,
/* 130 */,
/* 131 */,
/* 132 */,
/* 133 */,
/* 134 */,
/* 135 */,
/* 136 */,
/* 137 */,
/* 138 */,
/* 139 */,
/* 140 */,
/* 141 */,
/* 142 */,
/* 143 */,
/* 144 */,
/* 145 */,
/* 146 */,
/* 147 */,
/* 148 */,
/* 149 */,
/* 150 */,
/* 151 */,
/* 152 */,
/* 153 */,
/* 154 */,
/* 155 */,
/* 156 */,
/* 157 */,
/* 158 */,
/* 159 */,
/* 160 */,
/* 161 */,
/* 162 */,
/* 163 */,
/* 164 */,
/* 165 */,
/* 166 */,
/* 167 */,
/* 168 */,
/* 169 */,
/* 170 */,
/* 171 */,
/* 172 */,
/* 173 */,
/* 174 */,
/* 175 */,
/* 176 */,
/* 177 */,
/* 178 */,
/* 179 */,
/* 180 */,
/* 181 */,
/* 182 */,
/* 183 */,
/* 184 */,
/* 185 */,
/* 186 */,
/* 187 */,
/* 188 */,
/* 189 */,
/* 190 */,
/* 191 */,
/* 192 */,
/* 193 */,
/* 194 */,
/* 195 */,
/* 196 */,
/* 197 */,
/* 198 */,
/* 199 */,
/* 200 */,
/* 201 */,
/* 202 */,
/* 203 */,
/* 204 */,
/* 205 */,
/* 206 */,
/* 207 */,
/* 208 */,
/* 209 */,
/* 210 */,
/* 211 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (immutable) */ __webpack_exports__["a"] = createProvider;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(97);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_PropTypes__ = __webpack_require__(98);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__utils_warning__ = __webpack_require__(60);
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }






var didWarnAboutReceivingStore = false;
function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return;
  }
  didWarnAboutReceivingStore = true;

  Object(__WEBPACK_IMPORTED_MODULE_3__utils_warning__["a" /* default */])('<Provider> does not support changing `store` on the fly. ' + 'It is most likely that you see this error because you updated to ' + 'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' + 'automatically. See https://github.com/reactjs/react-redux/releases/' + 'tag/v2.0.0 for the migration instructions.');
}

function createProvider() {
  var _Provider$childContex;

  var storeKey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'store';
  var subKey = arguments[1];

  var subscriptionKey = subKey || storeKey + 'Subscription';

  var Provider = function (_Component) {
    _inherits(Provider, _Component);

    Provider.prototype.getChildContext = function getChildContext() {
      var _ref;

      return _ref = {}, _ref[storeKey] = this[storeKey], _ref[subscriptionKey] = null, _ref;
    };

    function Provider(props, context) {
      _classCallCheck(this, Provider);

      var _this = _possibleConstructorReturn(this, _Component.call(this, props, context));

      _this[storeKey] = props.store;
      return _this;
    }

    Provider.prototype.render = function render() {
      return __WEBPACK_IMPORTED_MODULE_0_react__["Children"].only(this.props.children);
    };

    return Provider;
  }(__WEBPACK_IMPORTED_MODULE_0_react__["Component"]);

  if (process.env.NODE_ENV !== 'production') {
    Provider.prototype.componentWillReceiveProps = function (nextProps) {
      if (this[storeKey] !== nextProps.store) {
        warnAboutReceivingStore();
      }
    };
  }

  Provider.propTypes = {
    store: __WEBPACK_IMPORTED_MODULE_2__utils_PropTypes__["a" /* storeShape */].isRequired,
    children: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.element.isRequired
  };
  Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[storeKey] = __WEBPACK_IMPORTED_MODULE_2__utils_PropTypes__["a" /* storeShape */].isRequired, _Provider$childContex[subscriptionKey] = __WEBPACK_IMPORTED_MODULE_2__utils_PropTypes__["b" /* subscriptionShape */], _Provider$childContex);

  return Provider;
}

/* harmony default export */ __webpack_exports__["b"] = (createProvider());
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



var emptyFunction = __webpack_require__(9);
var invariant = __webpack_require__(1);
var ReactPropTypesSecret = __webpack_require__(43);

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */


var REACT_STATICS = {
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    mixins: true,
    propTypes: true,
    type: true
};

var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};

var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = getPrototypeOf && getPrototypeOf(Object);

module.exports = function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components

        if (objectPrototype) {
            var inheritedComponent = getPrototypeOf(sourceComponent);
            if (inheritedComponent && inheritedComponent !== objectPrototype) {
                hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
            }
        }

        var keys = getOwnPropertyNames(sourceComponent);

        if (getOwnPropertySymbols) {
            keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            if (!REACT_STATICS[key] && !KNOWN_STATICS[key] && (!blacklist || !blacklist[key])) {
                var descriptor = getOwnPropertyDescriptor(sourceComponent, key);
                try { // Avoid failures from read-only properties
                    defineProperty(targetComponent, key, descriptor);
                } catch (e) {}
            }
        }

        return targetComponent;
    }

    return targetComponent;
};


/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if (process.env.NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 215 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Subscription; });
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants

var CLEARED = null;
var nullListeners = {
  notify: function notify() {}
};

function createListenerCollection() {
  // the current/next pattern is copied from redux's createStore code.
  // TODO: refactor+expose that code to be reusable here?
  var current = [];
  var next = [];

  return {
    clear: function clear() {
      next = CLEARED;
      current = CLEARED;
    },
    notify: function notify() {
      var listeners = current = next;
      for (var i = 0; i < listeners.length; i++) {
        listeners[i]();
      }
    },
    get: function get() {
      return next;
    },
    subscribe: function subscribe(listener) {
      var isSubscribed = true;
      if (next === current) next = current.slice();
      next.push(listener);

      return function unsubscribe() {
        if (!isSubscribed || current === CLEARED) return;
        isSubscribed = false;

        if (next === current) next = current.slice();
        next.splice(next.indexOf(listener), 1);
      };
    }
  };
}

var Subscription = function () {
  function Subscription(store, parentSub, onStateChange) {
    _classCallCheck(this, Subscription);

    this.store = store;
    this.parentSub = parentSub;
    this.onStateChange = onStateChange;
    this.unsubscribe = null;
    this.listeners = nullListeners;
  }

  Subscription.prototype.addNestedSub = function addNestedSub(listener) {
    this.trySubscribe();
    return this.listeners.subscribe(listener);
  };

  Subscription.prototype.notifyNestedSubs = function notifyNestedSubs() {
    this.listeners.notify();
  };

  Subscription.prototype.isSubscribed = function isSubscribed() {
    return Boolean(this.unsubscribe);
  };

  Subscription.prototype.trySubscribe = function trySubscribe() {
    if (!this.unsubscribe) {
      this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.onStateChange) : this.store.subscribe(this.onStateChange);

      this.listeners = createListenerCollection();
    }
  };

  Subscription.prototype.tryUnsubscribe = function tryUnsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      this.listeners.clear();
      this.listeners = nullListeners;
    }
  };

  return Subscription;
}();



/***/ }),
/* 216 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export createConnect */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_connectAdvanced__ = __webpack_require__(99);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils_shallowEqual__ = __webpack_require__(217);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__mapDispatchToProps__ = __webpack_require__(218);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__mapStateToProps__ = __webpack_require__(234);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__mergeProps__ = __webpack_require__(235);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__selectorFactory__ = __webpack_require__(236);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }








/*
  connect is a facade over connectAdvanced. It turns its args into a compatible
  selectorFactory, which has the signature:

    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
  
  connect passes its args to connectAdvanced as options, which will in turn pass them to
  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

  selectorFactory returns a final props selector from its mapStateToProps,
  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
  mergePropsFactories, and pure args.

  The resulting final props selector is called by the Connect component instance whenever
  it receives new props or store state.
 */

function match(arg, factories, name) {
  for (var i = factories.length - 1; i >= 0; i--) {
    var result = factories[i](arg);
    if (result) return result;
  }

  return function (dispatch, options) {
    throw new Error('Invalid value of type ' + typeof arg + ' for ' + name + ' argument when connecting component ' + options.wrappedComponentName + '.');
  };
}

function strictEqual(a, b) {
  return a === b;
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
function createConnect() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$connectHOC = _ref.connectHOC,
      connectHOC = _ref$connectHOC === undefined ? __WEBPACK_IMPORTED_MODULE_0__components_connectAdvanced__["a" /* default */] : _ref$connectHOC,
      _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
      mapStateToPropsFactories = _ref$mapStateToPropsF === undefined ? __WEBPACK_IMPORTED_MODULE_3__mapStateToProps__["a" /* default */] : _ref$mapStateToPropsF,
      _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
      mapDispatchToPropsFactories = _ref$mapDispatchToPro === undefined ? __WEBPACK_IMPORTED_MODULE_2__mapDispatchToProps__["a" /* default */] : _ref$mapDispatchToPro,
      _ref$mergePropsFactor = _ref.mergePropsFactories,
      mergePropsFactories = _ref$mergePropsFactor === undefined ? __WEBPACK_IMPORTED_MODULE_4__mergeProps__["a" /* default */] : _ref$mergePropsFactor,
      _ref$selectorFactory = _ref.selectorFactory,
      selectorFactory = _ref$selectorFactory === undefined ? __WEBPACK_IMPORTED_MODULE_5__selectorFactory__["a" /* default */] : _ref$selectorFactory;

  return function connect(mapStateToProps, mapDispatchToProps, mergeProps) {
    var _ref2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {},
        _ref2$pure = _ref2.pure,
        pure = _ref2$pure === undefined ? true : _ref2$pure,
        _ref2$areStatesEqual = _ref2.areStatesEqual,
        areStatesEqual = _ref2$areStatesEqual === undefined ? strictEqual : _ref2$areStatesEqual,
        _ref2$areOwnPropsEqua = _ref2.areOwnPropsEqual,
        areOwnPropsEqual = _ref2$areOwnPropsEqua === undefined ? __WEBPACK_IMPORTED_MODULE_1__utils_shallowEqual__["a" /* default */] : _ref2$areOwnPropsEqua,
        _ref2$areStatePropsEq = _ref2.areStatePropsEqual,
        areStatePropsEqual = _ref2$areStatePropsEq === undefined ? __WEBPACK_IMPORTED_MODULE_1__utils_shallowEqual__["a" /* default */] : _ref2$areStatePropsEq,
        _ref2$areMergedPropsE = _ref2.areMergedPropsEqual,
        areMergedPropsEqual = _ref2$areMergedPropsE === undefined ? __WEBPACK_IMPORTED_MODULE_1__utils_shallowEqual__["a" /* default */] : _ref2$areMergedPropsE,
        extraOptions = _objectWithoutProperties(_ref2, ['pure', 'areStatesEqual', 'areOwnPropsEqual', 'areStatePropsEqual', 'areMergedPropsEqual']);

    var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
    var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
    var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');

    return connectHOC(selectorFactory, _extends({
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: function getDisplayName(name) {
        return 'Connect(' + name + ')';
      },

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps: initMapStateToProps,
      initMapDispatchToProps: initMapDispatchToProps,
      initMergeProps: initMergeProps,
      pure: pure,
      areStatesEqual: areStatesEqual,
      areOwnPropsEqual: areOwnPropsEqual,
      areStatePropsEqual: areStatePropsEqual,
      areMergedPropsEqual: areMergedPropsEqual

    }, extraOptions));
  };
}

/* harmony default export */ __webpack_exports__["a"] = (createConnect());

/***/ }),
/* 217 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = shallowEqual;
var hasOwn = Object.prototype.hasOwnProperty;

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (var i = 0; i < keysA.length; i++) {
    if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

/***/ }),
/* 218 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export whenMapDispatchToPropsIsFunction */
/* unused harmony export whenMapDispatchToPropsIsMissing */
/* unused harmony export whenMapDispatchToPropsIsObject */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__wrapMapToProps__ = __webpack_require__(105);



function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === 'function' ? Object(__WEBPACK_IMPORTED_MODULE_1__wrapMapToProps__["b" /* wrapMapToPropsFunc */])(mapDispatchToProps, 'mapDispatchToProps') : undefined;
}

function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  return !mapDispatchToProps ? Object(__WEBPACK_IMPORTED_MODULE_1__wrapMapToProps__["a" /* wrapMapToPropsConstant */])(function (dispatch) {
    return { dispatch: dispatch };
  }) : undefined;
}

function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? Object(__WEBPACK_IMPORTED_MODULE_1__wrapMapToProps__["a" /* wrapMapToPropsConstant */])(function (dispatch) {
    return Object(__WEBPACK_IMPORTED_MODULE_0_redux__["bindActionCreators"])(mapDispatchToProps, dispatch);
  }) : undefined;
}

/* harmony default export */ __webpack_exports__["a"] = ([whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject]);

/***/ }),
/* 219 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol_js__ = __webpack_require__(101);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__getRawTag_js__ = __webpack_require__(222);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__objectToString_js__ = __webpack_require__(223);




/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */] ? __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */].toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? Object(__WEBPACK_IMPORTED_MODULE_1__getRawTag_js__["a" /* default */])(value)
    : Object(__WEBPACK_IMPORTED_MODULE_2__objectToString_js__["a" /* default */])(value);
}

/* harmony default export */ __webpack_exports__["a"] = (baseGetTag);


/***/ }),
/* 220 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__ = __webpack_require__(221);


/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = __WEBPACK_IMPORTED_MODULE_0__freeGlobal_js__["a" /* default */] || freeSelf || Function('return this')();

/* harmony default export */ __webpack_exports__["a"] = (root);


/***/ }),
/* 221 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/* harmony default export */ __webpack_exports__["a"] = (freeGlobal);

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(102)))

/***/ }),
/* 222 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Symbol_js__ = __webpack_require__(101);


/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */] ? __WEBPACK_IMPORTED_MODULE_0__Symbol_js__["a" /* default */].toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/* harmony default export */ __webpack_exports__["a"] = (getRawTag);


/***/ }),
/* 223 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

/* harmony default export */ __webpack_exports__["a"] = (objectToString);


/***/ }),
/* 224 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__overArg_js__ = __webpack_require__(225);


/** Built-in value references. */
var getPrototype = Object(__WEBPACK_IMPORTED_MODULE_0__overArg_js__["a" /* default */])(Object.getPrototypeOf, Object);

/* harmony default export */ __webpack_exports__["a"] = (getPrototype);


/***/ }),
/* 225 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* harmony default export */ __webpack_exports__["a"] = (overArg);


/***/ }),
/* 226 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/* harmony default export */ __webpack_exports__["a"] = (isObjectLike);


/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(228);


/***/ }),
/* 228 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global, module) {

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = __webpack_require__(230);

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (true) {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(102), __webpack_require__(229)(module)))

/***/ }),
/* 229 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};

/***/ }),
/* 231 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* harmony export (immutable) */ __webpack_exports__["a"] = combineReducers;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__createStore__ = __webpack_require__(100);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_lodash_es_isPlainObject__ = __webpack_require__(61);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils_warning__ = __webpack_require__(103);




function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state. ' + 'If you want this reducer to hold no value, you can return null instead of undefined.';
}

function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
  var reducerKeys = Object.keys(reducers);
  var argumentName = action && action.type === __WEBPACK_IMPORTED_MODULE_0__createStore__["a" /* ActionTypes */].INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';

  if (reducerKeys.length === 0) {
    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
  }

  if (!Object(__WEBPACK_IMPORTED_MODULE_1_lodash_es_isPlainObject__["a" /* default */])(inputState)) {
    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
  }

  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
  });

  unexpectedKeys.forEach(function (key) {
    unexpectedKeyCache[key] = true;
  });

  if (unexpectedKeys.length > 0) {
    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
  }
}

function assertReducerShape(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: __WEBPACK_IMPORTED_MODULE_0__createStore__["a" /* ActionTypes */].INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined. If you don\'t want to set a value for this reducer, ' + 'you can use null instead of undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + __WEBPACK_IMPORTED_MODULE_0__createStore__["a" /* ActionTypes */].INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined, but can be null.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_warning__["a" /* default */])('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var unexpectedKeyCache = void 0;
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {};
  }

  var shapeAssertionError = void 0;
  try {
    assertReducerShape(finalReducers);
  } catch (e) {
    shapeAssertionError = e;
  }

  return function combination() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var action = arguments[1];

    if (shapeAssertionError) {
      throw shapeAssertionError;
    }

    if (process.env.NODE_ENV !== 'production') {
      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
      if (warningMessage) {
        Object(__WEBPACK_IMPORTED_MODULE_2__utils_warning__["a" /* default */])(warningMessage);
      }
    }

    var hasChanged = false;
    var nextState = {};
    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(_key, action);
        throw new Error(errorMessage);
      }
      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 232 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = bindActionCreators;
function bindActionCreator(actionCreator, dispatch) {
  return function () {
    return dispatch(actionCreator.apply(undefined, arguments));
  };
}

/**
 * Turns an object whose values are action creators, into an object with the
 * same keys, but with every function wrapped into a `dispatch` call so they
 * may be invoked directly. This is just a convenience method, as you can call
 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
 *
 * For convenience, you can also pass a single function as the first argument,
 * and get a function in return.
 *
 * @param {Function|Object} actionCreators An object whose values are action
 * creator functions. One handy way to obtain it is to use ES6 `import * as`
 * syntax. You may also pass a single function.
 *
 * @param {Function} dispatch The `dispatch` function available on your Redux
 * store.
 *
 * @returns {Function|Object} The object mimicking the original object, but with
 * every action creator wrapped into the `dispatch` call. If you passed a
 * function as `actionCreators`, the return value will also be a single
 * function.
 */
function bindActionCreators(actionCreators, dispatch) {
  if (typeof actionCreators === 'function') {
    return bindActionCreator(actionCreators, dispatch);
  }

  if (typeof actionCreators !== 'object' || actionCreators === null) {
    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
  }

  var keys = Object.keys(actionCreators);
  var boundActionCreators = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}

/***/ }),
/* 233 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = applyMiddleware;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__compose__ = __webpack_require__(104);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };



/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = __WEBPACK_IMPORTED_MODULE_0__compose__["a" /* default */].apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}

/***/ }),
/* 234 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export whenMapStateToPropsIsFunction */
/* unused harmony export whenMapStateToPropsIsMissing */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__wrapMapToProps__ = __webpack_require__(105);


function whenMapStateToPropsIsFunction(mapStateToProps) {
  return typeof mapStateToProps === 'function' ? Object(__WEBPACK_IMPORTED_MODULE_0__wrapMapToProps__["b" /* wrapMapToPropsFunc */])(mapStateToProps, 'mapStateToProps') : undefined;
}

function whenMapStateToPropsIsMissing(mapStateToProps) {
  return !mapStateToProps ? Object(__WEBPACK_IMPORTED_MODULE_0__wrapMapToProps__["a" /* wrapMapToPropsConstant */])(function () {
    return {};
  }) : undefined;
}

/* harmony default export */ __webpack_exports__["a"] = ([whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing]);

/***/ }),
/* 235 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* unused harmony export defaultMergeProps */
/* unused harmony export wrapMergePropsFunc */
/* unused harmony export whenMergePropsIsFunction */
/* unused harmony export whenMergePropsIsOmitted */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_verifyPlainObject__ = __webpack_require__(106);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };



function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return _extends({}, ownProps, stateProps, dispatchProps);
}

function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(dispatch, _ref) {
    var displayName = _ref.displayName,
        pure = _ref.pure,
        areMergedPropsEqual = _ref.areMergedPropsEqual;

    var hasRunOnce = false;
    var mergedProps = void 0;

    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

      if (hasRunOnce) {
        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
      } else {
        hasRunOnce = true;
        mergedProps = nextMergedProps;

        if (process.env.NODE_ENV !== 'production') Object(__WEBPACK_IMPORTED_MODULE_0__utils_verifyPlainObject__["a" /* default */])(mergedProps, displayName, 'mergeProps');
      }

      return mergedProps;
    };
  };
}

function whenMergePropsIsFunction(mergeProps) {
  return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
}

function whenMergePropsIsOmitted(mergeProps) {
  return !mergeProps ? function () {
    return defaultMergeProps;
  } : undefined;
}

/* harmony default export */ __webpack_exports__["a"] = ([whenMergePropsIsFunction, whenMergePropsIsOmitted]);
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 236 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* unused harmony export impureFinalPropsSelectorFactory */
/* unused harmony export pureFinalPropsSelectorFactory */
/* harmony export (immutable) */ __webpack_exports__["a"] = finalPropsSelectorFactory;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__verifySubselectors__ = __webpack_require__(237);
function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }



function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
  return function impureFinalPropsSelector(state, ownProps) {
    return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
  };
}

function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
  var areStatesEqual = _ref.areStatesEqual,
      areOwnPropsEqual = _ref.areOwnPropsEqual,
      areStatePropsEqual = _ref.areStatePropsEqual;

  var hasRunAtLeastOnce = false;
  var state = void 0;
  var ownProps = void 0;
  var stateProps = void 0;
  var dispatchProps = void 0;
  var mergedProps = void 0;

  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState;
    ownProps = firstOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    return mergedProps;
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps);

    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);

    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);

    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewState() {
    var nextStateProps = mapStateToProps(state, ownProps);
    var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;

    if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);

    return mergedProps;
  }

  function handleSubsequentCalls(nextState, nextOwnProps) {
    var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
    var stateChanged = !areStatesEqual(nextState, state);
    state = nextState;
    ownProps = nextOwnProps;

    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
    if (propsChanged) return handleNewProps();
    if (stateChanged) return handleNewState();
    return mergedProps;
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
  };
}

// TODO: Add more comments

// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.

function finalPropsSelectorFactory(dispatch, _ref2) {
  var initMapStateToProps = _ref2.initMapStateToProps,
      initMapDispatchToProps = _ref2.initMapDispatchToProps,
      initMergeProps = _ref2.initMergeProps,
      options = _objectWithoutProperties(_ref2, ['initMapStateToProps', 'initMapDispatchToProps', 'initMergeProps']);

  var mapStateToProps = initMapStateToProps(dispatch, options);
  var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  var mergeProps = initMergeProps(dispatch, options);

  if (process.env.NODE_ENV !== 'production') {
    Object(__WEBPACK_IMPORTED_MODULE_0__verifySubselectors__["a" /* default */])(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
  }

  var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;

  return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(0)))

/***/ }),
/* 237 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = verifySubselectors;
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_warning__ = __webpack_require__(60);


function verify(selector, methodName, displayName) {
  if (!selector) {
    throw new Error('Unexpected value for ' + methodName + ' in ' + displayName + '.');
  } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
    if (!selector.hasOwnProperty('dependsOnOwnProps')) {
      Object(__WEBPACK_IMPORTED_MODULE_0__utils_warning__["a" /* default */])('The selector for ' + methodName + ' of ' + displayName + ' did not specify a value for dependsOnOwnProps.');
    }
  }
}

function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
  verify(mapStateToProps, 'mapStateToProps', displayName);
  verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
  verify(mergeProps, 'mergeProps', displayName);
}

/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
var react_redux_1 = __webpack_require__(26);
// Actions
var resizeBreakpoint_1 = __webpack_require__(239);
// Local
__webpack_require__(240);
// Components and containers
var Label_1 = __webpack_require__(32);
var Loading_1 = __webpack_require__(245);
var header_1 = __webpack_require__(248);
var contentList_1 = __webpack_require__(255);
var contentThing_1 = __webpack_require__(274);
var pullout_1 = __webpack_require__(279);
// Utilities
var constants_1 = __webpack_require__(27);
var css_1 = __webpack_require__(16);
var responsive_1 = __webpack_require__(62);
var fontLoader_1 = __webpack_require__(284);
var RootPresentation = /** @class */ (function (_super) {
    __extends(RootPresentation, _super);
    function RootPresentation(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            sizeThreshold: responsive_1.getSizeThreshold(),
        };
        _this._onWindowResized = _this._onWindowResized.bind(_this);
        return _this;
    }
    RootPresentation.prototype.componentWillMount = function () {
        fontLoader_1.loadGoogleFont(fontLoader_1.FONT_NAMES.DROID_SANS);
        fontLoader_1.loadGoogleFont(fontLoader_1.FONT_NAMES.MATERIAL_ICONS);
    };
    RootPresentation.prototype.componentDidMount = function () {
        window.addEventListener('resize', this._onWindowResized);
    };
    RootPresentation.prototype.render = function () {
        var _a = this.props, layout = _a.layout, theme = _a.theme;
        var sizeThreshold = this.state.sizeThreshold;
        var content = (React.createElement("div", null));
        switch (layout) {
            case constants_1.CONTENT_LAYOUT.empty:
                content = (React.createElement(Label_1.default, { label: 'Welcome!' }));
                break;
            case constants_1.CONTENT_LAYOUT.loading:
                content = (React.createElement(Loading_1.default, null));
                break;
            case constants_1.CONTENT_LAYOUT.list:
                content = (React.createElement(contentList_1.default, null));
                break;
            case constants_1.CONTENT_LAYOUT.thing:
                content = (React.createElement(contentThing_1.default, null));
                break;
            default: break;
        }
        return (React.createElement("div", { className: css_1.default('root', (_b = {},
                _b[constants_1.THEME[theme].toLowerCase()] = true,
                _b)) },
            React.createElement("div", { className: css_1.default('content', (_c = {},
                    _c[responsive_1.SIZE_BREAKPOINT[sizeThreshold]] = true,
                    _c.primary = true,
                    _c)) },
                React.createElement(header_1.default, null),
                React.createElement("div", { className: 'content-main' }, content),
                React.createElement(pullout_1.default, null))));
        var _b, _c;
    };
    RootPresentation.prototype._onWindowResized = function () {
        var newSize = responsive_1.getSizeThreshold();
        if (newSize !== this.state.sizeThreshold) {
            this.setState({ sizeThreshold: responsive_1.getSizeThreshold() });
        }
    };
    return RootPresentation;
}(React.Component));
function mapStateToProps(state, ownProps) {
    return {
        layout: state.content.layout,
        theme: state.root.theme,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        onResizeBreakpoint: function (breakpoint) { dispatch(resizeBreakpoint_1.default(breakpoint)); },
    };
}
var Root = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(RootPresentation);
exports.default = Root;


/***/ }),
/* 239 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Utilities
var responsive_1 = __webpack_require__(62);
// Local
var actionNames_1 = __webpack_require__(11);
function resizeBreakpoint(breakpoint) {
    return {
        type: actionNames_1.RESIZE_BREAKPOINT,
        breakpoint: responsive_1.SIZE_BREAKPOINT,
    };
}
exports.default = resizeBreakpoint;


/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(241);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./Root.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./Root.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.root {\n  color: #839496;\n  background-color: #00212b;\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: 0;\n  bottom: 0;\n  overflow-y: scroll;\n  overflow-x: hidden; }\n  .root.light {\n    color: #657b83;\n    background-color: #fcf9f3; }\n\n.content {\n  user-select: auto;\n  cursor: auto;\n  width: 640px;\n  margin: 12px auto; }\n  .content.small {\n    min-width: 480px;\n    width: 100%;\n    margin: 0px auto; }\n  .content.large {\n    width: 60%; }\n  .content.xlarge, .content.xxlarge {\n    width: 1152px; }\n\n.content-main {\n  padding: 12px; }\n", ""]);

// exports


/***/ }),
/* 242 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(244);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Label.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Label.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 244 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".label-container {\n  display: inline; }\n", ""]);

// exports


/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Utilities
var css_1 = __webpack_require__(16);
// Local
__webpack_require__(246);
var Loading = /** @class */ (function (_super) {
    __extends(Loading, _super);
    function Loading(props) {
        return _super.call(this, props) || this;
    }
    Loading.prototype.render = function () {
        var _a = this.props;
        return (React.createElement("div", { className: css_1.default('loading', {}) },
            React.createElement("div", { className: 'loading-0' }),
            React.createElement("div", { className: 'loading-1' }),
            React.createElement("div", { className: 'loading-2' }),
            React.createElement("div", { className: 'loading-3' }),
            React.createElement("span", null, " Loading... ")));
    };
    return Loading;
}(React.Component));
exports.default = Loading;


/***/ }),
/* 246 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(247);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Loading.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Loading.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 247 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.light .loading span {\n  background-color: rgba(253, 246, 227, 0.4); }\n\n.light .loading div {\n  box-shadow: -6px -6px #eee8d5; }\n\n.loading {\n  position: relative;\n  height: 32px; }\n  .loading span {\n    position: absolute;\n    display: block;\n    font-size: 18px;\n    background-color: rgba(0, 43, 54, 0.4);\n    padding: 4px;\n    left: 50%;\n    transform: translate(-50%, 0); }\n  .loading div {\n    position: absolute;\n    display: inline-block;\n    margin-right: 32px;\n    width: 32px;\n    height: 32px;\n    border-radius: 4px;\n    box-shadow: -6px -6px #00212b;\n    animation: loading 4s infinite cubic-bezier(0.4, 0.1, 0.6, 0.9);\n    opacity: 0.0; }\n    .loading div.loading-0 {\n      background-color: #dc322f;\n      animation-delay: .0s; }\n    .loading div.loading-1 {\n      background-color: #b58900;\n      animation-delay: .4s; }\n    .loading div.loading-2 {\n      background-color: #859900;\n      animation-delay: .8s; }\n    .loading div.loading-3 {\n      background-color: #268bd2;\n      animation-delay: 1.2s; }\n\n@keyframes loading {\n  0% {\n    opacity: 0.0;\n    margin-left: 0%;\n    transform: translate(0, 0) skew(0deg, -10deg); }\n  10% {\n    opacity: 0.7; }\n  90% {\n    opacity: 0.7; }\n  100% {\n    opacity: 0.0;\n    margin-left: 100%;\n    transform: translate(-32px, 0) skew(0deg, -10deg); } }\n", ""]);

// exports


/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var react_redux_1 = __webpack_require__(26);
// Local
var Header_1 = __webpack_require__(249);
function mapStateToProps(state, ownProps) {
    var menuItems = state.menuItems, header = state.header;
    var allMenuItems = menuItems;
    var leftItems = header.leftItems.map(function (itemId) { return allMenuItems[itemId]; });
    return {
        leftItems: leftItems,
        title: state.header.title,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {};
}
var Header = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(Header_1.default);
exports.default = Header;


/***/ }),
/* 249 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Common
var constants_1 = __webpack_require__(27);
// Components
var MenuItem_1 = __webpack_require__(107);
var Label_1 = __webpack_require__(32);
// Utilities
var css_1 = __webpack_require__(16);
// Local
__webpack_require__(253);
var Header = /** @class */ (function (_super) {
    __extends(Header, _super);
    function Header(props) {
        return _super.call(this, props) || this;
    }
    Header.prototype.render = function () {
        var _a = this.props, title = _a.title, leftItems = _a.leftItems, rightItems = _a.rightItems;
        var titleProps = {
            className: 'header-title',
            label: title,
            fontSize: constants_1.FONT_SIZE.massive,
        };
        return (React.createElement("div", { className: css_1.default('header', {
                highlight: true,
            }) },
            React.createElement("div", { className: 'header-left' }, !!leftItems && leftItems.map(this._renderSideItem)),
            React.createElement(Label_1.default, __assign({}, titleProps)),
            React.createElement("div", { className: 'header-right' }, !!rightItems && rightItems.map(this._renderSideItem))));
    };
    Header.prototype._renderSideItem = function (item, index) {
        var itemForRender = item;
        itemForRender.label = '';
        itemForRender.fontSize = constants_1.FONT_SIZE.massive;
        // itemForRender.style = this.style;
        return (React.createElement(MenuItem_1.default, __assign({}, itemForRender, { key: index })));
    };
    return Header;
}(React.Component));
exports.default = Header;


/***/ }),
/* 250 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Utilities
var css_1 = __webpack_require__(16);
var Icon = /** @class */ (function (_super) {
    __extends(Icon, _super);
    function Icon(props) {
        return _super.call(this, props) || this;
    }
    Icon.prototype.render = function () {
        var _a = this.props, className = _a.className, icon = _a.icon, fontSize = _a.fontSize;
        return (React.createElement("i", { className: css_1.default('material-icons', (_b = {},
                _b[className] = !!className,
                _b)), style: (_c = {}, _c['fontSize'] = fontSize, _c) }, icon));
        var _b, _c;
    };
    return Icon;
}(React.Component));
exports.default = Icon;


/***/ }),
/* 251 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(252);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./MenuItem.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./MenuItem.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 252 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.menuItem {\n  display: block;\n  margin: 0;\n  text-align: center;\n  height: 100%;\n  line-height: normal;\n  padding-right: .4em; }\n  .menuItem i {\n    width: 1em; }\n  .menuItem i, .menuItem span {\n    padding-left: .4em;\n    font-size: 1em;\n    line-height: 2em; }\n\n.withLabel i {\n  vertical-align: top; }\n\n.menuItem, .menuItem i, .menuItem span {\n  transition: all 0.1s cubic-bezier(0.16, 0.65, 0.45, 0.84); }\n", ""]);

// exports


/***/ }),
/* 253 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(254);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Header.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Header.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 254 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.header {\n  line-height: 2em;\n  height: 2em;\n  font-size: 32px;\n  text-align: center;\n  align-items: center; }\n  .header .header-left {\n    position: absolute; }\n  .header .header-title {\n    margin: 0 auto; }\n", ""]);

// exports


/***/ }),
/* 255 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var react_redux_1 = __webpack_require__(26);
// Actions
var showThing_1 = __webpack_require__(108);
// Local
var ThingList_1 = __webpack_require__(266);
function mapStateToProps(state, ownProps) {
    var content = state.content;
    return {
        items: content.things,
        rowHeight: '80px',
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        onItemClicked: function (id) {
            dispatch(showThing_1.default(id));
        },
    };
}
var ThingList = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(ThingList_1.default);
exports.default = ThingList;


/***/ }),
/* 256 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function formUrl(url, path, parameters) {
    var finalUrl = url + path;
    if (!!parameters) {
        finalUrl = Object.keys(parameters).reduce(function (urlPath, parameter, index) {
            return urlPath +
                ((index === 0) ? '?' : '&') +
                parameter + '=' + parameters[parameter];
        }, url + path);
    }
    return finalUrl;
}
exports.formUrl = formUrl;


/***/ }),
/* 257 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var redux_1 = __webpack_require__(21);
// Actions
var actionNames_1 = __webpack_require__(11);
// Reducers
var header_1 = __webpack_require__(258);
var menuItems_1 = __webpack_require__(263);
var pullout_1 = __webpack_require__(264);
var content_1 = __webpack_require__(265);
// Utilities
var responsive_1 = __webpack_require__(62);
var constants_1 = __webpack_require__(27);
var root = redux_1.combineReducers({
    theme: function (state, action) {
        if (state === void 0) { state = constants_1.THEME.Dark; }
        var type = action.type;
        switch (type) {
            case actionNames_1.SET_THEME:
                return state * -1 + 1;
            default: return state;
        }
    },
    sizeBreakpoint: function (state, action) {
        if (state === void 0) { state = undefined; }
        var type = action.type, breakpoint = action.breakpoint;
        if (!state) {
            return responsive_1.getSizeThreshold();
        }
        switch (type) {
            case actionNames_1.RESIZE_BREAKPOINT:
                return breakpoint;
            default: return state;
        }
    },
});
exports.reducer = redux_1.combineReducers({
    content: content_1.reducer,
    header: header_1.reducer,
    menuItems: menuItems_1.reducer,
    pullout: pullout_1.reducer,
    root: root,
});


/***/ }),
/* 258 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var redux_1 = __webpack_require__(21);
// Components
var menuItems_1 = __webpack_require__(63);
// Actions
var actionNames_1 = __webpack_require__(11);
// Utilities
var thing_1 = __webpack_require__(262);
exports.reducer = redux_1.combineReducers({
    title: function (state, action) {
        if (state === void 0) { state = 'Bgg Api Viewer'; }
        var type = action.type, thing = action.thing;
        switch (type) {
            case actionNames_1.RECEIVE_THING_LIST:
                return 'Hot Board Games';
            case actionNames_1.RECEIVE_THING_FOR_SHOW:
                return thing_1.getPrimaryName(thing);
            case actionNames_1.REQUEST_THING_LIST:
            case actionNames_1.SHOW_THING:
                return 'Just wait!';
            default: return state;
        }
    },
    leftItems: function (state, action) {
        if (state === void 0) { state = [
            menuItems_1.MENU_ITEM_ID.togglePullout,
        ]; }
        return state;
    },
});


/***/ }),
/* 259 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Datasources
var BggApi_1 = __webpack_require__(109);
// Root
var rootStore_1 = __webpack_require__(33);
// Local
var actionNames_1 = __webpack_require__(11);
function requestHotList() {
    BggApi_1.default.hot(function (things) {
        rootStore_1.default.dispatch(receiveHotList(things));
    });
    return {
        type: actionNames_1.REQUEST_THING_LIST,
    };
}
exports.default = requestHotList;
function receiveHotList(things) {
    return {
        type: actionNames_1.RECEIVE_THING_LIST,
        things: things,
    };
}


/***/ }),
/* 260 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Local
var actionNames_1 = __webpack_require__(11);
function toggleTheme(theme) {
    return {
        type: actionNames_1.SET_THEME,
        theme: theme,
    };
}
exports.default = toggleTheme;


/***/ }),
/* 261 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Local
var actionNames_1 = __webpack_require__(11);
function togglePullout() {
    return {
        type: actionNames_1.TOGGLE_PULLOUT,
    };
}
exports.default = togglePullout;


/***/ }),
/* 262 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function getPrimaryName(thing) {
    var name = thing.tags.name;
    if (name instanceof Array) {
        for (var _i = 0, name_1 = name; _i < name_1.length; _i++) {
            var altName = name_1[_i];
            if (altName.type === 'primary') {
                return altName.value;
            }
        }
    }
    else {
        return name.value;
    }
    console.warn('Thing has no primary name');
    return '';
}
exports.getPrimaryName = getPrimaryName;


/***/ }),
/* 263 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var redux_1 = __webpack_require__(21);
// Actions
var actionNames_1 = __webpack_require__(11);
var menuItems_1 = __webpack_require__(63);
// Common
var constants_1 = __webpack_require__(27);
// Root
var rootStore_1 = __webpack_require__(33);
var reducers = (_a = {},
    _a[menuItems_1.MENU_ITEM_ID.toggleTheme] = function (state, action) {
        if (state === void 0) { state = menuItems_1.DEFAULT_MENU_ITEMS[menuItems_1.MENU_ITEM_ID.toggleTheme]; }
        var type = action.type;
        switch (type) {
            case actionNames_1.SET_THEME:
                state.label = constants_1.THEME[rootStore_1.default.getState().root.theme] + ' Theme';
                return state;
            default: return state;
        }
    },
    _a);
var _loop_1 = function (item) {
    if (!reducers[item] && !reducers[menuItems_1.MENU_ITEM_ID[item]]) {
        var defaultState_1 = menuItems_1.DEFAULT_MENU_ITEMS[item];
        reducers[item] = function (state, action) {
            if (state === void 0) { state = defaultState_1; }
            return state;
        };
    }
};
for (var item in menuItems_1.MENU_ITEM_ID) {
    _loop_1(item);
}
exports.reducer = redux_1.combineReducers(reducers);
var _a;


/***/ }),
/* 264 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var redux_1 = __webpack_require__(21);
// Actions
var actionNames_1 = __webpack_require__(11);
// Components
var menuItems_1 = __webpack_require__(63);
exports.reducer = redux_1.combineReducers({
    items: function (state, action) {
        if (state === void 0) { state = [
            menuItems_1.MENU_ITEM_ID.showHotItems,
            menuItems_1.MENU_ITEM_ID.showThing,
            menuItems_1.MENU_ITEM_ID.toggleTheme,
        ]; }
        return state;
    },
    isVisible: function (state, action) {
        if (state === void 0) { state = false; }
        var type = action.type;
        switch (type) {
            case actionNames_1.TOGGLE_PULLOUT:
                return !state;
            case actionNames_1.CLOSE_PULLOUT:
                return false;
            default: return state;
        }
    },
});


/***/ }),
/* 265 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var redux_1 = __webpack_require__(21);
// Actions
var actionNames_1 = __webpack_require__(11);
// Common
var constants_1 = __webpack_require__(27);
exports.reducer = redux_1.combineReducers({
    layout: function (state, action) {
        if (state === void 0) { state = constants_1.CONTENT_LAYOUT.empty; }
        var type = action.type;
        switch (type) {
            case actionNames_1.RECEIVE_THING_LIST:
                return constants_1.CONTENT_LAYOUT.list;
            case actionNames_1.RECEIVE_THING_FOR_SHOW:
                return constants_1.CONTENT_LAYOUT.thing;
            case actionNames_1.REQUEST_THING_LIST:
            case actionNames_1.SHOW_THING:
                return constants_1.CONTENT_LAYOUT.loading;
            default: return state;
        }
    },
    title: function (state, action) {
        if (state === void 0) { state = 'Bgg Api Viewer'; }
        var type = action.type;
        switch (type) {
            default: return state;
        }
    },
    things: function (state, action) {
        if (state === void 0) { state = []; }
        var type = action.type, things = action.things, thing = action.thing;
        switch (type) {
            case actionNames_1.RECEIVE_THING_LIST:
                return things;
            case actionNames_1.RECEIVE_THING_FOR_SHOW:
                return [thing];
            default: return state;
        }
    },
});


/***/ }),
/* 266 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Components
var Image_1 = __webpack_require__(110);
var Label_1 = __webpack_require__(32);
var List_1 = __webpack_require__(269);
// utilities
var css_1 = __webpack_require__(16);
// Local
__webpack_require__(272);
var ThingList = /** @class */ (function (_super) {
    __extends(ThingList, _super);
    function ThingList(props) {
        var _this = _super.call(this, props) || this;
        _this._onRenderThing.bind(_this);
        return _this;
    }
    ThingList.prototype.render = function () {
        var props = __assign({}, this.props);
        props.onRenderItem = this._onRenderThing.bind(this);
        return (React.createElement(List_1.default, __assign({}, props)));
    };
    ThingList.prototype._onRenderThing = function (thing, index) {
        var rowHeight = this.props.rowHeight;
        var id = thing.id, rank = thing.rank, tags = thing.tags;
        var thumbnail = tags.thumbnail, yearpublished = tags.yearpublished, name = tags.name;
        var imageProps = {
            src: thumbnail.value,
            height: rowHeight,
            width: rowHeight,
        };
        return (React.createElement("div", { className: css_1.default('bggThing', {
                highlight: !!(index % 2),
                interactive: true,
            }), key: id, style: { height: rowHeight }, onClick: this._onItemClicked.bind(this, id) },
            React.createElement(Image_1.default, __assign({}, imageProps)),
            React.createElement("div", { className: 'bggThing-content' },
                React.createElement(Label_1.default, { className: 'bggThing-title', label: name.value }),
                React.createElement(Label_1.default, { className: 'bggThing-subtitle', label: 'Rank: ' + rank }),
                React.createElement(Label_1.default, { className: 'bggThing-subtitle', label: 'Year Published: ' + yearpublished.value }))));
    };
    ThingList.prototype._onItemClicked = function (id) {
        var onItemClicked = this.props.onItemClicked;
        onItemClicked(id);
    };
    return ThingList;
}(React.Component));
exports.default = ThingList;


/***/ }),
/* 267 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(268);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Image.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Image.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 268 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.image-container {\n  display: inline-block; }\n\n.image {\n  object-fit: cover; }\n", ""]);

// exports


/***/ }),
/* 269 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Utilities
var css_1 = __webpack_require__(16);
// Local
__webpack_require__(270);
var List = /** @class */ (function (_super) {
    __extends(List, _super);
    function List(props) {
        var _this = _super.call(this, props) || this;
        _this._onRenderItem = _this._onRenderItem.bind(_this);
        return _this;
    }
    List.prototype.render = function () {
        var _a = this.props, label = _a.label, items = _a.items;
        return (React.createElement("div", { className: css_1.default('list', {
                withLabel: !!label,
            }) }, items.map(this._onRenderItem)));
    };
    List.prototype._onRenderItem = function (item, index) {
        var onRenderItem = this.props.onRenderItem;
        if (onRenderItem) {
            return onRenderItem(item, index);
        }
        return (React.createElement("div", { key: index }, "Hello, world!"));
    };
    return List;
}(React.Component));
exports.default = List;


/***/ }),
/* 270 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(271);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./List.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./List.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 271 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n", ""]);

// exports


/***/ }),
/* 272 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(273);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./ThingList.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./ThingList.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 273 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.bggThing {\n  padding: 12px 0 12px 12px;\n  border-right: solid 12px transparent;\n  white-space: nowrap;\n  overflow: hidden; }\n\n.bggThing-content {\n  padding-left: 6px;\n  display: inline-block;\n  vertical-align: top;\n  width: 100%; }\n  .bggThing-content span {\n    display: block; }\n  .bggThing-content .bggThing-title {\n    font-size: 24px; }\n  .bggThing-content .bggThing-subtitle {\n    font-size: 16px; }\n", ""]);

// exports


/***/ }),
/* 274 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var react_redux_1 = __webpack_require__(26);
// Local
var ThingView_1 = __webpack_require__(275);
function mapStateToProps(state, ownProps) {
    var content = state.content;
    return {
        item: content.things[0],
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {};
}
var ThingView = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(ThingView_1.default);
exports.default = ThingView;


/***/ }),
/* 275 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Common
var constants_1 = __webpack_require__(27);
// Components
var Image_1 = __webpack_require__(110);
var Label_1 = __webpack_require__(32);
// utilities
var css_1 = __webpack_require__(16);
var html_1 = __webpack_require__(276);
// Local
__webpack_require__(277);
var headerTagRenderers = [
    function (tags) {
        var yearpublished = tags.yearpublished;
        return 'Published in ' + yearpublished.value;
    },
    function (tags) {
        var minage = tags.minage;
        return 'Ages ' + minage.value + ' and up';
    },
    function (tags) {
        var maxplayers = tags.maxplayers, minplayers = tags.minplayers;
        return minplayers.value + ' to ' + maxplayers.value + ' Players';
    },
    function (tags) {
        var maxplaytime = tags.maxplaytime, minplaytime = tags.minplaytime;
        return minplaytime.value + ' to ' + maxplaytime.value + ' minutes playtime';
    },
];
var ThingView = /** @class */ (function (_super) {
    __extends(ThingView, _super);
    function ThingView(props) {
        return _super.call(this, props) || this;
    }
    ThingView.prototype.render = function () {
        var item = this.props.item;
        var tags = item.tags;
        var image = tags.image;
        var imageProps = {
            className: 'thingView-header-img',
            src: image.value,
            width: '200px',
            height: '200px',
        };
        return (React.createElement("div", { className: 'thingView' },
            React.createElement("div", { className: 'thingView-header' },
                React.createElement(Image_1.default, __assign({}, imageProps)),
                React.createElement("div", { className: 'thingView-header-info' }, headerTagRenderers.map(function (labelGenerator, index) { return (React.createElement(Label_1.default, { className: css_1.default('thingView-header-tag', {
                        highlight: !!(index % 2),
                        primary: !(index % 2),
                    }), key: index, label: labelGenerator(tags), fontSize: constants_1.FONT_SIZE.large })); }))),
            React.createElement("div", { className: 'thingView-main' }, this._renderDescription())));
    };
    ThingView.prototype._renderDescription = function () {
        var paragraphs = html_1.decodeHtml(this.props.item.tags.description.value).split('\n').filter(function (item) { return !!item; });
        return (React.createElement("div", { className: 'thingView-description' }, paragraphs.map(function (text, index) { return (React.createElement("p", { className: css_1.default('', {
                highlight: !!(index % 2),
            }), key: index }, text)); })));
    };
    return ThingView;
}(React.Component));
exports.default = ThingView;


/***/ }),
/* 276 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function decodeHtml(input) {
    // Decode until length doesn't change
    var textSize = 0;
    var text = input;
    do {
        textSize = text.length;
        var doc = new DOMParser().parseFromString(text, 'text/html');
        text = doc.documentElement.textContent;
    } while (textSize !== text.length);
    return text;
}
exports.decodeHtml = decodeHtml;


/***/ }),
/* 277 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(278);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./ThingView.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./ThingView.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 278 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.light .thingView-header .thingView-header-info .thingView-header-tag.primary {\n  background: linear-gradient(90deg, rgba(253, 246, 227, 0), rgba(253, 246, 227, 0) 30%, #fdf6e3); }\n\n.light .thingView-header .thingView-header-info .thingView-header-tag.highlight {\n  background: linear-gradient(90deg, rgba(238, 232, 213, 0), rgba(238, 232, 213, 0) 30%, #eee8d5); }\n\n.thingView-header .thingView-header-info .thingView-header-tag.primary {\n  background: linear-gradient(90deg, rgba(0, 43, 54, 0), rgba(0, 43, 54, 0) 30%, #002b36); }\n\n.thingView-header .thingView-header-info .thingView-header-tag.highlight {\n  background: linear-gradient(90deg, rgba(7, 54, 66, 0), rgba(7, 54, 66, 0) 30%, #073642); }\n\n.thingView-header {\n  position: relative;\n  white-space: nowrap;\n  overflow: hidden; }\n  .thingView-header .thingView-header-info {\n    position: absolute;\n    left: 0;\n    display: inline-block;\n    vertical-align: top;\n    width: 100%; }\n    .thingView-header .thingView-header-info .thingView-header-tag {\n      padding: 6px;\n      display: block;\n      text-align: right; }\n\n.thingView-description p {\n  margin: 0;\n  padding: 12px;\n  text-indent: 40px;\n  text-align: justify; }\n", ""]);

// exports


/***/ }),
/* 279 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var react_redux_1 = __webpack_require__(26);
// Actions
var closePullout_1 = __webpack_require__(280);
// Local
var Pullout_1 = __webpack_require__(281);
function mapStateToProps(state, ownProps) {
    var menuItems = state.menuItems, pullout = state.pullout;
    var allMenuItems = menuItems;
    var pulloutItems = pullout.items.map(function (itemId) { return allMenuItems[itemId]; });
    return {
        title: 'Menu',
        isVisible: pullout.isVisible,
        items: pulloutItems,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        onClose: function () { dispatch(closePullout_1.default()); },
    };
}
var Pullout = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(Pullout_1.default);
exports.default = Pullout;


/***/ }),
/* 280 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Local
var actionNames_1 = __webpack_require__(11);
function closePullout() {
    return {
        type: actionNames_1.CLOSE_PULLOUT,
    };
}
exports.default = closePullout;


/***/ }),
/* 281 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
var React = __webpack_require__(7);
// Local
__webpack_require__(282);
// Components
var MenuItem_1 = __webpack_require__(107);
// utilities
var css_1 = __webpack_require__(16);
var Pullout = /** @class */ (function (_super) {
    __extends(Pullout, _super);
    function Pullout(props) {
        var _this = _super.call(this, props) || this;
        _this._onClose = _this._onClose.bind(_this);
        return _this;
    }
    Pullout.prototype.render = function () {
        var _a = this.props, title = _a.title, isVisible = _a.isVisible, items = _a.items;
        return (React.createElement("div", { className: css_1.default('pullout', {
                isVisible: isVisible,
            }), onClick: this._onClose },
            React.createElement("div", { className: 'pullout-shade' }),
            React.createElement("div", { className: 'pullout-content highlight' },
                React.createElement("span", { className: 'pullout-title' }, !!title && title),
                !!items && items.map(this._onRenderItem))));
    };
    Pullout.prototype._onClose = function (ev) {
        var onClose = this.props.onClose;
        if (onClose) {
            onClose();
        }
        ev.stopPropagation();
        ev.preventDefault();
    };
    Pullout.prototype._onRenderItem = function (item, index) {
        return (React.createElement(MenuItem_1.default, __assign({}, item, { key: index })));
    };
    return Pullout;
}(React.Component));
exports.default = Pullout;


/***/ }),
/* 282 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(283);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(15)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Pullout.scss", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!../../../node_modules/sass-loader/lib/loader.js!./Pullout.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 283 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(undefined);
// imports


// module
exports.push([module.i, ".light .secondary {\n  background-color: #fcf9f3;\n  color: #93a1a1; }\n  .light .secondary .interactive:hover {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .primary {\n  background-color: #fdf6e3;\n  color: #657b83; }\n  .light .primary .interactive:hover {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n  .light .primary .interactive:active {\n    background-color: #ffffff;\n    color: #eee8d5; }\n\n.light .highlight {\n  background-color: #eee8d5;\n  color: #586e75; }\n  .light .highlight .interactive:hover {\n    background-color: #fdf6e3;\n    color: #657b83; }\n  .light .highlight .interactive:active {\n    background-color: #fcf9f3;\n    color: #93a1a1; }\n\n.secondary {\n  background-color: #00212b;\n  color: #586e75; }\n  .secondary .interactive:hover {\n    background-color: #000000;\n    color: #073642; }\n\n.primary {\n  background-color: #002b36;\n  color: #839496; }\n  .primary .interactive:hover {\n    background-color: #00212b;\n    color: #586e75; }\n  .primary .interactive:active {\n    background-color: #000000;\n    color: #073642; }\n\n.highlight {\n  background-color: #073642;\n  color: #93a1a1; }\n  .highlight .interactive:hover {\n    background-color: #002b36;\n    color: #839496; }\n  .highlight .interactive:active {\n    background-color: #00212b;\n    color: #586e75; }\n\nbody {\n  user-select: none;\n  cursor: default;\n  margin: 0;\n  font-family: \"Droid Sans\"; }\n\n.marquee {\n  animation: marquee 10s linear infinite; }\n\n@keyframes marquee {\n  0% {\n    transform: translate(100%, 0); }\n  100% {\n    transform: translate(-100%, 0); } }\n\n.interactive {\n  cursor: pointer; }\n\n.small .pullout .pullout-content {\n  width: 320px; }\n\n.pullout {\n  position: fixed;\n  height: 100%;\n  top: 0;\n  left: 0; }\n  .pullout .pullout-content {\n    position: fixed;\n    z-index: 10;\n    height: 100%;\n    width: 400px;\n    line-height: 1em;\n    font-size: 32px;\n    align-items: center;\n    padding: 16px;\n    transition: transform 0.3s cubic-bezier(0.16, 0.65, 0.45, 0.84); }\n  .pullout .pullout-content, .pullout .pullout-shade {\n    transform: translate(-100%, 0); }\n  .pullout .pullout-shade {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    z-index: 9;\n    background-color: rgba(0, 0, 0, 0.2);\n    opacity: 0;\n    transition: opacity 0.3s cubic-bezier(0.16, 0.65, 0.45, 0.84), transform 0s 0.3s; }\n  .pullout.isVisible {\n    display: block; }\n    .pullout.isVisible .pullout-content, .pullout.isVisible .pullout-shade {\n      transform: translate(0, 0); }\n    .pullout.isVisible .pullout-shade {\n      opacity: 1.0;\n      transition: opacity 0.3s cubic-bezier(0.16, 0.65, 0.45, 0.84), transform 0s 0s; }\n\n.pullout-content .pullout-title {\n  display: block;\n  text-align: center; }\n\n.pullout-content .menuItem {\n  text-align: left;\n  height: auto;\n  font-size: 24px; }\n", ""]);

// exports


/***/ }),
/* 284 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var FONT_NAMES;
(function (FONT_NAMES) {
    FONT_NAMES["DROID_SANS"] = "Droid+Sans";
    FONT_NAMES["MATERIAL_ICONS"] = "Material+Icons";
})(FONT_NAMES = exports.FONT_NAMES || (exports.FONT_NAMES = {}));
function loadGoogleFont(fontName, className) {
    if (className === void 0) { className = 'css'; }
    var URL_PATH = 'https://fonts.googleapis.com/';
    var head = null;
    try {
        head = document.getElementsByTagName('head')[0];
    }
    catch (e) {
        console.error('Page not loaded');
        return;
    }
    var node = document.createElement('link');
    node.setAttribute('rel', 'stylesheet');
    node.setAttribute('href', URL_PATH + className + '?family=' + fontName);
    if (head.childNodes.length) {
        var firstChild = head.childNodes[0];
        head.insertBefore(node, firstChild);
    }
    else {
        head.appendChild(node);
    }
}
exports.loadGoogleFont = loadGoogleFont;


/***/ })
],[111]);