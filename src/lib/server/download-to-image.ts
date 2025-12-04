// utils/downloadCardAsImage.ts
import { toPng, toJpeg, toBlob } from 'html-to-image'

export async function downloadCardAsImage(elementId: string, filename?: string, format: 'png' | 'jpeg' = 'png') {
  const element = document.getElementById(elementId)

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  try {
    const dataUrl =
      format === 'png'
        ? await toPng(element, {
            quality: 1,
            pixelRatio: 4,
            cacheBust: true,
          })
        : await toJpeg(element, {
            quality: 0.95,
            pixelRatio: 4,
            cacheBust: true,
          })

    const link = document.createElement('a')
    link.download = filename || `daily-report-${new Date().toISOString().split('T')[0]}.${format}`
    link.href = dataUrl
    link.click()
  } catch (error) {
    console.error('Failed to download image:', error)
    throw error
  }
}

// Alternative: Get blob for more control
export async function getCardAsBlob(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId)

  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`)
  }

  const output = await toBlob(element, {
    quality: 1,
    pixelRatio: 2,
    cacheBust: true,
  })

  if (!output) throw new Error('Failed to generate image blob.')

  return output
}
