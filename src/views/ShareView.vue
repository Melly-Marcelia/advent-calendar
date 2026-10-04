<script setup>
import { computed, onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'
import { publicAssetUrl } from '../lib/storage'
import { builtInDefaultImage, builtInHoverImage } from '../data/builtInTheme'
import PageShell from '../components/PageShell.vue'
import AdventCalendar from '../components/AdventCalendar.vue'

const props = defineProps({
  shareToken: { type: String, required: true },
})

const calendar = ref(null)
const loadError = ref(false)

const frames = computed(() => {
  if (!calendar.value) return []
  return calendar.value.frames.map((f) => ({
    day: f.day,
    message: f.message,
    defaultImage: f.default_image_path ? publicAssetUrl(f.default_image_path) : builtInDefaultImage(f.day),
    hoverImage: f.hover_image_path ? publicAssetUrl(f.hover_image_path) : builtInHoverImage(f.day),
    giftImage: f.gift_image_path ? publicAssetUrl(f.gift_image_path) : null,
    giftCode: f.gift_code_path ? publicAssetUrl(f.gift_code_path) : null,
    unlockDate:
      calendar.value.unlock_mode === 'always' ? null : new Date(calendar.value.year, 11, f.day),
  }))
})

onMounted(async () => {
  const { data, error } = await supabase.rpc('get_calendar_by_share_token', { p_token: props.shareToken })
  if (error || !data) {
    loadError.value = true
    return
  }
  calendar.value = data
})
</script>

<template>
  <PageShell v-if="calendar" :title="calendar.title" :subtitle="calendar.subtitle">
    <AdventCalendar :frames="frames" />
  </PageShell>
  <PageShell v-else-if="loadError" title="Calendar not found">
    <p class="not-found">This link doesn't match any calendar. Double-check the link and try again.</p>
  </PageShell>
</template>

<style scoped>
.not-found {
  text-align: center;
  color: #6b5f4f;
}
</style>
