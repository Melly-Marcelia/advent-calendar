<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import ConfettiBurst from './ConfettiBurst.vue'

const props = defineProps({
  frame: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
const dialogRef = ref(null)

function onKeydown(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  dialogRef.value?.focus()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <ConfettiBurst v-if="frame.day === 24" />
    <div
      ref="dialogRef"
      class="modal"
      role="dialog"
      aria-modal="true"
      :aria-label="frame.message"
      tabindex="-1"
    >
      <button type="button" class="modal__close" aria-label="Close" @click="emit('close')">×</button>

      <div v-if="frame.giftCode" class="modal__art-row">
        <img class="modal__photo" :src="frame.giftImage" :alt="`Day ${frame.day}`" />
        <img class="modal__photo" :src="frame.giftCode" alt="Scan to open the playlist" />
      </div>
      <img v-else class="modal__art" :src="frame.giftImage ?? frame.hoverImage" :alt="`Day ${frame.day} artwork`" />

      <p class="modal__message">{{ frame.message }}</p>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(35, 30, 45, 0.55);
  display: grid;
  place-items: center;
  padding: 1.5rem;
  z-index: 100;
}

.modal {
  position: relative;
  background: #fdfaf3;
  border-radius: 20px;
  padding: 2.5rem 2rem 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 50px rgba(20, 15, 10, 0.35);
}

.modal__close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 50%;
  background: #eee6d3;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  color: #55493a;
}

.modal__close:hover {
  background: #e2d6b9;
}

.modal__art {
  max-width: 180px;
  max-height: 220px;
  object-fit: contain;
  margin: 0 auto 1.25rem;
  filter: drop-shadow(0 10px 16px rgba(35, 30, 20, 0.2));
}

.modal__art-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.modal__photo {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.25);
}

.modal__message {
  font-family: 'Caveat', cursive;
  font-size: 1.75rem;
  margin: 0;
  color: #3c3226;
  line-height: 1.3;
}
</style>
