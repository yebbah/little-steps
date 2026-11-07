// Renders public/icons/app-icon.svg to the PNG sizes browsers need (manifest and iOS home screen).
// Run by hand when the SVG changes:  npm run icons   (uses the Playwright Chromium already in dev dependencies).
import { chromium } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('../public/icons/', import.meta.url))
const svg = readFileSync(`${dir}app-icon.svg`, 'utf8')
const sizes = { 'icon-192.png': 192, 'icon-512.png': 512, 'icon-maskable-512.png': 512, 'apple-touch-icon.png': 180 }

const browser = await chromium.launch()
try {
  for (const [file, size] of Object.entries(sizes)) {
    const page = await browser.newPage({ viewport: { width: size, height: size } })
    await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
    writeFileSync(`${dir}${file}`, await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: size, height: size } }))
    await page.close()
  }
} finally {
  await browser.close()
}
