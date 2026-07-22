import React from 'react'
import { GraduationCap, Target, Layers, Sparkles } from 'lucide-react'

const STATS = [
  { icon: Layers, value: '7+', label: 'Projects shipped' },
  { icon: Sparkles, value: '12+', label: 'Technologies used' },
  { icon: GraduationCap, value: 'BCA', label: 'Global University' },
]

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 border-t border-ink-200/10 dark:border-ink-700/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionEyebrow index="01" title="About" />

        <div className="mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16">
          <div>
            <p className="text-xl sm:text-2xl font-display font-medium text-ink-900 dark:text-paper-50 leading-snug">
              I turn product specs into working software — clean on the frontend,
              solid on the backend, and easy to maintain six months later.
            </p>
            <div className="mt-6 space-y-4 text-ink-500 dark:text-ink-300 leading-relaxed">
              <p>
                Currently pursuing my Bachelor of Computer Applications (BCA) at Global
                University, I build modern, responsive, and scalable web applications
                using React.js on the frontend and Node.js on the backend. I like the
                full loop: designing a clean UI, wiring it to a REST API, and getting
                the database schema right underneath it.
              </p>
              <p>
                My work spans CRM systems, admin dashboards, employee management tools,
                authentication systems, and API-integrated business websites — projects
                that pushed me to get comfortable with reusable components, state
                management with Redux Toolkit, and both MySQL and MongoDB.
              </p>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-mint-500/25 bg-mint-500/5 p-5">
              <Target size={20} className="text-mint-600 dark:text-mint-400 shrink-0 mt-0.5" />
              <p className="text-sm text-ink-600 dark:text-ink-200 leading-relaxed">
                <span className="font-semibold text-ink-900 dark:text-paper-50">Goal:</span>{' '}
                Grow into an experienced full stack developer by continuously learning
                new technologies and building high-quality applications that deliver
                excellent user experiences.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-lg bg-ink-900/5 dark:bg-mint-500/10 flex items-center justify-center text-mint-600 dark:text-mint-400 shrink-0">
                  <Icon size={20} />
                </div>
                <div>
                  <div className="font-display font-semibold text-2xl text-ink-900 dark:text-paper-50">{value}</div>
                  <div className="text-xs font-mono text-ink-400 dark:text-ink-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function SectionEyebrow({ index, title }) {
  return (
    <div className="flex items-center gap-3 font-mono text-sm text-ink-400 dark:text-ink-400">
      <span className="text-mint-500">{index}</span>
      <span className="h-px flex-1 max-w-10 bg-ink-200 dark:bg-ink-700" />
      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 dark:text-paper-50 tracking-tight">
        {title}
      </h2>
    </div>
  )
}
