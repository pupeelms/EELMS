import {
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  styled_default2 as styled_default,
  useDefaultProps
} from "./chunk-WJU3VP3C.js";
import {
  require_jsx_runtime
} from "./chunk-GGADGINT.js";
import {
  clsx_default
} from "./chunk-2KHBIA62.js";
import {
  require_prop_types
} from "./chunk-YBH2ELBD.js";
import {
  require_react
} from "./chunk-N4N5IM6X.js";
import {
  __toESM
} from "./chunk-LK32TJAX.js";

// node_modules/@mui/material/TableContainer/TableContainer.js
var React = __toESM(require_react());
var import_prop_types = __toESM(require_prop_types());

// node_modules/@mui/material/TableContainer/tableContainerClasses.js
function getTableContainerUtilityClass(slot) {
  return generateUtilityClass("MuiTableContainer", slot);
}
var tableContainerClasses = generateUtilityClasses("MuiTableContainer", ["root"]);
var tableContainerClasses_default = tableContainerClasses;

// node_modules/@mui/material/TableContainer/TableContainer.js
var import_jsx_runtime = __toESM(require_jsx_runtime());
var useUtilityClasses = (ownerState) => {
  const {
    classes
  } = ownerState;
  const slots = {
    root: ["root"]
  };
  return composeClasses(slots, getTableContainerUtilityClass, classes);
};
var TableContainerRoot = styled_default("div", {
  name: "MuiTableContainer",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root
})({
  width: "100%",
  overflowX: "auto"
});
var TableContainer = React.forwardRef(function TableContainer2(inProps, ref) {
  const props = useDefaultProps({
    props: inProps,
    name: "MuiTableContainer"
  });
  const {
    className,
    component = "div",
    ...other
  } = props;
  const ownerState = {
    ...props,
    component
  };
  const classes = useUtilityClasses(ownerState);
  return (0, import_jsx_runtime.jsx)(TableContainerRoot, {
    ref,
    as: component,
    className: clsx_default(classes.root, className),
    ownerState,
    ...other
  });
});
true ? TableContainer.propTypes = {
  // ┌────────────────────────────── Warning ──────────────────────────────┐
  // │ These PropTypes are generated from the TypeScript type definitions. │
  // │    To update them, edit the d.ts file and run `pnpm proptypes`.     │
  // └─────────────────────────────────────────────────────────────────────┘
  /**
   * The content of the component, normally `Table`.
   */
  children: import_prop_types.default.node,
  /**
   * Override or extend the styles applied to the component.
   */
  classes: import_prop_types.default.object,
  /**
   * @ignore
   */
  className: import_prop_types.default.string,
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component: import_prop_types.default.elementType,
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx: import_prop_types.default.oneOfType([import_prop_types.default.arrayOf(import_prop_types.default.oneOfType([import_prop_types.default.func, import_prop_types.default.object, import_prop_types.default.bool])), import_prop_types.default.func, import_prop_types.default.object])
} : void 0;
var TableContainer_default = TableContainer;

export {
  getTableContainerUtilityClass,
  tableContainerClasses_default,
  TableContainer_default
};
//# sourceMappingURL=chunk-G3A4ZQF2.js.map
