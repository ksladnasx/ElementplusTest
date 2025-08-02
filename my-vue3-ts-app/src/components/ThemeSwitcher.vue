<template>
  <div class="theme-switcher">
    <!-- v-model="isDark" ，父组件传来的初始值为false -->
    <el-switch
      v-model="isDark" 
      @change="toggleTheme"
      inline-prompt
      :active-icon="Moon"
      :inactive-icon="Sunny"
    />
    <el-color-picker v-model="themeColor" @change="updateTheme" />
  </div>
</template>

<script setup>
import { Moon, Sunny } from '@element-plus/icons-vue';
import { ref, watch } from 'vue';
import { useStorage } from '@vueuse/core';
import { useElementPlusTheme } from 'use-element-plus-theme';

//状态管理，声明组件接收的 isDark 属性（布尔值），用于控制深色/浅色模式
const props = defineProps(['isDark']); 
// 定义自定义事件 update:isDark，实现父子组件的双向绑定（v-model:is-dark 语法支持
const emit = defineEmits(['update:isDark']);

const isDark = ref(props.isDark);
const themeColor = useStorage('theme-color', '#409EFF');
const { changeTheme } = useElementPlusTheme(themeColor.value);

const toggleTheme = () => {
  // 是否开启暗夜模式，初值isDark.value是false，当切换框点击后改为true
  document.documentElement.classList.toggle('dark', isDark.value);
  emit('update:isDark', isDark.value);
};

const updateTheme = (color) => {
  changeTheme(color);
};

watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val);
});
</script>