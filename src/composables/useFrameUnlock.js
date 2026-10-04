import { computed } from 'vue'

// Set VITE_UNLOCK_ALL_FRAMES=true in .env.local to preview every frame outside December.
const unlockAllOverride = import.meta.env.VITE_UNLOCK_ALL_FRAMES === 'true'

export function useFrameUnlock(unlockDate) {
  const isUnlocked = computed(() => {
    if (unlockAllOverride || !unlockDate) return true
    return new Date() >= unlockDate
  })

  const isToday = computed(() => {
    if (!unlockDate) return false
    const today = new Date()
    return (
      today.getFullYear() === unlockDate.getFullYear() &&
      today.getMonth() === unlockDate.getMonth() &&
      today.getDate() === unlockDate.getDate()
    )
  })

  return { isUnlocked, isToday }
}
