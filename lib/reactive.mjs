import { isObject, hasOwn, makeMap, toRawType, def } from "./vue-tool.mjs";
import { proxyHandlers } from "./proxyHandlers.mjs";

const ReactiveFlags = {
  skip: "__v_skip",
  isReactive: "__v_isReactive",
  isReadonly: "__v_isReadonly",
  raw: "__v_raw",
  reactive: "__v_reactive",
  readonly: "__v_readonly",
};

const canObserve = (value) => {
  return (
    !value[ReactiveFlags.skip] &&
    isObservableType(toRawType(value)) &&
    !Object.isFrozen(value)
  );
};
const isObservableType = /*#__PURE__*/ makeMap(
  "Object,Array,Map,Set,WeakMap,WeakSet"
);

export function reactive(target) {
  return createReactiveObject(target, proxyHandlers);
}

const createReactiveObject = (target, proxyHandlers) => {
  if (target[ReactiveFlags.raw]) {
    return target;
  }
  // target already has corresponding Proxy
  if (hasOwn(target, ReactiveFlags.reactive)) {
    return target[ReactiveFlags.reactive];
  }
  // only a whitelist of value types can be observed.
  if (!canObserve(target)) {
    return target;
  }

  const observed = new Proxy(target, proxyHandlers);
  def(target, "__v_reactive", observed);
  return observed;
};

export function toRaw(observed) {
  return (observed && toRaw(observed[ReactiveFlags.raw])) || observed;
}
export function isProxy(value) {
  return isReactive(value);
}
export function isReactive(value) {
  return !!(value && value[ReactiveFlags.isReactive]);
}
