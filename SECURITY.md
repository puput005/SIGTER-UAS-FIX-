# Security Policy

## Data dan API Key

Project ini menggunakan `supabase-config.js` untuk menyimpan URL Supabase dan anon public key.

Anon key Supabase memang dirancang untuk frontend, tetapi aturan Row Level Security tetap harus diatur dengan benar.

Untuk praktikum, file `supabase-schema.sql` membuka akses insert, update, delete, dan select untuk publik. Untuk penggunaan produksi, sebaiknya:

- Tambahkan login.
- Batasi edit/hapus hanya untuk admin.
- Validasi data sebelum masuk database.
- Jangan menyimpan service role key di frontend.

## Melaporkan Masalah Keamanan

Jika menemukan celah keamanan, jangan mempublikasikan data sensitif. Buat issue dengan deskripsi umum atau hubungi pemilik project secara langsung.
