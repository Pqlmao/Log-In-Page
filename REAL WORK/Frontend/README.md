# MyPlayList

## Menjalankan aplikasi lokal

1. Pastikan PostgreSQL aktif dan buat database kosong untuk MyPlayList.
2. Dari `../Backend`, salin `.env.example` sebagai `.env`, isi `DATABASE_URL`, dan
   atur `DB_SSL=false` untuk PostgreSQL lokal tanpa SSL. Untuk database hosted,
   gunakan `DB_SSL=true`. Variabel `DEMO_EMAIL` dan `DEMO_PASSWORD` dapat
   dibiarkan pada nilai contoh untuk pengembangan lokal.
3. Dari folder `../Backend`, jalankan `npm install`, lalu setup database.
   Di PowerShell gunakan `npm.cmd run db:setup`; di Command Prompt gunakan
   `npm run db:setup`.
   Perintah ini membuat/memperbarui skema, memasukkan katalog contoh, serta membuat
   akun lokal `test@gmail.com` dengan kata sandi `1234`.
4. Jalankan backend dengan `npm.cmd run dev` di PowerShell (`npm run dev` di
   Command Prompt). API tersedia di `http://localhost:3000`.
5. Dari folder frontend ini jalankan `npm install`, lalu `npm.cmd run dev` di
   PowerShell (`npm run dev` di Command Prompt). Buka `http://localhost:5173`.

PowerShell di Windows dapat memblokir `npm.ps1` karena execution policy. Gunakan
`npm.cmd` untuk menjalankan perintah npm tanpa mengubah policy sistem.

Jangan gunakan akun demo atau kata sandi contoh di lingkungan produksi. Untuk
produksi, atur `DEMO_EMAIL` dan `DEMO_PASSWORD` dengan nilai privat sebelum
menjalankan `npm run db:setup`, jangan publikasikan file `.env`, dan atur
`CORS_ORIGIN` ke origin frontend yang sebenarnya.

## Mode login

Backend adalah mode default. Login mengirim kredensial ke `POST /api/auth/login`;
token sesi disimpan di `sessionStorage` dan dikirim sebagai Bearer token untuk
fitur yang membutuhkan akun.

Mode simulasi frontend dapat diaktifkan secara eksplisit dengan membuat file
`.env` frontend berisi `VITE_DEMO_LOGIN=true`. Mode ini hanya untuk tampilan lokal:
data yang diubah tidak disimpan ke database. Hapus pengaturan tersebut untuk
menggunakan backend.

## Fitur yang tersambung

- `GET /api/health`: status koneksi PostgreSQL.
- `GET /api/media/home` dan `GET /api/media/rankings`: katalog serta ranking.
- `GET /api/media/games/:slug`: detail, skor, status favorit, dan ulasan.
- `PUT /api/media/games/:slug/library`: menyimpan status/favorit.
- `POST /api/media/games/:slug/reviews`: menyimpan rating dan ulasan.
- `GET /api/profile/me` dan `PUT /api/profile/me`: statistik serta pengaturan
  nama/bio akun.
- `POST /api/auth/logout`: menghapus sesi aktif.

Skema dan data katalog awal ada di `../Database/schema.sql`. Gambar katalog masih
menggunakan URL Unsplash, sedangkan avatar Larp menggunakan aset lokal frontend.
