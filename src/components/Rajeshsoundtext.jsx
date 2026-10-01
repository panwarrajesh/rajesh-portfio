import React, { useEffect, useRef, useState } from 'react'

/**
 * RajeshSoundText  (30 sounds + DJ lights)
 * Dots se "Rajesh" likha hota hai. Har akshar par hover/tap karo to
 * alag note bajta hai. Dots us sound ke hisaab se jagmagate hain aur
 * peeche DJ jaisi beams + floor light sound ke saath nachti hain.
 * 30 sound: guitar, harp, banjo, sitar, horror, bell, piano, music box,
 * marimba, xylophone, vibes, glass, kalimba, organ, synth, 8-bit, pluck,
 * pad, acid, e-piano, wobble, laser, flute, whistle, kick, snare, hi-hat,
 * clap, tom, cowbell. "Random" button har baar alag sound bajata hai.
 * Koi audio file / library / Tailwind nahi chahiye.
 *
 * Use:  <RajeshSoundText />   ya   <RajeshSoundText text="Rajesh" />
 * Browser ki rule: pehle page par ek baar click/tap karna padta hai.
 */

var A_MIN = [110,130.81,146.83,164.81,196,220,261.63,293.66,329.63,392,440,523.25]
var HORROR_N = [82.41,87.31,98,110,123.47,130.81,164.81,174.61,196,246.94,261.63,329.63]
// [id, emoji, label, hue, notes(multiplier or array), voice, params, reverb]
var RAJESH_SOUNDS = [
  ['guitar','🎸','Guitar',245,1,'ks',{sec:2.2,damp:.4985,lp:6000,k:9},.25],
  ['harp','🎼','Harp',160,2,'ks',{sec:3.2,damp:.4993,lp:7000,k:10},.4],
  ['banjo','🪕','Banjo',35,2,'ks',{sec:1.2,damp:.496,lp:9000,k:16},.15],
  ['sitar','🪔','Sitar',25,1,'ks',{sec:2.6,damp:.4992,lp:8000,k:14,det:1.007},.3],
  ['horror','👻','Horror',0,HORROR_N,'ks',{sec:4.5,damp:.4996,lp:1800,k:5,sub:1},.45],
  ['bell','🔔','Bell',190,2,'add',{p:[[1,1],[2,.45],[3.01,.25],[4.2,.12]],dec:3,tilt:1},.4],
  ['piano','🎹','Piano',210,1,'add',{p:[[1,1],[2,.5],[3,.3],[4,.18],[5,.1]],dec:1.8,tilt:.8,atk:.004},.25],
  ['musicbox','🎁','Music box',320,4,'add',{p:[[1,1],[3,.3],[6,.15]],dec:1.4,tilt:.6},.4],
  ['marimba','🪵','Marimba',30,2,'add',{p:[[1,1],[4,.3]],dec:.55,tilt:1,atk:.002},.2],
  ['xylophone','🌈','Xylophone',120,2,'add',{p:[[1,1],[3,.2],[6,.1]],dec:.3,tilt:1,atk:.002},.2],
  ['vibes','🌀','Vibes',270,2,'add',{p:[[1,1],[4,.15]],dec:2.5,tilt:.3,tr:5,td:.4},.4],
  ['glass','🥂','Glass',180,3,'add',{p:[[1,1],[2.76,.5],[5.4,.3],[8.93,.15]],dec:2.4,tilt:.8},.5],
  ['kalimba','🪶','Kalimba',60,2,'add',{p:[[1,1],[5.4,.25]],dec:.9,tilt:1,atk:.002},.3],
  ['organ','⛪','Organ',280,1,'add',{p:[[1,1],[2,.6],[3,.4],[4,.25]],dec:.9,tilt:0,atk:.02},.4],
  ['synth','🎛️','Synth',300,1,'osc',{w:'sawtooth',det:[-7,7],l0:3500,l1:400,ls:.5,q:6,dec:1.1},.3],
  ['8bit','👾','8-bit',130,2,'osc',{w:'square',l0:7000,l1:6000,ls:.3,dec:.25,atk:.002},.1],
  ['pluck','✨','Pluck',50,1,'osc',{w:'sawtooth',det:[-5,5],l0:3500,l1:300,ls:.3,dec:.45,atk:.003},.3],
  ['pad','☁️','Pad',230,1,'osc',{w:'sawtooth',det:[-12,0,12],l0:900,l1:900,ls:1,dec:1.7,atk:.25},.5],
  ['acid','🧪','Acid',90,.5,'osc',{w:'sawtooth',l0:2800,l1:220,ls:.25,q:14,dec:.35,atk:.003},.2],
  ['epiano','💿','E-Piano',340,1,'fm',{r:1,i:2.2,dec:1.4},.3],
  ['wobble','🌊','Wobble',200,.5,'wobble',{},.2],
  ['laser','⚡','Laser',310,1,'laser',{},.3],
  ['flute','🪈','Flute',150,2,'flute',{},.35],
  ['whistle','😗','Whistle',70,3,'whistle',{},.3],
  ['kick','🦶','Kick',350,1,'kick',{},.1],
  ['snare','🥁','Snare',15,1,'snare',{},.15],
  ['hat','🎩','Hi-hat',55,1,'hat',{},.1],
  ['clap','👏','Clap',330,1,'clap',{},.2],
  ['tom','🪘','Tom',20,1,'tom',{},.15],
  ['cowbell','🐄','Cowbell',45,1,'cow',{},.15]
]

function mountRajeshSound(canvas, opts) {
  opts = opts || {}
  var TEXT = opts.text || 'Rajesh'
  var W = 900, H = 420, TH = 300
  canvas.width = W; canvas.height = H
  canvas.style.touchAction = 'pan-y'
  var ctx = canvas.getContext('2d')
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  var MAP = {}
  RAJESH_SOUNDS.forEach(function (s) {
    MAP[s[0]] = { id: s[0], label: s[2], hue: s[3], type: s[5], o: s[6], wet: s[7],
      notes: Array.isArray(s[4]) ? s[4] : A_MIN.map(function (x) { return x * s[4] }) }
  })
  var style = 'guitar', muted = false, shuffle = false, fxId = ''

  // ---------- AUDIO ----------
  var ac = null, master, an, anData, dl, fb, wet, cache = {}, nbuf = null
  function applyFx(id) {
    if (!ac || fxId === id) return
    fxId = id
    var w = MAP[id].wet
    dl.delayTime.value = .12 + w * .3; fb.gain.value = w * .9; wet.gain.value = w
  }
  function ensure() {
    if (!ac) {
      var AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return null
      ac = new AC()
      master = ac.createGain(); master.gain.value = .55
      an = ac.createAnalyser(); an.fftSize = 512; anData = new Uint8Array(an.fftSize)
      dl = ac.createDelay(1); fb = ac.createGain(); wet = ac.createGain()
      master.connect(ac.destination); master.connect(an)
      master.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(ac.destination)
      applyFx(style)
    }
    if (ac.state === 'suspended') ac.resume()
    return ac
  }
  function note(type, fq, t, atk, dec, vol, dest, det) {
    var o = ac.createOscillator(), g = ac.createGain()
    o.type = type; o.frequency.value = fq
    if (det) o.detune.value = det
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(vol, t + atk)
    g.gain.exponentialRampToValueAtTime(.0001, t + atk + dec)
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + atk + dec + .05)
    return o
  }
  function nz() {
    if (!nbuf) {
      var n = ac.sampleRate; nbuf = ac.createBuffer(1, n, n)
      var d = nbuf.getChannelData(0)
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1
    }
    return nbuf
  }
  function noise(t, dur, type, fq, q, v) {
    var s = ac.createBufferSource(); s.buffer = nz()
    var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = fq; f.Q.value = q || 1
    var g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur)
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .02)
  }
  function filt(type, f0, f1, ls, q, dest) {
    var lp = ac.createBiquadFilter(); lp.type = type; lp.Q.value = q || 1
    var t = ac.currentTime
    lp.frequency.setValueAtTime(f0, t)
    if (f1 !== f0) lp.frequency.exponentialRampToValueAtTime(f1, t + ls)
    lp.connect(dest); return lp
  }
  function ksBuf(f, sec, damp) {
    var sr = ac.sampleRate, n = Math.floor(sr * sec), p = Math.max(2, Math.round(sr / f))
    var b = ac.createBuffer(1, n, sr), d = b.getChannelData(0), prev = 0, i
    for (i = 0; i < p; i++) { prev = prev * .5 + (Math.random() * 2 - 1) * .5; d[i] = prev }
    for (i = p; i < n; i++) d[i] = damp * (d[i - p] + d[i - p + 1])
    return b
  }
  var V = {
    ks: function (f, v, o, t, S) {
      var key = S.id + f
      if (!cache[key]) cache[key] = ksBuf(f, o.sec, o.damp)
      var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(o.lp, f * o.k)
      var g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + o.sec - .1)
      lp.connect(g); g.connect(master)
      function src(rate, vol) {
        var s = ac.createBufferSource(); s.buffer = cache[key]; s.playbackRate.value = rate
        var gg = ac.createGain(); gg.gain.value = vol; s.connect(gg); gg.connect(lp); s.start(t); s.stop(t + o.sec)
      }
      src(1, 1)
      if (o.det) src(o.det, .6)
      if (o.sub && Math.random() < .6) src(.5, .55)
    },
    add: function (f, v, o, t) {
      var tg = ac.createGain(); tg.gain.value = 1; tg.connect(master)
      if (o.tr) {
        var l = ac.createOscillator(), lg = ac.createGain()
        l.frequency.value = o.tr; lg.gain.value = o.td; l.connect(lg); lg.connect(tg.gain); l.start(t); l.stop(t + o.dec + .3)
      }
      o.p.forEach(function (p) {
        note('sine', f * p[0], t, o.atk || .004, o.dec / (1 + (o.tilt || 0) * (p[0] - 1) * .5), v * .5 * p[1], tg)
      })
    },
    osc: function (f, v, o, t) {
      var lp = filt('lowpass', o.l0, o.l1, o.ls || .4, o.q, master), det = o.det || [0]
      det.forEach(function (c) { note(o.w, f, t, o.atk || .005, o.dec, v * .5 / det.length, lp, c) })
    },
    fm: function (f, v, o, t) {
      var c = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(), g = ac.createGain()
      c.frequency.value = f; m.frequency.value = f * o.r
      mg.gain.setValueAtTime(f * o.i, t); mg.gain.exponentialRampToValueAtTime(f * .05, t + o.dec)
      m.connect(mg); mg.connect(c.frequency)
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v * .5, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + o.dec)
      c.connect(g); g.connect(master); c.start(t); m.start(t); c.stop(t + o.dec + .1); m.stop(t + o.dec + .1)
    },
    wobble: function (f, v, o, t) {
      var lp = filt('lowpass', 350, 350, 1, 8, master), l = ac.createOscillator(), lg = ac.createGain()
      l.frequency.value = 7; lg.gain.value = 320; l.connect(lg); lg.connect(lp.frequency); l.start(t); l.stop(t + 1.1)
      note('sawtooth', f, t, .01, 1, v * .6, lp)
    },
    laser: function (f, v, o, t) {
      var lp = filt('lowpass', 3500, 3500, 1, 1, master)
      var os = note('sawtooth', f * 8, t, .002, .3, v * .4, lp)
      os.frequency.exponentialRampToValueAtTime(f * .6, t + .28)
    },
    flute: function (f, v, o, t) {
      var os = note('sine', f, t, .06, .7, v * .5, master), l = ac.createOscillator(), lg = ac.createGain()
      l.frequency.value = 5.5; lg.gain.value = f * .008; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + .9)
      note('sine', f * 2, t, .06, .6, v * .07, master)
      noise(t, .4, 'bandpass', f * 2, 2, v * .1)
    },
    whistle: function (f, v, o, t) {
      var os = note('sine', f, t, .03, .6, v * .45, master), l = ac.createOscillator(), lg = ac.createGain()
      l.frequency.value = 5; lg.gain.value = f * .01; l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t + .7)
    },
    kick: function (f, v, o, t) {
      var os = note('sine', 160, t, .002, .4, v * 1.1, master)
      os.frequency.exponentialRampToValueAtTime(42, t + .13)
      noise(t, .012, 'highpass', 3000, 1, v * .3)
    },
    snare: function (f, v, o, t) { noise(t, .2, 'highpass', 1800, .7, v * .7); note('triangle', 185, t, .002, .12, v * .5, master) },
    hat: function (f, v, o, t) { noise(t, .07, 'highpass', 8000, .8, v * .55) },
    clap: function (f, v, o, t) {
      ;[0, .011, .022].forEach(function (d) { noise(t + d, .03, 'bandpass', 1500, 1.2, v * .7) })
      noise(t + .03, .18, 'bandpass', 1500, 1.2, v * .5)
    },
    tom: function (f, v, o, t) {
      var os = note('sine', f * 1.6, t, .003, .5, v * .9, master)
      os.frequency.exponentialRampToValueAtTime(f * .8, t + .15)
    },
    cow: function (f, v, o, t) {
      var bp = filt('bandpass', 800, 800, 1, 1, master)
      note('square', 560, t, .002, .35, v * .35, bp); note('square', 845, t, .002, .35, v * .35, bp)
    }
  }
  function pluck(f, v, id) {
    if (!ensure() || ac.state !== 'running') return false
    var S = MAP[id]
    applyFx(id)
    V[S.type](f, v, S.o, ac.currentTime, S)
    return true
  }

  // ---------- DOTTED TEXT ----------
  var m = document.createElement('canvas'); m.width = W; m.height = H
  var mc = m.getContext('2d')
  var fs = TH * .8
  mc.font = '900 ' + fs + 'px Georgia,"Times New Roman",serif'
  var tw = mc.measureText(TEXT).width
  if (tw > W * .94) { fs *= W * .94 / tw; mc.font = '900 ' + fs + 'px Georgia,"Times New Roman",serif'; tw = mc.measureText(TEXT).width }
  var sx = (W - tw) / 2
  mc.fillStyle = '#fff'; mc.textBaseline = 'middle'; mc.textAlign = 'left'
  mc.fillText(TEXT, sx, H / 2 + fs * .03)
  var bounds = []
  for (var bi = 0; bi < TEXT.length; bi++) bounds.push(sx + mc.measureText(TEXT.slice(0, bi)).width)
  bounds.push(sx + tw)
  var px = mc.getImageData(0, 0, W, H).data
  function letterOf(x) {
    for (var i = 0; i < TEXT.length; i++) if (x < bounds[i + 1]) return i
    return TEXT.length - 1
  }
  var dots = [], sp = 6, x, y
  for (y = 4; y < H - 4; y += sp) for (x = 4; x < W - 4; x += sp) {
    if (px[(y * W + x) * 4 + 3] > 120) dots.push({
      x: x, y: y, l: letterOf(x), vx: 0, vy: 0, s: 1.3 + Math.random() * .4,
      px: reduce ? x : Math.random() * W, py: reduce ? y : Math.random() * H
    })
  }
  function over(x, y) {
    for (var dy = -6; dy <= 6; dy += 6) for (var dx = -6; dx <= 6; dx += 6) {
      var xx = Math.round(x + dx), yy = Math.round(y + dy)
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue
      if (px[(yy * W + xx) * 4 + 3] > 120) return true
    }
    return false
  }

  // ---------- INTERACTION ----------
  var lg = [], lh = [], ripples = [], mouse = { x: -9999, y: -9999, a: false }, lastIdx = -1, lastT = 0
  var pulse = 0, bgHue = 245, bgTarget = 245, lvlS = 0
  for (var li = 0; li < TEXT.length; li++) { lg.push(0); lh.push(245) }
  function local(e) {
    var r = canvas.getBoundingClientRect()
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }
  }
  function trigger(p, force) {
    if (!over(p.x, p.y)) return
    var idx = letterOf(p.x), now = performance.now()
    if (!force && ((idx === lastIdx && now - lastT < 260) || now - lastT < 90)) return
    var id = shuffle ? RAJESH_SOUNDS[Math.floor(Math.random() * RAJESH_SOUNDS.length)][0] : style
    var S = MAP[id], upper = p.y < H / 2 ? 1 : 0
    var f = S.notes[(idx * 2 + upper) % S.notes.length]
    var hue = (S.hue + idx * 22 + upper * 12) % 360
    lg[idx] = 1; lh[idx] = hue; pulse = 1; bgTarget = hue
    ripples.push({ x: p.x, y: p.y, t: now, hue: hue })
    if (ripples.length > 10) ripples.shift()
    lastIdx = idx; lastT = now
    if (!muted) {
      ensure()
      if (pluck(f, .38 + .2 * (1 - p.y / H), id)) { if (opts.onPlayed) opts.onPlayed(S.label) }
    }
  }
  function onMove(e) { var p = local(e); mouse.x = p.x; mouse.y = p.y; mouse.a = true; trigger(p, false) }
  function onLeave() { mouse.a = false; mouse.x = mouse.y = -9999; lastIdx = -1 }
  function onDown(e) { ensure(); trigger(local(e), true) }
  function unlock() { ensure() }
  canvas.addEventListener('pointermove', onMove)
  canvas.addEventListener('pointerleave', onLeave)
  canvas.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })

  // ---------- DJ LIGHTS (background) ----------
  function lights(t, lvl) {
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#070914'; ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'lighter'
    var amp = .14 + lvl * .9 + pulse * .5, n = 7, i
    for (i = 0; i < n; i++) {
      var ox = W * (i + .5) / n
      var sw = reduce ? 0 : Math.sin(t * (.7 + i * .13) + i * 1.7) * .55
      var ang = Math.PI / 2 + sw + (i - (n - 1) / 2) * .12
      var len = H * 1.5, wd = .07 + lvl * .05, hue = (bgHue + i * 38) % 360
      var cx = Math.cos(ang) * len, cy = Math.sin(ang) * len
      var gr = ctx.createLinearGradient(ox, 0, ox + cx, cy)
      gr.addColorStop(0, 'hsla(' + hue + ',95%,60%,' + Math.min(.7, amp * .5) + ')')
      gr.addColorStop(1, 'hsla(' + hue + ',95%,60%,0)')
      ctx.fillStyle = gr
      ctx.beginPath(); ctx.moveTo(ox, 0)
      ctx.lineTo(ox + Math.cos(ang - wd) * len, Math.sin(ang - wd) * len)
      ctx.lineTo(ox + Math.cos(ang + wd) * len, Math.sin(ang + wd) * len)
      ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'hsla(' + hue + ',100%,75%,' + Math.min(1, .5 + amp) + ')'
      ctx.beginPath(); ctx.arc(ox, 5, 3 + amp * 4, 0, 6.2832); ctx.fill()
    }
    var fg = ctx.createRadialGradient(W / 2, H, 10, W / 2, H, W * .6)
    fg.addColorStop(0, 'hsla(' + bgHue + ',90%,55%,' + Math.min(.6, .12 + lvl * .6 + pulse * .4) + ')')
    fg.addColorStop(1, 'hsla(' + bgHue + ',90%,55%,0)')
    ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
  }

  // ---------- DRAW ----------
  var raf
  function frame() {
    var now = performance.now(), lvl = 0, i, k
    if (an) {
      an.getByteTimeDomainData(anData)
      var sum = 0
      for (i = 0; i < anData.length; i++) { var v = (anData[i] - 128) / 128; sum += v * v }
      lvl = Math.min(1, Math.sqrt(sum / anData.length) * 4)
    }
    lvlS = lvlS * .8 + lvl * .2
    pulse *= .94
    var diff = ((bgTarget - bgHue + 540) % 360) - 180
    bgHue = (bgHue + diff * .08 + 360) % 360
    for (i = 0; i < lg.length; i++) lg[i] *= .955
    lights(now / 1000, lvlS)
    for (k = 0; k < dots.length; k++) {
      var d = dots[k]
      if (mouse.a && !reduce) {
        var dx = d.px - mouse.x, dy = d.py - mouse.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 46) { var f = (46 - dist) / 46, a2 = Math.atan2(dy, dx); d.vx += Math.cos(a2) * f * 5; d.vy += Math.sin(a2) * f * 5 }
      }
      d.vx += (d.x - d.px) * .07; d.vy += (d.y - d.py) * .07
      d.vx *= .82; d.vy *= .82; d.px += d.vx; d.py += d.vy
      var g = lg[d.l] * .85, h = lh[d.l]
      for (i = 0; i < ripples.length; i++) {
        var r = ripples[i], age = (now - r.t) / 1000
        if (age > 2.2) continue
        var ddx = d.x - r.x, ddy = d.y - r.y, dd = Math.sqrt(ddx * ddx + ddy * ddy)
        var ring = Math.exp(-Math.pow(dd - age * 520, 2) / 4050) * Math.exp(-age * 1.4)
        if (ring > g) { g = ring; h = r.hue }
      }
      g = Math.min(1, g + lvlS * .12)
      ctx.fillStyle = 'hsl(' + (g > .03 ? h : bgHue) + ',' + (60 + g * 40) + '%,' + (72 + g * 22) + '%)'
      if (g > .2) {
        ctx.globalAlpha = g * .25
        ctx.beginPath(); ctx.arc(d.px, d.py, d.s + 3 + g * 5, 0, 6.2832); ctx.fill()
        ctx.globalAlpha = 1
      }
      ctx.beginPath(); ctx.arc(d.px, d.py, d.s * (1 + g * .9), 0, 6.2832); ctx.fill()
    }
    raf = requestAnimationFrame(frame)
  }
  frame()

  return {
    setStyle: function (s) { if (MAP[s]) { style = s; ensure(); applyFx(s); lastIdx = -1; bgTarget = MAP[s].hue } },
    setShuffle: function (v) { shuffle = !!v },
    setMuted: function (v) { muted = !!v },
    destroy: function () {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
      if (ac) ac.close()
    }
  }
}


export default function RajeshSoundText({ text = 'Rajesh' }) {
  const canvasRef = useRef(null)
  const api = useRef(null)
  const [style, setStyle] = useState('guitar')
  const [muted, setMuted] = useState(false)
  const [random, setRandom] = useState(false)
  const [locked, setLocked] = useState(true)
  const [now, setNow] = useState('')

  useEffect(() => {
    api.current = mountRajeshSound(canvasRef.current, {
      text,
      onPlayed: (label) => { setLocked(false); setNow(label) },
    })
    api.current.setStyle(style)
    api.current.setMuted(muted)
    api.current.setShuffle(random)
    return () => api.current && api.current.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  useEffect(() => { api.current && api.current.setStyle(style) }, [style])
  useEffect(() => { api.current && api.current.setMuted(muted) }, [muted])
  useEffect(() => { api.current && api.current.setShuffle(random) }, [random])

  const btn = (active) => ({
    padding: '6px 10px', borderRadius: 999, cursor: 'pointer', font: '600 12px system-ui, sans-serif',
    border: '1px solid ' + (active ? '#6366f1' : '#2a3050'),
    background: active ? '#6366f1' : '#151a2e', color: '#f4f5fb', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', background: '#070914', border: '1px solid #2a3050', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <canvas ref={canvasRef} aria-label={text} role="img" style={{ width: '100%', aspectRatio: '900 / 420', display: 'block' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 6, textAlign: 'center', font: '12px ui-monospace, monospace', color: '#9aa3c7', pointerEvents: 'none' }}>
          {locked ? 'pehle ek baar click karo, phir akshar par hover karo' : now}
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', padding: 12, background: '#0f1220' }}>
        {RAJESH_SOUNDS.map((s) => (
          <button key={s[0]} type="button" style={btn(style === s[0] && !random)} aria-pressed={style === s[0] && !random}
            onClick={() => { setRandom(false); setStyle(s[0]) }}>{s[1]} {s[2]}</button>
        ))}
        <button type="button" style={btn(random)} aria-pressed={random} onClick={() => setRandom((r) => !r)}>🎲 Random</button>
        <button type="button" style={btn(false)} aria-pressed={!muted} aria-label={muted ? 'Sound on karo' : 'Sound band karo'} onClick={() => setMuted((m) => !m)}>
          {muted ? '🔇 Muted' : '🔊 Sound'}
        </button>
      </div>
    </div>
  )
}