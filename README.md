# 🕌 Keuangan Santri (Pesantren Finance Management)

![Keuangan Santri Banner](https://via.placeholder.com/1200x600/0f172a/10b981?text=Keuangan+Santri+-+Dashboard)

**Keuangan Santri** adalah sebuah aplikasi web modern yang dirancang khusus untuk mengelola sisa uang saku dan riwayat transaksi (pemasukan & pengeluaran) para santri di kamar pesantren secara transparan, akurat, dan mudah diakses.

Aplikasi ini memiliki **Portal Publik** yang memungkinkan Wali Santri untuk memantau sisa uang saku anak mereka secara *real-time* dari rumah tanpa perlu melakukan login.

🔗 **Live Demo:** [keuangan-kamar-11.vercel.app](https://keuangan-kamar-11-git-main-fiilmudhori26s-projects.vercel.app/) *(Ubah dengan URL Vercel Anda yang lebih rapi jika ada)*

---

## ✨ Fitur Utama

- 📊 **Dashboard Pengurus:** Pantau total saldo kamar, total pengeluaran, dan grafik transaksi terbaru.
- 👥 **Manajemen Santri:** Tambah, edit, dan hapus data santri beserta sisa saldo mereka.
- 💸 **Pencatatan Transaksi:** Catat setiap pemasukan (uang saku masuk) dan pengeluaran (uang jajan/kebutuhan) santri. Saldo santri akan otomatis ter-*update*.
- 🔍 **Portal Wali (Publik):** Halaman khusus pencarian nama anak untuk melihat sisa uang saku dan riwayat jajan secara transparan tanpa perlu repot login.
- ⚡ **Performa Tinggi:** Menggunakan efek *Skeleton Loading* untuk perpindahan halaman yang instan.
- 🌓 **Mode Gelap/Terang:** Antarmuka modern yang ramah di mata dengan fitur Dark Mode.

---

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Aplikasi ini dibangun menggunakan teknologi *Full-Stack* terbaru dan terbaik di tahun ini:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Di-host di Supabase)
- **ORM:** [Prisma v6](https://www.prisma.io/)
- **Authentication:** [Supabase Auth](https://supabase.com/) & SSR Middleware
- **Deployment:** [Vercel](https://vercel.com/) (Edge Network)

---

## 📸 Panduan Menambahkan Screenshot (Untuk Portofolio)

> **Catatan untuk Pemilik Repo:** Hapus blok ini dan ganti dengan *screenshot* asli dari aplikasi Anda agar portofolionya terlihat profesional!

1. Masukkan foto halaman **Dashboard** di sini.
2. Masukkan foto halaman **Portal Wali (Pencarian)** di sini.
3. Masukkan foto halaman **Detail Transaksi Santri** di sini.

---

## 🚀 Instalasi & Menjalankan di Komputer Lokal

Jika Anda ingin mengkloning dan menjalankan proyek ini di komputer Anda sendiri:

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/fiilmudhori26/keuangan-kamar-11.git
   cd keuangan-kamar-11
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Atur Environment Variables:**
   Buat file `.env` di folder utama dan isi dengan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=your_transaction_pooler_url
   DIRECT_URL=your_session_url
   ```

4. **Sinkronisasi Database:**
   ```bash
   npx prisma db push
   ```

5. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di browser Anda.

---

## 👨‍💻 Dibuat Oleh

**[Nama Anda]**  
*Full-Stack Web Developer*  
[LinkedIn](https://linkedin.com/in/username-anda) • [GitHub](https://github.com/fiilmudhori26)
