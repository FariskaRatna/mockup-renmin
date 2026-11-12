/* =====================================================================
   SIERA DELTA LIMA — Redesign v2 (mockup interaktif)
   Data: ../mock-data.js (dipakai bersama mockup lama). Tanpa backend.
   Pola: state tunggal -> render() string -> delegasi event via data-act.
   ===================================================================== */
'use strict'

/* ---------- 1. Utilitas ---------- */
const root = document.getElementById('root')
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
Object.assign(ICONS, {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 21V9m-5 5 5-5 5 5M4 3h16"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4m0 3h.01"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.5 7.5C3.8 9.3 2 12 2 12s4 7 10 7a10 10 0 0 0 4.4-1"/><path d="M9.9 10a3 3 0 0 0 4.2 4.2"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H4"/>',
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
  forward: '<path d="M15 5l6 6-6 6"/><path d="M21 11H9a6 6 0 0 0-6 6v2"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01M2 9a15 15 0 0 1 20 0"/>',
  cmd: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>'
})
const icon = (name, size = 18) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.info}</svg>`
const fmt = (v, o) => { const d = new Date(v); return isNaN(d) ? '—' : d.toLocaleDateString('id-ID', o || { day: 'numeric', month: 'short', year: 'numeric' }) }
const fmtDT = (v) => { const d = new Date(v); return isNaN(d) ? '—' : d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }
const initials = (n) => String(n || '').trim().split(/\s+/).slice(0, 2).map((x) => x[0].toUpperCase()).join('') || 'U'
const midnight = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const daysFrom = (iso) => Math.round((midnight(new Date(iso + (iso.length === 10 ? 'T00:00' : ''))) - midnight()) / 864e5)
function dueLabel(iso, done) {
  if (!iso) return '<span class="muted">—</span>'
  if (done) return `<span class="due">${fmt(iso)}</span>`
  const n = daysFrom(iso)
  if (n < 0) return `<span class="due late">${icon('alert', 13)} Terlambat ${-n} hari</span>`
  if (n === 0) return '<span class="due soon">Hari ini</span>'
  if (n === 1) return '<span class="due soon">Besok</span>'
  return `<span class="due">${n} hari lagi</span>`
}
const greet = () => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam' }
const plural = (n, w) => `${n} ${w}`
const UNIT_TONE = { urmin: 'urmin', ren: 'ren', sumda: 'sumda', binfung: 'binfung' }
const unitStyle = (id) => `background:var(--u-${UNIT_TONE[id] || 'urmin'}-soft);color:var(--u-${UNIT_TONE[id] || 'urmin'})`
const unitOf = (id) => UNITS.find((u) => u.id === id)
const UNIT_KEY_MAP = { urmin: 'urmin', ren: 'subbagren', sumda: 'subbagsumda', binfung: 'subbagbinfung' }
const UNIT_SHORT = { urmin: 'Urmin', ren: 'Subbagren', sumda: 'Subbagsumda', binfung: 'Subbagbinfung', subbagren: 'Subbagren', subbagsumda: 'Subbagsumda', subbagbinfung: 'Subbagbinfung' }

/* ---------- 2. Data kerja (salinan agar aksi peraga bisa mengubah status) ---------- */
const DB = {
  surat: SURAT_MASUK.map((x) => ({ ...x })),
  inbox: INBOX.map((x) => ({ ...x })),
  tasks: TASKS.map((x) => ({ ...x })),
  events: JSON.parse(JSON.stringify(TASK_EVENTS)),
  keluar: REGISTRY['urmin:surat-keluar'].items.map((x, i) => {
    const [tujuan, st] = x.info.split(' · ')
    return { ...x, tujuan, status: i === 2 ? 'Menunggu TTD Kabag' : st }
  }),
  users: ADMIN_USERS.map((x) => ({ ...x }))
}
DB.keluar.push({ id: 'sk-6', code: 'B/232/IX/2026/URM', title: 'Undangan sosialisasi SOP pengelolaan dokumen revisi 3', tujuan: 'Seluruh Subbagian BagRenmin', status: 'Menunggu TTD Kabag', classification: 'biasa', createdAt: new Date(Date.now() - 864e5 * 0.3).toISOString() })

const NEW_ACCOUNT = { id: 'u-008', username: 'gilang.m', email: 'gilang.m@contoh.test', displayName: 'Gilang Mahendra', roles: ['operator'], units: ['sumda'], primaryUnit: 'sumda', jabatan: 'Pengelola BMN', note: 'Akun baru: wajib ganti password sementara.', forceChange: true }
const ACCOUNTS = [...DEMO_ACCOUNTS, NEW_ACCOUNT]

/* ---------- 3. State ---------- */
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const state = {
  // Preferensi: 'light' | 'dark' | 'system' (panduan: pengguna bisa memilih eksplisit atau ikut OS)
  themePref: (() => { try { return localStorage.getItem('sdl-rd-theme') || 'system' } catch { return 'system' } })(),
  get theme() { return this.themePref === 'system' ? (prefersDark ? 'dark' : 'light') : this.themePref },
  set theme(v) { this.themePref = v },
  account: null,
  login: freshLogin(),
  route: { view: 'home' },
  nav: { open: false, collapsed: false, expanded: { urmin: true } },
  pop: null,
  drawer: null,
  dialog: null,
  palette: { open: false, q: '', idx: 0 },
  list: { q: '', status: 'all', cls: 'all' },
  portal: { detail: null },
  cal: { cursor: midnight() },
  role: { sel: 'operator' },
  toasts: [],
  read: new Set()
}
function freshLogin() {
  return { stage: 'cred', user: '', pass: '', showPw: false, caps: false, device: 'checking', err: '', fe: {}, otp: ['', '', '', '', '', ''], attempts: 5, expires: 0, resendAt: 0, np: '', np2: '', showNp: false }
}

/* ---------- 4. Render & fokus ---------- */
const seen = {}
// Kembalikan ' enter' hanya pada render pertama sebuah overlay, agar animasi tidak berulang saat mengetik.
const enter = (slot, key) => { const fresh = seen[slot] !== key; pendingSeen[slot] = key; return fresh ? ' enter' : '' }
let pendingSeen = {}
function render() {
  const a = document.activeElement
  const focusId = a && a.id
  const sel = a && 'selectionStart' in a ? [a.selectionStart, a.selectionEnd] : null
  document.documentElement.dataset.theme = state.theme
  pendingSeen = {}
  root.innerHTML = state.account && state.login.stage === 'done' ? appView() : loginView()
  for (const k of Object.keys(seen)) if (!(k in pendingSeen)) delete seen[k]
  Object.assign(seen, pendingSeen)
  if (focusId) {
    const el = document.getElementById(focusId)
    if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]) } catch {} }
  }
}
function focusLater(id) { requestAnimationFrame(() => { const el = document.getElementById(id); if (el) el.focus() }) }
function toast(msg, kind = 'ok') {
  const t = { id: Math.random(), msg, kind }
  state.toasts.push(t)
  render()
  setTimeout(() => { state.toasts = state.toasts.filter((x) => x !== t); render() }, 3200)
}

/* ---------- 5. Delegasi event ---------- */
const ACT = {}
root.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]')
  if (!el || !root.contains(el) || el.disabled) return
  const [name, ...args] = el.dataset.act.split(':')
  if (name === 'closebg' && ev.target !== el) return
  if (ACT[name]) { ev.preventDefault(); ACT[name](args.map(decodeURIComponent), el, ev) }
})
root.addEventListener('submit', (ev) => {
  const f = ev.target.closest('form[data-submit]')
  if (!f) return
  ev.preventDefault()
  ACT[f.dataset.submit] && ACT[f.dataset.submit]([], f, ev)
})
root.addEventListener('input', (ev) => {
  const el = ev.target
  if (el.dataset.otp != null) return otpInput(el, ev)
  if (!el.dataset.model) return
  setPath(el.dataset.model, el.type === 'checkbox' ? el.checked : el.value)
  if (el.dataset.model.startsWith('login.')) state.login.fe = {}
  if (el.dataset.model === 'palette.q') state.palette.idx = 0
  render()
})
root.addEventListener('change', (ev) => {
  const el = ev.target
  if (el.tagName === 'SELECT' && el.dataset.model) { setPath(el.dataset.model, el.value); render() }
})
function capsCheck(ev) {
  if (!ev.getModifierState || state.account) return
  const on = ev.getModifierState('CapsLock')
  if (on !== state.login.caps && ev.target.id === 'l-pass') { state.login.caps = on; render() }
}
document.addEventListener('keyup', capsCheck)
document.addEventListener('keydown', (ev) => {
  capsCheck(ev)
  if (ev.target.dataset && ev.target.dataset.otp != null) return otpKey(ev)
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'k' && state.login.stage === 'done') {
    ev.preventDefault(); ACT.palette(); return
  }
  if (state.palette.open) {
    const items = paletteItems()
    if (ev.key === 'ArrowDown') { ev.preventDefault(); state.palette.idx = Math.min(items.length - 1, state.palette.idx + 1); render() }
    if (ev.key === 'ArrowUp') { ev.preventDefault(); state.palette.idx = Math.max(0, state.palette.idx - 1); render() }
    if (ev.key === 'Enter' && items[state.palette.idx]) { ev.preventDefault(); runPalette(items[state.palette.idx]) }
  }
  if (ev.key === 'Escape') ACT.close()
})
document.addEventListener('click', (ev) => {
  if (state.pop && !ev.target.closest('.popover') && !ev.target.closest('[data-act^="pop:"]')) { state.pop = null; render() }
})
function setPath(path, value) {
  const parts = path.split('.')
  let n = state
  for (let i = 0; i < parts.length - 1; i++) n = n[parts[i]]
  n[parts[parts.length - 1]] = value
}
ACT.close = () => {
  if (state.palette.open) state.palette.open = false
  else if (state.dialog) state.dialog = null
  else if (state.drawer) state.drawer = null
  else if (state.portal.detail) state.portal.detail = null
  else if (state.pop) state.pop = null
  else if (state.nav.open) state.nav.open = false
  else return
  render()
}
ACT.closebg = () => ACT.close()
ACT.theme = () => {
  state.themePref = state.theme === 'dark' ? 'light' : 'dark'
  try { localStorage.setItem('sdl-rd-theme', state.themePref) } catch {}
  render()
}
ACT.noop = (a) => toast(a[0] || 'Aksi peraga — tidak ada data yang disimpan.')
/* =====================================================================
   6. LOGIN — kartu terpusat, 3 langkah
   ===================================================================== */
let deviceTimer = null
function startDeviceCheck() {
  // Padanan proof-of-work SHA-256 di LocalCaptcha.tsx: berjalan otomatis, tanpa klik.
  state.login.device = 'checking'
  clearTimeout(deviceTimer)
  deviceTimer = setTimeout(() => { state.login.device = 'ok'; if (!state.account || state.login.stage !== 'done') render() }, 1200)
}
let otpTimer = null
function startOtpClock() {
  clearInterval(otpTimer)
  otpTimer = setInterval(() => {
    const l = state.login
    if (l.stage !== 'otp') return clearInterval(otpTimer)
    const left = Math.max(0, Math.round((l.expires - Date.now()) / 1000))
    const el = document.getElementById('otp-clock')
    if (el) el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
    const rs = document.getElementById('otp-resend')
    const rl = Math.max(0, Math.round((l.resendAt - Date.now()) / 1000))
    if (rs) { rs.disabled = rl > 0; rs.textContent = rl > 0 ? `Kirim ulang (${rl} dtk)` : 'Kirim ulang kode' }
  }, 1000)
}
const maskEmail = (e) => { const [u, d] = e.split('@'); return `${u.slice(0, 2)}${'•'.repeat(Math.max(2, u.length - 2))}@${d}` }

ACT.pick = (a) => {
  const acc = ACCOUNTS.find((x) => x.id === a[0])
  Object.assign(state.login, { user: acc.username, pass: 'KataSandiPeraga2026!', err: '', fe: {} })
  render(); focusLater('l-submit')
}
ACT.togglepw = (a) => { const k = a[0] || 'showPw'; state.login[k] = !state.login[k]; render() }
ACT.login = () => {
  const l = state.login
  l.fe = {}; l.err = ''
  if (!l.user.trim()) l.fe.user = 'Masukkan username atau email.'
  if (!l.pass) l.fe.pass = 'Masukkan password.'
  if (l.fe.user || l.fe.pass) { render(); return focusLater(l.fe.user ? 'l-user' : 'l-pass') }
  if (l.device !== 'ok') return
  const acc = ACCOUNTS.find((x) => x.username === l.user.trim() || x.email === l.user.trim())
  if (!acc) {
    // Pesan generik: tidak membocorkan apakah username ada. CAPTCHA sekali pakai -> verifikasi ulang.
    l.err = 'Username atau password tidak sesuai. Periksa kembali lalu coba lagi.'
    l.pass = ''
    startDeviceCheck(); render(); return focusLater('l-pass')
  }
  l.acc = acc
  l.stage = 'otp'; l.otp = ['', '', '', '', '', '']; l.attempts = 5
  l.expires = Date.now() + 5 * 60e3; l.resendAt = Date.now() + 60e3
  render(); startOtpClock(); focusLater('otp-0')
}
function otpInput(el) {
  const l = state.login
  const i = Number(el.dataset.otp)
  const digits = el.value.replace(/\D/g, '')
  if (digits.length > 1) {                  // tempel 6 digit sekaligus
    digits.slice(0, 6 - i).split('').forEach((d, k) => { l.otp[i + k] = d })
  } else l.otp[i] = digits
  l.err = ''
  render()
  const next = l.otp.findIndex((x) => !x)
  if (next === -1) { ACT.verify(); return }
  if (digits) focusLater('otp-' + Math.min(5, digits.length > 1 ? next : i + 1))
}
function otpKey(ev) {
  const i = Number(ev.target.dataset.otp)
  if (ev.key === 'Backspace' && !state.login.otp[i] && i > 0) { ev.preventDefault(); state.login.otp[i - 1] = ''; render(); focusLater('otp-' + (i - 1)) }
  if (ev.key === 'ArrowLeft' && i > 0) focusLater('otp-' + (i - 1))
  if (ev.key === 'ArrowRight' && i < 5) focusLater('otp-' + (i + 1))
  if (ev.key === 'Enter') { ev.preventDefault(); ACT.verify() }
}
ACT.verify = () => {
  const l = state.login
  const code = l.otp.join('')
  if (code.length < 6) { l.err = 'Lengkapi keenam digit kode.'; render(); return focusLater('otp-' + l.otp.findIndex((x) => !x)) }
  if (Date.now() > l.expires) { l.err = 'Kode sudah kedaluwarsa. Minta kode baru.'; return render() }
  if (code === '000000') {
    l.attempts -= 1; l.otp = ['', '', '', '', '', '']
    l.err = l.attempts > 0 ? `Kode tidak sesuai. Sisa ${l.attempts} percobaan.` : 'Batas percobaan habis. Silakan masuk ulang.'
    if (l.attempts <= 0) { const u = l.user; state.login = freshLogin(); state.login.user = u; state.login.err = 'Batas percobaan OTP habis. Silakan masuk ulang.'; startDeviceCheck() }
    render(); return focusLater(l.attempts > 0 ? 'otp-0' : 'l-pass')
  }
  if (l.acc.forceChange) { l.stage = 'newpw'; l.err = ''; render(); return focusLater('l-np') }
  enterApp(l.acc)
}
ACT.resend = () => { const l = state.login; l.expires = Date.now() + 5 * 60e3; l.resendAt = Date.now() + 60e3; l.otp = ['', '', '', '', '', '']; l.err = ''; toast(`Kode baru dikirim ke ${maskEmail(l.acc.email)}.`); focusLater('otp-0') }
ACT.loginback = () => { const u = state.login.user; state.login = freshLogin(); state.login.user = u; startDeviceCheck(); render(); focusLater('l-pass') }
function pwRules(p, user) {
  return [
    ['Minimal 12 karakter', p.length >= 12],
    ['Huruf besar dan huruf kecil', /[a-z]/.test(p) && /[A-Z]/.test(p)],
    ['Minimal satu angka', /\d/.test(p)],
    ['Minimal satu simbol', /[^A-Za-z0-9]/.test(p)],
    ['Tidak memuat username', !!p && !p.toLowerCase().includes(String(user).toLowerCase())]
  ]
}
ACT.newpw = () => {
  const l = state.login
  const ok = pwRules(l.np, l.acc.username).every((r) => r[1])
  if (!ok) { l.err = 'Password baru belum memenuhi semua syarat.'; return render() }
  if (l.np !== l.np2) { l.fe = { np2: 'Konfirmasi tidak sama dengan password baru.' }; render(); return focusLater('l-np2') }
  enterApp({ ...l.acc, forceChange: false })
  toast('Password diperbarui. Sesi lain otomatis diakhiri.')
}
function enterApp(acc) {
  clearInterval(otpTimer)
  state.account = acc
  state.login.stage = 'done'
  state.route = { view: 'portal' }
  state.nav.expanded = { [acc.primaryUnit || 'urmin']: true }
  render(); window.scrollTo(0, 0); focusLater('main')
}
ACT.logout = () => {
  state.account = null; state.login = freshLogin(); state.pop = null; state.drawer = null; state.dialog = null
  startDeviceCheck(); render(); focusLater('l-user')
}

function brandMark() { return '<img class="logo" src="logo-densus88.png" alt="" width="40" height="40">' }

function loginView() {
  const l = state.login
  const stepIdx = l.stage === 'cred' ? 1 : l.stage === 'otp' ? 2 : 3
  const totalSteps = l.acc && l.acc.forceChange ? 3 : 2
  let card = ''
  if (l.stage === 'cred') {
    const ready = l.device === 'ok'
    card = `
      <div class="steps" aria-hidden="true">${Array.from({ length: 2 }, (_, i) => `<span class="${i < 1 ? 'on' : ''}"></span>`).join('')}</div>
      <div class="step-label">Langkah 1 dari 2</div>
      <h2>Masuk ke ruang kerja</h2>
      <p class="lede">Gunakan akun personel BagRenmin Anda.</p>
      ${l.err ? `<div class="alert alert--danger" role="alert">${icon('alert', 17)}<span>${esc(l.err)}</span></div>` : ''}
      <form data-submit="login" novalidate>
        <div class="field">
          <label for="l-user">Username atau email</label>
          <div class="input-wrap"><span class="lead-icon">${icon('user', 17)}</span>
            <input id="l-user" class="input input--icon" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="nama.pengguna" value="${esc(l.user)}" data-model="login.user" ${l.fe.user ? 'aria-invalid="true" aria-describedby="e-user"' : ''}></div>
          ${l.fe.user ? `<div id="e-user" class="field-error">${icon('alert', 13)} ${l.fe.user}</div>` : ''}
        </div>
        <div class="field">
          <div class="row-between"><label for="l-pass">Password</label><button type="button" class="text-btn" data-act="noop:${encodeURIComponent('Lupa password: hubungi Superadmin untuk reset. Password tidak bisa dipulihkan, hanya diganti.')}">Lupa password?</button></div>
          <div class="input-wrap"><span class="lead-icon">${icon('lock', 17)}</span>
            <input id="l-pass" class="input input--icon has-trail" type="${l.showPw ? 'text' : 'password'}" autocomplete="current-password" placeholder="Masukkan password" value="${esc(l.pass)}" data-model="login.pass" ${l.fe.pass ? 'aria-invalid="true" aria-describedby="e-pass"' : ''}>
            <button type="button" class="icon-btn trail-btn" data-act="togglepw" aria-label="${l.showPw ? 'Sembunyikan' : 'Tampilkan'} password" aria-pressed="${l.showPw}">${icon(l.showPw ? 'eyeoff' : 'eye', 18)}</button></div>
          ${l.fe.pass ? `<div id="e-pass" class="field-error">${icon('alert', 13)} ${l.fe.pass}</div>` : ''}
          ${l.caps ? `<div class="field-error caps" style="color:var(--warn)">${icon('alert', 13)} Caps Lock aktif</div>` : ''}
        </div>
        <div class="device-check ${l.device === 'ok' ? 'ok' : ''}" role="status" aria-live="polite">
          ${l.device === 'ok' ? icon('shield', 17) : '<span class="spinner" aria-hidden="true"></span>'}
          <span class="grow">${l.device === 'ok' ? 'Perangkat terverifikasi' : 'Memverifikasi perangkat secara lokal…'}</span>
        </div>
        <button id="l-submit" class="btn btn--primary btn--block btn--lg" type="submit" ${ready ? '' : 'aria-disabled="true"'} style="${ready ? '' : 'opacity:.7'}">${ready ? `Lanjutkan ${icon('arrow', 17)}` : 'Menunggu verifikasi…'}</button>
      </form>`
  } else if (l.stage === 'otp') {
    const left = Math.max(0, Math.round((l.expires - Date.now()) / 1000))
    const rl = Math.max(0, Math.round((l.resendAt - Date.now()) / 1000))
    card = `
      <div class="steps" aria-hidden="true">${Array.from({ length: totalSteps }, (_, i) => `<span class="${i < 2 ? 'on' : ''}"></span>`).join('')}</div>
      <div class="step-label">Langkah 2 dari ${totalSteps}</div>
      <h2>Masukkan kode verifikasi</h2>
      <p class="lede">Kode 6 digit dikirim ke <strong>${esc(maskEmail(l.acc.email))}</strong>. ${l.acc.roles.includes('superadmin') ? 'Superadmin selalu wajib OTP.' : ''}</p>
      ${l.err ? `<div class="alert alert--danger" role="alert">${icon('alert', 17)}<span>${esc(l.err)}</span></div>` : ''}
      <form data-submit="verify" novalidate>
        <fieldset style="border:0;padding:0;margin:0">
          <legend class="sr-only">Kode OTP enam digit</legend>
          <div class="otp">${l.otp.map((d, i) => `<input id="otp-${i}" data-otp="${i}" class="${d ? 'filled' : ''}" inputmode="numeric" autocomplete="${i === 0 ? 'one-time-code' : 'off'}" maxlength="${i === 0 ? 6 : 2}" value="${esc(d)}" aria-label="Digit ${i + 1}">`).join('')}</div>
        </fieldset>
        <div class="otp-meta"><span>Berlaku <b id="otp-clock">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</b></span><span>Sisa ${l.attempts} percobaan</span></div>
        <button class="btn btn--primary btn--block btn--lg" type="submit" style="margin-top:20px">Verifikasi &amp; masuk</button>
        <div class="row-between" style="margin-top:14px">
          <button type="button" class="text-btn" data-act="loginback">${icon('back', 14)} Ganti akun</button>
          <button type="button" id="otp-resend" class="text-btn" data-act="resend" ${rl > 0 ? 'disabled' : ''}>${rl > 0 ? `Kirim ulang (${rl} dtk)` : 'Kirim ulang kode'}</button>
        </div>
      </form>
      <div class="alert alert--gold" style="margin-top:18px">${icon('info', 16)}<span>Mockup: kode apa pun diterima, kecuali <b class="mono">000000</b> untuk melihat pesan salah kode.</span></div>`
  } else {
    const rules = pwRules(l.np, l.acc.username)
    const lv = rules.filter((r) => r[1]).length
    card = `
      <div class="steps" aria-hidden="true"><span class="on"></span><span class="on"></span><span class="on"></span></div>
      <div class="step-label">Langkah 3 dari 3</div>
      <h2>Buat password baru</h2>
      <p class="lede">Akun Anda masih memakai password sementara. Ganti sekarang untuk membuka ruang kerja.</p>
      ${l.err ? `<div class="alert alert--danger" role="alert">${icon('alert', 17)}<span>${esc(l.err)}</span></div>` : ''}
      <form data-submit="newpw" novalidate>
        <div class="field">
          <label for="l-np">Password baru</label>
          <div class="input-wrap"><input id="l-np" class="input has-trail" type="${l.showNp ? 'text' : 'password'}" autocomplete="new-password" value="${esc(l.np)}" data-model="login.np" aria-describedby="np-rules">
            <button type="button" class="icon-btn trail-btn" data-act="togglepw:showNp" aria-label="${l.showNp ? 'Sembunyikan' : 'Tampilkan'} password">${icon(l.showNp ? 'eyeoff' : 'eye', 18)}</button></div>
          <div class="pw-meter" data-lv="${Math.min(4, Math.max(l.np ? 1 : 0, lv - 1))}" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <ul class="pw-rules" id="np-rules">${rules.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${icon(ok ? 'check' : 'x', 13)} ${t}</li>`).join('')}</ul>
        </div>
        <div class="field">
          <label for="l-np2">Ulangi password baru</label>
          <input id="l-np2" class="input" type="${l.showNp ? 'text' : 'password'}" autocomplete="new-password" value="${esc(l.np2)}" data-model="login.np2" ${l.fe.np2 ? 'aria-invalid="true"' : ''}>
          ${l.fe.np2 ? `<div class="field-error">${icon('alert', 13)} ${l.fe.np2}</div>` : ''}
        </div>
        <button class="btn btn--primary btn--block btn--lg" type="submit" style="margin-top:20px">Simpan &amp; masuk</button>
      </form>`
  }
  return `<div class="auth">
    <header class="auth-top">
      <span></span>
      <span class="auth-tag">Portal internal</span>
      <button class="icon-btn" style="color:#c9d3e3" data-act="theme" aria-label="Ganti ke mode ${state.theme === 'dark' ? 'terang' : 'gelap'}">${icon(state.theme === 'dark' ? 'sun' : 'moon')}</button>
    </header>
    <main class="auth-center" id="main" tabindex="-1">
      <div class="auth-stack">
        <div class="auth-brand"><img class="auth-logo" src="logo-densus88.png" alt="Lambang Densus 88 AT Polri" width="84" height="84"><h1>SIERA DELTA LIMA</h1><p>BagRenmin Densus 88 AT Polri</p></div>
        <section class="auth-card${enter('auth', l.stage)}" aria-labelledby="auth-title">${card.replace('<h2>', '<h2 id="auth-title">')}</section>
        ${l.stage === 'cred' ? `<div class="demo-picker">
          <div><span>Pilih akun peraga untuk mengisi otomatis</span><span class="demo-tag">MOCKUP</span></div>
          <div class="demo-list">${ACCOUNTS.map((a) => `<button type="button" class="${l.user === a.username ? 'on' : ''}" data-act="pick:${a.id}"><strong>${esc(a.displayName)}</strong><small>${esc(a.jabatan)}</small></button>`).join('')}</div>
        </div>` : ''}
      </div>
    </main>
    ${toastsView()}
  </div>`
}
/* =====================================================================
   7. KERANGKA APLIKASI — header tetap di semua halaman (pola produksi)
      + sidebar navy khusus ruang kerja unit, dengan pengalih unit.
   ===================================================================== */
const me = () => state.account
const isSA = () => me().roles.includes('superadmin')
const isLeader = () => me().roles.includes('leader')
const canUnit = (u) => !isSA() && me().units.includes(u)
const SA_VIEWS = ['portal', 'executive', 'users', 'roles', 'audit', 'profile', 'roadmap']
const myTasks = () => DB.tasks.filter((t) => t.assigneeId === me().id)
const issuedTasks = () => DB.tasks.filter((t) => t.issuerId === me().id)
const reviewTasks = () => issuedTasks().filter((t) => t.status === 'completed' && t.reviewStatus === 'awaiting_review')
const activeMine = () => myTasks().filter((t) => t.status !== 'completed')
const pendingInbox = () => DB.inbox.filter((i) => i.status === 'sent')
const awaitingSign = () => DB.keluar.filter((k) => k.status === 'Menunggu TTD Kabag')
const runningDirectives = () => DIRECTIVES.filter((d) => d.status === 'Berjalan')
const inboxTarget = () => canUnit('urmin') ? 'go:unit:urmin:surat-masuk:inbox' : me().units[0] ? `go:unit:${me().units[0]}:inbox` : 'go:portal'
const tugasTarget = () => canUnit('urmin') ? 'go:unit:urmin:disposisi' : me().units[0] ? `go:unit:${me().units[0]}:tugas` : 'go:portal'

ACT.go = (a) => {
  let [view, unit, menu, tab] = a
  if (view === 'home') view = 'portal'
  if (isSA() && !SA_VIEWS.includes(view)) { toast('Superadmin hanya mengelola identitas — ruang kerja operasional tidak tersedia.', 'err'); return }
  state.route = { view, unit: unit || null, menu: menu || '', tab: tab || '' }
  state.list = { q: '', status: 'all', cls: 'all' }
  state.drawer = null; state.pop = null; state.nav.open = false; state.palette.open = false
  render(); window.scrollTo(0, 0)
}
ACT.collapse = () => { state.nav.collapsed = !state.nav.collapsed; render() }
ACT.navopen = () => { state.nav.open = !state.nav.open; state.pop = null; render() }
ACT.pop = (a) => { state.pop = state.pop === a[0] ? null : a[0]; render() }

function headerItems() {
  const r = state.route
  const it = (act, label, ic, count, cur) => ({ act, label, ic, count, cur })
  if (isSA()) return [
    it('go:portal', 'Portal', 'grid', 0, r.view === 'portal'),
    it('go:executive', 'Dashboard', 'chart', 0, r.view === 'executive'),
    it('go:users', 'Pengguna', 'users', 0, r.view === 'users'),
    it('go:roles', 'Role & Izin', 'key', 0, r.view === 'roles'),
    it('go:audit', 'Audit', 'activity', 0, r.view === 'audit')
  ]
  return [
    it('go:portal', 'Portal', 'grid', 0, r.view === 'portal'),
    ...(isLeader() ? [it('go:executive', 'Dashboard', 'chart', 0, r.view === 'executive')] : []),
    it('go:arahan', 'Arahan', 'bell', runningDirectives().length, r.view === 'arahan'),
    it(inboxTarget(), 'Inbox', 'inbox', pendingInbox().length, r.tab === 'inbox' || r.menu === 'inbox'),
    it(tugasTarget(), 'Tugas', 'clipboard', activeMine().length + reviewTasks().length, r.menu === 'disposisi' || r.menu === 'tugas')
  ]
}

function notifications() {
  if (isSA()) {
    return DB.users.filter((u) => u.forcePasswordChange).map((u) => ({ id: 'pw-' + u.id, ic: 'key', tone: 'warn', title: `${u.displayName} belum mengganti password sementara`, sub: '@' + u.username, act: `goopen:users:user:${u.id}` }))
  }
  const list = []
  activeMine().filter((t) => daysFrom(t.dueDate) < 0).forEach((t) => list.push({ id: 'od-' + t.id, ic: 'alert', tone: 'danger', title: `Disposisi terlambat ${-daysFrom(t.dueDate)} hari`, sub: t.subject, act: `open:task:${t.id}`, task: t }))
  myTasks().filter((t) => t.status === 'pending').forEach((t) => list.push({ id: 'pd-' + t.id, ic: 'clipboard', tone: 'info', title: 'Disposisi baru, menunggu diterima', sub: t.subject, act: `open:task:${t.id}`, task: t }))
  pendingInbox().forEach((i) => list.push({ id: i.id, ic: 'inbox', tone: 'info', title: 'Surat diteruskan kepada Anda', sub: i.subject, act: `open:inbox:${i.id}` }))
  reviewTasks().forEach((t) => list.push({ id: 'rv-' + t.id, ic: 'check', tone: 'info', title: 'Hasil tindak lanjut perlu Anda review', sub: t.subject, act: `open:task:${t.id}`, task: t }))
  if (isLeader()) awaitingSign().forEach((k) => list.push({ id: 'tt-' + k.id, ic: 'pen', tone: 'warn', title: 'Surat keluar menunggu tanda tangan Anda', sub: k.title, act: `open:keluar:${k.id}` }))
  return list
}
ACT.notif = (a) => { state.read.add(a[0]); state.pop = null; const [k, ...rest] = a.slice(1); ACT[k] && ACT[k](rest) }
ACT.readall = () => { notifications().forEach((n) => state.read.add(n.id)); render() }

function header() {
  const a = me()
  const n = notifications()
  const unread = n.filter((x) => !state.read.has(x.id)).length
  return `<header class="hdr">
    <button class="icon-btn hdr-burger" data-act="navopen" aria-label="${state.nav.open ? 'Tutup' : 'Buka'} menu" aria-expanded="${state.nav.open}">${icon(state.nav.open ? 'x' : 'menu')}</button>
    <button class="brand" data-act="go:portal" aria-label="SIERA DELTA LIMA — ke Portal">${brandMark()}<span class="brand-words"><strong>SIERA DELTA LIMA</strong><small>BagRenmin Densus 88 AT Polri</small></span></button>
    <nav class="hdr-nav" aria-label="Navigasi utama">${headerItems().map((x) => `<button class="hdr-link" ${x.cur ? 'aria-current="page"' : ''} data-act="${x.act}" title="${x.label}">${icon(x.ic, 17)}<span>${x.label}</span>${x.count ? `<span class="hdr-count" aria-label="${x.count} item">${x.count}</span>` : ''}</button>`).join('')}</nav>
    <div class="hdr-tools">
      <button class="hdr-search" data-act="palette" aria-label="Cari (Ctrl+K)">${icon('search', 16)}<span>Cari</span><span class="kbd">Ctrl K</span></button>
      <div style="position:relative">
        <button class="icon-btn" data-act="pop:notif" aria-label="Notifikasi${unread ? `, ${unread} belum dibaca` : ''}" aria-expanded="${state.pop === 'notif'}">${icon('bell')}${unread ? `<span class="dot-badge">${unread}</span>` : ''}</button>
        ${state.pop === 'notif' ? `<div class="popover notif" role="dialog" aria-label="Notifikasi">
          <div class="pop-head"><strong>Notifikasi</strong>${unread ? '<button class="text-btn" data-act="readall">Tandai semua dibaca</button>' : ''}</div>
          ${n.length ? n.map((x) => `<button class="notif-item ${state.read.has(x.id) ? '' : 'unread'}" data-act="notif:${x.id}:${x.act}"><span class="ic tone-${x.tone}">${icon(x.ic, 16)}</span><span><strong>${esc(x.title)}</strong><small>${esc(x.sub)}</small></span></button>`).join('') : `<div class="empty"><p>Tidak ada yang perlu ditindaklanjuti.</p></div>`}
        </div>` : ''}
      </div>
      <button class="icon-btn" data-act="theme" aria-label="Ganti ke mode ${state.theme === 'dark' ? 'terang' : 'gelap'}">${icon(state.theme === 'dark' ? 'sun' : 'moon')}</button>
      <div style="position:relative">
        <button class="account-btn" data-act="pop:account" aria-expanded="${state.pop === 'account'}" aria-label="Menu akun ${esc(a.displayName)}"><span class="avatar">${initials(a.displayName)}</span><span class="who"><strong>${esc(a.displayName)}</strong><small>${esc(a.jabatan)}</small></span></button>
        ${state.pop === 'account' ? `<div class="popover" role="menu">
          <div class="pop-head"><div><strong>${esc(a.displayName)}</strong><div class="muted" style="font-size:12px">@${esc(a.username)}</div></div></div>
          <div class="pop-sep"></div>
          <button class="pop-item" role="menuitem" data-act="go:profile">${icon('user', 16)} Profil &amp; keamanan</button>
          <button class="pop-item" role="menuitem" data-act="go:roadmap">${icon('list', 16)} Roadmap</button>
          <div class="pop-label">Ganti akun peraga</div>
          ${ACCOUNTS.filter((x) => x.id !== a.id && !x.forceChange).map((x) => `<button class="pop-item" role="menuitem" data-act="switch:${x.id}">${icon('refresh', 16)} ${esc(x.displayName)}</button>`).join('')}
          <div class="pop-sep"></div>
          <button class="pop-item danger" role="menuitem" data-act="logout">${icon('logout', 16)} Keluar</button>
          <div class="pop-label" style="font-weight:400">Mockup · seluruh data fiktif</div>
        </div>` : ''}
      </div>
    </div>
  </header>`
}
ACT.switch = (a) => { const acc = ACCOUNTS.find((x) => x.id === a[0]); enterApp(acc); toast(`Masuk sebagai ${acc.displayName}.`) }

function mobileNav() {
  return `<div class="scrim scrim--nav" data-act="navopen"></div>
  <nav class="mnav" aria-label="Menu">${headerItems().map((x) => `<button class="pop-item" ${x.cur ? 'aria-current="page"' : ''} data-act="${x.act}">${icon(x.ic, 18)} <span style="flex:1">${x.label}</span>${x.count ? `<span class="chip chip--plain">${x.count}</span>` : ''}</button>`).join('')}
    ${!isSA() ? `<div class="pop-label">Ruang kerja unit</div>${UNITS.filter((u) => canUnit(u.id)).map((u) => `<button class="pop-item" data-act="go:unit:${u.id}">${icon(u.icon, 18)} ${u.title}</button>`).join('')}` : ''}
    <div class="pop-sep"></div>
    <button class="pop-item" data-act="go:profile">${icon('user', 18)} Profil &amp; keamanan</button>
    <button class="pop-item danger" data-act="logout">${icon('logout', 18)} Keluar</button></nav>`
}

function urminLinks() {
  const r = state.route
  const cur = (m) => r.view === 'unit' && r.unit === 'urmin' && r.menu === m ? 'aria-current="page"' : ''
  const items = [
    ['', 'Dashboard', 'grid'],
    ['surat-masuk', 'Surat Masuk', 'inbox', pendingInbox().length],
    ['surat-keluar', 'Surat Keluar', 'send', isLeader() ? awaitingSign().length : 0],
    ['disposisi', 'Disposisi', 'clipboard', activeMine().length + reviewTasks().length],
    ['berkas', 'Berkas Kerja', 'folder'],
    ['agenda', 'Agenda & Rapat', 'calendar'],
    ['arsip', 'Arsip', 'archive']
  ]
  return `<div class="ws-group">MENU UTAMA</div>` + items.map(([m, l, ic, n]) => `<button class="ws-link" ${cur(m)} data-act="go:unit:urmin:${m}" title="${l}">${icon(ic, 18)}<span class="label">${l}</span>${n ? `<span class="count">${n}</span>` : ''}</button>`).join('')
}
function unitLinks(u) {
  const r = state.route
  const cur = (m) => r.view === 'unit' && r.unit === u.id && r.menu === m ? 'aria-current="page"' : ''
  const link = (m, l, ic, n) => `<button class="ws-link" ${cur(m)} data-act="go:unit:${u.id}:${m}" title="${esc(l)}">${icon(ic, 18)}<span class="label">${esc(l)}</span>${n ? `<span class="count">${n}</span>` : ''}</button>`
  const tasks = DB.tasks.filter((t) => t.unit === u.id && t.status !== 'completed').length
  return `<div class="ws-group">RINGKASAN</div>${link('', 'Dashboard Unit', 'grid')}
    <div class="ws-group">DISTRIBUSI</div>${link('inbox', 'Inbox Distribusi', 'inbox', pendingInbox().length)}${link('tugas', 'Tugas Disposisi', 'clipboard', tasks)}
    <div class="ws-group">BERKAS &amp; TUGAS</div>${link('berkas', 'Berkas, Foto & Disposisi', 'folder')}
    <div class="ws-group">LAYANAN OPERASIONAL</div>${u.modules.map((m) => link(m.id, m.title, m.icon)).join('')}`
}
function wsSidebar(u) {
  const units = UNITS.filter((x) => canUnit(x.id))
  return `<aside class="ws-side" aria-label="Menu ${u.title}">
    <div class="ws-unit">
      <button class="unit-switch" ${units.length > 1 ? 'data-act="pop:units"' : ''} aria-haspopup="${units.length > 1}" aria-expanded="${state.pop === 'units'}" title="${units.length > 1 ? 'Ganti unit' : u.title}">
        <span class="unit-ic">${icon(u.icon, 17)}</span><span class="unit-txt"><strong>${u.title}</strong><small>${u.name}</small></span>${units.length > 1 ? icon('chevron', 14).replace('<svg', '<svg class="caret"') : ''}</button>
      ${state.pop === 'units' ? `<div class="popover" role="menu" aria-label="Pilih unit">${units.map((x) => `<button class="pop-item" role="menuitem" ${x.id === u.id ? 'aria-current="true"' : ''} data-act="go:unit:${x.id}">${icon(x.icon, 16)}<span><b>${x.title}</b><br><small>${x.name}</small></span></button>`).join('')}</div>` : ''}
    </div>
    <nav class="ws-scroll" aria-label="Menu ${u.title}">${u.id === 'urmin' ? urminLinks() : unitLinks(u)}
      <div class="only-sm"><div class="ws-group">UMUM</div>${headerItems().map((x) => `<button class="ws-link" data-act="${x.act}">${icon(x.ic, 18)}<span class="label">${x.label}</span>${x.count ? `<span class="count">${x.count}</span>` : ''}</button>`).join('')}</div>
    </nav>
    <div class="ws-foot">
      <button class="ws-link" data-act="go:portal" title="Kembali ke Portal">${icon('back', 18)}<span class="label">Kembali ke Portal</span></button>
      <button class="ws-link ws-collapse" data-act="collapse" aria-label="${state.nav.collapsed ? 'Lebarkan' : 'Ciutkan'} menu samping">${icon('sidebar', 18)}<span class="label">Ciutkan menu</span></button>
    </div>
  </aside>`
}

function crumbs() {
  const r = state.route
  const u = unitOf(r.unit)
  const parts = [['Portal', 'go:portal'], [u.title, r.menu ? `go:unit:${u.id}` : '']]
  if (r.menu) parts.push([menuTitle(u, r.menu)])
  return `<nav class="crumbs" aria-label="Breadcrumb">${parts.map(([t, act], i) => i === parts.length - 1 ? `<strong aria-current="page">${esc(t)}</strong>` : `<button data-act="${act}">${esc(t)}</button>${icon('chevron', 12)}`).join('')}</nav>`
}
function menuTitle(u, m) {
  const fixed = { inbox: 'Inbox Distribusi', tugas: 'Tugas Disposisi', berkas: u.id === 'urmin' ? 'Berkas Kerja' : 'Berkas, Foto & Disposisi', disposisi: 'Disposisi', agenda: 'Agenda & Rapat', arsip: 'Arsip' }
  if (fixed[m]) return fixed[m]
  const mod = u.modules.find((x) => x.id === m)
  return mod ? mod.title : u.name
}

function toastsView() {
  return state.toasts.length ? `<div class="toasts" role="status" aria-live="polite">${state.toasts.map((t) => `<div class="toast ${t.kind}${enter('t' + t.id, 1)}">${icon(t.kind === 'err' ? 'alert' : 'check', 17)}<span>${esc(t.msg)}</span></div>`).join('')}</div>` : ''
}

function appView() {
  const r = state.route
  const ws = r.view === 'unit' && canUnit(r.unit)
  return `<div class="app ${state.nav.collapsed ? 'is-collapsed' : ''} ${state.nav.open ? 'nav-open' : ''}">
    ${header()}
    ${ws ? `<div class="ws">${wsSidebar(unitOf(r.unit))}${state.nav.open ? '<div class="scrim scrim--nav" data-act="navopen"></div>' : ''}<main class="ws-main" id="main" tabindex="-1">${crumbs()}${page()}</main></div>`
         : `${state.nav.open ? mobileNav() : ''}<main class="page" id="main" tabindex="-1">${page()}</main>`}
    ${state.drawer ? drawerView() : ''}
    ${state.dialog ? dialogView() : ''}
    ${state.portal.detail ? postDialog(state.portal.detail) : ''}
    ${state.palette.open ? paletteView() : ''}
    ${toastsView()}
  </div>`
}

function page() {
  const r = state.route
  if (r.view === 'unit') {
    if (!canUnit(r.unit)) return deniedView()
    return unitPage(unitOf(r.unit), r.menu, r.tab)
  }
  const views = { portal: portalView, arahan: arahanView, executive: executiveView, users: usersView, roles: rolesView, audit: auditView, profile: profileView, roadmap: roadmapView }
  if (['users', 'roles', 'audit'].includes(r.view) && !isSA()) return deniedView('Hanya Superadmin yang mengelola akun dan role.')
  if (r.view === 'executive' && !isLeader() && !isSA()) return deniedView('Dashboard pimpinan hanya untuk pimpinan.')
  return (views[r.view] || portalView)()
}
function deniedView(why) {
  return `<div class="card"><div class="empty" style="padding:48px 20px"><span class="ic">${icon('lock', 22)}</span><h3>Akses tidak tersedia</h3><p>${esc(why || 'Akun Anda tidak memiliki grant untuk ruang kerja ini.')}</p><button class="btn" data-act="go:portal">${icon('back', 16)} Kembali ke Portal</button></div></div>`
}
function pageHead(eyebrow, title, desc, actions) {
  return `<div class="page-head"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${title}</h1>${desc ? `<p>${desc}</p>` : ''}</div>${actions ? `<div class="page-actions">${actions}</div>` : ''}</div>`
}
function stat(label, value, foot, ic, tone, act) {
  const tag = act ? 'button' : 'div'
  return `<${tag} class="card stat ${tone === 'danger' && value ? 'is-alert' : ''}" ${act ? `data-act="${act}"` : ''}><div class="stat-top"><span>${label}</span><span class="stat-ic tone-${tone}">${icon(ic, 17)}</span></div><div class="value">${value}</div><div class="foot">${foot}</div></${tag}>`
}

/* =====================================================================
   8. BLOK BERSAMA — daftar tindakan, agenda, audit
   ===================================================================== */
function actionRows(list, limit) {
  const order = { danger: 0, warn: 1, info: 2, ok: 3 }
  const rows = list.slice().sort((a, b) => order[a.tone] - order[b.tone]).slice(0, limit || 99)
  if (!rows.length) return `<div class="empty"><span class="ic">${icon('check', 20)}</span><h3>Tidak ada yang tertunda</h3><p>Tidak ada surat, disposisi, atau review yang menunggu Anda.</p></div>`
  return `<div class="action-list">${rows.map((x) => `<button class="action-row" data-act="${x.act}">
    <span class="ic tone-${x.tone}">${icon(x.ic, 17)}</span>
    <span style="min-width:0"><strong>${esc(x.sub)}</strong><small>${esc(x.title)}</small></span>
    <span class="end">${x.chip || ''}${icon('chevron', 15)}</span></button>`).join('')}</div>`
}
function upcomingAgenda(days) {
  const t = dayKey(midnight())
  const end = dayKey(new Date(Date.now() + days * 864e5))
  return AGENDA.filter((a) => a.status !== 'Dibatalkan' && a.tanggal >= t && a.tanggal <= end).sort((a, b) => (a.tanggal + a.waktu).localeCompare(b.tanggal + b.waktu))
}
function agendaRows(list) {
  if (!list.length) return `<div class="empty"><p>Tidak ada agenda dalam periode ini.</p></div>`
  const t = dayKey(midnight())
  return list.map((a) => `<button class="agenda-row" data-act="post:pa-${a.id}">
    <span class="date-tile ${a.tanggal === t ? 'today' : ''}"><b>${fmt(a.tanggal, { day: '2-digit' })}</b><small>${fmt(a.tanggal, { month: 'short' })}</small></span>
    <span><strong>${esc(a.title)}</strong><small>${a.waktu} WIB · ${esc(a.lokasi)}</small></span></button>`).join('')
}
function auditRows(list) {
  return list.map((e) => `<div class="action-row"><span class="ic tone-info">${icon(e.type === 'role' ? 'key' : 'user', 16)}</span>
    <span style="min-width:0"><strong>${esc(e.reason)}</strong><small><span class="mono">${esc(e.key)}</span> · ${esc(e.subject)} · oleh ${esc(e.actor)}</small></span><span class="end" style="font-size:12px">${fmtDT(e.at)}</span></div>`).join('')
}
function workPanel() {
  const items = notifications().map((n) => ({ ...n, chip: n.task ? dueLabel(n.task.dueDate, n.task.status === 'completed') : n.ic === 'inbox' ? '<span class="chip chip--info">Belum diterima</span>' : n.ic === 'pen' ? '<span class="chip chip--warn">Perlu TTD</span>' : '' }))
  const late = activeMine().filter((t) => daysFrom(t.dueDate) < 0).length
  const week = upcomingAgenda(7)
  const cell = (n, label, act, alert) => `<button class="${alert && n ? 'is-alert' : ''}" data-act="${act}"><b>${n}</b><span>${label}</span></button>`
  return `<section class="card" aria-labelledby="work-t">
    <div class="card-head"><div><h2 id="work-t">Perlu tindakan Anda</h2><p>${items.length ? `${items.length} item, diurutkan dari yang paling mendesak` : 'Semua pekerjaan Anda sudah ditindaklanjuti'}</p></div>
      <div class="page-actions">${canUnit('urmin') && !isLeader() ? `<button class="btn btn--primary btn--sm" data-act="dlg:surat-baru">${icon('plus', 15)} Catat surat masuk</button>` : ''}${isLeader() && awaitingSign().length ? `<button class="btn btn--primary btn--sm" data-act="go:unit:urmin:surat-keluar">${icon('pen', 15)} ${awaitingSign().length} surat perlu TTD</button>` : ''}</div></div>
    <div class="work-stats">
      ${cell(pendingInbox().length, 'Inbox belum diterima', inboxTarget())}
      ${cell(activeMine().length, 'Disposisi aktif', tugasTarget())}
      ${cell(late, 'Terlambat', tugasTarget(), true)}
      ${cell(week.length, 'Agenda 7 hari', 'go:portal:::agenda')}
    </div>
    <div class="card-body">${actionRows(items, 6)}</div></section>`
}
function saPanel() {
  const users = DB.users
  return `<div class="alert alert--info" style="margin-bottom:16px">${icon('shield', 17)}<span><strong>Akun administrator identitas.</strong> Superadmin mengelola pengguna, role, dan grant. Ruang kerja unit sengaja tidak tersedia untuk akun ini.</span></div>
  <div class="grid grid-4" style="margin-bottom:16px">
    ${stat('Akun aktif', users.filter((u) => u.active).length, `dari ${users.length} akun`, 'users', 'info', 'go:users')}
    ${stat('Wajib ganti password', users.filter((u) => u.forcePasswordChange).length, 'Ruang kerja masih terblokir', 'key', 'warn', 'go:users')}
    ${stat('Akun nonaktif', users.filter((u) => !u.active).length, 'Akses dicabut', 'lock', 'info', 'go:users')}
    ${stat('Role aktif', ADMIN_ROLES.filter((r) => r.active).length, `${PERMISSION_CATALOG.length} izin dalam katalog`, 'shield', 'info', 'go:roles')}
  </div>
  <section class="card"><div class="card-head"><div><h2>Aktivitas identitas terbaru</h2><p>Dari jejak audit</p></div><button class="text-btn" data-act="go:audit">Lihat semua</button></div><div class="card-body">${auditRows(AUDIT_EVENTS.slice(0, 4))}</div></section>`
}
/* =====================================================================
   9. PORTAL INFORMASI
   ===================================================================== */
const KIND = { berita: 'Berita', pengumuman: 'Pengumuman', sop: 'SOP', peraturan: 'Peraturan', agenda: 'Agenda' }
ACT.post = (a) => { state.portal.detail = [...POSTS, ...PORTAL_AGENDA].find((p) => p.id === a[0]); render() }
function portalView() {
  const tab = state.route.tab || 'home'
  const news = POSTS.filter((x) => x.kind === 'berita')
  const ann = POSTS.filter((x) => x.kind === 'pengumuman')
  const docs = POSTS.filter((x) => x.kind === 'sop' || x.kind === 'peraturan')
  const tabs = [['home', 'Beranda'], ['news', 'Berita & Pengumuman'], ['agenda', 'Kalender'], ['docs', 'SOP & Peraturan']]
  const newsRow = (x) => `<button class="news-row" data-act="post:${x.id}"><span class="img">${icon('news', 20)}</span><span><span class="kicker-sm">${KIND[x.kind]} · ${fmt(x.updatedAt)}</span><strong>${esc(x.title)}</strong></span></button>`
  const docRow = (x) => `<button class="doc-row" data-act="post:${x.id}"><span class="ic">${icon('book', 17)}</span><span><strong>${esc(x.title)}</strong><small>${KIND[x.kind]} · <span class="mono">${esc(x.referenceNo)}</span></small></span>${icon('chevron', 15)}</button>`
  const tiles = [
    ...UNITS.map((u) => ({ act: `go:unit:${u.id}`, ic: { urmin: 'file', ren: 'chart', sumda: 'users', binfung: 'folder' }[u.id], t: u.title, s: { urmin: 'Persuratan', ren: 'Program & anggaran', sumda: 'Sumber daya', binfung: 'Pembinaan fungsi' }[u.id], ok: canUnit(u.id), why: isSA() ? 'Superadmin tidak memiliki akses operasional' : 'Akun Anda belum memiliki grant untuk unit ini' })),
    { act: `noop:${encodeURIComponent('Integrasi SPIP lintas unit sedang disiapkan.')}`, ic: 'shield', t: 'SPIP', s: 'Data dukung', ok: !isSA(), why: 'Belum tersedia' },
    { act: 'go:portal:::agenda', ic: 'calendar', t: 'KALENDER', s: 'Agenda bersama', ok: true }
  ]
  let body = ''
  if (tab === 'home') {
    body = `
      ${isSA() ? saPanel() : `<div class="grid grid-main">${workPanel()}
        <div class="stack">
          <section class="card"><div class="card-head"><h2>Agenda 7 hari ke depan</h2><button class="text-btn" data-act="go:portal:::agenda">Kalender</button></div><div class="card-body">${agendaRows(upcomingAgenda(7).slice(0, 4))}</div></section>
          <section class="card"><div class="card-head"><h2>Arahan pimpinan</h2><button class="text-btn" data-act="go:arahan">Semua</button></div><div class="card-body">
            ${runningDirectives().slice(0, 3).map((d) => `<button class="action-row" data-act="go:arahan"><span class="ic tone-info">${icon('bell', 16)}</span><span style="min-width:0"><strong>${esc(d.title)}</strong><small>${esc(d.to)}</small></span><span class="end">${dueLabel(d.due)}</span></button>`).join('')}</div></section>
        </div></div>`}
      <div class="section-title"><h2>Unit &amp; layanan</h2></div>
      <div class="unit-tiles">${tiles.map((x) => `<button class="card unit-tile" ${x.ok ? `data-act="${x.act}"` : `disabled title="${x.why}"`}><span class="ic">${icon(x.ic, 22)}</span><strong>${x.t}</strong><small>${x.ok ? x.s : x.why}</small></button>`).join('')}</div>
      <div class="announce"><strong>${icon('bell', 15)} PENGUMUMAN</strong>${ann.map((x) => `<button data-act="post:${x.id}">${esc(x.title)}</button>`).join('<span class="muted">·</span>')}</div>
      <div class="section-title"><h2>Informasi &amp; berita</h2><button class="text-btn" data-act="go:portal:::news">Lihat semua</button></div>
      <div class="grid grid-main">
        <section class="card" style="overflow:hidden"><button class="news-feature" data-act="post:${news[0].id}"><span class="img">${icon('news', 40)}</span><span class="txt"><span class="kicker-sm">Berita · ${fmt(news[0].updatedAt)}</span><h3>${esc(news[0].title)}</h3><p>${esc(news[0].summary)}</p></span></button></section>
        <section class="card"><div class="card-body">${news.slice(1).map(newsRow).join('')}</div></section>
      </div>
      <div class="grid grid-2" style="margin-top:16px">
        <section class="card"><div class="card-head"><h2>Agenda bersama</h2><button class="text-btn" data-act="go:portal:::agenda">Kalender</button></div><div class="card-body">${agendaRows(upcomingAgenda(30).slice(0, 4))}</div></section>
        <section class="card"><div class="card-head"><h2>SOP &amp; peraturan</h2><button class="text-btn" data-act="go:portal:::docs">Pustaka</button></div><div class="card-body">${docs.slice(0, 4).map(docRow).join('')}</div></section>
      </div>`
  } else if (tab === 'news') {
    const q = state.list.q.toLowerCase()
    const f = state.list.status
    const list = [...news, ...ann].filter((x) => (f === 'all' || x.kind === f) && `${x.title} ${x.summary}`.toLowerCase().includes(q)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    body = `<section class="card"><div class="toolbar">${searchInput('Cari berita dan pengumuman')}
      <div class="filters">${[['all', 'Semua'], ['berita', 'Berita'], ['pengumuman', 'Pengumuman']].map(([k, l]) => `<button class="fchip" aria-pressed="${f === k}" data-act="filter:status:${k}">${l}</button>`).join('')}</div></div>
      <div class="card-body">${list.length ? list.map(newsRow).join('') : emptyFilter()}</div></section>`
  } else if (tab === 'agenda') {
    body = `<section class="card">${calendarView(AGENDA)}</section>`
  } else {
    body = `<section class="card"><div class="card-body">${docs.map(docRow).join('')}</div></section>`
  }
  const a = me()
  return `
    <header class="portal-head">
      <div class="portal-title">
        <span class="portal-eyebrow">Portal informasi BagRenmin · <time datetime="${dayKey(new Date())}">${fmt(new Date(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</time></span>
        <h1>${greet()}, ${esc(a.displayName.split(' ')[0])}</h1>
        <p>Informasi terhubung, kegiatan lebih terarah.</p>
      </div>
      <div class="tabs" role="tablist" aria-label="Bagian portal">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${tab === k}" data-act="go:portal:::${k}">${l}</button>`).join('')}</div>
    </header>
    ${body}`
}
function postDialog(d) {
  return `<div class="dialog-wrap" data-act="closebg"><article class="dialog${enter('post', d.id)}" role="dialog" aria-modal="true" aria-labelledby="post-t">
    <div class="dialog-head"><div><span class="kicker-sm">${KIND[d.kind]} · ${fmt(d.updatedAt)}</span><h2 id="post-t" style="margin-top:6px">${esc(d.title)}</h2></div><button class="icon-btn" data-act="close" aria-label="Tutup">${icon('x')}</button></div>
    <div class="dialog-body"><p class="muted">${esc(d.summary)}</p><div style="line-height:1.7">${esc(d.body).replace(/\n/g, '<br>')}</div>
    ${d.kind === 'agenda' ? `<div class="note">${icon('clock', 15)} ${fmtDT(d.startsAt)} WIB</div>` : ''}
    ${d.referenceNo ? `<div class="alert alert--info">${icon('info', 16)}<span>Dokumen resmi <b class="mono">${esc(d.referenceNo)}</b> dapat diunduh setelah terverifikasi.</span></div>` : ''}</div>
    <div class="dialog-foot"><button class="btn" data-act="close">Tutup</button></div></article></div>`
}
ACT.calmove = (a) => { const c = state.cal.cursor; state.cal.cursor = new Date(c.getFullYear(), c.getMonth() + Number(a[0]), 1); render() }
ACT.caltoday = () => { state.cal.cursor = midnight(); render() }
function calendarView(events) {
  const c = state.cal.cursor
  const start = new Date(c.getFullYear(), c.getMonth(), 1)
  const begin = new Date(start); begin.setDate(1 - ((start.getDay() + 6) % 7))
  const today = dayKey(midnight())
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(begin); d.setDate(begin.getDate() + i)
    const k = dayKey(d)
    const ev = events.filter((x) => x.tanggal === k)
    return `<div class="cal-day ${d.getMonth() !== c.getMonth() ? 'out' : ''} ${k === today ? 'today' : ''}"><span>${d.getDate()}</span>${ev.map((x) => `<button class="cal-ev ${x.status !== 'Direncanakan' ? 'done' : ''}" data-act="post:pa-${x.id}" title="${esc(x.waktu + ' · ' + x.title)}">${x.waktu} ${esc(x.title)}</button>`).join('')}</div>`
  }).join('')
  return `<div class="cal-tools"><h3>${c.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</h3>
    <button class="btn btn--sm" data-act="caltoday">Hari ini</button>
    <button class="icon-btn" data-act="calmove:-1" aria-label="Bulan sebelumnya">${icon('back', 17)}</button>
    <button class="icon-btn" data-act="calmove:1" aria-label="Bulan berikutnya">${icon('arrow', 17)}</button></div>
    <div class="cal"><div class="cal-grid">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((x) => `<div class="cal-wd">${x}</div>`).join('')}${cells}</div></div>`
}

/* =====================================================================
   10. ARAHAN & DASHBOARD PIMPINAN
   ===================================================================== */
function arahanView() {
  const f = state.list.status
  const list = DIRECTIVES.filter((d) => f === 'all' || d.status === f)
  return `${pageHead('Lintas unit', 'Arahan Pimpinan', 'Arahan dari Kabag beserta tenggat dan unit penanggung jawab.', isLeader() ? `<button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Buat arahan</button>` : '')}
    <div class="filters" style="margin-bottom:16px">${[['all', 'Semua'], ['Berjalan', 'Berjalan'], ['Selesai', 'Selesai']].map(([k, l]) => `<button class="fchip" aria-pressed="${f === k}" data-act="filter:status:${k}">${l} <span class="n">${k === 'all' ? DIRECTIVES.length : DIRECTIVES.filter((d) => d.status === k).length}</span></button>`).join('')}</div>
    <div class="grid grid-2">${list.map((d) => `<article class="task-card ${d.status === 'Berjalan' && daysFrom(d.due) < 0 ? 'late' : ''}" style="cursor:default">
      <div class="top"><span class="chip ${d.status === 'Selesai' ? 'chip--ok' : 'chip--gold'}">${d.status}</span>${dueLabel(d.due, d.status === 'Selesai')}</div>
      <h3>${esc(d.title)}</h3><p>${esc(d.body)}</p>
      <div class="meta"><span>${icon('users', 14)} ${esc(d.to)}</span><span>${icon('user', 14)} ${esc(d.from)}</span><span>${icon('clock', 14)} ${fmtDT(d.at)}</span></div></article>`).join('')}</div>`
}
function executiveView() {
  const t = DB.tasks
  const done = t.filter((x) => x.status === 'completed')
  const onTime = done.filter((x) => x.slaStatus === 'completed_on_time').length
  const late = t.filter((x) => x.status !== 'completed' && daysFrom(x.dueDate) < 0).length
  const sla = done.length ? Math.round(onTime / done.length * 100) : 0
  const per = UNITS.map((u) => {
    const ut = t.filter((x) => x.unit === u.id)
    return { u, done: ut.filter((x) => x.status === 'completed').length, run: ut.filter((x) => x.status !== 'completed' && daysFrom(x.dueDate) >= 0).length, late: ut.filter((x) => x.status !== 'completed' && daysFrom(x.dueDate) < 0).length, n: ut.length }
  })
  const max = Math.max(1, ...per.map((p) => p.n))
  return `${pageHead('BagRenmin', 'Dashboard Pimpinan', 'Ringkasan lintas unit. Angka dihitung dari data yang Anda berwenang lihat.', isSA() ? '<span class="chip chip--info">Mode baca saja</span>' : '')}
    <div class="grid grid-4" style="margin-bottom:20px">
      ${stat('Surat masuk tercatat', DB.surat.filter((s) => s.status === 'registered').length, `${DB.surat.filter((s) => s.status === 'draft').length} masih draft`, 'inbox', 'info')}
      ${stat('Disposisi berjalan', t.filter((x) => x.status !== 'completed').length, `${t.length} total disposisi`, 'clipboard', 'gold')}
      ${stat('Terlambat', late, 'Melewati tenggat', 'alert', late ? 'danger' : 'ok')}
      ${stat('Selesai tepat waktu', sla + '%', `${onTime} dari ${done.length} disposisi selesai`, 'target', 'ok')}
    </div>
    <div class="grid grid-main">
      <section class="card"><div class="card-head"><div><h2>Disposisi per unit</h2><p>Status saat ini</p></div></div>
        <div class="hbars">${per.map((p) => `<div class="hbar"><span>${UNIT_SHORT[p.u.id]}</span><span class="track" role="img" aria-label="${p.done} selesai, ${p.run} berjalan, ${p.late} terlambat">
          <i style="width:${p.done / max * 100}%;background:var(--ok)"></i><i style="width:${p.run / max * 100}%;background:var(--gold)"></i><i style="width:${p.late / max * 100}%;background:var(--danger)"></i></span><b>${p.n}</b></div>`).join('')}</div>
        <div class="legend"><span><i style="background:var(--ok)"></i>Selesai</span><span><i style="background:var(--gold)"></i>Berjalan</span><span><i style="background:var(--danger)"></i>Terlambat</span></div></section>
      <section class="card"><div class="card-head"><h2>Arahan berjalan</h2></div><div class="card-body">
        ${runningDirectives().map((d) => `<div class="action-row" style="cursor:default"><span class="ic tone-gold">${icon('bell', 17)}</span><span style="min-width:0"><strong>${esc(d.title)}</strong><small>${esc(d.to)}</small></span><span class="end">${dueLabel(d.due)}</span></div>`).join('')}</div></section>
    </div>
    <section class="card" style="margin-top:16px"><div class="card-head"><div><h2>Alur surat masuk URMIN</h2><p>Jumlah surat di setiap tahap</p></div></div>${pipelineView(false)}</section>`
}
/* =====================================================================
   11. RUANG KERJA UNIT
   ===================================================================== */
const WF_ORDER = ['draft', 'recorded', 'awaiting_kabag', 'dispatched', 'in_progress', 'awaiting_review']
// Warna status dibatasi: netral = belum berjalan, biru = sedang berjalan, amber = menunggu keputusan seseorang.
const WF_TONE = { draft: '', recorded: '', awaiting_kabag: 'chip--warn', dispatched: 'chip--info', in_progress: 'chip--info', awaiting_review: 'chip--warn', done: 'chip--ok' }
const wfChip = (w) => `<span class="chip ${WF_TONE[w] || ''}">${WORKFLOW_LABELS[w] || w}</span>`
const clsTag = (c) => `<span class="class-tag ${c === 'penting' ? 'class-tag--penting' : ''}">${c === 'penting' ? 'Penting' : 'Biasa'}</span>`
ACT.filter = (a) => { state.list[a[0]] = a[1]; render() }
ACT.open = (a) => { state.drawer = { type: a[0], id: a[1], tab: 'info' }; state.pop = null; render(); focusLater('drawer-close') }
ACT.dtab = (a) => { state.drawer.tab = a[0]; render() }
function searchInput(ph) {
  return `<div class="input-wrap"><span class="lead-icon">${icon('search', 16)}</span><input id="list-q" class="input input--icon" type="search" placeholder="${ph}…" value="${esc(state.list.q)}" data-model="list.q" aria-label="${ph}"></div>`
}
const emptyFilter = () => `<div class="empty"><span class="ic">${icon('search', 22)}</span><h3>Tidak ada yang cocok</h3><p>Ubah kata kunci atau filter.</p><button class="btn btn--sm" data-act="resetfilter">Atur ulang filter</button></div>`
ACT.resetfilter = () => { state.list = { q: '', status: 'all', cls: 'all' }; render() }
const tabsBar = (base, tabs, cur) => `<div class="tabs" role="tablist">${tabs.map(([k, l, n]) => `<button class="tab" role="tab" aria-selected="${cur === k}" data-act="go:${base}:${k}">${l}${n != null ? `<span class="n">${n}</span>` : ''}</button>`).join('')}</div>`

function unitPage(u, menu, tab) {
  if (u.id === 'urmin') {
    switch (menu) {
      case '': return urminDash(u)
      case 'surat-masuk': return suratMasukPage(u, tab || 'daftar')
      case 'surat-keluar': return suratKeluarPage(u)
      case 'disposisi': return disposisiPage(u, tab || 'mine')
      case 'berkas': return berkasPage(u)
      case 'agenda': return `${pageHead(u.title, 'Agenda &amp; Rapat', 'Rapat, undangan, dan kegiatan yang dikelola URMIN.', `<button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Tambah agenda</button>`, u.id)}<section class="card">${calendarView(AGENDA)}</section>`
      case 'arsip': return registryPage(u, 'arsip')
    }
  }
  switch (menu) {
    case '': return unitDash(u)
    case 'inbox': return `${pageHead(u.title, 'Inbox Distribusi', 'Surat yang diteruskan kepada Anda.', '', u.id)}${inboxTable('all')}`
    case 'tugas': return `${pageHead(u.title, 'Tugas Disposisi', 'Disposisi untuk unit ini beserta tenggatnya.', '', u.id)}${taskGrid(DB.tasks.filter((t) => t.unit === u.id))}`
    case 'berkas': return berkasPage(u)
    default: return registryPage(u, menu)
  }
}

/* ----- alur surat (pipeline) ----- */
function pipelineView(interactive) {
  const total = DB.surat.length
  return `<div class="pipeline">${WF_ORDER.map((w, i) => {
    const n = DB.surat.filter((s) => s.workflow === w).length
    const tag = interactive ? 'button' : 'div'
    return `<${tag} class="pipe-step" ${interactive ? `data-act="pipe:${w}"` : ''}><span class="no">TAHAP ${i + 1}</span><span class="n">${n}</span><span class="t">${WORKFLOW_LABELS[w]}</span><span class="pipe-bar"><i style="width:${n / total * 100}%"></i></span></${tag}>`
  }).join('')}</div>`
}
ACT.pipe = (a) => { ACT.go(['unit', 'urmin', 'surat-masuk', 'daftar']); state.list.status = a[0]; render() }

function urminDash(u) {
  const s = DB.surat
  const lateTasks = DB.tasks.filter((t) => t.unit === 'urmin' && t.status !== 'completed' && daysFrom(t.dueDate) < 0)
  const respLate = s.filter((x) => x.responseDue && daysFrom(x.responseDue) < 0 && !['awaiting_review'].includes(x.workflow))
  return `${pageHead(u.title, 'Dashboard Persuratan', u.subtitle, `${!isLeader() ? `<button class="btn btn--primary" data-act="dlg:surat-baru">${icon('plus', 16)} Catat surat masuk</button>` : ''}<button class="btn" data-act="go:unit:urmin:surat-masuk">${icon('list', 16)} Semua surat</button>`, u.id)}
  <div class="grid grid-4" style="margin-bottom:20px">
    ${stat('Surat masuk', s.length, `<b>${s.filter((x) => daysFrom(x.receivedDate) >= -7).length}</b> dalam 7 hari terakhir`, 'inbox', 'info', 'go:unit:urmin:surat-masuk')}
    ${stat('Menunggu disposisi Kabag', s.filter((x) => x.workflow === 'awaiting_kabag').length, 'Perlu keputusan pimpinan', 'clock', 'gold', 'pipe:awaiting_kabag')}
    ${stat('Dalam tindak lanjut', s.filter((x) => x.workflow === 'in_progress').length, `${s.filter((x) => x.workflow === 'awaiting_review').length} menunggu review`, 'activity', 'warn', 'pipe:in_progress')}
    ${stat('Lewat tenggat', lateTasks.length + respLate.length, `${lateTasks.length} disposisi · ${respLate.length} respons surat`, 'alert', lateTasks.length + respLate.length ? 'danger' : 'ok', 'go:unit:urmin:disposisi')}
  </div>
  <section class="card" style="margin-bottom:16px"><div class="card-head"><div><h2>Alur surat masuk</h2><p>Klik tahap untuk melihat suratnya</p></div></div>${pipelineView(true)}</section>
  <div class="grid grid-main">
    <section class="card"><div class="card-head"><h2>Surat terbaru</h2><button class="text-btn" data-act="go:unit:urmin:surat-masuk">Lihat semua</button></div>${suratTable(s.slice(0, 5), true)}</section>
    <div class="stack">
      <section class="card"><div class="card-head"><h2>Agenda terdekat</h2><button class="text-btn" data-act="go:unit:urmin:agenda">Kalender</button></div><div class="card-body">${agendaRows(upcomingAgenda(14).slice(0, 3))}</div></section>
      <section class="card"><div class="card-head"><h2>Berkas aktif</h2><button class="text-btn" data-act="go:unit:urmin:berkas">Semua</button></div><div class="card-body">
        ${BERKAS.urmin.map((b) => `<button class="action-row" data-act="open:berkas:${b.id}"><span class="ic tone-info">${icon('folder', 17)}</span><span style="min-width:0"><strong>${esc(b.title)}</strong><small>${b.files.length} file · ${b.tasks.length} tugas</small></span><span class="end">${clsTag(b.classification)}</span></button>`).join('')}</div></section>
    </div>
  </div>`
}

/* ----- surat masuk ----- */
function suratTable(rows, compact) {
  const sel = state.drawer && state.drawer.type === 'surat' ? state.drawer.id : ''
  if (!rows.length) return emptyFilter()
  return `<div class="table-wrap"><table class="tbl"><thead><tr><th>No. Agenda</th><th>Perihal &amp; asal</th>${compact ? '' : '<th class="hide-sm">Klasifikasi</th>'}<th>Status</th>${compact ? '' : '<th class="hide-sm">Tenggat respons</th><th class="hide-sm">Diterima</th>'}</tr></thead><tbody>
    ${rows.map((x) => `<tr class="${sel === x.id ? 'sel' : ''}" data-act="open:surat:${x.id}" tabindex="0" aria-label="Buka surat ${esc(x.letterNumber)}">
      <td class="num mono">${x.agendaNo}</td>
      <td class="cell-title"><strong>${esc(x.subject)}</strong><small>${esc(x.sender)} · <span class="mono">${esc(x.letterNumber)}</span></small></td>
      ${compact ? '' : `<td class="hide-sm">${clsTag(x.classification)}</td>`}
      <td>${wfChip(x.workflow)}</td>
      ${compact ? '' : `<td class="hide-sm">${x.responseDue ? dueLabel(x.responseDue, x.workflow === 'awaiting_review') : '<span class="muted">—</span>'}</td><td class="hide-sm nowrap">${fmt(x.receivedDate)}</td>`}
    </tr>`).join('')}</tbody></table></div>`
}
function suratMasukPage(u, tab) {
  const base = 'unit:urmin:surat-masuk'
  const head = pageHead(u.title, 'Surat Masuk', 'Register naskah dinas yang diterima, beserta status disposisi dan tindak lanjutnya.', !isLeader() ? `<button class="btn btn--primary" data-act="dlg:surat-baru">${icon('plus', 16)} Catat surat masuk</button>` : '', u.id)
  const tabs = tabsBar(base, [['daftar', 'Daftar surat', DB.surat.length], ['inbox', 'Inbox', pendingInbox().length], ['riwayat', 'Riwayat penerimaan', DB.inbox.filter((i) => i.status === 'received').length]], tab)
  if (tab === 'inbox') return head + tabs + inboxTable('sent')
  if (tab === 'riwayat') return head + tabs + inboxTable('received')
  const { q, status, cls } = state.list
  const ql = q.toLowerCase()
  const base1 = DB.surat.filter((x) => (cls === 'all' || x.classification === cls) && `${x.subject} ${x.sender} ${x.letterNumber} ${x.agendaNo}`.toLowerCase().includes(ql))
  const rows = base1.filter((x) => status === 'all' || x.workflow === status)
  return `${head}${tabs}<section class="card">
    <div class="toolbar">${searchInput('Cari perihal, asal, atau nomor surat')}
      <select class="select" style="width:auto;min-height:40px" data-model="list.cls" aria-label="Klasifikasi"><option value="all">Semua klasifikasi</option><option value="biasa" ${cls === 'biasa' ? 'selected' : ''}>Biasa</option><option value="penting" ${cls === 'penting' ? 'selected' : ''}>Penting</option></select></div>
    <div class="toolbar" style="padding-top:10px"><div class="filters" role="group" aria-label="Filter status">
      <button class="fchip" aria-pressed="${status === 'all'}" data-act="filter:status:all">Semua <span class="n">${base1.length}</span></button>
      ${WF_ORDER.map((w) => `<button class="fchip" aria-pressed="${status === w}" data-act="filter:status:${w}">${WORKFLOW_LABELS[w]} <span class="n">${base1.filter((x) => x.workflow === w).length}</span></button>`).join('')}</div></div>
    ${suratTable(rows)}
    <div class="tbl-foot"><span>Menampilkan ${rows.length} dari ${DB.surat.length} surat</span><span>Halaman 1 dari 1</span></div></section>`
}
function inboxTable(mode) {
  const rows = DB.inbox.filter((i) => mode === 'all' || i.status === mode)
  if (!rows.length) return `<section class="card"><div class="empty"><span class="ic">${icon('inbox', 22)}</span><h3>${mode === 'sent' ? 'Inbox kosong' : 'Belum ada riwayat'}</h3><p>${mode === 'sent' ? 'Semua surat yang diteruskan kepada Anda sudah diterima.' : 'Surat yang sudah Anda terima akan muncul di sini.'}</p></div></section>`
  return `<section class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Surat</th><th class="hide-sm">Dari</th><th>Status</th><th class="hide-sm">Dikirim</th></tr></thead><tbody>
    ${rows.map((i) => `<tr data-act="open:inbox:${i.id}" tabindex="0"><td class="cell-title"><strong>${esc(i.subject)}</strong><small>${esc(i.note)}</small></td><td class="hide-sm">${esc(i.from)}</td>
      <td>${i.status === 'sent' ? '<span class="chip chip--info">Belum diterima</span>' : '<span class="chip chip--ok">Diterima</span>'}</td><td class="hide-sm nowrap">${fmtDT(i.sentAt)}</td></tr>`).join('')}</tbody></table></div></section>`
}

/* ----- surat keluar ----- */
const SK_TONE = { 'Dikirim': 'chip--ok', 'Draft': '', 'Penelaahan': 'chip--info', 'Menunggu TTD Kabag': 'chip--gold', 'Disetujui': 'chip--ok' }
function suratKeluarPage(u) {
  const { q, status } = state.list
  const ql = q.toLowerCase()
  const base1 = DB.keluar.filter((x) => `${x.title} ${x.code} ${x.tujuan}`.toLowerCase().includes(ql))
  const sts = [...new Set(DB.keluar.map((x) => x.status))]
  const rows = base1.filter((x) => status === 'all' || x.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return `${pageHead(u.title, 'Surat Keluar', 'Draft, penelaahan, tanda tangan Kabag, dan pengiriman.', !isLeader() ? `<button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Buat surat keluar</button>` : '', u.id)}
  ${isLeader() && awaitingSign().length ? `<div class="alert alert--gold" style="margin-bottom:16px">${icon('pen', 17)}<span><strong>${awaitingSign().length} surat menunggu tanda tangan Anda.</strong> Buka surat untuk menandatangani dan menyetujui sekaligus.</span></div>` : ''}
  <section class="card"><div class="toolbar">${searchInput('Cari perihal, nomor, atau tujuan')}
    <div class="filters"><button class="fchip" aria-pressed="${status === 'all'}" data-act="filter:status:all">Semua <span class="n">${base1.length}</span></button>${sts.map((s) => `<button class="fchip" aria-pressed="${status === s}" data-act="filter:status:${encodeURIComponent(s)}">${s} <span class="n">${base1.filter((x) => x.status === s).length}</span></button>`).join('')}</div></div>
    ${rows.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Nomor</th><th>Perihal &amp; tujuan</th><th class="hide-sm">Klasifikasi</th><th>Status</th><th class="hide-sm">Dibuat</th></tr></thead><tbody>
    ${rows.map((x) => `<tr data-act="open:keluar:${x.id}" tabindex="0" class="${state.drawer && state.drawer.id === x.id ? 'sel' : ''}"><td class="mono nowrap">${esc(x.code)}</td><td class="cell-title"><strong>${esc(x.title)}</strong><small>${esc(x.tujuan)}</small></td><td class="hide-sm">${clsTag(x.classification)}</td><td><span class="chip ${SK_TONE[x.status] || ''}">${esc(x.status)}</span></td><td class="hide-sm nowrap">${fmt(x.createdAt)}</td></tr>`).join('')}
    </tbody></table></div>` : emptyFilter()}</section>`
}

/* ----- disposisi ----- */
const EVENT_LABELS = { issued: 'Diterbitkan', accepted: 'Diterima', completed: 'Diselesaikan', approved: 'Hasil disetujui', revision_requested: 'Perlu tindak lanjut', forwarded: 'Diteruskan' }
const TASK_STATUS_NAMES = { pending: 'Menunggu diterima', received: 'Diterima', completed: 'Selesai', cancelled: 'Dibatalkan' }
const TS_LABEL = { pending: 'Menunggu diterima', in_progress: 'Dalam proses', completed: 'Selesai' }
const TS_TONE = { pending: 'chip--gold', in_progress: 'chip--info', completed: 'chip--ok' }
const RV_LABEL = { not_ready: '', awaiting_review: 'Menunggu review', approved: 'Disetujui', revision_requested: 'Perlu tindak lanjut' }
function taskChip(t) {
  if (t.status === 'completed' && t.reviewStatus !== 'not_ready') return `<span class="chip ${t.reviewStatus === 'approved' ? 'chip--ok' : t.reviewStatus === 'revision_requested' ? 'chip--danger' : 'chip--gold'}">${RV_LABEL[t.reviewStatus]}</span>`
  return `<span class="chip ${TS_TONE[t.status]}">${TS_LABEL[t.status]}</span>`
}
function taskGrid(list) {
  if (!list.length) return `<section class="card"><div class="empty"><span class="ic">${icon('clipboard', 22)}</span><h3>Tidak ada disposisi</h3><p>Disposisi yang relevan dengan tab ini akan muncul di sini.</p></div></section>`
  return `<div class="grid grid-2">${list.map((t) => {
    const late = t.status !== 'completed' && daysFrom(t.dueDate) < 0
    return `<button class="task-card ${late ? 'late' : ''}" data-act="open:task:${t.id}">
      <div class="top">${taskChip(t)}${dueLabel(t.dueDate, t.status === 'completed')}</div>
      <h3>${esc(t.subject)}</h3><p>${esc(t.instruction)}</p>
      <div class="meta"><span>${icon('user', 14)} ${esc(t.issuerName)} → ${esc(t.assigneeName)}</span><span class="mono">${esc(t.letterNumber)}</span>${t.depth ? `<span>${icon('forward', 14)} Diteruskan</span>` : ''}</div></button>`
  }).join('')}</div>`
}
function disposisiPage(u, tab) {
  const sets = {
    mine: myTasks().filter((t) => t.status !== 'completed'),
    issued: issuedTasks().filter((t) => !(t.status === 'completed' && t.reviewStatus === 'approved')),
    review: reviewTasks(),
    history: DB.tasks.filter((t) => (t.assigneeId === me().id || t.issuerId === me().id) && t.status === 'completed' && t.reviewStatus !== 'awaiting_review')
  }
  return `${pageHead(u.title, 'Disposisi', 'Tugas, tindak lanjut, dan review disposisi.', isLeader() ? `<button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Beri disposisi</button>` : '', u.id)}
    ${tabsBar('unit:urmin:disposisi', [['mine', 'Tugas saya', sets.mine.length], ['issued', 'Yang saya berikan', sets.issued.length], ['review', 'Perlu review', sets.review.length], ['history', 'Riwayat', sets.history.length]], tab)}
    ${taskGrid(sets[tab] || [])}`
}

/* ----- berkas ----- */
function berkasPage(u) {
  const list = BERKAS[u.id] || []
  return `${pageHead(u.title, u.id === 'urmin' ? 'Berkas Kerja' : 'Berkas &amp; Foto', 'Kumpulan dokumen, foto, dan tugas internal per pekerjaan.', `<button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Berkas baru</button>`, u.id)}
  ${list.length ? `<section class="card"><div class="table-wrap"><table class="tbl"><thead><tr><th>Berkas</th><th class="hide-sm">Kategori</th><th>Isi</th><th class="hide-sm">Klasifikasi</th><th class="hide-sm">Dibuat</th></tr></thead><tbody>
    ${list.map((b) => `<tr data-act="open:berkas:${b.id}" tabindex="0"><td class="cell-title"><strong>${esc(b.title)}</strong><small>${esc(b.description)}</small></td><td class="hide-sm">${esc(b.category)}</td><td class="nowrap">${icon('file', 14)} ${b.files.length} &nbsp; ${icon('clipboard', 14)} ${b.tasks.length}</td><td class="hide-sm">${clsTag(b.classification)}</td><td class="hide-sm nowrap">${fmt(b.createdAt)}</td></tr>`).join('')}
  </tbody></table></div></section>` : `<section class="card"><div class="empty"><span class="ic">${icon('folder', 22)}</span><h3>Belum ada berkas</h3><p>Buat berkas untuk mengumpulkan dokumen dan tugas satu pekerjaan.</p></div></section>`}`
}

/* ----- registry modul ----- */
function registryPage(u, menu) {
  const reg = REGISTRY[`${u.id}:${menu}`]
  const mod = u.modules.find((m) => m.id === menu) || { title: menuTitle(u, menu), description: '', icon: 'folder', columns: [] }
  const head = pageHead(u.title, esc(mod.title), esc(mod.description), reg ? `<button class="btn" data-act="noop">${icon('download', 16)} Ekspor</button><button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Tambah</button>` : '', u.id)
  if (!reg) return `${head}<section class="card"><div class="empty" style="padding:56px 20px"><span class="ic">${icon(mod.icon, 24)}</span><h3>Modul dalam persiapan</h3><p>${esc(mod.title)} akan aktif setelah API dan izinnya selesai. Tombol tambah dan ekspor sengaja belum tersedia.</p><span class="chip">${icon('lock', 12)} Dalam persiapan</span></div></section>`
  const ql = state.list.q.toLowerCase()
  const rows = reg.items.filter((x) => `${x.title} ${x.code} ${x.info}`.toLowerCase().includes(ql))
  return `${head}<section class="card"><div class="toolbar">${searchInput('Cari ' + mod.title.toLowerCase())}<span class="muted" style="font-size:12.5px">${rows.length} data</span></div>
    ${rows.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>${esc(reg.code)}</th><th>${esc(reg.name)}</th><th class="hide-sm">Keterangan</th><th class="hide-sm">Klasifikasi</th><th class="hide-sm">Tanggal</th></tr></thead><tbody>
    ${rows.map((x) => `<tr data-act="open:reg:${u.id}~${menu}~${x.id}" tabindex="0"><td class="mono nowrap">${esc(x.code)}</td><td class="cell-title"><strong>${esc(x.title)}</strong>${reg.status ? `<small>${esc(reg.status)}</small>` : ''}</td><td class="hide-sm">${esc(x.info)}</td><td class="hide-sm">${clsTag(x.classification)}</td><td class="hide-sm nowrap">${fmt(x.createdAt)}</td></tr>`).join('')}
    </tbody></table></div>` : emptyFilter()}</section>`
}

function unitDash(u) {
  const tasks = DB.tasks.filter((t) => t.unit === u.id)
  const regCount = (m) => (REGISTRY[`${u.id}:${m.id}`] || { items: [] }).items.length
  return `${pageHead(u.title, esc(u.name), esc(u.description), '', u.id)}
  <div class="grid grid-4" style="margin-bottom:20px">
    ${stat('Inbox distribusi', pendingInbox().length, 'Belum diterima', 'inbox', 'info', `go:unit:${u.id}:inbox`)}
    ${stat('Tugas berjalan', tasks.filter((t) => t.status !== 'completed').length, `${tasks.filter((t) => t.status !== 'completed' && daysFrom(t.dueDate) < 0).length} terlambat`, 'clipboard', 'gold', `go:unit:${u.id}:tugas`)}
    ${stat('Berkas aktif', (BERKAS[u.id] || []).length, 'Dokumen & foto kerja', 'folder', 'ok', `go:unit:${u.id}:berkas`)}
    ${stat('Data register', u.modules.reduce((s, m) => s + regCount(m), 0), `${u.modules.length} modul layanan`, 'database', 'info')}
  </div>
  <h2 style="margin:4px 0 12px">Layanan operasional</h2>
  <div class="grid grid-3">${u.modules.map((m) => `<button class="card mod-card" data-act="go:unit:${u.id}:${m.id}"><span class="ic" style="${unitStyle(u.id)}">${icon(m.icon, 20)}</span><span><strong>${esc(m.title)}</strong><small>${esc(m.description)}</small></span><span class="chip chip--plain">${regCount(m) || '—'}</span></button>`).join('')}</div>`
}
/* =====================================================================
   12. PANEL DETAIL (drawer kanan) — daftar tetap terlihat di belakangnya
   ===================================================================== */
function drawerShell(kicker, title, body, foot) {
  return `<div class="scrim" data-act="closebg"></div>
  <aside class="drawer${enter('drawer', state.drawer.type + state.drawer.id)}" role="dialog" aria-modal="true" aria-labelledby="dr-title">
    <div class="drawer-head"><div class="row-between"><div class="kicker">${kicker}</div><button id="drawer-close" class="icon-btn" data-act="close" aria-label="Tutup panel">${icon('x')}</button></div><h2 id="dr-title">${title}</h2></div>
    <div class="drawer-body">${body}</div>
    ${foot ? `<div class="drawer-foot">${foot}</div>` : ''}
  </aside>`
}
const kv = (pairs) => `<dl class="kv">${pairs.filter((p) => p[1] != null && p[1] !== '').map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`
const timeline = (items) => `<ol class="timeline">${items.map((e, i) => `<li><span class="dot ${i === items.length - 1 ? 'gold' : ''}">${icon('check', 11)}</span><div><strong>${esc(e.t)}</strong><small>${esc(e.who)} · ${fmtDT(e.at)}</small>${e.note ? `<p>${esc(e.note)}</p>` : ''}</div></li>`).join('')}</ol>`
const fileRows = (files) => files.map((f) => `<div class="file-row"><span class="ic ${f.type === 'FOTO' ? 'img' : ''}">${f.type === 'FOTO' ? 'IMG' : 'PDF'}</span><span style="min-width:0"><strong>${esc(f.name)}</strong><small>${(f.size / 1024).toFixed(1)} MB · ${fmtDT(f.at)}</small></span><button class="icon-btn" data-act="noop:${encodeURIComponent('Unduhan peraga — file tidak tersedia di mockup.')}" aria-label="Unduh ${esc(f.name)}">${icon('download', 17)}</button></div>`).join('')
const stepper = (labels, cur) => `<div class="stepper" aria-label="Tahap ${cur + 1} dari ${labels.length}">${labels.map((l, i) => `<div class="${i < cur ? 'done' : i === cur ? 'cur' : ''}">${l}</div>`).join('')}</div>`

function drawerView() {
  const d = state.drawer
  if (d.type === 'surat') {
    const s = DB.surat.find((x) => x.id === d.id)
    const hist = (SURAT_HISTORY[s.id] || [{ action: 'created', actor: 'Bayu Kertanegara', at: s.createdAt, reason: 'Surat dicatat.' }]).map((h) => ({ t: { created: 'Dicatat', edited: 'Diperbarui', registered: 'Didaftarkan' }[h.action] || h.action, who: h.actor, at: h.at, note: h.reason }))
    const files = Array.from({ length: s.attachments }, (_, i) => ({ name: i === 0 ? `scan-${s.letterNumber.replace(/\//g, '-').toLowerCase()}.pdf` : `lampiran-${i}.pdf`, type: 'PDF', size: 300 + i * 410, at: s.createdAt }))
    let foot = ''
    if (!isLeader() && s.workflow === 'draft') foot = `<button class="btn" data-act="noop">${icon('pen', 16)} Edit draft</button><span class="spacer"></span><button class="btn btn--primary" data-act="register:${s.id}">${icon('check', 16)} Daftarkan surat</button>`
    else if (isLeader() && s.workflow === 'awaiting_kabag') foot = `<span class="spacer"></span><button class="btn btn--primary" data-act="dlg:dispose:${s.id}">${icon('forward', 16)} Beri disposisi</button>`
    else if (!isLeader() && s.workflow === 'recorded') foot = `<span class="spacer"></span><button class="btn btn--primary" data-act="ajukan:${s.id}">${icon('send', 16)} Ajukan ke Kabag</button>`
    return drawerShell(`<span class="mono">No. ${s.agendaNo}</span>·<span class="mono">${esc(s.letterNumber)}</span>${clsTag(s.classification)}`, esc(s.subject), `
      ${stepper(['Draft', 'Tercatat', 'Kabag', 'Distribusi', 'Proses', 'Review'], WF_ORDER.indexOf(s.workflow))}
      <div>${wfChip(s.workflow)}</div>
      <section><div class="section-label">Detail surat</div>${kv([['Asal surat', esc(s.sender)], ['Tanggal surat', fmt(s.letterDate)], ['Diterima', fmt(s.receivedDate)], ['Jenis', esc(s.letterKind)], ['Tenggat respons', s.responseDue ? `${fmt(s.responseDue)} · ${dueLabel(s.responseDue, s.workflow === 'awaiting_review')}` : ''], ['Versi', 'v' + s.version]])}</section>
      ${s.eventStart ? `<div class="note gold">${icon('calendar', 15)} <b>Kegiatan:</b> ${fmtDT(s.eventStart)} WIB · ${esc(s.eventLocation)}</div>` : ''}
      <section><div class="section-label">Lampiran (${files.length})</div>${files.length ? fileRows(files) : '<p class="muted">Belum ada lampiran.</p>'}</section>
      <section><div class="section-label">Riwayat</div>${timeline(hist)}</section>`, foot)
  }
  if (d.type === 'inbox') {
    const i = DB.inbox.find((x) => x.id === d.id)
    return drawerShell(`<span class="mono">${esc(i.letterNumber)}</span>`, esc(i.subject), `
      <div>${i.status === 'sent' ? '<span class="chip chip--info">Belum diterima</span>' : '<span class="chip chip--ok">Diterima</span>'}</div>
      ${kv([['Diteruskan oleh', esc(i.from)], ['Dikirim', fmtDT(i.sentAt)]])}
      <section><div class="section-label">Catatan pimpinan</div><div class="note gold">${esc(i.note)}</div></section>
      ${i.status === 'sent' ? `<div class="alert alert--info">${icon('info', 16)}<span>Dengan menerima, Anda menyatakan surat sudah dibaca. Penerimaan tercatat di riwayat.</span></div>` : ''}`,
      `<button class="btn" data-act="open:surat:${i.incomingId}">${icon('file', 16)} Lihat surat</button><span class="spacer"></span>${i.status === 'sent' ? `<button class="btn btn--primary" data-act="accept:${i.id}">${icon('check', 16)} Terima surat</button>` : ''}`)
  }
  if (d.type === 'keluar') {
    const k = DB.keluar.find((x) => x.id === d.id)
    const wait = k.status === 'Menunggu TTD Kabag'
    const foot = isLeader() && wait ? `<button class="btn btn--danger" data-act="dlg:revise-sk:${k.id}">Kembalikan</button><span class="spacer"></span><button class="btn btn--primary" data-act="dlg:sign:${k.id}">${icon('pen', 16)} Tanda tangani &amp; setujui</button>`
      : !isLeader() && k.status === 'Draft' ? `<span class="spacer"></span><button class="btn btn--primary" data-act="noop">${icon('pen', 16)} Lanjutkan draft</button>` : ''
    const cur = { Draft: 0, Penelaahan: 1, 'Menunggu TTD Kabag': 2, Disetujui: 3, Dikirim: 4 }[k.status]
    return drawerShell(`<span class="mono">${esc(k.code)}</span>${clsTag(k.classification)}`, esc(k.title), `
      ${stepper(['Draft', 'Telaah', 'TTD Kabag', 'Disetujui', 'Dikirim'], cur == null ? 0 : cur)}
      <div><span class="chip ${SK_TONE[k.status] || ''}">${esc(k.status)}</span></div>
      ${kv([['Tujuan', esc(k.tujuan)], ['Dibuat', fmtDT(k.createdAt)], ['Ditandatangani', k.signedAt ? fmtDT(k.signedAt) + ' · ' + esc(me().displayName) : '']])}
      <section><div class="section-label">Naskah</div>${fileRows([{ name: `naskah-${k.code.replace(/\//g, '-').toLowerCase()}.pdf`, type: 'PDF', size: 380, at: k.createdAt }])}</section>
      ${wait && !isLeader() ? `<div class="alert alert--gold">${icon('clock', 16)}<span>Menunggu tanda tangan Kabagrenmin.</span></div>` : ''}`, foot)
  }
  if (d.type === 'task') {
    const t = DB.tasks.find((x) => x.id === d.id)
    const ev = (DB.events[t.id] || [{ action: 'issued', actor: t.issuerName, at: t.createdAt, reason: '' }]).map((e) => ({ t: EVENT_LABELS[e.action] || e.action, who: e.actor, at: e.at, note: e.reason }))
    const cur = t.status === 'pending' ? 1 : t.status === 'in_progress' ? 2 : t.reviewStatus === 'awaiting_review' ? 3 : 4
    const mine = t.assigneeId === me().id, issued = t.issuerId === me().id
    let foot = ''
    if (mine && t.status === 'pending') foot = `<span class="spacer"></span><button class="btn btn--primary" data-act="taskaccept:${t.id}">${icon('check', 16)} Terima disposisi</button>`
    else if (mine && t.status === 'in_progress') foot = `<button class="btn" data-act="noop:${encodeURIComponent('Teruskan: pilih personel dan instruksi (peraga).')}">${icon('forward', 16)} Teruskan</button><span class="spacer"></span><button class="btn btn--primary" data-act="dlg:complete:${t.id}">${icon('check', 16)} Laporkan selesai</button>`
    else if (issued && t.status === 'completed' && t.reviewStatus === 'awaiting_review') foot = `<button class="btn btn--danger" data-act="dlg:revise:${t.id}">Minta tindak lanjut</button><span class="spacer"></span><button class="btn btn--primary" data-act="approve:${t.id}">${icon('check', 16)} Setujui hasil</button>`
    return drawerShell(`<span class="mono">${esc(t.letterNumber)}</span>${t.depth ? `<span class="chip chip--plain">${icon('forward', 12)} Diteruskan</span>` : ''}`, esc(t.subject), `
      ${stepper(['Diterbitkan', 'Diterima', 'Dikerjakan', 'Review', 'Selesai'], cur)}
      <div style="display:flex;gap:8px;flex-wrap:wrap">${taskChip(t)}${dueLabel(t.dueDate, t.status === 'completed')}</div>
      <section><div class="section-label">Instruksi</div><div class="note gold">${esc(t.instruction)}</div></section>
      ${kv([['Pemberi', esc(t.issuerName)], ['Penerima', esc(t.assigneeName)], ['Unit', UNIT_SHORT[t.unit]], ['Tenggat', fmt(t.dueDate)]])}
      ${t.completionNote ? `<section><div class="section-label">Laporan penyelesaian</div><div class="note">${esc(t.completionNote)}</div></section>` : ''}
      ${t.reviewReason ? `<section><div class="section-label">Catatan review</div><div class="note">${esc(t.reviewReason)}</div></section>` : ''}
      <section><div class="section-label">Riwayat</div>${timeline(ev)}</section>`, foot)
  }
  if (d.type === 'berkas') {
    const b = Object.values(BERKAS).flat().find((x) => x.id === d.id)
    const tab = d.tab
    const tabs = [['info', 'Ringkasan'], ['files', `File (${b.files.length})`], ['tasks', `Tugas (${b.tasks.length})`], ['log', 'Riwayat']]
    const body = tab === 'files' ? (b.files.length ? fileRows(b.files) : '<p class="muted">Belum ada file.</p>')
      : tab === 'tasks' ? (b.tasks.length ? b.tasks.map((t) => `<div class="task-card" style="cursor:default"><div class="top"><span class="chip ${t.status === 'completed' ? 'chip--ok' : t.status === 'pending' ? 'chip--gold' : 'chip--info'}">${TASK_STATUS_NAMES[t.status]}</span>${dueLabel(t.dueDate, t.status === 'completed')}</div><p>${esc(t.instruction)}</p><div class="meta"><span>${icon('user', 14)} ${esc(t.toName)}</span></div>${t.response ? `<div class="note">${esc(t.response)}</div>` : ''}</div>`).join('') : '<p class="muted">Belum ada tugas.</p>')
      : tab === 'log' ? timeline(b.events.map((e) => ({ t: e.note, who: e.user, at: e.at })))
      : `${kv([['Kategori', esc(b.category)], ['Dibuat', fmtDT(b.createdAt)]])}<div class="note">${esc(b.description)}</div>`
    return drawerShell(`${esc(b.category)}${clsTag(b.classification)}`, esc(b.title), `<div class="tabs" style="margin-bottom:0">${tabs.map(([k, l]) => `<button class="tab" aria-selected="${tab === k}" data-act="dtab:${k}">${l}</button>`).join('')}</div>${body}`,
      `<button class="btn" data-act="noop">${icon('upload', 16)} Unggah file</button><span class="spacer"></span><button class="btn btn--primary" data-act="noop">${icon('forward', 16)} Beri tugas</button>`)
  }
  if (d.type === 'reg') {
    const [u, m, id] = d.id.split('~')
    const reg = REGISTRY[`${u}:${m}`]
    const x = reg.items.find((i) => i.id === id)
    return drawerShell(`<span class="mono">${esc(x.code)}</span>${clsTag(x.classification)}`, esc(x.title), kv([[esc(reg.code), `<span class="mono">${esc(x.code)}</span>`], ['Keterangan', esc(x.info)], ['Status', reg.status || '—'], ['Dicatat', fmtDT(x.createdAt)]]), `<button class="btn" data-act="noop">${icon('pen', 16)} Edit</button>`)
  }
  if (d.type === 'user') return userDrawer(DB.users.find((x) => x.id === d.id))
  return ''
}

/* ----- aksi alur kerja (peraga: mengubah salinan data di memori) ----- */
const nowISO = () => new Date().toISOString()
ACT.accept = (a) => { const i = DB.inbox.find((x) => x.id === a[0]); i.status = 'received'; state.read.add(i.id); toast('Surat diterima dan tercatat di riwayat penerimaan.'); }
ACT.register = (a) => { const s = DB.surat.find((x) => x.id === a[0]); s.status = 'registered'; s.workflow = 'recorded'; s.version++; toast(`Surat didaftarkan dengan nomor agenda ${s.agendaNo}.`) }
ACT.ajukan = (a) => { const s = DB.surat.find((x) => x.id === a[0]); s.workflow = 'awaiting_kabag'; s.version++; toast('Surat diajukan ke Kabag untuk disposisi.') }
ACT.taskaccept = (a) => {
  const t = DB.tasks.find((x) => x.id === a[0]); t.status = 'in_progress'
  ;(DB.events[t.id] = DB.events[t.id] || []).push({ action: 'accepted', actor: me().displayName, at: nowISO(), reason: 'Tugas diterima.' })
  toast('Disposisi diterima. Status berubah menjadi Dalam proses.')
}
ACT.approve = (a) => {
  const t = DB.tasks.find((x) => x.id === a[0]); t.reviewStatus = 'approved'; t.reviewReason = 'Hasil memadai.'
  ;(DB.events[t.id] = DB.events[t.id] || []).push({ action: 'approved', actor: me().displayName, at: nowISO(), reason: 'Hasil disetujui.' })
  state.drawer = null; toast('Hasil tindak lanjut disetujui.')
}

/* =====================================================================
   13. DIALOG
   ===================================================================== */
state.form = {}
ACT.dlg = (a) => { state.dialog = { kind: a[0], id: a[1] }; state.form = { cls: 'biasa', sigMode: 'saved', agree: false }; render(); focusLater('dlg-first') }
function dialogShell(title, desc, body, submit, submitLabel, danger) {
  return `<div class="dialog-wrap" data-act="closebg"><form class="dialog${enter('dialog', state.dialog.kind + state.dialog.id)}" role="dialog" aria-modal="true" aria-labelledby="dlg-t" data-submit="${submit}" novalidate>
    <div class="dialog-head"><div><h2 id="dlg-t">${title}</h2>${desc ? `<p class="muted" style="margin-top:4px;font-size:13.5px">${desc}</p>` : ''}</div><button type="button" class="icon-btn" data-act="close" aria-label="Tutup">${icon('x')}</button></div>
    <div class="dialog-body">${body}${state.form.err ? `<div class="alert alert--danger" role="alert">${icon('alert', 16)}<span>${esc(state.form.err)}</span></div>` : ''}</div>
    <div class="dialog-foot"><button type="button" class="btn" data-act="close">Batal</button><button type="submit" class="btn ${danger ? 'btn--danger' : 'btn--primary'}">${submitLabel}</button></div></form></div>`
}
const fField = (id, label, inner, hint) => `<div class="field"><label for="${id}">${label}</label>${inner}${hint ? `<span class="field-hint">${hint}</span>` : ''}</div>`
function dialogView() {
  const d = state.dialog, f = state.form
  if (d.kind === 'surat-baru') return dialogShell('Catat surat masuk', 'Surat tersimpan sebagai draft. Nomor agenda diberikan saat didaftarkan.', `
    ${fField('dlg-first', 'Nomor surat', `<input id="dlg-first" class="input mono" placeholder="B/123/IX/2026/XXX" value="${esc(f.no || '')}" data-model="form.no">`)}
    ${fField('f-from', 'Asal surat', `<input id="f-from" class="input" placeholder="Nama instansi pengirim" value="${esc(f.from || '')}" data-model="form.from">`)}
    ${fField('f-subj', 'Perihal', `<textarea id="f-subj" class="textarea" style="min-height:72px" data-model="form.subj">${esc(f.subj || '')}</textarea>`)}
    <div class="grid grid-2" style="gap:12px">${fField('f-date', 'Tanggal surat', `<input id="f-date" type="date" class="input" value="${esc(f.date || '')}" data-model="form.date">`)}
      ${fField('f-cls', 'Klasifikasi', `<select id="f-cls" class="select" data-model="form.cls"><option value="biasa" ${f.cls === 'biasa' ? 'selected' : ''}>Biasa</option><option value="penting" ${f.cls === 'penting' ? 'selected' : ''}>Penting</option></select>`)}</div>
    <div class="sign-pad" style="height:84px">${icon('upload', 20)}&nbsp; Seret pindaian surat (PDF) ke sini atau klik untuk memilih</div>`, 'savesurat', 'Simpan draft')
  if (d.kind === 'sign') {
    const k = DB.keluar.find((x) => x.id === d.id)
    return dialogShell('Tanda tangani &amp; setujui', esc(k.title), `
      <div class="seg" role="group" aria-label="Sumber tanda tangan"><button type="button" aria-pressed="${f.sigMode === 'saved'}" data-act="sig:saved">TTD tersimpan</button><button type="button" aria-pressed="${f.sigMode === 'draw'}" data-act="sig:draw">Gambar baru</button></div>
      <div class="sign-pad">${f.sigMode === 'saved' ? `<svg class="sig" viewBox="0 0 300 120" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M30 80c20-40 35-50 40-30s-10 40 5 30 25-55 35-40-5 45 10 35 20-30 30-25 5 25 20 15 30-20 45-18"/><path d="M60 95h170" stroke-width="1" opacity=".4"/></svg>` : 'Gambar tanda tangan di area ini (peraga)'}</div>
      <label style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px"><input id="dlg-first" type="checkbox" data-model="form.agree" ${f.agree ? 'checked' : ''} style="margin-top:3px;width:16px;height:16px;accent-color:var(--gold-strong)"> Saya telah membaca naskah dan menyetujui penandatanganan atas nama Kabagrenmin.</label>`, 'dosign', `${icon('pen', 16)} Tanda tangani`)
  }
  if (d.kind === 'complete') return dialogShell('Laporkan penyelesaian', 'Laporan dikirim ke pemberi disposisi untuk direview.', fField('dlg-first', 'Ringkasan hasil', `<textarea id="dlg-first" class="textarea" placeholder="Apa yang sudah dikerjakan, dan di mana hasilnya?" data-model="form.note">${esc(f.note || '')}</textarea>`, 'Wajib diisi. Lampiran bisa ditambahkan di Berkas Kerja.'), 'docomplete', 'Kirim laporan')
  if (d.kind === 'revise' || d.kind === 'revise-sk') return dialogShell(d.kind === 'revise' ? 'Minta tindak lanjut' : 'Kembalikan naskah', 'Penerima akan melihat alasan ini.', fField('dlg-first', 'Alasan', `<textarea id="dlg-first" class="textarea" data-model="form.note">${esc(f.note || '')}</textarea>`), 'dorevise', 'Kirim', true)
  if (d.kind === 'dispose') return dialogShell('Beri disposisi', esc(DB.surat.find((x) => x.id === d.id).subject), `
    ${fField('dlg-first', 'Tujuan', `<select id="dlg-first" class="select" data-model="form.to"><option>Bayu Kertanegara · URMIN</option><option>Sekar Wulandari · Subbagren</option><option>Ratna Kusumaningrum · Subbagsumda</option><option>Panji Alamsyah · Subbagbinfung</option></select>`)}
    ${fField('f-ins', 'Instruksi', `<textarea id="f-ins" class="textarea" data-model="form.note">${esc(f.note || '')}</textarea>`)}
    ${fField('f-due', 'Tenggat', `<input id="f-due" type="date" class="input" data-model="form.date" value="${esc(f.date || '')}">`)}`, 'dodispose', `${icon('forward', 16)} Kirim disposisi`)
  if (d.kind === 'user-baru') return dialogShell('Tambah pengguna', 'Akun baru dibuat dengan password sementara dan wajib diganti saat login pertama.', `
    ${fField('dlg-first', 'Nama lengkap', '<input id="dlg-first" class="input">')}
    <div class="grid grid-2" style="gap:12px">${fField('f-un', 'Username', '<input id="f-un" class="input mono">')}${fField('f-em', 'Email', '<input id="f-em" type="email" class="input">')}</div>
    ${fField('f-unit', 'Unit utama', `<select id="f-unit" class="select">${ADMIN_UNITS.map((u) => `<option>${u.name}</option>`).join('')}</select>`, 'Grant role berskop diatur setelah akun dibuat.')}`, 'noopclose', 'Buat akun')
  if (d.kind === 'confirm') return dialogShell(d.title, d.msg, '', 'noopclose', d.label, true)
  return ''
}
ACT.sig = (a) => { state.form.sigMode = a[0]; render() }
ACT.noopclose = () => { const d = state.dialog; if (d.run) d.run(); state.dialog = null; toast(d.done || 'Aksi peraga — tidak ada data yang disimpan.') }
ACT.savesurat = () => {
  const f = state.form
  if (!f.no || !f.from || !f.subj) { f.err = 'Nomor surat, asal, dan perihal wajib diisi.'; return render() }
  const n = Math.max(...DB.surat.map((s) => s.agendaNo)) + 1
  DB.surat.unshift({ id: 'sm-new' + n, agendaNo: n, letterNumber: f.no, sender: f.from, subject: f.subj, letterDate: f.date || dayKey(new Date()), receivedDate: dayKey(new Date()), classification: f.cls, status: 'draft', workflow: 'draft', letterKind: 'lainnya', responseDue: '', eventStart: '', version: 1, createdAt: nowISO(), attachments: 0 })
  state.dialog = null; toast('Draft surat tersimpan.')
}
ACT.dosign = () => {
  if (!state.form.agree) { state.form.err = 'Centang pernyataan persetujuan terlebih dahulu.'; return render() }
  const k = DB.keluar.find((x) => x.id === state.dialog.id); k.status = 'Disetujui'; k.signedAt = nowISO()
  state.dialog = null; toast('Surat ditandatangani dan disetujui.')
}
ACT.docomplete = () => {
  const f = state.form
  if (!f.note || f.note.trim().length < 10) { f.err = 'Tuliskan ringkasan hasil minimal 10 karakter.'; return render() }
  const t = DB.tasks.find((x) => x.id === state.dialog.id)
  Object.assign(t, { status: 'completed', reviewStatus: 'awaiting_review', completionNote: f.note, slaStatus: daysFrom(t.dueDate) < 0 ? 'completed_late' : 'completed_on_time' })
  ;(DB.events[t.id] = DB.events[t.id] || []).push({ action: 'completed', actor: me().displayName, at: nowISO(), reason: f.note })
  state.dialog = null; toast('Laporan terkirim. Menunggu review pemberi disposisi.')
}
ACT.dorevise = () => {
  const f = state.form
  if (!f.note) { f.err = 'Alasan wajib diisi.'; return render() }
  if (state.dialog.kind === 'revise') { const t = DB.tasks.find((x) => x.id === state.dialog.id); Object.assign(t, { reviewStatus: 'revision_requested', reviewReason: f.note }) }
  else { DB.keluar.find((x) => x.id === state.dialog.id).status = 'Penelaahan' }
  state.dialog = null; state.drawer = null; toast('Dikembalikan dengan catatan.')
}
ACT.dodispose = () => {
  const f = state.form
  if (!f.note) { f.err = 'Instruksi wajib diisi.'; return render() }
  DB.surat.find((x) => x.id === state.dialog.id).workflow = 'dispatched'
  state.dialog = null; toast('Disposisi terkirim ke ' + (f.to || 'Bayu Kertanegara · URMIN') + '.')
}
/* =====================================================================
   14. PALET PERINTAH (Ctrl+K) — satu pintu ke semua halaman & data
   ===================================================================== */
ACT.palette = () => { state.palette = { open: true, q: '', idx: 0 }; state.pop = null; render(); focusLater('pal-q') }
function paletteItems() {
  const q = state.palette.q.trim().toLowerCase()
  const out = []
  const pages = [['Portal', 'home', 'go:portal'], ['Berita & pengumuman', 'news', 'go:portal:::news'], ['SOP & peraturan', 'book', 'go:portal:::docs'], ['Kalender bersama', 'calendar', 'go:portal:::agenda'], ['Profil & keamanan', 'user', 'go:profile'], ['Roadmap', 'list', 'go:roadmap']]
  if (!isSA()) pages.push(['Arahan pimpinan', 'bell', 'go:arahan'])
  if (isLeader() || isSA()) pages.push(['Dashboard pimpinan', 'chart', 'go:executive'])
  if (isSA()) pages.push(['Pengguna', 'users', 'go:users'], ['Role & izin', 'key', 'go:roles'], ['Jejak audit', 'activity', 'go:audit'])
  UNITS.filter((u) => canUnit(u.id)).forEach((u) => {
    pages.push([`${u.title} · Dashboard`, u.icon, `go:unit:${u.id}`])
    if (u.id === 'urmin') [['surat-masuk', 'Surat masuk', 'inbox'], ['surat-keluar', 'Surat keluar', 'send'], ['disposisi', 'Disposisi', 'clipboard'], ['berkas', 'Berkas kerja', 'folder'], ['agenda', 'Agenda & rapat', 'calendar'], ['arsip', 'Arsip', 'archive']].forEach(([m, l, ic]) => pages.push([`URMIN · ${l}`, ic, `go:unit:urmin:${m}`]))
    else u.modules.forEach((m) => pages.push([`${u.title} · ${m.title}`, m.icon, `go:unit:${u.id}:${m.id}`]))
  })
  pages.filter(([l]) => !q || l.toLowerCase().includes(q)).slice(0, q ? 8 : 6).forEach(([l, ic, act]) => out.push({ g: 'Halaman', l, ic, act, sub: '' }))
  if (!q) return out
  if (canUnit('urmin')) {
    DB.surat.filter((s) => `${s.subject} ${s.letterNumber} ${s.sender} ${s.agendaNo}`.toLowerCase().includes(q)).slice(0, 5).forEach((s) => out.push({ g: 'Surat masuk', l: s.subject, sub: `No. ${s.agendaNo} · ${s.letterNumber}`, ic: 'inbox', act: `goopen:unit~urmin~surat-masuk:surat:${s.id}` }))
    DB.keluar.filter((s) => `${s.title} ${s.code}`.toLowerCase().includes(q)).slice(0, 3).forEach((s) => out.push({ g: 'Surat keluar', l: s.title, sub: s.code, ic: 'send', act: `goopen:unit~urmin~surat-keluar:keluar:${s.id}` }))
  }
  if (!isSA()) DB.tasks.filter((t) => (t.assigneeId === me().id || t.issuerId === me().id) && `${t.subject} ${t.instruction}`.toLowerCase().includes(q)).slice(0, 4).forEach((t) => out.push({ g: 'Disposisi', l: t.subject, sub: TS_LABEL[t.status], ic: 'clipboard', act: `goopen:unit~urmin~disposisi:task:${t.id}` }))
  if (isSA()) DB.users.filter((u) => `${u.displayName} ${u.username}`.toLowerCase().includes(q)).slice(0, 5).forEach((u) => out.push({ g: 'Pengguna', l: u.displayName, sub: '@' + u.username, ic: 'user', act: `goopen:users:user:${u.id}` }))
  return out
}
ACT.goopen = (a) => { ACT.go(a[0].split('~')); ACT.open([a[1], a[2]]) }
function runPalette(it) { state.palette.open = false; const [n, ...r] = it.act.split(':'); ACT[n](r) }
ACT.palrun = (a) => runPalette(paletteItems()[Number(a[0])])
function paletteView() {
  const items = paletteItems()
  let g = ''
  return `<div class="palette-wrap" data-act="closebg"><div class="palette" role="dialog" aria-modal="true" aria-label="Pencarian cepat">
    <div class="palette-input">${icon('search', 19)}<input id="pal-q" placeholder="Cari halaman, nomor surat, perihal, disposisi…" value="${esc(state.palette.q)}" data-model="palette.q" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-activedescendant="pal-${state.palette.idx}" autocomplete="off"><span class="kbd">Esc</span></div>
    <div class="palette-list" id="pal-list" role="listbox">${items.length ? items.map((it, i) => {
      const head = it.g !== g ? `<div class="palette-group">${(g = it.g)}</div>` : ''
      return `${head}<button id="pal-${i}" role="option" aria-selected="${i === state.palette.idx}" class="palette-item ${i === state.palette.idx ? 'on' : ''}" data-act="palrun:${i}">${icon(it.ic, 17)}<span>${esc(it.l)}${it.sub ? `<br><small>${esc(it.sub)}</small>` : ''}</span>${i === state.palette.idx ? '<span class="kbd">Enter</span>' : ''}</button>`
    }).join('') : `<div class="empty"><p>Tidak ada hasil untuk “${esc(state.palette.q)}”.</p></div>`}</div>
    <div class="palette-foot"><span><span class="kbd">↑</span><span class="kbd">↓</span> pilih</span><span><span class="kbd">Enter</span> buka</span><span><span class="kbd">Esc</span> tutup</span></div>
  </div></div>`
}

/* =====================================================================
   15. ADMINISTRASI IDENTITAS (Superadmin)
   ===================================================================== */
const roleName = (k) => (ADMIN_ROLES.find((r) => r.key === k) || {}).name || k
function userStatus(u) {
  if (!u.active) return '<span class="chip chip--danger">Nonaktif</span>'
  if (u.forcePasswordChange) return '<span class="chip chip--warn">Wajib ganti password</span>'
  return '<span class="chip chip--ok">Aktif</span>'
}
function usersView() {
  const { q, status } = state.list
  const ql = q.toLowerCase()
  const base1 = DB.users.filter((u) => `${u.displayName} ${u.username} ${u.email}`.toLowerCase().includes(ql))
  const test = { all: () => true, active: (u) => u.active && !u.forcePasswordChange, pw: (u) => u.active && u.forcePasswordChange, off: (u) => !u.active }
  const rows = base1.filter(test[status] || test.all)
  return `${pageHead('Administrasi identitas', 'Pengguna', 'Akun, status, dan grant role berskop per unit.', `<button class="btn btn--primary" data-act="dlg:user-baru">${icon('plus', 16)} Tambah pengguna</button>`)}
  <section class="card"><div class="toolbar">${searchInput('Cari nama, username, atau email')}
    <div class="filters">${[['all', 'Semua'], ['active', 'Aktif'], ['pw', 'Wajib ganti password'], ['off', 'Nonaktif']].map(([k, l]) => `<button class="fchip" aria-pressed="${status === k}" data-act="filter:status:${k}">${l} <span class="n">${base1.filter(test[k]).length}</span></button>`).join('')}</div></div>
    ${rows.length ? `<div class="table-wrap"><table class="tbl"><thead><tr><th>Pengguna</th><th class="hide-sm">Unit utama</th><th class="hide-sm">Grant</th><th class="hide-sm">OTP</th><th>Status</th></tr></thead><tbody>
    ${rows.map((u) => `<tr data-act="open:user:${u.id}" tabindex="0" class="${state.drawer && state.drawer.id === u.id ? 'sel' : ''}"><td><div style="display:flex;gap:12px;align-items:center"><span class="avatar">${initials(u.displayName)}</span><span class="cell-title"><strong>${esc(u.displayName)}</strong><small>@${esc(u.username)}</small></span></div></td>
      <td class="hide-sm">${u.primaryUnit ? UNIT_SHORT[u.primaryUnit] : '<span class="muted">—</span>'}</td>
      <td class="hide-sm">${u.protected ? '<span class="chip chip--gold chip--plain">Sistem</span>' : u.grants.length ? u.grants.map((g) => `<span class="chip chip--plain" style="margin:2px 4px 2px 0">${esc(roleName(g.roleKey))} · ${UNIT_SHORT[g.unitKey]}</span>`).join('') : '<span class="muted">Belum ada</span>'}</td>
      <td class="hide-sm">${u.otpEnabled || u.protected ? `<span class="chip chip--ok chip--plain">${icon('check', 12)} Aktif</span>` : '<span class="chip chip--plain">Mati</span>'}</td>
      <td>${userStatus(u)}</td></tr>`).join('')}</tbody></table></div>` : emptyFilter()}
    <div class="tbl-foot"><span>${rows.length} dari ${DB.users.length} akun</span></div></section>`
}
const SCOPE = { own: 'Dibuat sendiri', assigned: 'Ditugaskan', unit: 'Seluruh unit' }
function userDrawer(u) {
  const foot = u.protected ? '' : `<button class="btn btn--danger" data-act="confirm:${u.active ? 'off' : 'on'}:${u.id}">${u.active ? 'Nonaktifkan' : 'Aktifkan kembali'}</button><span class="spacer"></span><button class="btn" data-act="confirm:reset:${u.id}">${icon('key', 16)} Reset password</button><button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Tambah grant</button>`
  return drawerShell(`@${esc(u.username)}${u.protected ? '<span class="chip chip--gold chip--plain">Akun sistem</span>' : ''}`, esc(u.displayName), `
    <div style="display:flex;gap:14px;align-items:center"><span class="avatar avatar--lg">${initials(u.displayName)}</span><div>${userStatus(u)}<div class="muted" style="font-size:13px;margin-top:6px">${esc(u.email)}</div></div></div>
    ${kv([['Unit utama', u.primaryUnit ? UNIT_SHORT[u.primaryUnit] : '—'], ['OTP email', u.otpEnabled || u.protected ? 'Aktif' + (u.protected ? ' (wajib untuk Superadmin)' : '') : 'Tidak aktif'], ['Versi data', 'v' + u.version]])}
    ${u.forcePasswordChange ? `<div class="alert alert--warn">${icon('alert', 16)}<span>Pengguna ini belum mengganti password sementara, sehingga semua ruang kerja masih terblokir. Ini bukan kesalahan RBAC.</span></div>` : ''}
    <section><div class="section-label">Grant berskop (${u.grants.length})</div>
      ${u.protected ? '<div class="note">Superadmin tidak memiliki grant operasional. Aksesnya terbatas pada administrasi identitas.</div>' : u.grants.length ? u.grants.map((g) => `<div class="file-row" style="grid-template-columns:36px 1fr auto"><span class="ic" style="${unitStyle({ urmin: 'urmin', subbagren: 'ren', subbagsumda: 'sumda', subbagbinfung: 'binfung' }[g.unitKey])}">${icon('key', 15)}</span><span><strong>${esc(roleName(g.roleKey))} · ${UNIT_SHORT[g.unitKey]}</strong><small>${SCOPE[g.scope]} · batas ${g.classificationLimit}${g.expiresAt ? ` · berakhir ${fmt(g.expiresAt)}` : ''}</small></span><button class="icon-btn" data-act="confirm:revoke:${u.id}" aria-label="Cabut grant">${icon('x', 16)}</button></div>`).join('') : '<p class="muted">Belum ada grant. Pengguna belum bisa membuka ruang kerja apa pun.</p>'}</section>
    <section><div class="section-label">Aktivitas terkait</div>${AUDIT_EVENTS.filter((e) => e.subject === u.username).length ? auditRows(AUDIT_EVENTS.filter((e) => e.subject === u.username)) : '<p class="muted">Belum ada catatan audit.</p>'}</section>`, foot)
}
ACT.confirm = (a) => {
  const [kind, id] = a
  const u = DB.users.find((x) => x.id === id)
  const C = {
    off: ['Nonaktifkan akun?', `${u.displayName} akan langsung keluar dari semua sesi dan tidak bisa masuk lagi sampai diaktifkan kembali.`, 'Nonaktifkan', () => { u.active = false }],
    on: ['Aktifkan kembali akun?', `${u.displayName} bisa masuk kembali dengan grant yang masih berlaku.`, 'Aktifkan', () => { u.active = true }],
    reset: ['Reset password?', `Password lama ${u.displayName} tidak dapat dipulihkan. Password sementara akan dikirim, dan pengguna wajib menggantinya saat login.`, 'Reset password', () => { u.forcePasswordChange = true }],
    revoke: ['Cabut grant?', 'Akses ke data unit tersebut langsung berhenti. Tindakan ini tercatat di jejak audit.', 'Cabut grant', () => {}]
  }[kind]
  state.dialog = { kind: 'confirm', title: C[0], msg: C[1], label: C[2], run: C[3], done: 'Perubahan tersimpan dan tercatat di jejak audit (peraga).' }
  render()
}
function rolesView() {
  const r = ADMIN_ROLES.find((x) => x.key === state.role.sel)
  const groups = {}
  PERMISSION_CATALOG.forEach((p) => { const g = p.key.split('.')[0]; (groups[g] = groups[g] || []).push(p) })
  return `${pageHead('Administrasi identitas', 'Role &amp; Izin', 'Role menentukan izin. Data mana yang bisa dibuka ditentukan oleh grant berskop per pengguna.', `<button class="btn btn--primary" data-act="noop">${icon('plus', 16)} Role baru</button>`)}
  <div class="grid" style="grid-template-columns:minmax(220px,300px) 1fr;align-items:start">
    <section class="card"><div class="card-body list-select">${ADMIN_ROLES.map((x) => `<button aria-current="${x.key === r.key}" data-act="rolesel:${x.key}"><strong>${esc(x.name)}${x.system ? '<span class="chip chip--gold chip--plain">Sistem</span>' : ''}${!x.active ? '<span class="chip chip--plain">Nonaktif</span>' : ''}</strong><small>${x.permissions.length} izin · v${x.version}</small></button>`).join('')}</div></section>
    <section class="card"><div class="card-head"><div><h2>${esc(r.name)}</h2><p>${esc(r.description)}</p></div><span class="chip chip--plain">${r.permissions.length} izin</span></div>
      <div class="card-pad">
        ${r.system ? `<div class="alert alert--info" style="margin-bottom:14px">${icon('lock', 16)}<span>Role sistem tidak bisa diubah dari antarmuka.</span></div>` : ''}
        ${Object.entries(groups).map(([g, ps]) => `<div class="perm-group"><h4><span>${esc(GROUP_NAMES[g] || g)}</span><span class="muted">${ps.filter((p) => r.permissions.includes(p.key)).length}/${ps.length}</span></h4>
          ${ps.map((p) => `<label class="perm"><input type="checkbox" ${r.permissions.includes(p.key) ? 'checked' : ''} ${r.system ? 'disabled' : ''} data-act="permtoggle"><span>${esc(p.description)}<br><code>${esc(p.key)}</code></span></label>`).join('')}</div>`).join('')}
      </div>
      ${r.system ? '' : `<div class="drawer-foot" style="border-radius:0 0 var(--r-lg) var(--r-lg)"><span class="muted" style="font-size:12.5px;align-self:center">Perubahan berlaku untuk semua pengguna dengan role ini.</span><span class="spacer"></span><button class="btn btn--primary" data-act="noop:${encodeURIComponent('Role tersimpan sebagai versi baru (peraga).')}">Simpan perubahan</button></div>`}
    </section>
  </div>`
}
const GROUP_NAMES = { identity: 'Administrasi pengguna & role', audit: 'Audit', urmin: 'Urmin · Persuratan', subbagren: 'Subbagren · Perencanaan', subbagsumda: 'Subbagsumda · Sumber daya', subbagbinfung: 'Subbagbinfung · Pembinaan fungsi', dashboard: 'Dashboard' }
ACT.rolesel = (a) => { state.role.sel = a[0]; render() }
ACT.permtoggle = () => {}
function auditView() {
  return `${pageHead('Administrasi identitas', 'Jejak Audit', 'Setiap perubahan akun, grant, dan role tercatat beserta alasannya.', `<button class="btn" data-act="noop">${icon('download', 16)} Ekspor</button>`)}
  <section class="card"><div class="card-body">${auditRows(AUDIT_EVENTS)}</div></section>`
}

/* =====================================================================
   16. PROFIL & ROADMAP
   ===================================================================== */
function profileView() {
  const a = me()
  const u = DB.users.find((x) => x.id === a.id) || { grants: [], otpEnabled: true }
  return `${pageHead('Akun', 'Profil &amp; Keamanan', 'Data akun Anda dan pengaturan keamanan login.')}
  <div class="grid grid-main">
    <section class="card card-pad"><div style="display:flex;gap:16px;align-items:center;margin-bottom:20px"><span class="avatar avatar--lg">${initials(a.displayName)}</span><div><h2>${esc(a.displayName)}</h2><p class="muted">${esc(a.jabatan)} · @${esc(a.username)}</p></div></div>
      ${kv([['Email', esc(a.email)], ['Unit utama', a.primaryUnit ? UNIT_SHORT[a.primaryUnit] : '—'], ['Peran', a.roles.map(roleName).join(', ')]])}
      <div class="section-label" style="margin-top:22px">Grant akses</div>
      ${isSA() ? '<div class="note">Administrator identitas: tanpa grant operasional.</div>' : u.grants.map((g) => `<div class="file-row" style="grid-template-columns:36px 1fr"><span class="ic tone-gold">${icon('key', 15)}</span><span><strong>${esc(roleName(g.roleKey))} · ${UNIT_SHORT[g.unitKey]}</strong><small>${SCOPE[g.scope]} · batas klasifikasi ${g.classificationLimit}</small></span></div>`).join('') || '<p class="muted">—</p>'}
    </section>
    <div class="stack">
      <section class="card"><div class="card-head"><h2>Keamanan login</h2></div><div class="card-body">
        <div class="action-row" style="cursor:default"><span class="ic tone-ok">${icon('mail', 17)}</span><span><strong>OTP email</strong><small>${isSA() ? 'Wajib untuk Superadmin' : u.otpEnabled ? 'Aktif' : 'Tidak aktif'}</small></span><span class="end"><span class="chip chip--ok">Aktif</span></span></div>
        <div class="action-row" style="cursor:default"><span class="ic tone-info">${icon('lock', 17)}</span><span><strong>Password</strong><small>Diganti secara berkala</small></span><span class="end"><button class="btn btn--sm" data-act="noop">Ganti</button></span></div>
      </div></section>
      <section class="card"><div class="card-head"><h2>Tampilan</h2></div><div class="card-pad"><div class="seg" role="group" aria-label="Tema"><button aria-pressed="${state.themePref === 'light'}" data-act="settheme:light">${icon('sun', 15)} Terang</button><button aria-pressed="${state.themePref === 'dark'}" data-act="settheme:dark">${icon('moon', 15)} Gelap</button><button aria-pressed="${state.themePref === 'system'}" data-act="settheme:system">${icon('settings', 15)} Ikuti sistem</button></div><p class="field-hint" style="margin-top:8px">Hanya preferensi tema yang disimpan di peramban.</p></div></section>
    </div>
  </div>`
}
ACT.settheme = (a) => { state.themePref = a[0]; try { localStorage.setItem('sdl-rd-theme', a[0]) } catch {} ; render() }
function roadmapView() {
  const T = { done: ['chip--ok', 'Selesai'], progress: ['chip--gold', 'Berjalan'], planned: ['', 'Direncanakan'] }
  return `${pageHead('Platform', 'Roadmap Pengembangan', 'Status fitur per area.')}
  <div class="grid grid-3">${ROADMAP.map((g) => `<section class="card card-pad"><h3 style="margin-bottom:8px">${esc(g.group)}</h3>${g.items.map(([t, s]) => `<div class="roadmap-item"><span>${esc(t)}</span><span class="chip ${T[s][0]}">${T[s][1]}</span></div>`).join('')}</section>`).join('')}</div>`
}

/* =====================================================================
   17. Penyempurnaan & mulai
   ===================================================================== */
// OTP: ambil digit terakhir saat mengetik di kotak yang sudah terisi; tempel didistribusikan.
otpInput = function (el) {
  const l = state.login
  const i = Number(el.dataset.otp)
  const digits = el.value.replace(/\D/g, '')
  if (digits.length >= 6 || (digits.length > 2)) {
    digits.slice(0, 6 - i).split('').forEach((d, k) => { l.otp[i + k] = d })
  } else l.otp[i] = digits.slice(-1)
  l.err = ''
  render()
  const next = l.otp.findIndex((x) => !x)
  if (next === -1) return ACT.verify()
  if (l.otp[i]) focusLater('otp-' + (digits.length > 2 ? next : Math.min(5, i + 1)))
}
root.addEventListener('paste', (ev) => {
  const el = ev.target
  if (el.dataset.otp == null) return
  ev.preventDefault()
  el.value = (ev.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  otpInput(el)
})
// Baris tabel dapat dibuka dengan Enter/Spasi (aksesibilitas keyboard)
root.addEventListener('keydown', (ev) => {
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('tr[data-act]')) { ev.preventDefault(); ev.target.click() }
})
const _post = ACT.post
ACT.post = (a) => { if ([...POSTS, ...PORTAL_AGENDA].some((p) => p.id === a[0])) _post(a) }

// Pintasan peraga: ?as=u-001&go=unit:urmin:surat-masuk&open=surat:sm-01  (lewati login untuk presentasi)
;(() => {
  const q = new URLSearchParams(location.search)
  if (q.get('theme')) state.theme = q.get('theme')
  const acc = ACCOUNTS.find((x) => x.id === q.get('as'))
  if (!acc) return
  state.account = acc; state.login.stage = 'done'
  state.nav.expanded = { [acc.primaryUnit || 'urmin']: true }
  if (q.get('go')) state.route = (([view, unit, menu, tab]) => ({ view, unit: unit || null, menu: menu || '', tab: tab || '' }))(q.get('go').split(':'))
  if (q.get('open')) { const [type, id] = q.get('open').split(':'); state.drawer = { type, id, tab: 'info' } }
  if (q.get('pal')) state.palette = { open: true, q: q.get('pal'), idx: 0 }
  if (q.get('dlg')) { const [kind, id] = q.get('dlg').split(':'); state.dialog = { kind, id }; state.form = { cls: 'biasa', sigMode: 'saved' } }
})()
if (!state.account) startDeviceCheck()
render()