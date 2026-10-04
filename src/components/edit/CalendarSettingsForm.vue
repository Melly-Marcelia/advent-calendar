<script setup>
defineProps({
  saving: { type: Boolean, default: false },
  saved: { type: Boolean, default: false },
})

const emit = defineEmits(['save'])
const settings = defineModel({ required: true }) // { title, subtitle, unlockMode }
</script>

<template>
  <section class="settings">
    <h2>Calendar settings</h2>
    <label class="settings__field">
      <span>Title</span>
      <input v-model="settings.title" type="text" />
    </label>
    <label class="settings__field">
      <span>Subtitle</span>
      <input v-model="settings.subtitle" type="text" />
    </label>
    <label class="settings__field">
      <span>Unlock mode</span>
      <select v-model="settings.unlockMode">
        <option value="date">Date-gated (unlocks day-by-day in December)</option>
        <option value="always">Always unlocked (open any door anytime)</option>
      </select>
    </label>
    <button type="button" class="settings__save" :disabled="saving" @click="emit('save')">
      {{ saving ? 'Saving…' : 'Save settings' }}
    </button>
    <span v-if="saved" class="settings__saved">Saved ✓</span>
  </section>
</template>

<style scoped>
.settings {
  background: #fdfaf3;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.12);
}

.settings h2 {
  margin-top: 0;
  font-family: 'Caveat', cursive;
  font-size: 1.75rem;
  color: #3c3226;
}

.settings__field {
  display: block;
  margin-bottom: 0.9rem;
}

.settings__field span {
  display: block;
  font-size: 0.85rem;
  color: #6b5f4f;
  margin-bottom: 0.25rem;
}

.settings__field input,
.settings__field select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #d8cdb8;
  font-size: 0.95rem;
}

.settings__save {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: #5b7fb0;
  color: white;
  cursor: pointer;
}

.settings__save:disabled {
  opacity: 0.6;
  cursor: default;
}

.settings__saved {
  margin-left: 0.75rem;
  color: #2e7d32;
  font-weight: 600;
}
</style>
