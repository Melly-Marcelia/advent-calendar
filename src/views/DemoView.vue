<script setup>
import { computed } from 'vue'
import { frames as demoFrames } from '../data/frames'
import PageShell from '../components/PageShell.vue'
import AdventCalendar from '../components/AdventCalendar.vue'

// Always unlocked — this is a showcase, not a real countdown.
const frames = computed(() => demoFrames.map((f) => ({ ...f, unlockDate: null })))
</script>

<template>
  <PageShell title="Advent Calendar" subtitle="Open one frame each day of December to reveal a little surprise">
    <AdventCalendar :frames="frames" varied-sizes />
  </PageShell>
</template>
