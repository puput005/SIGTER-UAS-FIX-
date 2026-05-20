# WebGIS Kos Sekitar UPN Veteran Yogyakarta

Aplikasi WebGIS sederhana untuk menampilkan persebaran kos-kosan di sekitar UPN "Veteran" Yogyakarta Kampus I. Proyek ini dibuat dengan HTML, CSS, JavaScript, Leaflet.js, OpenStreetMap, dan data GeoJSON.

## Fitur

- Peta interaktif berpusat di area UPN "Veteran" Yogyakarta Kampus I.
- Marker kos-kosan dari file `data/kos.geojson`.
- Popup detail kos: nama, alamat, harga, jenis, fasilitas, kontak, dan jarak dari kampus.
- Sidebar daftar kos.
- Pencarian berdasarkan nama kos.
- Filter jenis kos, harga, fasilitas, dan radius 1 km, 2 km, atau 3 km.
- Form input kos baru langsung dari halaman WebGIS.
- Edit dan hapus data kos dari halaman WebGIS.
- Bisa memakai Supabase agar data input/edit tersimpan online saat website dipublish.
- Pilihan kampus acuan: Kampus I Condongcatur dan Kampus II Babarsari.
- Legenda warna marker.
- Tampilan responsif untuk laptop dan HP.

## Cara Menjalankan di Visual Studio Code

1. Buka folder proyek ini di Visual Studio Code.
2. Pastikan ekstensi **Live Server** sudah terpasang.
3. Klik kanan file `index.html`.
4. Pilih **Open with Live Server**.
5. Browser akan membuka aplikasi WebGIS.

Catatan: jangan membuka `index.html` langsung dengan klik dua kali, karena browser dapat memblokir pemuatan file `data/kos.geojson`. Gunakan Live Server atau server lokal.

## Input Data Langsung dari Halaman WebGIS

Saat aplikasi dibuka dengan Live Server, gunakan panel **Input Kos Baru** di sidebar untuk menambahkan kos. Setelah tombol **Tambah ke Peta** ditekan, marker baru langsung muncul di peta dan daftar kos.

Data yang diinput dari halaman akan tersimpan di `localStorage` browser. Artinya data tetap muncul saat halaman di-refresh, tetapi belum otomatis masuk ke file `data/kos.geojson`.

Jika ingin data permanen di proyek, salin data kos tersebut ke file `data/kos.geojson` atau tambahkan manual mengikuti format GeoJSON di bawah.

Tombol **Hapus Input** hanya menghapus data yang pernah dimasukkan lewat form browser. Data bawaan dari `data/kos.geojson` tidak ikut terhapus.

## Edit dan Hapus Data

Pada daftar kos atau popup marker, klik **Edit** untuk mengubah data kos. Form input akan otomatis berubah menjadi mode edit. Klik **Simpan Perubahan** agar data di peta dan daftar langsung diperbarui.

Klik **Hapus** untuk menghapus satu data kos dari tampilan.

## Agar Data Bisa Diedit Semua Orang Saat Dipublish

Website statis seperti GitHub Pages, Netlify, atau Vercel tidak bisa menyimpan data bersama tanpa database online. Proyek ini sudah disiapkan untuk memakai **Supabase**.

Langkah singkat:

1. Buat project di Supabase.
2. Buka menu **SQL Editor**.
3. Jalankan isi file `supabase-schema.sql`.
4. Buka **Project Settings > API**.
5. Salin **Project URL** dan **anon public key**.
6. Buka file `supabase-config.js`.
7. Isi seperti ini:

```js
window.SUPABASE_CONFIG = {
  url: 'https://project-kamu.supabase.co',
  anonKey: 'anon-key-kamu'
};
```

Setelah itu upload/publish semua file website. Saat Supabase aktif, semua orang yang membuka website bisa menambah, mengedit, dan menghapus data kos yang sama.

Catatan: aturan di `supabase-schema.sql` dibuat terbuka untuk kebutuhan praktikum. Untuk website produksi sungguhan, sebaiknya tambah login/admin agar tidak semua orang bebas menghapus data.

## Cara Mengedit Data Kos

Data kos berada di:

```text
data/kos.geojson
```

Data kampus berada di:

```text
data/kampus.geojson
```

File `data/kampus.geojson` berisi data Kampus I dan Kampus II UPN "Veteran" Yogyakarta. Alamat mengacu pada halaman resmi Peta Kampus UPNYK, sedangkan koordinat disiapkan sebagai titik perkiraan untuk latihan WebGIS.

Setiap kos disimpan sebagai satu `Feature` dengan format seperti ini:

```json
{
  "type": "Feature",
  "properties": {
    "id": "kos-013",
    "nama": "Kos Contoh Baru",
    "alamat": "Alamat singkat kos",
    "harga": 950000,
    "jenis": "putri",
    "fasilitas": ["WiFi", "KM Dalam", "Parkir"],
    "kontak": "08xx-xxxx-xxxx"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [110.41000, -7.76000]
  }
}
```

Urutan koordinat GeoJSON adalah:

```text
[longitude, latitude]
```

## Cara Menambahkan Marker Baru

1. Buka file `data/kos.geojson`.
2. Salin satu objek `Feature` kos yang sudah ada.
3. Tempel di dalam array `features`.
4. Ubah `id`, `nama`, `alamat`, `harga`, `jenis`, `fasilitas`, `kontak`, dan `coordinates`.
5. Pastikan koma antar objek JSON benar.
6. Simpan file, lalu refresh browser.

Nilai `jenis` yang didukung:

```text
putra
putri
campur
```

Fasilitas yang cocok dengan filter bawaan:

```text
WiFi
KM Dalam
AC
Parkir
```

## Catatan Data

Data dalam proyek ini adalah data dummy untuk latihan dan demonstrasi WebGIS. Nama kos, harga, kontak, fasilitas, dan titik koordinat belum mewakili data resmi.

Sebelum digunakan untuk tugas akhir, skripsi, publikasi, pemetaan resmi, atau pengambilan keputusan, data harus divalidasi melalui survei lapangan, wawancara pemilik kos, atau sumber data resmi yang dapat dipertanggungjawabkan.

## Pengembangan Lanjutan

- Menambahkan foto kos.
- Menambahkan rute dari kampus ke kos.
- Menambahkan penyimpanan data ke database.
- Menambahkan panel admin untuk input data kos.
- Menambahkan export data ke CSV atau GeoJSON.
- Menggunakan data hasil survei GPS agar koordinat lebih akurat.
