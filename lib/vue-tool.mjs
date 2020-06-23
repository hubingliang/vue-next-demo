const hasOwnProperty = Object.prototype.hasOwnProperty;
export const hasOwn = (val, key) => hasOwnProperty.call(val, key);
export const isObject = (val) => val !== null && typeof val === "object";
export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? (val) => !!map[val.toLowerCase()]
    : (val) => !!map[val];
}
export const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
export const objectToString = Object.prototype.toString;
export const toTypeString = (value) => objectToString.call(value);
export const isArray = Array.isArray;
export const hasChanged = (value, oldValue) =>
  value !== oldValue && (value === value || oldValue === oldValue);
export const isFunction = (val) => typeof val === "function";
export const NOOP = () => {};
export const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    value,
  });
};
