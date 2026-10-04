<script setup>
import starImage from '../assets/decor/star.png'

// Deterministic scattered star field — varied sizes, sparse, random placement.
const STAR_COUNT = 11

function seededRandom(seed) {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

const rand = seededRandom(7)

const stars = Array.from({ length: STAR_COUNT }, () => ({
  top: `${rand() * 100}%`,
  left: `${rand() * 100}%`,
  size: 16 + rand() * 58, // small (16px) to large (74px)
  rotation: rand() * 360 - 180,
  opacity: 0.5 + rand() * 0.5,
}))
</script>

<template>
  <div class="stars" aria-hidden="true">
    <img
      v-for="(star, i) in stars"
      :key="i"
      :src="starImage"
      class="stars__star"
      :style="{
        top: star.top,
        left: star.left,
        width: star.size + 'px',
        opacity: star.opacity,
        transform: `rotate(${star.rotation}deg)`,
      }"
      alt=""
    />
  </div>
</template>

<style scoped>
.stars {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.stars__star {
  position: absolute;
}
</style>
