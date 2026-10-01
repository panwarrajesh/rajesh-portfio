import React, { useEffect, useMemo, useRef, useState } from 'react'
import { X, Plus, Trash2, Download, Pencil, Eye, Mail, Phone, MapPin, User, Upload } from 'lucide-react'

/**
 * ResumeEditor
 * -------------------------------------------------------------
 * A full-screen editable resume that:
 *  - opens from anywhere (Hero's "Edit résumé" button fires a
 *    window "open-resume-editor" event; you can also pass
 *    `open`/`onClose` as controlled props instead — see bottom)
 *  - works on phones: below the `lg` breakpoint the editor shows
 *    an Edit/Preview tab switch instead of a cramped two-column
 *    layout
 *  - saves to localStorage as you type, so a reload doesn't lose
 *    edits
 *  - downloads as a PDF using the browser's native print dialog
 *    ("Save as PDF"), scoped to just the resume preview via a
 *    print stylesheet
 *
 * The preview/print template deliberately mirrors the layout of
 * the original uploaded resume: a circular photo + name + role +
 * quoted summary up top, then a two-column body — Education and
 * Work Experience on the wide left column, Skills / Projects /
 * Organizations / Certificates / Languages / Interests as tag-style
 * chips on the narrower right column.
 *
 * Usage
 * -------------------------------------------------------------
 * Uncontrolled (matches the fallback in Hero.jsx):
 *   <ResumeEditor />
 *
 * Controlled:
 *   const [open, setOpen] = useState(false)
 *   <Hero onEditResume={() => setOpen(true)} />
 *   <ResumeEditor open={open} onClose={() => setOpen(false)} />
 */

const STORAGE_KEY = 'resume-editor:rajesh-panwar'

const DEFAULT_RESUME = {
  photo: '', // data URL, set via the photo upload control
  name: 'Rajesh Panwar',
  role: 'Frontend Developer',
  summary:
    'I am a passionate Frontend Developer specializing in Angular and React, with a proven track record of creating user-centric, high-performance web applications. I thrive on turning ideas into seamless digital experiences and am dedicated to delivering impactful solutions.',
  email: 'panwarrajesh2003@gmail.com',
  phone: '7082589114',
  location: 'Ashram Colony, Palwal, India',
  skills: ['Angular', 'React', 'PHP', 'MySQL'],
  education: [
    { id: 'edu-1', title: 'BCA, Global University', detail: 'Bachelor of Computer Applications' },
    { id: 'edu-2', title: '12th — Board of School Education, Haryana', detail: '' },
    { id: 'edu-3', title: '10th — Board of School Education, Haryana', detail: '' },
  ],
  experience: [
    {
      id: 'exp-1',
      title: 'Frontend Developer',
      company: 'Aieze.ai — Noida',
      period: '',
      bullets: [
        'Developed and maintained the company website (aieze.ai) using Angular and React.',
        'Improved UI/UX for responsiveness, performance, and accessibility.',
        'Collaborated with cross-functional teams to implement new features.',
        'Tested across browsers and devices to ensure consistent compatibility.',
      ],
    },
    {
      id: 'exp-2',
      title: 'Frontend Developer — 1 year experience',
      company: '',
      period: '',
      bullets: [
        'Worked on Swasthya Sewa Abhiyan and Swasthya Sewa Utsav, Angular-based healthcare initiative projects.',
        'Improved project performance and implemented dynamic, responsive features.',
        'Collaborated with the team to integrate seamlessly with backend systems.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Personal Portfolio',
      detail: 'Built with Next.js and Node.js to showcase skills and projects.',
    },
  ],
  organizations: [],
  certificates: ['Certificate in Web Development'],
  languages: ['Hindi — Full professional proficiency', 'English — Full professional proficiency'],
  interests: ['Web Development', 'Learning new technologies'],
}

function loadInitialResume() {
  if (typeof window === 'undefined') return DEFAULT_RESUME
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...DEFAULT_RESUME, ...JSON.parse(saved) }
  } catch {
    // ignore corrupt/blocked storage and fall back to defaults
  }
  return DEFAULT_RESUME
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

// ---- small editing primitives -------------------------------------------

function Field({ label, value, onChange, textarea = false, placeholder }) {
  const Comp = textarea ? 'textarea' : 'input'
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-500 dark:text-ink-400">{label}</span>
      <Comp
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={textarea ? 3 : undefined}
        className="mt-1 w-full rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm text-ink-900 dark:text-paper-50 focus-ring resize-y"
      />
    </label>
  )
}

function ListEditor({ items, onChange, placeholder }) {
  const update = (i, val) => {
    const next = [...items]
    next[i] = val
    onChange(next)
  }
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, ''])

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={item}
            placeholder={placeholder}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm text-ink-900 dark:text-paper-50 focus-ring"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove"
            className="focus-ring shrink-0 w-8 h-8 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-400 hover:text-red-500 hover:border-red-300 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-mint-600 dark:text-mint-400 hover:opacity-80"
      >
        <Plus size={14} /> Add
      </button>
    </div>
  )
}

// A compact repeatable block used for Education / Projects / Organizations —
// each entry is just a title + a detail line.
function TitleDetailListEditor({ items, onAdd, onUpdate, onRemove, titleLabel = 'Title', detailLabel = 'Detail' }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            <Field label={titleLabel} value={item.title} onChange={(v) => onUpdate(item.id, { title: v })} />
            <Field label={detailLabel} value={item.detail} onChange={(v) => onUpdate(item.id, { detail: v })} />
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Remove"
            className="focus-ring mt-6 shrink-0 w-8 h-8 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-400 hover:text-red-500 hover:border-red-300"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-mint-600 dark:text-mint-400"
      >
        <Plus size={14} /> Add
      </button>
    </div>
  )
}

// Tag/chip used in the preview. The original resume uses two looks:
// a solid dark pill for Skills, and an outlined pill for Interests.
function Tag({ children, variant = 'filled' }) {
  const styles =
    variant === 'outline'
      ? 'border border-ink-300 text-ink-700 bg-white'
      : 'bg-ink-800 text-white'
  return (
    <span
      className={`inline-block rounded-md text-[11px] font-medium tracking-wide px-2.5 py-1 mr-1.5 mb-1.5 ${styles}`}
    >
      {children}
    </span>
  )
}

function PreviewSection({ title, children }) {
  return (
    <div className="mt-4 first:mt-0">
      <h2 className="text-[13px] font-bold text-ink-900">{title}</h2>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

// ---- main component -------------------------------------------------------

export default function ResumeEditor({ open: controlledOpen, onClose: controlledOnClose }) {
  const isControlled = typeof controlledOpen === 'boolean'
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const close = () => (isControlled ? controlledOnClose?.() : setUncontrolledOpen(false))

  const [resume, setResume] = useState(loadInitialResume)
  const [mobileView, setMobileView] = useState('edit') // 'edit' | 'preview'
  const fileInputRef = useRef(null)

  // Uncontrolled fallback: listen for the event Hero.jsx dispatches.
  useEffect(() => {
    if (isControlled) return
    const handler = () => setUncontrolledOpen(true)
    window.addEventListener('open-resume-editor', handler)
    return () => window.removeEventListener('open-resume-editor', handler)
  }, [isControlled])

  // Autosave to localStorage.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
    } catch {
      // storage may be unavailable (private mode, quota) — edits still
      // work for the rest of the session, they just won't persist
    }
  }, [resume])

  // Lock page scroll while the overlay is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const set = (key) => (value) => setResume((r) => ({ ...r, [key]: value }))

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set('photo')(reader.result)
    reader.readAsDataURL(file)
  }

  const updateEducation = (id, patch) =>
    setResume((r) => ({ ...r, education: r.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  const addEducation = () =>
    setResume((r) => ({ ...r, education: [...r.education, { id: uid('edu'), title: '', detail: '' }] }))
  const removeEducation = (id) => setResume((r) => ({ ...r, education: r.education.filter((e) => e.id !== id) }))

  const updateExperience = (id, patch) =>
    setResume((r) => ({ ...r, experience: r.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) }))
  const updateExperienceBullet = (id, i, val) =>
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) =>
        e.id === id ? { ...e, bullets: e.bullets.map((b, idx) => (idx === i ? val : b)) } : e
      ),
    }))
  const addExperienceBullet = (id) =>
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) => (e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e)),
    }))
  const removeExperienceBullet = (id, i) =>
    setResume((r) => ({
      ...r,
      experience: r.experience.map((e) =>
        e.id === id ? { ...e, bullets: e.bullets.filter((_, idx) => idx !== i) } : e
      ),
    }))
  const addExperience = () =>
    setResume((r) => ({
      ...r,
      experience: [...r.experience, { id: uid('exp'), title: '', company: '', period: '', bullets: [''] }],
    }))
  const removeExperience = (id) => setResume((r) => ({ ...r, experience: r.experience.filter((e) => e.id !== id) }))

  const updateProject = (id, patch) =>
    setResume((r) => ({ ...r, projects: r.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) }))
  const addProject = () =>
    setResume((r) => ({ ...r, projects: [...r.projects, { id: uid('proj'), title: '', detail: '' }] }))
  const removeProject = (id) => setResume((r) => ({ ...r, projects: r.projects.filter((p) => p.id !== id) }))

  const updateOrg = (id, patch) =>
    setResume((r) => ({ ...r, organizations: r.organizations.map((o) => (o.id === id ? { ...o, ...patch } : o)) }))
  const addOrg = () =>
    setResume((r) => ({ ...r, organizations: [...r.organizations, { id: uid('org'), title: '', detail: '' }] }))
  const removeOrg = (id) => setResume((r) => ({ ...r, organizations: r.organizations.filter((o) => o.id !== id) }))

  const printCss = useMemo(
    () => `
    @media print {
      @page { margin: 12mm; }

      /* Hide everything by default, then re-reveal just the resume. */
      body * { visibility: hidden; }
      #resume-print-area, #resume-print-area * { visibility: visible; }

      /* The modal (fixed + overflow:hidden) and the scrollable preview
         pane (overflow-y:auto, fixed height) clip their content to one
         screen's worth of pixels. visibility:hidden alone does NOT
         remove that clipping, so without this the print output is cut
         off after the first "page". Force every ancestor in that
         chain back to normal flow so the full resume can paginate. */
      #resume-editor-overlay,
      #resume-editor-panel,
      #resume-editor-body,
      #resume-preview-pane {
        position: static !important;
        inset: auto !important;
        display: block !important;
        height: auto !important;
        max-height: none !important;
        overflow: visible !important;
        background: none !important;
        backdrop-filter: none !important;
      }

      #resume-print-area {
        position: static !important;
        max-width: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }

      /* Width is intentionally left to the inline style set by
         handleDownload() just before print — it's either 100% or a
         compensating width when the shrink-to-fit transform is
         active, and an !important rule here would override that. */
    }
  `,
    []
  )

  // Shrinks the resume to fit one A4 page, then prints.
  //
  // This deliberately does NOT use the CSS `zoom` property — it isn't
  // reliably respected by every browser's print engine. Instead it uses
  // `transform: scale()`, which every browser honours for print, and
  // separately pins the *wrapper's* height in px to the resulting
  // shrunk height. That second part matters: `transform` only changes
  // paint, not the layout box, so without pinning the wrapper's height
  // the page would still reserve the resume's original (taller) height
  // in the flow — leaving blank space that pushes out a near-empty 2nd
  // page even though the content visually looks shrunk to fit.
  //
  // If the content is so long it would need to shrink below a readable
  // floor, it's left alone and allowed to spill onto a 2nd page rather
  // than becoming illegibly small.
  const handleDownload = () => {
    const wrapper = document.getElementById('resume-preview-pane')
    const scaleBox = document.getElementById('resume-print-scale-box')
    const el = document.getElementById('resume-print-area')
    if (!el || !wrapper || !scaleBox) {
      window.print()
      return
    }

    const prevWrapperDisplay = wrapper.style.display
    const prevTransform = el.style.transform
    const prevWidth = el.style.width
    const prevBoxHeight = scaleBox.style.height
    const prevBoxOverflow = scaleBox.style.overflow

    // Reset first, then force a reflow, so we measure the resume's true
    // natural size — not a size left over from a previous shrink.
    el.style.transform = 'none'
    el.style.width = '100%'
    scaleBox.style.height = 'auto'
    scaleBox.style.overflow = 'visible'
    // On mobile the preview pane can be display:none (user is on the
    // "Edit" tab) — force it visible so measurements aren't 0.
    wrapper.style.display = 'block'
    void el.offsetHeight // force reflow

    const MM_TO_PX = 96 / 25.4
    const PAGE_MARGIN_MM = 12
    const availableHeightPx = (297 - PAGE_MARGIN_MM * 2) * MM_TO_PX
    const MIN_SCALE = 0.5 // don't shrink past this — falls back to 2 pages instead

    const naturalHeight = el.scrollHeight
    if (naturalHeight > availableHeightPx) {
      const scale = Math.max(availableHeightPx / naturalHeight, MIN_SCALE)
      el.style.transform = `scale(${scale})`
      el.style.transformOrigin = 'top left'
      // Widen the box before scaling so the visual result still fills
      // the page's width instead of shrinking into a corner.
      el.style.width = `${100 / scale}%`
      scaleBox.style.height = `${naturalHeight * scale}px`
      scaleBox.style.overflow = 'hidden'
    }

    let cleaned = false
    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      wrapper.style.display = prevWrapperDisplay
      el.style.transform = prevTransform
      el.style.width = prevWidth
      scaleBox.style.height = prevBoxHeight
      scaleBox.style.overflow = prevBoxOverflow
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    // Fallback in case `afterprint` doesn't fire (inconsistent on some
    // mobile browsers' native print/share sheets).
    setTimeout(cleanup, 8000)

    // Give the browser two animation frames to actually commit the
    // layout/paint for the styles set above before opening the print
    // dialog. Calling print() in the very same tick as the style
    // change works in most desktop browsers, but on some mobile
    // browsers the print snapshot can be taken before the new layout
    // has settled, which is the most common reason a "shrink to fit"
    // script like this silently has no visible effect.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print()
      })
    })
  }

  if (!open) return null

  return (
    <div id="resume-editor-overlay" className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-sm flex flex-col sm:p-4">
      <style>{printCss}</style>

      <div
        id="resume-editor-panel"
        className="relative flex flex-col w-full sm:max-w-5xl sm:mx-auto sm:my-auto h-full sm:h-[92vh] sm:rounded-2xl bg-paper-50 dark:bg-ink-950 border border-ink-200 dark:border-ink-700 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-ink-200 dark:border-ink-700 shrink-0">
          <h2 className="font-display font-semibold text-base sm:text-lg text-ink-900 dark:text-paper-50">
            Edit résumé
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="focus-ring inline-flex items-center gap-1.5 px-3 sm:px-4 h-9 sm:h-10 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Download size={15} />
              <span className="hidden xs:inline">Download PDF</span>
              <span className="xs:hidden">PDF</span>
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="focus-ring w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 hover:text-ink-900 dark:hover:text-paper-50 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Mobile tab switch — hidden at lg and up, where both panes show side by side */}
        <div className="lg:hidden flex border-b border-ink-200 dark:border-ink-700 shrink-0">
          {[
            { id: 'edit', label: 'Edit', icon: Pencil },
            { id: 'preview', label: 'Preview', icon: Eye },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobileView(id)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                mobileView === id
                  ? 'border-mint-500 text-mint-600 dark:text-mint-400'
                  : 'border-transparent text-ink-400'
              }`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div id="resume-editor-body" className="flex-1 min-h-0 grid lg:grid-cols-2">
          {/* Edit pane */}
          <div
            className={`${mobileView === 'edit' ? 'block' : 'hidden'} lg:block overflow-y-auto px-4 sm:px-6 py-5 space-y-7 border-b lg:border-b-0 lg:border-r border-ink-200 dark:border-ink-700`}
          >
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Photo</h3>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full border border-ink-200 dark:border-ink-700 bg-ink-100 dark:bg-ink-800 overflow-hidden flex items-center justify-center shrink-0">
                  {resume.photo ? (
                    <img src={resume.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-ink-400" />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="focus-ring inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-ink-200 dark:border-ink-700 text-sm text-ink-700 dark:text-paper-100 hover:border-mint-500/60"
                >
                  <Upload size={14} /> Upload
                </button>
                {resume.photo && (
                  <button
                    type="button"
                    onClick={() => set('photo')('')}
                    className="focus-ring text-xs text-ink-400 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Basics</h3>
              <Field label="Full name" value={resume.name} onChange={set('name')} />
              <Field label="Role / title" value={resume.role} onChange={set('role')} />
              <Field label="Summary (shown as a quote)" value={resume.summary} onChange={set('summary')} textarea />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Email" value={resume.email} onChange={set('email')} />
                <Field label="Phone" value={resume.phone} onChange={set('phone')} />
              </div>
              <Field label="Location" value={resume.location} onChange={set('location')} />
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Skills</h3>
              <ListEditor items={resume.skills} onChange={set('skills')} placeholder="e.g. React" />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Experience</h3>
                <button
                  type="button"
                  onClick={addExperience}
                  className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-mint-600 dark:text-mint-400"
                >
                  <Plus size={14} /> Add role
                </button>
              </div>
              {resume.experience.map((exp) => (
                <div key={exp.id} className="rounded-lg border border-ink-200 dark:border-ink-700 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <Field label="Title" value={exp.title} onChange={(v) => updateExperience(exp.id, { title: v })} />
                      <Field
                        label="Company / context"
                        value={exp.company}
                        onChange={(v) => updateExperience(exp.id, { company: v })}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      aria-label="Remove role"
                      className="focus-ring mt-6 shrink-0 w-8 h-8 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-400 hover:text-red-500 hover:border-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className="text-xs font-medium text-ink-500 dark:text-ink-400">Achievements</span>
                  <div className="space-y-2">
                    {exp.bullets.map((b, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={b}
                          onChange={(e) => updateExperienceBullet(exp.id, i, e.target.value)}
                          className="flex-1 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 text-sm text-ink-900 dark:text-paper-50 focus-ring"
                        />
                        <button
                          type="button"
                          onClick={() => removeExperienceBullet(exp.id, i)}
                          aria-label="Remove"
                          className="focus-ring shrink-0 w-8 h-8 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-400 hover:text-red-500 hover:border-red-300"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(exp.id)}
                      className="focus-ring inline-flex items-center gap-1.5 text-xs font-medium text-mint-600 dark:text-mint-400"
                    >
                      <Plus size={14} /> Add line
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Education</h3>
                <button
                  type="button"
                  onClick={addEducation}
                  className="focus-ring inline-flex items-center gap-1 text-xs font-medium text-mint-600 dark:text-mint-400"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <TitleDetailListEditor
                items={resume.education}
                onAdd={addEducation}
                onUpdate={updateEducation}
                onRemove={removeEducation}
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Projects</h3>
              </div>
              <TitleDetailListEditor
                items={resume.projects}
                onAdd={addProject}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Organizations</h3>
              </div>
              <TitleDetailListEditor
                items={resume.organizations}
                onAdd={addOrg}
                onUpdate={updateOrg}
                onRemove={removeOrg}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Certificates</h3>
              <ListEditor items={resume.certificates} onChange={set('certificates')} />
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Languages</h3>
              <ListEditor items={resume.languages} onChange={set('languages')} />
            </section>

            <section className="space-y-3 pb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Interests</h3>
              <ListEditor items={resume.interests} onChange={set('interests')} />
            </section>
          </div>

          {/* Preview pane — this exact markup is what gets printed. Laid
              out to match the original resume: photo + name + role +
              quoted summary up top, then a wide left column (Education,
              Work Experience) beside a narrower right column of chip-style
              lists (Skills, Projects, Organizations, Certificates,
              Languages, Interests). */}
          <div
            id="resume-preview-pane"
            className={`${mobileView === 'preview' ? 'block' : 'hidden'} lg:block overflow-y-auto bg-ink-100 dark:bg-ink-900 px-4 sm:px-6 py-5`}
          >
            {/* This box's height gets pinned (in px, via JS, right before
                printing) to match the *scaled-down* height of the resume
                inside it. Without that, the resume's original — taller —
                layout box would still be reserved in the page flow even
                after a CSS transform visually shrinks it, leaving blank
                space that pushes a spurious, mostly-empty 2nd page. */}
            <div id="resume-print-scale-box" className="mx-auto w-full max-w-[210mm]">
              <div
                id="resume-print-area"
                className="w-full bg-white text-ink-900 rounded-lg shadow-xl p-5 sm:p-7 text-[12px] leading-snug"
              >
              {/* Header */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-ink-100 border border-ink-200 shrink-0 flex items-center justify-center">
                  {resume.photo ? (
                    <img src={resume.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={26} className="text-ink-300" />
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display font-semibold text-xl sm:text-2xl leading-tight">
                    {resume.name || 'Your name'}
                  </h1>
                  <p className="text-ink-500 text-sm">{resume.role}</p>
                  {resume.summary && (
                    <p className="mt-1.5 text-ink-500 text-xs italic leading-relaxed">&ldquo;{resume.summary}&rdquo;</p>
                  )}
                </div>
              </div>

              {/* Contact bar */}
              <div className="mt-4 pt-3 pb-3 border-t border-b border-ink-200 flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 text-[11px] text-ink-600">
                {resume.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={12} className="text-ink-400" /> {resume.email}
                  </span>
                )}
                {resume.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={12} className="text-ink-400" /> {resume.phone}
                  </span>
                )}
                {resume.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={12} className="text-ink-400" /> {resume.location}
                  </span>
                )}
              </div>

              {/* Two-column body */}
              <div className="mt-1 grid grid-cols-1 sm:grid-cols-[1.55fr_1fr] gap-x-8">
                {/* Left: Education + Experience */}
                <div>
                  {resume.education.length > 0 && (
                    <PreviewSection title="Education">
                      {resume.education.map((edu) => (
                        <div key={edu.id} className="mb-2 last:mb-0">
                          <p className="font-semibold text-[12.5px]">{edu.title}</p>
                          {edu.detail && <p className="text-ink-500 text-xs">{edu.detail}</p>}
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {resume.experience.length > 0 && (
                    <PreviewSection title="Work Experience">
                      {resume.experience.map((exp) => (
                        <div key={exp.id} className="mb-3 last:mb-0">
                          <p className="font-semibold text-[12.5px]">{exp.title}</p>
                          {exp.company && <p className="text-ink-500 text-xs italic">{exp.company}</p>}
                          {exp.bullets.filter(Boolean).length > 0 && (
                            <ul className="mt-1 space-y-0.5 text-ink-700 text-[12px]">
                              {exp.bullets.filter(Boolean).map((b, i) => (
                                <li key={i} className="flex gap-1.5">
                                  <span className="text-ink-400">–</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </PreviewSection>
                  )}
                </div>

                {/* Right: Skills, Projects, Organizations, Certificates, Languages, Interests */}
                <div>
                  {resume.skills.filter(Boolean).length > 0 && (
                    <PreviewSection title="Skills">
                      <div className="flex flex-wrap">
                        {resume.skills.filter(Boolean).map((s, i) => (
                          <Tag key={i}>{s.toUpperCase()}</Tag>
                        ))}
                      </div>
                    </PreviewSection>
                  )}

                  {resume.projects.filter((p) => p.title).length > 0 && (
                    <PreviewSection title="Personal Projects">
                      {resume.projects.map((proj) => (
                        <div key={proj.id} className="mb-2 last:mb-0">
                          <p className="font-semibold text-[12.5px]">{proj.title}</p>
                          {proj.detail && <p className="text-ink-600 text-xs">{proj.detail}</p>}
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {resume.organizations.filter((o) => o.title).length > 0 && (
                    <PreviewSection title="Organizations">
                      {resume.organizations.map((org) => (
                        <div key={org.id} className="mb-2 last:mb-0">
                          <p className="font-semibold text-[12.5px]">{org.title}</p>
                          {org.detail && <p className="text-ink-600 text-xs">{org.detail}</p>}
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {resume.certificates.filter(Boolean).length > 0 && (
                    <PreviewSection title="Certificates">
                      <p className="text-ink-700 text-xs">{resume.certificates.filter(Boolean).join(', ')}</p>
                    </PreviewSection>
                  )}

                  {resume.languages.filter(Boolean).length > 0 && (
                    <PreviewSection title="Languages">
                      {resume.languages.filter(Boolean).map((l, i) => {
                        const [lang, level] = l.split('—').map((s) => s.trim())
                        return (
                          <p key={i} className="text-xs mb-1 last:mb-0">
                            <span className="font-medium">{lang}</span>
                            {level && <span className="text-ink-500 italic"> · {level}</span>}
                          </p>
                        )
                      })}
                    </PreviewSection>
                  )}

                  {resume.interests.filter(Boolean).length > 0 && (
                    <PreviewSection title="Interests">
                      <div className="flex flex-wrap">
                        {resume.interests.filter(Boolean).map((s, i) => (
                          <Tag key={i} variant="outline">
                            {s}
                          </Tag>
                        ))}
                      </div>
                    </PreviewSection>
                  )}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}