<template>
  <div @click="goHoverball">home</div>
  <span>{{count}}</span>
  <button @click="addCount">+</button>
</template>
<script setup>

import {ref} from "vue";

const count = ref(0)
const goHoverball = () => {
  console.log('goHoverball')
  // ipcRenderer.send('aaa')
  window.ipcRenderer.openHoverball('aaa')
  // window.ipcRenderer.send("open-win","hoverball")
}

const addCount = () => {
  count.value += 1
  localStorage.setItem('count',count.value+'')
}

</script>