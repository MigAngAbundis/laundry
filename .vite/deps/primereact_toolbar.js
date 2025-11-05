"use client";
import {
  ComponentBase,
  PrimeReactContext,
  useHandleStyle,
  useMergeProps
} from "./chunk-ZCN6VTJS.js";
import {
  ObjectUtils,
  classNames
} from "./chunk-4OKWJOVA.js";
import {
  require_react
} from "./chunk-2CLD7BNN.js";
import {
  __toESM
} from "./chunk-WOOG5QLI.js";

// node_modules/primereact/toolbar/toolbar.esm.js
var React = __toESM(require_react());
var ToolbarBase = ComponentBase.extend({
  defaultProps: {
    __TYPE: "Toolbar",
    id: null,
    style: null,
    className: null,
    left: null,
    right: null,
    start: null,
    center: null,
    end: null,
    children: void 0
  },
  css: {
    classes: {
      root: "p-toolbar p-component",
      start: "p-toolbar-group-start p-toolbar-group-left",
      center: "p-toolbar-group-center",
      end: "p-toolbar-group-end p-toolbar-group-right"
    },
    styles: "\n        @layer primereact {\n            .p-toolbar {\n                display: flex;\n                align-items: center;\n                justify-content: space-between;\n                flex-wrap: wrap;\n            }\n            \n            .p-toolbar-group-start,\n            .p-toolbar-group-center,\n            .p-toolbar-group-end {\n                display: flex;\n                align-items: center;\n            }\n            \n            .p-toolbar-group-left,\n            .p-toolbar-group-right {\n                display: flex;\n                align-items: center;\n            }\n        }\n        "
  }
});
var Toolbar = React.memo(React.forwardRef(function(inProps, ref) {
  var mergeProps = useMergeProps();
  var context = React.useContext(PrimeReactContext);
  var props = ToolbarBase.getProps(inProps, context);
  var elementRef = React.useRef(null);
  var start = ObjectUtils.getJSXElement(props.left || props.start, props);
  var center = ObjectUtils.getJSXElement(props.center, props);
  var end = ObjectUtils.getJSXElement(props.right || props.end, props);
  var _ToolbarBase$setMetaD = ToolbarBase.setMetaData({
    props
  }), ptm = _ToolbarBase$setMetaD.ptm, cx = _ToolbarBase$setMetaD.cx, isUnstyled = _ToolbarBase$setMetaD.isUnstyled;
  useHandleStyle(ToolbarBase.css.styles, isUnstyled, {
    name: "toolbar"
  });
  React.useImperativeHandle(ref, function() {
    return {
      props,
      getElement: function getElement() {
        return elementRef.current;
      }
    };
  });
  var startProps = mergeProps({
    className: cx("start")
  }, ptm("start"));
  var centerProps = mergeProps({
    className: cx("center")
  }, ptm("center"));
  var endProps = mergeProps({
    className: cx("end")
  }, ptm("end"));
  var rootProps = mergeProps({
    id: props.id,
    ref: elementRef,
    style: props.style,
    className: classNames(props.className, cx("root")),
    role: "toolbar"
  }, ToolbarBase.getOtherProps(props), ptm("root"));
  return React.createElement("div", rootProps, React.createElement("div", startProps, start), React.createElement("div", centerProps, center), React.createElement("div", endProps, end));
}));
Toolbar.displayName = "Toolbar";
export {
  Toolbar
};
//# sourceMappingURL=primereact_toolbar.js.map
