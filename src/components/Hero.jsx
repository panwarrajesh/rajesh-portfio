import React, { useEffect, useState } from 'react'
import { Circle, Github, Linkedin, Mail, ArrowDownRight } from 'lucide-react'

const CODE_LINES = [
  { n: 1, text: 'const developer = {' },
  { n: 2, text: "  name: 'Rajesh Panwar'," , indent: 1 },
  { n: 3, text: "  role: 'Full Stack Web Developer'," , indent: 1 },
  { n: 4, text: "  stack: ['React', 'Node.js', 'Express', 'MongoDB', 'MySQL']," , indent: 1 },
  { n: 5, text: "  education: 'BCA — Global University'," , indent: 1 },
  { n: 6, text: "  focus: 'dashboards, CRMs, REST APIs'," , indent: 1 },
  { n: 7, text: '  available: true,', indent: 1 },
  { n: 8, text: '}' },
]

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines >= CODE_LINES.length) return
    const t = setTimeout(() => setVisibleLines((v) => v + 1), 220)
    return () => clearTimeout(t)
  }, [visibleLines])

  return (
    <section id="top" className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 bg-grid-pattern bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-paper-50/0 to-paper-50 dark:to-ink-950 pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-mint-500/30 bg-mint-500/5 text-mint-600 dark:text-mint-400 font-mono text-xs mb-6">
            <Circle size={7} className="fill-mint-500 text-mint-500 animate-pulse" />
            open to full-time & freelance work
          </div>

          <h1 className="font-display font-semibold text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] text-ink-900 dark:text-paper-50">
            Building interfaces that
            <span className="block text-mint-600 dark:text-mint-400">ship, scale, and behave.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-500 dark:text-ink-300 max-w-xl leading-relaxed">
            I'm Rajesh Panwar, a full stack developer who pairs React interfaces with
            Node.js &amp; Express APIs — turning admin dashboards, CRMs, and
            business tools from spec into something people actually enjoy using.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
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
          </div>

          <div className="mt-10 flex items-center gap-4">
            {[
              { icon: Github, href: 'https://github.com/', label: 'GitHub' },
              { icon: Linkedin, href: 'https://linkedin.com/', label: 'LinkedIn' },
              { icon: Mail, href: 'mailto:hello@rajeshpanwar.dev', label: 'Email' },
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

        <div className="space-y-5">
          <div className="relative rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-2xl shadow-ink-900/5 dark:shadow-black/40 overflow-hidden flex items-center gap-4 p-4">
            <img
              src="/images/profile.jpg"
              alt="Rajesh Panwar at his desk"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover object-top border border-ink-200 dark:border-ink-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-display font-semibold text-base sm:text-lg text-ink-900 dark:text-paper-50 truncate">
                Rajesh Panwar
              </p>
              <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-md bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 font-mono text-[11px] tracking-wide uppercase">
                Software Engineer
              </span>
              <p className="mt-1.5 text-xs text-ink-400 dark:text-ink-400 font-mono">
                Plan → Code → Test → Repeat
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-2xl shadow-ink-900/5 dark:shadow-black/40 overflow-hidden animate-floatY">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-200 dark:border-ink-700 bg-paper-100 dark:bg-ink-800">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
              <span className="ml-3 font-mono text-xs text-ink-400 dark:text-ink-400">profile.js</span>
            </div>
            <div className="p-5 sm:p-6 font-mono text-[13px] sm:text-sm leading-relaxed">
              {CODE_LINES.slice(0, visibleLines).map((line) => (
                <div key={line.n} className="flex">
                  <span className="w-6 text-right pr-4 text-ink-300 dark:text-ink-600 select-none">{line.n}</span>
                  <span className="text-ink-700 dark:text-ink-200 whitespace-pre">
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

function CodeLine({ text }) {
  const parts = text.split(/('.*?')/g)
  return parts.map((part, i) =>
    part.startsWith("'") ? (
      <span key={i} className="text-amber-500">{part}</span>
    ) : (
      <span key={i} className="text-mint-600 dark:text-mint-400">{part}</span>
    )
  )
}
