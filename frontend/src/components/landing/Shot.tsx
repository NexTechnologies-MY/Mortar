/**
 * One screenshot figure for the landing: the same capture in both themes,
 * captioned as evidence. Because the theme is a class on <html> rather than a
 * media query, both copies ship in the markup and CSS picks the one to paint;
 * the dark copy is decorative duplication, so it is hidden from assistive
 * technology.
 */

type ShotProps = {
  /** Basename under /public/landing — the files are `<base>-light.webp` and `<base>-dark.webp`. */
  base: string
  /** Natural dimensions of the capture, for aspect ratio before load. */
  width: number
  height: number
  alt: string
  caption: string
  className?: string
}

/** Renders one themed screenshot with its caption. */
export function Shot({ base, width, height, alt, caption, className }: ShotProps) {
  return (
    <figure className={`land-shot${className ? ` ${className}` : ''}`}>
      <div className="land-shot-frame">
        <img className="land-img d-light" src={`/landing/${base}-light.webp`} width={width} height={height} alt={alt} />
        <img
          className="land-img d-dark"
          src={`/landing/${base}-dark.webp`}
          width={width}
          height={height}
          alt=""
          aria-hidden="true"
        />
      </div>
      <figcaption className="land-cap">{caption}</figcaption>
    </figure>
  )
}
