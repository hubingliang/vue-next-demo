import { isObject, hasOwn, isArray, hasChanged } from "./vue-tool.mjs";
import { toRaw, reactive } from "./reactive.mjs";
import { track, trigger } from "./effect.mjs";
import { isRef } from "./ref.mjs";

export const proxyHandlers = {
  get,
  set,
};

function get(target, key, receiver) {
  const targetIsArray = isArray(target);
  if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
    return Reflect.get(arrayInstrumentations, key, receiver);
  }

  const res = Reflect.get(target, key, receiver);
  track(target, "get", key);

  console.log("收集依赖 ", key);

  if (isRef(res)) {
    // ref unwrapping, only for Objects, not for Arrays.
    return targetIsArray ? res : res.value;
  }

  if (isObject(res)) {
    // Convert returned value into a proxy as well. we do the isObject check
    // here to avoid invalid value warning. Also need to lazy access readonly
    // and reactive here to avoid circular dependency.
    return reactive(res);
  }

  return res;
}
function set(target, key, value, receiver) {
  const oldValue = target[key];

  value = toRaw(value);
  if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
    oldValue.value = value;
    return true;
  }

  const hadKey = hasOwn(target, key);
  const result = Reflect.set(target, key, value, receiver);
  // don't trigger if target is something up in the prototype chain of original
  if (target === toRaw(receiver)) {
    if (!hadKey) {
      trigger(target, "add", key, value);
    } else if (hasChanged(value, oldValue)) {
      trigger(target, "set", key, value, oldValue);
    }
  }
  return result;
}

const arrayInstrumentations = {};

["includes", "indexOf", "lastIndexOf"].forEach((key) => {
  arrayInstrumentations[key] = function (...args) {
    const arr = toRaw(this);
    for (let i = 0, l = this.length; i < l; i++) {
      track(arr, "get", i + "");
    }
    // we run the method using the original args first (which may be reactive)
    const res = arr[key](...args);
    if (res === -1 || res === false) {
      // if that didn't work, run it again using raw values.
      return arr[key](...args.map(toRaw));
    } else {
      return res;
    }
  };
});
