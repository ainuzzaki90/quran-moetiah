/**
 * ============================================================
 *  MOETIAH QURAN APP — BACKEND (Google Apps Script)
 *  Code.gs — seluruh backend digabung dalam satu file.
 * ------------------------------------------------------------
 *  Urutan bagian dalam file ini:
 *  1. Config     - konstanta sheet & keamanan, setupSheets()
 *  2. Db         - helper baca/tulis sheet + locking
 *  3. Auth       - login, sesi, proteksi brute-force
 *  4. Helpers    - tanggal, predikat, posisi terakhir, relasi penyimak-santri
 *  5. Actions_Master   - dashboard, santri, kelas, users, binaan
 *  6. Actions_Setoran  - setoran, statistik, rekap/rapor
 *  7. Actions_Presensi - presensi harian & rekap kehadiran
 *  8. Actions_Progress - progress nilai & kehadiran per siswa
 *  9. Router     - doGet/doPost, pemetaan action -> handler
 *
 *  CARA PAKAI:
 *  1. Jalankan setupSheets() sekali (aman dijalankan berulang).
 *  2. Deploy > New deployment > Web app > Execute as: Me,
 *     Who has access: Anyone.
 *  3. Pakai URL hasil deploy sebagai API_URL di script.js frontend.
 * ============================================================
 */


// ============================================================
// BAGIAN: Config.gs
// ============================================================
/**
 * ============================================================
 *  MOETIAH QURAN APP — BACKEND (Google Apps Script)
 *  File: Config.gs
 *  Berisi: konstanta sheet, konfigurasi keamanan, dan setup awal.
 * ============================================================
 *
 * CARA PAKAI:
 * 1. Jalankan fungsi setupSheets() sekali untuk membuat struktur sheet
 *    + akun admin default (username: admin | password: admin123).
 *    Aman dijalankan ulang — hanya menambah sheet/kolom yang belum ada.
 * 2. Deploy > New deployment > Web app > Execute as: Me, Who has access: Anyone.
 * 3. Pakai URL hasil deploy sebagai API_URL di script.js frontend.
 * 4. (Disarankan) Buat trigger time-driven untuk cleanExpiredSessions()
 *    setiap beberapa jam agar sheet Sessions tidak terus menumpuk.
 */

// ============== NAMA SHEET ==============
const SHEET_USERS = 'Users';
const SHEET_KELAS = 'Kelas';
const SHEET_SANTRI = 'Santri';
const SHEET_SETORAN = 'Setoran';
const SHEET_SESSIONS = 'Sessions';
const SHEET_PENYIMAK_SANTRI = 'PenyimakSantri';
const SHEET_PRESENSI = 'Presensi';

// ============== KEAMANAN ==============
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;   // 8 jam
const LOGIN_MAX_ATTEMPTS = 5;                      // percobaan login gagal sebelum dikunci
const LOGIN_LOCKOUT_SECONDS = 15 * 60;             // 15 menit
const VALID_ROLES = ['admin', 'penyimak', 'santri', 'tamu'];

// ============== SKEMA SHEET ==============
const SHEET_SCHEMAS = {
  [SHEET_USERS]: ['id', 'nama', 'username', 'password', 'role', 'kelas_id', 'status'],
  [SHEET_KELAS]: ['id', 'nama_kelas', 'penyimak_id'],
  [SHEET_SANTRI]: ['id', 'nama', 'nis', 'kelas_id', 'jenis_kelamin', 'tanggal_lahir', 'user_id', 'level_ummi'],
  [SHEET_SETORAN]: ['id', 'tanggal', 'santri_id', 'kelas_id', 'penyimak_id', 'jenis', 'surah', 'ayat_mulai',
    'surah_selesai', 'ayat_selesai', 'halaman_mulai', 'halaman_selesai', 'nilai', 'predikat', 'nilai_tajwid',
    'nilai_fashohah', 'nilai_kelancaran', 'catatan'],
  [SHEET_SESSIONS]: ['token', 'user_id', 'role', 'kelas_id', 'created_at', 'expires_at'],
  [SHEET_PENYIMAK_SANTRI]: ['id', 'penyimak_id', 'santri_id'],
  [SHEET_PRESENSI]: ['id', 'tanggal', 'kelas_id', 'penyimak_id', 'santri_id', 'status', 'materi', 'catatan']
};

/**
 * Membuat seluruh sheet & header yang dibutuhkan aplikasi jika belum ada,
 * lalu menambahkan akun admin default jika tabel Users masih kosong.
 * Aman dijalankan berulang kali (idempotent) — tidak menghapus data lama.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.keys(SHEET_SCHEMAS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(SHEET_SCHEMAS[name]);
      sheet.setFrozenRows(1);
    } else {
      // Tambahkan kolom baru yang belum ada (migrasi dari versi lama)
      const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      SHEET_SCHEMAS[name].forEach(h => {
        if (existingHeaders.indexOf(h) === -1) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(h);
        }
      });
    }
  });

  const usersSheet = ss.getSheetByName(SHEET_USERS);
  if (usersSheet.getLastRow() <= 1) {
    usersSheet.appendRow([1, 'Administrator', 'admin', hashPassword('admin123'), 'admin', '', 'aktif']);
    Logger.log('Akun admin default dibuat -> username: admin | password: admin123. Segera ganti password ini.');
  }

  Logger.log('Setup selesai.');
}


// ============================================================
// BAGIAN: Db.gs
// ============================================================
/**
 * ============================================================
 *  File: Db.gs
 *  Helper generic untuk baca/tulis Google Sheet sebagai "tabel".
 *
 *  CATATAN KEAMANAN:
 *  insertRow() dan operasi tulis lain dibungkus LockService di
 *  withLock() supaya dua request yang datang bersamaan (mis. dua
 *  penyimak submit setoran di detik yang sama) tidak saling
 *  menimpa/duplikasi ID. Tanpa lock ini, nextId() bisa membaca ID
 *  yang sama untuk dua request paralel dan salah satu data akan
 *  menimpa baris yang lain.
 * ============================================================
 */

// Penanda apakah eksekusi saat ini sudah memegang script lock, supaya
// pemanggilan withLock() yang bersarang (mis. actionSavePresensi yang
// memanggil insertRow) tidak mencoba mengunci dua kali dalam satu eksekusi.
let _dbLockHeld = false;

/**
 * Menjalankan sebuah fungsi di dalam script lock, supaya tidak ada
 * request lain yang menulis ke sheet secara bersamaan (race condition).
 * Reentrant-safe: jika lock ini sudah dipegang oleh pemanggil di luar
 * (dalam eksekusi yang sama), tidak akan mengunci ulang.
 * @param {Function} fn fungsi yang dijalankan di dalam lock
 * @param {number} [timeoutMs] batas waktu tunggu lock (default 10 detik)
 */
function withLock(fn, timeoutMs) {
  if (_dbLockHeld) return fn();
  const lock = LockService.getScriptLock();
  lock.waitLock(timeoutMs || 10000);
  _dbLockHeld = true;
  try {
    return fn();
  } finally {
    _dbLockHeld = false;
    lock.releaseLock();
  }
}

function getSheet(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" tidak ditemukan. Jalankan setupSheets() dulu.');
  return sheet;
}

function sheetToObjects(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1)
    .filter(r => r.join('') !== '')
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i]);
      return obj;
    });
}

function nextId(sheetName) {
  const objs = sheetToObjects(sheetName);
  if (objs.length === 0) return 1;
  return Math.max.apply(null, objs.map(o => Number(o.id) || 0)) + 1;
}

/**
 * Menambah satu baris baru. Dibungkus lock supaya id auto-increment
 * tidak bentrok saat ada beberapa request bersamaan.
 */
function insertRow(sheetName, dataObj) {
  return withLock(() => {
    const sheet = getSheet(sheetName);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (headers.indexOf('id') !== -1 && dataObj.id === undefined) {
      dataObj.id = nextId(sheetName);
    }
    const row = headers.map(h => dataObj[h] !== undefined ? dataObj[h] : '');
    sheet.appendRow(row);
    return dataObj;
  });
}

function updateRow(sheetName, id, updates) {
  return withLock(() => {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf('id');
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(id)) {
        headers.forEach((h, c) => {
          if (updates[h] !== undefined) sheet.getRange(i + 1, c + 1).setValue(updates[h]);
        });
        return true;
      }
    }
    return false;
  });
}

function deleteRow(sheetName, id) {
  return deleteRowByField(sheetName, 'id', id);
}

function deleteRowByField(sheetName, field, value) {
  return withLock(() => {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const col = data[0].indexOf(field);
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][col]) === String(value)) {
        sheet.deleteRow(i + 1);
        return true;
      }
    }
    return false;
  });
}

function findOne(sheetName, field, value) {
  return sheetToObjects(sheetName).find(o => String(o[field]) === String(value));
}


// ============================================================
// BAGIAN: Auth.gs
// ============================================================
/**
 * ============================================================
 *  File: Auth.gs
 *  Login, manajemen sesi, dan proteksi brute-force sederhana.
 * ============================================================
 */

function hashPassword(plain) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, plain, Utilities.Charset.UTF_8);
  return raw.map(b => ((b < 0 ? b + 256 : b).toString(16)).padStart(2, '0')).join('');
}

// ---------- Proteksi brute-force (per username, via CacheService) ----------
function loginAttemptKey(username) {
  return 'login_attempts_' + String(username).toLowerCase().trim();
}

function getLoginAttempts(username) {
  const cache = CacheService.getScriptCache();
  const raw = cache.get(loginAttemptKey(username));
  return raw ? Number(raw) : 0;
}

function registerFailedLogin(username) {
  const cache = CacheService.getScriptCache();
  const key = loginAttemptKey(username);
  const attempts = getLoginAttempts(username) + 1;
  cache.put(key, String(attempts), LOGIN_LOCKOUT_SECONDS);
  return attempts;
}

function clearLoginAttempts(username) {
  CacheService.getScriptCache().remove(loginAttemptKey(username));
}

// ---------- Sesi ----------
function createSession(user) {
  const token = Utilities.getUuid();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DURATION_MS);
  insertRow(SHEET_SESSIONS, {
    token: token, user_id: user.id, role: user.role, kelas_id: user.kelas_id,
    created_at: now.toISOString(), expires_at: expires.toISOString()
  });
  return token;
}

function getSessionUser(token) {
  if (!token) return null;
  const session = findOne(SHEET_SESSIONS, 'token', token);
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

function requireAuth(token) {
  const session = getSessionUser(token);
  if (!session) throw new Error('Sesi tidak valid atau kedaluwarsa, silakan login ulang');
  return session;
}

/**
 * Membersihkan baris sesi yang sudah kedaluwarsa. Dipanggil sesekali saat
 * login supaya sheet Sessions tidak terus membesar tanpa batas. Bisa juga
 * dijadwalkan sebagai trigger waktu terpisah untuk aplikasi dengan trafik
 * tinggi.
 */
function cleanExpiredSessions() {
  withLock(() => {
    const sheet = getSheet(SHEET_SESSIONS);
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    const headers = data[0];
    const expCol = headers.indexOf('expires_at');
    const now = new Date();
    for (let i = data.length - 1; i >= 1; i--) {
      if (new Date(data[i][expCol]) < now) sheet.deleteRow(i + 1);
    }
  });
}

// ---------- Actions ----------
function actionLogin(payload) {
  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');
  if (!username || !password) return { ok: false, error: 'Username dan password wajib diisi' };

  const attempts = getLoginAttempts(username);
  if (attempts >= LOGIN_MAX_ATTEMPTS) {
    return { ok: false, error: 'Terlalu banyak percobaan gagal. Coba lagi dalam beberapa menit.' };
  }

  const user = findOne(SHEET_USERS, 'username', username);
  if (!user || user.status !== 'aktif' || user.password !== hashPassword(password)) {
    registerFailedLogin(username);
    return { ok: false, error: 'Username atau password salah' };
  }

  clearLoginAttempts(username);
  // Peluang kecil untuk sekalian bersih-bersih sesi kedaluwarsa tanpa
  // membebani setiap request (hanya saat login).
  try { cleanExpiredSessions(); } catch (e) { /* tidak fatal jika gagal */ }

  const token = createSession(user);
  return { ok: true, token: token, user: { id: user.id, nama: user.nama, role: user.role, kelas_id: user.kelas_id } };
}

function actionLogout(token) {
  deleteRowByField(SHEET_SESSIONS, 'token', token);
  return { ok: true };
}


// ============================================================
// BAGIAN: Helpers.gs
// ============================================================
/**
 * ============================================================
 *  File: Helpers.gs
 *  Fungsi bantu lintas modul: tanggal/periode, tahun ajaran,
 *  predikat nilai, posisi terakhir hafalan, dan relasi
 *  penyimak <-> santri.
 * ============================================================
 */

// ============== RELASI PENYIMAK <-> SANTRI ==============
// Satu penyimak bisa membina banyak santri lintas kelas & level; satu santri
// bisa dibina lebih dari satu penyimak (misal penyimak utama + pengganti).
function getSantriIdsForPenyimak(penyimakId) {
  return sheetToObjects(SHEET_PENYIMAK_SANTRI)
    .filter(r => String(r.penyimak_id) === String(penyimakId))
    .map(r => String(r.santri_id));
}

function isSantriBinaanPenyimak(santriId, penyimakId) {
  return getSantriIdsForPenyimak(penyimakId).indexOf(String(santriId)) !== -1;
}

// Ambil kelas_id milik seorang santri (dipakai saat menyimpan setoran, karena
// penyimak bisa membina siswa lintas kelas — kelas baris setoran harus ikut
// data santri yang sebenarnya, bukan kelas sesi penyimak).
function getKelasIdSantri(santriId) {
  const santri = findOne(SHEET_SANTRI, 'id', santriId);
  return santri ? (santri.kelas_id || '') : '';
}

// ============== PREDIKAT (skala umum tahfiz/Ummi) ==============
function calcPredikat(nilai) {
  const n = Number(nilai);
  if (isNaN(n)) return '';
  if (n >= 95) return 'Mumtaz';
  if (n >= 85) return 'Jayyid Jiddan';
  if (n >= 75) return 'Jayyid';
  if (n >= 60) return 'Maqbul';
  return 'Rasib';
}

// ============== POSISI TERAKHIR (progress hafalan) ==============
/**
 * Menentukan "posisi terakhir" (progress hafalan) seorang santri dari
 * baris-baris setoran miliknya. Hanya jenis 'Setoran Metode Ummi' (dihitung
 * per halaman, untuk level Jilid) dan 'Hafalan Baru' (dihitung per surah/ayat,
 * untuk siswa yang sudah masuk Al-Qur'an) yang dianggap penanda posisi maju --
 * Murojaah & Tilawah adalah pengulangan materi lama, bukan capaian baru.
 * @param {Array} rowsSantri baris-baris SHEET_SETORAN milik SATU santri (sudah difilter)
 * @return {Object|null} { jenis, label, tanggal } atau null kalau belum ada data
 */
function computePosisiTerakhir(rowsSantri) {
  const relevan = rowsSantri
    .filter(r => r.jenis === 'Setoran Metode Ummi' || r.jenis === 'Hafalan Baru')
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  if (!relevan.length) return null;
  const r = relevan[0];
  const label = r.jenis === 'Setoran Metode Ummi'
    ? 'Halaman ' + (r.halaman_selesai || r.halaman_mulai || '-')
    : (r.surah_selesai || r.surah || '-') + ' : Ayat ' + (r.ayat_selesai || r.ayat_mulai || '-');
  return { jenis: r.jenis, label: label, tanggal: r.tanggal };
}

// ============== TANGGAL / PERIODE ==============
function computeDateRange(payload) {
  if (payload.periode === 'tentatif') {
    const start = new Date(payload.tanggal_mulai);
    const end = new Date(payload.tanggal_selesai + 'T23:59:59');
    return { start, end };
  }
  const ref = payload.tanggal_referensi ? new Date(payload.tanggal_referensi) : new Date();

  if (payload.periode === 'harian') {
    const start = new Date(ref); start.setHours(0, 0, 0, 0);
    const end = new Date(ref); end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (payload.periode === 'pekanan') {
    const start = new Date(ref);
    const day = start.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);
    start.setDate(start.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  // default: bulanan
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

// Normalisasi nilai tanggal dari sheet ke format yyyy-MM-dd (aman untuk
// perbandingan string), memakai timezone project. Dipakai di presensi.
function normalizeTanggal(v) {
  const tz = Session.getScriptTimeZone();
  if (!v) return '';
  try { return Utilities.formatDate(new Date(v), tz, 'yyyy-MM-dd'); } catch (e) { return String(v).substring(0, 10); }
}

/**
 * Menghitung tahun ajaran berdasarkan tanggal sekarang atau tahun yg diberikan.
 * Tahun ajaran Indonesia: Juli - Juni.
 *   - Bulan 7-12 -> tahun ajaran "YYYY/YYYY+1"  (Semester Ganjil)
 *   - Bulan 1-6  -> tahun ajaran "YYYY-1/YYYY"  (Semester Genap)
 * Contoh: Juli 2026 -> "2026/2027" | Maret 2027 -> "2026/2027"
 */
function getTahunAjaran(refDate) {
  const d = refDate || new Date();
  const thn = d.getFullYear();
  const bln = d.getMonth() + 1;
  if (bln >= 7) return { tahun_ajaran: thn + '/' + (thn + 1), semester: 1 };
  return { tahun_ajaran: (thn - 1) + '/' + thn, semester: 2 };
}


// ============================================================
// BAGIAN: Actions_Master.gs
// ============================================================
/**
 * ============================================================
 *  File: Actions_Master.gs
 *  Aksi untuk: Dashboard, Santri, Kelas, Pengguna, Binaan Penyimak.
 * ============================================================
 */

// ============== DASHBOARD ==============
function actionGetDashboard(token) {
  const session = requireAuth(token);
  let setoran = sheetToObjects(SHEET_SETORAN);
  let santri = sheetToObjects(SHEET_SANTRI);

  if (session.role === 'penyimak') {
    const binaanIds = getSantriIdsForPenyimak(session.user_id);
    setoran = setoran.filter(s => binaanIds.indexOf(String(s.santri_id)) !== -1);
    santri = santri.filter(s => binaanIds.indexOf(String(s.id)) !== -1);
  } else if (session.role === 'santri') {
    const me = findOne(SHEET_SANTRI, 'user_id', session.user_id);
    setoran = setoran.filter(s => me && String(s.santri_id) === String(me.id));
    santri = me ? [me] : [];
  }

  const nilaiValid = setoran.map(s => Number(s.nilai)).filter(n => !isNaN(n));
  const rataNilai = nilaiValid.length ? (nilaiValid.reduce((a, b) => a + b, 0) / nilaiValid.length) : 0;

  const now = new Date();
  const bulanIni = setoran.filter(s => {
    const d = new Date(s.tanggal);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const terbaru = setoran.slice().sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal)).slice(0, 10);

  return {
    ok: true,
    stats: {
      total_setoran: setoran.length,
      total_santri: santri.length,
      rata_nilai: Math.round(rataNilai * 100) / 100,
      setoran_bulan_ini: bulanIni
    },
    setoran_terbaru: terbaru
  };
}

// ============== SANTRI ==============
function actionGetSantri(token, payload) {
  const session = requireAuth(token);
  let data = sheetToObjects(SHEET_SANTRI);
  // binaan_only=true -> penyimak hanya lihat siswa binaannya (untuk dropdown setoran)
  if (session.role === 'penyimak' && payload.binaan_only) {
    const binaanIds = getSantriIdsForPenyimak(session.user_id);
    data = data.filter(s => binaanIds.indexOf(String(s.id)) !== -1);
  }
  // santri hanya lihat data dirinya sendiri
  if (session.role === 'santri') data = data.filter(s => String(s.user_id) === String(session.user_id));
  if (payload.kelas_id) data = data.filter(s => String(s.kelas_id) === String(payload.kelas_id));

  // with_posisi=true -> sertakan posisi terakhir (halaman/surah) tiap siswa.
  // Opsional supaya pemanggilan ringan (mis. dropdown lain) tidak selalu ikut
  // membaca sheet Setoran kalau memang tidak butuh info ini.
  if (payload.with_posisi) {
    const setoranAll = sheetToObjects(SHEET_SETORAN);
    data = data.map(s => {
      const rows = setoranAll.filter(r => String(r.santri_id) === String(s.id));
      const posisi = computePosisiTerakhir(rows);
      return Object.assign({}, s, {
        posisi_terakhir: posisi ? posisi.label : '-',
        posisi_terakhir_jenis: posisi ? posisi.jenis : ''
      });
    });
  }
  return { ok: true, data: data };
}

function actionAddSantri(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin' && session.role !== 'penyimak') throw new Error('Tidak diizinkan');
  if (!payload.nama || !String(payload.nama).trim()) throw new Error('Nama santri wajib diisi');
  const row = insertRow(SHEET_SANTRI, {
    nama: String(payload.nama).trim(), nis: payload.nis, kelas_id: payload.kelas_id || '',
    jenis_kelamin: payload.jenis_kelamin, tanggal_lahir: payload.tanggal_lahir,
    user_id: payload.user_id || '', level_ummi: payload.level_ummi || ''
  });
  if (session.role === 'penyimak') {
    insertRow(SHEET_PENYIMAK_SANTRI, { penyimak_id: session.user_id, santri_id: row.id });
  }
  return { ok: true, data: row };
}

/**
 * Menyimpan banyak data santri sekaligus (dipakai oleh fitur Upload Template
 * di frontend). payload: { list: [ {nama, nis, kelas_id, jenis_kelamin,
 * tanggal_lahir, level_ummi}, ... ] }
 */
function actionAddSantriBulk(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin' && session.role !== 'penyimak') throw new Error('Tidak diizinkan');
  const list = payload.list || [];
  let inserted = 0;
  const errors = [];
  list.forEach((item, idx) => {
    try {
      if (!item.nama) { errors.push('Baris ' + (idx + 1) + ': nama kosong, dilewati'); return; }
      const row = insertRow(SHEET_SANTRI, {
        nama: item.nama, nis: item.nis || '', kelas_id: item.kelas_id || '',
        jenis_kelamin: item.jenis_kelamin || '', tanggal_lahir: item.tanggal_lahir || '',
        user_id: '', level_ummi: item.level_ummi || ''
      });
      if (session.role === 'penyimak') {
        insertRow(SHEET_PENYIMAK_SANTRI, { penyimak_id: session.user_id, santri_id: row.id });
      }
      inserted++;
    } catch (e) {
      errors.push('Baris ' + (idx + 1) + ': ' + e.message);
    }
  });
  return { ok: true, inserted: inserted, errors: errors };
}

function actionUpdateSantri(token, payload) {
  requireAuth(token);
  if (!payload.id) throw new Error('id santri wajib diisi');
  const ok = updateRow(SHEET_SANTRI, payload.id, payload);
  if (!ok) throw new Error('Data santri tidak ditemukan');
  return { ok: true };
}

function actionDeleteSantri(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa menghapus data santri');
  if (!payload.id) throw new Error('id santri wajib diisi');
  deleteRow(SHEET_SANTRI, payload.id);
  return { ok: true };
}

// ============== KELAS ==============
function actionGetKelas(token) {
  requireAuth(token);
  return { ok: true, data: sheetToObjects(SHEET_KELAS) };
}

function actionAddKelas(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa menambah kelas');
  if (!payload.nama_kelas || !String(payload.nama_kelas).trim()) throw new Error('Nama kelas wajib diisi');
  const row = insertRow(SHEET_KELAS, { nama_kelas: String(payload.nama_kelas).trim(), penyimak_id: payload.penyimak_id || '' });
  return { ok: true, data: row };
}

function actionUpdateKelas(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa mengubah data kelas');
  if (!payload.id) throw new Error('id kelas wajib diisi');
  const updates = {};
  if (payload.nama_kelas !== undefined) updates.nama_kelas = payload.nama_kelas;
  if (payload.penyimak_id !== undefined) updates.penyimak_id = payload.penyimak_id;
  const ok = updateRow(SHEET_KELAS, payload.id, updates);
  if (!ok) throw new Error('Kelas tidak ditemukan');
  return { ok: true };
}

function actionDeleteKelas(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa menghapus kelas');
  if (!payload.id) throw new Error('id kelas wajib diisi');
  deleteRow(SHEET_KELAS, payload.id);
  return { ok: true };
}

// ============== USERS (admin only) ==============
function actionGetUsers(token) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa melihat daftar user');
  const data = sheetToObjects(SHEET_USERS).map(u => {
    const copy = Object.assign({}, u);
    delete copy.password;
    return copy;
  });
  return { ok: true, data: data };
}

function actionAddUser(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa menambah user');
  const username = String(payload.username || '').trim();
  if (!username) throw new Error('Username wajib diisi');
  if (VALID_ROLES.indexOf(payload.role) === -1) throw new Error('Role tidak valid');
  if (findOne(SHEET_USERS, 'username', username)) throw new Error('Username sudah dipakai');
  const row = insertRow(SHEET_USERS, {
    nama: payload.nama, username: username,
    password: hashPassword(payload.password || '123456'),
    role: payload.role, kelas_id: payload.kelas_id || '', status: 'aktif'
  });
  const copy = Object.assign({}, row);
  delete copy.password;
  return { ok: true, data: copy };
}

function actionUpdateUser(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa mengubah data pengguna');
  if (!payload.id) throw new Error('id pengguna wajib diisi');
  if (payload.role !== undefined && VALID_ROLES.indexOf(payload.role) === -1) throw new Error('Role tidak valid');
  const updates = {};
  if (payload.nama !== undefined) updates.nama = payload.nama;
  if (payload.username !== undefined) updates.username = String(payload.username).trim();
  if (payload.role !== undefined) updates.role = payload.role;
  if (payload.kelas_id !== undefined) updates.kelas_id = payload.kelas_id;
  if (payload.status !== undefined) updates.status = payload.status;
  const ok = updateRow(SHEET_USERS, payload.id, updates);
  if (!ok) throw new Error('Pengguna tidak ditemukan');
  return { ok: true };
}

function actionDeleteUser(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa menghapus pengguna');
  if (!payload.id) throw new Error('id pengguna wajib diisi');
  if (String(payload.id) === String(session.user_id)) throw new Error('Tidak bisa menghapus akun sendiri');
  deleteRow(SHEET_USERS, payload.id);
  return { ok: true };
}

function actionChangePassword(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa mereset password');
  if (!payload.id) throw new Error('id pengguna wajib diisi');
  if (!payload.password || String(payload.password).length < 6) {
    throw new Error('Password baru wajib diisi, minimal 6 karakter');
  }
  const ok = updateRow(SHEET_USERS, payload.id, { password: hashPassword(payload.password) });
  if (!ok) throw new Error('Pengguna tidak ditemukan');
  return { ok: true };
}

// ============== BINAAN PENYIMAK (siswa lintas kelas & level) ==============
/**
 * Mengambil daftar santri_id yang dibina seorang penyimak.
 * - admin: wajib kirim payload.penyimak_id untuk melihat binaan penyimak tertentu
 *   (tanpa penyimak_id, mengembalikan SEMUA data binaan untuk keperluan frontend).
 * - penyimak: otomatis melihat binaannya sendiri (payload.penyimak_id diabaikan).
 */
function actionGetPenyimakSantri(token, payload) {
  const session = requireAuth(token);
  const all = sheetToObjects(SHEET_PENYIMAK_SANTRI);
  if (session.role === 'admin') {
    if (!payload.penyimak_id) return { ok: true, data: all };
    return { ok: true, data: all.filter(r => String(r.penyimak_id) === String(payload.penyimak_id)) };
  }
  if (session.role === 'penyimak') {
    return { ok: true, data: all.filter(r => String(r.penyimak_id) === String(session.user_id)) };
  }
  throw new Error('Tidak diizinkan');
}

/**
 * Menyimpan ulang seluruh daftar santri binaan seorang penyimak (replace,
 * bukan tambah). payload: { penyimak_id, santri_ids: [id1, id2, ...] }
 * Hanya admin yang boleh mengatur ini, supaya satu sumber kebenaran (dari
 * menu Pengguna).
 */
function actionSetPenyimakSantri(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin') throw new Error('Hanya admin yang bisa mengatur binaan penyimak');
  const penyimakId = payload.penyimak_id;
  if (!penyimakId) throw new Error('penyimak_id wajib diisi');
  const santriIds = payload.santri_ids || [];

  withLock(() => {
    const sheet = getSheet(SHEET_PENYIMAK_SANTRI);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const penyimakCol = headers.indexOf('penyimak_id');
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][penyimakCol]) === String(penyimakId)) sheet.deleteRow(i + 1);
    }
    santriIds.forEach(sid => insertRow(SHEET_PENYIMAK_SANTRI, { penyimak_id: penyimakId, santri_id: sid }));
  });

  return { ok: true, count: santriIds.length };
}


// ============================================================
// BAGIAN: Actions_Setoran.gs
// ============================================================
/**
 * ============================================================
 *  File: Actions_Setoran.gs
 *  Aksi untuk: Setoran (setoran harian), Statistik, dan Rekap/Rapor.
 * ============================================================
 */

// ============== SETORAN ==============
function actionGetSetoran(token, payload) {
  const session = requireAuth(token);
  let data = sheetToObjects(SHEET_SETORAN);
  if (session.role === 'penyimak') {
    const binaanIds = getSantriIdsForPenyimak(session.user_id);
    data = data.filter(s => binaanIds.indexOf(String(s.santri_id)) !== -1);
  }
  if (session.role === 'santri') {
    const me = findOne(SHEET_SANTRI, 'user_id', session.user_id);
    data = data.filter(s => me && String(s.santri_id) === String(me.id));
  }
  if (payload.santri_id) data = data.filter(s => String(s.santri_id) === String(payload.santri_id));
  data.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  return { ok: true, data: data };
}

function buildSetoranRow(session, tanggal, santriId, kelasId, item) {
  const predikat = item.predikat && item.predikat !== '' ? item.predikat : calcPredikat(item.nilai);
  return {
    tanggal: tanggal, santri_id: santriId, kelas_id: kelasId || getKelasIdSantri(santriId),
    penyimak_id: session.user_id, jenis: item.jenis, surah: item.surah || '',
    ayat_mulai: item.ayat_mulai || '', surah_selesai: item.surah_selesai || item.surah || '',
    ayat_selesai: item.ayat_selesai || '',
    halaman_mulai: item.halaman_mulai || '', halaman_selesai: item.halaman_selesai || '',
    nilai: item.nilai, predikat: predikat, nilai_tajwid: item.nilai_tajwid || '',
    nilai_fashohah: item.nilai_fashohah || '', nilai_kelancaran: item.nilai_kelancaran || '',
    catatan: item.catatan || ''
  };
}

function actionAddSetoran(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin' && session.role !== 'penyimak') throw new Error('Tidak diizinkan');
  if (!payload.santri_id) throw new Error('santri_id wajib diisi');
  if (!payload.tanggal) throw new Error('Tanggal wajib diisi');
  const row = insertRow(SHEET_SETORAN, buildSetoranRow(session, payload.tanggal, payload.santri_id, payload.kelas_id, payload));
  return { ok: true, data: row };
}

function actionAddSetoranBulk(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin' && session.role !== 'penyimak') throw new Error('Tidak diizinkan');
  const list = payload.list || [];
  const inserted = list.map(item =>
    insertRow(SHEET_SETORAN, buildSetoranRow(session, item.tanggal, item.santri_id, item.kelas_id, item))
  );
  return { ok: true, inserted: inserted.length };
}

/**
 * Menyimpan beberapa baris setoran sekaligus dalam satu submit. Dipakai oleh
 * form Setoran yang dinamis: jenis setoran (Hafalan Baru/Murojaah/Tilawah)
 * dipilih bebas sesuai kebutuhan harian, tidak wajib semua jenis sekaligus.
 */
function actionAddSetoranBatch(token, payload) {
  const session = requireAuth(token);
  if (session.role !== 'admin' && session.role !== 'penyimak') throw new Error('Tidak diizinkan');
  if (!payload.santri_id) throw new Error('santri_id wajib diisi');
  if (!payload.tanggal) throw new Error('Tanggal wajib diisi');
  const items = payload.items || [];
  const kelasId = payload.kelas_id || getKelasIdSantri(payload.santri_id);
  const inserted = items.map(it => {
    const item = Object.assign({}, it, { catatan: payload.catatan || '' });
    return insertRow(SHEET_SETORAN, buildSetoranRow(session, payload.tanggal, payload.santri_id, kelasId, item));
  });
  return { ok: true, count: inserted.length };
}

function actionUpdateSetoran(token, payload) {
  requireAuth(token);
  if (!payload.id) throw new Error('id setoran wajib diisi');
  const updates = {};
  ['nilai', 'predikat', 'jenis', 'catatan', 'halaman_mulai', 'halaman_akhir',
    'surah', 'ayat_mulai', 'ayat_akhir', 'tajwid', 'fashohah', 'kelancaran'
  ].forEach(field => { if (payload[field] !== undefined) updates[field] = payload[field]; });
  const ok = updateRow(SHEET_SETORAN, payload.id, updates);
  if (!ok) throw new Error('Data setoran tidak ditemukan');
  return { ok: true };
}

function actionDeleteSetoran(token, payload) {
  const session = requireAuth(token);
  if (!payload.id) throw new Error('id setoran wajib diisi');
  if (session.role === 'penyimak') {
    const row = findOne(SHEET_SETORAN, 'id', payload.id);
    if (!row) throw new Error('Data setoran tidak ditemukan');
    if (String(row.penyimak_id) !== String(session.user_id)) {
      throw new Error('Tidak berhak menghapus setoran ini');
    }
  }
  deleteRow(SHEET_SETORAN, payload.id);
  return { ok: true };
}

// ============== STATISTIK ==============
function actionGetStatistik(token, payload) {
  const session = requireAuth(token);
  const { start, end } = computeDateRange(payload);

  const setoranAllTime = sheetToObjects(SHEET_SETORAN);
  let setoran = setoranAllTime.filter(s => {
    const d = new Date(s.tanggal);
    return d >= start && d <= end;
  });
  let santriScope = sheetToObjects(SHEET_SANTRI);

  if (session.role === 'penyimak') {
    const binaanIds = getSantriIdsForPenyimak(session.user_id);
    setoran = setoran.filter(s => binaanIds.indexOf(String(s.santri_id)) !== -1);
    santriScope = santriScope.filter(s => binaanIds.indexOf(String(s.id)) !== -1);
  }
  if (session.role === 'santri') {
    const me = findOne(SHEET_SANTRI, 'user_id', session.user_id);
    setoran = setoran.filter(s => me && String(s.santri_id) === String(me.id));
    santriScope = me ? [me] : [];
  }
  if (payload.santri_id && payload.santri_id !== 'all') {
    setoran = setoran.filter(s => String(s.santri_id) === String(payload.santri_id));
    santriScope = santriScope.filter(s => String(s.id) === String(payload.santri_id));
  }
  if (payload.kelas_id) {
    santriScope = santriScope.filter(s => String(s.kelas_id) === String(payload.kelas_id));
  }

  const nilaiArr = setoran.map(s => Number(s.nilai)).filter(n => !isNaN(n));
  const rata = nilaiArr.length ? nilaiArr.reduce((a, b) => a + b, 0) / nilaiArr.length : 0;

  const perHari = {};
  const perJenis = {};
  const perPredikat = {};
  const tz = Session.getScriptTimeZone();
  setoran.forEach(s => {
    let tglKey;
    try {
      tglKey = Utilities.formatDate(new Date(s.tanggal), tz, 'yyyy-MM-dd');
    } catch (e) {
      tglKey = String(s.tanggal || '').substring(0, 10);
    }
    if (tglKey && tglKey !== 'NaN-Na-Na') {
      perHari[tglKey] = (perHari[tglKey] || 0) + 1;
    }
    perJenis[s.jenis] = (perJenis[s.jenis] || 0) + 1;
    if (s.predikat) perPredikat[s.predikat] = (perPredikat[s.predikat] || 0) + 1;
  });

  // Peringkat capaian per siswa pada periode terpilih (diurutkan dari nilai
  // rata-rata tertinggi). Frontend bisa mengurutkan ulang jika diinginkan.
  const kelasAllForRank = sheetToObjects(SHEET_KELAS);
  const peringkat = santriScope.map(santri => {
    const rows = setoran.filter(s => String(s.santri_id) === String(santri.id));
    const nilaiArrS = rows.map(r => Number(r.nilai)).filter(n => !isNaN(n));
    const rataS = nilaiArrS.length ? nilaiArrS.reduce((a, b) => a + b, 0) / nilaiArrS.length : 0;
    const kelas = kelasAllForRank.find(k => String(k.id) === String(santri.kelas_id));
    // Posisi terakhir dihitung dari SELURUH riwayat (bukan cuma periode filter
    // statistik ini), supaya benar-benar mencerminkan capaian terkini siswa.
    const rowsAllTime = setoranAllTime.filter(s => String(s.santri_id) === String(santri.id));
    const posisi = computePosisiTerakhir(rowsAllTime);
    return {
      santri_id: santri.id, nama: santri.nama, kelas_nama: kelas ? kelas.nama_kelas : '',
      level_ummi: santri.level_ummi || '',
      total_setoran: rows.length, rata_nilai: Math.round(rataS * 100) / 100,
      posisi_terakhir: posisi ? posisi.label : '-'
    };
  }).sort((a, b) => b.rata_nilai - a.rata_nilai);

  return {
    ok: true,
    total_setoran: setoran.length,
    rata_nilai: Math.round(rata * 100) / 100,
    per_hari: perHari,
    per_jenis: perJenis,
    per_predikat: perPredikat,
    peringkat: peringkat
  };
}

// ============== REKAP & RAPOR ==============
function actionGetRekap(token, payload) {
  const session = requireAuth(token);
  const tahun = Number(payload.tahun);

  // Mendukung rekap bulanan (bulan tunggal) dan semester (bulan_mulai..bulan_akhir).
  const bulanMulai = Number(payload.bulan_mulai || payload.bulan || 1);
  const bulanAkhir = Number(payload.bulan_akhir || payload.bulan || 12);
  const periodLabel = bulanMulai === bulanAkhir ? payload.bulan : bulanMulai + '-' + bulanAkhir;

  let setoran = sheetToObjects(SHEET_SETORAN).filter(s => {
    const d = new Date(s.tanggal);
    const m = d.getMonth() + 1;
    return d.getFullYear() === tahun && m >= bulanMulai && m <= bulanAkhir;
  });
  let santriList = sheetToObjects(SHEET_SANTRI);
  const kelasAll = sheetToObjects(SHEET_KELAS);
  const usersAll = sheetToObjects(SHEET_USERS);
  const penyimakSantriAll = sheetToObjects(SHEET_PENYIMAK_SANTRI);

  if (session.role === 'penyimak') {
    const binaanIds = getSantriIdsForPenyimak(session.user_id);
    setoran = setoran.filter(s => binaanIds.indexOf(String(s.santri_id)) !== -1);
    santriList = santriList.filter(s => binaanIds.indexOf(String(s.id)) !== -1);
  } else if (session.role === 'santri') {
    const me = findOne(SHEET_SANTRI, 'user_id', session.user_id);
    santriList = me ? [me] : [];
    setoran = setoran.filter(s => me && String(s.santri_id) === String(me.id));
  }
  if (payload.kelas_id) santriList = santriList.filter(s => String(s.kelas_id) === String(payload.kelas_id));
  if (payload.santri_id) santriList = santriList.filter(s => String(s.id) === String(payload.santri_id));

  const hasil = santriList.map(santri => {
    const rows = setoran.filter(s => String(s.santri_id) === String(santri.id))
      .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    const nilaiArr = rows.map(r => Number(r.nilai)).filter(n => !isNaN(n));
    const rata = nilaiArr.length ? nilaiArr.reduce((a, b) => a + b, 0) / nilaiArr.length : 0;
    const kelas = kelasAll.find(k => String(k.id) === String(santri.kelas_id));

    // Cari nama penyimak: dari relasi PenyimakSantri, ambil yang pertama.
    // Jika tidak ada, fallback ke penyimak_id terbanyak dari baris setoran.
    let penyimakNama = '';
    const relasi = penyimakSantriAll.find(r => String(r.santri_id) === String(santri.id));
    if (relasi) {
      const pUser = usersAll.find(u => String(u.id) === String(relasi.penyimak_id));
      if (pUser) penyimakNama = pUser.nama;
    }
    if (!penyimakNama && rows.length) {
      const freq = {};
      rows.forEach(r => { if (r.penyimak_id) freq[r.penyimak_id] = (freq[r.penyimak_id] || 0) + 1; });
      const topId = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];
      if (topId) {
        const pUser = usersAll.find(u => String(u.id) === String(topId));
        if (pUser) penyimakNama = pUser.nama;
      }
    }

    // Posisi terakhir DI AKHIR PERIODE INI (bukan all-time) -- supaya rapor
    // lama yang dicetak ulang tetap akurat menampilkan capaian saat itu,
    // bukan capaian terkini yang sudah lebih maju.
    const posisi = computePosisiTerakhir(rows);

    return {
      santri_id: santri.id, nama: santri.nama, nis: santri.nis,
      kelas_nama: kelas ? kelas.nama_kelas : '', level_ummi: santri.level_ummi || '',
      penyimak_nama: penyimakNama,
      total_setoran: rows.length, rata_nilai: Math.round(rata * 100) / 100,
      posisi_terakhir: posisi ? posisi.label : '-',
      detail: rows
    };
  });

  const taRef = new Date(tahun, (bulanMulai === 1 ? 0 : bulanMulai - 1), 1);
  const ta = getTahunAjaran(taRef);
  return { ok: true, bulan: periodLabel, tahun: tahun, tahun_ajaran: ta.tahun_ajaran, semester: ta.semester, data: hasil };
}


// ============================================================
// BAGIAN: Actions_Presensi.gs
// ============================================================
/**
 * ============================================================
 *  File: Actions_Presensi.gs
 *  Aksi untuk: Presensi harian & Rekap Kehadiran.
 * ============================================================
 */

/**
 * getPresensi — ambil data presensi.
 * Filter opsional: kelas_id, tanggal_mulai, tanggal_akhir, santri_id
 */
function actionGetPresensi(token, payload) {
  const session = requireAuth(token);
  let data = sheetToObjects(SHEET_PRESENSI);
  data = data.map(r => Object.assign({}, r, { tanggal_str: normalizeTanggal(r.tanggal) }));

  if (session.role === 'penyimak') {
    data = data.filter(r => String(r.penyimak_id) === String(session.user_id));
  }
  if (session.role === 'admin' && payload.penyimak_id) {
    data = data.filter(r => String(r.penyimak_id) === String(payload.penyimak_id));
  }
  if (payload.santri_id)     data = data.filter(r => String(r.santri_id) === String(payload.santri_id));
  if (payload.tanggal_mulai) data = data.filter(r => r.tanggal_str >= payload.tanggal_mulai);
  if (payload.tanggal_akhir) data = data.filter(r => r.tanggal_str <= payload.tanggal_akhir);

  data.sort((a, b) => b.tanggal_str.localeCompare(a.tanggal_str));
  // Kembalikan tanggal_str yang sudah dinormalisasi sebagai field tanggal
  // agar frontend menampilkannya dengan konsisten.
  data = data.map(r => Object.assign({}, r, { tanggal: r.tanggal_str }));

  return { ok: true, data };
}

/**
 * savePresensi — simpan presensi satu sesi sekaligus, dikelompokkan per
 * penyimak (replace data lama pada tanggal + penyimak yang sama).
 * payload: { tanggal, penyimak_id (opsional, admin saja), materi, catatan,
 *            rows: [{ santri_id, kelas_id, status }] }
 */
function actionSavePresensi(token, payload) {
  const session = requireAuth(token);
  if (!payload.tanggal) throw new Error('Tanggal wajib diisi');
  if (!payload.rows || !payload.rows.length) throw new Error('Data presensi siswa wajib diisi');

  const effectivePenyimakId = (session.role === 'admin' && payload.penyimak_id)
    ? String(payload.penyimak_id)
    : String(session.user_id);

  withLock(() => {
    const sheet = getSheet(SHEET_PRESENSI);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idxId = headers.indexOf('id'), idxTanggal = headers.indexOf('tanggal'),
      idxKelasId = headers.indexOf('kelas_id'), idxPenyimakId = headers.indexOf('penyimak_id'),
      idxSantriId = headers.indexOf('santri_id'), idxStatus = headers.indexOf('status'),
      idxMateri = headers.indexOf('materi'), idxCatatan = headers.indexOf('catatan');

    // Hapus baris presensi lama untuk tanggal + penyimak yang sama (replace)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const allData = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
      const rowsToDelete = [];
      allData.forEach((row, i) => {
        if (normalizeTanggal(row[idxTanggal]) === String(payload.tanggal) &&
            String(row[idxPenyimakId]) === effectivePenyimakId) {
          rowsToDelete.push(i + 2);
        }
      });
      rowsToDelete.reverse().forEach(r => sheet.deleteRow(r));
    }

    // Tambahkan baris baru per siswa
    payload.rows.forEach(item => {
      const newRow = new Array(headers.length).fill('');
      newRow[idxId] = Utilities.getUuid();
      newRow[idxTanggal] = payload.tanggal;
      newRow[idxKelasId] = item.kelas_id || '';
      newRow[idxPenyimakId] = effectivePenyimakId;
      newRow[idxSantriId] = item.santri_id;
      newRow[idxStatus] = item.status || 'Hadir';
      newRow[idxMateri] = payload.materi || '';
      newRow[idxCatatan] = payload.catatan || '';
      sheet.appendRow(newRow);
    });
  });

  return { ok: true };
}

function actionDeletePresensi(token, payload) {
  const session = requireAuth(token);
  if (!payload.tanggal) throw new Error('tanggal wajib diisi');
  const effectivePenyimakId = (session.role === 'admin' && payload.penyimak_id)
    ? String(payload.penyimak_id)
    : String(session.user_id);

  withLock(() => {
    const sheet = getSheet(SHEET_PRESENSI);
    if (sheet.getLastRow() <= 1) return;
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idxTanggal = headers.indexOf('tanggal'), idxPenyimakId = headers.indexOf('penyimak_id');
    const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
    const toDelete = [];
    allData.forEach((row, i) => {
      if (normalizeTanggal(row[idxTanggal]) === String(payload.tanggal) &&
          String(row[idxPenyimakId]) === effectivePenyimakId) {
        toDelete.push(i + 2);
      }
    });
    toDelete.reverse().forEach(r => sheet.deleteRow(r));
  });

  return { ok: true };
}

/**
 * getRekapPresensi — ringkasan kehadiran per siswa dalam rentang
 * tanggal/semester.
 * Return: [{ santri_id, nama, kelas_nama, hadir, izin, sakit, alfa, total, pct_hadir }]
 */
function actionGetRekapPresensi(token, payload) {
  const session = requireAuth(token);
  let data = sheetToObjects(SHEET_PRESENSI);
  data = data.map(r => Object.assign({}, r, { tanggal_str: normalizeTanggal(r.tanggal) }));

  if (session.role === 'penyimak') {
    data = data.filter(r => String(r.penyimak_id) === String(session.user_id));
  }
  if (payload.penyimak_id)   data = data.filter(r => String(r.penyimak_id) === String(payload.penyimak_id));
  if (payload.kelas_id)      data = data.filter(r => String(r.kelas_id) === String(payload.kelas_id));
  if (payload.tanggal_mulai) data = data.filter(r => r.tanggal_str >= payload.tanggal_mulai);
  if (payload.tanggal_akhir) data = data.filter(r => r.tanggal_str <= payload.tanggal_akhir);

  const santriList = sheetToObjects(SHEET_SANTRI);
  const kelasList = sheetToObjects(SHEET_KELAS);
  const kelasMap = {};
  kelasList.forEach(k => { kelasMap[k.id] = k.nama_kelas; });

  const map = {};
  data.forEach(r => {
    const sid = String(r.santri_id);
    if (!map[sid]) map[sid] = { santri_id: sid, hadir: 0, izin: 0, sakit: 0, alfa: 0 };
    const st = (r.status || 'Hadir').toLowerCase();
    if (st === 'hadir') map[sid].hadir++;
    else if (st === 'izin') map[sid].izin++;
    else if (st === 'sakit') map[sid].sakit++;
    else map[sid].alfa++;
  });

  const result = santriList.map(s => {
    const sid = String(s.id);
    const rec = map[sid] || { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
    const total = rec.hadir + rec.izin + rec.sakit + rec.alfa;
    return {
      santri_id: sid, nama: s.nama, nis: s.nis,
      kelas_nama: kelasMap[s.kelas_id] || '-',
      level_ummi: s.level_ummi || '-',
      hadir: rec.hadir, izin: rec.izin, sakit: rec.sakit, alfa: rec.alfa,
      total, pct_hadir: total > 0 ? Math.round(rec.hadir / total * 100) : 0
    };
  }).filter(r => r.total > 0 || payload.show_all);

  result.sort((a, b) => b.hadir - a.hadir);
  return { ok: true, data: result };
}


// ============================================================
// BAGIAN: Actions_Progress.gs
// ============================================================
/**
 * ============================================================
 *  File: Actions_Progress.gs
 *  Aksi untuk halaman "Progress Siswa": tren nilai setoran dari
 *  waktu ke waktu + konsistensi kehadiran, memakai data Setoran
 *  dan Presensi yang sudah ada (tidak perlu skema data baru).
 * ============================================================
 */

/**
 * getProgressSiswa — ringkasan progress satu siswa.
 * payload: { santri_id, tanggal_mulai, tanggal_akhir }
 * Default rentang: 90 hari terakhir jika tanggal tidak diisi.
 *
 * Aturan akses:
 *  - santri  : hanya bisa lihat progress dirinya sendiri (santri_id diabaikan)
 *  - penyimak: hanya bisa lihat siswa binaannya
 *  - admin/tamu: bebas pilih siswa mana pun
 */
function actionGetProgressSiswa(token, payload) {
  const session = requireAuth(token);

  // ---------- Tentukan santri_id yang sebenarnya boleh diakses ----------
  let santriId = payload.santri_id;
  if (session.role === 'santri') {
    const me = findOne(SHEET_SANTRI, 'user_id', session.user_id);
    if (!me) throw new Error('Akun ini belum terhubung ke data santri');
    santriId = me.id;
  } else if (session.role === 'penyimak') {
    if (!santriId) throw new Error('santri_id wajib diisi');
    if (!isSantriBinaanPenyimak(santriId, session.user_id)) {
      throw new Error('Siswa ini bukan binaan Anda');
    }
  } else {
    if (!santriId) throw new Error('santri_id wajib diisi');
  }

  const santri = findOne(SHEET_SANTRI, 'id', santriId);
  if (!santri) throw new Error('Data santri tidak ditemukan');
  const kelas = findOne(SHEET_KELAS, 'id', santri.kelas_id);

  // ---------- Rentang tanggal (default: 90 hari terakhir) ----------
  const end = payload.tanggal_akhir ? new Date(payload.tanggal_akhir + 'T23:59:59') : new Date();
  const start = payload.tanggal_mulai
    ? new Date(payload.tanggal_mulai)
    : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

  // ---------- Tren nilai setoran ----------
  let setoran = sheetToObjects(SHEET_SETORAN)
    .filter(s => String(s.santri_id) === String(santriId))
    .filter(s => { const d = new Date(s.tanggal); return d >= start && d <= end; })
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const nilaiTrend = setoran
    .filter(s => !isNaN(Number(s.nilai)))
    .map(s => ({ tanggal: s.tanggal, nilai: Number(s.nilai), jenis: s.jenis, predikat: s.predikat }));

  const semuaNilai = nilaiTrend.map(n => n.nilai);
  const rataKeseluruhan = semuaNilai.length ? semuaNilai.reduce((a, b) => a + b, 0) / semuaNilai.length : 0;

  // Bandingkan paruh pertama vs paruh kedua (berdasarkan urutan waktu) untuk
  // menentukan arah tren: naik / turun / stabil.
  let tren = 'stabil', deltaNilai = 0, rataAwal = 0, rataAkhir = 0;
  if (nilaiTrend.length >= 4) {
    const tengah = Math.floor(nilaiTrend.length / 2);
    const paruhAwal = nilaiTrend.slice(0, tengah).map(n => n.nilai);
    const paruhAkhir = nilaiTrend.slice(tengah).map(n => n.nilai);
    rataAwal = paruhAwal.reduce((a, b) => a + b, 0) / paruhAwal.length;
    rataAkhir = paruhAkhir.reduce((a, b) => a + b, 0) / paruhAkhir.length;
    deltaNilai = rataAkhir - rataAwal;
    if (deltaNilai >= 1) tren = 'naik';
    else if (deltaNilai <= -1) tren = 'turun';
  }

  // Agregasi rata-rata nilai per minggu (untuk grafik batang tren mingguan)
  const tz = Session.getScriptTimeZone();
  const perMinggu = {};
  nilaiTrend.forEach(n => {
    const d = new Date(n.tanggal);
    const awalPekan = new Date(d);
    const hari = awalPekan.getDay();
    awalPekan.setDate(awalPekan.getDate() - (hari === 0 ? 6 : hari - 1));
    let key;
    try { key = Utilities.formatDate(awalPekan, tz, 'yyyy-MM-dd'); } catch (e) { key = String(n.tanggal).substring(0, 10); }
    if (!perMinggu[key]) perMinggu[key] = { total: 0, count: 0 };
    perMinggu[key].total += n.nilai;
    perMinggu[key].count += 1;
  });
  const rataPerMinggu = {};
  Object.keys(perMinggu).sort().forEach(k => {
    rataPerMinggu[k] = Math.round((perMinggu[k].total / perMinggu[k].count) * 100) / 100;
  });

  // ---------- Konsistensi kehadiran ----------
  const presensi = sheetToObjects(SHEET_PRESENSI)
    .filter(p => String(p.santri_id) === String(santriId))
    .filter(p => { const d = new Date(normalizeTanggal(p.tanggal)); return d >= start && d <= end; });

  const hadirCount = { hadir: 0, izin: 0, sakit: 0, alfa: 0 };
  presensi.forEach(p => {
    const st = (p.status || 'Hadir').toLowerCase();
    if (st === 'hadir') hadirCount.hadir++;
    else if (st === 'izin') hadirCount.izin++;
    else if (st === 'sakit') hadirCount.sakit++;
    else hadirCount.alfa++;
  });
  const totalPresensi = hadirCount.hadir + hadirCount.izin + hadirCount.sakit + hadirCount.alfa;
  const pctHadir = totalPresensi > 0 ? Math.round((hadirCount.hadir / totalPresensi) * 100) : null;

  // ---------- Posisi terakhir (all-time, tidak dibatasi rentang tanggal filter) ----------
  const rowsAllTime = sheetToObjects(SHEET_SETORAN).filter(s => String(s.santri_id) === String(santriId));
  const posisi = computePosisiTerakhir(rowsAllTime);

  return {
    ok: true,
    santri: { id: santri.id, nama: santri.nama, kelas_nama: kelas ? kelas.nama_kelas : '-', level_ummi: santri.level_ummi || '-' },
    rentang: { mulai: Utilities.formatDate(start, tz, 'yyyy-MM-dd'), akhir: Utilities.formatDate(end, tz, 'yyyy-MM-dd') },
    total_setoran: setoran.length,
    rata_nilai: Math.round(rataKeseluruhan * 100) / 100,
    tren: { arah: tren, delta: Math.round(deltaNilai * 100) / 100, rata_awal: Math.round(rataAwal * 100) / 100, rata_akhir: Math.round(rataAkhir * 100) / 100 },
    posisi_terakhir: posisi ? { label: posisi.label, jenis: posisi.jenis, tanggal: posisi.tanggal } : null,
    nilai_per_minggu: rataPerMinggu,
    nilai_trend: nilaiTrend,
    kehadiran: Object.assign({}, hadirCount, { total: totalPresensi, pct_hadir: pctHadir })
  };
}


// ============================================================
// BAGIAN: Router.gs
// ============================================================
/**
 * ============================================================
 *  File: Router.gs
 *  Entry point web app (doGet/doPost) dan pemetaan action -> handler.
 * ============================================================
 */

function doGet(e) {
  return jsonResponse({ ok: true, message: 'API Tahfiz aktif. Gunakan POST untuk mengakses data.' });
}

// Aksi yang boleh diakses role 'tamu' (hanya baca/lihat). Di luar daftar ini,
// permintaan dari akun tamu ditolak SEBELUM handler dipanggil -- jadi
// perlindungannya tidak bergantung pada UI (tombol yang disembunyikan di
// frontend hanyalah kenyamanan tampilan, bukan lapisan keamanan).
const GUEST_ALLOWED_ACTIONS = new Set([
  'login', 'logout',
  'getDashboard', 'getSantri', 'getKelas', 'getSetoran', 'getStatistik',
  'getRekap', 'getPenyimakSantri', 'getPresensi', 'getRekapPresensi', 'getProgressSiswa'
]);

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Body request tidak valid (harus JSON)' });
  }

  const action = body.action;
  const payload = body.payload || {};
  const token = body.token;
  const handler = ACTION_HANDLERS[action];

  if (!handler) {
    return jsonResponse({ ok: false, error: 'Aksi tidak dikenal: ' + action });
  }

  // Blokir akun tamu dari semua aksi selain daftar baca di atas, terlepas
  // dari apa yang sudah dicegah tampilan frontend.
  if (token && !GUEST_ALLOWED_ACTIONS.has(action)) {
    const session = getSessionUser(token);
    if (session && session.role === 'tamu') {
      return jsonResponse({ ok: false, error: 'Akun tamu hanya bisa melihat data, tidak bisa mengubah.' });
    }
  }

  try {
    return jsonResponse(handler(token, payload));
  } catch (err) {
    console.error('Aksi "' + action + '" gagal: ' + err.message);
    return jsonResponse({ ok: false, error: err.message });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Peta action -> fungsi handler. Semua handler dipanggil dengan (token, payload)
// untuk konsistensi, meski beberapa tidak memakai payload/token secara langsung.
const ACTION_HANDLERS = {
  login: (token, payload) => actionLogin(payload),
  logout: (token) => actionLogout(token),
  getDashboard: (token) => actionGetDashboard(token),

  getSantri: (token, payload) => actionGetSantri(token, payload),
  addSantri: (token, payload) => actionAddSantri(token, payload),
  addSantriBulk: (token, payload) => actionAddSantriBulk(token, payload),
  updateSantri: (token, payload) => actionUpdateSantri(token, payload),
  deleteSantri: (token, payload) => actionDeleteSantri(token, payload),

  getKelas: (token) => actionGetKelas(token),
  addKelas: (token, payload) => actionAddKelas(token, payload),
  updateKelas: (token, payload) => actionUpdateKelas(token, payload),
  deleteKelas: (token, payload) => actionDeleteKelas(token, payload),

  getSetoran: (token, payload) => actionGetSetoran(token, payload),
  addSetoran: (token, payload) => actionAddSetoran(token, payload),
  addSetoranBulk: (token, payload) => actionAddSetoranBulk(token, payload),
  addSetoranBatch: (token, payload) => actionAddSetoranBatch(token, payload),
  updateSetoran: (token, payload) => actionUpdateSetoran(token, payload),
  deleteSetoran: (token, payload) => actionDeleteSetoran(token, payload),

  getStatistik: (token, payload) => actionGetStatistik(token, payload),
  getRekap: (token, payload) => actionGetRekap(token, payload),
  getProgressSiswa: (token, payload) => actionGetProgressSiswa(token, payload),

  getUsers: (token) => actionGetUsers(token),
  addUser: (token, payload) => actionAddUser(token, payload),
  updateUser: (token, payload) => actionUpdateUser(token, payload),
  deleteUser: (token, payload) => actionDeleteUser(token, payload),
  changePassword: (token, payload) => actionChangePassword(token, payload),

  getPenyimakSantri: (token, payload) => actionGetPenyimakSantri(token, payload),
  setPenyimakSantri: (token, payload) => actionSetPenyimakSantri(token, payload),

  getPresensi: (token, payload) => actionGetPresensi(token, payload),
  savePresensi: (token, payload) => actionSavePresensi(token, payload),
  deletePresensi: (token, payload) => actionDeletePresensi(token, payload),
  getRekapPresensi: (token, payload) => actionGetRekapPresensi(token, payload)
};

// ============== WARMUP ==============
// Cara setup: Apps Script -> Triggers -> Add Trigger -> Function: warmup
//             -> Time-driven -> Minutes timer -> Every 5 minutes
function warmup() {
  // Sengaja kosong. Cukup untuk menjaga Apps Script tetap "hangat"
  // sehingga cold start tidak terjadi saat pengguna membuka app.
  Logger.log('warmup: ' + new Date().toISOString());
}

