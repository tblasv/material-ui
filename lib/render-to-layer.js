'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Events = require('./utils/events');
var Dom = require('./utils/dom');
var debounce = require('lodash.debounce');

// heavily inspired by https://github.com/Khan/react-components/blob/master/js/layered-component-mixin.jsx
var RenderToLayer = React.createClass({
  componentDidMount: function componentDidMount() {
    this._renderLayer();
  },
  componentDidUpdate: function componentDidUpdate() {
    this._renderLayer();
  },
  componentWillUnmount: function componentWillUnmount() {
    this._unbindClickAway();
    if (this._layer) {
      this._unrenderLayer();
    }
  },
  _checkClickAway: function _checkClickAway(e) {
    if (!this.canClickAway) {
      return;
    }
    var el = this._layer;
    if (e.target !== el && e.target === window || document.documentElement.contains(e.target) && !Dom.isDescendant(el, e.target)) {
      if (this.props.componentClickAway) {
        this.props.componentClickAway(e);
      }
    }
  },
  _preventClickAway: function _preventClickAway(e) {
    if (e.detail === this) {
      return;
    }
    this.canClickAway = false;
  },
  _allowClickAway: function _allowClickAway() {
    this.canClickAway = true;
  },
  getLayer: function getLayer() {
    return this._layer;
  },
  render: function render() {
    return null;
  },
  _renderLayer: function _renderLayer() {
    if (this.props.open) {
      if (!this._layer) {
        this._layer = document.createElement('div');
        document.body.appendChild(this._layer);
      }
      this._bindClickAway();
      if (this.reactUnmount) {
        this.reactUnmount.cancel();
      }
    } else if (this._layer) {
      this._unbindClickAway();
      this._unrenderLayer();
    } else {
      return;
    }

    // By calling this method in componentDidMount() and
    // componentDidUpdate(), you're effectively creating a "wormhole" that
    // funnels React's hierarchical updates through to a DOM node on an
    // entirely different part of the page.

    var layerElement = this.props.render();
    // Renders can return null, but React.render() doesn't like being asked
    // to render null. If we get null back from renderLayer(), just render
    // a noscript element, like React does when an element's render returns
    // null.
    if (layerElement === null) {
      this.layerElement = ReactDOM.unstable_renderSubtreeIntoContainer(this, React.createElement('noscript', null), this._layer);
    } else {
      this.layerElement = ReactDOM.unstable_renderSubtreeIntoContainer(this, layerElement, this._layer);
    }
  },

  _unrenderLayer: function _unrenderLayer() {
    var _this = this;

    if (!this.reactUnmount) this.reactUnmount = debounce(function () {
      if (_this._layer) {
        if (_this.layerWillUnmount) {
          _this.layerWillUnmount(_this._layer);
        }
        ReactDOM.unmountComponentAtNode(_this._layer);
        document.body.removeChild(_this._layer);
        _this._layer = null;
      }
    }, 1000);
    this.reactUnmount();
  },

  _bindClickAway: function _bindClickAway() {
    if (typeof this.canClickAway === 'undefined') {
      this.canClickAway = true;
    }
    Events.on(window, 'focus', this._checkClickAway);
    Events.on(document, 'mousedown', this._checkClickAway);
    Events.on(document, 'touchend', this._checkClickAway);
  },
  _unbindClickAway: function _unbindClickAway() {
    Events.off(window, 'focus', this._checkClickAway);
    Events.off(document, 'mousedown', this._checkClickAway);
    Events.off(document, 'touchend', this._checkClickAway);
  }
});

module.exports = RenderToLayer;