
---
title: "JSON Schema: Kontrak Data yang Jelas Sebelum Kode"
description: "Mengapa mendefinisikan bentuk data lebih awal membantu mencegah bug, mempermudah integrasi, dan membuat validasi lebih konsisten."
slug: "json-schema-kontrak-data"
pubDate: 2026-10-12
updatedDate: 2026-11-14
author: "NalarTek Editorial"
category: "ai-software"
tags:
  - "JSON"
  - "API"
  - "Validasi"
---

Saat dua sistem bertukar data, kesalahan yang paling sering muncul bukan karena algoritma yang rumit, melainkan karena perbedaan asumsi tentang bentuk data. *Field* (kolom) yang dianggap wajib ternyata hilang, tipe angka berubah menjadi teks (string), atau nilai *enum* yang baru tidak dikenali. JSON Schema hadir untuk membuat asumsi itu eksplisit dan dapat diuji secara otomatis.

Tanpa kontrak data, validasi sering tersebar di banyak tempat (dan sering terlewat). Dengan JSON Schema, tim memiliki satu rujukan tunggal tentang bagaimana data harus berbentuk.
> **Poin Penting:**
> - JSON Schema mencegah *bug* integrasi dengan mendefinisikan bentuk data secara eksplisit.
> - Gunakan `required` untuk validasi *field* wajib dan `additionalProperties` untuk menolak *field* asing.
> - Pahami bedanya validasi bentuk (Schema) dan validasi logika bisnis (kode aplikasi).
> - Di era AI, JSON Schema digunakan untuk memaksa model bahasa memberikan *output* yang terstruktur.
## Mengapa kontrak data penting

Kontrak data adalah kesepakatan tentang apa yang dikirim, apa yang diterima, dan apa yang terjadi ketika data tidak sesuai. Bayangkan jika sebuah aplikasi *e-commerce* mengirim data pesanan, tetapi sistem gudang mengharapkan format tanggal yang berbeda. Tanpa validasi, aplikasi akan *crash* atau, lebih buruk lagi, menyimpan data yang salah.

JSON Schema mendeskripsikan struktur JSON secara terperinci: properti wajib, tipe data, batas nilai (minimal/maksimal), pola teks (regex), dan aturan tambahan. Schema dapat dipakai untuk validasi saat pengembangan, pemeriksaan di *pipeline* CI/CD, atau sebagai dokumentasi API yang otomatis.

## Anatomi schema yang berguna

Berikut contoh sederhana untuk data artikel. Schema ini membatasi *field* wajib, tipe data, dan format tanggal.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["title", "slug", "publishedAt"],
  "properties": {
    "title": { "type": "string", "minLength": 1 },
    "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "publishedAt": { "type": "string", "format": "date-time" },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "uniqueItems": true
    }
  },
  "additionalProperties": false
}
```

Mari bedah sedikit kode di atas:

· type: "object": Memastikan data utama adalah sebuah objek JSON.
· required: Mendaftar field yang wajib ada. Jika title hilang, validasi akan gagal.
· pattern: Memastikan slug hanya berisi huruf kecil, angka, dan tanda hubung (sesuai standar URL).
· uniqueItems: true: Mencegah adanya tag yang duplikat (misal: ["Android", "Android"]).
· additionalProperties: false: Menolak field yang tidak dikenal. Ini sangat berguna untuk menangkap salah ketik (misal: mengirim titel bukannya title).

Kapan saja JSON Schema digunakan?

Penggunaan JSON Schema tidak terbatas pada API saja. Beberapa contoh penggunaannya:

1. Validasi API (REST/GraphQL): Memastikan request dari client sesuai dengan yang diharapkan server sebelum diproses lebih lanjut.
2. File Konfigurasi: Banyak alat modern (seperti package.json di Node.js, atau tsconfig.json) memiliki schema yang memungkinkan code editor (VS Code) memberikan auto-complete dan memperingatkan jika ada salah konfigurasi.
3. AI Structured Outputs: Di era AI modern, model bahasa (seperti OpenAI atau Gemini) dapat dipaksa untuk memberikan jawaban dalam format JSON yang sesuai dengan schema tertentu. Ini mencegah AI berhalusinasi format. Anda bisa membaca tentang pentingnya memverifikasi output AI di artikel Membaca Output AI dengan Skeptis.

Validasi Bentuk vs Validasi Bisnis

Ini adalah poin krusial yang sering disalahpahami: JSON Schema hanya memvalidasi bentuk (shape), bukan kebenaran isi (business logic).

JSON Schema bisa memastikan bahwa price adalah sebuah angka (number) dan nilainya lebih besar dari 0. Tapi, JSON Schema tidak bisa memastikan apakah pengguna memiliki saldo yang cukup untuk membayar price tersebut, atau apakah stok barangnya masih ada. Validasi bisnis seperti itu harus tetap ditulis dalam kode aplikasi Anda.

Strategi versi dan perubahan

Schema adalah bagian dari antarmuka publik. Jika Anda menambahkan field wajib baru di versi 2 API, konsumen API versi 1 (yang tidak mengirim field tersebut) akan langsung mengalami error.

Catat perubahan schema dan pertimbangkan strategi versi (misalnya /api/v1/ dan /api/v2/), terutama untuk API publik. Untuk data yang ukurannya sangat besar, validasi penuh bisa memakan waktu. Pertimbangkan validasi bertahap dan lakukan pengukuran performa. Jangan menonaktifkan validasi hanya karena alasan kecepatan tanpa memahami risikonya.

Sumber

· JSON Schema: Getting Started
· JSON Schema Specification
· RFC 8259: The JavaScript Object Notation Data Interchange Format

```

---
