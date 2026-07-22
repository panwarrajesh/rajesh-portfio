import React from 'react'
import {
  LayoutTemplate,
  ServerCog,
  Table,
  Wrench,
  GitBranch,
  Terminal as TerminalIcon,
  Send,
  Package,
} from 'lucide-react'
import { SectionEyebrow } from './About.jsx'

const GROUPS = [
  {
    icon: LayoutTemplate,
    title: 'Frontend',
    desc: 'Interfaces people actually enjoy clicking through.',
    skills: ['React.js', 'Angular', 'JavaScript (ES6+)', 'TypeScript', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS'],
  },
  {
    icon: ServerCog,
    title: 'Backend',
    desc: 'APIs that stay fast, secure, and predictable.',
    skills: ['Node.js', 'Express.js', 'PHP', 'REST APIs', 'Authentication'],
  },
  {
    icon: Table,
    title: 'Database',
    desc: 'Schemas and queries that scale with real data.',
    skills: ['MongoDB', 'MySQL', 'Data Modeling', 'CRUD Operations'],
  },
  {
    icon: Wrench,
    title: 'Tools',
    desc: 'The everyday toolkit that keeps projects moving.',
    skills: ['Git & GitHub', 'VS Code', 'Postman', 'npm', 'Redux Toolkit'],
  },
]

const TOOL_ICONS = {
  'Git & GitHub': GitBranch,
  'VS Code': TerminalIcon,
  Postman: Send,
  npm: Package,
}

export default function Skills() {
  return (
    <section id="skills" className="py-20 sm:py-28 border-t border-ink-200/10 dark:border-ink-700/40 bg-paper-100/60 dark:bg-ink-900/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionEyebrow index="02" title="Skills" />
        <p className="mt-4 max-w-xl text-ink-500 dark:text-ink-300">
          A working toolkit built across CRM systems, dashboards, and API-driven
          applications — organized the way I actually use it, layer by layer.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          {GROUPS.map(({ icon: Icon, title, desc, skills }) => (
            <div
              key={title}
              className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ink-900/5 dark:bg-mint-500/10 flex items-center justify-center text-mint-600 dark:text-mint-400">
                  <Icon size={19} />
                </div>
                <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-paper-50">{title}</h3>
              </div>
              <p className="mt-3 text-sm text-ink-400 dark:text-ink-400">{desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((s) => {
                  const ToolIcon = TOOL_ICONS[s]
                  return (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-xs font-mono text-ink-600 dark:text-ink-200"
                    >
                      {ToolIcon && <ToolIcon size={12} className="text-mint-500" />}
                      {s}
                    </span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
