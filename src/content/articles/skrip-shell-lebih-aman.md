
---
title: "Menyusun Skrip Shell yang Lebih Aman dan Mudah Dirawat"
description: "Kebiasaan kecil yang membuat skrip Bash lebih dapat diprediksi: penanganan error, kutip variabel, pemeriksaan input, dan pengujian dengan alat statis."
slug: "skrip-shell-lebih-aman"
pubDate: 2026-10-18
updatedDate: 2026-11-14
author: "NalarTek Editorial"
category: "engineering-linux"
tags:
  - "Bash"
  - "Shell"
  - "Otomasi"
---

Skrip shell sering dimulai sebagai satu baris perintah yang disalin dari internet ke dalam file. Ketika skrip mulai dipakai berulang kali, masalah kecil mulai muncul: nama file yang mengandung spasi tiba-tiba tidak terbaca, perintah gagal tetapi skrip tetap berlanjut seolah tidak terjadi apa-apa, atau variabel yang kosong malah menghapus direktori yang salah.

Menulis skrip yang aman bukan tentang menambahkan fitur yang rumit, melainkan tentang menetapkan **aturan dasar (defensive programming)** sejak awal.

## Tentukan kontrak skrip

Sebelum menulis perintah, tentukan apa yang diterima skrip dan apa yang dihasilkannya. Apakah skrip membutuhkan satu argumen? Apakah ia mengubah file di direktori saat ini? Apakah aman dijalankan dua kali? Kontrak yang jelas membantu menentukan pemeriksaan input dan pesan kesalahan.

## Aturan Pertama: "Strict Mode"

Mulailah setiap skrip Bash dengan *shebang* dan mode ketat. Ini adalah baris pertama yang wajib ada:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

Apa arti mantra tersebut?

· -e (errexit): Skrip akan langsung berhenti jika ada perintah yang gagal (mengembalikan exit code selain 0). Ini mencegah skrip melanjutkan proses penghapusan file padahal proses backup-nya gagal.
· -u (nounset): Skrip akan error jika Anda memanggil variabel yang belum dideklarasikan. Ini mencegah bencana seperti rm -rf $DIR/ di mana $DIR kosong, sehingga perintahnya berubah menjadi rm -rf / (menghapus seluruh sistem).
· -o pipefail: Jika Anda menggunakan pipa (pipe), misalnya curl URL | grep "data", dan curl gagal, skrip akan tetap menganggapnya error meskipun grep berhasil. Tanpa ini, pipefail secara default hanya melihat perintah terakhir.

Kutip variabel dan path

Selalu kutip ekspansi variabel kecuali Anda benar-benar membutuhkan pemisahan kata. Nama file dengan spasi adalah kasus nyata, bukan skenario teoretis.

Salah:

```bash
file=$1
rm $file # Jika file bernama "foto liburan.jpg", ini akan error
```

Benar:

```bash
file="$1"
rm "$file" # Aman, spasi akan dibaca sebagai satu kesatuan
```

Saat membangun path (jalur direktori), gunakan mktemp untuk file sementara dan trap untuk pembersihan. Jangan menulis ke lokasi yang tidak dapat diprediksi atau menimpa file pengguna tanpa konfirmasi. Untuk operasi destruktif, sediakan opsi --dry-run (simulasi) terlebih dahulu.

Periksa input dan dependensi

Jangan mengandalkan asumsi tentang format input. Periksa apakah file ada, apakah argumen berupa angka, dan apakah direktori dapat ditulis.

Selain itu, pastikan perintah pendukung benar-benar terinstal di sistem sebelum skrip berjalan. Anda bisa menggunakan perintah command -v:

```bash
if ! command -v git &> /dev/null; then
    echo "Error: git tidak terinstal." >&2
    exit 1
fi
```

Hindari mengevaluasi input pengguna dengan eval. Jika perlu menyusun perintah, gunakan array dan panggil program secara langsung. Pola ini lebih mudah dibaca dan mengurangi risiko injeksi perintah (command injection).

Hati-hati dengan Skrip Buatan AI

Saat ini, banyak pengembang menggunakan AI untuk menulis skrip Bash. Meskipun AI bisa menulis kode yang terlihat canggih, ia sering mengabaikan aspek keamanan seperti pengutipan variabel atau penanganan error. Selalu periksa skrip yang dihasilkan AI sebelum dijalankan. Anda bisa membaca panduan lengkapnya di artikel Membaca Output AI dengan Skeptis.

Uji dengan ShellCheck

Mata manusia sering luput dari kesalahan sintaks. Gunakan ShellCheck (bisa diinstal melalui Termux atau Linux) untuk memindai skrip Anda. Alat ini membantu menemukan pola berbahaya, seperti variabel tanpa kutip atau perbandingan yang salah.

Uji juga skrip Anda dengan data yang tidak sempurna: nama file berspasi, direktori kosong, izin yang tidak mencukupi (permission denied), dan input yang hilang. Skrip yang baik memberi pesan kesalahan yang jelas dan keluar dengan kode status (exit code) yang masuk akal.

Jika skrip tersebut akan berjalan terus-menerus di latar belakang (sebagai background process), sebaiknya kelola skrip tersebut menggunakan service manager seperti Systemd, bukan dijalankan secara manual. Panduannya bisa dibaca di artikel Dasar systemd Unit, Service, dan Log.

Sumber

· Bash Reference Manual
· ShellCheck wiki
· POSIX Shell Command Language
