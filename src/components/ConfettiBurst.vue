<script setup>
const COLORS = ['#c1272d', '#2e7d32', '#f7c948', '#5b7fb0', '#e8734a', '#ffffff']
const COUNT = 70

const pieces = Array.from({ length: COUNT }, () => {
  const size = 6 + Math.random() * 6
  return {
    left: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: size,
    height: size * 0.4,
    duration: 2.4 + Math.random() * 1.8,
    delay: Math.random() * 0.4,
    rotation: Math.random() * 360 + 360,
    drift: (Math.random() - 0.5) * 140,
    radius: Math.random() > 0.5 ? '50%' : '2px',
  }
})
</script>

<template>
  <div class="confetti" aria-hidden="true">
    <span
      v-for="(p, i) in pieces"
      :key="i"
      class="confetti__piece"
      :style="{
        left: p.left + '%',
        width: p.width + 'px',
        height: p.height + 'px',
        backgroundColor: p.color,
        borderRadius: p.radius,
        animationDuration: p.duration + 's',
        animationDelay: p.delay + 's',
        '--rot': p.rotation + 'deg',
        '--drift': p.drift + 'px',
      }"
    />
  </div>
</template>

<style scoped>
.confetti {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 200;
}

.confetti__piece {
  position: absolute;
  top: -8%;
  opacity: 0;
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation-fill-mode: forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift), 115vh) rotate(var(--rot));
    opacity: 0.9;
  }
}
</style>
