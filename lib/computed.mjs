import { effect, trigger, track } from "./effect.mjs";

export function computed(getterFunction) {
  let setter = () => {};
  let getter = getterFunction;

  let dirty = true;
  let value;
  let computed;

  const runner = effect(getter, {
    lazy: true,
    // mark effect as computed so that it gets priority during trigger
    computed: true,
    scheduler: () => {
      if (!dirty) {
        dirty = true;
        trigger(computed, "set", "value");
      }
    },
  });
  computed = {
    __v_isRef: true,
    // expose effect so computed can be stopped
    effect: runner,
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }
      track(computed, "get", "value");
      return value;
    },
    set value(newValue) {
      setter(newValue);
    },
  };
  return computed;
}
