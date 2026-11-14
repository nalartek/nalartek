---
title: "Dasar systemd: Unit, Service, dan Log Tanpa Kebingungan"
description: "Pengantar praktis untuk memahami unit systemd, menjalankan service, membaca journal, dan mengenali kesalahan konfigurasi yang umum."
slug: "dasar-systemd-unit-service-log"
pubDate: 2026-11-06
updatedDate: 2026-11-09
author: "NalarTek Editorial"
category: "engineering-linux"
tags:
  - "Linux"
  - "systemd"
  - "Server"
featured: true
starter: true
---

systemd sering terasa rumit karena ia menyentuh banyak bagian sistem: boot, service, log, timer, dan manajemen perangkat. Namun sebagian besar pekerjaan sehari-hari dapat dipahami dengan beberapa konsep dasar. Artikel ini membahas unit, service, dan journal tanpa masuk ke konfigurasi yang terlalu spesifik untuk satu distribusi.

## Apa yang dikelola systemd

systemd mengelola banyak hal melalui unit. Unit adalah deskripsi terstruktur tentang sesuatu yang harus dijalankan atau dikelola sistem. Unit service menjelaskan proses yang harus berjalan, unit timer menjelaskan jadwal, dan unit mount menjelaskan titik mount. Nama unit biasanya berakhiran sesuai tipenya, misalnya `.service` atau `.timer`.

Perintah `systemctl` menjadi pintu masuk untuk memeriksa dan mengubah status unit. Saat service bermasalah, langkah pertama bukan mengedit file konfigurasi, melainkan membaca status dan log. Kesalahan sering terlihat jelas di sana.

```bash
systemctl status nama-service.service
journalctl -u nama-service.service --no-pager -n 50
```

Gunakan nama yang benar dan perhatikan apakah unit aktif, gagal, atau hanya tidak ditemukan. Status “failed” tidak selalu berarti aplikasi rusak; bisa jadi file konfigurasi tidak ditemukan atau izin akses salah.

## Membaca unit service

File unit terdiri dari beberapa bagian, seperti `[Unit]`, `[Service]`, dan `[Install]`. Bagian `[Unit]` menjelaskan hubungan dengan unit lain. Bagian `[Service]` menentukan perintah yang dijalankan dan cara systemd mengawasi proses. Bagian `[Install]` menentukan kapan unit diaktifkan.

Untuk service sederhana, perhatikan `ExecStart`, `WorkingDirectory`, dan `User`. Kesalahan pada salah satu bagian ini dapat membuat service gagal berjalan meskipun perintahnya benar saat dijalankan manual. Perbedaan lingkungan juga penting: service tidak selalu mewarisi variabel shell yang sama dengan terminal interaktif.

Setelah mengubah file unit, jalankan `systemctl daemon-reload`, lalu restart service. Jika service masih gagal, baca ulang log dan periksa apakah ada pesan tentang file yang tidak ditemukan atau izin yang ditolak.

## Membaca journal

`journalctl` menampilkan log yang dikumpulkan systemd. Filter berdasarkan unit membuat log jauh lebih mudah dibaca. Opsi `-b` membatasi tampilan pada boot saat ini, sedangkan `--since` dan `--until` membantu mempersempit rentang waktu.

Jangan menyalin seluruh log ke forum publik tanpa memeriksa data sensitif. Log dapat memuat alamat IP, nama pengguna, token, atau isi permintaan. Untuk berbagi, ambil bagian yang relevan dan hapus informasi pribadi.

## Kesalahan yang sering terjadi

Pertama, menjalankan perintah manual sebagai pengguna berbeda dari service yang berjalan sebagai pengguna sistem. Kedua, mengandalkan `PATH` yang tidak tersedia di lingkungan service. Ketiga, lupa `daemon-reload` setelah mengubah unit. Keempat, menambahkan `Restart=always` tanpa memahami mengapa proses berhenti.

Perbaiki penyebab sebelum menambah mekanisme restart. Service yang terus restart dapat menyembunyikan masalah konfigurasi dan membanjiri log. Jika perlu restart otomatis, batasi dengan `RestartSec` dan periksa log secara berkala.

## Sumber

- [systemctl manual](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html)
- [systemd.service manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html)
- [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)

Artikel starter ini bukan panduan khusus untuk distribusi tertentu. Periksa dokumentasi distribusi Anda sebelum mengubah konfigurasi sistem.
