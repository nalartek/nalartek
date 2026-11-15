
---
title: "Dasar systemd: Unit, Service, dan Log Tanpa Kebingungan"
description: "Pengantar praktis untuk memahami unit systemd, menjalankan service, membaca journal, dan mengenali kesalahan konfigurasi yang umum."
slug: "dasar-systemd-unit-service-log"
pubDate: 2026-11-06
updatedDate: 2026-11-14
author: "NalarTek Editorial"
category: "engineering-linux"
tags:
  - "Linux"
  - "systemd"
  - "Server"
featured: true
---

Bagi banyak orang yang baru masuk ke dunia Linux, `systemd` sering terasa seperti kotak hitam yang rumit. Ia menyentuh hampir semua bagian sistem: proses *boot*, manajemen *service* (layanan), log, penjadwalan (timer), dan manajemen perangkat keras.

Namun, untuk kebutuhan sehari-hari sebagai pengguna maupun *developer*, kita hanya perlu memahami beberapa konsep dasar. Artikel ini membahas cara kerja unit, file *service*, dan cara membaca log tanpa harus menghafal seluruh dokumentasi.
> **Poin Penting:**
> - `systemd` mengelola sistem Linux melalui *Unit* (`.service`, `.timer`, `.mount`).
> - File `.service` mendefinisikan cara proses berjalan, termasuk `ExecStart` dan `User`.
> - Selalu jalankan `systemctl daemon-reload` setelah mengubah file konfigurasi unit.
> - Gunakan `journalctl -u nama-service -f` untuk memantau log secara langsung saat *debugging*.
## Apa yang dikelola systemd?

`systemd` mengelola banyak hal melalui apa yang disebut **Unit**. Unit adalah file konfigurasi terstruktur yang mendeskripsikan sesuatu yang harus dijalankan atau dikelola oleh sistem. Nama unit biasanya berakhiran sesuai dengan tipenya:
- **`.service`**: Menjalankan proses di latar belakang (misalnya server web Nginx atau aplikasi Node.js).
- **`.timer`**: Menjalankan tugas terjadwal (pengganti `cron`).
- **`.mount`**: Mengelola titik *mount* (seperti *flashdisk* atau *hard disk*).

Perintah `systemctl` adalah pintu masuk utama untuk berinteraksi dengan unit-unit ini.

## Anatomi File Unit Service

Mari kita bedah file `.service`. File ini biasanya diletakkan di `/etc/systemd/system/nama-aplikasi.service`. Berikut adalah contoh nyata file *service* untuk menjalankan aplikasi Node.js sederhana:

```ini
[Unit]
Description=Aplikasi Node.js NalarTek
After=network.target

[Service]
User=nalartek
WorkingDirectory=/home/nalartek/app
ExecStart=/usr/bin/node /home/nalartek/app/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Mari bedah bagian-bagiannya:

· [Unit]: Mendefinisikan metadata. After=network.target memastikan aplikasi baru berjalan setelah jaringan internet aktif.
· [Service]: Bagian inti.
  · User: Menentukan sebagai pengguna mana aplikasi berjalan (sangat disarankan bukan root demi keamanan).
  · WorkingDirectory: Folder tempat perintah dieksekusi.
  · ExecStart: Perintah mutlak yang dijalankan. Gunakan path absolut (seperti /usr/bin/node), bukan hanya node. Ini karena service tidak mengenali variabel $PATH seperti di terminal biasa.
  · Restart: on-failure berarti sistem akan mencoba restart jika aplikasi crash, tetapi tidak akan restart jika Anda menghentikannya secara manual.
· [Install]: Menentukan kapan service dinyalakan. multi-user.target berarti aplikasi berjalan otomatis saat sistem masuk ke mode teks (normal).

Perintah systemctl yang Wajib Diketahui

Setelah file dibuat, Anda tidak bisa langsung menjalankannya. Berikut adalah alur kerjanya:

1. Muat ulang konfigurasi (wajib dilakukan setiap kali Anda mengedit file .service):
   ```bash
   sudo systemctl daemon-reload
   ```
2. Menjalankan service:
   ```bash
   sudo systemctl start nama-aplikasi.service
   ```
3. Menghentikan service:
   ```bash
   sudo systemctl stop nama-aplikasi.service
   ```
4. Menyalakan otomatis saat boot:
   ```bash
   sudo systemctl enable nama-aplikasi.service
   ```
   (Tips: Anda bisa menggabungkan enable dan start sekaligus dengan sudo systemctl enable --now nama-aplikasi.service).
5. Melihat status:
   ```bash
   sudo systemctl status nama-aplikasi.service
   ```

Membaca Log dengan journalctl

Ketika service gagal berjalan (statusnya failed), langkah pertama bukan mengedit file, melainkan membaca log. systemd menggunakan journalctl untuk mengelola log ini.

· Melihat log khusus satu service:
  ```bash
  sudo journalctl -u nama-aplikasi.service
  ```
· Melihat log 50 baris terakhir (tanpa membuka editor teks):
  ```bash
  sudo journalctl -u nama-aplikasi.service -n 50 --no-pager
  ```
· Memantau log secara langsung (real-time):
  Ini sangat berguna saat Anda sedang melakukan debugging.
  ```bash
  sudo journalctl -u nama-aplikasi.service -f
  ```

Peringatan Keamanan: Saat meminta bantuan di forum, jangan pernah menyalin seluruh log secara mentah-mentah. Log sering kali memuat alamat IP, nama user, atau bahkan token API rahasia. Bersihkan data sensitif sebelum membagikannya.

Kesalahan yang Sering Terjadi

1. Lupa daemon-reload: Setelah mengubah file .service, perubahan tidak akan terbaca sampai Anda menjalankan systemctl daemon-reload.
2. PATH tidak ditemukan: Menjalankan ExecStart=python script.py sering gagal. Gunakan path absolut: ExecStart=/usr/bin/python3 /home/user/script.py.
3. Masalah Izin (Permission): Service berjalan sebagai User yang Anda tentukan. Jika file script atau folder diakses oleh user lain, aplikasi akan gagal (biasanya error Permission Denied).
4. Skrip bermasalah: Jika ExecStart memanggil file skrip Bash buatan Anda sendiri, pastikan skrip tersebut sudah diuji dan aman. Anda bisa membaca panduan penulisannya di artikel Menyusun Skrip Shell yang Lebih Aman.

Sumber

· systemctl manual
· systemd.service manual
· journalctl manual

```

---
