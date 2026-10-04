<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { uploadCalendarAsset, publicAssetUrl, removeCalendarAsset, removeCalendarFolder } from '../lib/storage'
import { compressImage } from '../lib/imageCompression'
import { builtInDefaultImage } from '../data/builtInTheme'
import PageShell from '../components/PageShell.vue'
import LinksPanel from '../components/edit/LinksPanel.vue'
import CalendarSettingsForm from '../components/edit/CalendarSettingsForm.vue'
import ThemeUploader from '../components/edit/ThemeUploader.vue'
import DayCard from '../components/edit/DayCard.vue'

const props = defineProps({
  editToken: { type: String, required: true },
})

const router = useRouter()

const calendar = ref(null)
const loadError = ref(false)
const deleting = ref(false)

const settings = reactive({ title: '', subtitle: '', unlockMode: 'date' })
const settingsSaving = ref(false)
const settingsSaved = ref(false)

// day -> { message, giftImageFile, giftCodeFile, giftImagePath, giftCodePath, defaultImagePath,
//          hoverImagePath, saving, saved, savedMessage, savedGiftImagePath, savedGiftCodePath }
const frameState = reactive({})

const themeUploading = ref(false)
const themeError = ref('')
const themeSkipped = ref([])

const savingAll = ref(false)

const shareUrl = computed(() => (calendar.value ? `${location.origin}/s/${calendar.value.share_token}` : ''))
const editUrl = computed(() => (calendar.value ? `${location.origin}/e/${calendar.value.edit_token}` : ''))

const filledCount = computed(
  () => Object.values(frameState).filter((s) => s.message.trim() || s.giftImagePath).length
)

function isDirty(day) {
  const s = frameState[day]
  if (!s) return false
  return (
    s.message !== s.savedMessage ||
    s.giftImagePath !== s.savedGiftImagePath ||
    s.giftCodePath !== s.savedGiftCodePath ||
    !!s.giftImageFile ||
    !!s.giftCodeFile
  )
}

const dirtyDays = computed(() => Array.from({ length: 24 }, (_, i) => i + 1).filter(isDirty))

function onBeforeUnload(e) {
  if (dirtyDays.value.length === 0) return
  e.preventDefault()
  e.returnValue = ''
}

async function loadCalendar() {
  const { data, error } = await supabase.rpc('get_calendar_by_edit_token', { p_token: props.editToken })
  if (error || !data) {
    loadError.value = true
    return
  }
  calendar.value = data
  settings.title = data.title
  settings.subtitle = data.subtitle
  settings.unlockMode = data.unlock_mode

  for (const f of data.frames) {
    frameState[f.day] = {
      message: f.message ?? '',
      giftImageFile: null,
      giftCodeFile: null,
      giftImagePath: f.gift_image_path,
      giftCodePath: f.gift_code_path,
      defaultImagePath: f.default_image_path,
      hoverImagePath: f.hover_image_path,
      saving: false,
      saved: false,
      savedMessage: f.message ?? '',
      savedGiftImagePath: f.gift_image_path,
      savedGiftCodePath: f.gift_code_path,
    }
  }
}

onMounted(() => {
  loadCalendar()
  window.addEventListener('beforeunload', onBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnload)
})

function doorPreview(day) {
  const s = frameState[day]
  if (!s) return null
  return s.defaultImagePath ? publicAssetUrl(s.defaultImagePath) : builtInDefaultImage(day)
}

async function saveSettings() {
  settingsSaving.value = true
  settingsSaved.value = false
  const { error } = await supabase.rpc('update_calendar_settings', {
    p_edit_token: props.editToken,
    p_title: settings.title,
    p_subtitle: settings.subtitle,
    p_unlock_mode: settings.unlockMode,
  })
  settingsSaving.value = false
  if (!error) settingsSaved.value = true
}

async function deleteCalendar() {
  deleting.value = true
  try {
    await removeCalendarFolder(calendar.value.id, props.editToken)
    const { error } = await supabase.rpc('delete_calendar', { p_edit_token: props.editToken })
    if (error) throw error
    router.push({ name: 'create' })
  } catch {
    deleting.value = false
    window.alert("Couldn't delete the calendar — try again in a moment.")
  }
}

async function saveFrame(day) {
  const s = frameState[day]
  s.saving = true
  s.saved = false

  try {
    if (s.giftImageFile) {
      const compressed = await compressImage(s.giftImageFile)
      const ext = compressed.name.split('.').pop()
      s.giftImagePath = await uploadCalendarAsset(
        calendar.value.id,
        props.editToken,
        compressed,
        `gifts/day${String(day).padStart(2, '0')}-gift.${ext}`
      )
      s.giftImageFile = null
    }
    if (s.giftCodeFile) {
      const compressed = await compressImage(s.giftCodeFile)
      const ext = compressed.name.split('.').pop()
      s.giftCodePath = await uploadCalendarAsset(
        calendar.value.id,
        props.editToken,
        compressed,
        `gifts/day${String(day).padStart(2, '0')}-code.${ext}`
      )
      s.giftCodeFile = null
    }

    const { error } = await supabase.rpc('update_frame', {
      p_edit_token: props.editToken,
      p_day: day,
      p_message: s.message,
      p_gift_image_path: s.giftImagePath,
      p_gift_code_path: s.giftCodePath,
      p_default_image_path: null,
      p_hover_image_path: null,
    })
    if (!error) {
      s.saved = true
      s.savedMessage = s.message
      s.savedGiftImagePath = s.giftImagePath
      s.savedGiftCodePath = s.giftCodePath
    }
  } finally {
    s.saving = false
  }
}

async function saveAllChanged() {
  savingAll.value = true
  try {
    for (const day of dirtyDays.value) {
      await saveFrame(day)
    }
  } finally {
    savingAll.value = false
  }
}

async function removeGiftImage(day) {
  const s = frameState[day]
  const oldPath = s.giftImagePath
  s.giftImagePath = null
  s.giftImageFile = null
  await supabase.rpc('update_frame', {
    p_edit_token: props.editToken,
    p_day: day,
    p_message: null,
    p_gift_image_path: '', // empty string, not null — null is "leave unchanged" in update_frame
    p_gift_code_path: null,
    p_default_image_path: null,
    p_hover_image_path: null,
  })
  s.savedGiftImagePath = null
  if (oldPath) await removeCalendarAsset(oldPath)
}

async function removeGiftCode(day) {
  const s = frameState[day]
  const oldPath = s.giftCodePath
  s.giftCodePath = null
  s.giftCodeFile = null
  await supabase.rpc('update_frame', {
    p_edit_token: props.editToken,
    p_day: day,
    p_message: null,
    p_gift_image_path: null,
    p_gift_code_path: '',
    p_default_image_path: null,
    p_hover_image_path: null,
  })
  s.savedGiftCodePath = null
  if (oldPath) await removeCalendarAsset(oldPath)
}

const THEME_FILE_PATTERN = /day(\d{2})-(default|hover)\.(png|jpe?g|svg)$/i

async function handleThemeFiles(event) {
  const files = Array.from(event.target.files ?? [])
  themeError.value = ''
  themeSkipped.value = []
  themeUploading.value = true

  const byDay = {}
  for (const file of files) {
    const match = file.name.match(THEME_FILE_PATTERN)
    if (!match) {
      themeSkipped.value.push(file.name)
      continue
    }
    const day = parseInt(match[1], 10)
    const state = match[2].toLowerCase()
    if (day < 1 || day > 24) {
      themeSkipped.value.push(file.name)
      continue
    }
    byDay[day] ??= {}
    byDay[day][state] = file
  }

  try {
    for (const [dayStr, states] of Object.entries(byDay)) {
      const day = parseInt(dayStr, 10)
      let defaultPath = null
      let hoverPath = null

      if (states.default) {
        const compressed = await compressImage(states.default)
        const ext = compressed.name.split('.').pop()
        defaultPath = await uploadCalendarAsset(
          calendar.value.id,
          props.editToken,
          compressed,
          `theme/day${String(day).padStart(2, '0')}-default.${ext}`
        )
      }
      if (states.hover) {
        const compressed = await compressImage(states.hover)
        const ext = compressed.name.split('.').pop()
        hoverPath = await uploadCalendarAsset(
          calendar.value.id,
          props.editToken,
          compressed,
          `theme/day${String(day).padStart(2, '0')}-hover.${ext}`
        )
      }

      const { error } = await supabase.rpc('update_frame', {
        p_edit_token: props.editToken,
        p_day: day,
        p_message: null,
        p_gift_image_path: null,
        p_gift_code_path: null,
        p_default_image_path: defaultPath,
        p_hover_image_path: hoverPath,
      })
      if (error) throw error

      if (defaultPath) frameState[day].defaultImagePath = defaultPath
      if (hoverPath) frameState[day].hoverImagePath = hoverPath
    }
  } catch {
    themeError.value = 'Something went wrong uploading the theme. Please try again.'
  } finally {
    themeUploading.value = false
    event.target.value = ''
  }
}
</script>

<template>
  <PageShell v-if="calendar" title="Your calendar dashboard">
    <div class="dash">
      <LinksPanel :share-url="shareUrl" :edit-url="editUrl" :deleting="deleting" @delete="deleteCalendar" />

      <details class="dash__advanced">
        <summary>Calendar settings &amp; theme</summary>
        <div class="dash__advanced-body">
          <CalendarSettingsForm
            v-model="settings"
            :saving="settingsSaving"
            :saved="settingsSaved"
            @save="saveSettings"
          />

          <ThemeUploader
            :uploading="themeUploading"
            :error="themeError"
            :skipped="themeSkipped"
            @files-selected="handleThemeFiles"
          />
        </div>
      </details>

      <section class="dash__section">
        <div class="dash__days-header">
          <div>
            <h2>Days</h2>
            <p class="dash__progress">{{ filledCount }} of 24 days have content</p>
          </div>
          <button
            type="button"
            class="dash__save-all"
            :disabled="savingAll || dirtyDays.length === 0"
            @click="saveAllChanged"
          >
            {{ savingAll ? 'Saving…' : `Save all changed (${dirtyDays.length})` }}
          </button>
        </div>
        <div class="dash__days">
          <DayCard
            v-for="day in 24"
            :key="day"
            :day="day"
            :door-image="doorPreview(day)"
            :frame="frameState[day]"
            :dirty="isDirty(day)"
            @remove-gift-image="removeGiftImage(day)"
            @remove-gift-code="removeGiftCode(day)"
            @save="saveFrame(day)"
          />
        </div>
      </section>
    </div>
  </PageShell>
  <PageShell v-else-if="loadError" title="Calendar not found">
    <p class="not-found">This edit link doesn't match any calendar. Double-check the link.</p>
  </PageShell>
</template>

<style scoped>
.dash {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dash__advanced {
  background: #fdfaf3;
  border-radius: 16px;
  padding: 1rem 1.5rem;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.12);
}

.dash__advanced summary {
  cursor: pointer;
  font-family: 'Caveat', cursive;
  font-size: 1.5rem;
  color: #3c3226;
  padding: 0.25rem 0;
}

.dash__advanced-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.dash__advanced-body :deep(.settings),
.dash__advanced-body :deep(.theme) {
  box-shadow: none;
  padding: 0;
  background: transparent;
}

.dash__section {
  background: #fdfaf3;
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.12);
}

.dash__days-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.dash__section h2 {
  margin: 0;
  font-family: 'Caveat', cursive;
  font-size: 1.75rem;
  color: #3c3226;
}

.dash__progress {
  margin: 0.15rem 0 0;
  color: #6b5f4f;
  font-size: 0.85rem;
}

.dash__save-all {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: #2e7d32;
  color: white;
  cursor: pointer;
  height: fit-content;
}

.dash__save-all:disabled {
  opacity: 0.5;
  cursor: default;
}

.dash__days {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.not-found {
  text-align: center;
  color: #6b5f4f;
}
</style>
