// The bundled door artwork, used as the default theme for any calendar that
// hasn't uploaded its own (see EditView's "Upload a new theme" section).
const defaultImages = import.meta.glob('../assets/frames/day*-default.png', {
  eager: true,
  import: 'default',
})
const hoverImages = import.meta.glob('../assets/frames/day*-hover.png', {
  eager: true,
  import: 'default',
})

function imageFor(map, day) {
  const key = Object.keys(map).find((path) => path.includes(`day${String(day).padStart(2, '0')}-`))
  return map[key]
}

export function builtInDefaultImage(day) {
  return imageFor(defaultImages, day)
}

export function builtInHoverImage(day) {
  return imageFor(hoverImages, day)
}
