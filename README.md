# Mockup SIERA DELTA LIMA

Halaman peraga statis dari antarmuka `apps/frontend/`. Dibuat supaya tampilan
aplikasi bisa ditunjukkan ke orang luar **tanpa** membuka backend, database,
atau akun operasional apa pun.

Tidak ada React, tidak ada build step, tidak ada `fetch` ke mana pun. Hanya
HTML + CSS + JavaScript biasa yang dibuka langsung di browser.

---

## Isi folder

| File | Keterangan |
|---|---|
| `index.html` | Satu-satunya halaman; memuat CSS dan dua file JS |
| `reset.css` | Padanan Tailwind preflight (aplikasi asli memakainya lewat `@import "tailwindcss"`) |
| `app.css` | **Salinan apa adanya** 26 file CSS dari `apps/frontend/src/`, digabung sesuai urutan muat Vite |
| `demo.css` | Tambahan khusus mockup: penanda DEMO, pemilih akun peraga, beberapa fallback kecil |
| `mock-data.js` | Seluruh data karangan (surat, disposisi, berkas, akun, role, agenda, portal) |
| `mock-app.js` | Render + navigasi. Meniru struktur markup dan nama kelas komponen React aslinya |
| `vercel.json` | Konfigurasi deploy statis + header `noindex` |

---

## Menjalankan di lokal

Harus lewat HTTP, bukan `file://` (karena file JS dimuat terpisah):

```bash
cd mockup
python -m http.server 8777
# buka http://127.0.0.1:8777
```

Atau `npx serve .`

---

## Deploy ke Vercel

Folder ini sudah siap pakai sebagai static site.

```bash
cd mockup
npx vercel deploy --prod
```

Lewat dashboard Vercel: import repositori, lalu set **Root Directory** ke
`mockup`, Framework Preset **Other**, Build Command dikosongkan.

> Header `X-Robots-Tag: noindex` sudah dipasang di `vercel.json` supaya halaman
> ini tidak masuk hasil pencarian. Itu bukan pembatas akses — siapa pun yang
> punya URL tetap bisa membukanya. Kalau perlu benar-benar tertutup, pakai
> Vercel Password Protection (fitur berbayar) atau Deployment Protection.

---

## Yang bisa diklik

Login (pilih salah satu dari tiga akun peraga) → CAPTCHA → OTP (kode apa pun,
mis. `123456`) → Portal.

```
Portal informasi      Beranda · Berita & Pengumuman · Kalender · SOP & Peraturan
URMIN                 Dashboard · Surat Masuk (daftar/inbox/riwayat + detail)
                      Surat Keluar · Disposisi (4 tab + modal detail)
                      Berkas Kerja (lampiran/tugas/riwayat) · Agenda · Arsip
SUBBAGREN             Dashboard unit + 5 modul
SUBBAGSUMDA           Dashboard unit + 5 modul
SUBBAGBINFUNG         Dashboard unit + 6 modul
Superadmin            User Management · Role & Permission (+ pratinjau akses)
Lainnya               Arahan · Dashboard Pimpinan · Profil · Roadmap · Kewenangan
Global                Mode terang/gelap · navigasi seluler
```

Tiga akun peraga menunjukkan perbedaan hak akses yang sebenarnya memang ada
di aplikasi asli:

| Akun | Yang terlihat |
|---|---|
| `operator.urmin` — Bayu Kertanegara | Ruang kerja operasional URMIN, inbox, disposisi |
| `kabag.renmin` — Laksmi Prawirahardja | Tambahan menu Dashboard pimpinan |
| `superadmin` — Administrator Identitas | **Ditolak** dari seluruh ruang kerja unit; hanya User & Role |

Peran bisa diganti kapan saja lewat menu akun di pojok kanan atas.

Tombol yang bersifat mutasi (tambah surat, unggah lampiran, simpan role,
terima tugas) sengaja hanya memunculkan notifikasi — tidak ada data yang
berubah.

---

## Data

Seluruhnya karangan. Nama personel, nomor naskah dinas, nama instansi
pengirim, alamat email (`*@contoh.test`), kode aset, dan nomor SOP tidak
merujuk ke orang, satuan, atau dokumen mana pun yang nyata.

Tanggal dihitung relatif terhadap hari pembukaan halaman (`dayISO()` /
`stamp()` di `mock-data.js`), jadi kalender dan grafik tren selalu terlihat
aktual tanpa perlu diperbarui.

Branding aplikasi (nama SIERA DELTA LIMA dan subjudul unit) tetap dipakai
karena ini mockup produk sendiri. Lambang resmi **tidak** disertakan —
diganti monogram teks `SDL`.

---

## Menjaga mockup tetap sinkron dengan aplikasi asli

`app.css` adalah salinan mentah. Kalau CSS di `apps/frontend/src/` berubah,
bangun ulang dengan perintah yang sama seperti saat file ini dibuat:

```bash
cd apps/frontend/src
OUT=../../../mockup/app.css
: > "$OUT"
for f in UIFeedback.css PortalV3R5F21.css DirectivesR5F23.css \
         ExecutiveDecisionR5F24.css ExecutiveOverviewR5F8.css MobileNavR5F23C.css \
         PortalRefresh.css WorkspaceConsistency.css UrminNavigationR5F5.css \
         AuthPremiumR5F14.css PortalPremium.css SuratMasukR5F6.css \
         SuratMasukR5F7.css TugasDisposisiR5F3.css UnitWorkR5F4.css \
         LampiranFileCardR5F16.css LampiranPreviewR5F15.css AgendaCalendarR5F17.css \
         ProjectRoadmapR5F19.css SumdaR5B.css BinfungR5C.css UrminR5D.css \
         SuratKeluarR5F9.css SmartUnitDashboard.css UrminCommandDashboard.css; do
  printf '\n/* ======== %s ======== */\n' "$f" >> "$OUT"
  cat "$f" >> "$OUT"
done
printf '\n/* ======== style.css ======== */\n' >> "$OUT"
tail -n +2 style.css >> "$OUT"   # buang baris @import "tailwindcss"
```

Urutannya mengikuti urutan evaluasi modul Vite: seluruh CSS yang di-import
`App.tsx` lebih dulu, `style.css` terakhir. Mengubah urutan akan mengubah
cascade dan merusak sebagian tampilan.

Markup di `mock-app.js` memakai nama kelas yang sama dengan komponen React —
kalau nama kelas di `src/` berubah, bagian terkait di sini ikut perlu
disesuaikan.

---

## Batasan yang disengaja

- Tidak ada routing URL. Semua state di memori; muat ulang halaman mengembalikan ke layar masuk.
- Tidak ada form yang benar-benar menyimpan.
- CAPTCHA hanya animasi 0,9 detik — aplikasi asli memakai proof-of-work SHA-256 lewat `crypto.subtle`, yang butuh secure context.
- Kode OTP tidak diperiksa.
- Pencarian dan filter berjalan di sisi klien atas data karangan, bukan lewat SQL berskop seperti aplikasi asli.
