import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/globals.css'), 'utf8')

describe('canvas dot token', () => {
  it('uses the reduced opacity in light and dark mode', () => {
    const opacities = [...css.matchAll(/--canvas-dot: color-mix\(in oklab,.*? (\d+(?:\.\d+)?)%, transparent\);/g)].map(
      (match) => Number(match[1])
    )

    expect(opacities).toEqual([12, 8])
  })
})
