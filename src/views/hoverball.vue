<template>
  <div
      ref="hoverball"
      class="hoverball"
      @mousedown="handleMouseDown"
  >
    悬浮球{{count}}
  </div>
</template>

<script setup>
import {onBeforeUnmount, onMounted, ref} from 'vue';

onMounted(() => {
  // 添加 storage 事件监听器
  window.addEventListener('storage', handleStorageEvent);
});
const count = ref(0);

// 处理 storage 改变事件
const handleStorageEvent = (event) => {
  if (event.key === 'count') {
    console.log('json变了',event.newValue)
    count.value = JSON.parse(event.newValue);
  }
};

// 在组件销毁时清除定时器
onBeforeUnmount(() => {
  //移除监听器
  window.removeEventListener('storage', handleStorageEvent);
});
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const offset = ref({ x: 0, y: 0 });

const handleMouseDown = (e) => {
  isDragging.value = true;
  offset.value = { x: e.clientX - position.value.x, y: e.clientY - position.value.y };

  // 在 document 上添加事件监听器
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
};

const handleMouseMove = (e) => {
  if (isDragging.value) {
    const { screenX, screenY } = e;
    position.value = { x: screenX - offset.value.x, y: screenY - offset.value.y };
    window.ipcRenderer.send('drag-hoverball', { x: position.value.x, y: position.value.y });
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
  position.value = { x: 0, y: 0 };
  offset.value = { x: 0, y: 0 };

  // 移除事件监听器
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
}
.hoverball {

  background-color: #f00;
  cursor: pointer;
  user-select: none;
}
</style>
