<template>
  <img src="./logo.png" />
  <h1>Hello Vue 3!</h1>
  <p>Count: {{ count }}</p>
  <p>Count: {{ data.count }}</p>
  <button @click="addCount">add</button>
</template>

<script>
import { reactive, ref, computed, watchEffect, watch } from "vue";

export default {
  setup() {
    const count = ref(0);
    const data = reactive({ count: 23 });
    const addCount = () => {
      count.value++;
    };
    const plusOne = computed(() => count.value + 1);

    watchEffect(() => {
      // 依赖追踪
      console.log("count: ", count.value);
      console.log("count: ", count);
    });
    watch(count, (count, prevCount) => {
      console.log("count: ", count);
    });

    return {
      count,
      addCount,
      data
    };
  }
};
</script>

<style scoped>
img {
  width: 200px;
}
h1 {
  font-family: Arial, Helvetica, sans-serif;
}
</style>
