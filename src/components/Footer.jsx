import React from 'react'

export default function Footer() {
  return (
    <footer className="border-t border-ink-200/10 dark:border-ink-700/40 py-8">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-ink-400 dark:text-ink-500">
        <span>© {new Date().getFullYear()} Rajesh Panwar. Built with React & Tailwind.</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-mint-500" />
          Available for work
        </span>
      </div>
    </footer>
  )
}
