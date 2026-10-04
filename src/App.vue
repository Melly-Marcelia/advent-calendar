<script setup>
import BackgroundStars from './components/BackgroundStars.vue'
</script>

<template>
  <div class="page">
    <BackgroundStars />
    <router-view />
  </div>
</template>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
</style>
