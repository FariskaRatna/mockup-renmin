/* SIERA DELTA LIMA — mockup statis, tanpa backend.
   Meniru struktur markup dan nama kelas dari apps/frontend/src supaya
   tampilannya identik dengan aplikasi asli, tetapi seluruh data karangan
   dan seluruh aksi hanya mengubah state di memori browser. */

/* =========================================================
   1. Utilitas
   ========================================================= */
const root = document.getElementById('root')
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const icon = (name, size = 19) => `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.info}</svg>`
const idDate = (v, opt) => { const d = new Date(v); return isNaN(d) ? '—' : d.toLocaleDateString('id-ID', opt || { day: '2-digit', month: 'short', year: 'numeric' }) }
const idDateTime = (v) => { const d = new Date(v); return isNaN(d) ? '—' : d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }
const idLong = (v) => { const d = new Date(v); return isNaN(d) ? '—' : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }
const monthName = (d) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
const localKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const midnight = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }
const initials = (name) => String(name || '').trim().split(/\s+/).slice(0, 2).map((x) => x.charAt(0).toUpperCase()).join('') || 'U'
const ms = (v) => { const t = Date.parse(v); return Number.isFinite(t) ? t : 0 }

/* =========================================================
   2. State
   ========================================================= */
const SUPERADMIN_VIEWS = ['portal', 'executive', 'users', 'roles', 'profile', 'roadmap']
const state = {
  theme: 'light',
  portalTheme: 'light',
  account: null,
  screen: { view: 'portal' },
  lastUnit: 'urmin',
  mobileMenu: false,
  sidebarCollapsed: false,
  toast: null,
  login: { stage: 'credentials', username: '', password: '', otp: '', captcha: 'idle', error: '' },
  portal: { view: 'home', query: '', filter: 'all', detail: null, calMode: 'month', calCursor: midnight() },
  ui: {
    suratSearch: '', suratSelected: null, suratModal: null,
    taskQuery: '', taskStatus: 'all', taskSort: 'latest', taskSelected: null,
    berkasQuery: '', berkasClass: 'semua', berkasSelected: null, berkasTab: 'files',
    registryQuery: '', registrySort: 'latest',
    agendaMode: 'month', agendaCursor: midnight(), agendaDay: null,
    dashPeriod: 90, dashFilter: 'all', dashTaskFilter: 'all', dashDetails: false,
    smartPeriod: 90, smartSource: 'all', smartStatus: 'all', smartDetails: false,
    userQuery: '', userUnit: 'all', userStatus: 'all', userOtp: 'all', userPage: 1, userModal: null, userTab: 'profile', auditOpen: false,
    roleSelected: 'operator', roleSearch: '', roleView: 'simple', rolePreview: '',
    directiveOpen: null
  }
}

/* =========================================================
   3. Render + event delegation
   ========================================================= */
function render() {
  const active = document.activeElement
  const key = active && active.dataset ? active.dataset.k : null
  const selStart = active && 'selectionStart' in active ? active.selectionStart : null
  const selEnd = active && 'selectionEnd' in active ? active.selectionEnd : null
  const scroll = window.scrollY

  document.documentElement.dataset.theme = displayTheme()
  root.innerHTML = view()

  if (key) {
    const el = root.querySelector(`[data-k="${key}"]`)
    if (el) { el.focus(); try { el.setSelectionRange(selStart, selEnd) } catch (e) { /* bukan input teks */ } }
  }
  window.scrollTo(0, scroll)
}
function displayTheme() {
  if (state.account && state.screen.view === 'portal') return state.portalTheme
  return state.theme
}
function toast(message, kind = 'success') {
  state.toast = { message, kind }
  render()
  clearTimeout(toast._t)
  toast._t = setTimeout(() => { state.toast = null; render() }, 3200)
}

const ACTIONS = {}
root.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]')
  if (!el || !root.contains(el)) return
  const [name, ...args] = el.dataset.act.split(':')
  const fn = ACTIONS[name]
  if (!fn) return
  ev.preventDefault()
  fn(args, el, ev)
})
root.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-model]')
  if (!el) return
  setPath(el.dataset.model, el.type === 'checkbox' ? el.checked : el.value)
  if (el.dataset.live === 'off') return
  render()
})
root.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-model]')
  if (!el || el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'radio') return
  setPath(el.dataset.model, el.type === 'checkbox' ? el.checked : el.value)
  render()
})
root.addEventListener('submit', (ev) => {
  const form = ev.target.closest('form[data-act]')
  if (!form) return
  ev.preventDefault()
  const [name, ...args] = form.dataset.act.split(':')
  if (ACTIONS[name]) ACTIONS[name](args, form, ev)
})
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return
  const u = state.ui
  if (u.suratModal || u.taskSelected || u.userModal || u.agendaDay || state.portal.detail || u.directiveOpen) {
    u.suratModal = null; u.taskSelected = null; u.userModal = null; u.agendaDay = null; u.directiveOpen = null
    state.portal.detail = null
    render()
  } else if (state.mobileMenu) { state.mobileMenu = false; render() }
})

function setPath(path, value) {
  const parts = path.split('.')
  let node = state
  for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]]
  node[parts[parts.length - 1]] = value
}

/* =========================================================
   4. Navigasi
   ========================================================= */
function isSuperadmin() { return !!state.account && state.account.roles.includes('superadmin') }
function navigate(next) {
  const screen = Object.assign({}, next)
  if (screen.view === 'inbox') Object.assign(screen, { view: 'workspace', unit: 'urmin', menu: 'surat-masuk', tab: 'inbox' })
  if (screen.view === 'tasks') Object.assign(screen, { view: 'workspace', unit: 'urmin', menu: 'disposisi', tab: 'mine' })
  if (isSuperadmin() && !SUPERADMIN_VIEWS.includes(screen.view)) {
    toast('Superadmin tidak diberi akses ke ruang kerja operasional. Ini perilaku yang disengaja.', 'error')
    return
  }
  if (screen.view === 'workspace' && screen.unit) state.lastUnit = screen.unit
  state.screen = screen
  state.mobileMenu = false
  Object.assign(state.ui, { suratSelected: null, taskSelected: null, berkasSelected: null, agendaDay: null, registryQuery: '', suratSearch: '', berkasQuery: '', taskQuery: '' })
  render()
  window.scrollTo({ top: 0 })
}
ACTIONS.nav = (a) => navigate({ view: a[0], unit: a[1] || undefined, menu: a[2] || undefined, tab: a[3] || undefined })
ACTIONS.theme = () => {
  if (state.screen.view === 'portal') state.portalTheme = state.portalTheme === 'dark' ? 'light' : 'dark'
  else state.theme = state.theme === 'dark' ? 'light' : 'dark'
  render()
}
ACTIONS.mobile = () => { state.mobileMenu = !state.mobileMenu; render() }
ACTIONS.collapse = () => { state.sidebarCollapsed = !state.sidebarCollapsed; render() }
ACTIONS.logout = () => { state.account = null; state.screen = { view: 'portal' }; state.login = { stage: 'credentials', username: '', password: '', otp: '', captcha: 'idle', error: '' }; render() }
ACTIONS.soon = (a) => toast(a[0] ? decodeURIComponent(a[0]) : 'Mockup statis: aksi ini tidak mengubah data.', 'info')
ACTIONS.close = () => { Object.assign(state.ui, { suratModal: null, taskSelected: null, userModal: null, agendaDay: null, directiveOpen: null }); state.portal.detail = null; render() }
/* Hanya menutup kalau klik mengenai latar, bukan isi dialog. Memakai
   stopPropagation pada dialog akan mematikan seluruh tombol di dalamnya,
   karena semua event ditangani lewat delegasi di #root. */
ACTIONS.closebg = (a, el, ev) => { if (ev.target === el) ACTIONS.close() }

/* =========================================================
   5. Layar masuk
   ========================================================= */
ACTIONS.pick = (a) => {
  const acc = DEMO_ACCOUNTS.find((x) => x.id === a[0])
  state.login.username = acc.username
  state.login.password = 'KataSandiPeraga2026!'
  state.login.error = ''
  render()
}
ACTIONS.captcha = () => {
  if (state.login.captcha === 'solving' || state.login.captcha === 'verified') return
  state.login.captcha = 'solving'
  render()
  setTimeout(() => { state.login.captcha = 'verified'; render() }, 900)
}
ACTIONS.login = () => {
  const l = state.login
  if (l.stage === 'credentials') {
    if (!l.username.trim()) { l.error = 'Username atau email wajib diisi.'; return render() }
    if (!l.password) { l.error = 'Password wajib diisi.'; return render() }
    if (l.captcha !== 'verified') { l.error = 'Selesaikan verifikasi sebelum masuk.'; return render() }
    if (!DEMO_ACCOUNTS.some((a) => a.username === l.username.trim())) {
      l.error = 'Username atau password tidak sesuai. Pilih salah satu akun peraga di samping.'
      l.captcha = 'idle'
      return render()
    }
    l.stage = 'otp'; l.otp = ''; l.error = ''
    render()
    const field = root.querySelector('#sdl-otp')
    if (field) field.focus()
    return
  }
  if (l.otp.length !== 6) { l.error = 'Kode OTP harus enam digit.'; return render() }
  const acc = DEMO_ACCOUNTS.find((a) => a.username === l.username.trim())
  state.account = acc
  state.screen = { view: 'portal' }
  state.login.error = ''
  render()
  window.scrollTo(0, 0)
}
ACTIONS.loginback = () => { state.login.stage = 'credentials'; state.login.otp = ''; state.login.error = ''; state.login.captcha = 'idle'; render() }
ACTIONS.switch = (a) => {
  state.account = DEMO_ACCOUNTS.find((x) => x.id === a[0])
  state.screen = { view: 'portal' }
  toast(`Peran peraga diganti ke ${state.account.displayName}.`)
}

function brand(compact) {
  return `<div class="brand${compact ? ' brand--compact' : ''}" aria-label="Siera Delta Lima">
    <span class="brand-symbol"><span class="sdl-logo-fallback">SDL</span></span>
    <span class="brand-words"><strong>SIERA <em>DELTA LIMA</em></strong><small>BagRenmin Densus 88 AT Polri</small></span>
  </div>`
}

function loginView() {
  const l = state.login
  const otp = l.stage === 'otp'
  return `<div class="sdl-shell" data-theme="${state.theme}">
  <div class="auth-shell" style="min-height:100vh">
    <section class="auth-hero">
      <div class="auth-hero-top">${brand(false)}<span class="auth-unit-mark">PORTAL INTERNAL</span></div>
      <div class="auth-hero-content">
        <span class="hero-eyebrow">BAGRENMIN DENSUS 88 AT POLRI</span>
        <h1>One Workspace.<br><em>Full Visibility.</em></h1>
        <p>Mockup antarmuka. Pilih salah satu akun peraga di bawah untuk melihat perbedaan hak akses.</p>
        <div class="mk-demo-accounts">
          ${DEMO_ACCOUNTS.map((a) => `<button type="button" data-act="pick:${a.id}" class="mk-demo-account${l.username === a.username ? ' is-picked' : ''}">
            <strong>${esc(a.displayName)}</strong><small>@${esc(a.username)} · ${esc(a.jabatan)}</small><em>${esc(a.note)}</em>
          </button>`).join('')}
        </div>
      </div>
      <div class="auth-hero-foot"><span>SIERA DELTA LIMA</span><span>Mockup · data fiktif</span></div>
    </section>
    <section class="auth-pane"><div class="auth-form">
      <span class="auth-form-eyebrow">PORTAL PERSONEL</span>
      <h2>${otp ? 'Verifikasi akun' : 'Selamat datang'}</h2>
      <p>${otp ? 'Masukkan kode enam digit. Pada mockup ini kode apa pun diterima — contoh: 123456.' : 'Masuk untuk mengakses ruang kerja BagRenmin.'}</p>
      <div class="auth-preview-info">${icon('info', 17)}<span>Ini halaman peraga. Tidak ada server, tidak ada data nyata, dan tidak ada yang dikirim ke mana pun.</span></div>
      ${otp ? '' : `<div class="mk-mobile-accounts">${DEMO_ACCOUNTS.map((a) => `<button type="button" data-act="pick:${a.id}" class="mk-demo-account${l.username === a.username ? ' is-picked' : ''}"><strong>${esc(a.displayName)}</strong><small>@${esc(a.username)} · ${esc(a.jabatan)}</small></button>`).join('')}</div>`}
      ${l.error ? `<div class="auth-error" role="alert">${esc(l.error)}</div>` : ''}
      <form data-act="login">
        ${otp ? `<label for="sdl-otp">Kode OTP 6 digit</label>
          <input id="sdl-otp" data-k="otp" class="otp-code" inputmode="numeric" maxlength="6" placeholder="000000" value="${esc(l.otp)}" data-model="login.otp">`
      : `<label for="sdl-username">Username atau email</label>
          <input id="sdl-username" data-k="user" autocomplete="username" placeholder="Username atau email" value="${esc(l.username)}" data-model="login.username">
          <label for="sdl-password">Password</label>
          <input id="sdl-password" data-k="pass" type="password" placeholder="Masukkan password" value="${esc(l.password)}" data-model="login.password">
          <div class="sdl-local-captcha" role="group" aria-label="CAPTCHA lokal">
            <div class="sdl-local-captcha-row">
              <span aria-hidden="true" class="sdl-local-shield">${l.captcha === 'verified' ? '✓' : '◆'}</span>
              <div><strong>${l.captcha === 'verified' ? 'Perangkat terverifikasi' : l.captcha === 'solving' ? 'Memverifikasi perangkat...' : 'Verifikasi keamanan lokal'}</strong><small>Verifikasi keamanan</small></div>
              <button type="button" class="btn" data-act="captcha" ${l.captcha === 'solving' || l.captcha === 'verified' ? 'disabled' : ''}>${l.captcha === 'verified' ? 'Terverifikasi' : l.captcha === 'solving' ? 'Proses...' : 'Verifikasi'}</button>
            </div>
          </div>`}
        <button class="btn primary full" type="submit">${icon(otp ? 'mail' : 'lock', 16)}${otp ? 'Verifikasi &amp; Masuk' : 'Masuk'}</button>
      </form>
      ${otp ? `<button type="button" class="text-link" data-act="loginback">${icon('back', 16)} Kembali ke login</button>` : ''}
    </div></section>
  </div></div>`
}

/* =========================================================
   6. Kerangka aplikasi
   ========================================================= */
function view() {
  if (!state.account) return loginView()
  const s = state.screen
  const unit = s.unit ? UNITS.find((u) => u.id === s.unit) : null
  const workspace = s.view === 'workspace' && unit
  return `<div class="sdl-shell sdl-shell--active" data-theme="${displayTheme()}">
    ${header(workspace, unit)}
    ${!workspace && state.mobileMenu ? mobileDrawer() : ''}
    ${workspace ? workspaceLayout(unit) : `<main class="${['portal', 'arahan', 'executive'].includes(s.view) ? 'portal-main portal-main--wide' : 'portal-main'}">${pageContent()}</main>`}
    <footer class="sdl-footer"><span>© 2026 SIERA DELTA LIMA</span><span>Mockup antarmuka · seluruh data fiktif</span></footer>
    ${state.toast ? `<div class="mk-toast ${state.toast.kind}" role="status">${esc(state.toast.message)}</div>` : ''}
    <div class="mk-badge" title="Halaman peraga tanpa backend">DEMO · DATA FIKTIF</div>
  </div>`
}

function header(workspace, unit) {
  const a = state.account
  const s = state.screen
  const sa = isSuperadmin()
  const pendingInbox = sa ? 0 : INBOX.filter((i) => i.status === 'sent').length
  const alerts = sa ? 0 : DIRECTIVES.filter((d) => d.status === 'Berjalan').length
  const navBtn = (view, label, ic, badge) => `<button type="button" class="header-text-btn ${s.view === view ? 'nav-current' : ''}" data-act="nav:${view}">${icon(ic, 17)} <span>${label}${badge ? ` (${badge})` : ''}</span></button>`
  return `<header class="sdl-header">
    <div class="header-left">
      <button type="button" class="icon-btn hamburger" aria-label="Buka navigasi" aria-expanded="${state.mobileMenu}" data-act="mobile">${icon(state.mobileMenu ? 'x' : 'menu')}</button>
      <button class="brand-button" data-act="nav:portal">${brand(true)}</button>
    </div>
    <nav class="header-actions sdl-nav-clean" aria-label="Main navigation">
      ${navBtn('portal', 'Portal', 'grid')}
      ${a.roles.includes('leader') || sa ? navBtn('executive', 'Dashboard', 'chart') : ''}
      ${!sa ? navBtn('arahan', 'Arahan', 'bell', alerts) : ''}
      ${!sa && !(workspace && unit.id === 'urmin') ? navBtn('inbox', 'Inbox', 'inbox', pendingInbox) : ''}
      ${!sa && !(workspace && unit.id === 'urmin') ? navBtn('tasks', 'Tasks', 'clipboard') : ''}
      ${sa ? `<details class="sdl-nav-menu"><summary aria-label="Management">${icon('settings', 17)} <span>Manage</span>${icon('chevron', 13)}</summary>
        <div class="sdl-nav-dropdown" role="group" aria-label="Management">
          <button type="button" data-act="nav:users">${icon('users', 16)} Users &amp; Access</button>
          <button type="button" data-act="nav:roles">${icon('key', 16)} Roles &amp; Permissions</button>
          <button type="button" data-act="nav:roadmap">${icon('list', 16)} Roadmap</button>
        </div></details>` : ''}
      <span class="sdl-nav-separator" aria-hidden="true"></span>
      <button type="button" class="icon-btn sdl-nav-theme" aria-label="Ganti tema" data-act="theme">${icon(displayTheme() === 'dark' ? 'sun' : 'moon')}</button>
      <details class="sdl-nav-menu sdl-nav-account"><summary aria-label="Account menu"><span class="r2d3-avatar">${initials(a.displayName)}</span><span class="sdl-nav-account-name">${esc(a.displayName)}</span>${icon('chevron', 13)}</summary>
        <div class="sdl-nav-dropdown sdl-nav-dropdown--right" role="group" aria-label="Account">
          <button type="button" data-act="nav:profile">${icon('user', 16)} My Profile</button>
          <button type="button" data-act="nav:roadmap">${icon('list', 16)} Roadmap</button>
          <div class="mk-dropdown-label">Ganti peran peraga</div>
          ${DEMO_ACCOUNTS.filter((x) => x.id !== a.id).map((x) => `<button type="button" data-act="switch:${x.id}">${icon('refresh', 16)} ${esc(x.displayName)}</button>`).join('')}
          <button type="button" class="sdl-nav-signout" data-act="logout">${icon('lock', 16)} Sign Out</button>
        </div></details>
    </nav>
  </header>`
}

function mobileDrawer() {
  const sa = isSuperadmin()
  const s = state.screen
  const item = (view, label, ic) => `<button type="button" class="${s.view === view ? 'is-active' : ''}" data-act="nav:${view}">${icon(ic, 18)} ${label}</button>`
  return `<button type="button" class="sdl-r5f23c-nav-backdrop" aria-label="Tutup navigasi" data-act="mobile"></button>
  <aside id="sdl-mobile-primary-nav" class="sdl-r5f23c-nav-drawer" aria-label="Navigasi seluler">
    <div class="sdl-r5f23c-nav-heading"><strong>Menu SIERA</strong><button type="button" aria-label="Tutup menu" data-act="mobile">${icon('x', 20)}</button></div>
    <nav aria-label="Navigasi utama seluler">
      ${item('portal', 'Portal', 'grid')}
      ${!sa ? item('arahan', 'Arahan', 'bell') : ''}
      ${!sa ? item('inbox', 'Inbox', 'inbox') : ''}
      ${!sa ? item('tasks', 'Tasks', 'clipboard') : ''}
      ${item('roadmap', 'Roadmap', 'list')}
      <div class="sdl-r5f23c-nav-divider"></div>
      ${item('profile', 'Profil Saya', 'user')}
      ${sa ? item('users', 'Users &amp; Access', 'users') + item('roles', 'Roles &amp; Permissions', 'key') : ''}
      <button type="button" data-act="theme">${icon(displayTheme() === 'dark' ? 'sun' : 'moon', 18)} ${displayTheme() === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</button>
      <div class="sdl-r5f23c-nav-divider"></div>
      <button type="button" class="sdl-r5f23c-nav-logout" data-act="logout">${icon('lock', 18)} Keluar Akun</button>
    </nav>
  </aside>`
}

function pageContent() {
  switch (state.screen.view) {
    case 'portal': return portalView()
    case 'executive': return executiveView()
    case 'arahan': return directivesView()
    case 'users': return isSuperadmin() ? userManagement() : denied('Hanya Superadmin yang berwenang mengelola akun.')
    case 'roles': return isSuperadmin() ? roleManagement() : denied('Hanya Superadmin yang berwenang mengelola role.')
    case 'profile': return profileView()
    case 'roadmap': return roadmapView()
    case 'security': return securityView()
    default: return portalView()
  }
}
const denied = (why) => `<div class="page-heading"><h1>Akses ditolak</h1><p>${esc(why)}</p></div>`

/* =========================================================
   7. Portal informasi
   ========================================================= */
const KIND_LABELS = { berita: 'Berita', pengumuman: 'Pengumuman', sop: 'SOP', peraturan: 'Peraturan', agenda: 'Agenda' }
ACTIONS.portalview = (a) => { state.portal.view = a[0]; state.portal.query = ''; render(); window.scrollTo({ top: 0 }) }
ACTIONS.post = (a) => { state.portal.detail = [...POSTS, ...PORTAL_AGENDA].find((p) => p.id === a[0]); render() }
ACTIONS.calmove = (a) => {
  const p = state.portal, step = Number(a[0])
  p.calCursor = p.calMode === 'week'
    ? new Date(p.calCursor.getFullYear(), p.calCursor.getMonth(), p.calCursor.getDate() + step * 7)
    : new Date(p.calCursor.getFullYear(), p.calCursor.getMonth() + step, 1)
  render()
}
ACTIONS.caltoday = () => { state.portal.calCursor = midnight(); render() }
ACTIONS.calmode = (a) => { state.portal.calMode = a[0]; render() }

function portalView() {
  const p = state.portal
  const sa = isSuperadmin()
  const news = POSTS.filter((x) => x.kind === 'berita')
  const announce = POSTS.filter((x) => x.kind === 'pengumuman')
  const docs = POSTS.filter((x) => x.kind === 'sop' || x.kind === 'peraturan')
  const todayKey = localKey(midnight())
  const upcoming = PORTAL_AGENDA.filter((a) => a.startsAt.slice(0, 10) >= todayKey).sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const launch = [
    { key: 'urmin', label: 'URMIN', desc: 'Persuratan', ic: 'file' },
    { key: 'ren', label: 'SUBBAGREN', desc: 'Program & anggaran', ic: 'chart' },
    { key: 'sumda', label: 'SUBBAGSUMDA', desc: 'Sumber daya', ic: 'users' },
    { key: 'binfung', label: 'SUBBAGBINFUNG', desc: 'Pembinaan fungsi', ic: 'folder' }
  ]
  const head = (eyebrow, title, action) => `<div class="sdlv3__sectionhead"><div><small>${eyebrow}</small><h2>${title}</h2></div>${action || ''}</div>`
  const photo = (feature) => `<div class="sdlv3__photo ${feature ? 'sdlv3__photo--large' : ''}">${icon('news', feature ? 40 : 28)}</div>`
  const row = (x) => `<button type="button" class="sdlv3__newsrow" data-act="post:${x.id}">${photo(false)}<span><small>${KIND_LABELS[x.kind]} · ${idDate(x.updatedAt)}</small><strong>${esc(x.title)}</strong><em>${esc(x.summary)}</em></span>${icon('arrow', 15)}</button>`
  const agendaRow = (x) => `<button type="button" class="sdlv3__agendarow" data-act="post:${x.id}"><span class="sdlv3__date"><strong>${idDate(x.startsAt, { day: '2-digit' })}</strong><small>${idDate(x.startsAt, { month: 'short' })}</small></span><span><strong>${esc(x.title)}</strong><small>${esc(x.ownerUnit.toUpperCase())} · ${x.startsAt.slice(11, 16)} WIB</small></span>${icon('arrow', 14)}</button>`

  let body = ''
  if (p.view === 'home') {
    body = `
    <section class="sdlv3__section">${head('AKSES RUANG KERJA', 'Unit &amp; Layanan')}
      <div class="sdlv3__launch">
        ${launch.map((x, i) => `<button ${sa ? 'disabled title="Superadmin tidak memiliki akses operasional"' : ''} data-act="nav:workspace:${x.key}"><span class="sdlv3__launchicon tone-${i}">${icon(x.ic, 27)}</span><strong>${x.label}</strong><small>${x.desc}</small></button>`).join('')}
        <button ${sa ? 'disabled' : ''} data-act="soon:${encodeURIComponent('Integrasi SPIP lintas unit sedang disiapkan.')}"><span class="sdlv3__launchicon tone-4">${icon('shield', 27)}</span><strong>SPIP</strong><small>Data dukung</small></button>
        <button data-act="portalview:agenda"><span class="sdlv3__launchicon tone-5">${icon('calendar', 27)}</span><strong>KALENDER</strong><small>Agenda bersama</small></button>
      </div></section>
    <section class="sdlv3__section">${head('TERBARU DARI BAGRENMIN', 'Informasi &amp; Berita', '<button class="sdlv3__link" data-act="portalview:news">Lihat Semua →</button>')}
      <div class="sdlv3__newsgrid">
        <div><button class="sdlv3__featured" data-act="post:${news[0].id}">${photo(true)}<span><small>BERITA</small><strong>${esc(news[0].title)}</strong><em>${esc(news[0].summary)}</em><small>${idDate(news[0].updatedAt)}</small></span></button></div>
        <div class="sdlv3__newslist">${news.slice(1, 4).map(row).join('')}<button class="sdlv3__more" data-act="portalview:news">Telusuri seluruh informasi →</button></div>
      </div></section>
    <section class="sdlv3__announcements"><strong>${icon('bell', 16)} PENGUMUMAN</strong>${announce.slice(0, 2).map((x) => `<button data-act="post:${x.id}">${esc(x.title)} ›</button>`).join('')}</section>
    <div class="sdlv3__bottom">
      <section>${head('AGENDA BERSAMA', 'Kalender BagRenmin', '<button class="sdlv3__link" data-act="portalview:agenda">Lihat Kalender →</button>')}
        <p>Agenda yang telah dipublikasikan untuk BagRenmin.</p>
        <div class="sdlv3__months"><span>${monthName(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1))}</span><b>${monthName(new Date())}</b><span>${monthName(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1))}</span></div>
        ${upcoming.slice(0, 4).map(agendaRow).join('')}
      </section>
      <section>${head('PUSTAKA DOKUMEN', 'SOP &amp; Peraturan', '<button class="sdlv3__link" data-act="portalview:docs">Lihat Semua →</button>')}
        <p>Pedoman yang telah dipublikasikan.</p>
        ${docs.slice(0, 4).map((x) => `<button class="sdlv3__docrow" data-act="post:${x.id}">${icon('book', 21)}<span><small>${KIND_LABELS[x.kind]} · ${esc(x.referenceNo || 'Nomor belum tersedia')}</small><strong>${esc(x.title)}</strong></span><span>›</span></button>`).join('')}
      </section>
    </div>`
  } else if (p.view === 'news') {
    const q = p.query.toLowerCase()
    const list = POSTS.filter((x) => (x.kind === 'berita' || x.kind === 'pengumuman') && (p.filter === 'all' || x.kind === p.filter) && `${x.title} ${x.summary}`.toLowerCase().includes(q))
    body = `<section class="sdlv3__section">${head('INFORMASI BAGRENMIN', 'Berita &amp; Pengumuman')}
      <div class="sdlv3__filters">
        <label>${icon('search', 17)}<input data-k="pq" placeholder="Cari berita dan pengumuman…" value="${esc(p.query)}" data-model="portal.query"></label>
        <select data-model="portal.filter"><option value="all"${p.filter === 'all' ? ' selected' : ''}>Semua</option><option value="berita"${p.filter === 'berita' ? ' selected' : ''}>Berita</option><option value="pengumuman"${p.filter === 'pengumuman' ? ' selected' : ''}>Pengumuman</option></select>
      </div>
      <div class="sdlv3__newsarchive">${list.length ? list.map(row).join('') : '<div class="sdlv3__empty">Tidak ada publikasi yang cocok.</div>'}</div></section>`
  } else if (p.view === 'agenda') {
    body = `<section class="sdlv3__section">${head('AGENDA LINTAS UNIT', 'Kalender BagRenmin')}
      <p class="sdlv3__desc">Menampilkan agenda yang sudah dinyatakan layak dipublikasikan, bukan data privat masing-masing unit.</p>
      ${portalCalendar()}</section>`
  } else {
    body = `<section class="sdlv3__section">${head('PUSTAKA BAGRENMIN', 'SOP &amp; Peraturan')}
      <div class="sdlv3__newsarchive">${docs.map((x) => `<button class="sdlv3__docrow" data-act="post:${x.id}">${icon('book', 21)}<span><small>${KIND_LABELS[x.kind]} · ${esc(x.referenceNo || '—')}</small><strong>${esc(x.title)}</strong><small>${esc(x.ownerUnit.toUpperCase())}</small></span><span>›</span></button>`).join('')}</div></section>`
  }

  return `<div class="sdlv3">
    <section class="sdlv3__hero"><div><small>PORTAL INFORMASI BAGRENMIN</small><h1>Informasi terhubung.<br><em>Kegiatan lebih terarah.</em></h1><p>BagRenmin Densus 88 AT Polri</p></div><div class="sdlv3__logo"><strong>SDL</strong></div></section>
    <nav class="sdlv3__nav" aria-label="Navigasi Portal BagRenmin">
      <button class="${p.view === 'home' ? 'active' : ''}" data-act="portalview:home">Beranda</button>
      <button class="${p.view === 'news' ? 'active' : ''}" data-act="portalview:news">Berita &amp; Pengumuman</button>
      <button class="${p.view === 'agenda' ? 'active' : ''}" data-act="portalview:agenda">Kalender</button>
      <button class="${p.view === 'docs' ? 'active' : ''}" data-act="portalview:docs">SOP &amp; Peraturan</button>
    </nav>
    ${sa ? '<div class="sdlv3__message" role="status">Akun Superadmin hanya mengelola identitas. Kartu unit sengaja dinonaktifkan.</div>' : ''}
    ${body}
    ${p.detail ? postDialog(p.detail) : ''}
  </div>`
}
function portalCalendar() {
  const p = state.portal
  const cursor = p.calCursor
  const todayKey = localKey(midnight())
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const offset = (start.getDay() + 6) % 7
  let begin = new Date(start.getFullYear(), start.getMonth(), 1 - offset)
  if (p.calMode === 'week') {
    const wd = (cursor.getDay() + 6) % 7
    begin = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - wd)
  }
  const days = p.calMode === 'month' ? 42 : 7
  const cells = Array.from({ length: days }, (_, i) => {
    const day = new Date(begin); day.setDate(begin.getDate() + i)
    const key = localKey(day)
    const ev = PORTAL_AGENDA.filter((x) => x.startsAt.slice(0, 10) === key)
    return `<div class="sdlv3__calday ${day.getMonth() !== cursor.getMonth() ? 'outside' : ''} ${key === todayKey ? 'today' : ''}"><span>${day.getDate()}</span>${ev.slice(0, 2).map((x) => `<button title="${esc(x.title)}" data-act="post:${x.id}">${esc(x.title)}</button>`).join('')}${ev.length > 2 ? `<small>+${ev.length - 2} agenda</small>` : ''}</div>`
  }).join('')
  return `<div class="sdlv3__calendar">
    <div class="sdlv3__caltools"><button data-act="caltoday">Hari ini</button><button aria-label="Periode sebelumnya" data-act="calmove:-1">‹</button><button aria-label="Periode berikutnya" data-act="calmove:1">›</button><strong>${monthName(cursor)}</strong>
      <span class="sdlv3__calview"><button class="${p.calMode === 'month' ? 'on' : ''}" data-act="calmode:month">Bulan</button><button class="${p.calMode === 'week' ? 'on' : ''}" data-act="calmode:week">Minggu</button></span></div>
    <div class="sdlv3__calgrid">${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((x) => `<div class="sdlv3__weekday">${x}</div>`).join('')}${cells}</div></div>`
}
function postDialog(d) {
  return `<div class="sdlv3__overlay" data-act="closebg"><article class="sdlv3__dialog" role="dialog" aria-modal="true">
    <header><div><small>${KIND_LABELS[d.kind]} · ${idDate(d.updatedAt)}</small><h2>${esc(d.title)}</h2></div><button data-act="close" aria-label="Tutup">${icon('x')}</button></header>
    <p>${esc(d.summary)}</p>
    <div class="sdlv3__body">${esc(d.body).replace(/\n/g, '<br>')}</div>
    ${d.kind === 'agenda' ? `<p>${icon('clock', 16)} ${idDateTime(d.startsAt)} WIB</p>` : ''}
    ${d.kind === 'sop' || d.kind === 'peraturan' ? '<div class="sdlv3__message">Dokumen resmi harus tersedia dan terverifikasi sebelum dapat diunduh.</div>' : ''}
  </article></div>`
}

/* =========================================================
   8. Ruang kerja — kerangka
   ========================================================= */
function workspaceLayout(unit) {
  const s = state.screen
  const menu = s.menu
  const mod = unit.modules.find((m) => m.id === menu)
  const tabs = unit.id === 'urmin' ? URMIN_TABS[menu] : null
  const activeTab = tabs ? (tabs.some((t) => t.id === s.tab) ? s.tab : DEFAULT_URMIN_TAB[menu]) : null
  const title = workTitle(unit, menu, mod)
  const subtitle = workSubtitle(unit, menu, mod)
  return `<div class="work-layout">
    ${state.mobileMenu ? '<button aria-label="Tutup navigasi" class="nav-overlay" data-act="mobile"></button>' : ''}
    <aside id="sdl-work-sidebar" class="work-sidebar ${state.mobileMenu ? 'open' : ''} ${state.sidebarCollapsed ? 'sdl-sidebar--collapsed' : ''}">
      <button class="sdl-side-toggle" type="button" aria-label="Lipat sidebar" data-act="collapse">${icon('chevron', 17)}</button>
      <div class="sidebar-unit"><span class="pill amber">${icon(unit.icon, 14)} ${unit.title}</span><strong>${unit.name}</strong><p>${unit.subtitle}</p></div>
      <nav class="sidebar-scroll" aria-label="Menu ${unit.title}">${sidebarLinks(unit, menu, mod)}</nav>
      <div class="sidebar-footer"><button class="back-to-portal" data-act="nav:portal">${icon('back', 16)} Kembali ke Portal</button></div>
    </aside>
    <main class="work-main"><div class="content-wrap">
      <div class="breadcrumb"><button data-act="nav:portal">Portal</button>${icon('chevron', 13)}<button data-act="nav:workspace:${unit.id}">${unit.title}</button>${menu ? `${icon('chevron', 13)}<strong>${esc(title)}</strong>` : ''}</div>
      <div class="section-heading sdl-consistent-heading"><div><span class="eyebrow">${unit.title}</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div></div>
      ${tabs ? `<nav class="sdl-r5f5-tabs" aria-label="Bagian ${esc(title)}">${tabs.map((t) => `<button type="button" class="sdl-r5f5-tab ${activeTab === t.id ? 'is-active' : ''}" data-act="nav:workspace:${unit.id}:${menu}:${t.id}">${t.label}</button>`).join('')}</nav>` : ''}
      ${workspaceContent(unit, menu, mod, activeTab)}
    </div></main>
  </div>`
}
function workTitle(unit, menu, mod) {
  if (menu === '__unitwork') return unit.id === 'urmin' ? 'Berkas Kerja' : 'Berkas, Foto & Disposisi'
  if (menu === '__distribution-inbox') return 'Inbox Distribusi'
  if (menu === '__tasks') return 'Tugas Disposisi'
  if (menu === '__admin') return 'Pengguna & Hak Akses'
  if (unit.id === 'urmin' && menu === 'disposisi') return 'Disposisi'
  return mod ? mod.title : unit.name
}
function workSubtitle(unit, menu, mod) {
  if (menu === '__unitwork') return 'Kelola berkas, lampiran, dan tugas internal.'
  if (menu === '__admin') return 'Kelola akun dan kewenangan sesuai hak akses.'
  if (menu === '__distribution-inbox') return 'Surat yang diteruskan kepada Anda.'
  if (menu === '__tasks') return 'Pantau tugas dan tindak lanjut.'
  if (unit.id === 'urmin' && menu === 'disposisi') return 'Tugas, tindak lanjut, dan review disposisi.'
  return mod ? mod.description : unit.subtitle
}
function sidebarLinks(unit, menu, mod) {
  const pending = INBOX.filter((i) => i.status === 'sent').length
  if (unit.id === 'urmin') {
    return `<div class="sidebar-group">MENU UTAMA</div>
    ${URMIN_NAV.map((item) => `<button type="button" title="${item.label}" class="side-link ${(menu === item.id || (!menu && !item.id)) ? 'selected' : ''}" data-act="nav:workspace:urmin:${item.id}">${icon(item.icon, 18)}<span>${item.label}</span>${item.id === 'surat-masuk' && pending ? `<span class="sdl-r5f5-badge">${pending}</span>` : ''}</button>`).join('')}
    ${isSuperadmin() ? `<div class="sidebar-group">ADMINISTRASI</div><button type="button" class="side-link ${menu === '__admin' ? 'selected' : ''}" data-act="nav:workspace:urmin:__admin:users">${icon('users', 18)}<span>Pengguna &amp; Hak Akses</span></button>` : ''}`
  }
  return `<div class="sidebar-group">RINGKASAN</div>
    <button class="side-link ${!menu ? 'selected' : ''}" data-act="nav:workspace:${unit.id}">${icon('grid', 18)} Dashboard Unit</button>
    <div class="sidebar-group">DISTRIBUSI</div>
    <button class="side-link ${menu === '__distribution-inbox' ? 'selected' : ''}" data-act="nav:workspace:${unit.id}:__distribution-inbox">${icon('inbox', 18)} Inbox Distribusi</button>
    <button class="side-link ${menu === '__tasks' ? 'selected' : ''}" data-act="nav:workspace:${unit.id}:__tasks">${icon('clipboard', 18)}<span>Tugas Disposisi</span></button>
    <div class="sidebar-group">BERKAS &amp; TUGAS AKTIF</div>
    <button class="side-link ${menu === '__unitwork' ? 'selected' : ''}" data-act="nav:workspace:${unit.id}:__unitwork">${icon('folder', 18)} Berkas, Foto &amp; Disposisi</button>
    <div class="sidebar-group">LAYANAN OPERASIONAL</div>
    ${unit.modules.map((m) => `<button class="side-link ${mod && mod.id === m.id ? 'selected' : ''}" data-act="nav:workspace:${unit.id}:${m.id}">${icon(m.icon, 18)}<span>${m.title}</span></button>`).join('')}
    <div class="sidebar-group">MANAJEMEN</div>
    <button class="side-link restricted-menu" disabled>${icon('clock', 18)} Delegasi Kewenangan</button>
    <button class="side-link" data-act="nav:security">${icon('shield', 18)} Akses &amp; Kewenangan</button>
    <button class="side-link" data-act="nav:roadmap">${icon('list', 18)} Roadmap Pengembangan</button>`
}
function workspaceContent(unit, menu, mod, tab) {
  if (unit.id === 'urmin') {
    if (menu === '__admin') return tab === 'roles' ? roleManagement() : tab === 'security' ? adminSecurityPanel() : userManagement()
    if (menu === 'surat-masuk') return tab === 'inbox' ? inboxView('inbox') : tab === 'riwayat' ? inboxView('history') : suratMasukView()
    if (menu === 'disposisi') return tasksView(tab)
    if (menu === 'agenda') return agendaView()
    if (menu === '__unitwork') return berkasView('urmin')
    if (menu) return registryView(`urmin:${menu}`, mod)
    return urminDashboard()
  }
  if (menu === '__unitwork') return berkasView(unit.id)
  if (menu === '__distribution-inbox') return inboxView('inbox')
  if (menu === '__tasks') return tasksView(null)
  if (menu) {
    const key = `${unit.id}:${menu}`
    return REGISTRY[key] ? registryView(key, mod) : emptyModule(mod)
  }
  return smartDashboard(unit)
}
const adminSecurityPanel = () => `<section class="panel sdl-r5f5-admin-note" style="padding:21px"><h2>Kewenangan</h2><p>Hak akses ditentukan oleh role dan izin yang diberikan. Pengelolaan akun tidak otomatis membuka seluruh data unit.</p><button type="button" class="btn" data-act="nav:workspace:urmin:__admin:roles">${icon('key', 16)} Lihat Role &amp; Akses</button></section>`
const emptyModule = (mod) => `<div class="panel table-panel">
  <div class="table-toolbar"><label class="search-box">${icon('search', 17)}<input disabled placeholder="Cari data (tersedia setelah API aktif)"></label><span class="pill neutral">0 data tersambung</span><button class="btn primary" disabled>${icon('plus', 15)} Tambah Data</button></div>
  <div class="table-scroll"><table class="data-table"><thead><tr>${mod.columns.map((c) => `<th>${c}</th>`).join('')}</tr></thead></table></div>
  <div class="empty-state"><span class="empty-icon">${icon(mod.icon, 24)}</span><h3>Belum ada data operasional</h3><p>${esc(mod.title)} sedang dipersiapkan. Pencarian, tambah/edit dan ekspor baru akan aktif setelah API, permission, dan modul ini selesai.</p><span class="pill neutral">${icon('lock', 12)} Dalam persiapan</span></div>
</div>`

/* =========================================================
   9. Dashboard URMIN
   ========================================================= */
const NUMERIC_UI = ['dashPeriod', 'smartPeriod', 'userPage']
ACTIONS.dash = (a) => {
  const key = a[0]
  const raw = decodeURIComponent(a.slice(1).join(':'))
  state.ui[key] = raw === 'true' ? true : raw === 'false' ? false : NUMERIC_UI.includes(key) ? Number(raw) : raw
  render()
}
function urminDashboard() {
  const u = state.ui
  const period = Number(u.dashPeriod)
  const inRange = (iso) => period === 0 || ms(iso) >= Date.now() - period * 86400000
  const incoming = SURAT_MASUK.filter((x) => inRange(x.createdAt))
  const outgoing = REGISTRY['urmin:surat-keluar'].items.filter((x) => inRange(x.createdAt))
  const me = state.account.id
  const mine = TASKS.filter((t) => t.assigneeId === me)
  const overdue = mine.filter((t) => t.status !== 'completed' && t.slaStatus === 'overdue')
  const pendingT = mine.filter((t) => t.status === 'pending')
  const progress = mine.filter((t) => t.status === 'in_progress')
  const review = TASKS.filter((t) => t.issuerId === me && t.status === 'completed' && t.reviewStatus === 'awaiting_review')
  const pendingInbox = INBOX.filter((i) => i.status === 'sent')
  const actionCount = overdue.length + pendingT.length + progress.filter((t) => t.slaStatus !== 'overdue').length + review.length + pendingInbox.length

  const span = (period || 365) * 86400000
  const start = Date.now() - span
  const trend = Array.from({ length: 6 }, (_, i) => {
    const lo = start + (span / 6) * i, hi = start + (span / 6) * (i + 1)
    const count = (rows) => rows.filter((x) => ms(x.createdAt) >= lo && ms(x.createdAt) <= hi).length
    return { i, incoming: count(incoming), outgoing: count(outgoing), label: new Date(lo).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) }
  })
  const trendMax = Math.max(1, ...trend.map((x) => Math.max(x.incoming, x.outgoing)))

  const jobs = []
  overdue.forEach((t) => jobs.push({ id: t.id, kind: 'task', title: t.subject, subtitle: `Disposisi lewat tenggat · ${t.dueDate}`, urgency: 0, action: 'Tindak lanjut', status: 'overdue' }))
  pendingInbox.forEach((d) => jobs.push({ id: d.id, kind: 'inbox', title: d.subject, subtitle: `Surat ${d.letterNumber} menunggu penerimaan`, urgency: 1, action: 'Terima surat', status: 'pending' }))
  pendingT.forEach((t) => jobs.push({ id: t.id, kind: 'task', title: t.subject, subtitle: `Menunggu diterima · tenggat ${t.dueDate}`, urgency: 2, action: 'Terima tugas', status: 'pending' }))
  review.forEach((t) => jobs.push({ id: t.id, kind: 'task', title: t.subject, subtitle: 'Pekerjaan selesai, menunggu review Anda', urgency: 3, action: 'Review', status: 'review' }))
  progress.filter((t) => t.slaStatus !== 'overdue').forEach((t) => jobs.push({ id: t.id, kind: 'task', title: t.subject, subtitle: `Dalam proses · tenggat ${t.dueDate}`, urgency: 4, action: 'Lanjutkan', status: 'progress' }))
  const shownJobs = jobs.filter((j) => u.dashTaskFilter === 'all' || j.status === u.dashTaskFilter)

  const recent = [
    ...incoming.map((x) => ({ id: x.id, title: x.subject, when: x.createdAt, type: 'Surat Masuk', route: 'surat-masuk' })),
    ...outgoing.map((x) => ({ id: x.id, title: x.title, when: x.createdAt, type: 'Surat Keluar', route: 'surat-keluar' }))
  ].filter((x) => u.dashFilter === 'all' || (u.dashFilter === 'incoming' ? x.type === 'Surat Masuk' : x.type === 'Surat Keluar'))
    .sort((a, b) => ms(b.when) - ms(a.when))

  const statuses = [
    { k: 'pending', l: 'Menunggu diterima', v: pendingT.length, c: '#D6A258' },
    { k: 'progress', l: 'Dalam proses', v: progress.length, c: '#5988C6' },
    { k: 'overdue', l: 'Terlambat', v: overdue.length, c: '#CD7067' },
    { k: 'review', l: 'Menunggu review saya', v: review.length, c: '#8E76C0' }
  ]

  return `<section class="urmin-command" aria-label="Dashboard Urmin">
    <div class="urmin-command__toolbar"><div class="urmin-command__eyebrow">URMIN · RINGKASAN OPERASIONAL</div>
      <div class="urmin-command__tools"><label for="urmin-period">Periode</label>
        <select id="urmin-period" data-model="ui.dashPeriod">${[[30, '30 hari'], [90, '90 hari'], [365, '12 bulan'], [0, 'Semua waktu']].map(([v, l]) => `<option value="${v}"${period === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <button type="button" data-act="soon:${encodeURIComponent('Data peraga dimuat ulang.')}">↻ Refresh</button></div></div>
    <div class="urmin-command__metrics">
      <button type="button" class="urmin-command__metric" data-act="nav:workspace:urmin:surat-masuk:daftar"><span>Surat Masuk</span><strong>${incoming.length}</strong><small>Surat yang dapat Anda akses ↗</small></button>
      <button type="button" class="urmin-command__metric" data-act="nav:workspace:urmin:surat-keluar"><span>Surat Keluar</span><strong>${outgoing.length}</strong><small>Register pada periode terpilih ↗</small></button>
      <button type="button" class="urmin-command__metric urmin-command__metric--warm" data-act="nav:workspace:urmin:disposisi:mine"><span>Perlu Tindakan</span><strong>${actionCount}</strong><small>Inbox, disposisi dan review ↗</small></button>
      <button type="button" class="urmin-command__metric urmin-command__metric--red" data-act="dash:dashTaskFilter:overdue"><span>Disposisi Terlambat</span><strong>${overdue.length}</strong><small>Tenggat yang telah terlewati ↗</small></button>
    </div>
    <div class="urmin-command__actions">
      <button data-act="nav:workspace:urmin:surat-masuk:daftar">+ Surat Masuk</button>
      <button data-act="nav:workspace:urmin:surat-keluar">+ Surat Keluar</button>
      <button data-act="nav:workspace:urmin:surat-masuk:inbox">Inbox Distribusi</button>
      <button data-act="nav:workspace:urmin:disposisi:mine">Tugas Disposisi</button>
      <button data-act="nav:workspace:urmin:agenda">Agenda</button>
    </div>
    <div class="urmin-command__columns">
      <section class="urmin-command__panel urmin-command__panel--trend">
        <div class="urmin-command__panelhead"><div><h2>Tren Persuratan</h2><p>Surat masuk vs surat keluar</p></div><div class="urmin-command__legend"><span><i></i> Masuk</span><span><i></i> Keluar</span></div></div>
        <div class="urmin-command__trend" role="group">${trend.map((b) => `<button type="button" title="${b.incoming} surat masuk, ${b.outgoing} surat keluar"><span class="urmin-command__bars"><i style="height:${Math.max(b.incoming ? 7 : 0, b.incoming / trendMax * 100)}%"></i><i style="height:${Math.max(b.outgoing ? 7 : 0, b.outgoing / trendMax * 100)}%"></i></span><span>${b.label}</span><strong>${b.incoming + b.outgoing}</strong></button>`).join('')}</div>
        <div class="urmin-command__chartfoot">${[['all', 'Semua surat'], ['incoming', 'Surat Masuk'], ['outgoing', 'Surat Keluar']].map(([k, l]) => `<button type="button" class="${u.dashFilter === k ? 'active' : ''}" data-act="dash:dashFilter:${k}">${l}</button>`).join('')}</div>
      </section>
      <section class="urmin-command__panel">
        <div class="urmin-command__panelhead"><div><h2>Status Disposisi Saya</h2><p>Penugasan yang ditujukan kepada akun ini</p></div></div>
        <div class="urmin-command__statuses">${statuses.map((st) => `<button type="button" class="${u.dashTaskFilter === st.k ? 'selected' : ''}" data-act="dash:dashTaskFilter:${st.k}"><i style="background:${st.c}"></i><span>${st.l}</span><strong>${st.v}</strong></button>`).join('')}</div>
        <button type="button" class="urmin-command__textlink" data-act="nav:workspace:urmin:disposisi:mine">Buka tugas disposisi →</button>
      </section>
      <section class="urmin-command__panel urmin-command__panel--wide" id="urmin-action-center">
        <div class="urmin-command__panelhead"><div><h2>Perlu Ditindaklanjuti</h2><p>Prioritas tindakan untuk akun Anda</p></div>
          <div class="urmin-command__switch"><button type="button" class="${u.dashTaskFilter === 'all' ? 'active' : ''}" data-act="dash:dashTaskFilter:all">Semua</button><button type="button" class="${u.dashTaskFilter === 'overdue' ? 'active' : ''}" data-act="dash:dashTaskFilter:overdue">Terlambat</button></div></div>
        ${shownJobs.length === 0 ? '<div class="urmin-command__empty">Tidak ada pekerjaan yang sesuai filter.</div>' : `<div class="urmin-command__jobs">${shownJobs.slice(0, u.dashDetails ? 20 : 6).map((j) => `<button type="button" data-act="${j.kind === 'inbox' ? 'nav:workspace:urmin:surat-masuk:inbox' : 'opentask:' + j.id}"><span class="urmin-command__priority pr-${j.urgency}" aria-hidden="true"></span><span class="urmin-command__jobtext"><strong>${esc(j.title)}</strong><small>${esc(j.subtitle)}</small></span><span class="urmin-command__jobaction">${j.action} ↗</span></button>`).join('')}</div>`}
        <div class="urmin-command__panelbottom"><button type="button" data-act="dash:dashDetails:${!u.dashDetails}">${u.dashDetails ? 'Lebih ringkas' : 'Lihat lebih banyak'}</button><button type="button" data-act="nav:workspace:urmin:surat-masuk:inbox">Buka Inbox ↗</button></div>
      </section>
      <section class="urmin-command__panel urmin-command__panel--wide">${agendaCalendar(true)}</section>
      <section class="urmin-command__panel">
        <div class="urmin-command__panelhead"><div><h2>Aktivitas Terbaru</h2><p>${u.dashFilter === 'incoming' ? 'Surat masuk' : u.dashFilter === 'outgoing' ? 'Surat keluar' : 'Persuratan dan agenda'}</p></div>${u.dashFilter !== 'all' ? '<button type="button" class="urmin-command__textlink" data-act="dash:dashFilter:all">Reset filter</button>' : ''}</div>
        ${recent.length === 0 ? '<div class="urmin-command__empty">Belum ada aktivitas pada periode ini.</div>' : `<div class="urmin-command__recent">${recent.slice(0, u.dashDetails ? 15 : 5).map((r) => `<button type="button" data-act="nav:workspace:urmin:${r.route}"><span><strong>${esc(r.title)}</strong><small>${r.type} · ${idDate(r.when)}</small></span><b>↗</b></button>`).join('')}</div>`}
      </section>
    </div>
  </section>`
}
ACTIONS.opentask = (a) => { state.screen = { view: 'workspace', unit: 'urmin', menu: 'disposisi', tab: 'mine' }; state.ui.taskSelected = a[0]; render() }

/* =========================================================
   10. Dashboard unit lain (SmartUnitDashboard)
   ========================================================= */
const DASH_COLORS = ['#3b88a3', '#d7a95f', '#8772c6', '#39a98c', '#748fb8', '#cd8b75', '#5b78bd']
function smartDashboard(unit) {
  const u = state.ui
  const period = Number(u.smartPeriod)
  const sources = unit.modules.filter((m) => REGISTRY[`${unit.id}:${m.id}`]).map((m) => ({ id: m.id, title: m.title }))
  sources.push({ id: '__berkas', title: 'Berkas & Tugas' })
  const rows = []
  sources.forEach((s) => {
    if (s.id === '__berkas') {
      (BERKAS[unit.id] || []).forEach((b) => rows.push({ id: b.id, source: s.id, label: s.title, title: b.title, status: b.classification === 'penting' ? 'Penting' : 'Biasa', date: b.createdAt }))
    } else {
      const def = REGISTRY[`${unit.id}:${s.id}`]
      // Sebagian register punya label status sendiri; sisanya memakai
      // potongan terakhir kolom informasi (mis. "Tahun 2027 · Penyusunan").
      def.items.forEach((r) => rows.push({ id: r.id, source: s.id, label: s.title, title: r.title, status: r.status || def.status || (r.info.split('·').pop() || '').trim() || 'Tercatat', date: r.createdAt }))
    }
  })
  const within = rows.filter((r) => period === 0 || ms(r.date) >= Date.now() - period * 86400000)
  const counted = within.length
  const groups = sources.map((s, i) => ({ source: s.id, label: s.title, count: within.filter((r) => r.source === s.id).length, color: DASH_COLORS[i % DASH_COLORS.length] }))
  const maxGroup = Math.max(1, ...groups.map((g) => g.count))
  const statusMap = new Map()
  within.forEach((r) => statusMap.set(r.status, (statusMap.get(r.status) || 0) + 1))
  const statuses = [...statusMap].map(([label, count], i) => ({ label, count, color: DASH_COLORS[i % DASH_COLORS.length] })).sort((a, b) => b.count - a.count).slice(0, 7)

  const span = (period || 365) * 86400000
  const start = Date.now() - span
  const buckets = Array.from({ length: 6 }, (_, i) => {
    const left = start + span * i / 6, right = start + span * (i + 1) / 6
    return { i, count: within.filter((r) => ms(r.date) >= left && ms(r.date) < right + 1000).length, label: new Date(left).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) }
  })
  const maximum = Math.max(1, ...buckets.map((b) => b.count))
  const points = buckets.map((b, i) => `${24 + (i * 524) / 5},${136 - (b.count / maximum) * 105}`).join(' ')
  const filtered = within.filter((r) => (u.smartSource === 'all' || u.smartSource === r.source) && (u.smartStatus === 'all' || u.smartStatus === r.status)).sort((a, b) => ms(b.date) - ms(a.date))
  const selectedLabel = (groups.find((g) => g.source === u.smartSource) || {}).label || 'Seluruh kategori'
  let acc = 0
  const conic = statuses.length ? statuses.map((s) => { const from = acc / Math.max(counted, 1) * 100; acc += s.count; return `${s.color} ${from}% ${acc / Math.max(counted, 1) * 100}%` }).join(',') : ''

  return `<section class="sdl-smart-dashboard" style="--dash-accent:${unit.accent}" aria-label="Dashboard ${unit.name}">
    <div class="sdl-dash-toolbar"><div class="sdl-dash-title"><span class="sdl-dash-kicker">RINGKASAN DATA</span></div>
      <div class="sdl-dash-controls"><label for="dash-range">Periode</label>
        <select id="dash-range" data-model="ui.smartPeriod">${[[30, '30 hari'], [90, '90 hari'], [365, '12 bulan'], [0, 'Semua waktu']].map(([v, l]) => `<option value="${v}"${period === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <button type="button" data-act="soon:${encodeURIComponent('Data peraga dimuat ulang.')}">⟳ <span>Refresh</span></button></div></div>
    <div class="sdl-dash-kpis">
      <button type="button" class="sdl-dash-kpi" data-act="dash:smartDetails:true"><span>Aktivitas Tercatat</span><strong>${counted}</strong><small>Periode terpilih · lihat data ↗</small></button>
      <button type="button" class="sdl-dash-kpi" data-act="dash:smartDetails:true"><span>Kategori Aktif</span><strong>${groups.filter((g) => g.count > 0).length}</strong><small>Berdasarkan data yang tersedia</small></button>
      <button type="button" class="sdl-dash-kpi" data-act="dash:smartDetails:true"><span>Status Tercatat</span><strong>${statuses.length}</strong><small>Lihat rincian status ↗</small></button>
      <button type="button" class="sdl-dash-kpi sdl-dash-kpi--accent" data-act="nav:workspace:${unit.id}:__unitwork"><span>Berkas &amp; Disposisi</span><strong>↗</strong><small>Buka ruang kerja</small></button>
    </div>
    <div class="sdl-dash-panels">
      <section class="sdl-dash-panel sdl-dash-panel--wide">
        <div class="sdl-dash-panel-head"><div><h3>Activity Trend</h3><p>Catatan terbaru berdasarkan tanggal data</p></div><span class="sdl-dash-period">${period === 0 ? 'All time' : period + ' days'}</span></div>
        <div class="sdl-dash-chart-area">${counted === 0 ? '<div class="sdl-dash-empty">Belum ada aktivitas pada periode ini.</div>' : `<svg viewBox="0 0 575 172" role="img" preserveAspectRatio="none"><line x1="24" y1="136" x2="548" y2="136" stroke="var(--border)" stroke-width="1"/><line x1="24" y1="84" x2="548" y2="84" stroke="var(--border)" stroke-dasharray="4 7"/><line x1="24" y1="31" x2="548" y2="31" stroke="var(--border)" stroke-dasharray="4 7"/><polyline fill="none" stroke="var(--dash-accent)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${points}"/>${buckets.map((b, i) => `<circle cx="${24 + i * 524 / 5}" cy="${136 - (b.count / maximum) * 105}" r="4.8" fill="var(--dash-accent)" stroke="var(--card)" stroke-width="2"/>`).join('')}</svg>`}</div>
        <div class="sdl-dash-ticks">${buckets.map((b) => `<button type="button" title="${b.count} aktivitas"><strong>${b.label}</strong><span>${b.count}</span></button>`).join('')}</div>
      </section>
      <section class="sdl-dash-panel"><div class="sdl-dash-panel-head"><div><h3>Record Distribution</h3><p>Klik kategori untuk menampilkan datanya</p></div></div>
        <div class="sdl-dash-distribution">${groups.map((g) => `<button type="button" class="${u.smartSource === g.source ? 'selected' : ''}" data-act="dash:smartSource:${u.smartSource === g.source ? 'all' : g.source}"><span class="sdl-dash-bar-label">${esc(g.label)}</span><span class="sdl-dash-bar-track"><span style="width:${(g.count / maxGroup) * 100}%;background:${g.color}"></span></span><strong>${g.count}</strong></button>`).join('')}</div></section>
      <section class="sdl-dash-panel"><div class="sdl-dash-panel-head"><div><h3>Status Overview</h3><p>Pilih status untuk melihat detail</p></div></div>
        <div class="sdl-dash-status-wrap"><div class="sdl-dash-donut" style="background:${conic ? `conic-gradient(${conic})` : 'var(--subtle)'}"><div><strong>${counted}</strong><small>records</small></div></div>
          <div class="sdl-dash-status-list">${statuses.map((s) => `<button type="button" class="${u.smartStatus === s.label ? 'selected' : ''}" data-act="dash:smartStatus:${u.smartStatus === s.label ? 'all' : encodeURIComponent(s.label)}"><i style="background:${s.color}"></i><span>${esc(s.label)}</span><strong>${s.count}</strong></button>`).join('')}</div></div></section>
      <section class="sdl-dash-panel sdl-dash-panel--wide">
        <div class="sdl-dash-panel-head"><div><h3>Recent Activity</h3><p>${esc(selectedLabel)}${u.smartStatus !== 'all' ? ' · ' + esc(u.smartStatus) : ''}</p></div>
          <div class="sdl-dash-inline-actions">${(u.smartSource !== 'all' || u.smartStatus !== 'all') ? '<button type="button" data-act="smartreset">Clear filter</button>' : ''}<button type="button" data-act="dash:smartDetails:${!u.smartDetails}">${u.smartDetails ? 'Lebih ringkas' : 'Lihat semua'} ↗</button></div></div>
        ${filtered.length === 0 ? '<div class="sdl-dash-empty">Tidak ada data yang cocok dengan filter.</div>' : `<div class="sdl-dash-recent">${filtered.slice(0, u.smartDetails ? 50 : 5).map((item) => `<button type="button" data-act="nav:workspace:${unit.id}:${item.source === '__berkas' ? '__unitwork' : item.source}"><span class="sdl-dash-recent-dot" style="background:${(groups.find((g) => g.source === item.source) || {}).color || unit.accent}"></span><span class="sdl-dash-recent-main"><strong>${esc(item.title)}</strong><small>${esc(item.label)} · ${idDate(item.date)}</small></span><span class="sdl-dash-recent-status">${esc(item.status)}</span><span aria-hidden="true">↗</span></button>`).join('')}</div>`}
      </section>
    </div>
    <div class="sdl-dash-shortcuts"><span>Quick access</span>${sources.slice(0, 4).map((s) => `<button type="button" data-act="nav:workspace:${unit.id}:${s.id === '__berkas' ? '__unitwork' : s.id}">${esc(s.title)} <span>↗</span></button>`).join('')}</div>
  </section>`
}
ACTIONS.smartreset = () => { state.ui.smartSource = 'all'; state.ui.smartStatus = 'all'; render() }

/* =========================================================
   11. Surat masuk
   ========================================================= */
ACTIONS.surat = (a) => { state.ui.suratSelected = state.ui.suratSelected === a[0] ? null : a[0]; render() }
function suratMasukView() {
  const u = state.ui
  const q = u.suratSearch.toLowerCase()
  const list = SURAT_MASUK.filter((x) => `${x.letterNumber} ${x.sender} ${x.subject}`.toLowerCase().includes(q))
  const detail = SURAT_MASUK.find((x) => x.id === u.suratSelected)
  return `<div class="sm-root sdl-sm-r5f6">
    <section class="panel sm-panel">
      <div class="sm-toolbar sdl-sm-r5f6__toolbar">
        <form class="sm-search" data-act="soon:${encodeURIComponent('Pencarian pada mockup berlangsung langsung saat mengetik.')}"><input class="rm-input" data-k="smq" aria-label="Cari surat masuk" placeholder="Cari nomor, asal, perihal" value="${esc(u.suratSearch)}" data-model="ui.suratSearch"><button class="btn" type="submit">Cari</button></form>
        <div class="sdl-sm-r5f6__toolbar-actions"><button type="button" class="btn" data-act="soon:${encodeURIComponent('Unggah lampiran hanya tersedia pada aplikasi yang tersambung API.')}">Upload Lampiran</button><button class="btn primary" data-act="soon:${encodeURIComponent('Form tambah surat tidak aktif pada mockup statis.')}">+ Tambah Surat</button></div>
      </div>
      <p class="sm-hint">Mockup menampilkan ${SURAT_MASUK.length} surat karangan. Pada aplikasi asli daftar dibatasi 200 surat terbaru sesuai hak akses akun.</p>
      <div class="table-scroll"><table class="data-table"><thead><tr><th>Agenda</th><th>Nomor Surat</th><th>Asal Surat</th><th>Tanggal Surat</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
        ${list.map((i) => `<tr class="${u.suratSelected === i.id ? 'sm-selected' : ''}"><td>SM-${new Date(i.createdAt).getFullYear()}-${i.agendaNo}</td><td><strong>${esc(i.letterNumber)}</strong></td><td>${esc(i.sender)}</td><td>${i.letterDate}</td><td><span class="sm-state ${i.status}">${esc(WORKFLOW_LABELS[i.workflow])}</span></td><td><div class="sdl-sm-r5f6__row-actions"><button class="btn" type="button" data-act="surat:${i.id}">${u.suratSelected === i.id ? 'Tutup' : 'Detail'}</button>${i.status === 'registered' ? `<button class="btn" type="button" data-act="soon:${encodeURIComponent('Mockup statis: unggah lampiran dinonaktifkan.')}">Upload</button>` : ''}</div></td></tr>`).join('')}
      </tbody></table></div>
      ${list.length === 0 ? '<div class="sm-empty">Tidak ada surat yang cocok dengan pencarian.</div>' : ''}
    </section>
    ${detail ? suratDetail(detail) : ''}
  </div>`
}
function suratDetail(d) {
  const history = SURAT_HISTORY[d.id] || [
    { action: 'created', actor: 'Bayu Kertanegara', at: d.createdAt, version: 1, reason: 'Pencatatan surat masuk dari instansi pengirim.' },
    { action: 'registered', actor: 'Laksmi Prawirahardja', at: d.createdAt, version: d.version, reason: 'Surat diregister dan diteruskan sesuai klasifikasi.' }
  ]
  const label = { created: 'Draft dibuat', edited: 'Draft diperbarui', registered: 'Surat diregister' }
  return `<section class="panel sm-panel">
    <div class="sm-section-title sdl-sm-r5f6__detail-head"><div><span class="eyebrow">DETAIL SURAT MASUK</span><h3>${esc(d.letterNumber)}</h3><p>Agenda SM-${new Date(d.createdAt).getFullYear()}-${d.agendaNo} · Versi ${d.version} · ${esc(WORKFLOW_LABELS[d.workflow])}</p></div>
      <div class="sdl-sm-r5f6__row-actions"><button class="btn" type="button" data-act="soon:${encodeURIComponent('Mockup statis: pengeditan dinonaktifkan.')}">Edit Draft</button><button class="btn primary" type="button" data-act="soon:${encodeURIComponent('Mockup statis: unggah lampiran dinonaktifkan.')}">Upload Lampiran</button></div></div>
    <dl class="sm-details">
      <div><dt>Asal Surat</dt><dd>${esc(d.sender)}</dd></div>
      <div><dt>Tanggal Surat</dt><dd>${d.letterDate}</dd></div>
      <div><dt>Tanggal Diterima</dt><dd>${d.receivedDate}</dd></div>
      <div><dt>Klasifikasi</dt><dd>${d.classification === 'penting' ? 'Penting' : 'Biasa'}</dd></div>
      <div class="sm-span"><dt>Perihal</dt><dd>${esc(d.subject)}</dd></div>
    </dl>
    <div class="sdl-sm-r5f7__summary"><strong>${esc(WORKFLOW_LABELS[d.workflow])}</strong><span>Jenis surat: ${d.letterKind} · ${d.responseDue ? 'Batas respons: ' + d.responseDue : 'Tanpa batas respons'}</span>${d.eventStart ? `<span>Pelaksanaan: ${d.eventStart.replace('T', ' ')} WIB · ${esc(d.eventLocation || 'Lokasi belum dicatat')}</span>` : ''}</div>
    <div class="r3b-wrap"><h4>Lampiran Surat<small>${d.attachments} lampiran tersimpan pada berkas peraga ini.</small></h4>
      <div class="r3b-files">${d.attachments === 0 ? '<p class="r3b-muted">Belum ada lampiran pada surat ini.</p>' : Array.from({ length: d.attachments }, (_, i) => `<div class="r3b-file"><div><strong>lampiran-${i + 1}-${d.id}.pdf</strong><small>${(220 + i * 310)} KB · diunggah ${idDate(d.createdAt)}</small></div><button class="btn" type="button" data-act="soon:${encodeURIComponent('Lampiran peraga tidak dapat diunduh.')}">Unduh</button></div>`).join('')}</div></div>
    <h4 class="sm-history-title">Riwayat Surat</h4>
    <div class="sm-history">${history.map((h) => `<div class="sm-history-row"><span class="sm-history-dot"></span><div><strong>${label[h.action] || 'Pembaruan'}</strong><small>${esc(h.actor)} · ${idDateTime(h.at)} · Versi ${h.version}</small><p>${esc(h.reason)}</p></div></div>`).join('')}</div>
  </section>`
}

/* =========================================================
   12. Inbox distribusi
   ========================================================= */
function inboxView(mode) {
  const list = INBOX.filter((i) => mode === 'inbox' ? i.status === 'sent' : i.status === 'received')
  return `<div class="sm-root">
    ${mode === 'history' ? '<p class="sdl-r5f5-context">Riwayat distribusi yang telah diterima oleh akun Anda. Detail setiap surat menampilkan perjalanan penerimaannya.</p>' : ''}
    <div class="sdl-tasks-r5f11__overview" aria-label="Ringkasan inbox">
      <span><strong>${INBOX.filter((i) => i.status === 'sent').length}</strong> Menunggu diterima</span>
      <span><strong>${INBOX.filter((i) => i.status === 'received').length}</strong> Sudah diterima</span>
      <span><strong>${INBOX.length}</strong> Total distribusi</span>
    </div>
    <section class="panel sm-panel">
      <div class="sm-section-title"><div><span class="eyebrow">${mode === 'inbox' ? 'INBOX DISTRIBUSI' : 'RIWAYAT PENERIMAAN'}</span><h3>${mode === 'inbox' ? 'Surat yang diteruskan kepada Anda' : 'Surat yang sudah Anda terima'}</h3><p>Penerimaan surat dicatat beserta waktu dan pengirim arahannya.</p></div></div>
      ${list.length === 0 ? '<div class="sm-empty">Tidak ada surat pada daftar ini.</div>' : `<div class="table-scroll"><table class="data-table"><thead><tr><th>Nomor Surat</th><th>Perihal</th><th>Dari</th><th>Waktu</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
        ${list.map((i) => `<tr><td><strong>${esc(i.letterNumber)}</strong></td><td>${esc(i.subject)}<small style="display:block;color:var(--muted);margin-top:4px">${esc(i.note)}</small></td><td>${esc(i.from)}</td><td>${idDateTime(i.sentAt)}</td><td><span class="sm-state ${i.status === 'sent' ? 'draft' : 'registered'}">${i.status === 'sent' ? 'Menunggu diterima' : 'Diterima'}</span></td><td><div class="sdl-sm-r5f6__row-actions"><button class="btn" type="button" data-act="opensurat:${i.incomingId}">Buka Surat</button>${i.status === 'sent' ? `<button class="btn primary" type="button" data-act="soon:${encodeURIComponent('Mockup statis: penerimaan surat tidak mengubah data.')}">Terima</button>` : ''}</div></td></tr>`).join('')}
      </tbody></table></div>`}
    </section>
  </div>`
}
ACTIONS.opensurat = (a) => { state.screen = { view: 'workspace', unit: 'urmin', menu: 'surat-masuk', tab: 'daftar' }; state.ui.suratSelected = a[0]; state.ui.suratSearch = ''; render(); window.scrollTo({ top: 0 }) }

/* =========================================================
   13. Disposisi
   ========================================================= */
const STATUS_NAMES = { pending: 'Menunggu Diterima', in_progress: 'Dalam Proses', completed: 'Selesai' }
const REVIEW_NAMES = { not_ready: 'Belum Direview', awaiting_review: 'Menunggu Review', approved: 'Disetujui', revision_requested: 'Perlu Tindak Lanjut' }
const SLA_NAMES = { on_track: 'Dalam Target', overdue: 'Terlambat', completed_on_time: 'Tepat Waktu', completed_late: 'Selesai Terlambat', unknown: '—' }
const UNIT_NAMES = { urmin: 'Urmin', ren: 'Subbagren', sumda: 'Subbagsumda', binfung: 'Subbagbinfung', subbagren: 'Subbagren', subbagsumda: 'Subbagsumda', subbagbinfung: 'Subbagbinfung' }
const EVENT_LABELS = { issued: 'Diterbitkan', accepted: 'Diterima', completed: 'Diselesaikan', approved: 'Hasil Disetujui', revision_requested: 'Perlu Tindak Lanjut', forwarded: 'Diteruskan' }
ACTIONS.task = (a) => { state.ui.taskSelected = a[0]; render() }

function tasksView(tab) {
  const u = state.ui
  const me = state.account.id
  const q = u.taskQuery.trim().toLowerCase()
  let list = TASKS.filter((t) => {
    if (tab === 'mine' && t.assigneeId !== me) return false
    if (tab === 'issued' && t.issuerId !== me) return false
    if (tab === 'review' && (t.issuerId !== me || t.reviewStatus !== 'awaiting_review')) return false
    if (tab === 'history' && (t.status !== 'completed' || t.reviewStatus === 'awaiting_review')) return false
    if (tab !== 'review' && tab !== 'history' && u.taskStatus !== 'all') {
      if (u.taskStatus === 'awaiting_review' ? t.reviewStatus !== 'awaiting_review' : t.status !== u.taskStatus) return false
    }
    if (!q) return true
    return [t.letterNumber, t.subject, t.issuerName, t.assigneeName, t.instruction].some((v) => v.toLowerCase().includes(q))
  })
  list = list.sort((a, b) => u.taskSort === 'due' ? a.dueDate.localeCompare(b.dueDate) : b.createdAt.localeCompare(a.createdAt))
  const pendingCount = TASKS.filter((t) => t.assigneeId === me && t.status !== 'completed').length
  const overdueCount = TASKS.filter((t) => t.assigneeId === me && t.slaStatus === 'overdue' && t.status !== 'completed').length
  const reviewCount = TASKS.filter((t) => t.issuerId === me && t.reviewStatus === 'awaiting_review').length
  const subtitle = tab === 'mine' ? 'Ditugaskan kepada Anda' : tab === 'issued' ? 'Disposisi yang Anda berikan' : tab === 'review' ? 'Hasil yang memerlukan keputusan Anda' : tab === 'history' ? 'Tugas selesai dengan review sudah diproses' : 'Tugas yang dapat Anda akses'

  return `<div class="sdl-tasks-r5f3">
    <div class="sdl-tasks-r5f11__overview" aria-label="Ringkasan disposisi">
      <span><strong>${pendingCount}</strong> Tugas Aktif</span>
      <span class="${overdueCount > 0 ? 'is-warning' : ''}"><strong>${overdueCount}</strong> Terlambat</span>
      <span><strong>${reviewCount}</strong> Perlu Review</span>
    </div>
    <section class="panel sdl-tasks-r5f3__panel" aria-label="Daftar tugas disposisi">
      <div class="sdl-tasks-r5f11__toolbar"><div><strong>${list.length} tugas</strong><span>${subtitle}</span></div><button type="button" class="btn" data-act="soon:${encodeURIComponent('Data peraga dimuat ulang.')}">Perbarui</button></div>
      <div class="sdl-tasks-r5f3__filters">
        <label><span class="sdl-sr-only">Cari tugas</span><input data-k="tq" value="${esc(u.taskQuery)}" placeholder="Cari nomor surat, perihal atau petugas" data-model="ui.taskQuery"></label>
        ${tab !== 'review' && tab !== 'history' ? `<label><span class="sdl-sr-only">Status tugas</span><select data-model="ui.taskStatus">${[['all', 'Semua Status'], ['pending', 'Menunggu Diterima'], ['in_progress', 'Dalam Proses'], ['completed', 'Selesai'], ['awaiting_review', 'Menunggu Review']].map(([v, l]) => `<option value="${v}"${u.taskStatus === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>` : ''}
        <label><span class="sdl-sr-only">Urutkan</span><select data-model="ui.taskSort"><option value="latest"${u.taskSort === 'latest' ? ' selected' : ''}>Terbaru</option><option value="due"${u.taskSort === 'due' ? ' selected' : ''}>Tenggat terdekat</option></select></label>
      </div>
      ${list.length === 0 ? '<div class="sdl-tasks-r5f3__empty"><strong>Tidak ada tugas sesuai filter</strong><p>Coba ubah pencarian atau filter.</p></div>'
      : `<div class="table-scroll"><table class="data-table sdl-tasks-r5f3__table"><thead><tr><th>Surat / Perihal</th><th>Penugasan</th><th>Tenggat</th><th>Status</th><th>Review / Target</th><th>Aksi</th></tr></thead><tbody>
        ${list.map((t) => `<tr class="${u.taskSelected === t.id ? 'sdl-tasks-r5f3__active' : ''}">
          <td><strong>${t.depth > 0 ? `↳ L${t.depth} · ` : ''}${esc(t.letterNumber)}</strong><small>${esc(t.subject)}</small></td>
          <td><strong>${esc(t.assigneeName)}</strong><small>Dari ${esc(t.issuerName)}</small></td>
          <td>${idLong(t.dueDate)}</td>
          <td><span class="r3c-status ${t.status}">${STATUS_NAMES[t.status]}</span></td>
          <td><span class="r3d-sla ${t.slaStatus}">${SLA_NAMES[t.slaStatus]}</span><small>${REVIEW_NAMES[t.reviewStatus]}</small></td>
          <td><button type="button" class="btn" data-act="task:${t.id}">Detail</button></td></tr>`).join('')}
      </tbody></table></div>`}
    </section>
    ${u.taskSelected ? taskDialog(TASKS.find((t) => t.id === u.taskSelected)) : ''}
  </div>`
}
function taskDialog(t) {
  if (!t) return ''
  const events = TASK_EVENTS[t.id] || [{ action: 'issued', actor: t.issuerName, at: t.createdAt, reason: t.instruction }]
  const me = state.account.id
  const canAct = t.assigneeId === me && t.status !== 'completed'
  const canReview = t.issuerId === me && t.status === 'completed' && t.reviewStatus === 'awaiting_review'
  const fact = (k, v) => `<div><span>${k}</span><strong>${esc(v)}</strong></div>`
  return `<div class="sdl-tasks-r5f11__backdrop" role="presentation">
    <section class="sdl-tasks-r5f11__dialog" role="dialog" aria-modal="true">
      <div class="sdl-tasks-r5f11__modal-head"><div><span class="sdl-work-kicker">DETAIL DISPOSISI</span><h2>${esc(t.letterNumber)}</h2><p>${esc(t.subject)}</p></div><button type="button" class="btn" data-act="close">Tutup</button></div>
      <div class="sdl-tasks-r5f11__modal-body">
        <div class="sdl-tasks-r5f3__facts">
          ${fact('Dari', t.issuerName)}${fact('Ditugaskan Kepada', t.assigneeName)}
          ${fact('Unit', UNIT_NAMES[t.unit] || t.unit)}${fact('Tenggat', idLong(t.dueDate))}
          ${fact('Status', STATUS_NAMES[t.status])}${fact('Review', REVIEW_NAMES[t.reviewStatus])}
          ${fact('Target', SLA_NAMES[t.slaStatus])}${fact('Hierarki', t.parentTaskId ? `Turunan Level ${t.depth}` : 'Disposisi Utama')}
        </div>
        <div class="sdl-tasks-r5f11__detail-actions"><button type="button" class="btn" data-act="opensurat:${t.incomingId}">Buka Surat &amp; Lampiran</button>${t.parentTaskId ? `<button type="button" class="btn" data-act="task:${t.parentTaskId}">Lihat Tugas Induk</button>` : ''}</div>
        <div class="sdl-tasks-r5f3__section"><h3>Arahan</h3><p class="sdl-tasks-r5f3__copy">${esc(t.instruction)}</p></div>
        ${t.completionNote ? `<div class="sdl-tasks-r5f3__section"><h3>Hasil Tindak Lanjut</h3><p class="sdl-tasks-r5f3__copy">${esc(t.completionNote)}</p></div>` : ''}
        ${t.reviewReason ? `<div class="sdl-tasks-r5f3__section"><h3>Catatan Review</h3><p class="sdl-tasks-r5f3__copy">${esc(t.reviewReason)}</p></div>` : ''}
        <div class="sdl-tasks-r5f3__section"><h3>Riwayat Disposisi</h3><ol class="sdl-tasks-r5f3__events">${events.map((e) => `<li><strong>${EVENT_LABELS[e.action] || 'Pembaruan'}</strong><small>${esc(e.actor)} · ${idDateTime(e.at)}</small><p>${esc(e.reason)}</p></li>`).join('')}</ol></div>
        ${canAct ? `<div class="sdl-tasks-r5f3__section"><h3>${t.status === 'pending' ? 'Terima Tugas' : 'Selesaikan Tugas'}</h3><label class="sdl-tasks-r5f3__field">${t.status === 'pending' ? 'Keterangan Penerimaan' : 'Hasil Tindak Lanjut'}<textarea class="rm-input" rows="3" placeholder="Tuliskan keterangan minimal 8 karakter"></textarea></label><button type="button" class="btn primary" data-act="soon:${encodeURIComponent('Mockup statis: status tugas tidak berubah.')}">${t.status === 'pending' ? 'Terima Tugas' : 'Selesaikan Tugas'}</button></div>` : ''}
        ${canReview ? `<div class="sdl-tasks-r5f3__section"><h3>Review Hasil Tugas</h3><label class="sdl-tasks-r5f3__field">Catatan Review<textarea class="rm-input" rows="3" placeholder="Tuliskan hasil penilaian minimal 8 karakter"></textarea></label><div class="sdl-tasks-r5f3__buttons"><button type="button" class="btn primary" data-act="soon:${encodeURIComponent('Mockup statis: keputusan review tidak disimpan.')}">Setujui Hasil</button><button type="button" class="btn" data-act="soon:${encodeURIComponent('Mockup statis: keputusan review tidak disimpan.')}">Perlu Tindak Lanjut</button></div></div>` : ''}
      </div>
    </section>
  </div>`
}

/* =========================================================
   14. Berkas kerja
   ========================================================= */
ACTIONS.berkas = (a) => { state.ui.berkasSelected = state.ui.berkasSelected === a[0] ? null : a[0]; state.ui.berkasTab = 'files'; render() }
ACTIONS.berkastab = (a) => { state.ui.berkasTab = a[0]; render() }
const TASK_STATUS_NAMES = { pending: 'Menunggu Diterima', received: 'Diterima', completed: 'Selesai', cancelled: 'Dibatalkan' }
function berkasView(unitKey) {
  const u = state.ui
  const all = BERKAS[unitKey] || []
  const q = u.berkasQuery.toLowerCase()
  const list = all.filter((b) => (u.berkasClass === 'semua' || b.classification === u.berkasClass) && `${b.title} ${b.category}`.toLowerCase().includes(q))
  const current = all.find((b) => b.id === u.berkasSelected)
  const activeTasks = current ? current.tasks.filter((t) => ['pending', 'received'].includes(t.status)).length : 0
  return `<div class="unitwork-r5a sdl-unit-berkas sdl-work-r5f4">
    <section class="sdl-work-r5f4__summary" aria-label="Ringkasan berkas">
      <div><small>Berkas Ditampilkan</small><strong>${all.length}</strong><span>Sesuai hak akses</span></div>
      <div><small>Berkas Penting</small><strong>${all.filter((b) => b.classification === 'penting').length}</strong><span>Dalam hasil daftar</span></div>
      <div><small>Disposisi Aktif</small><strong>${current ? activeTasks : '—'}</strong><span>${current ? 'Pada berkas terpilih' : 'Pilih berkas dahulu'}</span></div>
    </section>
    <section class="panel sdl-work-register">
      <header class="sdl-work-register__header"><div><h2>Daftar Berkas</h2><p>Kelola dokumen dan penugasan internal ${esc(UNITS.find((x) => x.id === unitKey).name)}.</p></div><button type="button" class="btn primary" data-act="soon:${encodeURIComponent('Mockup statis: pembuatan berkas dinonaktifkan.')}">+ Tambah Berkas</button></header>
      <form class="sdl-work-r5f4__filters" data-act="soon:${encodeURIComponent('Pencarian berjalan langsung saat mengetik.')}">
        <label class="sdl-work-r5f4__search"><span class="sdl-sr-only">Cari berkas</span><input data-k="bq" value="${esc(u.berkasQuery)}" placeholder="Cari judul atau kategori…" data-model="ui.berkasQuery"></label>
        <label><span class="sdl-sr-only">Klasifikasi</span><select data-model="ui.berkasClass">${[['semua', 'Semua Klasifikasi'], ['biasa', 'Biasa'], ['penting', 'Penting']].map(([v, l]) => `<option value="${v}"${u.berkasClass === v ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
        <button class="btn" type="submit">Cari</button>
        <button class="btn" type="button" data-act="berkasreset">Reset</button>
      </form>
      ${list.length === 0 ? '<div class="sdl-work-empty"><strong>Belum ada berkas yang sesuai</strong><p>Periksa pencarian atau tambahkan berkas baru.</p></div>'
      : `<div class="sdl-work-records">${list.map((b) => `<button type="button" class="sdl-work-record ${u.berkasSelected === b.id ? 'is-selected' : ''}" data-act="berkas:${b.id}"><span class="sdl-work-record__icon" aria-hidden="true">▤</span><span class="sdl-work-record__copy"><strong>${esc(b.title)}</strong><small>${esc(b.category)} · ${idDate(b.createdAt)}</small></span><span class="sdl-work-r5f4__classification ${b.classification === 'penting' ? 'is-important' : ''}">${b.classification === 'penting' ? 'Penting' : 'Biasa'}</span><span class="sdl-work-record__arrow" aria-hidden="true">→</span></button>`).join('')}</div>`}
    </section>
    ${current ? berkasDetail(current, activeTasks) : ''}
  </div>`
}
ACTIONS.berkasreset = () => { state.ui.berkasQuery = ''; state.ui.berkasClass = 'semua'; render() }
function berkasDetail(b, activeTasks) {
  const tab = state.ui.berkasTab
  const tabs = [['files', 'Lampiran'], ['tasks', 'Tugas Internal'], ['history', 'Riwayat']]
  let section = ''
  if (tab === 'files') {
    section = `<div class="sdl-work-details__section"><div class="sdl-work-section-head"><h3>Foto &amp; Dokumen (${b.files.length}/10)</h3><span>PDF, JPG, PNG · Maksimal 5 MiB per lampiran</span></div>
      <div class="sdl-work-r5f4__drop"><div><strong>Tarik berkas ke sini</strong><small>mockup statis — unggahan dinonaktifkan</small></div><button class="btn" type="button" disabled>Pilih Berkas</button></div>
      ${b.files.length === 0 ? '<p class="sdl-work-muted">Belum ada lampiran pada berkas ini.</p>' : `<div class="sdl-work-files">${b.files.map((f) => `<article class="sdl-work-file sdl-work-r5f4__file"><div class="sdl-work-r5f4__file-icon" aria-hidden="true">${f.type}</div><strong title="${esc(f.name)}">${esc(f.name)}</strong><small>${f.size.toLocaleString('id-ID')} KB · ${idDate(f.at)}</small><div class="sdl-work-r5f4__file-actions"><button class="btn" type="button" data-act="soon:${encodeURIComponent('Lampiran peraga tidak memiliki isi file.')}">Preview</button><button class="btn" type="button" data-act="soon:${encodeURIComponent('Lampiran peraga tidak dapat diunduh.')}">Unduh</button></div></article>`).join('')}</div>`}</div>`
  } else if (tab === 'tasks') {
    section = `<div class="sdl-work-details__section"><div class="sdl-work-section-head"><h3>Disposisi Internal (${b.tasks.length})</h3><span>${activeTasks} tugas aktif</span></div>
      <form class="sdl-work-task-form" data-act="soon:${encodeURIComponent('Mockup statis: disposisi tidak dikirim.')}">
        <label>Penerima<select><option value="">Pilih petugas unit</option><option>Darmawan Sutejo</option><option>Panji Alamsyah</option><option>Ratna Kusumaningrum</option></select></label>
        <label>Tenggat (opsional)<input type="date"></label>
        <label class="sdl-work-r5f4__task-instruction">Instruksi<textarea rows="3" placeholder="Tuliskan arahan tindak lanjut"></textarea></label>
        <div class="sdl-work-task-form__submit"><button class="btn primary" type="submit">Kirim Disposisi</button></div></form>
      ${b.tasks.length === 0 ? '<p class="sdl-work-muted">Belum ada disposisi internal pada berkas ini.</p>' : `<div class="sdl-work-task-list">${b.tasks.map((t) => `<article class="sdl-work-task"><header><strong>${esc(t.toName)}</strong><span class="sdl-work-r5f4__task-status status-${t.status}">${TASK_STATUS_NAMES[t.status]}</span></header><p class="sdl-work-r5f4__instruction">${esc(t.instruction)}</p><small>Dikirim ${idDate(t.createdAt)} · ${t.dueDate ? 'tenggat ' + idDate(t.dueDate) : 'tanpa tenggat'}</small>${t.response ? `<p><strong>Hasil:</strong> ${esc(t.response)}</p>` : ''}</article>`).join('')}</div>`}</div>`
  } else {
    section = `<div class="sdl-work-details__section"><div class="sdl-work-section-head"><h3>Riwayat Aktivitas</h3><span>${b.events.length} catatan terbaru</span></div>
      <ol class="sdl-work-r5f4__events">${b.events.map((e) => `<li><div><strong>${e.action === 'created' ? 'Berkas Dibuat' : e.action === 'file' ? 'Lampiran Diunggah' : 'Disposisi Dikirim'}</strong><small>${esc(e.user)} · ${idDateTime(e.at)} WIB</small></div><p>${esc(e.note)}</p></li>`).join('')}</ol></div>`
  }
  return `<section class="panel sdl-work-details">
    <header class="sdl-work-details__header"><div><span class="sdl-work-kicker">DETAIL BERKAS</span><h2>${esc(b.title)}</h2><p>${esc(b.category)} · ${b.classification === 'penting' ? 'Penting' : 'Biasa'} · ${idDate(b.createdAt)}</p></div>
      <div class="sdl-work-details__actions"><button type="button" class="btn" data-act="soon:${encodeURIComponent('Mockup statis.')}">Edit</button><button type="button" class="btn" data-act="soon:${encodeURIComponent('Mockup statis.')}">Arsipkan</button><button type="button" class="btn" data-act="berkas:${b.id}">Tutup</button></div></header>
    <p class="sdl-work-description">${esc(b.description)}</p>
    <nav class="sdl-r5f5-tabs sdl-r5f5-tabs--detail" aria-label="Bagian detail berkas">${tabs.map(([id, label]) => `<button type="button" class="sdl-r5f5-tab ${tab === id ? 'is-active' : ''}" data-act="berkastab:${id}">${label}</button>`).join('')}</nav>
    ${section}
  </section>`
}

/* =========================================================
   15. Registry generik (Sumda / Binfung / Urmin R5D)
   ========================================================= */
function registryView(key, mod) {
  const u = state.ui
  const def = REGISTRY[key]
  const q = u.registryQuery.toLowerCase()
  const items = def.items.filter((x) => `${x.code} ${x.title} ${x.info}`.toLowerCase().includes(q))
    .sort((a, b) => u.registrySort === 'az' ? a.title.localeCompare(b.title, 'id') : ms(b.createdAt) - ms(a.createdAt))
  const flagged = def.items.filter((x) => x.classification === 'penting').length
  const singular = mod ? mod.title : 'Data'
  return `<div class="sumda-r5b">
    <section class="sumda-overview" aria-label="Ringkasan data">
      <div class="sumda-overview-mark">${icon(mod ? mod.icon : 'folder', 24)}</div>
      <div class="sumda-overview-title"><span class="sumda-eyebrow">MASTER DATA / ${key.split(':')[0].toUpperCase()}</span><h2>${esc(singular)}</h2><p>${esc(mod ? mod.description : '')}</p></div>
      <div class="sumda-overview-stats"><div class="sumda-stat"><span>Data ditampilkan</span><strong>${def.items.length}</strong></div><div class="sumda-stat"><span>Klasifikasi penting</span><strong>${flagged}</strong></div></div>
    </section>
    <section class="sumda-card sumda-register" aria-label="Daftar ${esc(singular)}">
      <div class="sumda-card-head"><div><span class="sumda-eyebrow">REGISTER UNIT</span><h3>Daftar ${esc(singular)}</h3></div><button class="sumda-button sumda-button-primary" type="button" data-act="soon:${encodeURIComponent('Mockup statis: penambahan data dinonaktifkan.')}">${icon('plus', 18)} Tambah Data</button></div>
      <div class="sumda-toolbar">
        <form class="sumda-search" data-act="soon:${encodeURIComponent('Pencarian berjalan langsung saat mengetik.')}" role="search">${icon('search', 18)}<input data-k="rq" value="${esc(u.registryQuery)}" placeholder="Cari ${esc(def.code.toLowerCase())}, nama..." data-model="ui.registryQuery"><button type="submit">Cari</button></form>
        <div class="sumda-toolbar-controls"><label class="sumda-sort-label" for="reg-sort">Urutkan</label>
          <select id="reg-sort" data-model="ui.registrySort"><option value="latest"${u.registrySort === 'latest' ? ' selected' : ''}>Terbaru</option><option value="az"${u.registrySort === 'az' ? ' selected' : ''}>Nama A–Z</option></select>
          <button class="sumda-icon-button" type="button" data-act="soon:${encodeURIComponent('Data peraga dimuat ulang.')}" title="Muat ulang">${icon('refresh', 18)}</button></div>
      </div>
      ${items.length === 0 ? `<div class="sumda-empty"><div class="sumda-empty-icon">${icon('search', 30)}</div><h4>Tidak ada hasil yang cocok</h4><p>Coba kata kunci lain atau reset pencarian.</p><button type="button" class="sumda-button sumda-button-primary" data-act="regreset">${icon('refresh', 17)} Tampilkan semua</button></div>`
      : `<div class="sumda-table-scroll"><table class="sumda-table"><thead><tr><th>${esc(def.code)}</th><th>${esc(def.name)}</th><th>Informasi</th><th>Klasifikasi</th><th>Tanggal input</th><th class="sumda-actions-title">Aksi</th></tr></thead><tbody>
        ${items.map((p) => `<tr>
          <td><span class="sumda-code">${esc(p.code)}</span></td>
          <td><div class="sumda-person-cell"><span class="sumda-avatar" aria-hidden="true">${initials(p.title)}</span><strong>${esc(p.title)}</strong></div></td>
          <td class="sumda-secondary-cell">${esc(p.info)}</td>
          <td><span class="sumda-classification ${p.classification === 'penting' ? 'is-important' : ''}">${p.classification === 'penting' ? 'Penting' : 'Biasa'}</span></td>
          <td class="sumda-secondary-cell">${idDate(p.createdAt)}</td>
          <td><div class="sumda-actions"><button type="button" class="sumda-action" data-act="soon:${encodeURIComponent('Mockup statis: pengeditan dinonaktifkan.')}">${icon('file', 16)} <span>Edit</span></button><button type="button" class="sumda-action sumda-action-attachment" data-act="nav:workspace:${key.split(':')[0]}:__unitwork">${icon('folder', 16)} <span>File &amp; Disposisi</span></button></div></td></tr>`).join('')}
      </tbody></table></div>`}
      <footer class="sumda-list-footer"><span>${icon('list', 15)} ${items.length} data ditampilkan</span><span></span></footer>
    </section>
  </div>`
}
ACTIONS.regreset = () => { state.ui.registryQuery = ''; render() }

/* =========================================================
   16. Agenda & kalender
   ========================================================= */
ACTIONS.agmode = (a) => { state.ui.agendaMode = a[0]; render() }
ACTIONS.agmove = (a) => {
  const u = state.ui, step = Number(a[0]), c = u.agendaCursor
  u.agendaCursor = u.agendaMode === 'month' ? new Date(c.getFullYear(), c.getMonth() + step, 1) : new Date(c.getFullYear(), c.getMonth(), c.getDate() + step * 7)
  render()
}
ACTIONS.agtoday = () => { state.ui.agendaCursor = midnight(); render() }
ACTIONS.agday = (a) => { state.ui.agendaDay = a[0]; render() }
function agendaView() { return agendaCalendar(false) }
function agendaCalendar(compact) {
  const u = state.ui
  const cursor = u.agendaCursor
  const mode = u.agendaMode
  const todayKey = localKey(midnight())
  const weekNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const start = mode === 'month' ? new Date(cursor.getFullYear(), cursor.getMonth(), 1) : new Date(cursor)
  start.setDate(start.getDate() - start.getDay())
  const length = mode === 'week' ? 7 : Math.ceil((new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate() + new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay()) / 7) * 7
  const days = Array.from({ length }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  const byDate = new Map()
  AGENDA.forEach((a) => { const v = byDate.get(a.tanggal) || []; v.push(a); byDate.set(a.tanggal, v) })
  const cells = days.map((day) => {
    const key = localKey(day)
    const matches = byDate.get(key) || []
    const limit = mode === 'week' ? 5 : 2
    return `<div role="gridcell" class="agenda-cal__day${key === todayKey ? ' is-today' : ''}${mode === 'month' && day.getMonth() !== cursor.getMonth() ? ' is-outside' : ''}">
      <button type="button" class="agenda-cal__day-number" data-act="agday:${key}">${day.getDate()}</button>
      <div class="agenda-cal__entries">${matches.slice(0, limit).map((a) => `<button type="button" class="agenda-cal__event${a.status === 'Dibatalkan' ? ' is-cancelled' : ''}${a.status === 'Selesai' ? ' is-completed' : ''}" data-act="agday:${key}"><span>${a.waktu} </span>${esc(a.title)}</button>`).join('')}${matches.length > limit ? `<button type="button" class="agenda-cal__more" data-act="agday:${key}">+${matches.length - limit} agenda</button>` : ''}</div>
    </div>`
  }).join('')
  const detail = u.agendaDay ? (byDate.get(u.agendaDay) || []) : null
  return `<div class="agenda-cal" aria-label="Kalender Agenda URMIN">
    <div class="agenda-cal__toolbar">
      <div class="agenda-cal__heading"><h2>Kalender Agenda</h2><p>Jadwal kegiatan dan rapat URMIN</p></div>
      <div class="agenda-cal__controls">
        <button type="button" data-act="agtoday">Hari ini</button>
        <div class="agenda-cal__navigation"><button type="button" aria-label="Sebelumnya" data-act="agmove:-1">‹</button><span>${monthName(cursor)}</span><button type="button" aria-label="Berikutnya" data-act="agmove:1">›</button></div>
        <div class="agenda-cal__segmented"><button type="button" aria-pressed="${mode === 'month'}" data-act="agmode:month">Bulan</button><button type="button" aria-pressed="${mode === 'week'}" data-act="agmode:week">Minggu</button></div>
        ${compact ? `<button type="button" class="agenda-cal__open" data-act="nav:workspace:urmin:agenda">Buka Agenda ↗</button>` : ''}
      </div>
    </div>
    <div class="agenda-cal__scroll"><div class="agenda-cal__grid" role="grid">${weekNames.map((n) => `<div class="agenda-cal__weekday" role="columnheader">${n}</div>`).join('')}${cells}</div></div>
    <div class="agenda-cal__foot"><span><i></i> Terjadwal</span><span><i></i> Selesai</span><span><i></i> Dibatalkan</span><span class="agenda-cal__total">${AGENDA.length} agenda tersedia</span></div>
    ${detail ? `<div class="agenda-cal__backdrop" role="presentation" data-act="closebg"><section class="agenda-cal__dialog" role="dialog" aria-modal="true">
      <header><div><small>AGENDA HARIAN</small><h3>${idDate(u.agendaDay, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3></div><button type="button" data-act="close" aria-label="Tutup dialog">×</button></header>
      <div class="agenda-cal__detail-list">${detail.length === 0 ? '<p>Belum ada agenda pada tanggal ini.</p>' : detail.map((a) => `<article><div class="agenda-cal__detail-head"><strong>${esc(a.title)}</strong><span>${a.status}</span></div><dl><dt>Waktu</dt><dd>${a.waktu}</dd><dt>Lokasi</dt><dd>${esc(a.lokasi)}</dd><dt>Penyelenggara</dt><dd>${esc(a.penyelenggara)}</dd><dt>Peserta</dt><dd>${esc(a.peserta)}</dd></dl></article>`).join('')}</div>
      <footer><button type="button" data-act="nav:workspace:urmin:agenda">Lihat Semua Agenda</button><button type="button" data-act="close">Tutup</button></footer>
    </section></div>` : ''}
  </div>`
}

/* =========================================================
   17. User management
   ========================================================= */
const PAGE_SIZE = 10
ACTIONS.user = (a) => { state.ui.userModal = a[0]; state.ui.userTab = 'profile'; render() }
ACTIONS.usertab = (a) => { state.ui.userTab = a[0]; render() }
ACTIONS.userpage = (a) => { state.ui.userPage = Math.max(1, state.ui.userPage + Number(a[0])); render() }
ACTIONS.audit = () => { state.ui.auditOpen = !state.ui.auditOpen; render() }
const unitName = (k) => (ADMIN_UNITS.find((u) => u.key === k) || {}).name || k || '—'
const roleName = (k) => (ADMIN_ROLES.find((r) => r.key === k) || {}).name || k

function userManagement() {
  const u = state.ui
  const q = u.userQuery.trim().toLowerCase()
  const filtered = ADMIN_USERS.filter((x) => {
    if (!`${x.username} ${x.displayName} ${x.email} ${x.grants.map((g) => g.roleKey).join(' ')}`.toLowerCase().includes(q)) return false
    if (u.userUnit !== 'all' && !x.grants.some((g) => g.unitKey === u.userUnit) && x.primaryUnit !== u.userUnit) return false
    if (u.userStatus === 'active' && !x.active) return false
    if (u.userStatus === 'inactive' && x.active) return false
    if (u.userOtp === 'on' && !(x.protected || x.otpEnabled)) return false
    if (u.userOtp === 'off' && (x.protected || x.otpEnabled)) return false
    return true
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(u.userPage, totalPages)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  return `<div class="rm-root um-root r2d3-root">
    <div class="r2d3-title-row"><div class="page-heading"><span class="eyebrow">IDENTITY &amp; ACCESS</span><h1>User Management</h1><p>Kelola akun, role per unit, dan kebijakan OTP. Seluruh akun di mockup ini karangan.</p></div><button type="button" class="btn primary r2d3-add" data-act="soon:${encodeURIComponent('Mockup statis: pembuatan akun dinonaktifkan.')}">＋ Tambah Pengguna</button></div>
    <div class="r2d3-stats" aria-label="Ringkasan pengguna">
      <div class="panel r2d3-stat"><small>Akun dalam daftar</small><strong>${ADMIN_USERS.length}</strong></div>
      <div class="panel r2d3-stat"><small>Akun aktif</small><strong>${ADMIN_USERS.filter((x) => x.active).length}</strong></div>
      <div class="panel r2d3-stat"><small>Sudah punya role unit</small><strong>${ADMIN_USERS.filter((x) => x.grants.length > 0).length}</strong></div>
      <div class="panel r2d3-stat"><small>OTP aktif</small><strong>${ADMIN_USERS.filter((x) => x.protected || x.otpEnabled).length}</strong></div>
    </div>
    <div class="rm-notice"><strong>Keamanan:</strong> Superadmin hanya mengelola pengguna dan role. Akun Superadmin dilindungi dan OTP selalu ON. Unit dan role tidak otomatis membuka dokumen; RBAC + ABAC tetap diperiksa per objek.</div>
    <section class="panel r2d3-users-panel" aria-label="Daftar pengguna">
      <div class="r2d3-table-head"><div><h2>Daftar Pengguna</h2><p>${filtered.length} dari ${ADMIN_USERS.length} akun ditampilkan</p></div><button type="button" class="btn" data-act="soon:${encodeURIComponent('Data peraga dimuat ulang.')}">↻ Refresh</button></div>
      <div class="r2d3-filters">
        <label class="r2d3-search">Cari pengguna<input type="search" data-k="uq" class="rm-input" placeholder="Nama, username, email, role..." value="${esc(u.userQuery)}" data-model="ui.userQuery"></label>
        <label>Unit<select class="rm-input" data-model="ui.userUnit"><option value="all">Semua unit</option>${ADMIN_UNITS.map((x) => `<option value="${x.key}"${u.userUnit === x.key ? ' selected' : ''}>${x.name}</option>`).join('')}</select></label>
        <label>Status<select class="rm-input" data-model="ui.userStatus"><option value="all">Semua status</option><option value="active"${u.userStatus === 'active' ? ' selected' : ''}>Aktif</option><option value="inactive"${u.userStatus === 'inactive' ? ' selected' : ''}>Nonaktif</option></select></label>
        <label>OTP<select class="rm-input" data-model="ui.userOtp"><option value="all">Semua kebijakan</option><option value="on"${u.userOtp === 'on' ? ' selected' : ''}>OTP ON</option><option value="off"${u.userOtp === 'off' ? ' selected' : ''}>OTP OFF</option></select></label>
      </div>
      <div class="r2d3-table-scroller"><table class="r2d3-table"><thead><tr><th scope="col">Pengguna</th><th scope="col">Unit utama</th><th scope="col">Role aktif</th><th scope="col">Status</th><th scope="col">OTP</th><th scope="col">Aksi</th></tr></thead><tbody>
        ${visible.length === 0 ? '<tr><td colspan="6" class="r2d3-empty">Tidak ada pengguna sesuai pencarian atau filter.</td></tr>' : visible.map((x) => `<tr>
          <td><div class="r2d3-identity"><span class="r2d3-avatar${x.protected ? ' protected' : ''}">${initials(x.displayName)}</span><div><strong>${esc(x.displayName)}</strong><small>@${esc(x.username)} · ${esc(x.email)}</small></div></div></td>
          <td>${x.protected ? '<span class="r2d3-muted">Administrasi sistem</span>' : esc(unitName(x.primaryUnit))}</td>
          <td><div class="r2d3-role-tags">${x.protected ? '<span class="r2d3-tag gold">Superadmin</span>' : x.grants.length ? x.grants.slice(0, 2).map((g) => `<span class="r2d3-tag" title="Unit: ${g.unitKey} · Scope: ${g.scope}">${esc(roleName(g.roleKey))}</span>`).join('') : '<span class="r2d3-muted">Belum ditetapkan</span>'}${x.grants.length > 2 ? `<span class="r2d3-tag">+${x.grants.length - 2}</span>` : ''}</div></td>
          <td><span class="r2d3-status ${x.active ? 'active' : 'inactive'}">${x.active ? 'Aktif' : 'Nonaktif'}</span></td>
          <td><span class="r2d3-status ${x.protected || x.otpEnabled ? 'active' : 'inactive'}">${x.protected || x.otpEnabled ? 'ON' : 'OFF'}</span></td>
          <td><button type="button" class="btn r2d3-edit" data-act="user:${x.id}">${x.protected ? 'Lihat' : 'Edit'}</button></td></tr>`).join('')}
      </tbody></table></div>
      <div class="r2d3-table-foot"><span>${filtered.length ? `Menampilkan ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} dari ${filtered.length}` : 'Tidak ada hasil'}</span>
        <div class="r2d3-pages"><button type="button" class="btn" ${page <= 1 ? 'disabled' : ''} data-act="userpage:-1">←</button><span>Halaman ${page} / ${totalPages}</span><button type="button" class="btn" ${page >= totalPages ? 'disabled' : ''} data-act="userpage:1">→</button></div></div>
    </section>
    <section class="panel r2d3-audit-panel"><div class="r2d3-table-head"><div><h2>Audit perubahan akun</h2><p>Event terbaru; tanpa password ataupun kode OTP</p></div><button type="button" class="btn" aria-expanded="${u.auditOpen}" data-act="audit">${u.auditOpen ? 'Tutup' : 'Tampilkan'} riwayat</button></div>
      ${u.auditOpen ? `<div class="um-audit-list">${AUDIT_EVENTS.map((e) => `<div><strong>${esc(e.key)}</strong><small>${idDateTime(e.at)} · oleh ${esc(e.actor)} · ${esc(e.type)} ${esc(e.subject)} · Alasan: ${esc(e.reason)}</small></div>`).join('')}</div>` : ''}</section>
    ${u.userModal ? userDialog(ADMIN_USERS.find((x) => x.id === u.userModal)) : ''}
  </div>`
}
function userDialog(x) {
  if (!x) return ''
  const tab = state.ui.userTab
  const tabs = [['profile', 'Informasi Akun'], ['access', 'Role & Unit'], ['security', 'Security & OTP']]
  const scopes = { own: 'Dibuat sendiri', assigned: 'Ditugaskan', unit: 'Satu unit' }
  let body = ''
  if (tab === 'profile') {
    body = `<div class="r2d3-form"><div class="r2d3-fields">
      <label>Username<input class="rm-input" readonly value="${esc(x.username)}"></label>
      <label>Nama tampilan<input class="rm-input" value="${esc(x.displayName)}" ${x.protected ? 'disabled' : ''}></label>
      <label class="r2d3-wide">Email OTP<input class="rm-input" type="email" value="${esc(x.email)}" ${x.protected ? 'disabled' : ''}></label></div>
      <label class="r2d3-account-switch"><span><strong>Status akun</strong><small>${x.active ? 'Akun dapat login sesuai kebijakan' : 'Akun tidak dapat login'}</small></span><input type="checkbox" role="switch" ${x.active ? 'checked' : ''} ${x.protected ? 'disabled' : ''}></label>
      ${x.forcePasswordChange ? '<div class="rm-notice"><strong>Wajib ganti password.</strong> Akun ini belum merotasi password sementara, sehingga hampir seluruh endpoint operasional diblokir.</div>' : ''}
      ${!x.protected ? '<label class="r2d3-reason">Alasan perubahan *<textarea class="rm-input" rows="2" placeholder="Minimal 8 karakter"></textarea></label><p class="r2d3-helper">Perubahan nama, email, atau status akan mencabut sesi akun ini.</p>' : ''}</div>`
  } else if (tab === 'access') {
    body = `<div class="r2d3-form"><p class="r2d3-helper">Setiap assignment adalah satu role pada satu unit dengan scope dan klasifikasi. Akses dokumen tetap diperiksa per objek.</p>
      ${x.protected ? '<div class="rm-notice"><strong>Superadmin terlindungi.</strong> Akun bootstrap tidak memiliki grant operasional dan tidak dapat diberi akses dokumen.</div>' : `<div class="r2d3-grant-stack">${x.grants.length === 0 ? '<p class="r2d3-helper">Belum ada assignment pada akun ini.</p>' : x.grants.map((g, i) => `<div class="r2d3-grant">
        <div class="r2d3-grant-head"><strong>Assignment ${i + 1}</strong><button type="button" class="btn" data-act="soon:${encodeURIComponent('Mockup statis.')}">Hapus</button></div>
        <div class="r2d3-fields"><label>Role<select class="rm-input">${ADMIN_ROLES.filter((r) => r.key !== 'superadmin').map((r) => `<option${r.key === g.roleKey ? ' selected' : ''}>${esc(r.name)}</option>`).join('')}</select></label>
        <label>Unit<select class="rm-input">${ADMIN_UNITS.map((uu) => `<option${uu.key === g.unitKey ? ' selected' : ''}>${esc(uu.name)}</option>`).join('')}</select></label></div>
        <div class="r2d2-abac-field"><span class="r2d2-abac-label">Cakupan data</span><div class="r2d2-choice-row">${Object.entries(scopes).map(([k, l]) => `<button type="button" class="${g.scope === k ? 'selected' : ''}" data-act="soon:${encodeURIComponent('Mockup statis.')}">${l}</button>`).join('')}</div></div>
        <div class="r2d2-abac-field"><span class="r2d2-abac-label">Klasifikasi maksimum</span><div class="r2d2-choice-row">${['biasa', 'penting'].map((k) => `<button type="button" class="${g.classificationLimit === k ? 'selected' : ''}" data-act="soon:${encodeURIComponent('Mockup statis.')}">${k === 'biasa' ? 'Biasa' : 'Penting'}</button>`).join('')}</div></div>
        <label>Masa berlaku (opsional)<input type="datetime-local" class="rm-input" value="${g.expiresAt ? g.expiresAt.slice(0, 16) : ''}"></label></div>`).join('')}</div>
        <button type="button" class="btn" data-act="soon:${encodeURIComponent('Mockup statis.')}">＋ Tambah Assignment</button>
        <label class="r2d3-reason">Alasan perubahan akses *<textarea class="rm-input" rows="2" placeholder="Minimal 8 karakter"></textarea></label>
        <p class="r2d3-helper">Simpan assignment akan mencabut session pengguna. Akses tidak otomatis berlaku ke semua dokumen unit.</p>`}</div>`
  } else {
    body = `<div class="r2d3-form"><label class="r2d3-account-switch"><span><strong>OTP saat login</strong><small>${x.protected ? 'Superadmin selalu wajib OTP' : 'Default ON. Superadmin dapat mengubah kebijakan pengguna lain.'}</small></span><input role="switch" type="checkbox" ${x.protected || x.otpEnabled ? 'checked' : ''} ${x.protected ? 'disabled' : ''}></label>
      ${!x.protected ? '<label class="r2d3-reason">Alasan perubahan OTP *<textarea class="rm-input" rows="2"></textarea></label><label>Password Superadmin untuk konfirmasi *<input class="rm-input" type="password"></label><p class="r2d3-helper">Mengubah OTP mencabut session dan challenge login pengguna yang terdampak. CAPTCHA tetap wajib.</p>' : ''}</div>`
  }
  return `<div class="r2d3-backdrop" data-act="closebg"><div class="r2d3-dialog" role="dialog" aria-modal="true">
    <header class="r2d3-dialog-head"><div><span class="eyebrow">PENGATURAN AKUN</span><h2>${esc(x.displayName)}</h2><p>Simpan setiap bagian secara terpisah dengan alasan yang jelas.</p></div><button type="button" class="r2d3-close" aria-label="Tutup modal" data-act="close">✕</button></header>
    <div class="r2d3-modal-tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" aria-selected="${tab === k}" class="${tab === k ? 'active' : ''}" data-act="usertab:${k}">${l}</button>`).join('')}</div>
    <div class="r2d3-dialog-body">${body}</div>
    <footer class="r2d3-dialog-foot"><button type="button" class="btn" data-act="close">Tutup</button>${!x.protected ? `<button type="button" class="btn primary" data-act="soon:${encodeURIComponent('Mockup statis: perubahan tidak disimpan.')}">Simpan</button>` : ''}</footer>
  </div></div>`
}

/* =========================================================
   18. Role & permission
   ========================================================= */
const GROUP_NAMES = { identity: 'Administrasi pengguna & role', audit: 'Audit & aktivitas', urmin: 'Urmin · Persuratan', subbagren: 'Subbagren · Perencanaan', subbagsumda: 'Subbagsumda · Sumber daya', subbagbinfung: 'Subbagbinfung · Pembinaan fungsi', dashboard: 'Dashboard & monitoring' }
const ACTION_NAMES = { read: 'Lihat data', create: 'Tambah data', update: 'Edit data', delete: 'Hapus data', approve: 'Setujui', download: 'Unduh file', export: 'Ekspor data', manage: 'Kelola', register: 'Registrasi', assign: 'Tugaskan', revoke: 'Cabut akses' }
const SCOPE_NAMES = { own: 'Dibuat sendiri', assigned: 'Ditugaskan', unit: 'Dalam unit' }
function labelFor(key) {
  const parts = key.split('.')
  const last = ACTION_NAMES[parts[parts.length - 1]] || parts[parts.length - 1]
  return last + (parts.length > 2 ? ' · ' + parts.slice(1, -1).join(' / ').replace(/_/g, ' ') : '')
}
ACTIONS.role = (a) => { state.ui.roleSelected = a[0]; render() }
ACTIONS.roleview = (a) => { state.ui.roleView = a[0]; render() }

function roleManagement() {
  const u = state.ui
  const role = ADMIN_ROLES.find((r) => r.key === u.roleSelected) || ADMIN_ROLES[1]
  const isProtected = role.key === 'superadmin'
  const filteredRoles = ADMIN_ROLES.filter((r) => `${r.key} ${r.name}`.toLowerCase().includes(u.roleSearch.toLowerCase()))
  const groups = []
  PERMISSION_CATALOG.forEach((p) => {
    const g = p.key.split('.')[0]
    let entry = groups.find((x) => x.key === g)
    if (!entry) { entry = { key: g, name: GROUP_NAMES[g] || g, permissions: [] }; groups.push(entry) }
    entry.permissions.push(p)
  })
  const previewUser = ADMIN_USERS.find((x) => x.id === u.rolePreview)
  let preview = []
  if (previewUser && !previewUser.protected && previewUser.active && !previewUser.forcePasswordChange) {
    preview = previewUser.grants.flatMap((g) => {
      const r = ADMIN_ROLES.find((x) => x.key === g.roleKey)
      if (!r || !r.active || r.key === 'superadmin') return []
      if (g.expiresAt && ms(g.expiresAt) <= Date.now()) return []
      return r.permissions.filter((p) => p.startsWith(g.unitKey + '.')).map((p) => ({ permission: p, role: r.name, unit: g.unitKey, scope: g.scope, classification: g.classificationLimit, expires: g.expiresAt }))
    })
  }
  return `<div class="rm-root r2d2-root">
    <div class="page-heading"><span class="eyebrow">IDENTITY &amp; ACCESS</span><h1>Role &amp; Permission</h1><p>Atur siapa boleh melakukan apa. Nyalakan izin per tindakan, pilih role, lalu simpan dengan alasan perubahan.</p></div>
    <div class="rm-notice"><strong>Aturan tetap:</strong> Toggle ini mengatur <b>RBAC</b>, bukan membuka dokumen secara otomatis. <b>ABAC</b> (unit, scope, klasifikasi, penugasan, status surat) tetap diperiksa sistem.</div>
    <div class="rm-layout">
      <aside class="panel rm-aside"><div class="rm-aside-head"><div><strong>Role</strong><small>${ADMIN_ROLES.length} role tersimpan</small></div><button class="btn primary" type="button" data-act="soon:${encodeURIComponent('Mockup statis: pembuatan role dinonaktifkan.')}">+ Role</button></div>
        <input class="rm-input" data-k="rs" aria-label="Cari role" placeholder="Cari role..." value="${esc(u.roleSearch)}" data-model="ui.roleSearch">
        <div class="rm-list">${filteredRoles.map((r) => `<button type="button" class="rm-role ${role.key === r.key ? 'selected' : ''}" data-act="role:${r.key}"><span><strong>${esc(r.name)}</strong><small>${esc(r.key)} · ${r.permissions.length} izin</small></span><span class="rm-dot ${r.active ? 'active' : ''}"></span></button>`).join('')}</div>
      </aside>
      <section class="panel rm-editor">
        <div class="rm-editor-head"><div><span class="eyebrow">ROLE DETAIL</span><h2>${esc(role.name)}</h2><small>${isProtected ? 'Role sistem terkunci' : 'Hak akses baru berlaku setelah disimpan'}</small></div><span class="rm-badge">${isProtected ? 'Protected' : 'Tersimpan'}</span></div>
        <div class="rm-fields">
          <label>Kode role<input class="rm-input" value="${esc(role.key)}" disabled></label>
          <label>Nama role<input class="rm-input" value="${esc(role.name)}" ${isProtected ? 'disabled' : ''}></label>
          <label class="rm-wide">Keterangan<textarea class="rm-input" rows="2" ${isProtected ? 'disabled' : ''}>${esc(role.description)}</textarea></label>
          <label class="rm-switch"><input type="checkbox" ${role.active ? 'checked' : ''} ${isProtected ? 'disabled' : ''}> Role aktif</label>
        </div>
        <div class="rm-permission-head"><div><h3>Hak akses per modul</h3><p>${role.permissions.length} izin ON</p></div>
          <div class="r2d2-tabs" aria-label="Tampilan editor"><button type="button" class="${u.roleView === 'simple' ? 'active' : ''}" data-act="roleview:simple">Sederhana</button><button type="button" class="${u.roleView === 'advanced' ? 'active' : ''}" data-act="roleview:advanced">Lanjutan</button></div></div>
        <div class="r2d2-groups">${groups.map((g) => `<section class="r2d2-group">
          <div class="r2d2-group-head"><h4>${esc(g.name)}</h4><span>${g.permissions.filter((p) => role.permissions.includes(p.key)).length} / ${g.permissions.length} ON</span></div>
          <div class="r2d2-permissions">${g.permissions.map((p) => {
            const on = role.permissions.includes(p.key)
            const locked = p.key === 'identity.roles.manage' || isProtected
            return `<div class="r2d2-permission"><div class="r2d2-permission-info"><strong>${esc(labelFor(p.key))}</strong><small>${esc(p.description)}</small>${u.roleView === 'advanced' ? `<code>${esc(p.key)}</code>` : ''}${p.key === 'identity.roles.manage' ? '<small>Hanya untuk Superadmin · tidak bisa diberikan ke role lain</small>' : ''}</div><button class="r2d2-switch ${on ? 'on' : ''}" type="button" role="switch" aria-checked="${on}" ${locked ? 'disabled' : ''} data-act="soon:${encodeURIComponent('Mockup statis: izin tidak berubah.')}"><span class="r2d2-switch-knob"></span></button><span class="r2d2-switch-label">${on ? 'ON' : 'OFF'}</span></div>`
          }).join('')}</div></section>`).join('')}</div>
        <label class="rm-reason">Alasan pembuatan / perubahan (wajib diaudit)<textarea class="rm-input" rows="2" placeholder="Minimal 8 karakter, contoh: penyesuaian sesuai tugas unit" ${isProtected ? 'disabled' : ''}></textarea></label>
        <div class="rm-footer"><span>${isProtected ? 'Role Superadmin terkunci.' : 'Hak akses ini sudah tersimpan. Pemberian ke user dilakukan di User Management.'}</span><button class="btn primary" type="button" disabled>Simpan Perubahan</button></div>
      </section>
    </div>
    <section class="panel r2d2-preview">
      <div class="rm-editor-head"><div><span class="eyebrow">PRATINJAU · READ ONLY</span><h2>Ringkasan akses pengguna</h2><small>Hanya menampilkan izin aktif; tidak mengubah akses.</small></div></div>
      <label class="r2d2-preview-select">Pilih pengguna<select class="rm-input" data-model="ui.rolePreview"><option value="">Pilih untuk melihat grant...</option>${ADMIN_USERS.map((x) => `<option value="${x.id}"${u.rolePreview === x.id ? ' selected' : ''}>${esc(x.displayName)} (@${esc(x.username)})</option>`).join('')}</select></label>
      ${!previewUser ? '<div class="r2d2-preview-empty">Pilih pengguna untuk melihat role, unit, cakupan, dan izin operasional potensial yang tersimpan.</div>'
      : previewUser.protected ? '<div class="r2d2-preview-empty"><strong>Akses operasional mengikuti kebijakan akun.</strong> Superadmin tidak memiliki grant operasional.</div>'
      : !previewUser.active ? '<div class="r2d2-preview-empty">Akun nonaktif — tidak ada akses.</div>'
      : previewUser.forcePasswordChange ? '<div class="r2d2-preview-empty">Pengguna wajib mengganti password terlebih dahulu — akses operasional ditahan.</div>'
      : `<p class="r2d2-preview-explain">Ditemukan <b>${preview.length} kemungkinan izin</b> dari pasangan role dan grant yang aktif. Cakupan tidak digabung lintas role.</p>
        ${preview.length === 0 ? '<div class="r2d2-preview-empty">Belum ada izin operasional dari grant aktif.</div>' : `<div class="r2d2-preview-list">${preview.map((item) => `<div class="r2d2-preview-item"><strong>${esc(labelFor(item.permission))}</strong><span>${esc(UNIT_NAMES[item.unit] || item.unit)} · ${esc(item.role)} · ${SCOPE_NAMES[item.scope]} · maks. ${item.classification}${item.expires ? ' · hingga ' + idDateTime(item.expires) : ''}</span>${u.roleView === 'advanced' ? `<code>${esc(item.permission)}</code>` : ''}</div>`).join('')}</div>`}`}
      <div class="rm-notice r2d2-preview-warning"><strong>Bukan izin dokumen final:</strong> keputusan ALLOW/DENY aktual bergantung pada dokumen yang diminta, pembuat/penerima tugas, klasifikasi, status workflow dan grant terbaru.</div>
    </section>
  </div>`
}

/* =========================================================
   19. Arahan, eksekutif, profil, roadmap, kewenangan
   ========================================================= */
ACTIONS.directive = (a) => { state.ui.directiveOpen = state.ui.directiveOpen === a[0] ? null : a[0]; render() }
function directivesView() {
  const open = state.ui.directiveOpen
  return `<div class="page-heading"><span class="eyebrow">ARAHAN PIMPINAN</span><h1>Arahan &amp; Tindak Lanjut</h1><p>Arahan yang ditujukan kepada unit Anda beserta status penyelesaiannya.</p></div>
  <div class="metric-grid">
    <div class="metric-card"><div class="metric-top"><span>Arahan Berjalan</span><span class="metric-icon">${icon('bell')}</span></div><div class="metric-value">${DIRECTIVES.filter((d) => d.status === 'Berjalan').length}</div><div class="metric-hint">Belum dinyatakan selesai</div></div>
    <div class="metric-card"><div class="metric-top"><span>Jatuh Tempo ≤ 3 hari</span><span class="metric-icon">${icon('clock')}</span></div><div class="metric-value">${DIRECTIVES.filter((d) => d.status === 'Berjalan' && ms(d.due) - Date.now() <= 3 * 86400000).length}</div><div class="metric-hint">Perlu percepatan</div></div>
    <div class="metric-card"><div class="metric-top"><span>Selesai</span><span class="metric-icon">${icon('check')}</span></div><div class="metric-value">${DIRECTIVES.filter((d) => d.status === 'Selesai').length}</div><div class="metric-hint">Sudah ditutup pimpinan</div></div>
    <div class="metric-card"><div class="metric-top"><span>Total Arahan</span><span class="metric-icon">${icon('list')}</span></div><div class="metric-value">${DIRECTIVES.length}</div><div class="metric-hint">Pada periode berjalan</div></div>
  </div>
  <section class="panel lower-panel" style="margin-top:22px">
    <div class="panel-title"><div><h3>Daftar arahan</h3><p>Klik satu baris untuk membaca isi lengkap arahan.</p></div><span class="pill amber">${icon('bell', 12)} ${DIRECTIVES.filter((d) => d.status === 'Berjalan').length} berjalan</span></div>
    ${DIRECTIVES.map((d) => `<div class="next-step" style="flex-direction:column;align-items:stretch">
      <button type="button" data-act="directive:${d.id}" style="display:flex;gap:13px;align-items:center;width:100%;background:none;border:0;text-align:left;padding:4px 0;color:inherit">
        <span class="next-no">${d.status === 'Selesai' ? '✓' : '!'}</span>
        <span style="flex:1"><strong>${esc(d.title)}</strong><small>${esc(d.from)} → ${esc(d.to)} · tenggat ${idDate(d.due)} · ${d.status}</small></span>
        ${icon('chevron', 14)}
      </button>
      ${open === d.id ? `<div class="info-strip" style="margin-top:10px">${icon('info', 18)}<span>${esc(d.body)}</span></div>` : ''}
    </div>`).join('')}
  </section>`
}
function executiveView() {
  const totalSurat = SURAT_MASUK.length
  const aktif = TASKS.filter((t) => t.status !== 'completed').length
  const telat = TASKS.filter((t) => t.slaStatus === 'overdue' && t.status !== 'completed').length
  const selesai = TASKS.filter((t) => t.status === 'completed').length
  const perUnit = UNITS.map((u) => ({ unit: u, tasks: TASKS.filter((t) => (t.unit === u.id || t.unit === 'subbag' + u.id)).length }))
  return `<div class="page-heading"><span class="eyebrow">EXECUTIVE</span><h1>Dashboard Pimpinan</h1><p>Ringkasan lintas unit. Hanya membaca — tidak ada aksi operasional di layar ini.</p></div>
  <div class="metric-grid">
    <div class="metric-card"><div class="metric-top"><span>Surat Masuk</span><span class="metric-icon">${icon('inbox')}</span></div><div class="metric-value">${totalSurat}</div><div class="metric-hint">Tercatat pada periode berjalan</div></div>
    <div class="metric-card"><div class="metric-top"><span>Disposisi Aktif</span><span class="metric-icon">${icon('clipboard')}</span></div><div class="metric-value">${aktif}</div><div class="metric-hint">Belum selesai</div></div>
    <div class="metric-card"><div class="metric-top"><span>Lewat Tenggat</span><span class="metric-icon">${icon('clock')}</span></div><div class="metric-value">${telat}</div><div class="metric-hint">Perlu perhatian pimpinan</div></div>
    <div class="metric-card"><div class="metric-top"><span>Selesai</span><span class="metric-icon">${icon('check')}</span></div><div class="metric-value">${selesai}</div><div class="metric-hint">Termasuk yang menunggu review</div></div>
  </div>
  <div class="bottom-grid">
    <section class="panel lower-panel"><div class="panel-title"><div><h3>Beban per unit</h3><p>Jumlah disposisi yang tercatat pada tiap unit.</p></div></div>
      ${perUnit.map((p) => `<div class="next-step"><span class="next-no">${p.tasks}</span><div><strong>${esc(p.unit.name)}</strong><small>${esc(p.unit.subtitle)}</small></div>${icon('chevron', 14)}</div>`).join('')}</section>
    <section class="panel lower-panel"><div class="panel-title"><div><h3>Arahan terbaru</h3><p>Arahan yang Anda terbitkan.</p></div><span class="pill blue">${DIRECTIVES.length} arahan</span></div>
      ${DIRECTIVES.slice(0, 4).map((d) => `<div class="status-row"><span class="status-light ${d.status === 'Selesai' ? 'ready' : ''}"></span><div><strong>${esc(d.title)}</strong><small>${esc(d.to)} · tenggat ${idDate(d.due)}</small></div></div>`).join('')}
      <button class="btn" style="margin-top:14px" data-act="nav:arahan">${icon('bell', 16)} Buka halaman Arahan</button></section>
  </div>
  <div class="info-strip" style="margin-top:20px">${icon('info', 18)}<span>Pada aplikasi asli, dashboard eksekutif bersifat read-only dan merupakan satu-satunya endpoint operasional yang boleh diakses Superadmin.</span></div>`
}
function profileView() {
  const a = state.account
  return `<div class="sdl-profile">
    <button class="btn" data-act="nav:portal">${icon('back', 16)} Kembali ke Portal</button>
    <div class="sdl-profile-grid">
      <section class="panel sdl-profile-card">
        <h2>Profil Saya</h2><p>Perbarui nama tampilan dan email yang dipakai untuk pengiriman kode OTP.</p>
        <div class="sdl-avatar-block"><div class="sdl-profile-avatar">${initials(a.displayName)}</div><div><strong>${esc(a.displayName)}</strong><small>@${esc(a.username)} · ${esc(a.jabatan)}</small>
          <div class="sdl-profile-actions"><button class="btn" data-act="soon:${encodeURIComponent('Mockup statis: unggah foto dinonaktifkan.')}">Ganti Foto</button></div></div></div>
        <div class="sdl-profile-form">
          <label>Nama tampilan<input value="${esc(a.displayName)}"></label>
          <label>Email<input type="email" value="${esc(a.email)}"></label>
          <label>Username<input value="${esc(a.username)}" disabled></label>
          <button class="btn primary" data-act="soon:${encodeURIComponent('Mockup statis: perubahan profil tidak disimpan.')}">Simpan Perubahan</button>
        </div>
        <div class="sdl-profile-note">Mengubah email akan mengubah tujuan pengiriman kode OTP. Pada aplikasi asli, perubahan ini mencabut sesi aktif Anda.</div>
      </section>
      <div class="sdl-profile-side">
        <section class="panel sdl-profile-card"><h2>Keamanan Akun</h2><p>Kebijakan yang berlaku untuk akun ini.</p>
          <div class="status-row"><span class="status-light ready"></span><div><strong>OTP email aktif</strong><small>Kode enam digit berlaku lima menit, maksimal lima percobaan.</small></div></div>
          <div class="status-row"><span class="status-light ready"></span><div><strong>CAPTCHA proof-of-work</strong><small>Diselesaikan di perangkat, tanpa layanan pihak ketiga.</small></div></div>
          <div class="status-row"><span class="status-light"></span><div><strong>Rotasi password</strong><small>Minimal 14 karakter. Password lama tidak dapat dipulihkan.</small></div></div>
        </section>
        <section class="panel sdl-profile-card"><h2>Peran &amp; Unit</h2><p>Hak akses yang melekat pada akun peraga ini.</p>
          <div class="dm-tags">${a.roles.map((r) => `<code>${esc(r)}</code>`).join('')}${a.units.map((x) => `<code>${esc(x)}</code>`).join('')}</div>
          <div class="sdl-profile-note">Role tidak otomatis membuka seluruh dokumen unit. Setiap permintaan tetap diperiksa terhadap unit, cakupan, dan klasifikasi dokumen.</div>
        </section>
      </div>
    </div></div>`
}
function roadmapView() {
  const mark = { done: ['green', 'Selesai'], progress: ['amber', 'Berjalan'], planned: ['neutral', 'Rencana'] }
  return `<div class="page-heading"><span class="eyebrow">ROADMAP</span><h1>Roadmap Pengembangan</h1><p>Progres modul dan layanan SIERA DELTA LIMA.</p></div>
  <div class="bottom-grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
    ${ROADMAP.map((g) => `<section class="panel lower-panel"><div class="panel-title"><div><h3>${esc(g.group)}</h3><p>${g.items.filter((i) => i[1] === 'done').length} dari ${g.items.length} selesai</p></div></div>
      ${g.items.map(([label, st]) => `<div class="next-step"><div><strong>${esc(label)}</strong></div><span class="pill ${mark[st][0]}">${mark[st][1]}</span></div>`).join('')}</section>`).join('')}
  </div>`
}
function securityView() {
  const rules = [
    ['lock', 'Deny by default', 'Endpoint dan data ditolak bila tidak ada permission eksplisit.'],
    ['users', 'Akses sesuai unit', 'Role tidak otomatis membuka data dari seluruh unit kerja.'],
    ['shield', 'Superadmin terbatas', 'Administrasi sistem tidak identik dengan hak membaca seluruh dokumen.'],
    ['list', 'Audit terukur', 'Perubahan user, role, session, dan dokumen tercatat sesuai hak akses.']
  ]
  return `<div class="page-heading"><span class="eyebrow">SECURITY &amp; ACCESS</span><h1>Kewenangan &amp; RBAC</h1><p>Kelola kewenangan dan akses pengguna.</p></div>
  <div class="metric-grid">
    <div class="metric-card"><div class="metric-top"><span>Master Unit</span><span class="metric-icon">${icon('layers')}</span></div><div class="metric-value">4</div><div class="metric-hint">Terdaftar dalam migrasi awal</div></div>
    <div class="metric-card"><div class="metric-top"><span>Role Aktif</span><span class="metric-icon">${icon('users')}</span></div><div class="metric-value">${ADMIN_ROLES.filter((r) => r.active).length}</div><div class="metric-hint">Dari ${ADMIN_ROLES.length} role tersimpan</div></div>
    <div class="metric-card"><div class="metric-top"><span>Akun Aktif</span><span class="metric-icon">${icon('lock')}</span></div><div class="metric-value">${ADMIN_USERS.filter((u) => u.active).length}</div><div class="metric-hint">Termasuk akun terlindungi</div></div>
    <div class="metric-card"><div class="metric-top"><span>Event Audit</span><span class="metric-icon">${icon('shield')}</span></div><div class="metric-value">${AUDIT_EVENTS.length}</div><div class="metric-hint">Pada data peraga</div></div>
  </div>
  <section class="panel security-panel"><div class="panel-title"><div><h3>Aturan akses yang wajib diterapkan</h3><p>Desain kebijakan. Ini belum merupakan hasil audit enforcement.</p></div><span class="pill amber">Pengaturan akses</span></div>
    <div class="rule-grid">${rules.map(([ic, title, text]) => `<div class="rule"><span>${icon(ic)}</span><strong>${esc(title)}</strong><p>${esc(text)}</p></div>`).join('')}</div></section>`
}

/* =========================================================
   20. Mulai
   ========================================================= */
render()
