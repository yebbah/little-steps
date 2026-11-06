import { expect, test } from 'vitest'
import { DOMAIN_FAMILIES, domainTint } from './domainTint.ts'

test('[P1] the four named cases from the story', () => {
  expect(domainTint('social interaction and play')).toBe('joint-attention')
  expect(domainTint('early motor and sensory skills')).toBe('motor-imitation')
  expect(domainTint('oral-motor')).toBe('sensory')
  expect(domainTint('Cooking skills')).toBe('other')
})

test('[P1] the longest keyword wins over a shorter one', () => {
  expect(domainTint('play and language')).toBe('communication')
  expect(domainTint('gross motor play')).toBe('motor-imitation')
})

test('[P1] equal length goes to the family higher in the table', () => {
  // "fine motor" (motor-imitation) and "oral-motor" (sensory) are both 10 characters
  expect(domainTint('fine motor and oral-motor')).toBe('motor-imitation')
  // "social" and "speech" are both 6 characters; joint attention is higher in the table
  expect(domainTint('speech and social')).toBe('joint-attention')
})

test('[P1] keywords match whole words only', () => {
  expect(domainTint('playground')).toBe('other')
  expect(domainTint('socially awkward')).toBe('other')
  expect(domainTint('motorbike')).toBe('other')
})

test('[P1] case and punctuation do not matter', () => {
  expect(domainTint('SPEECH')).toBe('communication')
  expect(domainTint('Emotional Regulation!')).toBe('regulation')
  expect(domainTint('Language, play')).toBe('communication')
  expect(domainTint('Joint   attention')).toBe('joint-attention')
  expect(domainTint('(play)')).toBe('play')
})

test('[P1] empty and whitespace input is other', () => {
  expect(domainTint('')).toBe('other')
  expect(domainTint('   \n\t')).toBe('other')
})

test('[P1] every family is reachable', () => {
  const samples = ['social', 'speech', 'imitation', 'play', 'emotional', 'sensory', 'anything']
  expect(samples.map(domainTint)).toEqual([...DOMAIN_FAMILIES])
})

test('[P1] a keyword at the start, end or between punctuation matches', () => {
  expect(domainTint('play')).toBe('play')
  expect(domainTint('fun, play')).toBe('play')
  expect(domainTint('Speech.')).toBe('communication')
})
