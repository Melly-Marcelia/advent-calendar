<script setup>
defineProps({
  uploading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  skipped: { type: Array, default: () => [] },
})

const emit = defineEmits(['files-selected'])

function onChange(event) {
  emit('files-selected', event)
}
</script>

<template>
  <section class="theme">
    <h2>Theme</h2>
    <p class="theme__hint">
      Upload a new set of door artwork to replace the built-in theme. Files must be named
      <code>dayNN-default.png</code> and <code>dayNN-hover.png</code> (NN = 01–24, up to 8MB each). You
      can upload any subset of days — the rest keep their current artwork.
    </p>
    <input type="file" multiple accept="image/*" :disabled="uploading" @change="onChange" />
    <p v-if="uploading">Uploading…</p>
    <p v-if="error" class="theme__error">{{ error }}</p>
    <p v-if="skipped.length" class="theme__hint">Skipped (name didn't match the pattern): {{ skipped.join(', ') }}</p>
  </section>
</template>

<style scoped>
.theme {
  background: #fdfaf3;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.12);
}

.theme h2 {
  margin-top: 0;
  font-family: 'Caveat', cursive;
  font-size: 1.75rem;
  color: #3c3226;
}

.theme__hint {
  color: #6b5f4f;
  font-size: 0.9rem;
  line-height: 1.5;
}

.theme__error {
  color: #c1272d;
}
</style>
