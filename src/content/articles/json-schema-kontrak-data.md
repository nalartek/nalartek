---
title: "JSON Schema: Kontrak Data yang Jelas Sebelum Kode"
description: "Mengapa mendefinisikan bentuk data lebih awal membantu mencegah bug, mempermudah integrasi, dan membuat validasi lebih konsisten."
slug: "json-schema-kontrak-data"
pubDate: 2026-10-12
author: "NalarTek Editorial"
category: "ai-software"
tags:
  - "JSON"
  - "API"
  - "Validasi"
starter: true
---

Saat dua sistem bertukar data, kesalahan yang paling sering muncul bukan karena algoritma yang rumit, melainkan karena perbedaan asumsi tentang bentuk data. Field yang dianggap wajib ternyata hilang, tipe angka berubah menjadi string, atau nilai enum yang baru tidak dikenali. JSON Schema membantu membuat asumsi itu eksplisit.

## Mengapa kontrak data penting

Kontrak data adalah kesepakatan tentang apa yang dikirim, apa yang diterima, dan apa yang terjadi ketika data tidak sesuai. Tanpa kontrak, validasi tersebar di banyak tempat dan mudah tertinggal saat model berubah. Dengan kontrak, tim memiliki rujukan yang dapat diuji.

JSON Schema mendeskripsikan struktur JSON: properti wajib, tipe, batas nilai, pola string, dan aturan tambahan. Schema dapat dipakai untuk validasi saat pengembangan, pemeriksaan di pipeline, atau dokumentasi API.

## Contoh schema yang berguna

Berikut contoh sederhana untuk data artikel. Schema ini membatasi field wajib, tipe, dan format tanggal.

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

Perhatikan `additionalProperties: false`. Aturan ini menolak field yang tidak dikenal. Berguna untuk menangkap salah ketik, tetapi bisa menyulitkan evolusi API jika tidak dikelola. Pilih kebijakan yang sesuai dengan kebutuhan kompatibilitas.

## Validasi, versi, dan perubahan

Schema adalah bagian dari antarmuka. Jika field wajib ditambahkan, konsumen lama dapat gagal. Jika field dihapus, data lama mungkin tidak lagi valid. Catat perubahan schema dan pertimbangkan strategi versi, terutama untuk API publik.

Validasi sebaiknya terjadi di batas sistem: saat menerima data dari luar, sebelum menyimpan, dan sebelum mengirim. Jangan mengandalkan satu lapisan saja. Validasi schema tidak menggantikan validasi bisnis; ia memastikan bentuk data, bukan kebenaran isi.

Untuk data yang sangat besar, validasi penuh bisa mahal. Pertimbangkan validasi bertahap dan pengukuran. Jangan menonaktifkan validasi hanya karena performa tanpa memahami risikonya.

## Sumber

- [JSON Schema: Getting Started](https://json-schema.org/learn/getting-started-step-by-step)
- [JSON Schema Specification](https://json-schema.org/specification)
- [RFC 8259: The JavaScript Object Notation Data Interchange Format](https://www.rfc-editor.org/rfc/rfc8259)

Artikel starter ini menggunakan contoh netral dan bukan rekomendasi untuk stack tertentu.
