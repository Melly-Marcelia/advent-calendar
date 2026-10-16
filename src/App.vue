<script setup>
import BackgroundStars from './components/BackgroundStars.vue'
import LocalModeBanner from './components/LocalModeBanner.vue'
import { isLocalMode } from './lib/supabase'
</script>

<template>
  <LocalModeBanner v-if="isLocalMode" />
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
