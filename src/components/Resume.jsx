import React from 'react'
import { FileEdit, Download, Sparkles, ArrowRight } from 'lucide-react'
import { SectionEyebrow } from './About.jsx'

const FEATURES = [
  { icon: FileEdit, text: 'Edit every field — name, skills, education, experience, projects' },
  { icon: Sparkles, text: 'Add or remove entries to shape it exactly how you want' },
  { icon: Download, text: 'Save your changes and download a clean PDF, anytime' },
]

export default function Resume({ onOpen }) {
  return (
    <section id="resume" className="py-20 sm:py-28 border-t border-ink-200/10 dark:border-ink-700/40 bg-paper-100/60 dark:bg-ink-900/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionEyebrow index="04" title="Resume" />

        <div className="mt-10 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6 sm:p-10 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <p className="text-xl sm:text-2xl font-display font-medium text-ink-900 dark:text-paper-50 leading-snug">
              A resume builder built right into the portfolio.
            </p>
            <p className="mt-3 text-ink-500 dark:text-ink-300 leading-relaxed max-w-lg">
              Open the builder, edit anything inline, add or remove sections, and
              export a polished PDF — no separate app needed.
            </p>

            <ul className="mt-6 space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-ink-600 dark:text-ink-200">
                  <span className="w-7 h-7 rounded-md bg-ink-900/5 dark:bg-mint-500/10 text-mint-600 dark:text-mint-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={14} />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <button
              onClick={onOpen}
              className="focus-ring mt-8 inline-flex items-center gap-2 px-5 h-12 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 font-medium hover:opacity-90 transition-opacity"
            >
              Open resume builder
              <ArrowRight size={17} />
            </button>
          </div>

          <div className="relative rounded-xl border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 p-6 aspect-[4/5] flex flex-col gap-3 overflow-hidden">
            <div className="h-4 w-2/3 rounded bg-ink-900/10 dark:bg-paper-100/10" />
            <div className="h-2.5 w-1/3 rounded bg-mint-500/40" />
            <div className="mt-2 space-y-1.5">
              <div className="h-2 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
              <div className="h-2 w-5/6 rounded bg-ink-900/5 dark:bg-paper-100/5" />
              <div className="h-2 w-4/6 rounded bg-ink-900/5 dark:bg-paper-100/5" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {['React', 'Node.js', 'MongoDB', 'MySQL', 'Redux'].map((t) => (
                <span key={t} className="px-2 py-1 rounded bg-ink-900/5 dark:bg-paper-100/5 text-[10px] font-mono text-ink-400">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2.5 w-1/4 rounded bg-ink-900/10 dark:bg-paper-100/10" />
              <div className="h-2 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
              <div className="h-2 w-3/4 rounded bg-ink-900/5 dark:bg-paper-100/5" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-paper-50 dark:from-ink-800 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
