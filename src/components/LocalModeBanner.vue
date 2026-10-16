<script setup>
import { ref } from 'vue'

const dismissed = ref(false)
</script>

<template>
  <div v-if="!dismissed" class="local-banner" role="status">
    <span>
      <strong>Demo mode:</strong> calendars you create are saved only in this browser, so share links
      open on this device only.
    </span>
    <button type="button" class="local-banner__close" aria-label="Dismiss" @click="dismissed = true">×</button>
  </div>
</template>

<style scoped>
.local-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  background: #3c3226;
  color: #fdfaf3;
  font-size: 0.85rem;
  text-align: center;
  line-height: 1.4;
}

.local-banner__close {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: inherit;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
</style>
