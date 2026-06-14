const MAX_DIMENSION = 1200
const TARGET_MAX_BYTES = 900_000
const SKIP_REENCODE_BELOW = 450_000

/** Resize and compress profile photos before upload (phone cameras often send 3–8 MB). */
export async function compressAvatarImage(file: File): Promise<File> {
  if (file.type === 'image/gif') {
    if (file.size <= 2 * 1024 * 1024) return file
    throw new Error('GIF is too large. Please use a JPEG or PNG photo.')
  }

  if (
    file.size <= SKIP_REENCODE_BELOW &&
    /^image\/(jpeg|jpg|webp|png)$/i.test(file.type)
  ) {
    return file
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    if (file.size <= 2 * 1024 * 1024) return file
    throw new Error('Could not read this photo. Try saving as JPEG or pick a different image.')
  }

  const longest = Math.max(bitmap.width, bitmap.height)
  const scale = longest > MAX_DIMENSION ? MAX_DIMENSION / longest : 1
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close?.()
    throw new Error('Could not process photo')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  let quality = 0.88
  let blob: Blob | null = null
  for (let attempt = 0; attempt < 6; attempt++) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality)
    })
    if (blob && blob.size <= TARGET_MAX_BYTES) break
    quality -= 0.1
  }

  if (!blob) {
    throw new Error('Could not compress photo. Try a different image.')
  }

  return new File([blob], 'avatar.jpg', { type: 'image/jpeg', lastModified: Date.now() })
}
