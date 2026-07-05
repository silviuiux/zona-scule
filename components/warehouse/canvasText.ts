'use client'

// Draws signage text onto a 2D canvas and returns a THREE.CanvasTexture.
// This lets in-scene signs use the site's real display font (Bungee, already
// loaded by the root layout) without shipping SDF font assets.
import * as THREE from 'three'

export function makeSignTexture({
  text,
  subtext,
  width = 1024,
  height = 256,
  background = '#d92c2b',
  color = '#ffffff',
  font = 'Bungee',
}: {
  text: string
  subtext?: string
  width?: number
  height?: number
  background?: string
  color?: string
  font?: string
}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)
  // subtle top/bottom rails so signs read as physical objects
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(0, 0, width, 8)
  ctx.fillRect(0, height - 8, width, 8)

  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const mainY = subtext ? height * 0.4 : height / 2
  let size = Math.floor(height * (subtext ? 0.34 : 0.42))
  ctx.font = `${size}px '${font}', sans-serif`
  // shrink-to-fit
  while (size > 16 && ctx.measureText(text.toUpperCase()).width > width * 0.9) {
    size -= 4
    ctx.font = `${size}px '${font}', sans-serif`
  }
  ctx.fillText(text.toUpperCase(), width / 2, mainY)

  if (subtext) {
    ctx.font = `${Math.floor(height * 0.16)}px 'Inter', sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(subtext, width / 2, height * 0.74)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
