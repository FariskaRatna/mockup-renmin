/* SIERA DELTA LIMA — mockup statis.
   SELURUH ISI FILE INI ADALAH DATA KARANGAN.
   Tidak ada nama personel, nomor naskah dinas, instansi, atau alamat nyata di sini.
   Dipakai hanya untuk memperagakan tampilan antarmuka tanpa backend. */

/* ---------- waktu relatif supaya mockup selalu terlihat "hidup" ---------- */
const TODAY = new Date()
const dayISO = (off) => { const t = new Date(TODAY); t.setDate(t.getDate() + off); return t.toISOString().slice(0, 10) }
const stamp = (off, h = 9, m = 15) => { const t = new Date(TODAY); t.setDate(t.getDate() + off); t.setHours(h, m, 0, 0); return t.toISOString() }

/* ---------- ikon (dipindahkan apa adanya dari src/App.tsx) ---------- */
const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  inbox: '<path d="M4 4h16l2 10v6H2v-6z"/><path d="M2 14h6l2 3h4l2-3h6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/>',
  clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6m-6 4h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18"/>',
  archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v12h14V9m-10 4h6"/>',
  chart: '<path d="M4 20V4m0 16h17M8 16l4-5 3 2 5-7"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-3-5"/>',
  book: '<path d="M3 5a3 3 0 0 1 3-3h15v18H6a3 3 0 0 0-3 3zM3 5v15a3 3 0 0 1 3-3h15"/>',
  file: '<path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6m-6 4h6"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  shield: '<path d="m12 2 9 4v6c0 6-4 9-9 11-5-2-9-5-9-11V6z"/><path d="m9 12 2 2 4-4"/>',
  folder: '<path d="M3 5h7l2 2h9v13H3z"/>',
  package: '<path d="m12 2 9 5-9 5-9-5zM3 7v10l9 5 9-5V7M12 12v10"/>',
  wrench: '<path d="M15 4a6 6 0 0 0-7 8l-5 5a3 3 0 0 0 4 4l5-5a6 6 0 0 0 8-7l-5 5-4-4z"/>',
  graduation: '<path d="m2 9 10-5 10 5-10 5zM6 11v6c3 3 9 3 12 0v-6M22 9v8"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M5 5 19 19M19 5 5 19"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19"/>',
  moon: '<path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 22c0-5 3-8 8-8s8 3 8 8"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2 6M20 4v7h-7"/>',
  activity: '<path d="M2 12h4l3-7 5 14 3-7h5"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7"/><circle cx="12" cy="12" r="3"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
  external: '<path d="M13 4h7v7M20 4l-9 9M20 14v6H4V4h6"/>',
  key: '<circle cx="8" cy="15" r="5"/><path d="m12 11 9-9m-4 4 3 3m-6 0 3 3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  news: '<path d="M5 3h14v17a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V7h3zM5 17v2a1 1 0 0 1-2 0"/><path d="M9 7h6v4H9zM9 15h6m-6 3h6"/>'
}

/* ---------- unit & modul (struktur sama dengan src/App.tsx) ---------- */
const UNITS = [
  {
    id: 'urmin', title: 'URMIN', name: 'Urusan Administrasi',
    subtitle: 'Layanan administrasi umum dan tata persuratan internal',
    description: 'Persuratan, disposisi, dokumentasi, kearsipan, rapat dan dukungan administrasi umum.',
    icon: 'inbox', accent: '#2b9a80', soft: '#e7f7f1',
    modules: [
      { id: 'surat-masuk', title: 'Surat Masuk', icon: 'inbox', description: 'Register dan monitoring naskah dinas yang diterima.', columns: ['Nomor Agenda', 'Nomor Surat', 'Asal Surat', 'Tanggal', 'Status'] },
      { id: 'surat-keluar', title: 'Surat Keluar', icon: 'send', description: 'Draft, penelaahan, persetujuan dan pengiriman surat.', columns: ['Nomor Agenda', 'Nomor Surat', 'Tujuan', 'Tanggal', 'Status'] },
      { id: 'disposisi', title: 'Disposisi & Tindak Lanjut', icon: 'clipboard', description: 'Arahan pimpinan dan monitoring tindak lanjut.', columns: ['Referensi', 'Pemberi Arahan', 'Tujuan', 'Tenggat', 'Status'] },
      { id: 'agenda', title: 'Agenda & Rapat', icon: 'calendar', description: 'Rapat, undangan, notulen dan tindak lanjut.', columns: ['Agenda', 'Tanggal', 'Waktu', 'Lokasi', 'Status'] },
      { id: 'arsip', title: 'Arsip & Dokumentasi', icon: 'archive', description: 'Register arsip, retensi dan lokasi penyimpanan.', columns: ['Kode Arsip', 'Jenis', 'Lokasi', 'Tanggal', 'Akses'] }
    ]
  },
  {
    id: 'ren', title: 'SUBBAGREN', name: 'Subbagian Perencanaan',
    subtitle: 'Perencanaan, program dan pengendalian kinerja',
    description: 'Renstra/Renja/RKA-KL, pengelolaan usulan, anggaran dan laporan kinerja.',
    icon: 'chart', accent: '#4b78ba', soft: '#edf3ff',
    modules: [
      { id: 'perencanaan', title: 'Dokumen Perencanaan', icon: 'file', description: 'Renstra, Renja, RKA-KL, DIPA, TOR/KAK dan RAB.', columns: ['Dokumen', 'Tahun', 'Referensi', 'Koordinator', 'Status'] },
      { id: 'program', title: 'Program & Anggaran', icon: 'layers', description: 'Register program, pagu dan target kegiatan.', columns: ['Kode', 'Tahun', 'Pagu', 'PIC', 'Status'] },
      { id: 'realisasi', title: 'Realisasi Anggaran (LRA)', icon: 'chart', description: 'Realisasi, penyerapan dan tindak lanjut deviasi.', columns: ['Program', 'Periode', 'Pagu', 'Realisasi', 'Status'] },
      { id: 'kinerja', title: 'Monitoring Kinerja & LKIP', icon: 'target', description: 'Indikator, target, capaian dan evaluasi program.', columns: ['Indikator', 'Periode', 'Target', 'Realisasi', 'Status'] },
      { id: 'usulan', title: 'Usulan Kebutuhan', icon: 'clipboard', description: 'Kompilasi usulan kebutuhan dan anggaran.', columns: ['Nomor', 'Unit Pengusul', 'Tahun', 'Estimasi', 'Status'] }
    ]
  },
  {
    id: 'sumda', title: 'SUBBAGSUMDA', name: 'Subbagian Sumber Daya',
    subtitle: 'Administrasi personel dan pengelolaan logistik',
    description: 'Administrasi SDM, layanan kepegawaian, pendidikan, BMN dan pemeliharaan.',
    icon: 'users', accent: '#956db9', soft: '#f3effd',
    modules: [
      { id: 'personel', title: 'Data Administrasi Personel', icon: 'users', description: 'Register administrasi personel.', columns: ['ID Internal', 'Personel', 'Kategori', 'Unit', 'Status'] },
      { id: 'layanan', title: 'Pelayanan Kepegawaian', icon: 'file', description: 'Tracking cuti, UKP, KGB, mutasi, pensiun.', columns: ['Pemohon', 'Layanan', 'Tanggal', 'Target', 'Status'] },
      { id: 'pendidikan', title: 'Pendidikan & Pengembangan SDM', icon: 'graduation', description: 'Pendidikan, pelatihan dan kompetensi.', columns: ['Jenis', 'Peserta', 'Tanggal', 'Penyelenggara', 'Status'] },
      { id: 'inventaris', title: 'Inventaris & BMN', icon: 'package', description: 'Barang milik negara, kondisi dan penanggung jawab.', columns: ['Kode Aset', 'Kategori', 'Kondisi', 'Lokasi', 'Status'] },
      { id: 'pemeliharaan', title: 'Pemeliharaan Logistik', icon: 'wrench', description: 'Permohonan dan monitoring pemeliharaan.', columns: ['Aset', 'Tindakan', 'Tanggal', 'Target', 'Status'] }
    ]
  },
  {
    id: 'binfung', title: 'SUBBAGBINFUNG', name: 'Subbagian Pembinaan Fungsi',
    subtitle: 'Tata kelola, sistem, metode dan evaluasi organisasi',
    description: 'SOP dan regulasi, PID, RB, SPIP serta Analisis Beban Kerja.',
    icon: 'book', accent: '#ca9250', soft: '#fcf4e9',
    modules: [
      { id: 'sop', title: 'SOP, Regulasi & Metode', icon: 'book', description: 'Register SOP, sistem, metode dan regulasi.', columns: ['Kode', 'Jenis', 'Versi', 'Pemilik Proses', 'Status'] },
      { id: 'pid', title: 'Informasi & Dokumentasi (PID)', icon: 'folder', description: 'Pengelolaan informasi dan dokumentasi.', columns: ['Register', 'Kategori', 'Akses', 'Tanggal', 'Status'] },
      { id: 'rb', title: 'Reformasi Birokrasi & SPIP', icon: 'shield', description: 'Rencana aksi, eviden, SPIP, PMPRB dan LKE.', columns: ['Area', 'Periode', 'Target', 'Capaian', 'Status'] },
      { id: 'abk', title: 'Analisis Beban Kerja (ABK)', icon: 'layers', description: 'Volume kerja dan analisis kebutuhan organisasi.', columns: ['Unit', 'Periode', 'Volume', 'Kebutuhan', 'Status'] },
      { id: 'pembinaan', title: 'Program Pembinaan Fungsi', icon: 'users', description: 'Kegiatan pembinaan, sasaran, waktu, peserta dan hasil.', columns: ['Kode', 'Kegiatan', 'Tanggal', 'PIC', 'Hasil'] },
      { id: 'evaluasi', title: 'Pembinaan & Evaluasi Organisasi', icon: 'target', description: 'Monitoring pembinaan fungsi dan rekomendasi.', columns: ['Evaluasi', 'Tanggal', 'Tenggat', 'PIC', 'Status'] }
    ]
  }
]

const URMIN_NAV = [
  { id: '', label: 'Dashboard', icon: 'grid' },
  { id: 'surat-masuk', label: 'Surat Masuk', icon: 'inbox' },
  { id: 'surat-keluar', label: 'Surat Keluar', icon: 'send' },
  { id: 'disposisi', label: 'Disposisi', icon: 'clipboard' },
  { id: '__unitwork', label: 'Berkas Kerja', icon: 'folder' },
  { id: 'agenda', label: 'Agenda & Rapat', icon: 'calendar' },
  { id: 'arsip', label: 'Arsip', icon: 'archive' }
]
const URMIN_TABS = {
  'surat-masuk': [{ id: 'daftar', label: 'Daftar Surat' }, { id: 'inbox', label: 'Inbox' }, { id: 'riwayat', label: 'Riwayat Penerimaan' }],
  'disposisi': [{ id: 'mine', label: 'Tugas Saya' }, { id: 'issued', label: 'Diberikan' }, { id: 'review', label: 'Perlu Review' }, { id: 'history', label: 'Riwayat' }],
  '__admin': [{ id: 'users', label: 'Pengguna' }, { id: 'roles', label: 'Role & Akses' }, { id: 'security', label: 'Kewenangan' }]
}
const DEFAULT_URMIN_TAB = { 'surat-masuk': 'daftar', 'disposisi': 'mine', '__admin': 'users' }

/* ---------- akun peraga (semua fiktif) ---------- */
const DEMO_ACCOUNTS = [
  { id: 'u-001', username: 'operator.urmin', email: 'operator.urmin@contoh.test', displayName: 'Bayu Kertanegara', roles: ['operator'], units: ['urmin'], primaryUnit: 'urmin', jabatan: 'Operator Persuratan URMIN', note: 'Akun operasional biasa — lihat alur surat masuk & disposisi.' },
  { id: 'u-002', username: 'kabag.renmin', email: 'kabag.renmin@contoh.test', displayName: 'Laksmi Prawirahardja', roles: ['leader'], units: ['urmin', 'ren', 'sumda', 'binfung'], primaryUnit: 'urmin', jabatan: 'Kepala Bagian (peraga)', note: 'Melihat dashboard eksekutif dan arahan lintas unit.' },
  { id: 'u-000', username: 'superadmin', email: 'superadmin@contoh.test', displayName: 'Administrator Identitas', roles: ['superadmin'], units: [], primaryUnit: '', jabatan: 'Pengelola identitas', note: 'Tidak boleh masuk ruang kerja operasional — hanya kelola akun & role.' }
]

/* ---------- surat masuk ---------- */
const WORKFLOW_LABELS = {
  draft: 'Draft', recorded: 'Tercatat · Tanpa Disposisi', awaiting_kabag: 'Menunggu Disposisi Kabag',
  dispatched: 'Sudah Didistribusikan', in_progress: 'Dalam Tindak Lanjut', awaiting_review: 'Menunggu Review'
}
const SURAT_MASUK = [
  { id: 'sm-01', agendaNo: 184, letterNumber: 'B/412/IX/2026/DKI-HRP', sender: 'Dinas Komunikasi dan Informatika Kota Harapan', letterDate: dayISO(-3), receivedDate: dayISO(-2), subject: 'Undangan rapat koordinasi tata kelola data lintas instansi triwulan IV', classification: 'penting', status: 'registered', workflow: 'dispatched', letterKind: 'undangan', responseDue: dayISO(2), eventStart: dayISO(4) + 'T09:00', eventLocation: 'Aula Lantai 3, Gedung Serbaguna Harapan', version: 3, createdAt: stamp(-2, 8, 30), attachments: 2 },
  { id: 'sm-02', agendaNo: 183, letterNumber: 'B/0219/IX/2026/LSN', sender: 'Lembaga Sandi Nusantara', letterDate: dayISO(-5), receivedDate: dayISO(-4), subject: 'Permintaan data dukung penyusunan laporan interoperabilitas sistem internal', classification: 'penting', status: 'registered', workflow: 'in_progress', letterKind: 'permintaan', responseDue: dayISO(-1), eventStart: '', eventLocation: '', version: 4, createdAt: stamp(-4, 10, 5), attachments: 3 },
  { id: 'sm-03', agendaNo: 182, letterNumber: 'B/77/IX/2026/BPAW-IV', sender: 'Balai Pendidikan Aparatur Wilayah IV', letterDate: dayISO(-7), receivedDate: dayISO(-6), subject: 'Pemberitahuan jadwal pelatihan manajemen kearsipan digital angkatan 12', classification: 'biasa', status: 'registered', workflow: 'recorded', letterKind: 'pemberitahuan', responseDue: '', eventStart: dayISO(11) + 'T08:00', eventLocation: 'Kampus Balai Pendidikan Wilayah IV', version: 2, createdAt: stamp(-6, 13, 40), attachments: 1 },
  { id: 'sm-04', agendaNo: 181, letterNumber: 'B/1003/VIII/2026/FKD', sender: 'Sekretariat Forum Koordinasi Daerah', letterDate: dayISO(-9), receivedDate: dayISO(-9), subject: 'Undangan pembahasan rencana kerja bersama tahun anggaran berikutnya', classification: 'biasa', status: 'registered', workflow: 'awaiting_kabag', letterKind: 'undangan', responseDue: dayISO(1), eventStart: dayISO(6) + 'T13:30', eventLocation: 'Ruang Rapat Utama Sekretariat FKD', version: 2, createdAt: stamp(-9, 9, 0), attachments: 2 },
  { id: 'sm-05', agendaNo: 180, letterNumber: 'B/558/VIII/2026/PDT-NP', sender: 'Pusat Data Terpadu Provinsi Nusa Permai', letterDate: dayISO(-12), receivedDate: dayISO(-11), subject: 'Permintaan klarifikasi format pertukaran dokumen elektronik antar unit', classification: 'biasa', status: 'registered', workflow: 'awaiting_review', letterKind: 'permintaan', responseDue: dayISO(-3), eventStart: '', eventLocation: '', version: 5, createdAt: stamp(-11, 15, 20), attachments: 4 },
  { id: 'sm-06', agendaNo: 179, letterNumber: 'B/34/VIII/2026/KPA-MW', sender: 'Koperasi Pegawai Aparatur Mandiri Wijaya', letterDate: dayISO(-15), receivedDate: dayISO(-15), subject: 'Pemberitahuan perubahan jadwal layanan administrasi anggota', classification: 'biasa', status: 'draft', workflow: 'draft', letterKind: 'lainnya', responseDue: '', eventStart: '', eventLocation: '', version: 1, createdAt: stamp(-15, 11, 10), attachments: 0 },
  { id: 'sm-07', agendaNo: 178, letterNumber: 'B/902/VII/2026/IPN', sender: 'Inspektorat Pembinaan Nusantara', letterDate: dayISO(-21), receivedDate: dayISO(-20), subject: 'Tindak lanjut hasil evaluasi tata kelola dokumen semester pertama', classification: 'penting', status: 'registered', workflow: 'recorded', letterKind: 'lainnya', responseDue: '', eventStart: '', eventLocation: '', version: 2, createdAt: stamp(-20, 14, 0), attachments: 5 },
  { id: 'sm-08', agendaNo: 177, letterNumber: 'B/141/VII/2026/UPB', sender: 'Unit Pengelola Barang Wilayah Barat', letterDate: dayISO(-26), receivedDate: dayISO(-25), subject: 'Permintaan rekonsiliasi daftar inventaris barang milik negara', classification: 'biasa', status: 'registered', workflow: 'in_progress', letterKind: 'permintaan', responseDue: dayISO(4), eventStart: '', eventLocation: '', version: 3, createdAt: stamp(-25, 9, 45), attachments: 2 }
]
const SURAT_HISTORY = {
  'sm-01': [
    { action: 'created', actor: 'Bayu Kertanegara', at: stamp(-2, 8, 30), version: 1, reason: 'Pencatatan surat undangan rapat koordinasi dari instansi mitra.' },
    { action: 'edited', actor: 'Bayu Kertanegara', at: stamp(-2, 9, 10), version: 2, reason: 'Melengkapi tanggal pelaksanaan dan lokasi kegiatan.' },
    { action: 'registered', actor: 'Laksmi Prawirahardja', at: stamp(-1, 10, 25), version: 3, reason: 'Diteruskan ke Subbagren untuk penyiapan bahan rapat.' }
  ]
}

/* ---------- inbox distribusi ---------- */
const INBOX = [
  { id: 'dist-01', incomingId: 'sm-01', letterNumber: 'B/412/IX/2026/DKI-HRP', subject: 'Undangan rapat koordinasi tata kelola data lintas instansi triwulan IV', from: 'Laksmi Prawirahardja', status: 'sent', sentAt: stamp(-1, 10, 25), note: 'Siapkan bahan paparan dan daftar hadir.' },
  { id: 'dist-02', incomingId: 'sm-04', letterNumber: 'B/1003/VIII/2026/FKD', subject: 'Undangan pembahasan rencana kerja bersama tahun anggaran berikutnya', from: 'Laksmi Prawirahardja', status: 'sent', sentAt: stamp(-2, 16, 5), note: 'Konfirmasi kehadiran sebelum batas waktu.' },
  { id: 'dist-03', incomingId: 'sm-02', letterNumber: 'B/0219/IX/2026/LSN', subject: 'Permintaan data dukung penyusunan laporan interoperabilitas sistem internal', from: 'Laksmi Prawirahardja', status: 'received', sentAt: stamp(-4, 11, 0), note: 'Koordinasi dengan Subbagbinfung.' },
  { id: 'dist-04', incomingId: 'sm-07', letterNumber: 'B/902/VII/2026/IPN', subject: 'Tindak lanjut hasil evaluasi tata kelola dokumen semester pertama', from: 'Laksmi Prawirahardja', status: 'received', sentAt: stamp(-19, 8, 20), note: 'Rekap temuan dan susun rencana aksi.' }
]

/* ---------- disposisi / tugas ---------- */
const TASKS = [
  { id: 'tg-01', incomingId: 'sm-02', letterNumber: 'B/0219/IX/2026/LSN', subject: 'Permintaan data dukung laporan interoperabilitas sistem internal', unit: 'urmin', issuerId: 'u-002', issuerName: 'Laksmi Prawirahardja', assigneeId: 'u-001', assigneeName: 'Bayu Kertanegara', instruction: 'Himpun data dukung dari Subbagbinfung dan susun draft jawaban. Lampirkan rekap format pertukaran dokumen.', dueDate: dayISO(-1), status: 'in_progress', slaStatus: 'overdue', reviewStatus: 'not_ready', completionNote: null, reviewReason: null, createdAt: stamp(-4, 11, 15), version: 3, depth: 0, parentTaskId: null },
  { id: 'tg-02', incomingId: 'sm-01', letterNumber: 'B/412/IX/2026/DKI-HRP', subject: 'Undangan rapat koordinasi tata kelola data lintas instansi', unit: 'urmin', issuerId: 'u-002', issuerName: 'Laksmi Prawirahardja', assigneeId: 'u-001', assigneeName: 'Bayu Kertanegara', instruction: 'Siapkan bahan paparan, daftar hadir, dan konfirmasi kehadiran ke panitia.', dueDate: dayISO(3), status: 'pending', slaStatus: 'on_track', reviewStatus: 'not_ready', completionNote: null, reviewReason: null, createdAt: stamp(-1, 10, 30), version: 1, depth: 0, parentTaskId: null },
  { id: 'tg-03', incomingId: 'sm-05', letterNumber: 'B/558/VIII/2026/PDT-NP', subject: 'Permintaan klarifikasi format pertukaran dokumen elektronik', unit: 'urmin', issuerId: 'u-001', issuerName: 'Bayu Kertanegara', assigneeId: 'u-004', assigneeName: 'Darmawan Sutejo', instruction: 'Susun ringkasan format yang dipakai saat ini beserta rencana penyesuaian.', dueDate: dayISO(-3), status: 'completed', slaStatus: 'completed_on_time', reviewStatus: 'awaiting_review', completionNote: 'Ringkasan format sudah disusun dalam tiga halaman beserta tabel perbandingan versi lama dan baru.', reviewReason: null, createdAt: stamp(-11, 15, 40), version: 4, depth: 0, parentTaskId: null },
  { id: 'tg-04', incomingId: 'sm-07', letterNumber: 'B/902/VII/2026/IPN', subject: 'Tindak lanjut hasil evaluasi tata kelola dokumen semester pertama', unit: 'urmin', issuerId: 'u-002', issuerName: 'Laksmi Prawirahardja', assigneeId: 'u-001', assigneeName: 'Bayu Kertanegara', instruction: 'Rekap seluruh temuan evaluasi dan susun rencana aksi per unit.', dueDate: dayISO(-6), status: 'completed', slaStatus: 'completed_late', reviewStatus: 'approved', completionNote: 'Rekap temuan dan rencana aksi sudah dikirim ke masing-masing unit pengampu.', reviewReason: 'Hasil memadai, lanjutkan pemantauan bulanan.', createdAt: stamp(-19, 8, 45), version: 6, depth: 0, parentTaskId: null },
  { id: 'tg-05', incomingId: 'sm-08', letterNumber: 'B/141/VII/2026/UPB', subject: 'Permintaan rekonsiliasi daftar inventaris barang milik negara', unit: 'sumda', issuerId: 'u-002', issuerName: 'Laksmi Prawirahardja', assigneeId: 'u-005', assigneeName: 'Ratna Kusumaningrum', instruction: 'Lakukan rekonsiliasi daftar aset dengan catatan unit pengelola barang.', dueDate: dayISO(4), status: 'in_progress', slaStatus: 'on_track', reviewStatus: 'not_ready', completionNote: null, reviewReason: null, createdAt: stamp(-25, 10, 15), version: 2, depth: 0, parentTaskId: null },
  { id: 'tg-06', incomingId: 'sm-02', letterNumber: 'B/0219/IX/2026/LSN', subject: 'Pengumpulan lampiran teknis dari Subbagbinfung', unit: 'binfung', issuerId: 'u-001', issuerName: 'Bayu Kertanegara', assigneeId: 'u-006', assigneeName: 'Panji Alamsyah', instruction: 'Kirim lampiran teknis format dokumen yang berlaku di unit Anda.', dueDate: dayISO(1), status: 'pending', slaStatus: 'on_track', reviewStatus: 'not_ready', completionNote: null, reviewReason: null, createdAt: stamp(-2, 9, 5), version: 1, depth: 1, parentTaskId: 'tg-01' }
]
const TASK_EVENTS = {
  'tg-01': [
    { action: 'issued', actor: 'Laksmi Prawirahardja', at: stamp(-4, 11, 15), reason: 'Disposisi diberikan setelah surat diterima dari Lembaga Sandi Nusantara.' },
    { action: 'accepted', actor: 'Bayu Kertanegara', at: stamp(-4, 13, 2), reason: 'Tugas diterima, mulai menghubungi unit terkait.' },
    { action: 'forwarded', actor: 'Bayu Kertanegara', at: stamp(-2, 9, 5), reason: 'Sebagian pekerjaan diteruskan ke Subbagbinfung untuk lampiran teknis.' }
  ],
  'tg-03': [
    { action: 'issued', actor: 'Bayu Kertanegara', at: stamp(-11, 15, 40), reason: 'Perlu ringkasan format dokumen untuk menjawab surat.' },
    { action: 'accepted', actor: 'Darmawan Sutejo', at: stamp(-10, 8, 30), reason: 'Tugas diterima.' },
    { action: 'completed', actor: 'Darmawan Sutejo', at: stamp(-4, 16, 10), reason: 'Ringkasan selesai disusun dan dilampirkan.' }
  ]
}

/* ---------- berkas kerja (unit work) ---------- */
const BERKAS = {
  urmin: [
    { id: 'bk-u1', category: 'Naskah Dinas', title: 'Berkas pendukung rapat koordinasi triwulan IV', classification: 'penting', createdAt: stamp(-2, 9, 0), description: 'Kumpulan bahan paparan, daftar hadir dan notulen sementara untuk rapat koordinasi lintas instansi.', files: [{ id: 'f1', name: 'bahan-paparan-triwulan-iv.pdf', type: 'PDF', size: 1840, at: stamp(-2, 9, 5) }, { id: 'f2', name: 'daftar-hadir-sementara.pdf', type: 'PDF', size: 240, at: stamp(-2, 9, 7) }, { id: 'f3', name: 'foto-ruang-rapat.jpg', type: 'FOTO', size: 980, at: stamp(-1, 15, 0) }], tasks: [{ id: 't1', toName: 'Darmawan Sutejo', status: 'received', instruction: 'Perbarui daftar hadir dan cetak sebelum hari pelaksanaan.', createdAt: stamp(-2, 9, 20), dueDate: dayISO(3), response: '' }], events: [{ action: 'created', user: 'Bayu Kertanegara', at: stamp(-2, 9, 0), note: 'Berkas dibuat.' }, { action: 'file', user: 'Bayu Kertanegara', at: stamp(-2, 9, 7), note: 'Dua lampiran diunggah.' }, { action: 'task', user: 'Bayu Kertanegara', at: stamp(-2, 9, 20), note: 'Disposisi internal dikirim.' }] },
    { id: 'bk-u2', category: 'Kearsipan', title: 'Rekap retensi arsip semester berjalan', classification: 'biasa', createdAt: stamp(-8, 10, 0), description: 'Daftar arsip yang masuk masa retensi beserta usulan pemindahan lokasi penyimpanan.', files: [{ id: 'f4', name: 'rekap-retensi.pdf', type: 'PDF', size: 620, at: stamp(-8, 10, 12) }], tasks: [], events: [{ action: 'created', user: 'Bayu Kertanegara', at: stamp(-8, 10, 0), note: 'Berkas dibuat.' }] },
    { id: 'bk-u3', category: 'Persuratan', title: 'Konsep jawaban permintaan data dukung', classification: 'penting', createdAt: stamp(-3, 14, 0), description: 'Draft surat jawaban beserta tabel data dukung yang dikumpulkan dari dua unit.', files: [{ id: 'f5', name: 'draft-jawaban-v2.pdf', type: 'PDF', size: 410, at: stamp(-3, 14, 20) }, { id: 'f6', name: 'tabel-data-dukung.pdf', type: 'PDF', size: 1120, at: stamp(-3, 14, 25) }], tasks: [{ id: 't2', toName: 'Panji Alamsyah', status: 'pending', instruction: 'Lengkapi kolom format pertukaran dokumen pada tabel data dukung.', createdAt: stamp(-2, 8, 55), dueDate: dayISO(1), response: '' }], events: [{ action: 'created', user: 'Bayu Kertanegara', at: stamp(-3, 14, 0), note: 'Berkas dibuat.' }] }
  ],
  ren: [
    { id: 'bk-r1', category: 'Perencanaan', title: 'Bahan penyusunan rencana kerja tahun berikutnya', classification: 'penting', createdAt: stamp(-6, 9, 30), description: 'Kompilasi usulan unit beserta estimasi kebutuhan anggaran awal.', files: [{ id: 'f7', name: 'kompilasi-usulan.pdf', type: 'PDF', size: 2210, at: stamp(-6, 9, 40) }], tasks: [], events: [{ action: 'created', user: 'Laksmi Prawirahardja', at: stamp(-6, 9, 30), note: 'Berkas dibuat.' }] },
    { id: 'bk-r2', category: 'Anggaran', title: 'Rekonsiliasi realisasi anggaran triwulan III', classification: 'biasa', createdAt: stamp(-14, 11, 0), description: 'Catatan deviasi penyerapan dan rencana tindak lanjut per program.', files: [], tasks: [], events: [{ action: 'created', user: 'Laksmi Prawirahardja', at: stamp(-14, 11, 0), note: 'Berkas dibuat.' }] }
  ],
  sumda: [
    { id: 'bk-s1', category: 'Kepegawaian', title: 'Berkas usulan kenaikan pangkat periode berjalan', classification: 'penting', createdAt: stamp(-10, 8, 0), description: 'Dokumen usulan beserta kelengkapan administrasi tiap pemohon.', files: [{ id: 'f8', name: 'daftar-usulan.pdf', type: 'PDF', size: 760, at: stamp(-10, 8, 15) }], tasks: [{ id: 't3', toName: 'Ratna Kusumaningrum', status: 'completed', instruction: 'Periksa kelengkapan berkas tiap pemohon.', createdAt: stamp(-10, 8, 30), dueDate: dayISO(-4), response: 'Seluruh berkas lengkap kecuali dua pemohon yang masih menunggu surat keterangan.' }], events: [{ action: 'created', user: 'Ratna Kusumaningrum', at: stamp(-10, 8, 0), note: 'Berkas dibuat.' }] },
    { id: 'bk-s2', category: 'Logistik', title: 'Dokumentasi pemeliharaan perangkat kantor', classification: 'biasa', createdAt: stamp(-4, 13, 0), description: 'Foto kondisi perangkat sebelum dan sesudah pemeliharaan.', files: [{ id: 'f9', name: 'kondisi-sebelum.jpg', type: 'FOTO', size: 1420, at: stamp(-4, 13, 10) }, { id: 'f10', name: 'kondisi-sesudah.jpg', type: 'FOTO', size: 1380, at: stamp(-4, 13, 12) }], tasks: [], events: [{ action: 'created', user: 'Ratna Kusumaningrum', at: stamp(-4, 13, 0), note: 'Berkas dibuat.' }] }
  ],
  binfung: [
    { id: 'bk-b1', category: 'Tata Kelola', title: 'Draft revisi SOP pengelolaan dokumen internal', classification: 'penting', createdAt: stamp(-5, 10, 0), description: 'Revisi SOP menyesuaikan hasil evaluasi tata kelola dokumen.', files: [{ id: 'f11', name: 'draft-sop-rev3.pdf', type: 'PDF', size: 940, at: stamp(-5, 10, 20) }], tasks: [{ id: 't4', toName: 'Panji Alamsyah', status: 'received', instruction: 'Selaraskan pasal 4 dan 7 dengan ketentuan kearsipan terbaru.', createdAt: stamp(-5, 10, 40), dueDate: dayISO(2), response: '' }], events: [{ action: 'created', user: 'Panji Alamsyah', at: stamp(-5, 10, 0), note: 'Berkas dibuat.' }] }
  ]
}

/* ---------- registry per modul ---------- */
const REGISTRY = {
  'urmin:surat-keluar': { code: 'Nomor Surat', name: 'Perihal', items: [
    { id: 'sk-1', code: 'B/231/IX/2026/URM', title: 'Jawaban permintaan data dukung interoperabilitas', info: 'Lembaga Sandi Nusantara · Dikirim', classification: 'penting', createdAt: stamp(-1, 14, 0) },
    { id: 'sk-2', code: 'B/230/IX/2026/URM', title: 'Konfirmasi kehadiran rapat koordinasi triwulan IV', info: 'Dinas Kominfo Kota Harapan · Dikirim', classification: 'biasa', createdAt: stamp(-2, 11, 30) },
    { id: 'sk-3', code: 'B/229/IX/2026/URM', title: 'Permohonan narasumber pelatihan kearsipan digital', info: 'Balai Pendidikan Aparatur Wilayah IV · Draft', classification: 'biasa', createdAt: stamp(-5, 9, 10) },
    { id: 'sk-4', code: 'B/228/VIII/2026/URM', title: 'Pengantar rekap temuan evaluasi tata kelola dokumen', info: 'Inspektorat Pembinaan Nusantara · Dikirim', classification: 'penting', createdAt: stamp(-13, 16, 0) },
    { id: 'sk-5', code: 'B/227/VIII/2026/URM', title: 'Penyampaian daftar inventaris hasil rekonsiliasi', info: 'Unit Pengelola Barang Wilayah Barat · Penelaahan', classification: 'biasa', createdAt: stamp(-18, 10, 45) }
  ]},
  'urmin:arsip': { code: 'Kode Arsip', name: 'Judul Arsip', status: 'Diarsipkan', items: [
    { id: 'ar-1', code: 'ARS/2026/URM/0091', title: 'Berkas korespondensi triwulan III', info: 'Lemari B-04 · Retensi 5 tahun', classification: 'biasa', createdAt: stamp(-30, 9, 0) },
    { id: 'ar-2', code: 'ARS/2026/URM/0090', title: 'Notulen rapat pimpinan semester pertama', info: 'Lemari A-01 · Retensi 10 tahun', classification: 'penting', createdAt: stamp(-45, 9, 0) },
    { id: 'ar-3', code: 'ARS/2026/URM/0089', title: 'Dokumentasi kegiatan pembinaan internal', info: 'Lemari C-07 · Retensi 3 tahun', classification: 'biasa', createdAt: stamp(-60, 9, 0) }
  ]},
  'ren:perencanaan': { code: 'Kode Dokumen', name: 'Dokumen', items: [
    { id: 'pr-1', code: 'RENJA/2027/001', title: 'Rencana kerja tahunan unit BagRenmin', info: 'Tahun 2027 · Penyusunan', classification: 'penting', createdAt: stamp(-6, 9, 0) },
    { id: 'pr-2', code: 'TOR/2027/014', title: 'TOR kegiatan penguatan tata kelola data', info: 'Tahun 2027 · Telaah', classification: 'biasa', createdAt: stamp(-12, 10, 0) },
    { id: 'pr-3', code: 'RAB/2027/014', title: 'RAB kegiatan penguatan tata kelola data', info: 'Tahun 2027 · Telaah', classification: 'biasa', createdAt: stamp(-12, 10, 20) }
  ]},
  'ren:program': { code: 'Kode Program', name: 'Program', items: [
    { id: 'pg-1', code: 'PRG/2026/01', title: 'Penguatan administrasi dan tata naskah', info: 'Pagu Rp 1,2 M · Berjalan', classification: 'biasa', createdAt: stamp(-120, 9, 0) },
    { id: 'pg-2', code: 'PRG/2026/02', title: 'Modernisasi sarana pengolahan data', info: 'Pagu Rp 2,4 M · Berjalan', classification: 'penting', createdAt: stamp(-118, 9, 0) },
    { id: 'pg-3', code: 'PRG/2026/03', title: 'Pengembangan kompetensi personel', info: 'Pagu Rp 850 Jt · Berjalan', classification: 'biasa', createdAt: stamp(-115, 9, 0) }
  ]},
  'ren:realisasi': { code: 'Periode', name: 'Program', items: [
    { id: 'rl-1', code: 'TW-III/2026', title: 'Penguatan administrasi dan tata naskah', info: 'Realisasi 78,4% · Terverifikasi', classification: 'biasa', createdAt: stamp(-20, 9, 0) },
    { id: 'rl-2', code: 'TW-III/2026', title: 'Modernisasi sarana pengolahan data', info: 'Realisasi 61,9% · Terverifikasi', classification: 'biasa', createdAt: stamp(-20, 9, 5) },
    { id: 'rl-3', code: 'TW-III/2026', title: 'Pengembangan kompetensi personel', info: 'Realisasi 44,2% · Menunggu verifikasi', classification: 'biasa', createdAt: stamp(-20, 9, 10) }
  ]},
  'ren:kinerja': { code: 'Kode IKU', name: 'Indikator', status: 'Terpantau', items: [
    { id: 'kj-1', code: 'IKU-01', title: 'Persentase naskah dinas yang terselesaikan tepat waktu', info: 'Target 95% · Capaian 91,3%', classification: 'biasa', createdAt: stamp(-25, 9, 0) },
    { id: 'kj-2', code: 'IKU-02', title: 'Persentase dokumen perencanaan selesai sesuai jadwal', info: 'Target 100% · Capaian 100%', classification: 'biasa', createdAt: stamp(-25, 9, 5) },
    { id: 'kj-3', code: 'IKU-03', title: 'Tingkat kepatuhan pengelolaan arsip', info: 'Target 90% · Capaian 86,5%', classification: 'biasa', createdAt: stamp(-25, 9, 10) }
  ]},
  'ren:usulan': { code: 'Nomor Usulan', name: 'Usulan Kebutuhan', status: 'Diusulkan', items: [
    { id: 'us-1', code: 'USL/2027/URM/004', title: 'Pengadaan pemindai dokumen kecepatan tinggi', info: 'URMIN · Estimasi Rp 180 Jt', classification: 'biasa', createdAt: stamp(-8, 9, 0) },
    { id: 'us-2', code: 'USL/2027/SMD/011', title: 'Peremajaan perangkat kerja personel', info: 'SUBBAGSUMDA · Estimasi Rp 420 Jt', classification: 'biasa', createdAt: stamp(-9, 9, 0) },
    { id: 'us-3', code: 'USL/2027/BFG/003', title: 'Pendampingan penyusunan SOP terintegrasi', info: 'SUBBAGBINFUNG · Estimasi Rp 95 Jt', classification: 'penting', createdAt: stamp(-10, 9, 0) }
  ]},
  'sumda:personel': { code: 'ID Internal', name: 'Nama Personel', status: 'Aktif', items: [
    { id: 'ps-1', code: 'INT-2041', title: 'Ratna Kusumaningrum', info: 'Pengadministrasi Umum · SUBBAGSUMDA', classification: 'biasa', createdAt: stamp(-200, 9, 0) },
    { id: 'ps-2', code: 'INT-2042', title: 'Darmawan Sutejo', info: 'Pengelola Persuratan · URMIN', classification: 'biasa', createdAt: stamp(-198, 9, 0) },
    { id: 'ps-3', code: 'INT-2043', title: 'Panji Alamsyah', info: 'Analis Tata Laksana · SUBBAGBINFUNG', classification: 'penting', createdAt: stamp(-150, 9, 0) },
    { id: 'ps-4', code: 'INT-2044', title: 'Sekar Wulandari', info: 'Analis Perencanaan · SUBBAGREN', classification: 'biasa', createdAt: stamp(-120, 9, 0) },
    { id: 'ps-5', code: 'INT-2045', title: 'Gilang Mahendra', info: 'Pengelola BMN · SUBBAGSUMDA', classification: 'biasa', createdAt: stamp(-90, 9, 0) }
  ]},
  'sumda:layanan': { code: 'Nomor Layanan', name: 'Jenis Layanan', items: [
    { id: 'ly-1', code: 'LYN/2026/0312', title: 'Permohonan cuti tahunan', info: 'Sekar Wulandari · Selesai', classification: 'biasa', createdAt: stamp(-14, 9, 0) },
    { id: 'ly-2', code: 'LYN/2026/0313', title: 'Usulan kenaikan pangkat', info: 'Darmawan Sutejo · Dalam proses', classification: 'penting', createdAt: stamp(-10, 9, 0) },
    { id: 'ly-3', code: 'LYN/2026/0314', title: 'Permohonan surat keterangan kerja', info: 'Gilang Mahendra · Selesai', classification: 'biasa', createdAt: stamp(-5, 9, 0) }
  ]},
  'sumda:pendidikan': { code: 'Kode Diklat', name: 'Nama Pendidikan / Pelatihan', status: 'Terjadwal', items: [
    { id: 'pd-1', code: 'DIK/2026/022', title: 'Pelatihan manajemen kearsipan digital', info: 'Balai Pendidikan Aparatur Wilayah IV · ' + dayISO(11), classification: 'biasa', createdAt: stamp(-6, 9, 0) },
    { id: 'pd-2', code: 'DIK/2026/021', title: 'Workshop penyusunan analisis beban kerja', info: 'Internal BagRenmin · ' + dayISO(-20), classification: 'biasa', createdAt: stamp(-28, 9, 0) },
    { id: 'pd-3', code: 'DIK/2026/020', title: 'Pelatihan keamanan informasi dasar', info: 'Lembaga Sandi Nusantara · ' + dayISO(-55), classification: 'penting', createdAt: stamp(-60, 9, 0) }
  ]},
  'sumda:inventaris': { code: 'Kode Aset', name: 'Nama Barang / Aset', status: 'Baik', items: [
    { id: 'iv-1', code: 'BMN/3.05/0117', title: 'Pemindai dokumen duplex', info: 'Peralatan kantor · Ruang Arsip', classification: 'biasa', createdAt: stamp(-300, 9, 0) },
    { id: 'iv-2', code: 'BMN/3.05/0118', title: 'Lemari arsip baja 4 laci', info: 'Mebel · Ruang Arsip', classification: 'biasa', createdAt: stamp(-298, 9, 0) },
    { id: 'iv-3', code: 'BMN/3.10/0042', title: 'Perangkat komputer kerja', info: 'Peralatan TI · Ruang URMIN', classification: 'biasa', createdAt: stamp(-250, 9, 0) },
    { id: 'iv-4', code: 'BMN/3.10/0043', title: 'Proyektor ruang rapat', info: 'Peralatan TI · Aula', classification: 'biasa', createdAt: stamp(-240, 9, 0) }
  ]},
  'sumda:pemeliharaan': { code: 'Nomor Tindakan', name: 'Pemeliharaan', items: [
    { id: 'pm-1', code: 'PML/2026/0088', title: 'Servis berkala pemindai dokumen', info: 'BMN/3.05/0117 · Selesai', classification: 'biasa', createdAt: stamp(-4, 9, 0) },
    { id: 'pm-2', code: 'PML/2026/0089', title: 'Penggantian lampu proyektor', info: 'BMN/3.10/0043 · Dalam proses', classification: 'biasa', createdAt: stamp(-2, 9, 0) }
  ]},
  'binfung:sop': { code: 'Kode SOP', name: 'Judul SOP / Regulasi', items: [
    { id: 'sp-1', code: 'SOP/URM/004', title: 'Pengelolaan dokumen internal', info: 'Versi 3 · Revisi', classification: 'penting', createdAt: stamp(-5, 9, 0) },
    { id: 'sp-2', code: 'SOP/URM/002', title: 'Penerimaan dan pencatatan naskah dinas', info: 'Versi 2 · Berlaku', classification: 'biasa', createdAt: stamp(-200, 9, 0) },
    { id: 'sp-3', code: 'SOP/SMD/001', title: 'Pengelolaan barang milik negara', info: 'Versi 1 · Berlaku', classification: 'biasa', createdAt: stamp(-320, 9, 0) }
  ]},
  'binfung:pid': { code: 'Nomor Register', name: 'Informasi & Dokumentasi', items: [
    { id: 'pi-1', code: 'PID/2026/017', title: 'Daftar informasi publik unit', info: 'Terbuka · Diperbarui', classification: 'biasa', createdAt: stamp(-18, 9, 0) },
    { id: 'pi-2', code: 'PID/2026/018', title: 'Dokumentasi kegiatan pembinaan triwulan III', info: 'Terbatas · Diperbarui', classification: 'penting', createdAt: stamp(-16, 9, 0) }
  ]},
  'binfung:rb': { code: 'Area Perubahan', name: 'Rencana Aksi', status: 'Berjalan', items: [
    { id: 'rb-1', code: 'RB-01', title: 'Penataan tata laksana dokumen', info: 'Target 100% · Capaian 72%', classification: 'biasa', createdAt: stamp(-40, 9, 0) },
    { id: 'rb-2', code: 'RB-04', title: 'Penguatan pengawasan internal', info: 'Target 100% · Capaian 85%', classification: 'penting', createdAt: stamp(-40, 9, 5) },
    { id: 'rb-3', code: 'SPIP-02', title: 'Penilaian risiko kegiatan utama', info: 'Target 100% · Capaian 64%', classification: 'biasa', createdAt: stamp(-35, 9, 0) }
  ]},
  'binfung:abk': { code: 'Unit', name: 'Analisis Beban Kerja', status: 'Tersusun', items: [
    { id: 'ab-1', code: 'ABK/URM', title: 'Analisis beban kerja URMIN', info: 'Volume 12.480 · Kebutuhan 9 personel', classification: 'biasa', createdAt: stamp(-50, 9, 0) },
    { id: 'ab-2', code: 'ABK/SMD', title: 'Analisis beban kerja SUBBAGSUMDA', info: 'Volume 9.120 · Kebutuhan 7 personel', classification: 'biasa', createdAt: stamp(-50, 9, 5) },
    { id: 'ab-3', code: 'ABK/REN', title: 'Analisis beban kerja SUBBAGREN', info: 'Volume 7.640 · Kebutuhan 6 personel', classification: 'biasa', createdAt: stamp(-50, 9, 10) }
  ]},
  'binfung:pembinaan': { code: 'Kode Kegiatan', name: 'Program Pembinaan', status: 'Terlaksana', items: [
    { id: 'pb-1', code: 'BIN/2026/011', title: 'Pembinaan tata naskah dinas untuk operator unit', info: 'PIC Panji Alamsyah · ' + dayISO(-12), classification: 'biasa', createdAt: stamp(-12, 9, 0) },
    { id: 'pb-2', code: 'BIN/2026/012', title: 'Sosialisasi SOP pengelolaan dokumen revisi 3', info: 'PIC Panji Alamsyah · ' + dayISO(7), classification: 'biasa', createdAt: stamp(-3, 9, 0) }
  ]},
  'binfung:evaluasi': { code: 'Kode Evaluasi', name: 'Evaluasi Organisasi', items: [
    { id: 'ev-1', code: 'EVL/2026/005', title: 'Evaluasi tata kelola dokumen semester pertama', info: 'Tenggat ' + dayISO(5) + ' · Dalam proses', classification: 'penting', createdAt: stamp(-20, 9, 0) },
    { id: 'ev-2', code: 'EVL/2026/004', title: 'Evaluasi penerapan SOP persuratan', info: 'Tenggat ' + dayISO(-30) + ' · Selesai', classification: 'biasa', createdAt: stamp(-70, 9, 0) }
  ]}
}

/* ---------- agenda ---------- */
const AGENDA = [
  { id: 'ag-1', title: 'Rapat koordinasi tata kelola data', tanggal: dayISO(4), waktu: '09:00', lokasi: 'Aula Lantai 3', penyelenggara: 'Dinas Kominfo Kota Harapan', peserta: 'Perwakilan BagRenmin', status: 'Direncanakan' },
  { id: 'ag-2', title: 'Pembahasan rencana kerja bersama', tanggal: dayISO(6), waktu: '13:30', lokasi: 'Ruang Rapat Utama', penyelenggara: 'Sekretariat FKD', peserta: 'Subbagren, Urmin', status: 'Direncanakan' },
  { id: 'ag-3', title: 'Rapat internal pimpinan BagRenmin', tanggal: dayISO(1), waktu: '08:30', lokasi: 'Ruang Pimpinan', penyelenggara: 'BagRenmin', peserta: 'Seluruh kepala subbagian', status: 'Direncanakan' },
  { id: 'ag-4', title: 'Sosialisasi SOP pengelolaan dokumen', tanggal: dayISO(7), waktu: '10:00', lokasi: 'Ruang Serbaguna', penyelenggara: 'Subbagbinfung', peserta: 'Operator seluruh unit', status: 'Direncanakan' },
  { id: 'ag-5', title: 'Pelatihan manajemen kearsipan digital', tanggal: dayISO(11), waktu: '08:00', lokasi: 'Kampus Balai Wilayah IV', penyelenggara: 'Balai Pendidikan Aparatur', peserta: '3 personel URMIN', status: 'Direncanakan' },
  { id: 'ag-6', title: 'Rekonsiliasi daftar inventaris', tanggal: dayISO(-3), waktu: '14:00', lokasi: 'Ruang Subbagsumda', penyelenggara: 'Subbagsumda', peserta: 'Pengelola BMN', status: 'Selesai' },
  { id: 'ag-7', title: 'Evaluasi penyerapan anggaran triwulan', tanggal: dayISO(-6), waktu: '09:00', lokasi: 'Ruang Subbagren', penyelenggara: 'Subbagren', peserta: 'PIC program', status: 'Selesai' },
  { id: 'ag-8', title: 'Gelar perkara administrasi (dibatalkan)', tanggal: dayISO(-1), waktu: '15:00', lokasi: 'Ruang Rapat Kecil', penyelenggara: 'BagRenmin', peserta: '—', status: 'Dibatalkan' }
]

/* ---------- portal (berita, pengumuman, SOP, agenda publik) ---------- */
const POSTS = [
  { id: 'p-1', kind: 'berita', title: 'BagRenmin rampungkan penataan ulang alur naskah dinas internal', summary: 'Penataan alur dilakukan agar setiap naskah punya jejak penerimaan, disposisi dan tindak lanjut yang jelas di satu tempat.', body: 'Penataan ulang alur naskah dinas internal diselesaikan pada akhir triwulan ini. Perubahan utama ada pada pemisahan antara pencatatan surat, pemberian disposisi, dan pemantauan tindak lanjut sehingga setiap tahap punya penanggung jawab yang jelas.\n\nSeluruh unit sudah menerima panduan singkat dan akan mengikuti sosialisasi lanjutan pada minggu berikutnya.', ownerUnit: 'urmin', referenceNo: '', pinned: true, updatedAt: stamp(-2, 10, 0) },
  { id: 'p-2', kind: 'berita', title: 'Pelatihan kearsipan digital angkatan 12 dibuka untuk tiga personel', summary: 'Pendaftaran peserta dikoordinasikan melalui Subbagsumda dengan kuota terbatas.', body: 'Balai Pendidikan Aparatur Wilayah IV membuka pelatihan manajemen kearsipan digital angkatan 12. BagRenmin memperoleh kuota tiga personel yang akan ditetapkan melalui mekanisme usulan unit.', ownerUnit: 'subbagsumda', referenceNo: '', pinned: false, updatedAt: stamp(-5, 9, 0) },
  { id: 'p-3', kind: 'berita', title: 'Rekonsiliasi inventaris semester berjalan selesai lebih cepat', summary: 'Pencocokan daftar aset dengan unit pengelola barang rampung sepuluh hari sebelum tenggat.', body: 'Kegiatan rekonsiliasi inventaris diselesaikan lebih cepat dari jadwal. Selisih pencatatan yang ditemukan sudah ditindaklanjuti melalui berita acara penyesuaian.', ownerUnit: 'subbagsumda', referenceNo: '', pinned: false, updatedAt: stamp(-8, 11, 0) },
  { id: 'p-4', kind: 'berita', title: 'Penyerapan anggaran triwulan III tercatat di atas target minimum', summary: 'Tiga program utama sudah melewati ambang penyerapan yang ditetapkan pada awal tahun.', body: 'Laporan realisasi anggaran triwulan III menunjukkan penyerapan di atas ambang minimum untuk tiga program utama. Deviasi pada satu program sedang ditindaklanjuti bersama PIC terkait.', ownerUnit: 'subbagren', referenceNo: '', pinned: false, updatedAt: stamp(-12, 14, 0) },
  { id: 'p-5', kind: 'pengumuman', title: 'Batas konfirmasi kehadiran rapat koordinasi triwulan IV', summary: 'Konfirmasi paling lambat dua hari sebelum pelaksanaan melalui operator unit masing-masing.', body: 'Seluruh unit diminta menyampaikan konfirmasi kehadiran rapat koordinasi triwulan IV paling lambat dua hari sebelum pelaksanaan. Konfirmasi disampaikan melalui operator persuratan unit masing-masing.', ownerUnit: 'urmin', referenceNo: '', pinned: true, updatedAt: stamp(-1, 8, 0) },
  { id: 'p-6', kind: 'pengumuman', title: 'Penyesuaian jam layanan administrasi pada akhir bulan', summary: 'Layanan administrasi ditutup lebih awal pada dua hari kerja terakhir setiap bulan.', body: 'Untuk kebutuhan penutupan pencatatan bulanan, layanan administrasi ditutup pukul 14.00 pada dua hari kerja terakhir setiap bulan.', ownerUnit: 'subbagsumda', referenceNo: '', pinned: false, updatedAt: stamp(-4, 15, 0) },
  { id: 'p-7', kind: 'sop', title: 'SOP Pengelolaan Dokumen Internal', summary: 'Mengatur pencatatan, klasifikasi, distribusi dan retensi dokumen internal unit.', body: 'SOP ini mengatur tahapan pengelolaan dokumen internal mulai dari pencatatan, penetapan klasifikasi, distribusi antar unit, hingga penetapan masa retensi dan pemusnahan.', ownerUnit: 'subbagbinfung', referenceNo: 'SOP/URM/004 Rev. 3', pinned: false, updatedAt: stamp(-5, 10, 0) },
  { id: 'p-8', kind: 'sop', title: 'SOP Penerimaan dan Pencatatan Naskah Dinas', summary: 'Alur penerimaan surat masuk, penomoran agenda, dan penetapan kebutuhan disposisi.', body: 'SOP ini menjelaskan alur penerimaan naskah dinas, penomoran agenda, penetapan klasifikasi, serta penentuan apakah surat memerlukan disposisi pimpinan.', ownerUnit: 'urmin', referenceNo: 'SOP/URM/002 Rev. 2', pinned: false, updatedAt: stamp(-200, 10, 0) },
  { id: 'p-9', kind: 'peraturan', title: 'Pedoman Klasifikasi Keamanan Dokumen Unit', summary: 'Dasar penetapan klasifikasi biasa dan penting beserta konsekuensi aksesnya.', body: 'Pedoman ini menetapkan kriteria dokumen berklasifikasi biasa dan penting, serta konsekuensi pembatasan akses yang mengikutinya.', ownerUnit: 'subbagbinfung', referenceNo: 'PED/BFG/007', pinned: false, updatedAt: stamp(-90, 10, 0) },
  { id: 'p-10', kind: 'peraturan', title: 'Pedoman Retensi dan Pemusnahan Arsip', summary: 'Masa simpan arsip per kategori dan tata cara pemusnahan.', body: 'Pedoman ini mengatur masa simpan arsip untuk setiap kategori dokumen serta tata cara pemusnahan arsip yang telah melewati masa retensi.', ownerUnit: 'urmin', referenceNo: 'PED/URM/003', pinned: false, updatedAt: stamp(-150, 10, 0) }
]
// agenda portal memakai data AGENDA, diubah ke bentuk post
const PORTAL_AGENDA = AGENDA.filter(a => a.status !== 'Dibatalkan').map(a => ({
  id: 'pa-' + a.id, kind: 'agenda', title: a.title, summary: a.lokasi + ' · ' + a.penyelenggara,
  body: 'Peserta: ' + a.peserta + '. Penyelenggara: ' + a.penyelenggara + '.', ownerUnit: 'urmin',
  referenceNo: '', pinned: false, startsAt: a.tanggal + 'T' + a.waktu, updatedAt: a.tanggal + 'T' + a.waktu
}))

/* ---------- manajemen pengguna & role ---------- */
const ADMIN_UNITS = [
  { key: 'urmin', name: 'Urmin', active: true },
  { key: 'subbagren', name: 'Subbagren', active: true },
  { key: 'subbagsumda', name: 'Subbagsumda', active: true },
  { key: 'subbagbinfung', name: 'Subbagbinfung', active: true }
]
const ADMIN_ROLES = [
  { key: 'superadmin', name: 'Superadmin', description: 'Pengelola identitas dan role. Tidak memiliki akses operasional.', active: true, system: true, version: 1, permissions: ['identity.roles.manage', 'identity.users.manage', 'audit.read'] },
  { key: 'leader', name: 'Pimpinan Unit', description: 'Memberi arahan, menelaah hasil tindak lanjut, dan memantau kinerja unit.', active: true, system: false, version: 4, permissions: ['urmin.surat_masuk.read', 'urmin.surat_masuk.approve', 'urmin.disposisi.read', 'urmin.disposisi.assign', 'urmin.disposisi.approve', 'urmin.arsip.read', 'subbagren.program.read', 'subbagren.realisasi.read', 'subbagsumda.personel.read', 'subbagbinfung.sop.read', 'dashboard.unit.read'] },
  { key: 'operator', name: 'Operator Persuratan', description: 'Mencatat surat masuk/keluar, mengunggah lampiran, dan menindaklanjuti disposisi.', active: true, system: false, version: 7, permissions: ['urmin.surat_masuk.read', 'urmin.surat_masuk.create', 'urmin.surat_masuk.update', 'urmin.surat_masuk.register', 'urmin.surat_keluar.read', 'urmin.surat_keluar.create', 'urmin.disposisi.read', 'urmin.arsip.read', 'urmin.lampiran.download', 'dashboard.unit.read'] },
  { key: 'perencana', name: 'Analis Perencanaan', description: 'Mengelola dokumen perencanaan, program, dan usulan kebutuhan.', active: true, system: false, version: 3, permissions: ['subbagren.perencanaan.read', 'subbagren.perencanaan.create', 'subbagren.perencanaan.update', 'subbagren.program.read', 'subbagren.usulan.read', 'subbagren.usulan.create', 'dashboard.unit.read'] },
  { key: 'pengelola_sdm', name: 'Pengelola Sumber Daya', description: 'Mengelola data personel, layanan kepegawaian, dan inventaris.', active: true, system: false, version: 5, permissions: ['subbagsumda.personel.read', 'subbagsumda.personel.create', 'subbagsumda.personel.update', 'subbagsumda.inventaris.read', 'subbagsumda.inventaris.update', 'dashboard.unit.read'] },
  { key: 'analis_tata_laksana', name: 'Analis Tata Laksana', description: 'Menyusun SOP, mengelola PID, RB/SPIP, dan analisis beban kerja.', active: true, system: false, version: 2, permissions: ['subbagbinfung.sop.read', 'subbagbinfung.sop.create', 'subbagbinfung.sop.update', 'subbagbinfung.pid.read', 'subbagbinfung.rb.read', 'dashboard.unit.read'] },
  { key: 'pembaca_arsip', name: 'Pembaca Arsip', description: 'Akses baca terbatas pada register arsip unit.', active: false, system: false, version: 1, permissions: ['urmin.arsip.read'] }
]
const PERMISSION_CATALOG = [
  { key: 'identity.users.manage', description: 'Membuat, mengubah dan menonaktifkan akun pengguna.' },
  { key: 'identity.roles.manage', description: 'Mengelola definisi role dan izin. Hanya untuk Superadmin.' },
  { key: 'audit.read', description: 'Membaca jejak audit perubahan akun dan akses.' },
  { key: 'urmin.surat_masuk.read', description: 'Melihat daftar dan detail surat masuk sesuai cakupan.' },
  { key: 'urmin.surat_masuk.create', description: 'Membuat draft surat masuk baru.' },
  { key: 'urmin.surat_masuk.update', description: 'Mengubah surat masuk selama masih berstatus draft.' },
  { key: 'urmin.surat_masuk.register', description: 'Mendaftarkan surat masuk sehingga mendapat nomor agenda.' },
  { key: 'urmin.surat_masuk.approve', description: 'Menyetujui pengajuan surat pada status review.' },
  { key: 'urmin.surat_keluar.read', description: 'Melihat register surat keluar.' },
  { key: 'urmin.surat_keluar.create', description: 'Membuat draft surat keluar.' },
  { key: 'urmin.disposisi.read', description: 'Melihat disposisi dan riwayat tindak lanjutnya.' },
  { key: 'urmin.disposisi.assign', description: 'Memberikan disposisi kepada petugas.' },
  { key: 'urmin.disposisi.approve', description: 'Menelaah dan menyetujui hasil tindak lanjut.' },
  { key: 'urmin.arsip.read', description: 'Melihat register arsip dan lokasi penyimpanan.' },
  { key: 'urmin.lampiran.download', description: 'Mengunduh lampiran surat sesuai klasifikasi.' },
  { key: 'subbagren.perencanaan.read', description: 'Melihat dokumen perencanaan unit.' },
  { key: 'subbagren.perencanaan.create', description: 'Menambah dokumen perencanaan.' },
  { key: 'subbagren.perencanaan.update', description: 'Mengubah dokumen perencanaan berstatus draft.' },
  { key: 'subbagren.program.read', description: 'Melihat register program dan pagu.' },
  { key: 'subbagren.realisasi.read', description: 'Melihat realisasi anggaran terverifikasi.' },
  { key: 'subbagren.usulan.read', description: 'Melihat usulan kebutuhan unit.' },
  { key: 'subbagren.usulan.create', description: 'Mengajukan usulan kebutuhan.' },
  { key: 'subbagsumda.personel.read', description: 'Melihat data administrasi personel.' },
  { key: 'subbagsumda.personel.create', description: 'Menambah data administrasi personel.' },
  { key: 'subbagsumda.personel.update', description: 'Mengubah data administrasi personel.' },
  { key: 'subbagsumda.inventaris.read', description: 'Melihat daftar inventaris dan BMN.' },
  { key: 'subbagsumda.inventaris.update', description: 'Memperbarui kondisi dan lokasi aset.' },
  { key: 'subbagbinfung.sop.read', description: 'Melihat register SOP dan regulasi.' },
  { key: 'subbagbinfung.sop.create', description: 'Menyusun SOP atau regulasi baru.' },
  { key: 'subbagbinfung.sop.update', description: 'Merevisi SOP yang berlaku.' },
  { key: 'subbagbinfung.pid.read', description: 'Melihat register informasi dan dokumentasi.' },
  { key: 'subbagbinfung.rb.read', description: 'Melihat rencana aksi RB dan SPIP.' },
  { key: 'dashboard.unit.read', description: 'Melihat ringkasan dan grafik pada dashboard unit.' }
]
const ADMIN_USERS = [
  { id: 'u-000', username: 'superadmin', email: 'superadmin@contoh.test', displayName: 'Administrator Identitas', active: true, protected: true, otpEnabled: true, forcePasswordChange: false, version: 1, primaryUnit: '', grants: [] },
  { id: 'u-002', username: 'kabag.renmin', email: 'kabag.renmin@contoh.test', displayName: 'Laksmi Prawirahardja', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 6, primaryUnit: 'urmin', grants: [{ roleKey: 'leader', unitKey: 'urmin', scope: 'unit', classificationLimit: 'penting', expiresAt: null }, { roleKey: 'leader', unitKey: 'subbagren', scope: 'unit', classificationLimit: 'biasa', expiresAt: null }, { roleKey: 'leader', unitKey: 'subbagsumda', scope: 'unit', classificationLimit: 'biasa', expiresAt: null }] },
  { id: 'u-001', username: 'operator.urmin', email: 'operator.urmin@contoh.test', displayName: 'Bayu Kertanegara', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 9, primaryUnit: 'urmin', grants: [{ roleKey: 'operator', unitKey: 'urmin', scope: 'unit', classificationLimit: 'penting', expiresAt: null }] },
  { id: 'u-004', username: 'darmawan.s', email: 'darmawan.s@contoh.test', displayName: 'Darmawan Sutejo', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 4, primaryUnit: 'urmin', grants: [{ roleKey: 'operator', unitKey: 'urmin', scope: 'assigned', classificationLimit: 'biasa', expiresAt: null }] },
  { id: 'u-005', username: 'ratna.k', email: 'ratna.k@contoh.test', displayName: 'Ratna Kusumaningrum', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 5, primaryUnit: 'subbagsumda', grants: [{ roleKey: 'pengelola_sdm', unitKey: 'subbagsumda', scope: 'unit', classificationLimit: 'penting', expiresAt: null }] },
  { id: 'u-006', username: 'panji.a', email: 'panji.a@contoh.test', displayName: 'Panji Alamsyah', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 3, primaryUnit: 'subbagbinfung', grants: [{ roleKey: 'analis_tata_laksana', unitKey: 'subbagbinfung', scope: 'unit', classificationLimit: 'penting', expiresAt: null }, { roleKey: 'pembaca_arsip', unitKey: 'urmin', scope: 'assigned', classificationLimit: 'biasa', expiresAt: stamp(45, 23, 59) }] },
  { id: 'u-007', username: 'sekar.w', email: 'sekar.w@contoh.test', displayName: 'Sekar Wulandari', active: true, protected: false, otpEnabled: false, forcePasswordChange: false, version: 2, primaryUnit: 'subbagren', grants: [{ roleKey: 'perencana', unitKey: 'subbagren', scope: 'unit', classificationLimit: 'biasa', expiresAt: null }] },
  { id: 'u-008', username: 'gilang.m', email: 'gilang.m@contoh.test', displayName: 'Gilang Mahendra', active: true, protected: false, otpEnabled: true, forcePasswordChange: true, version: 1, primaryUnit: 'subbagsumda', grants: [{ roleKey: 'pengelola_sdm', unitKey: 'subbagsumda', scope: 'own', classificationLimit: 'biasa', expiresAt: null }] },
  { id: 'u-009', username: 'wahyu.p', email: 'wahyu.p@contoh.test', displayName: 'Wahyu Pamungkas', active: false, protected: false, otpEnabled: true, forcePasswordChange: false, version: 8, primaryUnit: 'urmin', grants: [] },
  { id: 'u-010', username: 'intan.r', email: 'intan.r@contoh.test', displayName: 'Intan Rahardjo', active: true, protected: false, otpEnabled: false, forcePasswordChange: false, version: 2, primaryUnit: 'subbagbinfung', grants: [{ roleKey: 'analis_tata_laksana', unitKey: 'subbagbinfung', scope: 'own', classificationLimit: 'biasa', expiresAt: null }] },
  { id: 'u-011', username: 'yoga.s', email: 'yoga.s@contoh.test', displayName: 'Yoga Saputra', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 1, primaryUnit: 'subbagren', grants: [{ roleKey: 'perencana', unitKey: 'subbagren', scope: 'assigned', classificationLimit: 'biasa', expiresAt: null }] },
  { id: 'u-012', username: 'nadia.h', email: 'nadia.h@contoh.test', displayName: 'Nadia Halimah', active: true, protected: false, otpEnabled: true, forcePasswordChange: false, version: 3, primaryUnit: 'urmin', grants: [{ roleKey: 'operator', unitKey: 'urmin', scope: 'own', classificationLimit: 'biasa', expiresAt: null }] }
]
const AUDIT_EVENTS = [
  { id: 9, key: 'user.access.updated', type: 'user', subject: 'panji.a', at: stamp(-1, 9, 12), actor: 'superadmin', reason: 'Penambahan grant baca arsip berbatas waktu.' },
  { id: 8, key: 'role.updated', type: 'role', subject: 'operator', at: stamp(-2, 14, 3), actor: 'superadmin', reason: 'Menambahkan izin unduh lampiran untuk operator.' },
  { id: 7, key: 'user.deactivated', type: 'user', subject: 'wahyu.p', at: stamp(-6, 10, 40), actor: 'superadmin', reason: 'Mutasi keluar unit, akses dicabut.' },
  { id: 6, key: 'user.created', type: 'user', subject: 'nadia.h', at: stamp(-9, 8, 5), actor: 'superadmin', reason: 'Penambahan operator persuratan unit URMIN.' },
  { id: 5, key: 'user.otp.updated', type: 'user', subject: 'sekar.w', at: stamp(-13, 16, 22), actor: 'superadmin', reason: 'Penyesuaian kebijakan OTP sesuai permintaan unit.' },
  { id: 4, key: 'role.created', type: 'role', subject: 'analis_tata_laksana', at: stamp(-25, 11, 0), actor: 'superadmin', reason: 'Pemisahan kewenangan tata laksana dari operator.' },
  { id: 3, key: 'user.access.updated', type: 'user', subject: 'ratna.k', at: stamp(-30, 9, 30), actor: 'superadmin', reason: 'Peningkatan batas klasifikasi menjadi penting.' },
  { id: 2, key: 'role.updated', type: 'role', subject: 'leader', at: stamp(-44, 13, 10), actor: 'superadmin', reason: 'Menambahkan izin telaah hasil disposisi.' },
  { id: 1, key: 'user.created', type: 'user', subject: 'operator.urmin', at: stamp(-120, 10, 0), actor: 'superadmin', reason: 'Akun operasional awal unit URMIN.' }
]

/* ---------- arahan pimpinan ---------- */
const DIRECTIVES = [
  { id: 'dr-1', title: 'Percepat penyelesaian jawaban permintaan data dukung', from: 'Laksmi Prawirahardja', to: 'URMIN · Subbagbinfung', at: stamp(-1, 8, 10), due: dayISO(1), status: 'Berjalan', body: 'Surat permintaan data dukung sudah melewati tenggat respons. Selesaikan konsep jawaban hari ini dan koordinasikan lampiran teknis dengan Subbagbinfung.' },
  { id: 'dr-2', title: 'Siapkan bahan paparan rapat koordinasi triwulan IV', from: 'Laksmi Prawirahardja', to: 'URMIN', at: stamp(-2, 15, 0), due: dayISO(3), status: 'Berjalan', body: 'Bahan paparan memuat ringkasan capaian tata kelola dokumen dan rencana penyesuaian format pertukaran data.' },
  { id: 'dr-3', title: 'Tuntaskan rekonsiliasi inventaris sebelum akhir bulan', from: 'Laksmi Prawirahardja', to: 'SUBBAGSUMDA', at: stamp(-5, 9, 0), due: dayISO(4), status: 'Berjalan', body: 'Pastikan seluruh selisih pencatatan punya berita acara penyesuaian sebelum laporan bulanan disusun.' },
  { id: 'dr-4', title: 'Sosialisasikan SOP pengelolaan dokumen revisi 3', from: 'Laksmi Prawirahardja', to: 'SUBBAGBINFUNG', at: stamp(-8, 10, 30), due: dayISO(7), status: 'Berjalan', body: 'Sosialisasi diikuti seluruh operator unit. Sertakan contoh kasus penetapan klasifikasi.' },
  { id: 'dr-5', title: 'Laporkan deviasi penyerapan program kompetensi personel', from: 'Laksmi Prawirahardja', to: 'SUBBAGREN', at: stamp(-14, 13, 0), due: dayISO(-4), status: 'Selesai', body: 'Deviasi sudah dilaporkan beserta rencana percepatan kegiatan pada triwulan berikutnya.' }
]

/* ---------- roadmap ---------- */
const ROADMAP = [
  { group: 'Identitas & Akses', items: [['Login, CAPTCHA lokal dan OTP email', 'done'], ['Manajemen pengguna dan grant berskop', 'done'], ['Editor role & permission', 'done'], ['Delegasi kewenangan', 'planned']] },
  { group: 'URMIN · Persuratan', items: [['Surat masuk, intake dan lampiran', 'done'], ['Inbox distribusi', 'done'], ['Disposisi berjenjang dan review', 'done'], ['Surat keluar, agenda dan arsip', 'done'], ['Integrasi notifikasi email', 'progress']] },
  { group: 'SUBBAGREN · Perencanaan', items: [['Usulan kebutuhan', 'done'], ['Pagu dan realisasi anggaran', 'done'], ['Dokumen perencanaan', 'progress'], ['Monitoring kinerja & LKIP', 'planned']] },
  { group: 'SUBBAGSUMDA · Sumber daya', items: [['Data personel, pendidikan, inventaris', 'done'], ['Pelayanan kepegawaian', 'planned'], ['Pemeliharaan logistik', 'planned']] },
  { group: 'SUBBAGBINFUNG · Pembinaan fungsi', items: [['SOP, PID, RB/SPIP, ABK', 'done'], ['Program pembinaan dan evaluasi', 'done'], ['Portal informasi internal', 'done']] },
  { group: 'Platform', items: [['Audit trail terpusat', 'done'], ['Dashboard eksekutif', 'done'], ['Migrasi backend Express', 'progress'], ['Arsip digital jangka panjang', 'planned']] }
]
