import React, { useEffect, useRef, useState } from 'react'
import { Circle, Github, Linkedin, Mail, ArrowDownRight, FileEdit } from 'lucide-react'
import RajeshSoundText from './Rajeshsoundtext'

/**
 * Design notes
 * -------------------------------------------------------------
 * Combines: a left column (badge, headline, copy, CTAs, socials)
 * with a right column made of three stacked cards — a dotted "R"
 * canvas portrait, a small name/role card, and a typing code-editor
 * card.
 *
 * Both the dotted "R" and the "ship, scale, and behave." headline
 * read the same --accent-rgb CSS variable that ThemeEngine.jsx sets
 * on <html>. Change the accent color there and both update
 * immediately — the dots because the canvas re-reads the variable
 * every frame, the headline because its color is a plain CSS
 * var() reference.
 *
 * Fix log (from the previous version):
 * - Removed a stray duplicated "Software Engineer" badge <span> —
 *   it was pasted twice in the source, which is why it rendered
 *   twice. There is only ever one badge now.
 * - Removed the dead, fully-commented-out DottedLetter block that
 *   left an empty, collapsed card on the page. DottedLetter is
 *   restored with an explicit aspect-ratio so it always has a
 *   visible height, including on mobile.
 * - Tightened the type scale and paddings for small screens so
 *   nothing overflows or feels oversized on a phone.
 * - Added an "Edit résumé" action that opens the ResumeEditor
 *   component (see ResumeEditor.jsx) — pass it an `onEditResume`
 *   handler, or use it uncontrolled (see bottom of file).
 */

const CODE_LINES = [
  { n: 1, text: 'const developer = {' },
  { n: 2, text: "  name: 'Rajesh Panwar'," },
  { n: 3, text: "  role: 'Full Stack Web Developer'," },
  { n: 4, text: "  stack: ['React', 'Node.js', 'Express', 'MongoDB', 'MySQL']," },
  { n: 5, text: "  education: 'BCA — Global University'," },
  { n: 6, text: "  focus: 'dashboards, CRMs, REST APIs'," },
  { n: 7, text: '  available: true,' },
  { n: 8, text: '}' },
]

// Fallback used only before ThemeEngine has set --accent-rgb on <html>
// (matches its default "Teal" preset), so there's no flash of a
// different color on first paint.
const ACCENT_FALLBACK = '45 212 191'
const LETTER = 'R'

// Reads the live --accent-rgb custom property set by ThemeEngine.
// Canvas fillStyle needs a real color string, not a CSS var(), so
// this has to be re-read (cheap) rather than referenced once.
function readAccentRgbString() {
  if (typeof document === 'undefined') return ACCENT_FALLBACK
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim()
  return raw || ACCENT_FALLBACK
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

function DottedLetter() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Fixed internal resolution — display size is handled by CSS.
    const W = 480
    const H = 480
    canvas.width = W
    canvas.height = H

    const dots = []
    const mouse = { x: -9999, y: -9999, active: false }

    const maskCanvas = document.createElement('canvas')
    maskCanvas.width = W
    maskCanvas.height = H
    const maskCtx = maskCanvas.getContext('2d')
    maskCtx.fillStyle = '#fff'
    maskCtx.font = `900 ${H * 0.86}px Georgia, "Times New Roman", serif`
    maskCtx.textAlign = 'center'
    maskCtx.textBaseline = 'middle'
    maskCtx.fillText(LETTER, W / 2, H / 2 + H * 0.03)

    const pixels = maskCtx.getImageData(0, 0, W, H).data
    const spacing = 8

    for (let y = 6; y < H - 6; y += spacing) {
      for (let x = 6; x < W - 6; x += spacing) {
        const idx = (Math.round(y) * W + Math.round(x)) * 4
        if (pixels[idx + 3] > 120) {
          dots.push({
            x,
            y,
            px: reducedMotion ? x : Math.random() * W,
            py: reducedMotion ? y : Math.random() * H,
            vx: 0,
            vy: 0,
            size: 1.6 + Math.random() * 0.5,
          })
        }
      }
    }

    const toLocal = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((clientX - rect.left) / rect.width) * W,
        y: ((clientY - rect.top) / rect.height) * H,
      }
    }
    const handleMove = (e) => {
      const p = toLocal(e.clientX, e.clientY)
      mouse.x = p.x
      mouse.y = p.y
      mouse.active = true
    }
    const handleLeave = () => {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }
    // Touch support so the ripple also works on phones/tablets,
    // where there is no mousemove at all.
    const handleTouchMove = (e) => {
      if (!e.touches || !e.touches.length) return
      const t = e.touches[0]
      const p = toLocal(t.clientX, t.clientY)
      mouse.x = p.x
      mouse.y = p.y
      mouse.active = true
    }

    const container = containerRef.current
    container.addEventListener('mousemove', handleMove)
    container.addEventListener('mouseleave', handleLeave)
    container.addEventListener('touchmove', handleTouchMove, { passive: true })
    container.addEventListener('touchend', handleLeave)

    let raf
    const radius = 46

    const draw = () => {
      const accent = `rgb(${readAccentRgbString()})`
      ctx.clearRect(0, 0, W, H)
      for (const dot of dots) {
        if (mouse.active) {
          const dx = dot.px - mouse.x
          const dy = dot.py - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < radius) {
            const force = (radius - dist) / radius
            const angle = Math.atan2(dy, dx)
            dot.vx += Math.cos(angle) * force * 5
            dot.vy += Math.sin(angle) * force * 5
          }
        }
        dot.vx += (dot.x - dot.px) * 0.07
        dot.vy += (dot.y - dot.py) * 0.07
        dot.vx *= 0.82
        dot.vy *= 0.82
        dot.px += dot.vx
        dot.py += dot.vy

        ctx.beginPath()
        ctx.arc(dot.px, dot.py, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const renderStatic = () => {
      const accent = `rgb(${readAccentRgbString()})`
      ctx.clearRect(0, 0, W, H)
      for (const dot of dots) {
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = accent
        ctx.fill()
      }
    }

    let styleObserver
    if (reducedMotion) {
      // No animation loop in this mode, so watch for the accent
      // variable changing on <html> and redraw once when it does.
      renderStatic()
      styleObserver = new MutationObserver(renderStatic)
      styleObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['style'],
      })
    } else {
      draw()
    }

    return () => {
      cancelAnimationFrame(raf)
      if (styleObserver) styleObserver.disconnect()
      container.removeEventListener('mousemove', handleMove)
      container.removeEventListener('mouseleave', handleLeave)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleLeave)
    }
  }, [reducedMotion])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

function CodeLine({ text }) {
  const parts = text.split(/('.*?')/g)
  return parts.map((part, i) =>
    part.startsWith("'") ? (
      <span key={i} className="text-amber-500">
        {part}
      </span>
    ) : (
      <span key={i} className="text-mint-600 dark:text-mint-400">
        {part}
      </span>
    )
  )
}

export default function Hero({ onEditResume }) {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines >= CODE_LINES.length) return
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 220)
    return () => clearTimeout(t)
  }, [visibleLines])

  const handleEditResume = () => {
    if (typeof onEditResume === 'function') {
      onEditResume()
      return
    }
    // Uncontrolled fallback: broadcast an event so a <ResumeEditor />
    // mounted anywhere else on the page (e.g. in App.jsx) can open
    // itself without Hero needing to know about it directly.
    window.dispatchEvent(new CustomEvent('open-resume-editor'))
  }

  return (
    <section id="top" className="relative pt-14 sm:pt-24 pb-16 sm:pb-28 bg-grid-pattern bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper-50/0 to-paper-50 dark:to-ink-950 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-mint-500/30 bg-mint-500/5 text-mint-600 dark:text-mint-400 font-mono text-xs mb-5 sm:mb-6">
            <Circle size={7} className="fill-mint-500 text-mint-500 animate-pulse shrink-0" />
            <span>open to full-time &amp; freelance work</span>
          </div>

          <h1 className="font-display font-semibold text-3xl sm:text-4xl lg:text-[3.4rem] leading-[1.12] sm:leading-[1.08] text-ink-900 dark:text-paper-50">
            Building interfaces that
            <span className="block" style={{ color: `rgb(var(--accent-rgb, ${ACCENT_FALLBACK}))` }}>
              ship, scale, and behave.
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-500 dark:text-ink-300 max-w-xl leading-relaxed">
            I'm Rajesh Panwar, a full stack developer who pairs React interfaces with
            Node.js &amp; Express APIs — turning admin dashboards, CRMs, and
            business tools from spec into something people actually enjoy using.
          </p>

          <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#projects"
              className="focus-ring inline-flex items-center gap-2 px-5 h-12 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 font-medium hover:opacity-90 transition-opacity"
            >
              View my work
              <ArrowDownRight size={17} />
            </a>
            <a
              href="#contact"
              className="focus-ring inline-flex items-center gap-2 px-5 h-12 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-paper-100 font-medium hover:border-mint-500/60 hover:text-mint-600 dark:hover:text-mint-400 transition-colors"
            >
              Let's talk
            </a>
            <button
              type="button"
              onClick={handleEditResume}
              className="focus-ring inline-flex items-center gap-2 px-5 h-12 rounded-lg border border-dashed border-ink-300 dark:border-ink-600 text-ink-700 dark:text-paper-100 font-medium hover:border-mint-500/60 hover:text-mint-600 dark:hover:text-mint-400 transition-colors"
            >
              <FileEdit size={17} />
              Edit résumé
            </button>
          </div>

          <div className="mt-9 sm:mt-10 flex items-center gap-3 sm:gap-4">
            {[
              { icon: Github, href: 'https://github.com/', label: 'GitHub' },
              { icon: Linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
              { icon: Mail, href: 'mailto:panwarrajesh2003@gmail.com', label: 'Email' },
            ].map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="focus-ring w-10 h-10 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-300 hover:text-mint-600 dark:hover:text-mint-400 hover:border-mint-500/50 transition-colors"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {/* Dotted "R" card — an explicit aspect-ratio keeps it visible
              (and correctly sized) at every breakpoint, including
              phones, instead of collapsing to zero height. */}
          {/* <div className="relative aspect-[4/3] sm:aspect-square w-full max-w-[280px] sm:max-w-none mx-auto rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-2xl shadow-ink-900/5 dark:shadow-black/40 overflow-hidden"> */}
            <RajeshSoundText  />

          {/* Small info card: name, role, tagline — single badge only */}
          <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-lg shadow-ink-900/5 dark:shadow-black/30 px-4 sm:px-5 py-4 flex items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <p className="font-display font-semibold text-base sm:text-lg text-ink-900 dark:text-paper-50 truncate">
                Rajesh Panwar
              </p>
              <p className="mt-1 text-xs text-ink-400 font-mono truncate">Plan → Code → Test → Repeat</p>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 font-mono text-[11px] tracking-wide uppercase">
              Software Engineer
            </span>
          </div>

          {/* Code editor card */}
          <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-2xl shadow-ink-900/5 dark:shadow-black/40 overflow-hidden animate-floatY">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-800">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span className="ml-3 font-mono text-xs text-ink-400">profile.js</span>
            </div>
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto">
              {CODE_LINES.slice(0, visibleLines).map((line) => (
                <div key={line.n} className="flex whitespace-pre">
                  <span className="w-6 text-right pr-4 text-ink-300 dark:text-ink-600 select-none">{line.n}</span>
                  <span className="text-ink-700 dark:text-ink-200">
                    <CodeLine text={line.text} />
                  </span>
                </div>
              ))}
              {visibleLines >= CODE_LINES.length && (
                <div className="flex">
                  <span className="w-6 text-right pr-4 text-ink-300 dark:text-ink-600 select-none">&nbsp;</span>
                  <span className="inline-block w-2 h-4 bg-mint-500 animate-blink" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}