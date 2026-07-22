import React, { useEffect, useRef, useState } from 'react'
import {
  X,
  Plus,
  Trash2,
  Download,
  Save,
  RotateCcw,
  Loader2,
  Check,
  User,
  FileText,
  Wrench,
  GraduationCap,
  Briefcase,
  FolderKanban,
  FilePlus2,
  UploadCloud,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react'

const STORAGE_KEY = 'rp-resume-data-v2'

const DEFAULT_DATA = {
  name: 'Rajesh Panwar',
  title: 'Full Stack Web Developer',
  email: 'hello@rajeshpanwar.dev',
  phone: '+91 00000 00000',
  location: 'India',
  summary:
    'Full Stack Web Developer pursuing a BCA at Global University, specializing in React.js and Node.js. I build responsive, scalable web applications — from admin dashboards and CRM systems to authentication flows and REST-API-driven tools — with clean code and intuitive interfaces.',
  skills: [
    'React.js', 'Angular', 'JavaScript (ES6+)', 'TypeScript', 'Node.js',
    'Express.js', 'MongoDB', 'MySQL', 'Redux Toolkit', 'Tailwind CSS', 'Git & GitHub',
  ],
  education: [{ degree: 'Bachelor of Computer Applications (BCA)', institute: 'Global University' }],
  experience: [],
  projects: [
    { title: 'CRM Management System', desc: 'Lead tracking, activity logs, and role-based access built with React and Node.js.' },
    { title: 'Admin Dashboard', desc: 'Data-dense dashboard with charts, tables, and reusable UI components.' },
    { title: 'Employee Management System', desc: 'Employee records, attendance, and CRUD operations on MongoDB.' },
    { title: 'Authentication System', desc: 'Token-based sessions with protected, role-based routes.' },
  ],
}

const EMPTY_DATA = {
  name: '', title: '', email: '', phone: '', location: '', summary: '',
  skills: [], education: [], experience: [], projects: [],
}

const TEMPLATES = [
  { id: 'modern', name: 'Modern', desc: 'Accent color, clean sans-serif' },
  { id: 'minimal', name: 'Minimal', desc: 'Monochrome, lots of whitespace' },
  { id: 'classic', name: 'Classic', desc: 'Centered header, serif type' },
]

function getSaved() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
  } catch (e) {
    return null
  }
}

export default function ResumeEngine({ open, onClose }) {
  const [stage, setStage] = useState('landing') // 'landing' | 'editor'
  const [template, setTemplate] = useState('modern')
  const [data, setData] = useState(DEFAULT_DATA)
  const [saved, setSaved] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [importBanner, setImportBanner] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const previewRef = useRef(null)
  const fileInputRef = useRef(null)
  const hasSaved = !!getSaved()

  useEffect(() => {
    if (open) {
      setStage('landing')
      setUploadError('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const startWithSaved = () => {
    setData(getSaved() || DEFAULT_DATA)
    setImportBanner(false)
    setStage('editor')
  }
  const startBlank = () => {
    setData(EMPTY_DATA)
    setImportBanner(false)
    setStage('editor')
  }

  const triggerUpload = () => fileInputRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      let text = ''
      const lower = file.name.toLowerCase()
      if (file.type === 'application/pdf' || lower.endsWith('.pdf')) {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
        const buf = await file.arrayBuffer()
        const doc = await pdfjsLib.getDocument({ data: buf }).promise
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map((it) => it.str).join(' ') + '\n'
        }
      } else if (
        lower.endsWith('.docx') ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        const mammoth = await import('mammoth')
        const buf = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer: buf })
        text = result.value
      } else if (file.type === 'text/plain' || lower.endsWith('.txt')) {
        text = await file.text()
      } else {
        setUploadError('That file type isn\u2019t supported yet — try a PDF, DOCX, or TXT file, or start blank and paste your details in.')
        setData(EMPTY_DATA)
        setStage('editor')
        setUploading(false)
        return
      }

      text = text.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
      setData({
        ...EMPTY_DATA,
        name: DEFAULT_DATA.name,
        summary: text.slice(0, 6000) || 'Paste or type your resume content here.',
      })
      setImportBanner(true)
      setStage('editor')
    } catch (err) {
      console.error(err)
      setUploadError('Couldn\u2019t read that file. Try a different one, or start blank and paste your details in.')
      setData(EMPTY_DATA)
      setStage('editor')
    } finally {
      setUploading(false)
    }
  }

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }))

  const [skillInput, setSkillInput] = useState('')
  const addSkill = () => {
    const v = skillInput.trim()
    if (!v) return
    setData((d) => ({ ...d, skills: [...d.skills, v] }))
    setSkillInput('')
  }
  const removeSkill = (i) => setData((d) => ({ ...d, skills: d.skills.filter((_, idx) => idx !== i) }))

  const addEducation = () => setData((d) => ({ ...d, education: [...d.education, { degree: '', institute: '' }] }))
  const updateEducation = (i, key, value) =>
    setData((d) => {
      const arr = [...d.education]
      arr[i] = { ...arr[i], [key]: value }
      return { ...d, education: arr }
    })
  const removeEducation = (i) => setData((d) => ({ ...d, education: d.education.filter((_, idx) => idx !== i) }))

  const addExperience = () =>
    setData((d) => ({ ...d, experience: [...d.experience, { role: '', company: '', duration: '', desc: '' }] }))
  const updateExperience = (i, key, value) =>
    setData((d) => {
      const arr = [...d.experience]
      arr[i] = { ...arr[i], [key]: value }
      return { ...d, experience: arr }
    })
  const removeExperience = (i) => setData((d) => ({ ...d, experience: d.experience.filter((_, idx) => idx !== i) }))

  const addProject = () => setData((d) => ({ ...d, projects: [...d.projects, { title: '', desc: '' }] }))
  const updateProject = (i, key, value) =>
    setData((d) => {
      const arr = [...d.projects]
      arr[i] = { ...arr[i], [key]: value }
      return { ...d, projects: arr }
    })
  const removeProject = (i) => setData((d) => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }))

  const handleSave = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setSaved(true)
      setTimeout(() => setSaved(false), 1800)
    } catch (e) {}
  }

  const handleDownload = async () => {
    if (!previewRef.current) return
    setDownloading(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${(data.name || 'Resume').replace(/\s+/g, '_')}_Resume.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-paper-50 dark:bg-ink-950 flex flex-col">
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFile} />

      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16 border-b border-ink-200 dark:border-ink-700 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {stage === 'editor' && (
            <button
              onClick={() => setStage('landing')}
              aria-label="Back"
              className="focus-ring w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-300 shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-base sm:text-lg text-ink-900 dark:text-paper-50 truncate">
              Resume Engine
            </h2>
            <p className="text-xs text-ink-400 font-mono hidden sm:block">
              {stage === 'landing' ? 'templates · upload · build from scratch' : 'edit anything · add sections · export PDF'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {stage === 'editor' && (
            <>
              <button
                onClick={handleSave}
                className="focus-ring inline-flex items-center gap-1.5 px-3 h-9 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-paper-100 text-sm hover:border-accent/50 hover:text-accent transition-colors"
              >
                {saved ? <Check size={14} className="text-accent" /> : <Save size={14} />}
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="focus-ring inline-flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">{downloading ? 'Preparing…' : 'Download PDF'}</span>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            aria-label="Close resume engine"
            className="focus-ring w-9 h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* LANDING */}
      {stage === 'landing' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
            <p className="font-mono text-xs text-accent mb-2">01 · pick a template</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`focus-ring text-left rounded-xl border p-4 transition-colors ${
                    template === t.id
                      ? 'border-accent bg-accent/5'
                      : 'border-ink-200 dark:border-ink-700 hover:border-accent/40'
                  }`}
                >
                  <TemplateSwatch id={t.id} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-ink-900 dark:text-paper-50">{t.name}</span>
                    {template === t.id && <Check size={14} className="text-accent" />}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>

            <p className="font-mono text-xs text-accent mt-10 mb-2">02 · start building</p>
            <div className="grid sm:grid-cols-3 gap-4">
              <LandingCard
                icon={hasSaved ? RotateCcw : Sparkles}
                title={hasSaved ? 'Continue my saved resume' : 'Start with my portfolio info'}
                desc={hasSaved ? 'Pick up right where you left off.' : 'Prefilled from the About Me details on this site.'}
                onClick={startWithSaved}
              />
              <LandingCard
                icon={FilePlus2}
                title="Start from a blank resume"
                desc="A clean slate — add every section yourself."
                onClick={startBlank}
              />
              <LandingCard
                icon={uploading ? Loader2 : UploadCloud}
                title="Upload an existing resume"
                desc="PDF, DOCX, or TXT — we'll pull the text in for you to reshape."
                onClick={triggerUpload}
                iconSpin={uploading}
              />
            </div>

            {uploadError && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-300/50 bg-red-500/5 p-3.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDITOR */}
      {stage === 'editor' && (
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_1fr] overflow-hidden">
          <div className="overflow-y-auto p-5 sm:p-6 space-y-8 border-b lg:border-b-0 lg:border-r border-ink-200 dark:border-ink-700">
            {importBanner && (
              <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3.5 text-sm text-ink-600 dark:text-ink-200">
                <Sparkles size={15} className="text-accent shrink-0 mt-0.5" />
                <span>
                  We pulled the text from your file into <strong>Summary</strong> below — split it into Skills,
                  Experience, and Projects using the sections underneath.
                  <button onClick={() => setImportBanner(false)} className="focus-ring block mt-1 text-xs text-accent underline">
                    dismiss
                  </button>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`focus-ring px-3 py-1.5 rounded-md text-xs font-mono border transition-colors ${
                    template === t.id
                      ? 'border-accent text-accent bg-accent/5'
                      : 'border-ink-200 dark:border-ink-700 text-ink-400'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <Field icon={User} title="Personal details">
              <div className="grid sm:grid-cols-2 gap-3">
                <Input label="Full name" value={data.name} onChange={(v) => update('name', v)} />
                <Input label="Title" value={data.title} onChange={(v) => update('title', v)} />
                <Input label="Email" value={data.email} onChange={(v) => update('email', v)} />
                <Input label="Phone" value={data.phone} onChange={(v) => update('phone', v)} />
                <Input label="Location" value={data.location} onChange={(v) => update('location', v)} className="sm:col-span-2" />
              </div>
            </Field>

            <Field icon={FileText} title="Summary">
              <TextArea value={data.summary} onChange={(v) => update('summary', v)} rows={5} />
            </Field>

            <Field icon={Wrench} title="Skills">
              <div className="flex flex-wrap gap-2 mb-3">
                {data.skills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-md bg-paper-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-xs font-mono text-ink-600 dark:text-ink-200"
                  >
                    {s}
                    <button onClick={() => removeSkill(i)} aria-label={`Remove ${s}`} className="focus-ring text-ink-400 hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter"
                  className="focus-ring flex-1 h-10 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-paper-50 placeholder:text-ink-300 dark:placeholder:text-ink-500"
                />
                <button onClick={addSkill} className="focus-ring w-10 h-10 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 flex items-center justify-center shrink-0">
                  <Plus size={16} />
                </button>
              </div>
            </Field>

            <Field icon={GraduationCap} title="Education" onAdd={addEducation}>
              <div className="space-y-4">
                {data.education.map((ed, i) => (
                  <div key={i} className="rounded-lg border border-ink-200 dark:border-ink-700 p-4 relative">
                    <button
                      onClick={() => removeEducation(i)}
                      aria-label="Remove education"
                      className="focus-ring absolute top-3 right-3 text-ink-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid gap-3 pr-8">
                      <Input label="Degree" value={ed.degree} onChange={(v) => updateEducation(i, 'degree', v)} />
                      <Input label="Institute" value={ed.institute} onChange={(v) => updateEducation(i, 'institute', v)} />
                    </div>
                  </div>
                ))}
                {data.education.length === 0 && <EmptyRow label="No education added yet." />}
              </div>
            </Field>

            <Field icon={Briefcase} title="Experience" onAdd={addExperience}>
              <div className="space-y-4">
                {data.experience.map((ex, i) => (
                  <div key={i} className="rounded-lg border border-ink-200 dark:border-ink-700 p-4 relative">
                    <button
                      onClick={() => removeExperience(i)}
                      aria-label="Remove experience"
                      className="focus-ring absolute top-3 right-3 text-ink-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3 pr-8">
                      <Input label="Role" value={ex.role} onChange={(v) => updateExperience(i, 'role', v)} />
                      <Input label="Company" value={ex.company} onChange={(v) => updateExperience(i, 'company', v)} />
                      <Input label="Duration" value={ex.duration} onChange={(v) => updateExperience(i, 'duration', v)} className="sm:col-span-2" />
                    </div>
                    <div className="mt-3">
                      <TextArea label="Description" value={ex.desc} onChange={(v) => updateExperience(i, 'desc', v)} rows={2} />
                    </div>
                  </div>
                ))}
                {data.experience.length === 0 && <EmptyRow label="No experience added yet — click + to add a role." />}
              </div>
            </Field>

            <Field icon={FolderKanban} title="Projects" onAdd={addProject}>
              <div className="space-y-4">
                {data.projects.map((p, i) => (
                  <div key={i} className="rounded-lg border border-ink-200 dark:border-ink-700 p-4 relative">
                    <button
                      onClick={() => removeProject(i)}
                      aria-label="Remove project"
                      className="focus-ring absolute top-3 right-3 text-ink-300 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="pr-8 space-y-3">
                      <Input label="Project title" value={p.title} onChange={(v) => updateProject(i, 'title', v)} />
                      <TextArea label="Description" value={p.desc} onChange={(v) => updateProject(i, 'desc', v)} rows={2} />
                    </div>
                  </div>
                ))}
                {data.projects.length === 0 && <EmptyRow label="No projects added yet." />}
              </div>
            </Field>
          </div>

          {/* Live preview */}
          <div className="overflow-y-auto p-5 sm:p-6 bg-paper-100/60 dark:bg-ink-900/30">
            <ResumePreview data={data} template={template} previewRef={previewRef} />
          </div>
        </div>
      )}
    </div>
  )
}

function ResumePreview({ data, template, previewRef }) {
  const isClassic = template === 'classic'
  const isMinimal = template === 'minimal'
  const accentStyle = isMinimal ? { color: '#1A1F2B' } : { color: 'rgb(var(--accent-rgb))' }
  const borderStyle = isMinimal ? { borderColor: '#D8DBE2' } : { borderColor: 'rgb(var(--accent-rgb))' }

  return (
    <div
      ref={previewRef}
      className="mx-auto bg-white text-[#1A1F2B] w-full max-w-[720px] rounded-md shadow-lg p-8 sm:p-10 font-body"
      style={isClassic ? { fontFamily: 'Georgia, "Times New Roman", serif' } : undefined}
    >
      <div
        className={`flex gap-4 border-b-2 pb-5 ${
          isClassic ? 'flex-col items-center text-center' : 'flex-wrap items-start justify-between'
        }`}
        style={borderStyle}
      >
        <div>
          <div className={`font-display font-bold ${isClassic ? 'text-3xl tracking-wide' : 'text-2xl sm:text-3xl'}`}>
            {data.name || 'Your Name'}
          </div>
          <div className="mt-1 text-sm sm:text-base font-medium" style={accentStyle}>
            {data.title}
          </div>
        </div>
        <div className={`text-xs sm:text-sm text-[#4B5468] ${isClassic ? 'space-x-3' : 'text-right space-y-0.5'}`}>
          {isClassic ? (
            <span>{[data.email, data.phone, data.location].filter(Boolean).join('  ·  ')}</span>
          ) : (
            <>
              <div>{data.email}</div>
              <div>{data.phone}</div>
              <div>{data.location}</div>
            </>
          )}
        </div>
      </div>

      {data.summary && (
        <PreviewSection title="Summary" isMinimal={isMinimal}>
          <p className="text-sm leading-relaxed whitespace-pre-line">{data.summary}</p>
        </PreviewSection>
      )}

      {data.skills.length > 0 && (
        <PreviewSection title="Skills" isMinimal={isMinimal}>
          <p className="text-sm leading-relaxed">{data.skills.join(', ')}</p>
        </PreviewSection>
      )}

      {data.experience.length > 0 && (
        <PreviewSection title="Experience" isMinimal={isMinimal}>
          <div className="space-y-3">
            {data.experience.map((ex, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold">
                    {ex.role}{ex.company ? ` — ${ex.company}` : ''}
                  </span>
                  {ex.duration && <span className="text-xs text-[#8891A5]">{ex.duration}</span>}
                </div>
                {ex.desc && <p className="text-sm text-[#4B5468] leading-relaxed">{ex.desc}</p>}
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {data.education.length > 0 && (
        <PreviewSection title="Education" isMinimal={isMinimal}>
          <div className="space-y-1.5">
            {data.education.map((ed, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold">{ed.degree}</span>
                {ed.institute && <span className="text-[#4B5468]"> — {ed.institute}</span>}
              </div>
            ))}
          </div>
        </PreviewSection>
      )}

      {data.projects.length > 0 && (
        <PreviewSection title="Projects" isMinimal={isMinimal}>
          <div className="space-y-3">
            {data.projects.map((p, i) => (
              <div key={i}>
                <div className="text-sm font-semibold">{p.title}</div>
                {p.desc && <div className="text-sm text-[#4B5468] leading-relaxed">{p.desc}</div>}
              </div>
            ))}
          </div>
        </PreviewSection>
      )}
    </div>
  )
}

function TemplateSwatch({ id }) {
  if (id === 'minimal') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3 space-y-1.5">
        <div className="h-2 w-1/2 rounded bg-ink-900/20 dark:bg-paper-100/20" />
        <div className="h-1.5 w-1/3 rounded bg-ink-900/10 dark:bg-paper-100/10" />
        <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5 mt-2" />
        <div className="h-1 w-4/5 rounded bg-ink-900/5 dark:bg-paper-100/5" />
      </div>
    )
  }
  if (id === 'classic') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3 flex flex-col items-center">
        <div className="h-2 w-1/2 rounded bg-ink-900/20 dark:bg-paper-100/20" />
        <div className="h-1.5 w-1/3 rounded bg-mint-500/50 mt-1.5" />
        <div className="h-1 w-4/5 rounded bg-ink-900/5 dark:bg-paper-100/5 mt-2" />
        <div className="h-1 w-3/5 rounded bg-ink-900/5 dark:bg-paper-100/5 mt-1" />
      </div>
    )
  }
  return (
    <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3 space-y-1.5 border-t-2 border-mint-500">
      <div className="h-2 w-1/2 rounded bg-ink-900/20 dark:bg-paper-100/20 mt-1" />
      <div className="h-1.5 w-1/3 rounded bg-mint-500/60" />
      <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5 mt-2" />
    </div>
  )
}

function LandingCard({ icon: Icon, title, desc, onClick, iconSpin }) {
  return (
    <button
      onClick={onClick}
      className="focus-ring text-left rounded-xl border border-ink-200 dark:border-ink-700 p-5 hover:border-accent/50 hover:bg-accent/5 transition-colors"
    >
      <span className="w-10 h-10 rounded-lg bg-ink-900/5 dark:bg-mint-500/10 text-mint-600 dark:text-mint-400 flex items-center justify-center">
        <Icon size={18} className={iconSpin ? 'animate-spin' : ''} />
      </span>
      <p className="mt-3 font-display font-semibold text-sm text-ink-900 dark:text-paper-50">{title}</p>
      <p className="mt-1 text-xs text-ink-400 leading-relaxed">{desc}</p>
    </button>
  )
}

function Field({ icon: Icon, title, onAdd, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-ink-900 dark:text-paper-50">
          <Icon size={16} className="text-mint-500" />
          <h3 className="font-display font-semibold text-sm">{title}</h3>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="focus-ring inline-flex items-center gap-1 text-xs font-mono text-mint-600 dark:text-mint-400 hover:opacity-80"
          >
            <Plus size={13} /> add
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function Input({ label, value, onChange, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-[11px] font-mono text-ink-400 mb-1">{label}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring w-full h-10 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-paper-50"
      />
    </label>
  )
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <label className="block">
      {label && <span className="block text-[11px] font-mono text-ink-400 mb-1">{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="focus-ring w-full px-3 py-2.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-paper-50 resize-none"
      />
    </label>
  )
}

function EmptyRow({ label }) {
  return <p className="text-xs text-ink-400 font-mono italic">{label}</p>
}

function PreviewSection({ title, children, isMinimal }) {
  return (
    <div className="mt-5">
      <h3
        className={`font-display font-semibold text-xs tracking-wide uppercase ${
          isMinimal ? 'text-[#1A1F2B] border-b border-[#E4E8EF] pb-1' : 'text-[#8891A5]'
        }`}
      >
        {title}
      </h3>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}
