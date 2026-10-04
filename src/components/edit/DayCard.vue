<script setup>
import { computed } from 'vue'
import { publicAssetUrl } from '../../lib/storage'

const props = defineProps({
  day: { type: Number, required: true },
  doorImage: { type: String, default: null },
  frame: { type: Object, required: true }, // { message, giftImageFile, giftCodeFile, giftImagePath, giftCodePath, saving, saved }
  dirty: { type: Boolean, default: false },
})

const emit = defineEmits(['remove-gift-image', 'remove-gift-code', 'save'])

const giftPreview = computed(() => {
  if (props.frame.giftImageFile) return URL.createObjectURL(props.frame.giftImageFile)
  return props.frame.giftImagePath ? publicAssetUrl(props.frame.giftImagePath) : null
})

function onGiftImageChange(e) {
  props.frame.giftImageFile = e.target.files[0] ?? null
}

function onGiftCodeChange(e) {
  props.frame.giftCodeFile = e.target.files[0] ?? null
}
</script>

<template>
  <div class="day-card" :class="{ 'day-card--dirty': dirty }">
    <img v-if="doorImage" class="day-card__door" :src="doorImage" :alt="`Day ${day} door`" />
    <div class="day-card__body">
      <h3>
        Day {{ day }}
        <span v-if="dirty" class="day-card__dirty-dot" title="Unsaved changes">●</span>
      </h3>
      <textarea v-model="frame.message" placeholder="What's the surprise?" rows="2" />

      <label class="day-card__upload">
        <span>Gift image</span>
        <input type="file" accept="image/*" @change="onGiftImageChange" />
      </label>
      <div v-if="giftPreview" class="day-card__preview-row">
        <img class="day-card__preview" :src="giftPreview" alt="" />
        <button type="button" class="day-card__remove" @click="emit('remove-gift-image')">Remove</button>
      </div>

      <label class="day-card__upload">
        <span>Gift code (optional — e.g. a Spotify code)</span>
        <input type="file" accept="image/*" @change="onGiftCodeChange" />
      </label>
      <button
        v-if="frame.giftCodePath || frame.giftCodeFile"
        type="button"
        class="day-card__remove"
        @click="emit('remove-gift-code')"
      >
        Remove gift code
      </button>

      <button type="button" :disabled="frame.saving" @click="emit('save')">
        {{ frame.saving ? 'Saving…' : 'Save day ' + day }}
      </button>
      <span v-if="frame.saved" class="day-card__saved">Saved ✓</span>
    </div>
  </div>
</template>

<style scoped>
.day-card {
  border: 1px solid #eee6d3;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.15s ease;
}

.day-card--dirty {
  border-color: #e0a940;
}

.day-card__dirty-dot {
  color: #e0a940;
  font-size: 0.6rem;
  vertical-align: middle;
}

.day-card__door {
  width: 100%;
  height: 100px;
  object-fit: contain;
}

.day-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.day-card__body h3 {
  margin: 0;
  font-size: 1rem;
}

.day-card textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d8cdb8;
  padding: 0.4rem;
  font-family: inherit;
  font-size: 0.85rem;
  resize: vertical;
}

.day-card__upload {
  display: block;
  font-size: 0.8rem;
}

.day-card__upload span {
  display: block;
  color: #6b5f4f;
  margin-bottom: 0.3rem;
}

.day-card__preview-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-card__preview {
  width: 70%;
  max-height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.day-card__remove {
  padding: 0.3rem 0.6rem;
  border: 1px solid #c1272d;
  border-radius: 6px;
  background: transparent;
  color: #c1272d;
  font-size: 0.75rem;
  cursor: pointer;
}

.day-card button:not(.day-card__remove) {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: #5b7fb0;
  color: white;
  cursor: pointer;
}

.day-card button:not(.day-card__remove):disabled {
  opacity: 0.6;
  cursor: default;
}

.day-card__saved {
  margin-left: 0.5rem;
  color: #2e7d32;
  font-weight: 600;
  font-size: 0.85rem;
}
</style>
