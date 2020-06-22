import { isArray } from "./vue-tool.mjs";
// The main WeakMap that stores {target -> key -> dep} connections.
// Conceptually, it's easier to think of a dependency as a Dep class
// which maintains a Set of subscribers, but we simply store them as
// raw Sets to reduce memory overhead.
const targetMap = new WeakMap();

const effectStack = [];
let activeEffect;

export const ITERATE_KEY = Symbol("");
export const MAP_KEY_ITERATE_KEY = Symbol("");

export function isEffect(fn) {
  return fn && fn._isEffect === true;
}

export function effect(fn, options = {}) {
  if (isEffect(fn)) {
    fn = fn.raw;
  }
  const effect = createReactiveEffect(fn, options);
  if (!options.lazy) {
    effect();
  }
  return effect;
}

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect(...args) {
    if (!effect.active) {
      return options.scheduler ? undefined : fn(...args);
    }
    if (!effectStack.includes(effect)) {
      cleanup(effect);
      try {
        enableTracking();
        effectStack.push(effect);
        activeEffect = effect;
        return fn(...args);
      } finally {
        effectStack.pop();
        resetTracking();
        activeEffect = effectStack[effectStack.length - 1];
      }
    }
  };
  effect.id = uid++;
  effect._isEffect = true;
  effect.active = true;
  effect.raw = fn;
  effect.deps = [];
  effect.options = options;
  return effect;
}

let uid = 0;

function cleanup(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}

let shouldTrack = true;
const trackStack = [];

export function enableTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}

export function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
}

export function track(target, type, key) {
  if (!shouldTrack || activeEffect === undefined) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  console.log("depsMap: ", depsMap);

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
  console.log("activeEffect: ", activeEffect);
}

export function trigger(target, type, key, newValue) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    // never been tracked
    return;
  }

  const effects = new Set();
  const computedRunners = new Set();
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => {
        if (effect !== activeEffect || !shouldTrack) {
          if (effect.options.computed) {
            computedRunners.add(effect);
          } else {
            effects.add(effect);
          }
        }
      });
    }
  };

  // schedule runs for SET | ADD | DELETE
  if (key !== void 0) {
    add(depsMap.get(key));
  }
  // also run for iteration key on ADD | DELETE | Map.SET
  const isAddOrDelete =
    type === "add" || (type === "delete" && !isArray(target));
  if (isAddOrDelete || (type === "set" && target instanceof Map)) {
    add(depsMap.get(isArray(target) ? "length" : ITERATE_KEY));
  }
  if (isAddOrDelete && target instanceof Map) {
    add(depsMap.get(MAP_KEY_ITERATE_KEY));
  }

  const run = (effect) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  };

  // Important: computed effects must be run first so that computed getters
  // can be invalidated before any normal effects that depend on them are run.
  computedRunners.forEach(run);
  effects.forEach(run);
}
