import '@polymer/polymer/polymer-legacy.js';
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.pathToRegexp = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],"path-to-regexp":[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":1}]},{},[])("path-to-regexp");
});

function regexKeysToArray(regexKeys) {
  var keys = [];
  for (var i=0; i<regexKeys.length; i++) {
    if (regexKeys[i].name) {
      keys.push(regexKeys[i].name);
    }
  }
  return keys;
}
/** ES6 [].find polyfill */
function ArrayFind(array, compareFn) {
  for (var i=0; i<array.length; i++) {
    if (compareFn(array[i]))
      return array[i];
  }
}

/** ES6 "".startsWith polyfill */
function StringStartsWith(str, search) {
  if (str == null) {
    throw TypeError();
  }

  var stringLength = str.length;
  var searchString = String(search);
  var searchLength = searchString.length;
  // `ToInteger`
  var pos = 0;
  var start = Math.min(Math.max(pos, 0), stringLength);
  // Avoid the `indexOf` call if no match is possible
  if (searchLength + start > stringLength) {
    return false;
  }
  var index = -1;
  while (++index < searchLength) {
    if (str.charCodeAt(start + index) != searchString.charCodeAt(index)) {
      return false;
    }
  }
  return true;
}

function randomString(len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var randomString = '';
  for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz,randomPoz+1);
  }
  return randomString;
}

function normalizeString(str) {
  if (str === undefined || str === null)
    str = "";

  return str;
}

/**
RouterState stores RouteManager configuration.
It provides utility routines for state manipulation.
Use the routines, instead of manipulating state directly.
*/
var RouterState = {
  // registered routes (excluding aliased)
  routes: [],

  // registered alias routes
  aliasRoutes: [],

  // alias routes without a parent
  orphanAliasRoutes: [],

  // registered routes alias map --  Map(alias->Route)
  routesByAlias: {},

  // active routes
  activeRoutes: [],

  // current transition
  activeTransition: null,

// Configuration variables

  // anchorRouting
  anchorRouting: true,

  // true if routing should start automatically on WebComponentsReady
  autoStart: true,

  // base path for path routing
  basePath: '',

  // prefix for hash paths
  hashPrefix: '#',

  // Routes starting with aliasPathPrefix will be interpreted as aliases
  aliasPathPrefix: '@',

  // hash|path
  pathStyle: 'hash',

  // Routes starting with token prefix are tokens
  tokenPrefix: 'toke-',

  addRoute: function(route) {
    // register route's alias
    if (route.alias) {
      if (this.routesByAlias[route.alias]) {
        console.error(this.routesByAlias[route.alias]);
        throw new Error("Cant register two routes with same alias. "
          + route.alias + "has already been registered.");
      }
      this.routesByAlias[route.alias] = route;
    }

    this.routes.push(route);

    // process orphan routes
    if (route.alias) {
      var x = this.orphanAliasRoutes
        .filter(function(o) {
          return o.alias === route.alias;
        });
      this.orphanAliasRoutes
        .filter(function(o) {
          return o.alias === route.alias;
        })
        .forEach(function(o) {
          this.orphanAliasRoutes.splice( this.orphanAliasRoutes.indexOf(o), 1);
          o.setParent(route);
        }.bind(this));
    }
  },

  removeRoute: function(route) {
    var idx = this.routes.indexOf(route);

    var activeIdx = this.activeRoutes ? this.activeRoutes.indexOf(route) : -1;
    if (activeIdx != -1) {
      // console.warn('removing currently active route');
      this.activeRoutes.splice(activeIdx, 1);
      RouteManager._setRouteFromLocation();
    }
    var route = this.routes[idx];
    var alias;
    // orphan routes aliased to this one
    while (alias = route.aliasRoutes[0]) {
      alias.setParent(null);
      this.addOrphanRoute(alias);
    }
    // if route was aliased, remove it from the list
    if (route.alias) {
      delete this.routesByAlias[route.alias];
    }
    this.routes.splice(idx, 1);
  },

  addAliasRoute: function(route) {
    var parent = this.routesByAlias[route.alias];
    if (parent) {
      this.aliasRoutes.push(route);
      route.setParent(parent);
    }
    else {
      this.addOrphanRoute(route);
    }
  },

  removeAliasRoute: function(route) {
    var idx = this.aliasRoutes.indexOf(route);
    this.aliasRoutes[idx].setParent(null);
    this.aliasRoutes.splice(idx, 1);
  },

  addOrphanRoute: function(route) {
    this.orphanAliasRoutes.push(route);
  },

  removeOrphanRoute: function(route) {
    var idx = this.orphanAliasRoutes.indexOf(route);
    this.orphanAliasRoutes.splice(idx, 1);
  },

  removeToken: function(token) {
    var compare = Route.compareByToken(token);
    var route = ArrayFind(this.routes, compare);
    if (route) {
      this.removeRoute(route);
      return;
    }
    route = ArrayFind(this.aliasRoutes, compare);
    if (route) {
      this.removeAliasRoute(route);
      return;
    }
    route = ArrayFind( this.orphanAliasRoutes, compare);
    if (route) {
      this.removeOrphanRoute(route);
      return;
    }
    console.warn('Could not remove route with token', token);
  },

  cancelActiveTransition: function() {
    if (!this.activeTransition) {
      return;
    }
    this.activeTransition.abort();
  },

  startTransition: function(transition) {
    this.cancelActiveTransition();
    this.activeTransition = transition;
    transition.start();
  },

  completeTransition: function(transition) {
    if (this.activeTransition === transition)
      this.activeTransition = null;
  },

  setActiveRoutes: function(routes) {
    this.activeRoutes = routes;
  },

}

/**
RouteManagerTest is a collection of functions only used in tests
*/
var RouteManagerTest = {

  reset: function() {
    RouterState.routes = [];
    RouterState.aliasRoutes = [];
    RouterState.orphanAliasRoutes = [];
    RouterState.routesByAlias = {};
    RouterState.activeRoutes = null;
    RouterState.pathStyle = 'hash';
    RouterState.basePath = '';
    RouterState.autoStart = true;
    RouterState.hashPrefix = '#';
    RouterState.aliasPathPrefix = '@';
  },
  routeType: function(token) {
    var compare = Route.compareByToken(token);
    if( ArrayFind(RouterState.routes, compare)) {
      return 'standard';
    }
    else if (ArrayFind(RouterState.orphanAliasRoutes, compare)) {
      return 'orphan';
    }
    else if (ArrayFind(RouterState.aliasRoutes, compare)) {
      return 'alias';
    }
    return null;
  },
  routeFromToken: function(token) {
    var compare = Route.compareByToken(token);
    return ArrayFind(RouterState.routes, compare) ||
      ArrayFind(RouterState.aliasRoutes, compare) ||
      null;
  },

  print: function() {
    console.log("RouteManager");
    RouterState.routes.forEach(function(r) {
      console.log(r.toString());
    });
    if (RouterState.orphanAliasRoutes.length > 0) {
      console.log('orphans');
      RouterState.orphanAliasRoutes.forEach(function(r) {
        console.log(r.toString());
      });
    }
  },
  updateStateCb: null // can be replaced with function(url) {} for testing
}


/**
  RouteManager is a JavaScript routing library.

### Features:
  - Express-style path matching
    '/foo/:bar/:baz', '/foo/*'
  - '/' or '#!' paths
  - route transition callbacks: willDeactivate, willActivate, deactivate, activate
    callbacks are sync|async
    transitions can be aborted, redirected
  - route aliases:
    register('/home/login', { alias: 'login'}); transitionTo('@login');
  - navigation API: transitionTo, replaceWith
  - anchor tag routing, intercepts clicks

### Path spec:

  Paths are Express-style path strings, such as `/user/:id`.
  See [path-to-regex library](https://github.com/pillarjs/path-to-regexp)
  for detailed Express-style path information.

### Configuration:

- `anchorRouting: true`. If true, will trap anchor clicks and attempt to route them.
- `autoStart: true`. If true, will start routing on WebComponentsReady. If your
routes are not ready by then, set to false, and call RouteManager.start() when ready.
- `basePath: ''`. base path for path style routing. Set to your app's root path.
- `hashPrefix: '#'`. Prefix for hash paths. You might also like '#!'
- `aliasPathPrefix: '@'`. Routes starting with aliasPathPrefix will be interpreted as aliases
- `pathStyle: 'hash'`. Are your paths hashes, or real paths? 'hash'|'path'
- `tokenPrefix: 'toke-'`. Routes starting with token prefix are tokens. You can ignore this
setting unless you get conflicts

### Tips:

- To redirect a route
  - Register the route
  - Inside routes's activate handler, abort the transition with 'redirectTo' path
  - see https://github.com/atotic/excess-router/issues/17 for javascript example

- Debugging
  - print all paths with `Excess.RouteManagerTest.print()`

- 'no routes matched' error on startup
  - if you see this error on startup, your routes might be registering too late. Set `autoStart` to false,'
    and start your router manually with `Excess.RouteManager.start()`

  @polymerBehavior Excess.RouteManager
  */
var RouteManager = {

  /**
   * @param {object} options --
   * @param {boolean} options.anchorRouting -- true if anchor clicks should be intercepted
   * @param {string} options.autoStart -- automatically start on WebComponentsReady
   * @param {string} options.pathStyle -- hash/path
   * @param {string} options.basePath -- base path for path routing
   * @param {string} options.hashPrefix -- hash prefix: default '#', set '#!' if you need it
   * @param {string} options.aliasPathPrefix -- paths with this prefix are considered alias. default '@'
   */
  configure: function(options) {
    [
      'anchorRouting',
      'autoStart',
      'basePath',
      'hashPrefix',
      'aliasPathPrefix',
      'pathStyle',
      'tokenPrefix'
    ].forEach( function(p) {
      if (p in options) {
        RouterState[p] = options[p];
      }
    });
    if (!StringStartsWith(RouterState.hashPrefix,'#')) {
      throw new Error('hashPrefix must start with #');
    }
  },

  /**
   * Registers a route. See source for options documentation, since Polymer docs are borked when it comes to options.
   *
   * @param {string} path -- Path string
   * @param {object} options -- see docs in source code until Polymer jsdoc handles docs properly
   * @param {string} options.alias -- route alias
   * @param {boolean} options.isAliasRoute -- true if this is a aliased route
   * @param {boolean} option.activateExclusive -- true if this route can only be activated on its own
   * @param {boolean} option.activateStopPropagation -- true if no routes will match after this one

   These are the transition lifecycle callbacks
   * @param {function(transaction)} options.willDeactivate --
   * @param {function(transaction)} options.deactivate --
   * @param {function(transaction, { routeParams: {} }) , function done} options.willActivate --
   * @param {function(transaction, { routeParams: {} }) , function done} options.activate --

   * @return {string}} -- token, you need this to unregister
   */
  register: function(path, options) {
    options = options || {};
    var route;
    if (options.isAliasRoute || this._getRouteType(path) === 'alias') {
      route = new AliasRoute(path, options);
      RouterState.addAliasRoute(route);
      if (this._started &&
        route.parent && route.parent.match(this._extractLocationPath())) {
        this._setRouteFromLocation();
      }
    }
    else {
      route = new Route(path, options);
      RouterState.addRoute(route);
      try {
        // activate route if matches
        if (this._started && route.match(this._extractLocationPath()))
          this._setRouteFromLocation();
      }
      catch(err) {
        console.warn(err);  // new code, see if something breaks
      }
    }
    return route.token;
  },

  /**
   * the opposite of `register()`
   */
  unregister: function(token) {
    RouterState.removeToken(token);
  },

  _findRouteByToken: function(token) {
    var compare = Route.compareByToken(token);
    var destination = ArrayFind(RouterState.routes, compare);
    if (!destination) {
      destination = ArrayFind(RouterState.aliasRoutes, compare);
      if (!destination) {
        throw new Error('route not found ' +  token);
      }
    }
    return destination;
  },

  _findRouteByAlias: function(alias) {
    var compare = Route.compareByAlias(alias);
    var destination = ArrayFind(RouterState.routes, compare);
    return destination;
  },

  _urlFromRoutePath: function(routePath) {
    if (RouterState.pathStyle === 'hash') {
      return RouterState.hashPrefix + routePath;
    }
    else {
      return RouterState.basePath + routePath;
    }
  },

  _getPushStateCallback: function() {
    return RouteManagerTest.updateStateCb ||
      function(routePath) {
        // console.log("pushState", routePath);
        window.history.pushState(null, "",
          RouteManager._urlFromRoutePath(routePath));
      }
  },

  _getReplaceStateCallback: function() {
    return RouteManagerTest.updateStateCb ||
      function(routePath) {
        window.history.replaceState(null, "",
          RouteManager._urlFromRoutePath(routePath));
      }
  },

  /**
   * @param {string} -- route. Can be token ('toke-AV213'), alias ('@user'), or path ('/this/is/path')
   * @return {'alias'|'token'|'path'} -- kind of path this is
   */
  _getRouteType: function(routeSpecifier) {
    if (routeSpecifier === null) {
      return null;
    }
    else if (RouterState.aliasPathPrefix &&
      StringStartsWith(routeSpecifier, RouterState.aliasPathPrefix)) {
      return 'alias';
    }
    else if (RouterState.tokenPrefix &&
      StringStartsWith(routeSpecifier, RouterState.tokenPrefix)) {
      return 'token';
    }
    else {
      return 'path';
    }
  },

  /**
   *
   * @return {array} -- array of keys for given route
   */
  getRouteKeys: function(routeSpecifier) {
    switch(this._getRouteType(routeSpecifier)) {
      case 'alias':
        var r = this._findRouteByAlias(routeSpecifier);
        if (!r) {
          throw new Error("Route alias not registered");
        }
        return r.keys();
      case 'token':
        var r = this._findRouteByToken(routeSpecifier).resolveAlias();
        if (!r) {
          throw new Error("Route, or route's alias not registered");
        }
      return r.keys();
      case 'path':
        var keys = [];
        pathToRegexp(routeSpecifier, keys, { sensitive: true, strict: true });
        return regexKeysToArray(keys);
    }
  },

  /**
   * Concatenates paths, taking into account route type. You can use it with all route
   * specifiers understood by RouteManager
   */
  concatPaths: function(parentPath, childPath) {
    if (!childPath) {
      return null;
    }
    switch(this._getRouteType(childPath)) {
      case 'alias':
        return childPath;
      case 'token':
        throw new Error('Child path cannot be a path token');
      case 'path':
        return parentPath ? parentPath + childPath : childPath;
    }
  },

  /**
   * Computes url path from routeSpecifier and arguments.
   * @return {string} -- decoded path
   */
  getRoutePath: function(routeSpecifier, params) {
    var path;
    switch(this._getRouteType(routeSpecifier)) {
      case 'alias':
        var r = this._findRouteByAlias(routeSpecifier);
        if (!r) {
          throw new Error("Route alias not registered");
        }
        path = r.resolveAlias().getRoutePath(params);
        break;
      case 'token':
        var r = this._findRouteByToken(routeSpecifier).resolveAlias();
        if (!r) {
          throw new Error("Route, or route's alias not registered");
        }
        path = r.getRoutePath(params);
        break;
      case 'path':
        path = pathToRegexp.compile(routeSpecifier)(params);
        break;
      default:
        throw new Error('unknown path type');
    }
    return RouterState.basePath ? RouterState.basePath + path : path;
  },

  /**
   * decodeUri routeParams in place
   */
  _decodeRouteParams: function(params) {
    for (var p in params)
      params[p] = params[p] === undefined ? undefined : decodeURIComponent(params[p]);
    return params;
  },

  /**
   * finds matching route given a path
   * @return {{route: route, routeParams: params}}
   */
  _matchRoutes: function(path) {
    var routes = [];
    for (var i=0; i<RouterState.routes.length; i++) {
      var route = RouterState.routes[i];
      var routeParams = route.match(path);
      if (routeParams) {
        routes.push(  { route: route, routeParams: this._decodeRouteParams(routeParams) } );
        if (route.activateStopPropagation) {
          break;   // stop searching for routes only this route
        }
      }
    }
    // eliminate activateExclusives if more than one
    if (routes.length > 1) {
      for (var i=0; i<routes.length; i++) {
        if (routes[i].route.activateExclusive)
          routes.splice(i--, 1);
      }
    }
    if (routes.length > 0) {
      return {
        routes: routes,
        destinationPath: path // RouterState.routes[i].getRoutePath(routeParams)
      }
    }

    return null;
  },

  _findDestinations: function(destination, routeParams) {
    var path;

    switch( this._getRouteType(destination)) {
      case 'alias':
        var route = this._findRouteByAlias(destination);
        if (route) {
          path = route.getRoutePath(routeParams)
        }
        break;
      case 'token':
        var route = this._findRouteByToken(destination).resolveAlias();
        if (route) {
          path = route.getRoutePath(routeParams);
        }
        break;
      case 'path':
        path = destination;
        break;
    }
    return this._matchRoutes(path);
  },

  /**
   * Transition to new route,
   * @param {token|alias|path} -- destination can be token,alias,or path
   */
  transitionTo: function(destination, routeParams) {
    var dest = this._findDestinations(destination, routeParams);
    if (!dest) {
      throw new Error("Transition destination not found");
    }
    var transition = new Transition(
      RouterState.activeRoutes,
      dest.routes,
      {
        destinationPath: dest.destinationPath,
        updateLocationCb: this._getPushStateCallback()
      }
    );
    RouterState.startTransition(transition);
  },

  /**
   * Transition to new route, but replace existing URL in place (no history)
   */
  replaceWith: function(destination, routeParams) {
    var dest = this._findDestinations(destination, routeParams);
    if (!dest) {
      throw new Error("Transition destination not found");
    }
    var transition = new Transition(
      RouterState.activeRoutes,
      dest.routes,
      {
        destinationPath: dest.destinationPath,
        updateLocationCb: this._getReplaceStateCallback()
      }
    );
    RouterState.startTransition(transition);
  },

  _setRouteFromLocation: function() {
    var path = this._extractLocationPath();
    // console.log('_setRouteFromLocation', path);
    if (!path) {
      console.warn('popstate could not extract path',
        window.location.pathname);
      return;
    }
    var dest = this._matchRoutes(path);
    if (dest) {
      var transition = new Transition(
        RouterState.activeRoutes,
        dest.routes,
        {
          destinationPath: dest.destinationPath
        }
      );
      RouterState.startTransition(transition);
    }
    else {
      console.warn('no matching routes found in popstate');
    }
  },

  _routeAnchor: function(anchor) {
    do {
  		if (anchor.nodeName === 'A') break;
    } while (anchor.parentNode && (anchor = anchor.parentNode));

    if (anchor.target === '_blank')
      return false;

    if (anchor.nodeName !== 'A')
  		  return false;

    if (anchor.protocol === 'javascript:')
      return false;

    if (anchor.protocol !== location.protocol ||
        // location.username and password are undefined when not set,
        // whereas the anchor's properties are empty strings
        normalizeString(anchor.username) !== normalizeString(location.username) ||
        normalizeString(anchor.password) !== normalizeString(location.password) ||
        anchor.host !== location.host)
      return false;

    var route;
    switch(RouterState.pathStyle) {
      case 'hash':
        route = anchor.hash;
        if (StringStartsWith(route, RouterState.hashPrefix)) {
          route = route.replace(RouterState.hashPrefix, '');
        } else {
          return false;
        }
        break;
      case 'path':
        route = anchor.pathname;
        if (StringStartsWith(route,RouterState.basePath)) {
          route = route.replace(RouterState.basePath, '');
        } else {
          return false;
        }
        break;
    }
    if (route) {
      try {
        this.transitionTo(route);
        return true;
      }
      catch(err) {
        // An unknown route, something else is handling it
        return false;
      }
    }
    return false;
  },

  _startAnchorRouting: function() {
    if (!RouterState.anchorRouting) {
      if (this._anchorRoutingListener) {
        document.removeEventListener(this._anchorRoutingListener);
        delete this._anchorRoutingListener;
      }
    }
    else {
      if (!this._anchorRoutingListener) {
        this._anchorRoutingListener = document.addEventListener('click', function(ev) {
          // only trap plain clicks, no  modifiers, right-buttons
          if (ev.button !== 0 || ev.metaKey || ev.ctrlKey) {
            return null;
          }
          if (this._routeAnchor(ev.target)) {
            ev.preventDefault();
          }
        }.bind(this));
      }
    }
  },

  /**
   * Starts routing. Gets called automatically on WebComponentsReady unless autoStart is false,
   * Then you have to call it manually when your routes are ready.
   */
  start: function() {
    if (this._started) {
      console.warn('RouteManager.start called more than once');
      return;
    }
    this._started = true;
    this._setRouteFromLocation();
    this._startAnchorRouting();
  },

  /**
   * gets canonical path from window.location
   */
  _extractLocationPath: function() {
    var path;

    if (RouterState.pathStyle === 'path') {
      // Parse path-style path
      if (!window.location.pathname) {
        path = '/';
      }
      else if (RouterState.basePath) {
        var match = window.location.pathname.match(RouterState.basePath + "(.*)");
        if (!match) {
          console.error("Base path does not match window.location");
        }
        else
          path = match[1];
      }
      else { // no basePath
        path = window.location.pathname;
      }
    }
    else { // _pathStyle === 'hash'
      // Parse hash-style path
      if (!window.location.hash) {
        path = '/';
      } else {
        path = window.location.hash.replace(RouterState.hashPrefix, '');
        if (path[0] != '/') // ordinary hash?
          path = undefined;
      }
    }
    return path;
  },

  _handlePopState: function(ev) {
    // console.log('popstate', ev.timeStamp);
    this.popstatePath = this._extractLocationPath();  // IE Edge guard, see hashchange in IE
    this.popstateTimeStamp = ev.timeStamp;
    this._setRouteFromLocation();
  },

  _handleHashChange: function(ev) {
    // console.log("hashchange", ev.timeStamp);
    if (RouterState.pathStyle !== 'hash') {
      return;
    }
    var path = this._extractLocationPath();
    if (!path) {
      console.warn('hashchange could not extract path',
        window.location.hash);
    }
    else {
      // IE workaround: https://connect.microsoft.com/IE/Feedback/Details/1528993
      // On hash change, everyone fires 'popstate' and 'hashchange' except IE, and we transition in popstate
      // IE only fires 'hashchange', so we need to transition here
      // Here we guard from executing same transition twice on other browsers
      if (path != this.popstatePath && (ev.timeStamp - ( this.popstateTimeStamp || 0) > 1)) {
        this._setRouteFromLocation();
      }
    }
  },

  _decodeAliasPath: function(path) {
    if (StringStartsWith(path, RouterState.aliasPathPrefix)) {
      return path.replace(RouterState.aliasPathPrefix, '');
    }
    else {
      console.warn('alias path without prefix', path);
      return path;
    }
  }
}

window.addEventListener('WebComponentsReady', function() {
  if (RouterState.autoStart) {
    RouteManager.start();
  }
}.bind(RouteManager));

window.addEventListener('popstate',
  RouteManager._handlePopState.bind(RouteManager));

window.addEventListener('hashchange',
  RouteManager._handleHashChange.bind(RouteManager));

/**
 * Route represents a single route
 */
var Route = function(path, options) {
  this.token = RouterState.tokenPrefix + randomString(6);
  this.path = path;
  this.regexKeys = []; // keys from pathToRegexp
  this.regexp = pathToRegexp(this.path, this.regexKeys,
    { sensitive: true, strict: true });
  this.pathGenerator = pathToRegexp.compile(this.path);
  this.aliasRoutes = [];  // routes that are aliased to this one

  this.alias = options ? options.alias : undefined;
  this.activateExclusive = options ? options.activateExclusive : false;
  this.activateStopPropagation = options ? options.activateStopPropagation : false;
  this.willDeactivate = options ? options.willDeactivate : undefined;
  this.deactivate = options ? options.deactivate : undefined;
  this.willActivate = options ? options.willActivate : undefined;
  this.activate = options ? options.activate : undefined;
}

/**
 * token comparasance routine for [].find
 */
Route.compareByToken = function(token) {
  return function(r) {
    return r.token === token;
  }
}

Route.compareByAlias = function(alias) {
  if (!StringStartsWith(alias, RouterState.aliasPathPrefix)) {
    throw new Error("compareByAlias called without alias");
  }
  alias = alias.replace(RouterState.aliasPathPrefix, '');
  return function(r) {
    return r.alias === alias;
  }
}

Route.prototype = {

  /**
   *  @return {array|null} -- routeParams if route matches path
   */
  match: function(path) {
    var m = this.regexp.exec(path);
    if (m) {
      return this._matchToRouteParams(m);
    }
    else {
      return null;
    }
  },

  /**
   * converts regex match to routeParams map
   */
  _matchToRouteParams: function(match) {
    var routeParams = {};
    for (var i=1; i<match.length; i++) {
      if (this.regexKeys[i-1].name) {
        routeParams[this.regexKeys[i-1].name] = match[i];
      }
      else {
        routeParams[i-1] = match[i];  // anonymous parameters
      }
    }
    return routeParams;
  },

  toString: function() {
    var s = this.path;
    if (this.alias) {
      s += ' ' + this.alias;
    }
    if (this.aliasRoutes.length > 0) {
      s += '\n';
      this.aliasRoutes.forEach(function(r) {
        s += '\t' + r.toString() + '\n';
      });
    }
    return s;
  },

  addAliasRoute: function(route) {
    if (route.alias != this.alias) {
      throw new Error("mismatched alias route ", + route.alias + " " + this.alias);
    }
    this.aliasRoutes.push(route);
  },

  removeAliasRoute: function(route) {
    var idx = this.aliasRoutes.indexOf(route);
    if (idx === -1) {
      console.warn("removeAliasRoute: nonexistent route", route);
    }
    else {
      this.aliasRoutes.splice(idx, 1);
    }
  },

  getRoutePath: function(routeParams) {
    return this.pathGenerator(routeParams);
  },

  resolveAlias: function() {
    return this;
  },

  /**
   * @return {array} -- names of all route parameters. Ex: "/:foo/:bar" => ['foo', 'bar']
   */
  keys: function() {
    return regexKeysToArray(this.regexKeys);
  }
}

var AliasRoute = function(path, options) {
  this.token = RouterState.tokenPrefix + randomString(6);
  this.alias = RouteManager._decodeAliasPath(path);

  this.willDeactivate = options ? options.willDeactivate : undefined;
  this.deactivate = options ? options.deactivate : undefined;
  this.willActivate = options ? options.willActivate : undefined;
  this.activate = options ? options.activate : undefined;

  return this.token;
}

AliasRoute.prototype = {

  setParent: function(parent) {
    if (this.parent) {
      this.parent.removeAliasRoute(this);
    }
    this.parent = parent;
    if (this.parent) {
      this.parent.addAliasRoute(this);
    }
  },

  toString: function() {
    return this.alias;
  },

  resolveAlias: function() {
    if (!this.parent) {
      throw new Error('alias cant be resolved');
    }
    return this.parent;
  }

}

/**
 * Transition oversees transition lifecycle:
 * The lifecycle is:
 * source.willDeactivate
 * source.deactivate
 * destination.willActivate
 * destination.activate
 *
 * willDeactivate/willActivate
 *
 */
/**
 * @callback Transition~callback
 * @param {Transition} transition -- Transition
 * @param {function} done -- optional async callback, if omitted call is sync
 *
 * Call transaction.abort to abort transition in the callback
 *
 * Recognized errors:
 * RedirectError: -- redirect to another route
 * DoThisFirstError --
 */

/**
 * @param {Route} sources -- [ { route: Route, routeParams: Map }*] sources routes
 * @param {Route} destinations -- [ { route: Route, routeParams: Map } * ] destination routes
 * @param {object} options
 * @param {function} options.updateLocationCb -- function(destinationPath), called when transition is complete
 * @param {string} options.destinationPath -- path transitioning to
 * @param {function} updateLocationCb --
 */
var Transition = function(sources, destinations, options) {
  this.sources = sources;
  if (!destinations) {
    throw new Error('Transition without destination');
  }
  this.destinations = destinations;

  this._updateLocationCb = options ? options.updateLocationCb : null;
  this._destinationPath = options ? options.destinationPath : null;

  // console.log("Transition", this._destinationPath);
}

Transition.prototype = {

  /**
   * @param {object} abortOptions
   * @param {string} abortOptions.redirectTo -- abort existing transaction and redirectTo
   */
  abort: function(abortOptions) {
    if (this.aborted) // only first abort counts
      return;
    // console.log('abort', this._destinationPath);

    this.aborted = true;
    if (abortOptions) {
      if (abortOptions.redirectTo) {
        RouteManager.replaceWith(abortOptions.redirectTo, abortOptions.redirectParams);
      } else if (abortOptions.prerequisite) {
        TODO("handle prerequisite");
      }
    }
    this._complete();
  },

  start: function() {
    // if (!this._destinationPath)
    //   debugger;
    // console.log('transition.start', this._destinationPath);
    this._willDeactivate();
  },

  /**
   * get callbacks from route, and all its aliasRoutes
   * @return {array[callbacks]}
   */
  _gatherCallbacks: function(route, callbackName) {
    var callbacks = [];
    if (route === null) {
      return callbacks;
    }
    if (route[callbackName]) {
      callbacks.push(route[callbackName]);
    }
    for (var i=0; i<route.aliasRoutes.length; i++) {
      if (route.aliasRoutes[i][callbackName]) {
        callbacks.push(route.aliasRoutes[i][callbackName]);
      }
    }
    return callbacks;
  },

  /**
   * @typedef { { routeParams: Map, callbacks: Array[function]} -- callbackRecord
   * @typedef callbackList [ callbackRecord ]
   * @return {callbackList} -- list of all callbacks with routeParams for all routes
   */
  _gatherCallbacksFromArray: function(routes, callbackName) {
    var callbacks = [];
    for (var i=0; i<routes.length; i++) {
      var routeCallbacks = {
        routeParams: routes[i].routeParams,
        callbacks: this._gatherCallbacks(routes[i].route, callbackName)
      }
      callbacks.push(routeCallbacks);
    }
    return callbacks;
  },

  /**
   * async. Processes all callbacks, call done on completion
   *
   * @param {callbackList} -- callbacks
   * @param {function({route, routeParams})} -- callbackArgMaker
   * @param {function} done -- completion callback
   */
  _processCallbacks: function(callbackList, callbackArgMaker, done) {
    // count the callbacks
    var remaining = 0;
    for (var i=0; i<callbackList.length; i++) {
      remaining += callbackList[i].callbacks.length;
    }
    if (remaining === 0) {
      done();
      return;
    }

    function decrementRemaining() {
      // calls done when all callbacks complete
      if (--remaining === 0) {
        done();
      }
    }

    for (var i=0; i<callbackList.length; i++) {
      // prepare the callback arguments
      var cbArgs = callbackArgMaker ? callbackArgMaker(callbackList[i]) : [];
      var syncArgs = [this].concat(cbArgs);
      var asyncArgs = [this].concat(cbArgs).concat([decrementRemaining]);

      var callbacks = callbackList[i].callbacks;

      // call all callbacks, sync or async
      for (var j=0; j<callbacks.length; j++) {
        if (callbacks[j].length <= syncArgs.length) {
          // sync callback
          try {
            callbacks[j].apply(window, syncArgs);
          }
          catch(err) {
            console.error('unexpected error in a callback', err);
          }
          decrementRemaining();
        }
        else {
          // async callback
          try {
            callbacks[j].apply(window, asyncArgs);
          }
          catch(err) {
            console.error('unexpected error in callback', err);
            decrementRemaining();
          }
        }
      }
    }
  },

  _willDeactivate: function() {

    if (this.sources) {
      // willDeactivate for source + aliasRoutes
      var callbacks = this._gatherCallbacksFromArray(this.sources, 'willDeactivate');

      this._processCallbacks(
        callbacks,
        null,
        this._willDeactivateDone.bind(this)
      );
    }
    else {
      this._willDeactivateDone();
    }
  },

  _willDeactivateDone: function() {
    if (this.aborted) {
      return;
    }
    this._willActivate();
  },

  _willActivate: function() {
    if (this.aborted) {
      return;
    }
    this._processCallbacks(
      this._gatherCallbacksFromArray(this.destinations, 'willActivate'),
      this._getActivateCbArgs,
      this._willActivateDone.bind(this));
  },

  _willActivateDone: function() {
    if (this.aborted) {
      return;
    }
    this._deactivate();
  },

  _deactivate: function() {
    if (this.aborted) {
      return;
    }
    if (this.sources) {
      this._processCallbacks(
        this._gatherCallbacksFromArray(this.sources,  'deactivate'),
        null,
        this._deactivateDone.bind(this)
      );
    }
    else
      this._deactivateDone();
  },

  _deactivateDone: function() {
    if (this.aborted) {
      console.error("Invalid excess-route transition: transition was aborted in the middle of deactivation. Do this in will-deactivate event handler instead");
      throw new Error("Transition on deactivate is not allowed");
      return;
    }
    RouterState.setActiveRoutes(null);
    this._activate();
  },


  _getActivateCbArgs: function(callbackRecord) {
    // WARNING: not bound to 'this'
    return [
      {routeParams: callbackRecord.routeParams}
    ];
  },

  _activate: function() {
    if (this.aborted) {
      return;
    }
    this._processCallbacks(
      this._gatherCallbacksFromArray(this.destinations, 'activate'),
      this._getActivateCbArgs,
      this._activateDone.bind(this));
  },

  _activateDone: function() {
    if (this.aborted) {
      console.error("Invalid excess-route transition: transition was aborted in the middle of activation. Do this in will-activate event handler instead");
      throw new Error("Transition on activate is not allowed");
      return;
    }
    // console.log('transition._activateDone', this._destinationPath);
    if (this._updateLocationCb && this._destinationPath) {
      //         this._destinationPath
      // if (this.destinations[0].route.getRoutePath(this.destinations[0].routeParams) != this._destinationPath)
      //   console.warn('how can these paths be different?');
      // this happens when you have optional matches
      this._updateLocationCb(this._destinationPath);
    }
    RouterState.setActiveRoutes(this.destinations);
    this.aborted = true;  // ensure no other callbacks will run
  },

  _complete: function() {
    RouterState.completeTransition(this);
  }

}


if (!window.Excess)
  window.Excess = {};

window.Excess.RouteManager = RouteManager;
window.Excess.RouteManagerTest = RouteManagerTest;
