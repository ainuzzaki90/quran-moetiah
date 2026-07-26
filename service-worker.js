/**
 * ============================================================
 *  Service Worker — Moetiah Quran App
 * ------------------------------------------------------------
 *  Tujuan:
 *  1. Membuat app bisa dibuka lagi (app shell) walau koneksi
 *     lemah/putus, dengan menyimpan file statis (HTML/CSS/JS/ikon)
 *     di cache browser.
 *  2. TIDAK pernah men-cache permintaan ke backend (Apps Script),
 *     karena data setoran/presensi harus selalu real-time — bukan
 *     data lama dari cache.
 *
 *  PENTING SAAT UPDATE APLIKASI:
 *  Setiap kali Anda mengubah index.html/style.css/script.js dan
 *  mengunggahnya ulang, naikkan angka di CACHE_VERSION di bawah
 *  (mis. 'v1' -> 'v2'). Ini memaksa semua pengguna mengambil versi
 *  baru, bukan versi lama yang tersimpan di HP mereka.
 * ============================================================
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `moetiah-quran-shell-${CACHE_VERSION}`;

// File-file "app shell" yang disimpan agar halaman tetap bisa
// dibuka walau offline. Sesuaikan daftar ini kalau Anda menambah
// file statis baru (mis. font atau gambar tambahan).
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/style.css',
  './assets/script.js',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-512-maskable.png'
];

// ---------- INSTALL: simpan app shell ke cache ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ---------- ACTIVATE: buang cache versi lama ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('moetiah-quran-shell-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- FETCH: strategi beda untuk shell vs data backend ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Jangan pernah ikut campur permintaan POST (semua panggilan API
  // ke Apps Script memakai POST) — biarkan lewat langsung ke jaringan.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Permintaan ke domain lain (mis. script.google.com untuk API,
  // fonts.googleapis.com) dibiarkan langsung ke jaringan, tidak di-cache,
  // supaya data setoran/presensi selalu yang terbaru.
  if (url.origin !== self.location.origin) return;

  // Untuk file app shell sendiri: cache-first, lalu perbarui cache
  // di belakang layar (stale-while-revalidate) supaya update kecil
  // tetap terambil di kunjungan berikutnya tanpa membuat pengguna
  // menunggu jaringan setiap kali membuka app.
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached); // offline & tidak ada di cache -> biarkan gagal dengan tenang

      return cached || networkFetch;
    })
  );
});
