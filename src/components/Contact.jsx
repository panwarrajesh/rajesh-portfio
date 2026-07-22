import React, { useState } from 'react'
import { Mail, Github, Linkedin, Send } from 'lucide-react'
import { SectionEyebrow } from './About.jsx'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio inquiry from ${form.name || 'a visitor'}`)
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
    window.location.href = `mailto:hello@rajeshpanwar.dev?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" className="py-20 sm:py-28 border-t border-ink-200/10 dark:border-ink-700/40 bg-paper-100/60 dark:bg-ink-900/30">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <SectionEyebrow index="05" title="Contact" />

        <div className="mt-10 grid lg:grid-cols-2 gap-12">
          <div>
            <p className="text-xl sm:text-2xl font-display font-medium text-ink-900 dark:text-paper-50 leading-snug">
              Have a project, role, or idea in mind? I'd like to hear about it.
            </p>
            <p className="mt-4 text-ink-500 dark:text-ink-300 leading-relaxed max-w-md">
              Whether it's a dashboard, a CRM, or an API that needs building —
              send a few details and I'll get back to you.
            </p>

            <div className="mt-8 space-y-3">
              <a href="mailto:hello@rajeshpanwar.dev" className="focus-ring flex items-center gap-3 text-sm text-ink-600 dark:text-ink-200 hover:text-mint-600 dark:hover:text-mint-400 transition-colors">
                <span className="w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center"><Mail size={16} /></span>
                hello@rajeshpanwar.dev
              </a>
              <a href="https://github.com/" className="focus-ring flex items-center gap-3 text-sm text-ink-600 dark:text-ink-200 hover:text-mint-600 dark:hover:text-mint-400 transition-colors">
                <span className="w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center"><Github size={16} /></span>
                github.com/rajeshpanwar
              </a>
              <a href="https://linkedin.com/" className="focus-ring flex items-center gap-3 text-sm text-ink-600 dark:text-ink-200 hover:text-mint-600 dark:hover:text-mint-400 transition-colors">
                <span className="w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center"><Linkedin size={16} /></span>
                linkedin.com/in/rajeshpanwar
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-mono text-ink-400 mb-1.5">name</label>
              <input
                id="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="focus-ring w-full h-11 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm text-ink-900 dark:text-paper-50 placeholder:text-ink-300 dark:placeholder:text-ink-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-mono text-ink-400 mb-1.5">email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@email.com"
                className="focus-ring w-full h-11 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm text-ink-900 dark:text-paper-50 placeholder:text-ink-300 dark:placeholder:text-ink-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-xs font-mono text-ink-400 mb-1.5">message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project..."
                className="focus-ring w-full px-3 py-2.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-paper-50 dark:bg-ink-800 text-sm text-ink-900 dark:text-paper-50 placeholder:text-ink-300 dark:placeholder:text-ink-500 resize-none"
              />
            </div>
            <button
              type="submit"
              className="focus-ring w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Send message
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
