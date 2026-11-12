# Redesign SIERA DELTA LIMA (mockup)

> **Acuan terbaru: `index.html`** (sebelumnya `fondasi.html`). Bagian 1–6 di bawah mendokumentasikan v3 dan dipertahankan sebagai riwayat keputusan.

Usulan perbaikan antarmuka yang **tetap dekat dengan versi produksi**. Kerangka
yang sudah dikenal pengguna dipertahankan: header putih dengan menu horizontal,
Portal sebagai halaman awal, sidebar navy di ruang kerja, dan tab segmented.
Yang diperbaiki adalah bagian yang melanggar prinsip kegunaan.

```bash
cd mockup && python -m http.server 8777
# produksi (replika) : http://127.0.0.1:8777/
# usulan             : http://127.0.0.1:8777/redesign/
```

| File | Isi |
|---|---|
| `index.html` | **Desain yang disetujui (12 Nov 2026).** Prototipe mandiri 8 halaman: login, Portal, Urmin (dashboard, surat masuk, surat keluar, disposisi), dashboard Subbagren/Subbagsumda/Subbagbinfung, pengguna & role. CSS/JS inline, tanpa aset luar |
| `logo-densus88.png` | Salinan `apps/frontend/public/logo.png` |
| `index-v3.html`, `rd.css`, `rd.js` | **Arsip** redesign v3 (11 Nov) — tidak lagi menjadi acuan. Memakai `../mock-data.js` |

Pintasan presentasi: `?as=u-001` (operator), `?as=u-002` (Kabag), `?as=u-000`
(Superadmin), ditambah `&go=unit:urmin:surat-masuk`, `&open=surat:sm-01`,
`&dlg=sign:sk-6`, `&pal=undangan`, `&theme=dark`.

> **Emblem.** Mockup lama sengaja tidak menyertakan lambang resmi karena folder
> ini disiapkan untuk deploy Vercel publik. Versi ini memakainya atas permintaan
> pemilik. Pertimbangkan Deployment Protection sebelum men-deploy.

---

## 1. Acuan standar

Rujukan yang dipakai adalah prinsip-prinsip yang dinamai dalam seri ISO 9241
(Ergonomics of human-system interaction) dan ISO/IEC 40500. Isi lengkap
standarnya berbayar dan tidak dikutip di sini. Yang dipetakan adalah **nama
prinsipnya** ke keputusan desain yang konkret.

| Standar | Cakupan |
|---|---|
| ISO 9241-11:2018 | Definisi usability: efektivitas, efisiensi, kepuasan dalam konteks penggunaan |
| ISO 9241-110:2020 | Tujuh prinsip interaksi |
| ISO 9241-112:2017 | Prinsip penyajian informasi |
| ISO 9241-125:2017 | Panduan penyajian visual informasi |
| ISO 9241-143:2012 | Formulir |
| ISO 9241-171:2008 | Aksesibilitas perangkat lunak |
| ISO/IEC 40500:2012 | Identik dengan WCAG 2.0 (target: tingkat AA) |
| ISO 9241-210:2019 | Proses desain berpusat pada manusia (mockup → uji pengguna → iterasi) |

### ISO 9241-110 — prinsip interaksi

| Prinsip | Penerapan |
|---|---|
| **Kesesuaian dengan tugas pengguna** | Panel *Perlu tindakan Anda* di Portal: tugas terlambat, disposisi baru, inbox, review, dan TTD dalam satu daftar yang diurutkan berdasarkan urgensi. Aksi di panel detail hanya yang relevan dengan peran dan status (Terima, Laporkan selesai, Setujui, Tanda tangani) |
| **Kejelasan diri** (*self-descriptiveness*) | Stepper tahap di setiap surat dan disposisi; tenggat ditulis "Terlambat 1 hari" atau "Besok", bukan tanggal mentah; indikator "Langkah 1 dari 2" di login; tile unit yang terkunci menyebut alasannya |
| **Sesuai harapan pengguna** | Tata letak produksi dipertahankan. Menu header **tidak lagi muncul-hilang**: Inbox dan Tugas selalu ada, dan di dalam URMIN langsung menuju tab yang sesuai. Bahasa Indonesia seragam (sebelumnya campur "Tasks", "Manage", "Sign Out") |
| **Kemudahan dipelajari** | Pola yang sama di semua modul: toolbar → chip filter dengan jumlah → tabel → panel detail kanan |
| **Kendali pengguna** | Esc menutup lapisan teratas; panel detail tidak menutup daftar; pengalih unit di sidebar (tidak perlu kembali ke Portal); sidebar bisa diciutkan; tema terang/gelap; palet Ctrl+K |
| **Ketahanan terhadap kesalahan** | Validasi sebelum kirim dengan pesan per-field (`aria-invalid`); peringatan Caps Lock; sisa percobaan OTP ditampilkan; konfirmasi yang menjelaskan akibat untuk aksi berisiko (nonaktifkan, reset password, cabut grant); TTD perlu centang persetujuan |
| **Keterlibatan pengguna** | Dicapai lewat kerapian dan kepercayaan (emblem resmi, tipografi tenang), bukan hiasan |

### ISO 9241-112 / -125 — penyajian informasi

| Prinsip | Penerapan |
|---|---|
| **Mudah terdeteksi** | Item terlambat diberi garis kiri merah dan angka merah; badge jumlah di header dan sidebar |
| **Bebas distraksi** | Gradasi, pola grid, kilau, dan monogram emas dihapus. Latar polos, satu warna merek |
| **Mudah dibedakan** | Warna **hanya** untuk makna status. Netral = belum berjalan, biru = sedang berjalan, amber = menunggu keputusan, merah = terlambat/penting, hijau = selesai. Status selalu berupa teks + titik, tidak hanya warna |
| **Tidak ambigu** | Satu istilah untuk satu hal ("Disposisi", bukan Tasks/Tugas/Disposisi bergantian di tempat yang sama) |
| **Ringkas** | Kartu ringkasan 4 angka; judul tabel dipotong dengan elipsis, detail lengkap ada di panel |
| **Konsisten** | Satu lembar gaya dengan token, menggantikan 26 file CSS per rilis yang saling menimpa |

### ISO 9241-143 — formulir
Label selalu terlihat di atas field (bukan hanya placeholder), field wajib
divalidasi saat kirim, pesan galat di dekat field yang bersangkutan, urutan tab
mengikuti urutan visual, dan `autocomplete` yang benar (`username`,
`current-password`, `new-password`, `one-time-code`).

### ISO 9241-171 / ISO/IEC 40500 (WCAG 2.0 AA)

| Kriteria | Penerapan |
|---|---|
| Kontras teks ≥ 4.5:1 | ink 16:1, ink-2 9.6:1, muted `#5b6573` 5.9:1; status merah 6.1:1, hijau 6.0:1, amber 5.8:1 (dihitung terhadap putih) |
| Fokus terlihat | Outline 2px `--focus` dengan offset; putih di atas navy |
| Navigasi keyboard | Skip-link; baris tabel bisa dibuka dengan Enter/Spasi; palet dengan ↑ ↓ Enter; Esc |
| Nama & peran | `aria-current`, `aria-expanded`, `aria-selected`, `role=dialog` + `aria-modal`, `aria-live` untuk status/toast, label pada semua tombol ikon |
| Gerak | Animasi hanya saat elemen muncul (tidak berulang saat mengetik); `prefers-reduced-motion` |
| Reflow | Tanpa scroll horizontal halaman di lebar 390px; target sentuh ≥ 38–44px |

---

## 2. Identitas visual

| Unsur | Keputusan |
|---|---|
| Emblem | Lambang Densus 88 (burung hantu) di header, login, dan hero Portal. Menggantikan monogram teks "SDL" |
| Wordmark | **SIERA DELTA LIMA dalam satu warna**: navy di atas putih, putih di atas navy. Sebelumnya dua warna (putih + emas) |
| Warna merek | Satu: navy `#14243e`, sama dengan produksi |
| Emas | Dihapus sebagai aksen dekoratif. Warna kuning-merah sudah dibawa oleh emblem; mengulanginya di UI membuat halaman ramai |
| Warna per unit | Dihapus (hijau/biru/ungu/amber). Unit dikenali dari nama dan ikon, sehingga warna tetap tersedia untuk status |
| Bentuk | Radius 4–8px, garis 1px, bayangan hampir nol: gaya institusional, bukan gaya aplikasi konsumen |
| Huruf | Font sistem (Segoe UI di Windows), tanpa unduhan eksternal |

---

## 3. Perubahan dibanding produksi

| Area | Produksi | Usulan |
|---|---|---|
| Login | Layar terbelah, CAPTCHA berupa tombol | Kartu di tengah; verifikasi perangkat otomatis; langkah bernomor; OTP 6 kotak dengan hitung mundur dan sisa percobaan; layar ganti password pertama |
| Header | Inbox/Tasks hilang saat berada di URMIN | Item header tetap di semua halaman; badge jumlah; pencarian Ctrl+K; satu lonceng notifikasi |
| Portal | Hero + tile unit + berita | Sama, ditambah panel **Perlu tindakan Anda** di bagian atas; tile unit yang tidak bisa diakses menyebut alasannya |
| Sidebar ruang kerja | Kartu unit statis + "Kembali ke Portal" | Pengalih unit (dropdown); grup menu sama seperti produksi |
| Detail | Modal di tengah | Panel kanan; daftar tetap terlihat, baris aktif disorot |
| Tabel | Tombol Detail/Upload di setiap baris | Seluruh baris bisa diklik dan dibuka dengan keyboard; aksi dipindah ke panel |
| Dashboard URMIN | Grafik tren | Alur surat 6 tahap dengan jumlah per tahap; klik satu tahap untuk memfilter |

## 4. Aturan sistem yang tidak berubah

Superadmin tetap ditolak dari ruang kerja unit (tile dinonaktifkan dengan
alasan). OTP Superadmin tetap wajib. `must_change_password` tetap memblokir
ruang kerja sampai password diganti. Menyembunyikan menu di frontend bukan
RBAC: penegakan tetap di API. Kontrak API tidak tersentuh.

## 5. Urutan implementasi ke `apps/frontend/`

1. Token `rd.css` → `style.css`; bekukan file `*R5F*.css`.
2. Header: item tetap, badge, emblem `/logo.png` (sudah ada).
3. Login: kartu tengah, `OtpInput`, layar ganti password. Uji lewat HTTPS
   (batasan keras #1) dan dengan `SDL_ALLOWED_ORIGINS` (#2).
4. Panel *Perlu tindakan* di Portal (endpoint yang sudah ada).
5. `DetailDrawer` + `DataTable` + `FilterChips`, lalu pindahkan modul satu per satu.
6. Pengalih unit di sidebar; `CommandPalette` (navigasi dulu, data lewat endpoint berskop).

Setiap langkah: `npm run build`, cek desktop dan HP, terang dan gelap, lalu uji
dengan pengguna nyata (ISO 9241-210: evaluasi oleh pengguna, bukan hanya
peninjauan desain).
---

## 6. Revisi v3.1 (12 Nov 2026)

Tata letak v3 dipertahankan. Perubahan:

| Perubahan | Alasan |
|---|---|
| Footer aplikasi dan footer login dihapus | Tidak membawa informasi untuk tugas pengguna (ISO 9241-112: bebas distraksi). Tanda "data fiktif" dipindah ke menu akun; login tetap berlabel MOCKUP |
| Blok hero navy + emblem besar di Portal diganti **kepala ringkas**: tanggal, sapaan, satu baris tagline, dan tab di baris yang sama | Tinggi turun dari ±200px ke ±100px, sehingga panel *Perlu tindakan* terlihat tanpa scroll. Emblem cukup tampil di header, tidak diulang |
| Tombol aksi berisiko (Nonaktifkan, Kembalikan, Minta tindak lanjut) monokrom; konsekuensi dijelaskan di dialog konfirmasi | Warna merah disimpan untuk makna status, bukan kontrol |
| Cincin fokus netral (gelap di tema terang, terang di tema gelap) | Kontrol monokrom; kontras nonteks tetap ≥ 3:1 |
| Placeholder password "Masukkan password", bukan titik-titik | Titik-titik terlihat seperti field yang sudah terisi |
| Pilihan tema **Terang / Gelap / Ikuti sistem** di Profil | Pengguna memegang kendali eksplisit; default mengikuti OS |
| Radius kartu 10px, kontrol 6px | Konsisten, tidak membulat berlebihan |

### Panduan BNPT sebagai pembanding

`design/Panduan_Desain_UI_UX_Aplikasi_BNPT_V1_0_20261025.pdf` dipakai **hanya
sebagai referensi**. Ia milik instansi lain dan statusnya sendiri masih rancangan;
tidak ada aset, warna, atau nama BNPT yang dipakai di sini. Ketentuannya yang
sejalan dan sudah dipenuhi SDL:

- Kontrol monokrom; warna hanya untuk status, progress, dan grafik, selalu disertai label.
- Warna logo dipakai untuk identitas saja, tanpa gradasi atau pola latar.
- Header: logo di kiri atas, langsung diikuti nama aplikasi; utilitas (tema, akun) di kanan.
- Login: kartu formulir di tengah, label eksplisit, tombol tampilkan password, bantuan akses.
- Tema terang dan gelap setara, dengan pilihan eksplisit.
- Error dijelaskan beserta cara memperbaikinya; konfirmasi menyebut objek dan akibat.

Yang **belum** diikuti dan perlu keputusan pemilik:

- Ukuran teks dasar 16px (SDL masih 14px, metadata 12–12.5px). Menaikkannya
  membuat tabel kurang padat. Sebaiknya diputuskan setelah uji dengan pengguna nyata.
- Panduan memakai latar netral di halaman login; SDL tetap memakai navy polos
  karena pemilik menilai tampilan itu sudah sesuai.
