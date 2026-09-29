import { Fragment, type CSSProperties, type ReactNode } from 'react'
import Image from 'next/image'

/**
 * The editorial building blocks shared by the Zona Soluții stories and the
 * product pages (styled by STORY_CSS, animated by StoryMotion): numbered
 * chapters whose titles rise word by word, step sequences that light up one
 * step at a time, full-bleed photos that open as they scroll in, and the
 * pinned first photo that grows to the whole screen.
 *
 * `editorial()` returns a fresh set per page, so chapter numbers restart.
 */
export const pad = (i: number) => String(i + 1).padStart(2, '0')
export const stagger = (i: number) => ({ ['--i' as string]: i }) as CSSProperties

// each word in its own mask, so a title can rise into view word by word
export const words = (t: string) => t.split(' ').map((w, k, all) => (
  <Fragment key={k}><span className="zs-w"><span style={{ '--w': k } as CSSProperties}>{w}</span></span>{k < all.length - 1 ? ' ' : ''}</Fragment>
))

export function editorial() {
  // numbered chapters: "01 — Șurubelnițe izolate…"
  let chapterNo = 0
  const chapter = (title: string, text?: string, aside?: ReactNode) => {
    chapterNo++
    return (
      <header className="zs-chapter" data-reveal>
        <span className="zs-chapter-n">{String(chapterNo).padStart(2, '0')}</span>
        <div className="zs-chapter-main">
          <h2 className="zs-chapter-title">{words(title)}</h2>
          {text && <p className="zs-chapter-text">{text}</p>}
        </div>
        {aside}
      </header>
    )
  }

  // a sequence that lights up one step at a time as it scrolls past
  const sequence = ({ label, lead, steps, big }: { label: string; lead: string; steps: { title: string; text: string }[]; big?: boolean }) => (
    <div className="zs-seq" data-steps>
      <div className="zs-seq-side">
        <div className="zs-seq-sticky">
          <span className="eyebrow-mono">{label}</span>
          <p className={big ? 'zs-seq-lead big' : 'zs-seq-lead'}>{lead}</p>
          <p className="zs-seq-count"><span data-step-current>01</span> / {String(steps.length).padStart(2, '0')}</p>
        </div>
      </div>
      <ol className="zs-seq-steps">
        {steps.map((st, k) => (
          <li key={st.title} className="zs-seq-step" data-step={pad(k)}>
            <span className="zs-seq-n">{pad(k)}</span>
            <p className="zs-seq-t">{st.title}</p>
            {st.text && <p className="zs-seq-p">{st.text}</p>}
          </li>
        ))}
      </ol>
    </div>
  )

  const fullBleed = ({ src, alt, caption, tall, key }: { src: string; alt: string; caption?: string; tall?: boolean; key?: string | number }) => (
    <figure key={key} className={`zs-bleed${tall ? ' tall' : ''}`} data-open>
      <div className="zs-bleed-frame" data-parallax>
        <div className="zs-bleed-img">
          <Image src={src} alt={alt} fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        {caption && <figcaption className="zs-bleed-cap"><span>{caption}</span></figcaption>}
      </div>
    </figure>
  )

  // the first photo: pinned while it grows from a framed picture to the
  // whole screen, a line surfacing over it
  const expand = (src: string, alt: string, kicker: string, line: string) => (
    <section className="zs-expand" data-expand>
      <div className="zs-expand-stick">
        <div className="zs-expand-frame">
          <div className="zs-expand-img">
            <Image src={src} alt={alt} fill sizes="100vw" style={{ objectFit: 'cover' }} priority />
          </div>
          <div className="zs-expand-copy">
            <span className="zs-expand-kicker">{kicker}</span>
            <p className="zs-expand-line">{line}</p>
          </div>
        </div>
      </div>
    </section>
  )

  return { chapter, sequence, fullBleed, expand }
}
