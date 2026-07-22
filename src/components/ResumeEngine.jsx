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
  Camera,
} from 'lucide-react'

const STORAGE_KEY = 'rp-resume-data-v2'

const DEFAULT_DATA = {
  name: 'Rajesh Panwar',
  title: 'Full Stack Web Developer',
  photo: '',
  email: 'panwarrajesh2003@gmail.com',
  phone: '+91 7082589114',
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
  name: '', title: '', photo: '', email: '', phone: '', location: '', summary: '',
  skills: [], education: [], experience: [], projects: [],
}

const TEMPLATES = [
  { id: 'modern', name: 'Modern', desc: 'Accent color, clean sans-serif' },
  { id: 'minimal', name: 'Minimal', desc: 'Monochrome, lots of whitespace' },
  { id: 'classic', name: 'Classic', desc: 'Centered header, serif type' },
  { id: 'sidebar', name: 'Sidebar', desc: 'Photo header, two-column layout' },
  { id: 'elegant', name: 'Elegant', desc: 'Refined serif, centered photo' },
  { id: 'compact', name: 'Compact', desc: 'Dense layout, fits more content' },
  { id: 'timeline', name: 'Timeline', desc: 'Experience on a vertical timeline' },
  { id: 'bold', name: 'Bold', desc: 'Bold color header band with photo' },
  { id: 'corporate', name: 'Corporate', desc: 'Dark header bar, structured grid' },
  { id: 'creative', name: 'Creative', desc: 'Colored sidebar block with photo' },
]

function getSaved() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null')
  } catch (e) {
    return null
  }
}

function getInitials(name) {
  if (!name) return 'YN'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'YN'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ---------------------------------------------------------------- */
/* Resume text parsing — turns raw extracted text into real sections */
/* ---------------------------------------------------------------- */

const SECTION_HEADERS = [
  { key: 'summary', re: /^(professional\s+summary|career\s+summary|summary|career\s+objective|objective|profile|about\s+me)\s*:?$/i },
  { key: 'skills', re: /^(technical\s+skills|skills\s*(&|and)?\s*proficiencies|core\s+skills|key\s+skills|skills)\s*:?$/i },
  { key: 'experience', re: /^(work\s+experience|professional\s+experience|employment\s+history|experience)\s*:?$/i },
  { key: 'education', re: /^(educational\s+background|education|academic\s+background|academic\s+qualifications)\s*:?$/i },
  { key: 'projects', re: /^(personal\s+projects|academic\s+projects|key\s+projects|projects)\s*:?$/i },
]

const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec'
const DATE_RANGE_RE = new RegExp(
  `(\\b(?:${MONTHS})[a-z]*\\.?\\s+\\d{4}\\b|\\b\\d{4}\\b)\\s*(?:-|to|–|—)\\s*(present|\\b(?:${MONTHS})[a-z]*\\.?\\s+\\d{4}\\b|\\d{4})`,
  'i'
)

function isBulletLine(line) {
  return /^[•\-*▪◦·]\s*/.test(line)
}
function stripBullet(line) {
  return line.replace(/^[•\-*▪◦·]\s*/, '').replace(/^["'“]+|["'”]+$/g, '').trim()
}
function isDateLine(line) {
  return DATE_RANGE_RE.test(line)
}
function wordCount(line) {
  return line.split(/\s+/).filter(Boolean).length
}
function looksLikeHeaderLine(line) {
  return wordCount(line) <= 8 && !/[.!?]$/.test(line.trim())
}
function uniq(arr) {
  const seen = new Set()
  return arr.filter((v) => {
    const k = v.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function parseEducation(lines) {
  if (lines.length === 0) return []
  const markerRe = /^\([A-Za-z.]{2,8}\)$/
  const hasMarkers = lines.some((l) => markerRe.test(l))

  if (!hasMarkers) {
    return [{ degree: lines[0], institute: lines.slice(1).join(', ') }]
  }

  const entries = []
  let current = null
  for (const l of lines) {
    if (markerRe.test(l)) {
      if (current) entries.push(current)
      current = []
    } else if (current) {
      current.push(l)
    }
  }
  if (current) entries.push(current)

  return entries
    .filter((e) => e.length > 0)
    .map((e) => ({ degree: e[0], institute: e.slice(1).join(', ') }))
}

function parseExperience(lines) {
  const entries = []
  let pendingHeader = []
  let current = null

  for (const raw of lines) {
    const line = stripBullet(raw)
    if (!line) continue

    if (isDateLine(line)) {
      current = {
        role: pendingHeader[0] || '',
        company: pendingHeader.slice(1).join(' · '),
        duration: line,
        desc: [],
      }
      entries.push(current)
      pendingHeader = []
    } else if (looksLikeHeaderLine(line) && (!current || current.desc.length > 0)) {
      pendingHeader.push(line)
    } else if (current) {
      current.desc.push(line)
    } else {
      pendingHeader.push(line)
    }
  }

  return entries.map((e) => ({ role: e.role, company: e.company, duration: e.duration, desc: e.desc.join(' ') }))
}

function parseProjects(lines) {
  const entries = []
  let current = null

  for (const raw of lines) {
    if (!raw) continue
    const bullet = isBulletLine(raw)
    const stripped = stripBullet(raw)
    if (!stripped) continue

    const isTitle = !bullet && wordCount(stripped) <= 9 && !/[.!?]$/.test(stripped)
    if (isTitle || !current) {
      current = { title: stripped, desc: [] }
      entries.push(current)
    } else {
      current.desc.push(stripped)
    }
  }

  return entries.map((e) => ({ title: e.title, desc: e.desc.join(' ') }))
}

function parseResumeText(rawText) {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const joined = lines.join(' ')
  const emailMatch = joined.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)
  const phoneMatch = joined.match(/(\+?\d[\d\s().-]{7,}\d)/)
  const linkedinMatch = joined.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[^\s,]+/i)
  const githubMatch = joined.match(/(https?:\/\/)?(www\.)?github\.com\/[^\s,]+/i)

  let name = ''
  for (const l of lines.slice(0, 6)) {
    if (/[\w.+-]+@[\w-]+\.[\w.-]+/.test(l)) continue
    if (/\d{3,}/.test(l.replace(/\D/g, '')) && l.replace(/\D/g, '').length >= 7) continue
    if (SECTION_HEADERS.some((h) => h.re.test(l))) continue
    if (l.length <= 45 && /^[A-Za-z .'-]+$/.test(l)) {
      name = l
      break
    }
  }

  const found = []
  lines.forEach((l, idx) => {
    for (const h of SECTION_HEADERS) {
      if (h.re.test(l)) {
        found.push({ key: h.key, idx })
        break
      }
    }
  })
  found.sort((a, b) => a.idx - b.idx)

  if (found.length === 0) return null

  const sections = {}
  found.forEach((f, i) => {
    const end = i + 1 < found.length ? found[i + 1].idx : lines.length
    sections[f.key] = lines.slice(f.idx + 1, end).filter(Boolean)
  })

  const result = { ...EMPTY_DATA }
  if (name) result.name = name
  if (emailMatch) result.email = emailMatch[0]
  if (phoneMatch) result.phone = phoneMatch[0].replace(/\s+/g, ' ').trim()

  const links = [linkedinMatch?.[0], githubMatch?.[0]].filter(Boolean).join(' · ')

  if (sections.summary) {
    let summary = sections.summary.map(stripBullet).join(' ').trim()
    if (links) summary = summary ? `${summary}\n\n${links}` : links
    result.summary = summary
  } else if (links) {
    result.summary = links
  }

  if (sections.skills) {
    result.skills = uniq(
      sections.skills
        .flatMap((l) => stripBullet(l).split(/,|·|\u2022/))
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length <= 40)
    )
  }

  if (sections.education) result.education = parseEducation(sections.education)
  if (sections.experience) result.experience = parseExperience(sections.experience)
  if (sections.projects) result.projects = parseProjects(sections.projects)

  return result
}

/* ---------------------------------------------------------------- */

export default function ResumeEngine({ open, onClose }) {
  const [stage, setStage] = useState('landing')
  const [template, setTemplate] = useState('modern')
  const [data, setData] = useState(DEFAULT_DATA)
  const [saved, setSaved] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [importBanner, setImportBanner] = useState(false)
  const [importPartial, setImportPartial] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [downloadError, setDownloadError] = useState('')
  const previewRef = useRef(null)
  const fileInputRef = useRef(null)
  const photoInputRef = useRef(null)
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

  async function extractPdfText(file) {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
    const buf = await file.arrayBuffer()
    const doc = await pdfjsLib.getDocument({ data: buf }).promise
    let text = ''
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const rows = {}
      content.items.forEach((item) => {
        const y = Math.round(item.transform[5])
        if (!rows[y]) rows[y] = []
        rows[y].push(item)
      })
      const ys = Object.keys(rows).map(Number).sort((a, b) => b - a)
      const pageLines = ys
        .map((y) =>
          rows[y]
            .sort((a, b) => a.transform[4] - b.transform[4])
            .map((it) => it.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        )
        .filter(Boolean)
      text += pageLines.join('\n') + '\n'
    }
    return text
  }

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
        text = await extractPdfText(file)
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

      text = text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

      const parsed = parseResumeText(text)
      if (parsed) {
        setData(parsed)
        setImportPartial(false)
      } else {
        setData({ ...EMPTY_DATA, summary: text.slice(0, 6000) || 'Paste or type your resume content here.' })
        setImportPartial(true)
      }
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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setPhotoError('')
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please choose an image file (JPG, PNG, etc).')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setPhotoError('That image is a bit large — try one under 4MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => update('photo', reader.result)
    reader.onerror = () => setPhotoError('Couldn\u2019t read that image. Try a different file.')
    reader.readAsDataURL(file)
  }
  const removePhoto = () => update('photo', '')

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
    setDownloadError('')
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      // Make sure any <img> (e.g. the uploaded photo) is fully decoded before
      // we snapshot the DOM — otherwise html2canvas can grab a blank frame
      // or throw, which looks like "nothing happens" when Download is clicked.
      const imgs = Array.from(previewRef.current.querySelectorAll('img'))
      await Promise.all(
        imgs.map((img) =>
          img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true })
                img.addEventListener('error', resolve, { once: true })
                setTimeout(resolve, 3000)
              })
        )
      )
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
      }

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        imageTimeout: 15000,
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
      setDownloadError('Couldn\u2019t generate the PDF. If you added a photo, try a smaller image and download again.')
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-paper-50 dark:bg-ink-950 flex flex-col overflow-x-hidden">
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFile} />
      <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

      <div className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 h-14 sm:h-16 border-b border-ink-200 dark:border-ink-700 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {stage === 'editor' && (
            <button
              onClick={() => setStage('landing')}
              aria-label="Back"
              className="focus-ring w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-300 shrink-0"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="font-display font-semibold text-sm sm:text-lg text-ink-900 dark:text-paper-50 truncate">
              Resume Engine
            </h2>
            <p className="text-xs text-ink-400 font-mono hidden sm:block">
              {stage === 'landing' ? 'templates · upload · build from scratch' : 'edit anything · add sections · export PDF'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {stage === 'editor' && (
            <>
              <button
                onClick={handleSave}
                className="focus-ring inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-8 sm:h-9 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-paper-100 text-sm hover:border-accent/50 hover:text-accent transition-colors"
              >
                {saved ? <Check size={14} className="text-accent" /> : <Save size={14} />}
                <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="focus-ring inline-flex items-center gap-1.5 px-2.5 sm:px-4 h-8 sm:h-9 rounded-lg bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">{downloading ? 'Preparing…' : 'Download PDF'}</span>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            aria-label="Close resume engine"
            className="focus-ring w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-ink-200 dark:border-ink-700 flex items-center justify-center text-ink-500 dark:text-ink-300 hover:text-ink-900 dark:hover:text-paper-50"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {stage === 'landing' && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
            <p className="font-mono text-xs text-accent mb-2">01 · pick a template</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`focus-ring text-left rounded-xl border p-3 sm:p-4 transition-colors ${
                    template === t.id
                      ? 'border-accent bg-accent/5'
                      : 'border-ink-200 dark:border-ink-700 hover:border-accent/40'
                  }`}
                >
                  <TemplateSwatch id={t.id} />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-ink-900 dark:text-paper-50">{t.name}</span>
                    {template === t.id && <Check size={14} className="text-accent shrink-0" />}
                  </div>
                  <p className="text-xs text-ink-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>

            <p className="font-mono text-xs text-accent mt-8 sm:mt-10 mb-2">02 · start building</p>
            <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
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
                desc="PDF, DOCX, or TXT — we'll sort it into sections for you."
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

      {stage === 'editor' && (
        <div className="flex-1 min-h-0 grid lg:grid-cols-[1fr_1fr] overflow-hidden">
          <div className="min-w-0 overflow-y-auto p-4 sm:p-6 space-y-7 sm:space-y-8 border-b lg:border-b-0 lg:border-r border-ink-200 dark:border-ink-700">
            {downloadError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-300/50 bg-red-500/5 p-3.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  {downloadError}
                  <button onClick={() => setDownloadError('')} className="focus-ring block mt-1 text-xs underline">
                    dismiss
                  </button>
                </span>
              </div>
            )}
            {importBanner && (
              <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3.5 text-sm text-ink-600 dark:text-ink-200">
                <Sparkles size={15} className="text-accent shrink-0 mt-0.5" />
                <span>
                  {importPartial ? (
                    <>
                      We couldn't confidently detect section headings in that file, so the full text was placed in{' '}
                      <strong>Summary</strong> — cut and paste pieces of it into Skills, Experience, and Projects below.
                    </>
                  ) : (
                    <>
                      We sorted your file into <strong>Summary, Skills, Education, Experience,</strong> and{' '}
                      <strong>Projects</strong> automatically — automatic splitting isn't perfect, so double check each
                      section and adjust anything that landed in the wrong place.
                    </>
                  )}
                  <button onClick={() => setImportBanner(false)} className="focus-ring block mt-1 text-xs text-accent underline">
                    dismiss
                  </button>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
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
              <div className="flex items-center gap-3 mb-4">
                <Avatar photo={data.photo} name={data.name} size={56} />
                <div className="flex flex-col gap-1.5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="focus-ring inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-ink-200 dark:border-ink-700 text-xs font-mono text-ink-600 dark:text-ink-200 hover:border-accent/50 hover:text-accent transition-colors"
                    >
                      <Camera size={12} /> {data.photo ? 'Change photo' : 'Upload photo'}
                    </button>
                    {data.photo && (
                      <button
                        onClick={removePhoto}
                        className="focus-ring inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-xs font-mono text-ink-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-400 font-mono">
                    Optional — used by photo-style templates, ignored by text-only ones.
                  </p>
                  {photoError && <p className="text-[11px] text-red-500">{photoError}</p>}
                </div>
              </div>
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
                    className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-md bg-paper-100 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-xs font-mono text-ink-600 dark:text-ink-200 max-w-full"
                  >
                    <span className="truncate">{s}</span>
                    <button onClick={() => removeSkill(i)} aria-label={`Remove ${s}`} className="focus-ring text-ink-400 hover:text-red-500 shrink-0">
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
                  className="focus-ring flex-1 min-w-0 h-10 px-3 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-paper-50 placeholder:text-ink-300 dark:placeholder:text-ink-500"
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

          <div className="min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-6 bg-paper-100/60 dark:bg-ink-900/30">
            <ResumePreview data={data} template={template} previewRef={previewRef} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Shared preview building blocks                                    */
/* ---------------------------------------------------------------- */

function Avatar({ photo, name, size = 64, square = false, ring = false }) {
  const shapeClass = square ? 'rounded-lg' : 'rounded-full'
  const ringStyle = ring ? { boxShadow: '0 0 0 4px rgba(255,255,255,0.9)' } : undefined
  if (photo) {
    return (
      <img
        src={photo}
        alt={name || 'Photo'}
        className={`object-cover shrink-0 ${shapeClass}`}
        style={{ width: size, height: size, ...ringStyle }}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center font-display font-bold shrink-0 ${shapeClass}`}
      style={{ width: size, height: size, backgroundColor: '#E4E8EF', color: '#8891A5', fontSize: size / 2.6, ...ringStyle }}
    >
      {getInitials(name)}
    </div>
  )
}

function skillsInline(skills) {
  if (!skills.length) return null
  return <p className="text-sm leading-relaxed">{skills.join(', ')}</p>
}

function skillsChips(skills, chipClassName) {
  if (!skills.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s, i) => (
        <span key={i} className={chipClassName}>{s}</span>
      ))}
    </div>
  )
}

function educationSimple(education) {
  if (!education.length) return null
  return (
    <div className="space-y-1.5">
      {education.map((ed, i) => (
        <div key={i} className="text-sm">
          <span className="font-semibold">{ed.degree}</span>
          {ed.institute && <span className="text-[#4B5468]"> — {ed.institute}</span>}
        </div>
      ))}
    </div>
  )
}

function experienceSimple(experience) {
  if (!experience.length) return null
  return (
    <div className="space-y-3">
      {experience.map((ex, i) => (
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
  )
}

function projectsSimple(projects) {
  if (!projects.length) return null
  return (
    <div className="space-y-3">
      {projects.map((p, i) => (
        <div key={i}>
          <div className="text-sm font-semibold">{p.title}</div>
          {p.desc && <div className="text-sm text-[#4B5468] leading-relaxed">{p.desc}</div>}
        </div>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- */
/* Main preview switch                                               */
/* ---------------------------------------------------------------- */

function ResumePreview({ data, template, previewRef }) {
  const paperClass = 'mx-auto bg-white text-[#1A1F2B] w-full max-w-[720px] rounded-md shadow-lg font-body'

  /* ---------------- SIDEBAR ---------------- */
  if (template === 'sidebar') {
    return (
      <div ref={previewRef} className={`${paperClass} p-5 sm:p-8 md:p-10`}>
        <div className="flex gap-4 sm:gap-5 items-start pb-5 border-b-2" style={{ borderColor: 'rgb(var(--accent-rgb))' }}>
          <Avatar photo={data.photo} name={data.name} size={72} />
          <div className="min-w-0 flex-1">
            <div className="font-display font-bold text-xl sm:text-3xl break-words">{data.name || 'Your Name'}</div>
            <div className="mt-0.5 text-sm sm:text-base font-medium" style={{ color: 'rgb(var(--accent-rgb))' }}>{data.title}</div>
          </div>
        </div>
        {(data.email || data.phone || data.location) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-[#4B5468] py-3 border-b border-[#E4E8EF]">
            {data.email && <span className="break-words">{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        )}
        <div className="grid sm:grid-cols-[1fr_1.6fr] gap-x-6 gap-y-5 mt-5">
          <div className="space-y-5">
            {data.skills.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5]">Skills</h3>
                <div className="mt-2">{skillsChips(data.skills, 'inline-block px-2 py-1 rounded text-[11px] font-mono bg-[#F2F4F8] text-[#4B5468]')}</div>
              </div>
            )}
            {data.education.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5]">Education</h3>
                <div className="mt-2">{educationSimple(data.education)}</div>
              </div>
            )}
          </div>
          <div className="space-y-5 min-w-0">
            {data.summary && (
              <div>
                <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5]">Summary</h3>
                <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line">{data.summary}</p>
              </div>
            )}
            {data.experience.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5]">Experience</h3>
                <div className="mt-1.5">{experienceSimple(data.experience)}</div>
              </div>
            )}
            {data.projects.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5]">Projects</h3>
                <div className="mt-1.5">{projectsSimple(data.projects)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- ELEGANT ---------------- */
  if (template === 'elegant') {
    return (
      <div ref={previewRef} className={`${paperClass} p-6 sm:p-10 md:p-12`} style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        <div className="flex flex-col items-center text-center">
          <Avatar photo={data.photo} name={data.name} size={72} />
          <div className="mt-3 font-display font-bold text-2xl sm:text-3xl tracking-wide">{data.name || 'Your Name'}</div>
          <div className="mt-1 text-sm sm:text-base italic" style={{ color: 'rgb(var(--accent-rgb))' }}>{data.title}</div>
          <div className="mt-2 text-xs sm:text-sm text-[#8891A5]">
            {[data.email, data.phone, data.location].filter(Boolean).join('   ·   ')}
          </div>
          <div className="w-16 h-px bg-[#D8DBE2] mt-5" />
        </div>

        {data.summary && (
          <div className="mt-6 text-center">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8891A5]">Summary</h3>
            <p className="mt-2 text-sm leading-relaxed max-w-xl mx-auto">{data.summary}</p>
          </div>
        )}
        {data.skills.length > 0 && (
          <div className="mt-6 text-center">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8891A5]">Skills</h3>
            <p className="mt-2 text-sm">{data.skills.join('  ·  ')}</p>
          </div>
        )}
        {data.experience.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8891A5] text-center">Experience</h3>
            <div className="mt-3 space-y-3">{experienceSimple(data.experience)}</div>
          </div>
        )}
        {data.education.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8891A5] text-center">Education</h3>
            <div className="mt-3">{educationSimple(data.education)}</div>
          </div>
        )}
        {data.projects.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#8891A5] text-center">Projects</h3>
            <div className="mt-3 space-y-3">{projectsSimple(data.projects)}</div>
          </div>
        )}
      </div>
    )
  }

  /* ---------------- COMPACT ---------------- */
  if (template === 'compact') {
    return (
      <div ref={previewRef} className={`${paperClass} p-5 sm:p-7`}>
        <div className="flex items-start justify-between gap-3 pb-2 border-b" style={{ borderColor: 'rgb(var(--accent-rgb))' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            {data.photo && <Avatar photo={data.photo} name={data.name} size={36} />}
            <div className="min-w-0">
              <div className="font-display font-bold text-base sm:text-lg break-words">{data.name || 'Your Name'}</div>
              <div className="text-xs font-medium" style={{ color: 'rgb(var(--accent-rgb))' }}>{data.title}</div>
            </div>
          </div>
          <div className="text-[11px] text-[#4B5468] text-right shrink-0 leading-tight">
            {data.email && <div className="break-words">{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
        </div>

        {data.summary && (
          <p className="mt-2.5 text-xs leading-snug text-[#4B5468]">{data.summary}</p>
        )}

        {data.skills.length > 0 && (
          <div className="mt-2.5 text-xs">
            <span className="font-semibold uppercase tracking-wide text-[10px] text-[#8891A5] mr-1.5">Skills</span>
            {data.skills.join(', ')}
          </div>
        )}

        {data.experience.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold uppercase tracking-wide text-[10px] text-[#8891A5]">Experience</h3>
            <div className="mt-1 space-y-1.5">
              {data.experience.map((ex, i) => (
                <div key={i} className="text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                    <span className="font-semibold">{ex.role}{ex.company ? ` — ${ex.company}` : ''}</span>
                    {ex.duration && <span className="text-[10px] text-[#8891A5]">{ex.duration}</span>}
                  </div>
                  {ex.desc && <p className="text-[#4B5468] leading-snug">{ex.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold uppercase tracking-wide text-[10px] text-[#8891A5]">Education</h3>
            <div className="mt-1 space-y-1">
              {data.education.map((ed, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold">{ed.degree}</span>
                  {ed.institute && <span className="text-[#4B5468]"> — {ed.institute}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mt-3">
            <h3 className="font-semibold uppercase tracking-wide text-[10px] text-[#8891A5]">Projects</h3>
            <div className="mt-1 space-y-1.5">
              {data.projects.map((p, i) => (
                <div key={i} className="text-xs">
                  <span className="font-semibold">{p.title}</span>
                  {p.desc && <span className="text-[#4B5468]"> — {p.desc}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ---------------- TIMELINE ---------------- */
  if (template === 'timeline') {
    return (
      <div ref={previewRef} className={`${paperClass} p-5 sm:p-8 md:p-10`}>
        <div className="flex gap-4 items-center pb-5 border-b-2" style={{ borderColor: 'rgb(var(--accent-rgb))' }}>
          <Avatar photo={data.photo} name={data.name} size={64} />
          <div className="min-w-0">
            <div className="font-display font-bold text-xl sm:text-2xl break-words">{data.name || 'Your Name'}</div>
            <div className="text-sm font-medium" style={{ color: 'rgb(var(--accent-rgb))' }}>{data.title}</div>
            <div className="mt-1 text-xs text-[#8891A5]">
              {[data.email, data.phone, data.location].filter(Boolean).join('  ·  ')}
            </div>
          </div>
        </div>

        {data.summary && <p className="mt-4 text-sm leading-relaxed text-[#4B5468]">{data.summary}</p>}
        {data.skills.length > 0 && <div className="mt-3">{skillsInline(data.skills)}</div>}

        {data.experience.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5] mb-3">Experience</h3>
            <div className="relative pl-5 border-l-2" style={{ borderColor: '#E4E8EF' }}>
              {data.experience.map((ex, i) => (
                <div key={i} className="relative pb-4 last:pb-0">
                  <span
                    className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: 'rgb(var(--accent-rgb))' }}
                  />
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{ex.role}{ex.company ? ` — ${ex.company}` : ''}</span>
                    {ex.duration && <span className="text-xs text-[#8891A5]">{ex.duration}</span>}
                  </div>
                  {ex.desc && <p className="text-sm text-[#4B5468] leading-relaxed">{ex.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5] mb-3">Education</h3>
            <div className="relative pl-5 border-l-2" style={{ borderColor: '#E4E8EF' }}>
              {data.education.map((ed, i) => (
                <div key={i} className="relative pb-3 last:pb-0">
                  <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8891A5' }} />
                  <div className="text-sm font-semibold">{ed.degree}</div>
                  {ed.institute && <div className="text-xs text-[#4B5468]">{ed.institute}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.projects.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display font-semibold text-xs tracking-wide uppercase text-[#8891A5] mb-3">Projects</h3>
            <div className="space-y-3">{projectsSimple(data.projects)}</div>
          </div>
        )}
      </div>
    )
  }

  /* ---------------- BOLD ---------------- */
  if (template === 'bold') {
    return (
      <div ref={previewRef} className={paperClass} style={{ overflow: 'hidden' }}>
        <div className="px-6 sm:px-10 pt-8 sm:pt-10 pb-10 sm:pb-12 relative" style={{ backgroundColor: 'rgb(var(--accent-rgb))' }}>
          <div className="font-display font-bold text-2xl sm:text-4xl text-white">{data.name || 'Your Name'}</div>
          <div className="mt-1 text-sm sm:text-base text-white/85">{data.title}</div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-white/85">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
          <div className="absolute -bottom-8 right-6 sm:right-10">
            <Avatar photo={data.photo} name={data.name} size={72} ring />
          </div>
        </div>

        <div className="px-6 sm:px-10 pt-12 sm:pt-14 pb-8 sm:pb-10 space-y-5">
          {data.summary && (
            <div>
              <h3 className="font-display font-bold text-xs tracking-wide uppercase" style={{ color: 'rgb(var(--accent-rgb))' }}>Summary</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#4B5468]">{data.summary}</p>
            </div>
          )}
          {data.skills.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-xs tracking-wide uppercase" style={{ color: 'rgb(var(--accent-rgb))' }}>Skills</h3>
              <div className="mt-1.5">{skillsChips(data.skills, 'inline-block px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#F2F4F8] text-[#4B5468]')}</div>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-xs tracking-wide uppercase" style={{ color: 'rgb(var(--accent-rgb))' }}>Experience</h3>
              <div className="mt-1.5">{experienceSimple(data.experience)}</div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-xs tracking-wide uppercase" style={{ color: 'rgb(var(--accent-rgb))' }}>Education</h3>
              <div className="mt-1.5">{educationSimple(data.education)}</div>
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-xs tracking-wide uppercase" style={{ color: 'rgb(var(--accent-rgb))' }}>Projects</h3>
              <div className="mt-1.5">{projectsSimple(data.projects)}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ---------------- CORPORATE ---------------- */
  if (template === 'corporate') {
    return (
      <div ref={previewRef} className={paperClass} style={{ overflow: 'hidden' }}>
        <div className="px-6 sm:px-10 py-6 sm:py-8 flex items-center gap-4" style={{ backgroundColor: '#1A1F2B' }}>
          <Avatar photo={data.photo} name={data.name} size={64} square />
          <div className="min-w-0">
            <div className="font-display font-bold text-lg sm:text-2xl text-white break-words">{data.name || 'Your Name'}</div>
            <div className="text-xs sm:text-sm mt-0.5" style={{ color: 'rgb(var(--accent-rgb))' }}>{data.title}</div>
          </div>
        </div>
        <div className="px-6 sm:px-10 py-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#4B5468] border-b border-[#E4E8EF]">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>

        <div className="px-6 sm:px-10 py-6 grid sm:grid-cols-[1.5fr_1fr] gap-x-6 gap-y-5">
          <div className="space-y-5 min-w-0">
            {data.summary && (
              <div>
                <h3 className="font-display font-bold text-xs tracking-wide uppercase text-[#1A1F2B] border-b border-[#E4E8EF] pb-1">01 · Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4B5468]">{data.summary}</p>
              </div>
            )}
            {data.experience.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-xs tracking-wide uppercase text-[#1A1F2B] border-b border-[#E4E8EF] pb-1">02 · Experience</h3>
                <div className="mt-2">{experienceSimple(data.experience)}</div>
              </div>
            )}
            {data.projects.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-xs tracking-wide uppercase text-[#1A1F2B] border-b border-[#E4E8EF] pb-1">03 · Projects</h3>
                <div className="mt-2">{projectsSimple(data.projects)}</div>
              </div>
            )}
          </div>
          <div className="space-y-5">
            {data.skills.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-xs tracking-wide uppercase text-[#1A1F2B] border-b border-[#E4E8EF] pb-1">Skills</h3>
                <div className="mt-2">{skillsChips(data.skills, 'inline-block px-2 py-1 rounded text-[11px] font-mono bg-[#F2F4F8] text-[#4B5468]')}</div>
              </div>
            )}
            {data.education.length > 0 && (
              <div>
                <h3 className="font-display font-bold text-xs tracking-wide uppercase text-[#1A1F2B] border-b border-[#E4E8EF] pb-1">Education</h3>
                <div className="mt-2">{educationSimple(data.education)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ---------------- CREATIVE ---------------- */
  if (template === 'creative') {
    return (
      <div ref={previewRef} className={`${paperClass} grid sm:grid-cols-[1fr_1.7fr]`} style={{ overflow: 'hidden' }}>
        <div className="p-5 sm:p-7 text-white flex flex-col gap-5" style={{ backgroundColor: 'rgb(var(--accent-rgb))' }}>
          <Avatar photo={data.photo} name={data.name} size={64} square />
          <div>
            <div className="font-display font-bold text-lg">{data.name || 'Your Name'}</div>
            <div className="text-xs text-white/85 mt-0.5">{data.title}</div>
          </div>
          <div className="text-[11px] text-white/85 space-y-1 leading-relaxed">
            {data.email && <div className="break-words">{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
          {data.skills.length > 0 && (
            <div>
              <h3 className="text-[10px] tracking-wide uppercase text-white/70 mb-1.5">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {data.skills.map((s, i) => (
                  <span key={i} className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white/15">{s}</span>
                ))}
              </div>
            </div>
          )}
          {data.education.length > 0 && (
            <div>
              <h3 className="text-[10px] tracking-wide uppercase text-white/70 mb-1.5">Education</h3>
              <div className="space-y-1.5">
                {data.education.map((ed, i) => (
                  <div key={i} className="text-xs">
                    <div className="font-semibold">{ed.degree}</div>
                    {ed.institute && <div className="text-white/70 text-[10px]">{ed.institute}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-7 space-y-5 min-w-0">
          {data.summary && (
            <div>
              <h3 className="flex items-center gap-1.5 font-display font-semibold text-xs tracking-wide uppercase text-[#1A1F2B]">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'rgb(var(--accent-rgb))' }} /> Summary
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4B5468]">{data.summary}</p>
            </div>
          )}
          {data.experience.length > 0 && (
            <div>
              <h3 className="flex items-center gap-1.5 font-display font-semibold text-xs tracking-wide uppercase text-[#1A1F2B]">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'rgb(var(--accent-rgb))' }} /> Experience
              </h3>
              <div className="mt-2">{experienceSimple(data.experience)}</div>
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <h3 className="flex items-center gap-1.5 font-display font-semibold text-xs tracking-wide uppercase text-[#1A1F2B]">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'rgb(var(--accent-rgb))' }} /> Projects
              </h3>
              <div className="mt-2">{projectsSimple(data.projects)}</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ---------------- MODERN / MINIMAL / CLASSIC (default group) ---------------- */
  const isClassic = template === 'classic'
  const isMinimal = template === 'minimal'
  const accentStyle = isMinimal ? { color: '#1A1F2B' } : { color: 'rgb(var(--accent-rgb))' }
  const borderStyle = isMinimal ? { borderColor: '#D8DBE2' } : { borderColor: 'rgb(var(--accent-rgb))' }

  return (
    <div
      ref={previewRef}
      className={`${paperClass} p-5 sm:p-8 md:p-10`}
      style={isClassic ? { fontFamily: 'Georgia, "Times New Roman", serif' } : undefined}
    >
      <div
        className={`flex gap-4 border-b-2 pb-5 ${
          isClassic ? 'flex-col items-center text-center' : 'flex-wrap items-start justify-between'
        }`}
        style={borderStyle}
      >
        <div className={isClassic ? 'flex flex-col items-center' : 'flex items-center gap-4 min-w-0'}>
          {data.photo && <Avatar photo={data.photo} name={data.name} size={isClassic ? 64 : 56} />}
          <div className="min-w-0">
            <div className={`font-display font-bold ${isClassic ? 'text-2xl sm:text-3xl tracking-wide mt-2' : 'text-xl sm:text-3xl'}`}>
              {data.name || 'Your Name'}
            </div>
            <div className="mt-1 text-sm sm:text-base font-medium" style={accentStyle}>
              {data.title}
            </div>
          </div>
        </div>
        <div className={`text-xs sm:text-sm text-[#4B5468] ${isClassic ? 'sm:space-x-3' : 'text-right space-y-0.5'}`}>
          {isClassic ? (
            <span className="whitespace-pre-line">{[data.email, data.phone, data.location].filter(Boolean).join('  ·  ')}</span>
          ) : (
            <>
              <div className="break-words">{data.email}</div>
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
          {skillsInline(data.skills)}
        </PreviewSection>
      )}

      {data.experience.length > 0 && (
        <PreviewSection title="Experience" isMinimal={isMinimal}>
          {experienceSimple(data.experience)}
        </PreviewSection>
      )}

      {data.education.length > 0 && (
        <PreviewSection title="Education" isMinimal={isMinimal}>
          {educationSimple(data.education)}
        </PreviewSection>
      )}

      {data.projects.length > 0 && (
        <PreviewSection title="Projects" isMinimal={isMinimal}>
          {projectsSimple(data.projects)}
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
  if (id === 'sidebar') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3 flex gap-2">
        <div className="w-5 h-5 rounded-full bg-mint-500/50 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-1.5">
          <div className="h-1.5 w-2/3 rounded bg-ink-900/20 dark:bg-paper-100/20" />
          <div className="h-1 w-1/3 rounded bg-ink-900/10 dark:bg-paper-100/10" />
          <div className="flex gap-2 mt-2">
            <div className="w-1/3 space-y-1">
              <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
              <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
              <div className="h-1 w-4/5 rounded bg-ink-900/5 dark:bg-paper-100/5" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (id === 'elegant') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3 flex flex-col items-center">
        <div className="w-5 h-5 rounded-full bg-ink-900/15 dark:bg-paper-100/15" />
        <div className="h-1.5 w-1/2 rounded bg-ink-900/20 dark:bg-paper-100/20 mt-1.5" />
        <div className="h-1 w-1/3 rounded bg-mint-500/50 mt-1" />
        <div className="h-px w-1/3 bg-ink-900/10 dark:bg-paper-100/10 mt-2" />
      </div>
    )
  }
  if (id === 'compact') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3 space-y-1">
        <div className="h-1.5 w-2/3 rounded bg-ink-900/20 dark:bg-paper-100/20" />
        <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5 mt-1" />
        <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
        <div className="h-1 w-5/6 rounded bg-ink-900/5 dark:bg-paper-100/5" />
        <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
        <div className="h-1 w-2/3 rounded bg-ink-900/5 dark:bg-paper-100/5" />
      </div>
    )
  }
  if (id === 'timeline') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 p-3">
        <div className="h-1.5 w-1/2 rounded bg-ink-900/20 dark:bg-paper-100/20 mb-2" />
        <div className="relative pl-3 border-l-2 border-mint-500/40 space-y-1.5">
          <div className="relative"><span className="absolute -left-[13px] top-0.5 w-1.5 h-1.5 rounded-full bg-mint-500" /><div className="h-1 w-3/4 rounded bg-ink-900/10 dark:bg-paper-100/10" /></div>
          <div className="relative"><span className="absolute -left-[13px] top-0.5 w-1.5 h-1.5 rounded-full bg-mint-500" /><div className="h-1 w-2/3 rounded bg-ink-900/10 dark:bg-paper-100/10" /></div>
        </div>
      </div>
    )
  }
  if (id === 'bold') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 overflow-hidden flex flex-col">
        <div className="h-9 bg-mint-500/70 px-3 flex items-center">
          <div className="h-1.5 w-2/3 rounded bg-white/70" />
        </div>
        <div className="flex-1 p-3 space-y-1">
          <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
          <div className="h-1 w-4/5 rounded bg-ink-900/5 dark:bg-paper-100/5" />
        </div>
      </div>
    )
  }
  if (id === 'corporate') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 overflow-hidden flex flex-col">
        <div className="h-8 bg-[#1A1F2B] px-3 flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-mint-500/60" />
          <div className="h-1.5 w-1/2 rounded bg-white/70" />
        </div>
        <div className="flex-1 p-3 flex gap-2">
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
            <div className="h-1 w-4/5 rounded bg-ink-900/5 dark:bg-paper-100/5" />
          </div>
          <div className="w-1/3 space-y-1">
            <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
          </div>
        </div>
      </div>
    )
  }
  if (id === 'creative') {
    return (
      <div className="h-20 rounded-md bg-paper-100 dark:bg-ink-800 overflow-hidden flex">
        <div className="w-1/3 bg-mint-500/70 p-2 flex flex-col gap-1">
          <div className="w-4 h-4 rounded bg-white/70" />
          <div className="h-1 w-full rounded bg-white/50 mt-1" />
        </div>
        <div className="flex-1 p-2 space-y-1">
          <div className="h-1 w-full rounded bg-ink-900/5 dark:bg-paper-100/5" />
          <div className="h-1 w-4/5 rounded bg-ink-900/5 dark:bg-paper-100/5" />
          <div className="h-1 w-2/3 rounded bg-ink-900/5 dark:bg-paper-100/5" />
        </div>
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
      className="focus-ring text-left rounded-xl border border-ink-200 dark:border-ink-700 p-4 sm:p-5 hover:border-accent/50 hover:bg-accent/5 transition-colors"
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
    <div className="min-w-0">
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
    <label className={`block min-w-0 ${className}`}>
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
    <label className="block min-w-0">
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