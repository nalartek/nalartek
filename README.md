# NalarTek

NalarTek adalah media teknologi independen berbahasa Indonesia. Situs ini
membahas Android, engineering dan Linux, AI dan software, serta standar dan
inovasi teknologi melalui artikel yang dapat ditelusuri sumbernya.

Situs dibangun sebagai static site dengan Astro, tanpa backend, framework UI
tambahan, atau layanan berbayar. Output akhirnya adalah direktori `dist/` yang
siap dipublikasikan ke Cloudflare Pages.

## Stack

- Astro 7 dengan output static
- Content Collections untuk artikel Markdown
- CSS biasa dengan design token NalarTek
- Node.js `>=22.23.4`
- Cloudflare Pages untuk hosting
- Tidak ada adapter server, database, atau API runtime

## Menjalankan proyek

```sh
npm install
npm run dev
```

Perintah yang tersedia:

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Astro |
| `npm run build` | Membangun situs statis ke `dist/` |
| `npm run preview` | Menjalankan pratinjau hasil build |
| `npm run check` | Memeriksa error TypeScript dan Astro |
| `npm run brand:assets` | Menghasilkan ulang favicon dan varian aset merek |

Alamat `dev` mengikuti konfigurasi Astro setempat, biasanya
`http://localhost:4321/`. Hentikan server dengan `Ctrl+C`.

## Variabel lingkungan

Salin `.env.example` menjadi `.env` untuk pengembangan lokal, lalu isi nilainya.

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `SITE_URL` | Untuk produksi | Origin publik tanpa path dan tanpa garis miring akhir, misalnya `https://nama-proyek.pages.dev`. Dipakai untuk canonical, URL absolut Open Graph, JSON-LD, sitemap, dan `robots.txt`. |
| `PUBLIC_CONTACT_EMAIL` | Tidak | Alamat email editorial opsional. Nilai ini terekspos di HTML karena prefiks `PUBLIC_`; jangan isi dengan rahasia. |

Jika `SITE_URL` kosong, build tetap berhasil dan tetap netral domain:

- canonical dan URL absolut tidak dipasang;
- metadata gambar Open Graph tidak dipasang;
- `sitemap.xml` berisi `<urlset>` kosong yang valid;
- `robots.txt` tidak mencantumkan baris `Sitemap`.

Jangan menulis domain produksi ke dalam kode. Isi `SITE_URL` hanya setelah
Cloudflare memberikan URL proyek yang sebenarnya.

## Menulis artikel

Artikel disimpan sebagai Markdown di:

```text
src/content/articles/
```

Buat satu file per artikel, misalnya
`src/content/articles/panduan-baru.md`. Nama file sebaiknya sama dengan `slug`
agar mudah ditelusuri, meskipun rute memakai nilai `slug` di frontmatter.

Contoh frontmatter:

```yaml
---
title: "Judul artikel yang jelas"
description: "Ringkasan 40-220 karakter yang menjelaskan isi dan manfaat artikel."
slug: "judul-artikel-yang-jelas"
pubDate: 2026-11-14
updatedDate: 2026-11-15
author: "NalarTek Editorial"
category: "android"
tags:
  - "Android"
  - "Privasi"
featured: false
draft: false
starter: false
coverImage:
  src: "/images/articles/contoh-cover.png"
  alt: "Deskripsi visual cover untuk pembaca layar"
  width: 1200
  height: 750
---
```

Aturan schema yang divalidasi saat build:

- `title`: 10-120 karakter.
- `description`: 40-220 karakter.
- `slug`: huruf kecil, angka, dan tanda hubung.
- `pubDate`: tanggal publikasi.
- `updatedDate`: opsional, tidak boleh lebih awal dari `pubDate`.
- `author`: default `NalarTek Editorial`.
- `category`: salah satu dari `android`, `engineering-linux`, `ai-software`,
  atau `technology-innovation`.
- `tags`: daftar string, default kosong.
- `coverImage`: opsional; `src` diawali `/`, `alt` minimal 10 karakter, dan
  `width`/`height` wajib jika cover dipakai.
- `featured`, `draft`, `starter`: boolean, default `false`.

Catatan:

- Artikel dengan `draft: true` tidak masuk build, arsip, kategori, sitemap, atau
  artikel terkait.
- Artikel diurutkan dari `pubDate` terbaru.
- `starter: true` menampilkan label **Starter** di kartu dan halaman artikel.
  Gunakan label ini untuk contoh awal yang belum melalui peninjauan editorial
  penuh.
- Untuk menghapus label starter, tinjau ulang sumber dan klaimnya, perbarui
  artikel, lalu ubah `starter` menjadi `false`.
- Cover boleh dikosongkan. Kartu akan memakai visual fallback bermerek NalarTek.
  Jika memakai cover, letakkan file di `public/images/articles/` dan tulis
  jalur publiknya.
- Sertakan tautan sumber primer atau dokumentasi resmi di dalam isi artikel
  untuk klaim teknis yang dapat diperiksa.

Menambah artikel baru otomatis menghasilkan:

- halaman detail `/articles/<slug>/`;
- kartu di beranda dan arsip;
- halaman kategori terkait;
- halaman arsip tambahan bila jumlah artikel melewati ukuran halaman;
- entri artikel di sitemap saat `SITE_URL` tersedia.

Ukuran halaman arsip adalah 4 artikel (`PAGE_SIZE` di `src/lib/articles.ts`).
Jika isi situs berubah, sesuaikan dokumentasi ini dan komponen terkait bila
ukuran halaman diubah.

### Menambah atau mengubah kategori

Kategori didefinisikan di `src/lib/categories.ts`. Setiap entri berisi `slug`,
`name`, `number`, dan `description`. Perubahan pada daftar itu otomatis dipakai
oleh schema artikel, navigasi footer, beranda, halaman kategori, dan sitemap.

Saat menambah kategori:

1. Tambahkan entri baru di `src/lib/categories.ts`.
2. Gunakan `slug` yang stabil, huruf kecil, dan tanpa spasi.
3. Pastikan `description` menjelaskan cakupan kategori secara jujur.
4. Tambahkan artikel dengan nilai `category` yang sama.
5. Jalankan `npm run check` dan `npm run build`.

Jangan mengganti `slug` kategori yang sudah dipublikasikan tanpa menyiapkan
redirect. Lebih aman mempertahankan slug lama atau menandai artikel sebagai
draft selama migrasi.

## Rute

| Rute | Isi |
| --- | --- |
| `/` | Beranda dengan sorotan, artikel terbaru, dan kategori |
| `/articles/` | Arsip artikel, 4 artikel per halaman |
| `/articles/page/<n>/` | Halaman arsip berikutnya |
| `/articles/<slug>/` | Detail artikel, daftar isi, tag, dan artikel terkait |
| `/categories/` | Ikhtisar empat kategori |
| `/categories/<kategori>/` | Arsip per kategori |
| `/about/` | Tentang NalarTek dan prinsip kerjanya |
| `/contact/` | Informasi kontak editorial |
| `/editorial-policy/` | Kebijakan sumber, AI, koreksi, dan independensi |
| `/sitemap.xml` | Sitemap XML |
| `/robots.txt` | Aturan crawler dan tautan sitemap bila tersedia |
| `/404.html` | Halaman error statis |

URL kanonis memakai garis miring di akhir. Pertahankan pola itu saat menambah
tautan internal.

## Kontak

Situs ini tidak memiliki backend dan tidak menampilkan formulir yang mengirim
data ke server. Jika `PUBLIC_CONTACT_EMAIL` diisi dengan alamat yang valid,
halaman kontak menampilkan tautan `mailto:`. Jika tidak, halaman menjelaskan
bahwa kanal email belum dikonfigurasi.

Jangan menambahkan formulir kontak tanpa layanan yang benar-benar menangani
pengiriman, validasi, penyimpanan, dan privasi data. Jangan menampilkan pesan
sukses palsu.

## SEO dan metadata

Komponen `src/components/SEO.astro` menangani:

- title dan description unik per halaman;
- canonical saat `SITE_URL` tersedia;
- Open Graph dan Twitter Card;
- metadata artikel;
- JSON-LD `Organization`, `WebSite`, `Article`, dan `BreadcrumbList`;
- favicon, manifest, dan preconnect font.

Sitemap dibuat oleh `src/pages/sitemap.xml.ts`, sedangkan robots dibuat oleh
`src/pages/robots.txt.ts`. `public/robots.txt` sengaja tidak dipakai agar tidak
terjadi konflik output.

Metadata halaman 404 memakai `noindex, nofollow` dan tidak dimasukkan ke
sitemap.

## Aset merek

Aset sumber resmi berada di `public/images/`:

- `nalartek-logo.png` (800 x 800)
- `nalartek-banner.png` (2560 x 1440)

File asli tidak boleh ditimpa. Varian turunan dibuat dengan:

```sh
npm run brand:assets
```

Perintah tersebut menghasilkan favicon, apple touch icon, ikon manifest, varian
logo 128/256, banner lockup 720/1440, dan `nalartek-og.png`. Banner footer
merupakan crop terpusat dari banner resmi; piksel dan proporsi aset asli tetap
dipertahankan.

## Cloudflare Pages

Gunakan pengaturan berikut:

| Pengaturan | Nilai |
| --- | --- |
| Framework preset | Astro (atau none) |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | kosong / `/` |
| Node version | `22.23.4` (lihat `.nvmrc`) |
| Production branch | branch yang benar-benar dipakai proyek Pages; repo lokal saat ini memakai `master` |

Tidak perlu Cloudflare adapter. `public/_headers` menambahkan header keamanan
dan cache untuk hasil build.

Alur domain:

1. Deploy pertama tanpa mengarang domain.
2. Salin URL `*.pages.dev` yang diberikan Cloudflare.
3. Set `SITE_URL` di environment variables proyek Pages.
4. Deploy ulang agar canonical, sitemap, dan metadata absolut memakai URL itu.

Jangan membuat asumsi tentang custom domain, DNS, atau nama proyek sebelum
Cloudflare menetapkannya.

## Struktur proyek

```text
public/                  aset statis, header Cloudflare, ikon
scripts/                 generator aset merek
src/components/          kartu, breadcrumb, pagination, TOC, SEO, dan UI lain
src/content/articles/    artikel Markdown
src/content.config.ts    schema Content Collections
src/layouts/             kerangka HTML dan metadata halaman
src/lib/                 helper artikel, kategori, dan tipe SEO
src/pages/               rute halaman dan endpoint statis
src/styles/              token global dan gaya editorial
```

## Pemeriksaan sebelum publikasi

```sh
npm run check
npm run build
```

Periksa juga:

- semua rute yang diharapkan ada di `dist/`;
- `dist/404.html` tersedia untuk Cloudflare Pages;
- `dist/sitemap.xml` valid dan tidak memuat halaman 404;
- `dist/robots.txt` mencantumkan sitemap hanya saat `SITE_URL` diisi;
- tidak ada tautan internal yang mengarah ke rute yang tidak ada;
- metadata halaman unik dan canonical hanya muncul saat `SITE_URL` tersedia.

## Batasan saat ini

- Tidak ada pencarian, komentar, newsletter, akun pengguna, atau analitik.
- Tidak ada formulir kontak atau penyimpanan pesan.
- Tidak ada cover artikel otomatis; visual fallback memakai elemen merek.
- Pengujian visual di browser dan Lighthouse tidak dapat dijalankan di
  lingkungan pengembangan saat ini. Verifikasi dilakukan pada HTML hasil build.
