# Advent Calendar

A wall of 24 hanging picture frames, one per December day, built with Vue 3 + Vite from the
[Figma prototype](https://www.figma.com/design/ZL236Ych7Vv7VZv85JYsIm/Side-Fun-Project---Advent-Calendar).

## Stack

- Vue 3 (`<script setup>`, Composition API)
- Vite

## Project structure

```
src/
  assets/frames/        frame artwork exported from Figma (default + hover state per day)
  components/
    AdventCalendar.vue   grid of all 24 frames + modal wiring
    AdventFrame.vue        a single frame: default/hover art swap, lock state
    FrameModal.vue          the "opened frame" overlay
    BackgroundStars.vue     decorative scattered star field
  composables/
    useFrameUnlock.js        date-based lock logic per frame
  data/
    frames.js               frame metadata (day, images, unlock date, content)
```

## Frame unlock logic

Each frame unlocks on its matching December date (`useFrameUnlock.js`). To preview every frame
outside of December during development, `.env.local` sets:

```
VITE_UNLOCK_ALL_FRAMES=true
```

Remove or set to `false` before shipping the real, date-gated calendar.

## Content

Each frame's title/message lives in `src/data/frames.js` — replace the placeholder text with the
actual daily content when it's ready.

## Getting started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```
