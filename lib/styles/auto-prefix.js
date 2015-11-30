'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var InlineStylePrefixer = require('inline-style-prefixer');

var prefixers = {};

exports.default = {
  getPrefixer: function getPrefixer() {
    // Server-side renderer needs to supply user agent
    if (typeof navigator === 'undefined') {
      console.warn('Material-UI expects the global navigator.userAgent to be defined for server-side rendering. Set this property when receiving the request headers.');
      return null;
    }

    var userAgent = navigator.userAgent;

    // Get prefixing instance for this user agent
    var prefixer = prefixers[userAgent];
    // None found, create a new instance
    if (!prefixer) {
      prefixer = new InlineStylePrefixer(userAgent);
      prefixers[userAgent] = prefixer;
    }

    return prefixer;
  },
  all: function all(style) {
    if (!style) {
      return {};
    }

    var prefixer = this.getPrefixer();

    if (prefixer) {
      return prefixer.prefix(style);
    } else {
      return InlineStylePrefixer.prefixAll(style);
    }
  },
  set: function set(style, key, value) {
    style[key] = value;

    var prefixer = this.getPrefixer();

    if (prefixer) {
      style = prefixer.prefix(style);
    } else {
      style = InlineStylePrefixer.prefixAll(style);
    }
  },
  getPrefix: function getPrefix(key) {
    var style = {};
    style[key] = true;

    var prefixer = this.getPrefixer();
    var prefixes = undefined;

    if (prefixer) {
      prefixes = Object.keys(prefixer.prefix(style));
    } else {
      prefixes = Object.keys(InlineStylePrefixer.prefixAll(style));
    }

    return prefixes ? prefixes[0] : key;
  }
};