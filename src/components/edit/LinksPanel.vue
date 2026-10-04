<script setup>
import { ref } from 'vue'

defineProps({
  shareUrl: { type: String, required: true },
  editUrl: { type: String, required: true },
  deleting: { type: Boolean, default: false },
})

const emit = defineEmits(['delete'])

const copiedShare = ref(false)
const copiedEdit = ref(false)

async function copy(text, flag) {
  try {
    await navigator.clipboard.writeText(text)
    flag.value = true
    setTimeout(() => (flag.value = false), 1500)
  } catch {
    // clipboard API unavailable; the link is still selectable/visible on screen
  }
}

function requestDelete() {
  if (window.confirm('Delete this calendar permanently? This removes all its content and cannot be undone.')) {
    emit('delete')
  }
}
</script>

<template>
  <section class="links">
    <p class="links__warning">
      There's no login — these links are the only way to access this calendar. Save the edit link
      somewhere safe; it can't be recovered if lost.
    </p>
    <label class="links__row">
      <span>Share link (send this to them)</span>
      <div class="links__input">
        <input type="text" readonly :value="shareUrl" />
        <button type="button" @click="copy(shareUrl, copiedShare)">{{ copiedShare ? 'Copied ✓' : 'Copy' }}</button>
        <a class="links__preview" :href="shareUrl" target="_blank" rel="noopener">Preview</a>
      </div>
    </label>
    <label class="links__row">
      <span>Edit link (keep this private)</span>
      <div class="links__input">
        <input type="text" readonly :value="editUrl" />
        <button type="button" @click="copy(editUrl, copiedEdit)">{{ copiedEdit ? 'Copied ✓' : 'Copy' }}</button>
      </div>
    </label>

    <button type="button" class="links__delete" :disabled="deleting" @click="requestDelete">
      {{ deleting ? 'Deleting…' : 'Delete this calendar' }}
    </button>
  </section>
</template>

<style scoped>
.links {
  background: #fdfaf3;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.12);
}

.links__warning {
  margin: 0 0 1rem;
  color: #c1272d;
  font-weight: 600;
}

.links__row {
  display: block;
  margin-bottom: 0.75rem;
}

.links__row span {
  display: block;
  font-size: 0.85rem;
  color: #6b5f4f;
  margin-bottom: 0.25rem;
}

.links__input {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.links__input input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #d8cdb8;
  font-size: 0.85rem;
}

.links__input button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #5b7fb0;
  color: white;
  cursor: pointer;
  white-space: nowrap;
}

.links__preview {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: #eee6d3;
  color: #3c3226;
  text-decoration: none;
  font-size: 0.85rem;
  white-space: nowrap;
}

.links__delete {
  margin-top: 0.5rem;
  padding: 0.5rem 1.25rem;
  border: 1px solid #c1272d;
  border-radius: 8px;
  background: transparent;
  color: #c1272d;
  cursor: pointer;
}

.links__delete:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
