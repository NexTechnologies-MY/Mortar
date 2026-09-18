import { useEffect, useRef, useState } from 'react'
import './HeroFilm.css'

/** Where the clips live: `frontend/public/media`, served from the site root. */
const base = '/media/'

/**
 * The clips the hero runs, in order, looping back to the first. One name per clip; the folder holds a `.webm`, an
 * `.mp4` and a `.jpg` poster under each. Adding a clip is adding a name here.
 *
 * There is one clip today, cropped to 16:7 because the strip along its bottom carried the generator's sparkle, and
 * cropping it was cleaner than painting over the roofs. With one clip the dissolve crosses the clip into itself.
 */
const CLIPS = ['hero-1']

/** How long before a clip ends the next one starts, and how long the two overlap. */
const FADE_S = 0.8

/**
 * Two clips in turn, crossing at the loop point. A single looping video snaps back to its first frame, and the cut
 * is the one moment on the page a reader's eye is drawn to something that is not the argument. The next clip starts
 * under the current one and the current one fades off it, so the seam is a dissolve rather than a jump.
 *
 * Two elements rather than one with a swapped source: a source swap has to buffer, and the buffer is the cut.
 */
export const HeroFilm = ({ still }: { still: boolean }) => {
  const [front, setFront] = useState(0)
  const [at, setAt] = useState(0)
  const players = useRef<(HTMLVideoElement | null)[]>([null, null])

  useEffect(() => {
    if (still) return
    const showing = players.current[front]
    if (!showing) return
    showing.currentTime = 0
    void showing.play().catch(() => {
      /* An autoplay refusal leaves the poster, which is the same picture. */
    })
  }, [front, still])

  if (still) return <img className="hero-frame" src={`${base}${CLIPS[0]}.jpg`} alt="" />

  const next = (at + 1) % CLIPS.length
  const pair = [CLIPS[at], CLIPS[next]]

  /** The other element carries the next clip and is started under this one, `FADE_S` before this one ends. */
  const onTime = (slot: number) => (e: { currentTarget: HTMLVideoElement }) => {
    if (slot !== front) return
    const v = e.currentTarget
    if (!v.duration || v.currentTime < v.duration - FADE_S) return
    const other = players.current[1 - front]
    if (!other?.paused) return
    other.currentTime = 0
    void other.play().catch(() => {})
    setFront(1 - front)
    setAt(next)
  }

  return (
    <>
      {[0, 1].map((slot) => (
        <video
          key={slot}
          ref={(node) => {
            players.current[slot] = node
          }}
          className="hero-frame"
          data-front={slot === front}
          poster={`${base}${CLIPS[0]}.jpg`}
          autoPlay={slot === 0}
          muted
          playsInline
          preload="auto"
          onTimeUpdate={onTime(slot)}
        >
          <source src={`${base}${pair[slot === front ? 0 : 1]}.webm`} type="video/webm" />
          <source src={`${base}${pair[slot === front ? 0 : 1]}.mp4`} type="video/mp4" />
        </video>
      ))}
    </>
  )
}
