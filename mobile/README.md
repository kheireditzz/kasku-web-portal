# KasKu Mobile (iOS & Android)

Aplikasi **KasKu** versi standalone APK/IPA menggunakan **React Native + Expo (Hermes Engine)** dengan integrasi **Full-Fidelity Web View**.
- **Bundle ID (iOS)**: `com.kheireditz.app`
- **Package Name (Android)**: `com.kheireditz.app`
- **Versi**: `1.3.0` (Build VersionCode: `3`)
- **Tampilan**: 100% identik dengan Web KasKu (`https://kasku.kheireditz.my.id/app`) lengkap dengan tema Tailwind CSS, animasi, grafik keuangan, mode kasir, tabungan, Voice AI, dan kalkulator.
- **Fitur Native**:
  - Tombol Back hardware Android terintegrasi (history navigasi).
  - Status Bar Dark Slate (`#0f172a`) seamless.
  - Layar splash & loading terintegrasi.
  - Layar offline fallback dengan tombol "Coba Lagi" saat tidak ada koneksi.

---

## 🛠️ Cara Build APK Standalone (EAS Cloud Build)

Jalankan perintah berikut di folder `mobile`:

```bash
cd /data/data/com.termux/files/home/kasku/mobile
npm run build:android
```

Setelah build selesai di cloud EAS, kamu akan mendapatkan link download file `.apk` standalone terbaru yang siap langsung diinstall di perangkat Android.
