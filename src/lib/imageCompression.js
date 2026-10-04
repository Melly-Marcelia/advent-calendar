const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.85

// Downscales large photos before upload so recipients aren't waiting on
// multi-MB files. SVGs and already-small images pass through untouched.
export async function compressImage(file) {
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size < 1_500_000) return file // already small enough

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

  const keepsAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif'
  const outputType = keepsAlpha ? 'image/png' : 'image/jpeg'

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outputType, JPEG_QUALITY))
  if (!blob) return file

  const ext = outputType === 'image/png' ? 'png' : 'jpg'
  const newName = file.name.replace(/\.\w+$/, '') + `.${ext}`
  return new File([blob], newName, { type: outputType })
}
