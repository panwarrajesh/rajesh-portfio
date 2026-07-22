import React, { useState } from 'react'
import { Sun, Moon, Menu, X, Terminal } from 'lucide-react'

const LINKS = [
  { href: '#about', label: 'about' },
  { href: '#skills', label: 'skills' },
  { href: '#projects', label: 'projects' },
  { action: 'resume', label: 'resume' },
  { href: '#contact', label: 'contact' },
]

export default function Navbar({ theme, toggleTheme, onOpenResume }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/10 dark:border-ink-700/60 bg-paper-50/80 dark:bg-ink-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 font-display font-semibold text-lg text-ink-900 dark:text-paper-50 focus-ring rounded-md">
          <span className="w-8 h-8 rounded-lg bg-ink-900 dark:bg-mint-500/15 border border-mint-500/40 flex items-center justify-center text-mint-500">
            <Terminal size={16} strokeWidth={2.2} />
          </span>
          <span>
            rajesh<span className="text-mint-500">.</span>dev
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 font-mono text-sm">
          {LINKS.map((l, i) =>
            l.action === 'resume' ? (
              <button
                key="resume"
                onClick={onOpenResume}
                className="text-ink-500 dark:text-ink-300 hover:text-mint-600 dark:hover:text-mint-400 transition-colors focus-ring rounded"
              >
                <span className="text-mint-500/70">0{i + 1}.</span> {l.label}
              </button>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-ink-500 dark:text-ink-300 hover:text-mint-600 dark:hover:text-mint-400 transition-colors focus-ring rounded"
              >
                <span className="text-mint-500/70">0{i + 1}.</span> {l.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="focus-ring w-10 h-10 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-600 dark:text-paper-100 hover:border-mint-500/60 hover:text-mint-500 transition-colors"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center px-4 h-10 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-opacity focus-ring"
          >
            Hire me
          </a>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            className="md:hidden focus-ring w-10 h-10 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-600 dark:text-paper-100"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-200/10 dark:border-ink-700/60 bg-paper-50 dark:bg-ink-950">
          <nav className="flex flex-col px-5 py-4 gap-1 font-mono text-sm">
            {LINKS.map((l, i) =>
              l.action === 'resume' ? (
                <button
                  key="resume"
                  onClick={() => {
                    setOpen(false)
                    onOpenResume()
                  }}
                  className="py-2.5 text-left text-ink-600 dark:text-ink-300 hover:text-mint-600 dark:hover:text-mint-400 transition-colors"
                >
                  <span className="text-mint-500/70">0{i + 1}.</span> {l.label}
                </button>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-ink-600 dark:text-ink-300 hover:text-mint-600 dark:hover:text-mint-400 transition-colors"
                >
                  <span className="text-mint-500/70">0{i + 1}.</span> {l.label}
                </a>
              )
            )}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center px-4 h-10 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 text-sm font-medium"
            >
              Hire me
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
