'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = require('react');
var ReactDOM = require('react-dom');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var StylePropable = require('../mixins/style-propable');
var Colors = require('../styles/colors');
var Popover = require('../popover/popover');
var CheckIcon = require('../svg-icons/navigation/check');
var ListItem = require('../lists/list-item');
var DefaultRawTheme = require('../styles/raw-themes/light-raw-theme');
var ThemeManager = require('../styles/theme-manager');
var Menu = require('./menu');

var nestedMenuStyle = { position: 'relative' };
var MenuItem = React.createClass({

  mixins: [PureRenderMixin, StylePropable],

  contextTypes: {
    muiTheme: React.PropTypes.object
  },

  propTypes: {
    checked: React.PropTypes.bool,
    desktop: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    innerDivStyle: React.PropTypes.object,
    insetChildren: React.PropTypes.bool,
    focusState: React.PropTypes.oneOf(['none', 'focused', 'keyboard-focused']),
    leftIcon: React.PropTypes.element,
    rightIcon: React.PropTypes.element,
    onTouchTap: React.PropTypes.func,
    secondaryText: React.PropTypes.node,
    style: React.PropTypes.object,
    value: React.PropTypes.string
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
      open: false
    };
  },

  //to update theme inside state whenever a new theme is passed down
  //from the parent / owner using context
  componentWillReceiveProps: function componentWillReceiveProps(nextProps, nextContext) {
    var newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({ muiTheme: newMuiTheme });

    if (this.state.open && nextProps.focusState === 'none') {
      this._onRequestClose();
    }
  },
  getDefaultProps: function getDefaultProps() {
    return {
      focusState: 'none'
    };
  },
  componentDidMount: function componentDidMount() {
    this._applyFocusState();
  },
  componentDidUpdate: function componentDidUpdate() {
    this._applyFocusState();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.state.open) {
      this.setState({ open: false });
    }
  },
  render: function render() {
    var _props = this.props;
    var checked = _props.checked;
    var children = _props.children;
    var desktop = _props.desktop;
    var disabled = _props.disabled;
    var focusState = _props.focusState;
    var innerDivStyle = _props.innerDivStyle;
    var insetChildren = _props.insetChildren;
    var leftIcon = _props.leftIcon;
    var menuItems = _props.menuItems;
    var rightIcon = _props.rightIcon;
    var secondaryText = _props.secondaryText;
    var style = _props.style;
    var value = _props.value;

    var other = _objectWithoutProperties(_props, ['checked', 'children', 'desktop', 'disabled', 'focusState', 'innerDivStyle', 'insetChildren', 'leftIcon', 'menuItems', 'rightIcon', 'secondaryText', 'style', 'value']);

    var disabledColor = this.state.muiTheme.rawTheme.palette.disabledColor;
    var textColor = this.state.muiTheme.rawTheme.palette.textColor;
    var leftIndent = desktop ? 64 : 72;
    var sidePadding = desktop ? 24 : 16;

    var styles = {
      root: {
        color: disabled ? disabledColor : textColor,
        lineHeight: desktop ? '32px' : '48px',
        fontSize: desktop ? 15 : 16,
        whiteSpace: 'nowrap'
      },

      innerDivStyle: {
        paddingLeft: leftIcon || insetChildren || checked ? leftIndent : sidePadding,
        paddingRight: sidePadding,
        paddingBottom: 0,
        paddingTop: 0
      },

      secondaryText: {
        float: 'right'
      },

      leftIconDesktop: {
        padding: 0,
        left: 24,
        top: 4
      },

      rightIconDesktop: {
        padding: 0,
        right: 24,
        top: 4,
        fill: Colors.grey600
      }
    };

    var mergedRootStyles = this.mergeStyles(styles.root, style);
    var mergedInnerDivStyles = this.mergeStyles(styles.innerDivStyle, innerDivStyle);

    //Left Icon
    var leftIconElement = leftIcon ? leftIcon : checked ? React.createElement(CheckIcon, null) : null;
    if (leftIconElement && desktop) {
      var mergedLeftIconStyles = this.mergeStyles(styles.leftIconDesktop, leftIconElement.props.style);
      leftIconElement = React.cloneElement(leftIconElement, { style: mergedLeftIconStyles });
    }

    //Right Icon
    var rightIconElement = undefined;
    if (rightIcon) {
      var mergedRightIconStyles = desktop ? this.mergeStyles(styles.rightIconDesktop, rightIcon.props.style) : null;
      rightIconElement = React.cloneElement(rightIcon, { style: mergedRightIconStyles });
    }

    //Secondary Text
    var secondaryTextElement = undefined;
    if (secondaryText) {
      var secondaryTextIsAnElement = React.isValidElement(secondaryText);
      var mergedSecondaryTextStyles = secondaryTextIsAnElement ? this.mergeStyles(styles.secondaryText, secondaryText.props.style) : null;

      secondaryTextElement = secondaryTextIsAnElement ? React.cloneElement(secondaryText, { style: mergedSecondaryTextStyles }) : React.createElement(
        'div',
        { style: this.prepareStyles(styles.secondaryText) },
        secondaryText
      );
    }
    var childMenuPopover = undefined;
    if (menuItems) {
      childMenuPopover = React.createElement(
        Popover,
        {
          anchorOrigin: { horizontal: 'right', vertical: 'top' },
          anchorEl: this.state.anchorEl,
          open: this.state.open,
          onRequestClose: this._onRequestClose },
        React.createElement(
          Menu,
          { desktop: desktop, disabled: disabled, style: nestedMenuStyle },
          React.Children.map(menuItems, this._cloneMenuItem)
        )
      );
      other.onTouchTap = this._onTouchTap;
    }

    return React.createElement(
      ListItem,
      _extends({}, other, {
        disabled: disabled,
        innerDivStyle: mergedInnerDivStyles,
        insetChildren: insetChildren,
        leftIcon: leftIconElement,
        ref: 'listItem',
        rightIcon: rightIconElement,
        style: mergedRootStyles }),
      children,
      secondaryTextElement,
      childMenuPopover
    );
  },
  _applyFocusState: function _applyFocusState() {
    this.refs.listItem.applyFocusState(this.props.focusState);
  },
  _cloneMenuItem: function _cloneMenuItem(item) {
    var _this = this;

    var props = {
      onTouchTap: function onTouchTap(e) {
        _this._onRequestClose();
        if (item.props.onTouchTap) {
          item.props.onTouchTap(e);
        }
        if (_this.props.onTouchTap) {
          _this.props.onTouchTap(e);
        }
      },
      onRequestClose: this._onRequestClose
    };
    return React.cloneElement(item, props);
  },
  _onTouchTap: function _onTouchTap(e) {
    e.preventDefault();
    this.setState({
      open: true,
      anchorEl: ReactDOM.findDOMNode(this)
    });
    if (this.props.onTouchTap) {
      this.props.onTouchTap(e);
    }
  },
  _onRequestClose: function _onRequestClose() {
    if (!this.isMounted()) {
      return;
    }
    this.setState({
      open: false,
      anchorEl: null
    });
  }
});

module.exports = MenuItem;