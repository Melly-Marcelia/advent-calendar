<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import PageShell from '../components/PageShell.vue'
import demoButtonImage from '../assets/decor/demo-button.png'

const router = useRouter()
const creating = ref(false)
const errorMessage = ref('')

async function createCalendar() {
  creating.value = true
  errorMessage.value = ''
  const { data, error } = await supabase.rpc('create_calendar')
  creating.value = false

  if (error || !data?.[0]) {
    errorMessage.value = "Couldn't create a calendar right now — try again in a moment."
    return
  }

  router.push({ name: 'edit', params: { editToken: data[0].edit_token } })
}
</script>

<template>
  <PageShell center title="Advent Calendar" subtitle="Build a 24-door surprise for someone, with no account needed">
    <router-link :to="{ name: 'demo' }" class="create__demo">
      <img :src="demoButtonImage" alt="I want to see the demo" />
    </router-link>
    <div class="create">
      <div class="create__actions">
        <button type="button" class="create__button" :disabled="creating" @click="createCalendar">
          {{ creating ? 'Creating…' : 'Create your calendar' }}
        </button>
      </div>
      <p v-if="errorMessage" class="create__error">{{ errorMessage }}</p>
      <p class="create__hint">
        You'll get an edit link (keep it private) and a share link (send it to whoever the calendar is for).
        There's no login, so the edit link is the only way back in — save it somewhere safe.
      </p>
    </div>
  </PageShell>
</template>

<style scoped>
.create {
  max-width: 440px;
  margin: 0 auto;
  text-align: center;
}

.create__button {
  padding: 0.9rem 2rem;
  border: none;
  border-radius: 999px;
  background: #5b7fb0;
  color: #fdfaf3;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(35, 30, 20, 0.2);
}

.create__button:hover:not(:disabled) {
  background: #4a6a97;
}

.create__button:disabled {
  opacity: 0.6;
  cursor: default;
}

.create__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.create__demo {
  position: fixed;
  top: clamp(0.25rem, 1.5vw, 0.75rem);
  right: clamp(2.5rem, 9vw, 5rem);
  display: inline-block;
  transition: transform 0.15s ease;
  z-index: 10;
}

.create__demo img {
  width: clamp(120px, 12vw, 170px);
  display: block;
  filter: drop-shadow(0 4px 8px rgba(35, 30, 20, 0.15));
}

.create__demo:hover {
  transform: scale(1.05);
}

.create__error {
  color: #c1272d;
  margin-top: 1rem;
}

.create__hint {
  margin-top: 1.5rem;
  color: #6b5f4f;
  line-height: 1.5;
}
</style>
