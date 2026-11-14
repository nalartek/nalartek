---
title: "Menyusun Skrip Shell yang Lebih Aman dan Mudah Dirawat"
description: "Kebiasaan kecil yang membuat skrip Bash lebih dapat diprediksi: penanganan error, kutip variabel, pemeriksaan input, dan pengujian dengan alat statis."
slug: "skrip-shell-lebih-aman"
pubDate: 2026-10-18
author: "NalarTek Editorial"
category: "engineering-linux"
tags:
  - "Bash"
  - "Shell"
  - "Otomasi"
starter: true
---

Skrip shell sering dimulai sebagai satu baris perintah yang disalin ke file. Ketika skrip dipakai berulang kali, masalah kecil mulai muncul: nama file mengandung spasi, perintah gagal tetapi proses berlanjut, atau variabel kosong mengubah arti perintah. Perbaikan terbaik bukan menambah kompleksitas, melainkan menetapkan aturan dasar sejak awal.

## Tentukan kontrak skrip

Sebelum menulis perintah, tentukan apa yang diterima skrip dan apa yang dihasilkannya. Apakah skrip membutuhkan satu argumen? Apakah ia mengubah file di direktori saat ini? Apakah aman dijalankan dua kali? Kontrak yang jelas membantu menentukan pemeriksaan input dan pesan kesalahan.

Mulailah dengan shebang dan mode ketat. `set -euo pipefail` membuat skrip berhenti pada banyak kesalahan, menolak variabel yang belum didefinisikan, dan menggagalkan pipeline jika salah satu perintahnya gagal. Ini bukan jaminan keselamatan, tetapi mengurangi kegagalan yang tidak terlihat.

```bash
#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'Penggunaan: %s <direktori>\n' "$0" >&2
  exit 64
fi

input_dir=$1
if [[ ! -d $input_dir ]]; then
  printf 'Direktori tidak ditemukan: %s\n' "$input_dir" >&2
  exit 66
fi
```

## Kutip variabel dan path

Selalu kutip ekspansi variabel kecuali Anda benar-benar membutuhkan pemisahan kata. Nama file dengan spasi adalah kasus nyata, bukan skenario teoretis. Gunakan `"$variable"` dan `"${array[@]}"` dengan pemahaman yang tepat.

Saat membangun path, pertimbangkan penggunaan `mktemp` untuk file sementara dan `trap` untuk pembersihan. Jangan menulis ke lokasi yang tidak dapat diprediksi atau menimpa file pengguna tanpa konfirmasi. Untuk operasi destruktif, tampilkan rencana terlebih dahulu atau sediakan opsi dry-run.

## Periksa input dan hasil perintah

Jangan mengandalkan asumsi tentang format input. Periksa apakah file ada, apakah argumen berupa angka, dan apakah direktori dapat ditulis. Untuk perintah yang mungkin gagal, tangani error secara eksplisit jika kegagalan tersebut masih dapat dipulihkan.

Hindari mengevaluasi input pengguna dengan `eval`. Jika perlu menyusun perintah, gunakan array dan panggil program secara langsung. Pola ini lebih mudah dibaca dan mengurangi risiko injeksi perintah.

## Uji dengan ShellCheck

ShellCheck membantu menemukan pola berbahaya dan kesalahan umum, seperti variabel tanpa kutip atau perbandingan yang salah. Alat ini tidak menggantikan pengujian, tetapi memberikan umpan balik cepat sebelum skrip dipakai di lingkungan nyata.

Uji skrip dengan data yang tidak sempurna: nama file berspasi, direktori kosong, izin yang tidak mencukupi, dan input yang hilang. Catat perilaku yang diharapkan. Skrip yang baik memberi pesan yang jelas dan keluar dengan kode status yang masuk akal.

## Sumber

- [Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
- [ShellCheck wiki](https://www.shellcheck.net/wiki/)
- [POSIX Shell Command Language](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html)

Artikel starter ini adalah catatan praktis, bukan audit keamanan menyeluruh untuk skrip produksi.
