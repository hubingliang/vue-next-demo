import { reactive, ref, effect, computed } from "./simple-vue.mjs";

const count = ref(0);
const data = reactive({ count: 23 });
// const addCount = () => {
//   // data.count++;
//   count.value++;
// };
// const plusOne = computed(() => count.value + 1);
effect(() => {
  // 依赖追踪
  console.log("data changed", data);
  console.log("count changed ", count.value);
});
// console.log("plusOne: ", plusOne.value);
// addCount();
