import React from 'react'
import { LayoutDashboard, Users, ShieldCheck, Plug, Building2, ArrowUpRight } from 'lucide-react'
import { SectionEyebrow } from './About.jsx'

const PROJECTS = [
  {
    icon: LayoutDashboard,
    title: 'CRM Management System',
    desc: 'A full customer relationship management tool with lead tracking, activity logs, and role-based access built on React and Node.js.',
    tags: ['React', 'Node.js', 'MySQL'],
  },
  {
    icon: LayoutDashboard,
    title: 'Admin Dashboard',
    desc: 'A clean, data-dense dashboard with charts, tables, and reusable UI components for managing day-to-day operations.',
    tags: ['React', 'Redux Toolkit', 'REST API'],
  },
  {
    icon: Users,
    title: 'Employee Management System',
    desc: 'Handles employee records, attendance, and department structures with full CRUD operations and search/filtering.',
    tags: ['Node.js', 'Express', 'MongoDB'],
  },
  {
    icon: ShieldCheck,
    title: 'Authentication System',
    desc: 'Secure sign-up and login flow with token-based sessions, protected routes, and role-based permissions.',
    tags: ['Express.js', 'JWT', 'MySQL'],
  },
  {
    icon: Plug,
    title: 'API-based Web Applications',
    desc: 'Frontend applications wired to third-party and custom REST APIs, with clean loading, error, and empty states.',
    tags: ['React', 'REST API', 'Axios'],
  },
  {
    icon: Building2,
    title: 'Responsive Business Websites',
    desc: 'Marketing and portfolio sites built mobile-first, tuned for performance and clean, modern layouts.',
    tags: ['React', 'Tailwind CSS', 'Bootstrap'],
  },
]

export default function Projects() {
  return (
    <section id="projects" className="py-20 sm:py-28 border-t border-ink-200/10 dark:border-ink-700/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionEyebrow index="03" title="Projects" />
        <p className="mt-4 max-w-xl text-ink-500 dark:text-ink-300">
          A selection of applications from my learning and professional journey —
          each one sharpened a different part of the stack.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map(({ icon: Icon, title, desc, tags }) => (
            <div
              key={title}
              className="group rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6 flex flex-col hover:border-mint-500/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 rounded-lg bg-ink-900/5 dark:bg-mint-500/10 flex items-center justify-center text-mint-600 dark:text-mint-400">
                  <Icon size={20} />
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-ink-300 dark:text-ink-600 group-hover:text-mint-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>
              <h3 className="mt-5 font-display font-semibold text-lg text-ink-900 dark:text-paper-50">{title}</h3>
              <p className="mt-2 text-sm text-ink-500 dark:text-ink-300 leading-relaxed flex-1">{desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-md bg-paper-100 dark:bg-ink-800 text-[11px] font-mono text-ink-500 dark:text-ink-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
