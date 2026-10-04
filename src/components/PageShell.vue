<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  center: { type: Boolean, default: false }, // vertically centers short content (e.g. the landing page)
})
</script>

<template>
  <div class="shell" :class="{ 'shell--center': center }">
    <header class="shell__header">
      <h1 class="shell__title">{{ title }}</h1>
      <p v-if="subtitle" class="shell__subtitle">{{ subtitle }}</p>
    </header>
    <main class="shell__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.shell {
  position: relative;
  padding: clamp(1.5rem, 5vw, 3.5rem) clamp(1rem, 4vw, 2rem) 4rem;
}

.shell__header {
  position: relative;
  text-align: center;
  margin-bottom: clamp(2rem, 5vw, 3.5rem);
}

.shell__title {
  font-family: 'Caveat', cursive;
  font-size: clamp(2.5rem, 6vw, 4rem);
  color: #3c3226;
  margin: 0;
}

.shell__subtitle {
  font-family: 'Caveat', cursive;
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  color: #6b5f4f;
  margin: 0.25rem 0 0;
}

.shell__main {
  position: relative;
}

.shell--center {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
