'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var ReactDOM = require('react-dom');
var StylePropable = require('../mixins/style-propable');
var Events = require('../utils/events');
var PropTypes = require('../utils/prop-types');
var Menu = require('../menus/menu');
var DefaultRawTheme = require('../styles/raw-themes/light-raw-theme');
var ThemeManager = require('../styles/theme-manager');
var Popover = require('../popover/popover');

var IconMenu = React.createClass({

  mixins: [StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    anchorOrigin: PropTypes.origin,
    closeOnItemTouchTap: React.PropTypes.bool,
    iconButtonElement: React.PropTypes.element.isRequired,
    iconStyle: React.PropTypes.object,
    menuStyle: React.PropTypes.object,
    onItemTouchTap: React.PropTypes.func,
    onKeyboardFocus: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onMouseUp: React.PropTypes.func,
    onTouchTap: React.PropTypes.func,
    style: React.PropTypes.object,
    targetOrigin: PropTypes.origin,
    touchTapCloseDelay: React.PropTypes.number
  },

  getDefaultProps: function getDefaultProps() {
    return {
      closeOnItemTouchTap: true,
      onItemTouchTap: function onItemTouchTap() {},
      onKeyboardFocus: function onKeyboardFocus() {},
      onMouseDown: function onMouseDown() {},
      onMouseLeave: function onMouseLeave() {},
      onMouseEnter: function onMouseEnter() {},
      onMouseUp: function onMouseUp() {},
      onTouchTap: function onTouchTap() {},
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'left'
      },
      targetOrigin: {
        vertical: 'top',
        horizontal: 'left'
      },
      touchTapCloseDelay: 200
    };
  },

  //for passing default theme context to children
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function getChildContext() {
    return {
      muiTheme: this.state.muiTheme
    };
  },
  getInitialState: function getInitialState() {
    return {
      muiTheme: this.context.muiTheme ? this.context.muiTheme : ThemeManager.getMuiTheme(DefaultRawTheme),
      iconButtonRef: this.props.iconButtonElement.props.ref || 'iconButton',
      menuInitiallyKeyboardFocused: false,
      open: false
    };
  },

  //to update theme inside state whenever a new theme is passed down
  //from the parent / owner using context
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({ muiTheme: newMuiTheme });
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this._timeout) clearTimeout(this._timeout);
  },
  render: function render() {
    var _this = this;

    var _props = this.props;
    var anchorOrigin = _props.anchorOrigin;
    var className = _props.className;
    var closeOnItemTouchTap = _props.closeOnItemTouchTap;
    var iconButtonElement = _props.iconButtonElement;
    var iconStyle = _props.iconStyle;
    var onItemTouchTap = _props.onItemTouchTap;
    var onKeyboardFocus = _props.onKeyboardFocus;
    var onMouseDown = _props.onMouseDown;
    var onMouseLeave = _props.onMouseLeave;
    var onMouseEnter = _props.onMouseEnter;
    var onMouseUp = _props.onMouseUp;
    var onTouchTap = _props.onTouchTap;
    var menuStyle = _props.menuStyle;
    var style = _props.style;
    var targetOrigin = _props.targetOrigin;

    var other = _objectWithoutProperties(_props, ['anchorOrigin', 'className', 'closeOnItemTouchTap', 'iconButtonElement', 'iconStyle', 'onItemTouchTap', 'onKeyboardFocus', 'onMouseDown', 'onMouseLeave', 'onMouseEnter', 'onMouseUp', 'onTouchTap', 'menuStyle', 'style', 'targetOrigin']);

    var _state = this.state;
    var open = _state.open;
    var anchorEl = _state.anchorEl;

    var styles = {
      root: {
        display: 'inline-block',
        position: 'relative'
      },

      menu: {
        position: 'relative'
      }
    };

    var mergedRootStyles = this.prepareStyles(styles.root, style);
    var mergedMenuStyles = this.mergeStyles(styles.menu, menuStyle);

    var iconButton = React.cloneElement(iconButtonElement, {
      onKeyboardFocus: this.props.onKeyboardFocus,
      iconStyle: this.mergeStyles(iconStyle, iconButtonElement.props.iconStyle),
      onTouchTap: function onTouchTap(e) {
        _this.open(Events.isKeyboard(e), e);
        if (iconButtonElement.props.onTouchTap) iconButtonElement.props.onTouchTap(e);
      },
      ref: this.state.iconButtonRef
    });

    var menu = React.createElement(
      Menu,
      _extends({}, other, {
        animateOpen: true,
        initiallyKeyboardFocused: this.state.menuInitiallyKeyboardFocused,
        onEscKeyDown: this._handleMenuEscKeyDown,
        onItemTouchTap: this._handleItemTouchTap,
        zDepth: 0,
        style: mergedMenuStyles }),
      this.props.children
    );

    return React.createElement(
      'div',
      {
        className: className,
        onMouseDown: onMouseDown,
        onMouseLeave: onMouseLeave,
        onMouseEnter: onMouseEnter,
        onMouseUp: onMouseUp,
        onTouchTap: onTouchTap,
        style: mergedRootStyles },
      iconButton,
      React.createElement(
        Popover,
        {
          anchorOrigin: anchorOrigin,
          targetOrigin: targetOrigin,
          open: open,
          anchorEl: anchorEl,
          childContextTypes: this.constructor.childContextTypes,
          onRequestClose: this.close,
          context: this.context },
        menu
      )
    );
  },
  isOpen: function isOpen() {
    return this.state.open;
  },
  close: function close(isKeyboard) {
    var _this2 = this;

    if (!this.state.open) {
      return;
    }
    this.setState({ open: false }, function () {
      //Set focus on the icon button when the menu close
      if (isKeyboard) {
        var iconButton = _this2.refs[_this2.state.iconButtonRef];
        ReactDOM.findDOMNode(iconButton).focus();
        iconButton.setKeyboardFocus();
      }
    });
  },
  open: function open(menuInitiallyKeyboardFocused, event) {
    this.setState({
      open: true,
      menuInitiallyKeyboardFocused: menuInitiallyKeyboardFocused,
      anchorEl: event.currentTarget
    });
    event.preventDefault();
  },
  _handleItemTouchTap: function _handleItemTouchTap(event, child) {
    var _this3 = this;

    if (this.props.closeOnItemTouchTap) {
      (function () {
        var isKeyboard = Events.isKeyboard(event);

        _this3._timeout = setTimeout(function () {
          if (!_this3.isMounted()) {
            return;
          }
          _this3.close(isKeyboard);
        }, _this3.props.touchTapCloseDelay);
      })();
    }

    this.props.onItemTouchTap(event, child);
  },
  _handleMenuEscKeyDown: function _handleMenuEscKeyDown() {
    this.close(true);
  }
});

module.exports = IconMenu;