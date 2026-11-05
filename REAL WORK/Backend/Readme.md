# Mengaktifkan backend MyPlayList di Windows

Ikuti langkah-langkah ini dari PowerShell. Backend membutuhkan PostgreSQL yang
sedang berjalan; menjalankan server Node.js saja belum cukup untuk login atau
mengakses data.

## 1. Pastikan Node.js dan PostgreSQL tersedia

- Pasang Node.js versi LTS jika belum tersedia. Periksa dari PowerShell:

  ```powershell
  node --version
  npm.cmd --version
  ```

- Pasang PostgreSQL untuk Windows, atau pastikan database PostgreSQL hosted
  yang akan digunakan sudah aktif.

## 2. Nyalakan PostgreSQL

Untuk PostgreSQL lokal, cari nama service dari PowerShell:

```powershell
Get-Service *postgres*
```

Jika service ditemukan tetapi berhenti, nyalakan dengan PowerShell **Run as
Administrator**. Ganti nama contoh di bawah dengan nama yang ditampilkan:

```powershell
Start-Service -Name postgresql-x64-16
```

Jika tidak ada service, PostgreSQL lokal mungkin belum terpasang atau database
berjalan di container/host lain. Nyalakan database tersebut atau gunakan alamat
host dan port database yang benar di langkah berikutnya.

## 3. Buat database kosong

Buat database bernama `myplaylist` menggunakan pgAdmin atau `psql`. Contoh
perintah di `psql`:

```sql
CREATE DATABASE myplaylist;
```

Jalankan perintah itu sebagai user PostgreSQL yang memiliki izin membuat
database. Jika database dengan nama tersebut sudah ada, tidak perlu dibuat lagi.

## 4. Atur koneksi database

Dari folder backend:

```powershell
Set-Location 'C:\Layap\REAL WORK\Backend'
```

Buat atau edit file `.env` di folder tersebut. Jangan menimpa `.env` yang sudah
berisi konfigurasi lain; perbarui nilai yang diperlukan saja:

```dotenv
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/myplaylist
DB_SSL=false
```

Ganti `postgres` dan `YOUR_PASSWORD` sesuai user dan kata sandi PostgreSQL Anda.
Jika kata sandi mengandung karakter khusus URL seperti `@`, `:`, `/`, atau `#`,
URL-encode karakter tersebut. Untuk database hosted, gunakan connection string
dari penyedia database dan atur `DB_SSL=true`.

## 5. Pasang dependency backend

Jalankan dari folder `Backend`:

```powershell
npm.cmd ci
```

## 6. Siapkan skema, katalog, dan akun demo

```powershell
npm.cmd run db:setup
```

Perintah ini membuat/memperbarui skema dan data katalog dari
`..\Database\schema.sql`, lalu membuat atau memperbarui akun demo. Jika
`DEMO_EMAIL` dan `DEMO_PASSWORD` tidak diatur di `.env`, kredensial lokalnya
adalah `test@gmail.com` dan `1234`.

Pastikan langkah ini selesai tanpa pesan `Setup database gagal`. Jika muncul
`ECONNREFUSED` pada `localhost:5432`, PostgreSQL belum menerima koneksi di host
atau port tersebut; periksa service dan `DATABASE_URL`. Jika muncul error
autentikasi, periksa user dan kata sandi di `DATABASE_URL`.

## 7. Jalankan backend

Di terminal PowerShell pada folder `Backend`:

```powershell
npm.cmd run dev
```

Biarkan terminal ini tetap terbuka. Pesan `MyPlayList API berjalan di
http://localhost:3000` berarti server API sudah hidup, tetapi belum memastikan
koneksi database berhasil.

## 8. Pastikan database terhubung

Buka alamat ini di browser:

```text
http://localhost:3000/api/health
```

Backend siap digunakan jika hasilnya menunjukkan:

```json
{"success":true,"database":"connected"}
```

Jika mendapat HTTP 503 atau `database: "unavailable"`, periksa terminal backend,
pastikan PostgreSQL aktif, lalu periksa host, port, user, kata sandi, dan nama
database pada `DATABASE_URL`.

## 9. Jalankan frontend dan login

Di terminal PowerShell kedua, jalankan frontend dari foldernya:

```powershell
Set-Location 'C:\Layap\REAL WORK\Frontend'
npm.cmd ci
npm.cmd run dev
```

Buka `http://localhost:5173` dan login dengan `test@gmail.com` / `1234` jika
kredensial demo tidak diubah di `.env` backend. Frontend meneruskan permintaan
API ke backend di `http://localhost:3000`.

Gunakan akun demo hanya untuk pengembangan lokal. Jangan gunakan kata sandi
contoh di produksi atau membagikan file `.env`.