import React, { useEffect, useState, useRef } from 'react'
import { Palette, X, Check } from 'lucide-react'

const COLOR_PRESETS = [
  { name: 'Teal', rgb: '45 212 191' },
  { name: 'Indigo', rgb: '99 102 241' },
  { name: 'Rose', rgb: '244 63 94' },
  { name: 'Amber', rgb: '245 158 11' },
  { name: 'Sky', rgb: '56 189 248' },
  { name: 'Violet', rgb: '167 139 250' },
]

const FONT_PRESETS = [
  { name: 'Code (default)', display: '"Space Grotesk"', body: '"Inter"' },
  { name: 'Friendly', display: '"Poppins"', body: '"Roboto"' },
  { name: 'Editorial', display: '"Playfair Display"', body: '"Lora"' },
  { name: 'Startup', display: '"Sora"', body: '"Manrope"' },
]

const BG_PRESETS_DARK = [
  { name: 'Default', rgb: '10 13 20' },
  { name: 'Midnight Blue', rgb: '8 12 28' },
  { name: 'Charcoal', rgb: '17 17 20' },
  { name: 'Warm Black', rgb: '18 14 12' },
  { name: 'Deep Plum', rgb: '20 12 24' },
]

const BG_PRESETS_LIGHT = [
  { name: 'Default', rgb: '248 249 251' },
  { name: 'Warm White', rgb: '250 246 240' },
  { name: 'Cool White', rgb: '244 247 250' },
  { name: 'Soft Cream', rgb: '252 248 236' },
  { name: 'Pale Mint', rgb: '243 250 247' },
]

function hexToRgbString(hex) {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}

export default function ThemeEngine({ theme }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const [accent, setAccent] = useState(COLOR_PRESETS[0].rgb)
  const [font, setFont] = useState(FONT_PRESETS[0].name)
  const [bgDark, setBgDark] = useState(BG_PRESETS_DARK[0].rgb)
  const [bgLight, setBgLight] = useState(BG_PRESETS_LIGHT[0].rgb)

  const bgPresets = theme === 'dark' ? BG_PRESETS_DARK : BG_PRESETS_LIGHT
  const currentBg = theme === 'dark' ? bgDark : bgLight
  const setCurrentBg = theme === 'dark' ? setBgDark : setBgLight

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem('rp-theme-engine') || 'null')
      if (saved) {
        if (saved.accent) setAccent(saved.accent)
        if (saved.font) setFont(saved.font)
        if (saved.bgDark) setBgDark(saved.bgDark)
        if (saved.bgLight) setBgLight(saved.bgLight)
      }
    } catch (e) {}
  }, [])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-rgb', accent)
    const preset = FONT_PRESETS.find((f) => f.name === font) || FONT_PRESETS[0]
    document.documentElement.style.setProperty('--font-display', preset.display)
    document.documentElement.style.setProperty('--font-body', preset.body)
    try {
      window.localStorage.setItem('rp-theme-engine', JSON.stringify({ accent, font, bgDark, bgLight }))
    } catch (e) {}
  }, [accent, font, bgDark, bgLight])

  useEffect(() => {
    document.documentElement.style.setProperty('--bg-rgb', currentBg)
  }, [currentBg, theme])

  useEffect(() => {
    function onClickOutside(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="fixed bottom-5 right-5 z-[60]" ref={panelRef}>
      {open && (
        <div className="mb-3 w-72 max-h-[75vh] overflow-y-auto rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 shadow-2xl shadow-black/10 dark:shadow-black/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-semibold text-sm text-ink-900 dark:text-paper-50">
              Customize look
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="focus-ring w-7 h-7 rounded-md flex items-center justify-center text-ink-400 hover:text-ink-700 dark:hover:text-paper-100"
            >
              <X size={15} />
            </button>
          </div>

          <div className="mb-5">
            <p className="text-xs font-mono text-ink-400 mb-2.5">accent color</p>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c.name}
                  aria-label={c.name}
                  onClick={() => setAccent(c.rgb)}
                  className="focus-ring w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: `rgb(${c.rgb})` }}
                >
                  {accent === c.rgb && <Check size={14} className="text-white drop-shadow" />}
                </button>
              ))}
              <label
                className="focus-ring w-8 h-8 rounded-full border border-dashed border-ink-300 dark:border-ink-600 flex items-center justify-center cursor-pointer overflow-hidden relative"
                title="Custom color"
              >
                <span className="text-[10px] text-ink-400">✎</span>
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setAccent(hexToRgbString(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-mono text-ink-400 mb-2.5">
              background ({theme} mode)
            </p>
            <div className="flex flex-wrap gap-2.5">
              {bgPresets.map((c) => (
                <button
                  key={c.name}
                  aria-label={c.name}
                  title={c.name}
                  onClick={() => setCurrentBg(c.rgb)}
                  className="focus-ring w-8 h-8 rounded-full border border-ink-200 dark:border-ink-700 flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: `rgb(${c.rgb})` }}
                >
                  {currentBg === c.rgb && (
                    <Check
                      size={14}
                      className={theme === 'dark' ? 'text-white' : 'text-ink-900'}
                    />
                  )}
                </button>
              ))}
              <label
                className="focus-ring w-8 h-8 rounded-full border border-dashed border-ink-300 dark:border-ink-600 flex items-center justify-center cursor-pointer overflow-hidden relative"
                title="Custom background"
              >
                <span className="text-[10px] text-ink-400">✎</span>
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setCurrentBg(hexToRgbString(e.target.value))}
                />
              </label>
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-ink-400 mb-2.5">font pairing</p>
            <div className="space-y-1.5">
              {FONT_PRESETS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFont(f.name)}
                  className={`focus-ring w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                    font === f.name
                      ? 'bg-accent/10 text-accent border border-accent/40'
                      : 'border border-transparent hover:bg-paper-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300'
                  }`}
                  style={{ fontFamily: f.display }}
                >
                  {f.name}
                  {font === f.name && <Check size={14} className="text-accent shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open theme customizer"
        className="focus-ring w-12 h-12 rounded-full bg-ink-900 dark:bg-mint-500 text-paper-50 dark:text-ink-950 shadow-xl flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        <Palette size={19} />
      </button>
    </div>
  )
}
