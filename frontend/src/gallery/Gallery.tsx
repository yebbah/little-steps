import { useState } from 'react'
import { applyTheme, readThemeChoice, type ThemeChoice } from '../styles/theme.ts'
import tokensCss from '../styles/tokens.css?raw'
import styles from './Gallery.module.css'
import { g, sample } from './strings.ts'

// Reads the token sheet itself, so a token added to tokens.css shows up here without a gallery edit.
const colours = [...tokensCss.matchAll(/^\s+--([\w-]+):\s*(#[0-9A-Fa-f]{6,8})\s*;/gm)]
  .map(([, name, value]) => [name, value] as const)
  .filter(([name]) => !name.endsWith('-dark'))
  .map(([name, light]) => [name, light, tokensCss.match(new RegExp(`--${name}-dark:\\s*(#[0-9A-Fa-f]{6,8})`))?.[1] ?? light] as const)

const typeTokens = ['display', 'title', 'heading', 'section-label', 'body', 'body-sm', 'cue', 'label', 'meta']
const spacingTokens = [...tokensCss.matchAll(/^\s+--(space-[\w-]+):\s*(\d+px)\s*;/gm)].map(([, name, value]) => [name, value] as const)
const radiusTokens = [...tokensCss.matchAll(/^\s+--(radius-[\w-]+):\s*(\d+px)\s*;/gm)].map(([, name, value]) => [name, value] as const)

export function Gallery() {
  const [mode, setMode] = useState<ThemeChoice>(readThemeChoice)
  // The toggle changes the page for this visit only; the stored choice belongs to Settings (Story 2.9).
  const choose = (choice: ThemeChoice) => {
    setMode(choice)
    applyTheme(choice)
  }

  return (
    <main className={styles.page}>
      <h1 className="type-title">{g('title')}</h1>
      <p className="type-body">{g('intro')}</p>

      <div className={styles.toggle} role="group" aria-label={g('themeLabel')}>
        <button type="button" aria-pressed={mode === 'light'} onClick={() => choose('light')}>
          {g('light')}
        </button>
        <button type="button" aria-pressed={mode === 'dark'} onClick={() => choose('dark')}>
          {g('dark')}
        </button>
        <button type="button" aria-pressed={mode === 'system'} onClick={() => choose('system')}>
          {g('system')}
        </button>
      </div>

      <section className={styles.section} aria-labelledby="gallery-colours">
        <h2 id="gallery-colours" className="type-heading">
          {g('colours')}
        </h2>
        <p className="type-body-sm">{g('coloursHint')}</p>
        <ul className={styles.swatches}>
          {colours.map(([name, light, dark]) => (
            <li key={name} className={styles.swatch}>
              <span className={styles.chip} style={{ background: light }} />
              <span className={styles.chip} style={{ background: dark }} />
              <span className={`${styles.name} type-meta`}>
                {name} {light} {dark}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="gallery-type">
        <h2 id="gallery-type" className="type-heading">
          {g('type')}
        </h2>
        {typeTokens.map((name) => (
          <p key={name} className={`type-${name}`}>
            {sample(name)}
          </p>
        ))}
      </section>

      <section className={styles.section} aria-labelledby="gallery-spacing">
        <h2 id="gallery-spacing" className="type-heading">
          {g('spacing')}
        </h2>
        <ul className={styles.bars}>
          {spacingTokens.map(([name, value]) => (
            <li key={name}>
              <span className="type-meta">
                {name} {value}
              </span>
              <div className={styles.bar} style={{ width: `min(100%, var(--${name}))` }} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="gallery-radii">
        <h2 id="gallery-radii" className="type-heading">
          {g('radii')}
        </h2>
        <ul className={styles.radii}>
          {radiusTokens.map(([name, value]) => (
            <li key={name}>
              <div className={styles.radius} style={{ borderRadius: `var(--${name})` }} />
              <span className="type-meta">
                {name} {value}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
