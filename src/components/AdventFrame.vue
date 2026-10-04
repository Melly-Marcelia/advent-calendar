<script setup>
import { computed } from 'vue'
import { useFrameUnlock } from '../composables/useFrameUnlock'

const props = defineProps({
  frame: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['open'])

const { isUnlocked, isToday } = useFrameUnlock(props.frame.unlockDate)

const stateLabel = computed(() => {
  if (isToday.value) return "Today's frame — click to open"
  if (isUnlocked.value) return 'Frame opened'
  return 'Frame locked until ' + props.frame.unlockDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
})

function handleActivate() {
  if (!isUnlocked.value) return
  emit('open', props.frame.day)
}
</script>

<template>
  <button
    type="button"
    class="frame"
    :class="{ 'frame--locked': !isUnlocked, 'frame--today': isToday }"
    :aria-disabled="!isUnlocked"
    :title="stateLabel"
    @click="handleActivate"
  >
    <img class="frame__art frame__art--default" :src="frame.defaultImage" :alt="`Day ${frame.day}`" draggable="false" />
    <img
      v-if="isUnlocked"
      class="frame__art frame__art--hover"
      :src="frame.hoverImage"
      alt=""
      aria-hidden="true"
      draggable="false"
    />
    <span class="sr-only">{{ stateLabel }}</span>
  </button>
</template>

<style scoped>
.frame {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 3 / 4;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.frame__art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 10px rgba(35, 30, 20, 0.18));
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.frame__art--hover {
  opacity: 0;
  transform: scale(0.96);
}

.frame:hover .frame__art--default,
.frame:focus-visible .frame__art--default {
  opacity: 0;
  transform: scale(1.04);
}

.frame:hover .frame__art--hover,
.frame:focus-visible .frame__art--hover {
  opacity: 1;
  transform: scale(1.06);
}

.frame:active .frame__art--hover {
  transform: scale(1.0);
}

.frame--locked {
  cursor: not-allowed;
}

.frame--locked .frame__art {
  filter: grayscale(0.55) opacity(0.55) drop-shadow(0 4px 8px rgba(35, 30, 20, 0.12));
}

.frame--locked:hover .frame__art--default,
.frame--locked:focus-visible .frame__art--default {
  opacity: 1;
  transform: none;
}

.frame--today .frame__art--default {
  animation: pulse 2.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.035); }
}

.frame:focus-visible {
  outline: 3px solid #6b7fb8;
  outline-offset: 6px;
  border-radius: 12px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
