import { track, trigger } from "./effect.mjs";
import { isObject, hasChanged } from "./vue-tool.mjs";
import { reactive, isProxy, toRaw } from "./reactive.mjs";

const convert = (val) => (isObject(val) ? reactive(val) : val);

export function isRef(r) {
  return r ? r.__v_isRef === true : false;
}

export function ref(value) {
  return createRef(value);
}

function createRef(rawValue, shallow = false) {
  if (isRef(rawValue)) {
    return rawValue;
  }
  let value = shallow ? rawValue : convert(rawValue);
  const r = {
    __v_isRef: true,
    get value() {
      track(r, "get", "value");
      return value;
    },
    set value(newVal) {
      if (hasChanged(toRaw(newVal), rawValue)) {
        rawValue = newVal;
        value = shallow ? newVal : convert(newVal);
        trigger(r, "set", "value");
      }
    },
  };
  return r;
}

export function triggerRef(ref) {
  trigger(ref, "set", "value", void 0);
}

export function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}

export function customRef(factory) {
  const { get, set } = factory(
    () => track(r, "get", "value"),
    () => trigger(r, "set", "value")
  );
  const r = {
    __v_isRef: true,
    get value() {
      return get();
    },
    set value(v) {
      set(v);
    },
  };
  return r;
}

export function toRefs(object) {
  const ret = {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret;
}

export function toRef(object, key) {
  return {
    __v_isRef: true,
    get value() {
      return object[key];
    },
    set value(newVal) {
      object[key] = newVal;
    },
  };
}
