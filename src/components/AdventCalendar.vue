<script setup>
import { computed, ref } from 'vue'
import AdventFrame from './AdventFrame.vue'
import FrameModal from './FrameModal.vue'

const props = defineProps({
  frames: {
    type: Array,
    required: true, // 24 frame objects: { day, message, defaultImage, hoverImage, giftImage, giftCode, unlockDate }
  },
  // Hand-tuned size/position variety for the original showcase layout — opt-in
  // only, since it doesn't generalize to arbitrary user-uploaded artwork.
  variedSizes: {
    type: Boolean,
    default: false,
  },
})

const SIZE_OVERRIDES = {
  large: [2, 8, 13, 17, 24],
  small: [18, 14, 23],
  shiftRight: [3, 18],
  shiftLeft: [7],
  shiftDown: [13],
}

function frameClass(day) {
  if (!props.variedSizes) return null
  return {
    'calendar__grid-item--large': SIZE_OVERRIDES.large.includes(day),
    'calendar__grid-item--small': SIZE_OVERRIDES.small.includes(day),
    'calendar__grid-item--shift-right': SIZE_OVERRIDES.shiftRight.includes(day),
    'calendar__grid-item--shift-left': SIZE_OVERRIDES.shiftLeft.includes(day),
    'calendar__grid-item--shift-down': SIZE_OVERRIDES.shiftDown.includes(day),
  }
}

const openDay = ref(null)

const openedFrame = computed(() => props.frames.find((f) => f.day === openDay.value) ?? null)

function handleOpen(day) {
  openDay.value = day
}

function handleClose() {
  openDay.value = null
}
</script>

<template>
  <div class="calendar">
    <div class="calendar__grid">
      <AdventFrame
        v-for="frame in frames"
        :key="frame.day"
        :frame="frame"
        :class="frameClass(frame.day)"
        @open="handleOpen"
      />
    </div>

    <Teleport to="body">
      <FrameModal v-if="openedFrame" :frame="openedFrame" @close="handleClose" />
    </Teleport>
  </div>
</template>

<style scoped>
.calendar {
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}

.calendar__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(1.5rem, 5vw, 3.25rem);
}

/* Each modifier sets only its own piece (scale/x/y); the grid item combines
   whichever are present so multiple modifiers stack instead of overwriting
   each other's `transform`. */
.calendar__grid > * {
  transform: translate(var(--shift-x, 0%), var(--shift-y, 0%)) scale(var(--item-scale, 1));
}

.calendar__grid-item--large {
  position: relative;
  z-index: 2;
  --item-scale: 1.22;
}

.calendar__grid-item--small {
  --item-scale: 0.8;
}

.calendar__grid-item--shift-right {
  --shift-x: 12%;
}

.calendar__grid-item--shift-left {
  --shift-x: -12%;
}

.calendar__grid-item--shift-down {
  --shift-y: 10%;
}

@media (max-width: 720px) {
  .calendar__grid {
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(1.25rem, 6vw, 2.5rem);
  }
}

@media (max-width: 460px) {
  .calendar__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(1rem, 7vw, 2rem);
  }
}
</style>
