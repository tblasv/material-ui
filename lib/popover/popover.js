'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = require('react');
var ReactDOM = require('react-dom');
var WindowListenable = require('../mixins/window-listenable');
var RenderToLayer = require('../render-to-layer');
var StylePropable = require('../mixins/style-propable');
var CssEvent = require('../utils/css-event');
var PropTypes = require('../utils/prop-types');
var Transitions = require('../styles/transitions');
var Paper = require('../paper');
var throttle = require('lodash.throttle');
var AutoPrefix = require('../styles/auto-prefix');
var ContextPure = require('../mixins/context-pure');

var Popover = React.createClass({
  mixins: [ContextPure, StylePropable, WindowListenable],

  propTypes: {
    anchorEl: React.PropTypes.object,
    anchorOrigin: PropTypes.origin,
    animated: React.PropTypes.bool,
    autoCloseWhenOffScreen: React.PropTypes.bool,
    canAutoPosition: React.PropTypes.bool,
    children: React.PropTypes.object,
    className: React.PropTypes.string,
    open: React.PropTypes.bool,
    onRequestClose: React.PropTypes.func,
    style: React.PropTypes.object,
    targetOrigin: PropTypes.origin,
    zDepth: PropTypes.zDepth
  },

  getDefaultProps: function getDefaultProps() {
    return {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'left'
      },
      animated: true,
      autoCloseWhenOffScreen: true,
      canAutoPosition: true,
      onRequestClose: function onRequestClose() {},
      open: false,
      style: {},
      targetOrigin: {
        vertical: 'top',
        horizontal: 'left'
      },
      zDepth: 1
    };
  },
  getInitialState: function getInitialState() {
    this.setPlacementThrottled = throttle(this.setPlacement, 100);
    return {
      open: false
    };
  },

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  windowListeners: {
    resize: 'setPlacementThrottled',
    scroll: 'setPlacementThrottled'
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (nextProps.open !== this.state.open) {
      if (nextProps.open) this._showInternal(nextProps.anchorEl);else this._hideInternal();
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    this.setPlacement();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.state.open) {
      this.props.onRequestClose();
    }
  },
  render: function render() {
    return React.createElement(RenderToLayer, _extends({
      ref: 'layer'
    }, this.props, {
      componentClickAway: this.componentClickAway,
      render: this.renderLayer }));
  },
  renderLayer: function renderLayer() {
    var _props = this.props;
    var animated = _props.animated;
    var targetOrigin = _props.targetOrigin;
    var className = _props.className;
    var zDepth = _props.zDepth;

    var anchorEl = this.props.anchorEl || this.anchorEl;
    var anchor = this.getAnchorPosition(anchorEl);
    var horizontal = targetOrigin.horizontal.replace('middle', 'vertical');

    var wrapperStyle = {
      position: 'fixed',
      top: anchor.top,
      left: anchor.left,
      zIndex: 20,
      opacity: 1,
      overflow: 'auto',
      maxHeight: '100%',
      transform: 'scale(0,0)',
      transformOrigin: horizontal + ' ' + targetOrigin.vertical,
      transition: animated ? Transitions.easeOut('500ms', ['transform', 'opacity']) : null
    };
    wrapperStyle = this.mergeAndPrefix(wrapperStyle, this.props.style);

    var horizontalAnimation = {
      maxHeight: '100%',
      overflowY: 'auto',
      transform: 'scaleX(0)',
      opacity: 1,
      transition: animated ? Transitions.easeOut('250ms', ['transform', 'opacity']) : null,
      transformOrigin: horizontal + ' ' + targetOrigin.vertical
    };

    var verticalAnimation = {
      opacity: 1,
      transform: 'scaleY(0)',
      transformOrigin: horizontal + ' ' + targetOrigin.vertical,
      transition: animated ? Transitions.easeOut('500ms', ['transform', 'opacity']) : null
    };

    return React.createElement(
      Paper,
      { style: wrapperStyle, zDepth: zDepth, className: className },
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: horizontalAnimation },
          React.createElement(
            'div',
            { style: verticalAnimation },
            this.props.children
          )
        )
      )
    );
  },
  requestClose: function requestClose() {
    if (this.props.onRequestClose) this.props.onRequestClose();
  },
  componentClickAway: function componentClickAway(e) {
    if (e.defaultPrevented) {
      return;
    }
    this._hideInternal();
  },
  _resizeAutoPosition: function _resizeAutoPosition() {
    this.setPlacement();
  },
  _showInternal: function _showInternal(anchorEl) {
    this.anchorEl = anchorEl || this.props.anchorEl;
    this.setState({ open: true });
  },
  _hideInternal: function _hideInternal() {
    var _this = this;

    if (!this.state.open) {
      return;
    }
    this.setState({
      open: false
    }, function () {
      _this._animateClose();
    });
  },
  _animateClose: function _animateClose() {
    if (!this.refs.layer || !this.refs.layer.getLayer()) {
      return;
    }
    var el = this.refs.layer.getLayer().children[0];
    this._animate(el, false);
  },
  _animateOpen: function _animateOpen(el) {
    this._animate(el, true);
  },
  _animate: function _animate(el) {
    var _this2 = this;

    var value = '0';
    var inner = el.children[0];
    var innerInner = inner.children[0];
    var innerInnerInner = innerInner.children[0];
    var rootStyle = inner.style;
    var innerStyle = innerInner.style;

    if (this.state.open) {
      value = '1';
    } else {
      CssEvent.onTransitionEnd(inner, function () {
        if (!_this2.state.open) _this2.requestClose();
      });
    }

    AutoPrefix.set(el.style, 'transform', 'scale(' + value + ',' + value + ')');
    AutoPrefix.set(innerInner.style, 'transform', 'scaleX(' + value + ')');
    AutoPrefix.set(innerInnerInner.style, 'transform', 'scaleY(' + value + ')');
    AutoPrefix.set(rootStyle, 'opacity', value);
    AutoPrefix.set(innerStyle, 'opacity', value);
    AutoPrefix.set(innerInnerInner, 'opacity', value);
    AutoPrefix.set(el.style, 'opacity', value);
  },
  getAnchorPosition: function getAnchorPosition(el) {
    if (!el) el = ReactDOM.findDOMNode(this);

    var rect = el.getBoundingClientRect();
    var a = {
      top: rect.top,
      left: rect.left,
      width: el.offsetWidth,
      height: el.offsetHeight
    };

    a.right = a.left + a.width;
    a.bottom = a.top + a.height;
    a.middle = a.left + a.width / 2;
    a.center = a.top + a.height / 2;
    return a;
  },
  getTargetPosition: function getTargetPosition(targetEl) {
    return {
      top: 0,
      center: targetEl.offsetHeight / 2,
      bottom: targetEl.offsetHeight,
      left: 0,
      middle: targetEl.offsetWidth / 2,
      right: targetEl.offsetWidth
    };
  },
  setPlacement: function setPlacement() {
    if (!this.state.open) return;

    var anchorEl = this.props.anchorEl || this.anchorEl;

    if (!this.refs.layer.getLayer()) return;

    var targetEl = this.refs.layer.getLayer().children[0];
    if (!targetEl) {
      return {};
    }

    var _props2 = this.props;
    var targetOrigin = _props2.targetOrigin;
    var anchorOrigin = _props2.anchorOrigin;

    var anchor = this.getAnchorPosition(anchorEl);
    var target = this.getTargetPosition(targetEl);

    var targetPosition = {
      top: anchor[anchorOrigin.vertical] - target[targetOrigin.vertical],
      left: anchor[anchorOrigin.horizontal] - target[targetOrigin.horizontal]
    };

    if (this.props.autoCloseWhenOffScreen) this.autoCloseWhenOffScreen(anchor);

    if (this.props.canAutoPosition) {
      target = this.getTargetPosition(targetEl); // update as height may have changed
      targetPosition = this.applyAutoPositionIfNeeded(anchor, target, targetOrigin, anchorOrigin, targetPosition);
    }

    targetEl.style.top = targetPosition.top + 'px';
    targetEl.style.left = targetPosition.left + 'px';
    this._animateOpen(targetEl);
  },
  autoCloseWhenOffScreen: function autoCloseWhenOffScreen(anchorPosition) {
    if (!this.props.autoCloseWhenOffScreen) return;
    if (anchorPosition.top < 0 || anchorPosition.top > window.innerHeight || anchorPosition.left < 0 || anchorPosition.left > window.innerWith) this._hideInternal();
  },
  applyAutoPositionIfNeeded: function applyAutoPositionIfNeeded(anchor, target, targetOrigin, anchorOrigin, targetPosition) {
    if (targetPosition.top + target.bottom > window.innerHeight) {
      var positions = ['top', 'center', 'bottom'].filter(function (position) {
        return position !== targetOrigin.vertical;
      });

      var newTop = anchor[anchorOrigin.vertical] - target[positions[0]];
      if (newTop + target.bottom <= window.innerHeight) targetPosition.top = Math.max(0, newTop);else {
        newTop = anchor[anchorOrigin.vertical] - target[positions[1]];
        if (newTop + target.bottom <= window.innerHeight) targetPosition.top = Math.max(0, newTop);
      }
    }
    if (targetPosition.left + target.right > window.innerWidth) {
      var positions = ['left', 'middle', 'right'].filter(function (position) {
        return position !== targetOrigin.horizontal;
      });

      var newLeft = anchor[anchorOrigin.horizontal] - target[positions[0]];
      if (newLeft + target.right <= window.innerWidth) targetPosition.left = Math.max(0, newLeft);else {
        newLeft = anchor[anchorOrigin.horizontal] - target[positions[1]];
        if (newLeft + target.right <= window.innerWidth) targetPosition.left = Math.max(0, newLeft);
      }
    }
    return targetPosition;
  }
});

module.exports = Popover;