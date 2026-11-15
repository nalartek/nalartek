---
title: "Mengamankan Termux: Panduan Dasar untuk Pengguna Android"
description: "Termux adalah alat yang sangat kuat di Android. Pelajari langkah-langkah dasar mengamankan lingkungan Termux Anda dari akses tidak sah dan potensi risiko keamanan."
slug: "mengamankan-termux-panduan-dasar"
pubDate: 2026-11-15
updatedDate: 2026-11-15
author: "NalarTek Editorial"
category: "engineering-linux"
tags:
  - "Termux"
  - "Android"
  - "Keamanan"
featured: false
---

Termux adalah emulator terminal sekaligus lingkungan paket Linux untuk Android. Dengannya kita bisa menjalankan Bash, menginstal Python atau Node.js, menjalankan server lokal, hingga mengelola repositori Git langsung dari ponsel.

Secara desain, Termux berjalan sebagai aplikasi Android biasa di dalam *sandbox* yang sama dengan aplikasi lain, bukan sebagai `root`. Itu kabar baiknya. Kabar kurang baiknya: sandbox hanya melindungi aplikasi lain dari Termux. Sandbox tidak melindungi Termux dan seluruh isinya dari kode yang Anda jalankan sendiri. Skrip berbahaya yang dijalankan di Termux mewarisi semua kemampuan Termux, termasuk akses jaringan dan izin apa pun yang sudah Anda berikan.

> **Poin Penting:**
> - Hindari menggunakan akses `root` (`tsu`/`sudo`) pada Termux kecuali benar-benar mendesak. Instal paket dengan `pkg` tidak memerlukan root.
> - Pasang Termux dari sumber resmi (F-Droid atau GitHub) dan jangan mencampur sumber instalasi.
> - Amankan akses SSH dengan autentikasi kunci, dan matikan servis `sshd` saat tidak digunakan.
> - Jangan pernah menjalankan skrip dari internet secara langsung (`curl | bash`) tanpa memeriksa isinya.
> - Simpan rahasia (token, kunci privat) di direktori home Termux, bukan di penyimpanan bersama seperti Downloads.

## 1. Pahami Isolasi (Sandbox) Termux

Android memberi setiap aplikasi identitas Linux tersendiri berupa User ID (UID). Nama seperti `u0_a123` berarti aplikasi dengan app ID 10123 pada pengguna utama (user 0). Aplikasi tersebut juga berjalan di bawah kebijakan SELinux yang membatasi apa yang boleh diakses. Anda bisa melihat identitas Termux sendiri dengan:

```bash
id
whoami
echo $HOME
```

Direktori home Termux (`/data/data/com.termux/files/home`) adalah penyimpanan privat aplikasi. Aplikasi lain tidak bisa membacanya tanpa akses root.

### Apa yang dilindungi sandbox

Secara bawaan, Termux **tidak bisa** membaca data privat aplikasi lain, misalnya WhatsApp atau aplikasi perbankan. Pembatasan ini dijaga oleh kernel dan SELinux, bukan oleh Termux.

### Apa yang tidak dilindungi sandbox

Termux memiliki izin internet. Skrip jahat yang berjalan di Termux dapat membaca seluruh isi home Anda (kunci SSH, token, riwayat perintah) dan mengirimkannya keluar. Jika Anda telah memberi izin penyimpanan atau mengaktifkan Termux:API, jangkauannya ikut meluas. Karena itu, perilaku Anda di dalam Termux sama pentingnya dengan sandbox itu sendiri.

### Mengapa root adalah kesalahan terbesar

Melakukan *root* pada perangkat tidak otomatis membuat Termux berjalan sebagai root. Namun root membuka jalur eskalasi lewat `su` atau `tsu` (Termux sudo). Begitu jalur itu dipakai, skrip yang Anda jalankan bisa menghapus file sistem, membaca data seluruh aplikasi, atau mengubah konfigurasi perangkat. Lapisan perlindungan utama Android praktis hilang.

Root juga hampir tidak pernah dibutuhkan untuk pekerjaan Termux sehari-hari. Paket diinstal ke direktori milik pengguna Termux sendiri, sehingga `pkg install` tidak memerlukan hak istimewa. Menjalankan `pkg` sebagai root justru bisa merusak kepemilikan file dan menimbulkan masalah izin yang sulit dilacak. Gunakan root hanya untuk tugas yang memang tidak bisa dilakukan tanpanya, dan jangan menjadikannya sesi kerja default.

## 2. Pasang dari Sumber Resmi dan Batasi Izin

### Sumber instalasi

Dokumentasi pengembang Termux menyebut bahwa APK didistribusikan lewat GitHub dan F-Droid. Kedua sumber itu ditandatangani dengan kunci berbeda, sehingga **tidak boleh dicampur**. Pasang Termux dan semua add-on-nya (Termux:API, Termux:Boot, dan lainnya) dari sumber yang sama, dan ikuti petunjuk instalasi di repositori resmi `termux-app`. APK dari situs pihak ketiga yang tidak jelas asal-usulnya berisiko dimodifikasi.

### Izin tambahan Termux:API

Paket `termux-api` bersama aplikasi Termux:API memungkinkan skrip memanggil fitur ponsel, misalnya:

```bash
termux-clipboard-get
termux-location
termux-sms-list
```

Setiap fitur tetap membutuhkan izin Android (lokasi, SMS, dan sebagainya). Berikan izin hanya untuk fitur yang benar-benar Anda pakai, dan tinjau berkala lewat Pengaturan Android → Aplikasi → Termux:API → Izin.

### Jangan aktifkan `allow-external-apps` tanpa alasan

Termux memiliki mekanisme `RUN_COMMAND` yang memungkinkan aplikasi lain menjalankan perintah di Termux. Mekanisme ini hanya aktif jika Anda menyetel `allow-external-apps = true` di `~/.termux/termux.properties`. Biarkan nonaktif kecuali Anda memakai otomasi (misalnya Tasker) dan memahami risikonya. Setelah mengubah file tersebut, jalankan `termux-reload-settings`.

## 3. Amankan Akses Jarak Jauh (SSH)

Banyak pengembang memakai Termux sebagai server SSH untuk mengakses ponsel dari komputer. Server OpenSSH di Termux dijalankan manual (Termux tidak memakai sistem init) dan secara bawaan mendengarkan di port **8022**, bukan 22, karena Android tidak mengizinkan aplikasi biasa membuka port di bawah 1024.

```bash
pkg install openssh
whoami          # nama pengguna SSH Anda, mis. u0_a123
sshd            # menjalankan server
pgrep sshd      # memastikan server berjalan
pkill sshd      # menghentikan server
```

### Gunakan autentikasi kunci, bukan kata sandi

Kata sandi bisa ditebak lewat serangan brute force, sedangkan kunci kriptografis praktis tidak. Buat kunci di komputer Anda, lalu daftarkan ke Termux:

```bash
# Di komputer
ssh-keygen -t ed25519 -C "laptop-ke-termux"
ssh-copy-id -p 8022 u0_a123@192.168.1.20
```

`ssh-copy-id` memerlukan login kata sandi sementara. Jalankan `passwd` di Termux lebih dulu, lalu nonaktifkan kata sandi setelah kunci terpasang. Alternatifnya, tempel kunci publik secara manual ke `~/.ssh/authorized_keys` dan pastikan izin file benar, karena `sshd` menolak kunci jika izinnya terlalu longgar:

```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Setelah **memastikan login dengan kunci berhasil**, matikan kata sandi di `$PREFIX/etc/ssh/sshd_config`:

```text
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
```

Uji konfigurasi, lalu muat ulang servis:

```bash
sshd -t && pkill sshd && sshd
```

Jangan menonaktifkan kata sandi sebelum login kunci terbukti berhasil. Anda bisa terkunci dari ponsel sendiri.

### Batasi paparan jaringan

- Matikan `sshd` (`pkill sshd`) saat tidak dipakai, terutama di Wi-Fi publik. Server mendengarkan di semua antarmuka jaringan, sehingga perangkat lain di jaringan yang sama bisa mencoba terhubung.
- Jangan membuka (*port forwarding*) port SSH Termux langsung ke internet publik. Bot pemindai port mulai mencoba login dalam hitungan menit setelah port terbuka. Jika butuh akses dari luar rumah, gunakan VPN seperti WireGuard atau Tailscale.
- Saat pertama kali terhubung, periksa sidik jari (*fingerprint*) host yang ditampilkan klien SSH, jangan langsung menjawab `yes`.

Referensi lengkap pengaturan server ada di manual `sshd_config` OpenSSH.

## 4. Waspadai Skrip "Curl | Bash"

Sering kali kita mencari solusi di internet dan disuguhi perintah seperti ini:

```bash
curl -sL https://situs-tidak-dikenal.com/script.sh | bash
```

Perintah ini mengunduh skrip dan langsung menjalankannya tanpa kesempatan membacanya. Risikonya lebih dari sekadar "mungkin berbahaya":

- **Tidak ada audit.** Isi skrip tidak pernah Anda lihat.
- **Konten bisa berbeda.** Server dapat mengirim isi yang berbeda ke `curl` dibanding ke browser, sehingga skrip yang Anda baca di halaman web belum tentu sama dengan yang dieksekusi.
- **Unduhan bisa terpotong.** Jika koneksi putus di tengah, `bash` bisa mengeksekusi potongan skrip yang tidak lengkap.
- **Domain bisa berpindah tangan.** Skrip yang aman hari ini bisa berubah jika domain atau akun hosting diambil alih.

Di Termux, skrip itu berjalan dengan semua hak yang dimiliki Termux, termasuk akses ke home dan jaringan. Prosedur yang lebih aman:

```bash
curl -fsSL -o install.sh https://contoh.com/install.sh
less install.sh                 # baca isinya
sha256sum install.sh            # bandingkan dengan checksum resmi, jika disediakan
bash install.sh
```

Opsi `-f` membuat `curl` gagal pada error HTTP, `-S` menampilkan pesan galat, dan `-L` mengikuti pengalihan. Untuk skrip yang Anda tulis atau terima, `shellcheck` (`pkg install shellcheck`) dapat menangkap kesalahan umum. Perlu dicatat, membaca skrip tidak menggantikan kepercayaan pada sumbernya. Utamakan paket dari repositori `pkg` dan rilis resmi proyek. Prinsip ini sejalan dengan panduan kami tentang Menyusun Skrip Shell yang Lebih Aman.

## 5. Kelola Penyimpanan (Storage) dengan Bijak

Secara bawaan, Termux terisolasi dari penyimpanan bersama Android. Perintah `termux-setup-storage` meminta izin dan membuat tautan di `~/storage` (misalnya `downloads`, `dcim`, `pictures`, `shared`) menuju folder penyimpanan bersama.

Folder bersama itu bisa diakses banyak aplikasi lain yang memiliki izin penyimpanan. Batasan *scoped storage* di Android 11 ke atas memang memperketat akses, tetapi prinsipnya tetap sama: **penyimpanan bersama bukan tempat rahasia**.

Jangan menyimpan token API, kata sandi, atau kunci SSH privat di Downloads atau folder bersama lainnya. Simpan di direktori home Termux, misalnya `~/.ssh` atau `~/.config`. Ada alasan teknis lain: penyimpanan bersama tidak menerapkan izin file Linux, jadi `chmod 600` tidak berpengaruh di sana, dan OpenSSH menolak kunci privat dengan izin longgar.

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
```

Jika perlu mencadangkan kunci ke penyimpanan bersama, enkripsi dulu:

```bash
pkg install gnupg
tar czf - -C ~ .ssh | gpg -c > ~/storage/downloads/ssh-backup.tar.gz.gpg
```

Jika sudah tidak membutuhkan akses penyimpanan, cabut izinnya lewat Pengaturan Android → Aplikasi → Termux → Izin.

## 6. Rutin Memperbarui Paket

Termux menggunakan manajer paket `pkg`, pembungkus (*wrapper*) dari `apt`. Pembaruan sering kali berisi tambalan keamanan (*security patches*) untuk celah yang baru ditemukan. Rajin-rajinlah menjalankan:

```bash
pkg update && pkg upgrade
```

Jika unduhan lambat atau gagal, `termux-change-repo` membantu memilih mirror lain. Biasakan memperbarui sebelum memasang paket baru, dan hapus paket yang tidak lagi dipakai dengan `pkg uninstall`. Semakin sedikit perangkat lunak terpasang, semakin kecil permukaan serangannya.

### Rantai pasok paket pihak ketiga

Paket dari `pkg` melewati repositori yang dikelola proyek Termux. Paket dari `pip` atau `npm` tidak. Siapa pun dapat menerbitkan paket di sana, termasuk paket dengan nama mirip paket populer (*typosquatting*). Periksa nama dengan teliti, pilih paket yang aktif dipelihara, dan untuk proyek Python gunakan lingkungan terisolasi:

```bash
python -m venv .venv
source .venv/bin/activate
```

## 7. Jika Anda Curiga Sudah Terlanjur Menjalankan Skrip Berbahaya

1. Hentikan layanan yang berjalan: `pkill sshd`.
2. Periksa `~/.ssh/authorized_keys` dan hapus kunci yang tidak Anda kenali.
3. Periksa `~/.bashrc` dan `~/.profile` untuk perintah asing yang berjalan otomatis saat sesi dibuka.
4. Anggap semua token, kata sandi, dan kunci SSH yang tersimpan di Termux telah bocor, lalu ganti (rotasi).
5. Jika ragu, hapus data aplikasi Termux lewat Pengaturan Android dan mulai dari instalasi bersih.

## Kesimpulan

Termux adalah pisau lipat serbaguna di Android Anda. Pengamanan terbaiknya bukan konfigurasi rumit, melainkan kebiasaan: tidak menggunakan root, memasang dari sumber resmi, berhati-hati terhadap skrip asing, mengamankan akses jarak jauh dengan kunci, menyimpan rahasia di tempat yang tepat, dan memperbarui paket secara rutin. Dengan langkah-langkah itu, Anda sudah mengambil langkah besar untuk menjaga keamanan data Anda.

## Sumber

- [Termux Wiki: Remote Access](https://wiki.termux.com/wiki/Remote_Access)
- [Termux Wiki: Termux-setup-storage](https://wiki.termux.com/wiki/Termux-setup-storage)
- [Termux Wiki: Package Management](https://wiki.termux.com/wiki/Package_Management)
- [Termux App: Installation (GitHub)](https://github.com/termux/termux-app#installation)
- [Android Open Source Project: Application Sandbox](https://source.android.com/docs/security/app-sandbox)
- [OpenBSD Manual: sshd_config](https://man.openbsd.org/sshd_config)
