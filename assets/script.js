/* =========================================================
   GANTI URL DI BAWAH DENGAN URL WEB APP APPS SCRIPT ANDA
========================================================= */
const API_URL = "https://script.google.com/macros/s/AKfycbyv6VH7UWzuj1V3mSjtF_o9dDXsWNRWIt9MsM3KTWphy-xS5Ou3737nl883-tvjuLhvCw/exec";

/* Daftar halaman awal tiap surah pada Mushaf Madinah standar (604 halaman).
   Catatan: sebagian cetakan/aplikasi bisa berbeda 1-2 halaman dari tabel ini. */
// Format tiap baris: [nomor_surah, nama_surah, halaman_mushaf_awal, jumlah_ayat]
const SURAH_PAGES = [
[1,"Al-Fatihah",1,7],[2,"Al-Baqarah",2,286],[3,"Ali 'Imran",50,200],[4,"An-Nisa",77,176],[5,"Al-Ma'idah",106,120],
[6,"Al-An'am",128,165],[7,"Al-A'raf",151,206],[8,"Al-Anfal",177,75],[9,"At-Tawbah",187,129],[10,"Yunus",208,109],
[11,"Hud",221,123],[12,"Yusuf",235,111],[13,"Ar-Ra'd",249,43],[14,"Ibrahim",255,52],[15,"Al-Hijr",262,99],
[16,"An-Nahl",267,128],[17,"Al-Isra",282,111],[18,"Al-Kahf",293,110],[19,"Maryam",305,98],[20,"Ta-Ha",312,135],
[21,"Al-Anbiya",322,112],[22,"Al-Hajj",332,78],[23,"Al-Mu'minun",342,118],[24,"An-Nur",350,64],[25,"Al-Furqan",359,77],
[26,"Ash-Shu'ara",367,227],[27,"An-Naml",377,93],[28,"Al-Qasas",385,88],[29,"Al-Ankabut",396,69],[30,"Ar-Rum",404,60],
[31,"Luqman",411,34],[32,"As-Sajdah",415,30],[33,"Al-Ahzab",418,73],[34,"Saba",428,54],[35,"Fatir",434,45],
[36,"Ya-Sin",440,83],[37,"As-Saffat",446,182],[38,"Sad",453,88],[39,"Az-Zumar",458,75],[40,"Ghafir",467,85],
[41,"Fussilat",477,54],[42,"Ash-Shura",483,53],[43,"Az-Zukhruf",489,89],[44,"Ad-Dukhan",496,59],[45,"Al-Jathiyah",499,37],
[46,"Al-Ahqaf",502,35],[47,"Muhammad",507,38],[48,"Al-Fath",511,29],[49,"Al-Hujurat",515,18],[50,"Qaf",518,45],
[51,"Adh-Dhariyat",520,60],[52,"At-Tur",523,49],[53,"An-Najm",526,62],[54,"Al-Qamar",528,55],[55,"Ar-Rahman",531,78],
[56,"Al-Waqi'ah",534,96],[57,"Al-Hadid",537,29],[58,"Al-Mujadila",542,22],[59,"Al-Hashr",545,24],[60,"Al-Mumtahanah",549,13],
[61,"As-Saff",551,14],[62,"Al-Jumu'ah",553,11],[63,"Al-Munafiqun",554,11],[64,"At-Taghabun",556,18],[65,"At-Talaq",558,12],
[66,"At-Tahrim",560,12],[67,"Al-Mulk",562,30],[68,"Al-Qalam",564,52],[69,"Al-Haqqah",566,52],[70,"Al-Ma'arij",568,44],
[71,"Nuh",570,28],[72,"Al-Jinn",572,28],[73,"Al-Muzzammil",574,20],[74,"Al-Muddaththir",575,56],[75,"Al-Qiyamah",577,40],
[76,"Al-Insan",578,31],[77,"Al-Mursalat",580,50],[78,"An-Naba",582,40],[79,"An-Nazi'at",583,46],[80,"Abasa",585,42],
[81,"At-Takwir",586,29],[82,"Al-Infitar",587,19],[83,"Al-Mutaffifin",587,36],[84,"Al-Inshiqaq",589,25],[85,"Al-Buruj",590,22],
[86,"At-Tariq",591,17],[87,"Al-A'la",591,19],[88,"Al-Ghashiyah",592,26],[89,"Al-Fajr",593,30],[90,"Al-Balad",594,20],
[91,"Ash-Shams",595,15],[92,"Al-Layl",595,21],[93,"Adh-Dhuha",596,11],[94,"Al-Inshirah",596,8],[95,"At-Tin",597,8],
[96,"Al-'Alaq",597,19],[97,"Al-Qadr",598,5],[98,"Al-Bayyinah",598,8],[99,"Az-Zalzalah",599,8],[100,"Al-'Adiyat",599,11],
[101,"Al-Qari'ah",600,11],[102,"At-Takathur",600,8],[103,"Al-'Asr",601,3],[104,"Al-Humazah",601,9],[105,"Al-Fil",601,5],
[106,"Quraysh",602,4],[107,"Al-Ma'un",602,7],[108,"Al-Kawthar",602,3],[109,"Al-Kafirun",603,6],[110,"An-Nasr",603,3],
[111,"Al-Masad",603,5],[112,"Al-Ikhlas",604,4],[113,"Al-Falaq",604,5],[114,"An-Nas",604,6]
];

/* Tabel konversi nilai Penilaian Metode Ummi (sesuai Daftar Konversi Nilai resmi).
   Setiap baris: kode unik, label konversi, jumlah kesalahan, nilai numerik, status kenaikan, keterangan. */
const UMMI_GRADE_TABLE = [
  { kode: 'Aplus', label: 'A+ (benar semua, bacaan bagus sekali)', kesalahan: 0, nilai: 100, status: 'Naik ke halaman berikutnya', keterangan: 'Benar semua dan kualitas bacaan bagus sekali.' },
  { kode: 'A', label: 'A (benar semua, bacaan biasa-biasa)', kesalahan: 0, nilai: 90, status: 'Naik ke halaman berikutnya', keterangan: 'Benar semua dan kualitas bacaan biasa-biasa.' },
  { kode: 'Bplus', label: 'B+ (salah 1x, bisa membetulkan sendiri)', kesalahan: 1, nilai: 85, status: 'Naik ke halaman berikutnya', keterangan: 'Salah satu kali dan bisa membetulkan sendiri.' },
  { kode: 'B', label: 'B (salah 2x, bisa membetulkan sendiri)', kesalahan: 2, nilai: 80, status: 'Naik ke halaman berikutnya', keterangan: 'Salah dua kali dan bisa membetulkan sendiri.' },
  { kode: 'Bminus', label: 'B- (salah 3x, bisa membetulkan sendiri)', kesalahan: 3, nilai: 75, status: 'Naik, tapi diulangi dulu halaman tsb', keterangan: 'Salah tiga kali dan bisa membetulkan sendiri.' },
  { kode: 'Cplus', label: 'C+ (salah 4x, bisa membetulkan sendiri)', kesalahan: 4, nilai: 70, status: 'Belum boleh dinaikkan/diulang lagi', keterangan: 'Salah empat kali dan bisa membetulkan sendiri.' },
  { kode: 'C', label: 'C (salah 5x, bisa membetulkan sendiri)', kesalahan: 5, nilai: 65, status: 'Belum boleh dinaikkan/diulang lagi', keterangan: 'Salah lima kali dan bisa membetulkan sendiri.' },
  { kode: 'Cminus', label: 'C- (salah 6x, bisa membetulkan sendiri)', kesalahan: 6, nilai: 60, status: 'Belum boleh dinaikkan/diulang lagi', keterangan: 'Salah enam kali dan bisa membetulkan sendiri.' },
  { kode: 'D', label: 'D (salah >6x atau tidak bisa membetulkan sendiri)', kesalahan: 7, nilai: 50, status: 'Belum boleh dinaikkan/diulang lagi', keterangan: 'Salah satu kali namun tidak bisa membetulkan sendiri/tetap salah dalam membaca, maka belum bisa dinaikkan.' }
];
const LEVEL_JILID_UMMI = ['Jilid 1', 'Jilid 2', 'Jilid 3', 'Jilid 4', 'Jilid 5', 'Jilid 6'];

const TF = (() => {
  let state = { token: null, user: null, view: 'dashboard', cache: {}, mushafPage: 1, basmalahText: null, pageCache: {} };

  async function call(action, payload = {}) {
    // Dibungkus try/catch supaya kegagalan jaringan atau respons yang tidak
    // valid dari backend tidak membuat tombol/aksi macet tanpa umpan balik.
    // Kontrak return TIDAK berubah: selalu { ok, ... } seperti sebelumnya,
    // jadi seluruh pemanggil (yang mengecek res.ok) tetap bekerja sama persis.
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload, token: state.token })
      });
      try {
        return await res.json();
      } catch (parseErr) {
        return { ok: false, error: 'Respons server tidak valid. Coba lagi.' };
      }
    } catch (networkErr) {
      return { ok: false, error: 'Gagal terhubung ke server. Periksa koneksi internet Anda.' };
    }
  }

  function saveSession() {
    localStorage.setItem('tf_token', state.token || '');
    localStorage.setItem('tf_user', JSON.stringify(state.user || null));
  }
  function loadSession() {
    state.token = localStorage.getItem('tf_token') || null;
    try { state.user = JSON.parse(localStorage.getItem('tf_user')); } catch (e) { state.user = null; }
  }

  async function login() {
    const username = document.getElementById('tf-login-username').value.trim();
    const password = document.getElementById('tf-login-password').value;
    const errEl = document.getElementById('tf-login-error');
    const btnEl = document.getElementById('tf-login-btn');
    errEl.classList.add('tf-hide');
    if (!username || !password) { errEl.textContent = 'Username dan password wajib diisi'; errEl.classList.remove('tf-hide'); return; }
    if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Masuk...'; }
    const res = await call('login', { username, password });
    if (!res.ok) {
      errEl.textContent = res.error; errEl.classList.remove('tf-hide');
      if (btnEl) { btnEl.disabled = false; btnEl.textContent = 'Masuk'; }
      return;
    }
    state.token = res.token; state.user = res.user;
    saveSession(); render();
  }

  function logout() {
    call('logout');
    state.token = null; state.user = null;
    localStorage.removeItem('tf_token'); localStorage.removeItem('tf_user');
    state.pageCache = {}; render();
  }

  function menuFor(role) {
    const all = [
      { key: 'dashboard', label: 'Dashboard',       roles: ['admin','penyimak','santri','tamu'] },
      { key: 'setoran',   label: 'Setoran',          roles: ['admin','penyimak'] },
      { key: 'presensi',  label: 'Presensi',         roles: ['admin','penyimak'] },
      { key: 'santri',    label: 'Data Siswa',       roles: ['admin','penyimak','tamu'] },
      { key: 'kelas',     label: 'Data Kelas',       roles: ['admin'] },
      { key: 'statistik', label: 'Statistik',        roles: ['admin','penyimak','santri','tamu'] },
      { key: 'progress',  label: 'Progress Siswa',   roles: ['admin','penyimak','santri','tamu'] },
      { key: 'rekap',     label: 'Rekap & Rapor',    roles: ['admin','penyimak','tamu'] },
      { key: 'mushaf',    label: 'Mushaf Digital',   roles: ['admin','penyimak','santri','tamu'] },
      { key: 'users',     label: 'Pengguna',         roles: ['admin'] }
    ];
    return all.filter(m => m.roles.includes(role));
  }

  function setView(v) { state.view = v; closeSidebarOnNavigate(); render(); }
  function isDesktopLayout() {
    return window.matchMedia('(min-width: 768px)').matches;
  }
  // Dipanggil setiap pindah menu: di mobile drawer otomatis tertutup,
  // di desktop sidebar tetap terbuka terus (persistent) sampai user menutupnya sendiri.
  function closeSidebarOnNavigate() {
    if (!isDesktopLayout()) {
      document.getElementById('tf-sidebar').classList.remove('tf-open');
      document.getElementById('tf-sidebar-overlay').classList.remove('tf-open');
    }
  }
  function toggleSidebar() {
    if (isDesktopLayout()) {
      document.getElementById('tf-sidebar').classList.toggle('tf-collapsed');
    } else {
      document.getElementById('tf-sidebar').classList.toggle('tf-open');
      document.getElementById('tf-sidebar-overlay').classList.toggle('tf-open');
    }
  }
  function closeSidebar() {
    if (isDesktopLayout()) {
      document.getElementById('tf-sidebar').classList.add('tf-collapsed');
    } else {
      document.getElementById('tf-sidebar').classList.remove('tf-open');
      document.getElementById('tf-sidebar-overlay').classList.remove('tf-open');
    }
  }

  async function render() {
    const loginView = document.getElementById('tf-login-view');
    const topbar = document.getElementById('tf-topbar');
    const content = document.getElementById('tf-content');
    const sidebar = document.getElementById('tf-sidebar');

    if (!state.token || !state.user) {
      loginView.classList.remove('tf-hide'); topbar.classList.add('tf-hide'); content.classList.add('tf-hide');
      sidebar.classList.add('tf-hide');
      return;
    }
    // ── Tampilkan struktur UI langsung (sinkron) ──
    loginView.classList.add('tf-hide'); topbar.classList.remove('tf-hide'); content.classList.remove('tf-hide');
    sidebar.classList.remove('tf-hide');

    document.getElementById('tf-username-label').textContent = state.user.nama + ' (' + state.user.role + ')';
    const menuEl = document.getElementById('tf-menu');
    menuEl.innerHTML = '';
    menuFor(state.user.role).forEach(m => {
      const btn = document.createElement('button');
      btn.textContent = m.label;
      if (m.key === state.view) btn.classList.add('active');
      btn.onclick = () => setView(m.key);
      menuEl.appendChild(btn);
    });

    // ── Tampilkan dari cache jika tersedia (hindari loading tiap pindah menu) ──
    // Cache di-invalidate setelah tambah/edit/hapus data (lihat fungsi invalidateCache)
    const CACHEABLE = ['setoran','santri','kelas','statistik','users','presensi','progress'];
    const hasCache = CACHEABLE.includes(state.view) && state.pageCache[state.view];
    if (hasCache) {
      content.innerHTML = state.pageCache[state.view];
      return;
    }

    // ── Tampilkan spinner langsung sebelum await API ──
    content.innerHTML = `
      <div class="tf-loading-wrap">
        <div class="tf-spinner"></div>
        <p class="tf-loading-text">Memuat data...</p>
      </div>`;

    // ── Baru load konten (async — bisa lambat karena API Apps Script) ──
    if (state.view === 'dashboard') await renderDashboard(content);
    else if (state.view === 'setoran')   await renderSetoran(content);
    else if (state.view === 'presensi')  await renderPresensi(content);
    else if (state.view === 'santri')    await renderSantri(content);
    else if (state.view === 'kelas') await renderKelas(content);
    else if (state.view === 'statistik') await renderStatistik(content);
    else if (state.view === 'progress') await renderProgress(content);
    else if (state.view === 'rekap') await renderRekap(content);
    else if (state.view === 'mushaf') await renderMushaf(content);
    else if (state.view === 'users') await renderUsers(content);

    // Simpan hasil render ke pageCache (kecuali rekap & mushaf yang selalu fresh)
    if (CACHEABLE.includes(state.view)) {
      state.pageCache[state.view] = content.innerHTML;
    }
  }

  // Invalidate cache halaman tertentu setelah mutasi data
  function invalidateCache(...views) {
    if (!views.length) { state.pageCache = {}; return; }
    views.forEach(v => { delete state.pageCache[v]; });
  }

  // ---------- DASHBOARD ----------
  async function renderDashboard(content) {
    const [res, santriRes, kelasRes] = await Promise.all([
      call('getDashboard'), call('getSantri'), call('getKelas')
    ]);
    if (!res.ok) { content.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }
    state.cache.santri = santriRes.ok ? santriRes.data : [];
    state.cache.kelas  = kelasRes.ok  ? kelasRes.data  : [];
    const santriMap = {};
    const santriLevelMap = {};
    state.cache.santri.forEach(s => {
      santriMap[s.id] = s.nama;
      santriLevelMap[s.id] = s.level_ummi || '-';
    });
    const kelasMap = {};
    state.cache.kelas.forEach(k => { kelasMap[k.id] = k.nama_kelas; });
    // Preload santriSetoran untuk dropdown modal setoran
    if (!state.cache.santriSetoran) {
      if (state.user.role === 'penyimak') {
        const binaanRes = await call('getSantri', { binaan_only: true });
        state.cache.santriSetoran = binaanRes.ok ? binaanRes.data : [];
      } else {
        state.cache.santriSetoran = state.cache.santri;
      }
    }
    const s = res.stats;
    content.innerHTML = `
      <h1 class="tf-title"><img src="data:image/jpeg;base64,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" alt="Logo" class="tf-dash-logo"> Dashboard ${escapeHtml(state.user.role)}</h1>
      <div class="tf-stats">
        <div class="tf-stat-card c-cyan"><div class="label">TOTAL SETORAN</div><div class="value">${s.total_setoran}</div></div>
        <div class="tf-stat-card c-green"><div class="label">TOTAL SISWA</div><div class="value">${s.total_santri}</div></div>
        <div class="tf-stat-card c-red"><div class="label">RATA-RATA NILAI</div><div class="value">${s.rata_nilai.toFixed(2)}</div></div>
        <div class="tf-stat-card c-green2"><div class="label">SETORAN BULAN INI</div><div class="value">${s.setoran_bulan_ini}</div></div>
      </div>
      <div class="tf-panel">
        <div class="tf-panel-head">Setoran Terbaru
          <button class="tf-add-btn" onclick="TF.setView('setoran')">+ Tambah Setoran</button>
        </div>
        <div class="tf-panel-body tf-table-wrap" id="tf-dash-setoran"></div>
      </div>
    `;
    document.getElementById('tf-dash-setoran').innerHTML = res.setoran_terbaru.length
      ? listToTable(res.setoran_terbaru.map((r, i) => Object.assign({}, r, {
          no: i + 1,
          nama_santri: santriMap[r.santri_id]      || '(siswa terhapus)',
          kelas_nama:  kelasMap[r.kelas_id]        || '-',
          level_ummi:  santriLevelMap[r.santri_id] || '-',
          lokasi: formatLokasiSetoran(r)
        })), [
          ['no','#'],['nama_santri','Nama Siswa'],['kelas_nama','Kelas'],
          ['level_ummi','Level Ummi'],['tanggal','Tanggal'],
          ['lokasi','Surah/Halaman'],['jenis','Jenis'],
          ['nilai','Nilai'],['predikat','Predikat']
        ])
      : '<div class="tf-empty">Belum ada setoran tercatat.</div>';
  }

  // Menyatukan info lokasi setoran: surah+ayat (bisa lintas 2 surah) untuk 3 jenis setoran,
  // halaman untuk Penilaian Metode Ummi.
  function formatLokasiSetoran(r) {
    if (r.surah) {
      const beda = r.surah_selesai && r.surah_selesai !== r.surah;
      return beda
        ? `${r.surah} : ${r.ayat_mulai} — ${r.surah_selesai} : ${r.ayat_selesai}`
        : `${r.surah} : ${r.ayat_mulai}-${r.ayat_selesai}`;
    }
    if (r.halaman_mulai || r.halaman_selesai) return `Hal. ${r.halaman_mulai}-${r.halaman_selesai}`;
    return '-';
  }

  // ---------- SETORAN ----------
  async function renderSetoran(content) {
    const isPenyimak = state.user.role === 'penyimak';
    const [setoranRes, santriRes, kelasRes, santriSetoranRes] = await Promise.all([
      call('getSetoran'),
      call('getSantri'),
      call('getKelas'),
      isPenyimak ? call('getSantri', { binaan_only: true })
                 : Promise.resolve({ ok: true, data: null })
    ]);
    if (!setoranRes.ok) { content.innerHTML = '<p class="tf-error">' + setoranRes.error + '</p>'; return; }
    state.cache.santri = santriRes.ok ? santriRes.data : [];
    state.cache.kelas  = kelasRes.ok  ? kelasRes.data  : [];
    state.cache.santriSetoran = isPenyimak
      ? (santriSetoranRes.ok && santriSetoranRes.data ? santriSetoranRes.data : [])
      : state.cache.santri;
    const santriMap = {};
    const santriLevelMap = {};
    state.cache.santri.forEach(s => {
      santriMap[s.id] = s.nama;
      santriLevelMap[s.id] = s.level_ummi || '-';
    });
    const kelasMap = {};
    state.cache.kelas.forEach(k => { kelasMap[k.id] = k.nama_kelas; });
    state.cache.setoranList = setoranRes.data.map(r => Object.assign({}, r, {
      santri_nama:  santriMap[r.santri_id]      || '(siswa terhapus)',
      kelas_nama:   kelasMap[r.kelas_id]        || '-',
      level_ummi:   santriLevelMap[r.santri_id] || '-',
      tanggal_fmt:  r.tanggal ? r.tanggal.substring(0,10) : '-',
      lokasi: formatLokasiSetoran(r)
    }));
    const canAdd = state.user.role === 'admin' || state.user.role === 'penyimak';
    content.innerHTML = `
      <h1 class="tf-title">Setoran Hafalan</h1>
      <div class="tf-panel">
        <div class="tf-panel-head">Daftar Setoran
          ${canAdd ? '<button class="tf-add-btn" onclick="TF.openSetoranModal()">+ Tambah Setoran</button>' : ''}
        </div>
        <div class="tf-panel-body tf-table-wrap" id="tf-table-setoran">
          ${buildTableHtml('setoran')}
        </div>
      </div>
    `;
  }

  function openSetoranModal() {
    const santriOptions = (state.cache.santriSetoran || state.cache.santri || [])
      .map(s => `<option value="${s.id}" data-level="${escapeHtml(s.level_ummi || '')}">${escapeHtml(s.nama)}</option>`).join('');
    openModal(`
      <h3>Tambah Setoran</h3>
      <div class="tf-field"><label>Nama Siswa</label><select id="m-santri" onchange="TF.renderSetoranFields()">${santriOptions}</select></div>
      <div class="tf-field"><label>Tanggal &amp; Waktu Setoran</label><input id="m-tanggal" type="datetime-local" value="${nowDateTimeStr()}"></div>
      <div id="m-setoran-dynamic"></div>
      <div class="tf-field"><label>Catatan</label><textarea id="m-catatan" rows="2"></textarea></div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitSetoran()">Simpan</button>
      </div>
    `);
    renderSetoranFields();
  }

  const LEVEL_ADVANCED = ['Gharib/Tajwid', "Al-Qur'an"];
  function isAdvancedLevel(level) { return LEVEL_ADVANCED.includes(level); }
  function isJilidUmmiLevel(level) { return LEVEL_JILID_UMMI.includes(level); }

  function surahSelectHtml(id) {
    const opts = SURAH_PAGES.map(s => `<option value="${escapeHtml(s[1])}" data-jumlah-ayat="${s[3]}">${s[0]}. ${s[1]}</option>`).join('');
    return `<select id="${id}" onchange="TF.onSurahChange(this)"><option value="">-- pilih surah --</option>${opts}</select>`;
  }

  // Mengisi dropdown Ayat Awal & Ayat Akhir sesuai jumlah ayat surah yang dipilih.
  function ayatOptionsHtml(jumlahAyat) {
    let opts = '<option value="">-</option>';
    for (let i = 1; i <= jumlahAyat; i++) opts += `<option value="${i}">${i}</option>`;
    return opts;
  }

  function onSurahChange(selectEl) {
    const id = selectEl.id;
    const opt = selectEl.options[selectEl.selectedIndex];
    const jumlahAyat = Number(opt.dataset.jumlahAyat || 0);
    const surahValue = opt.value;

    if (id.indexOf('m-surah-mulai-') === 0) {
      const idx = id.replace('m-surah-mulai-', '');
      const ayatEl = document.getElementById('m-ayat-mulai-' + idx);
      if (ayatEl) ayatEl.innerHTML = ayatOptionsHtml(jumlahAyat);
      // Surah Akhir otomatis mengikuti Surah Awal (kasus umum 1 surah); penyimak bisa
      // mengubahnya manual kalau siswa setor lebih dari satu surah dalam pertemuan ini.
      const surahSelesaiEl = document.getElementById('m-surah-selesai-' + idx);
      if (surahSelesaiEl) {
        surahSelesaiEl.value = surahValue;
        const ayatSelesaiEl = document.getElementById('m-ayat-selesai-' + idx);
        if (ayatSelesaiEl) ayatSelesaiEl.innerHTML = ayatOptionsHtml(jumlahAyat);
      }
    } else if (id.indexOf('m-surah-selesai-') === 0) {
      const idx = id.replace('m-surah-selesai-', '');
      const ayatEl = document.getElementById('m-ayat-selesai-' + idx);
      if (ayatEl) ayatEl.innerHTML = ayatOptionsHtml(jumlahAyat);
    }
  }

  // Maksimal halaman buku Jilid Ummi 1-6 (cukup untuk seluruh buku, disamakan untuk semua jilid).
  const MAX_HALAMAN_UMMI = 50;
  function halamanOptionsHtml() {
    let opts = '<option value="">-</option>';
    for (let i = 1; i <= MAX_HALAMAN_UMMI; i++) opts += `<option value="${i}">${i}</option>`;
    return opts;
  }

  // Blok untuk 3 jenis setoran (Hafalan Baru / Murojaah / Tilawah) — memakai Surah Awal & Surah Akhir
  // (beserta ayat masing-masing) supaya bisa mencatat setoran yang mencakup lebih dari satu surah
  // dalam satu pertemuan. Berlaku untuk semua level termasuk Jilid Ummi 1-6.
  function jenisBlockHtml(jenis, idx) {
    return `
      <div class="tf-jenis-block" style="border:1px solid #e3e9e4;border-radius:10px;padding:12px;margin-bottom:10px;background:#fafdfb;">
        <p style="font-weight:600;color:var(--green-dark);margin:0 0 8px;">${jenis}</p>
        <div class="tf-grid2">
          <div class="tf-field"><label>Surah Awal</label>${surahSelectHtml('m-surah-mulai-' + idx)}</div>
          <div class="tf-field"><label>Ayat Awal</label><select id="m-ayat-mulai-${idx}"><option value="">-</option></select></div>
        </div>
        <div class="tf-grid2">
          <div class="tf-field"><label>Surah Akhir</label>${surahSelectHtml('m-surah-selesai-' + idx)}</div>
          <div class="tf-field"><label>Ayat Akhir</label><select id="m-ayat-selesai-${idx}"><option value="">-</option></select></div>
        </div>
        <div class="tf-empty" style="margin:-2px 0 8px;font-size:11.5px;">Surah Akhir otomatis mengikuti Surah Awal — ubah jika siswa setor lebih dari satu surah dalam pertemuan ini.</div>
        <div class="tf-field"><label>Nilai (0-100)</label><input id="m-nilai-${idx}" type="number" min="0" max="100"></div>
      </div>
    `;
  }

  const JENIS_OPTIONS = ['Hafalan Baru', 'Murojaah', 'Tilawah'];

  // Dropdown pilihan konversi nilai Metode Ummi (A+ s/d D), sesuai Daftar Konversi Nilai resmi.
  function ummiGradeOptionsHtml() {
    const opts = UMMI_GRADE_TABLE.map(g => `<option value="${g.kode}">${escapeHtml(g.label)}</option>`).join('');
    return `<option value="">-- pilih nilai --</option>${opts}`;
  }

  function onUmmiGradeChange() {
    const kode = val('m-ummi-grade');
    const infoEl = document.getElementById('m-ummi-info');
    if (!infoEl) return;
    const g = UMMI_GRADE_TABLE.find(x => x.kode === kode);
    if (!g) { infoEl.innerHTML = ''; return; }
    infoEl.innerHTML = `Nilai: <b>${g.nilai}</b> &nbsp;|&nbsp; Kesalahan: <b>${g.kesalahan}</b> &nbsp;|&nbsp; ${escapeHtml(g.status)}<br><span style="color:#6b7d72;">${escapeHtml(g.keterangan)}</span>`;
  }

  function toggleUmmiBlock() {
    const checked = document.getElementById('m-ummi-include').checked;
    document.getElementById('m-ummi-fields').classList.toggle('tf-hide', !checked);
  }

  function renderSetoranFields() {
    const sel = document.getElementById('m-santri');
    const level = sel.options.length ? sel.options[sel.selectedIndex].dataset.level : '';
    const isJilid = isJilidUmmiLevel(level);
    const container = document.getElementById('m-setoran-dynamic');

    // Bagian a: Penilaian Metode Ummi (halaman awal & akhir + konversi nilai A+/A/B+/.../D) — khusus level Jilid 1-6.
    const ummiBlock = isJilid ? `
      <div class="tf-panel" style="border:1px solid #e3e9e4;border-radius:10px;padding:12px;margin-bottom:14px;background:#faf7ff;">
        <label style="display:flex;align-items:center;gap:8px;font-weight:600;color:var(--green-dark);margin-bottom:8px;">
          <input type="checkbox" id="m-ummi-include" checked onchange="TF.toggleUmmiBlock()">
          Penilaian Metode Ummi (Setoran Baru — per halaman)
        </label>
        <div id="m-ummi-fields">
          <div class="tf-grid2">
            <div class="tf-field"><label>Halaman Awal</label><select id="m-ummi-halaman-mulai">${halamanOptionsHtml()}</select></div>
            <div class="tf-field"><label>Halaman Akhir</label><select id="m-ummi-halaman-selesai">${halamanOptionsHtml()}</select></div>
          </div>
          <div class="tf-field"><label>Nilai (Konversi Metode Ummi)</label>
            <select id="m-ummi-grade" onchange="TF.onUmmiGradeChange()">${ummiGradeOptionsHtml()}</select>
          </div>
          <div id="m-ummi-info" style="font-size:13px;margin:4px 0 2px;"></div>
        </div>
      </div>
    ` : '';

    // Bagian b: 3 jenis setoran (Hafalan Baru/Murojaah/Tilawah) dengan pilihan Surah & Ayat.
    const keterangan = isJilid
      ? `Siswa level <b>${escapeHtml(level || '-')}</b> (Jilid Ummi) — selain Penilaian Metode Ummi di atas, pilih juga jenis setoran lain yang ingin diinput hari ini (boleh lebih dari satu).`
      : `Siswa level <b>${escapeHtml(level || '-')}</b> — pilih jenis setoran yang ingin diinput hari ini (boleh lebih dari satu).`;
    const checkboxes = JENIS_OPTIONS.map((j, i) => `
        <label style="display:inline-flex;align-items:center;gap:6px;margin-right:14px;font-weight:500;">
          <input type="checkbox" class="m-jenis-toggle" value="${j}" data-idx="${i}" onchange="TF.renderJenisBlocks()" ${!isJilid && i === 0 ? 'checked' : ''}>
          ${j}
        </label>`).join('');

    container.innerHTML = `
      ${ummiBlock}
      <div class="tf-empty" style="margin-bottom:12px;">${keterangan}</div>
      <div class="tf-field"><label>3 Jenis Setoran</label><div>${checkboxes}</div></div>
      <div id="m-jenis-blocks"></div>
    `;
    renderJenisBlocks();
  }

  function renderJenisBlocks() {
    const checked = Array.from(document.querySelectorAll('.m-jenis-toggle:checked')).map(c => c.value);
    const blocksEl = document.getElementById('m-jenis-blocks');
    if (!checked.length) {
      blocksEl.innerHTML = '<div class="tf-empty">Pilih minimal satu jenis setoran di atas (jika tidak diisi, pastikan Penilaian Metode Ummi di atas dicentang).</div>';
      return;
    }
    blocksEl.innerHTML = checked.map((j, i) => jenisBlockHtml(j, i)).join('');
  }

  async function submitSetoran() { // mutasi: invalidate setoran + dashboard
    const sel = document.getElementById('m-santri');
    const santriId = sel.value;
    const level = sel.options.length ? sel.options[sel.selectedIndex].dataset.level : '';
    const tanggal = val('m-tanggal');
    const catatan = val('m-catatan');
    const isJilid = isJilidUmmiLevel(level);

    const items = [];

    // a. Penilaian Metode Ummi (halaman + konversi nilai), kalau dicentang & diisi.
    const ummiIncludeEl = document.getElementById('m-ummi-include');
    if (isJilid && ummiIncludeEl && ummiIncludeEl.checked) {
      const hMulai = val('m-ummi-halaman-mulai');
      const hSelesai = val('m-ummi-halaman-selesai');
      const gradeKode = val('m-ummi-grade');
      const grade = UMMI_GRADE_TABLE.find(g => g.kode === gradeKode);
      if (!hMulai || !hSelesai || !grade) {
        alert('Untuk Penilaian Metode Ummi: halaman awal, halaman akhir, dan nilai konversi wajib diisi (atau hilangkan centangnya jika tidak ingin mengisi hari ini).');
        return;
      }
      items.push({
        santri_id: santriId, tanggal, jenis: 'Setoran Metode Ummi',
        halaman_mulai: hMulai, halaman_selesai: hSelesai,
        nilai: grade.nilai, predikat: grade.label.split(' ')[0],
        catatan: grade.keterangan + (catatan ? ' — ' + catatan : '')
      });
    }

    // b. 3 jenis setoran (Surah Awal/Akhir + Ayat Awal/Akhir).
    const jenisList = Array.from(document.querySelectorAll('.m-jenis-toggle:checked')).map(c => c.value);
    for (let i = 0; i < jenisList.length; i++) {
      const nilai = val('m-nilai-' + i);
      const surahMulai = val('m-surah-mulai-' + i);
      const ayatMulai = val('m-ayat-mulai-' + i);
      const surahSelesai = val('m-surah-selesai-' + i) || surahMulai;
      const ayatSelesai = val('m-ayat-selesai-' + i);
      if (!surahMulai || !ayatMulai || !surahSelesai || !ayatSelesai || !nilai) {
        alert('Untuk jenis "' + jenisList[i] + '", surah awal, ayat awal, surah akhir, ayat akhir, dan nilai wajib diisi.');
        return;
      }
      items.push({ santri_id: santriId, tanggal, jenis: jenisList[i], surah: surahMulai, surah_selesai: surahSelesai, ayat_mulai: ayatMulai, ayat_selesai: ayatSelesai, nilai, catatan });
    }

    if (!items.length) {
      alert('Isi minimal salah satu: Penilaian Metode Ummi, atau pilih jenis setoran (Hafalan Baru / Murojaah / Tilawah).');
      return;
    }
    const res = await call('addSetoranBulk', { list: items });
    if (!res.ok) { alert(res.error); return; }
    closeModal();
    // Hapus cache setoran dan dashboard supaya data terbaru langsung tampil
    invalidateCache('setoran', 'dashboard');
    delete state.cache.setoranList;
    // Langsung re-render halaman setoran atau dashboard
    const contentEl = document.getElementById('tf-content');
    contentEl.innerHTML = `<div class="tf-loading-wrap"><div class="tf-spinner"></div><p class="tf-loading-text">Memuat data terbaru...</p></div>`;
    if (state.view === 'setoran') {
      await renderSetoran(contentEl);
      state.pageCache['setoran'] = contentEl.innerHTML;
    } else {
      await renderDashboard(contentEl);
    }
  }

  // Helper refresh setoran setelah mutasi
  async function refreshSetoran() {
    invalidateCache('setoran', 'dashboard');
    delete state.cache.setoranList;
    const contentEl = document.getElementById('tf-content');
    contentEl.innerHTML = `<div class="tf-loading-wrap"><div class="tf-spinner"></div><p class="tf-loading-text">Memuat data terbaru...</p></div>`;
    await renderSetoran(contentEl);
    state.pageCache['setoran'] = contentEl.innerHTML;
  }

  function openEditSetoranModal(id) {
    const r = (state.cache.setoranList || []).find(x => String(x.id) === String(id));
    if (!r) return;
    const kelasOpts = (state.cache.kelas || []).map(k =>
      `<option value="${k.id}" ${String(k.id)===String(r.kelas_id)?'selected':''}>${escapeHtml(k.nama_kelas)}</option>`).join('');
    openModal(`
      <h3>Edit Setoran</h3>
      <div class="tf-grid2">
        <div class="tf-field"><label>Nilai</label><input id="m-edit-nilai" type="number" min="0" max="100" value="${r.nilai||''}"></div>
        <div class="tf-field"><label>Predikat</label>
          <select id="m-edit-predikat">
            ${['Mumtaz','Jayyid Jiddan','Jayyid','Maqbul','Dhoif'].map(p =>
              `<option ${p===r.predikat?'selected':''}>${p}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="tf-field"><label>Jenis</label>
        <select id="m-edit-jenis">
          ${['Setoran Metode Ummi','Hafalan Baru','Murojaah','Tilawah'].map(j =>
            `<option ${j===r.jenis?'selected':''}>${j}</option>`).join('')}
        </select>
      </div>
      <div class="tf-grid2">
        <div class="tf-field"><label>Halaman Mulai</label><input id="m-edit-hmulai" type="number" value="${r.halaman_mulai||''}"></div>
        <div class="tf-field"><label>Halaman Akhir</label><input id="m-edit-hakhir" type="number" value="${r.halaman_akhir||''}"></div>
      </div>
      <div class="tf-field"><label>Catatan</label><input id="m-edit-catatan" type="text" value="${escapeHtml(r.catatan||'')}"></div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitEditSetoran('${id}')">Simpan</button>
      </div>
    `);
  }

  async function submitEditSetoran(id) {
    const payload = {
      id,
      nilai:        val('m-edit-nilai'),
      predikat:     val('m-edit-predikat'),
      jenis:        val('m-edit-jenis'),
      halaman_mulai: val('m-edit-hmulai'),
      halaman_akhir: val('m-edit-hakhir'),
      catatan:      val('m-edit-catatan'),
    };
    const res = await call('updateSetoran', payload);
    if (!res.ok) { alert(res.error); return; }
    closeModal();
    await refreshSetoran();
  }

  async function deleteSetoran(id) {
    if (!confirm('Hapus data setoran ini?')) return;
    const res = await call('deleteSetoran', { id });
    if (!res.ok) { alert(res.error); return; }
    await refreshSetoran();
  }

  // ---------- DATA SISWA ----------
  async function renderSantri(content) {
    const [santriRes, kelasRes, binaanRes, usersRes] = await Promise.all([
      call('getSantri'), call('getKelas'), call('getPenyimakSantri', {}), call('getUsers')
    ]);
    if (!santriRes.ok) { content.innerHTML = '<p class="tf-error">' + santriRes.error + '</p>'; return; }
    state.cache.kelas = kelasRes.ok ? kelasRes.data : [];
    if (usersRes.ok) state.cache.users = usersRes.data;

    // Build userMap — getUsers hanya berhasil untuk admin.
    // Untuk penyimak, cukup tambahkan diri sendiri ke userMap agar
    // nama guru pengampu siswa binaannya tetap tampil.
    const userMap = {};
    (state.cache.users || []).forEach(u => { userMap[String(u.id)] = u.nama; });
    // Selalu masukkan user yang sedang login (fallback untuk penyimak)
    const myId = String(state.user.id || state.user.user_id || '');
    if (myId) userMap[myId] = state.user.nama;

    const kelasMapNama = {};
    state.cache.kelas.forEach(k => { kelasMapNama[k.id] = k.nama_kelas; });
    const santriPenyimakMap = {};
    if (binaanRes.ok) {
      binaanRes.data.forEach(b => {
        const guruNama = userMap[String(b.penyimak_id)];
        if (guruNama) santriPenyimakMap[String(b.santri_id)] = guruNama;
      });
    }
    const dataWithKelasNama = santriRes.data.map(s => Object.assign({}, s, {
      kelas_nama: kelasMapNama[s.kelas_id] || '(belum ada kelas)',
      guru_pengampu: santriPenyimakMap[String(s.id)] || '-'
    }));
    state.cache.santriList = dataWithKelasNama;
    const canWriteSantri = state.user.role === 'admin' || state.user.role === 'penyimak';
    content.innerHTML = `
      <h1 class="tf-title">Data Siswa</h1>
      <div class="tf-panel">
        <div class="tf-panel-head">Daftar Siswa
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="tf-btn-sm" onclick="TF.downloadTemplateSiswa()">⬇ Download Template</button>
            ${canWriteSantri ? `<label class="tf-btn-sm" style="cursor:pointer;display:inline-flex;align-items:center;">⬆ Upload Data
              <input type="file" id="tf-upload-siswa" accept=".xlsx,.xls,.csv" style="display:none" onchange="TF.uploadSiswa(event)">
            </label>
            <button class="tf-add-btn" onclick="TF.openSantriModal()">+ Tambah Siswa</button>` : ''}
          </div>
        </div>
        <div class="tf-panel-body tf-table-wrap" id="tf-table-santri">
          ${buildTableHtml('santri')}
        </div>
      </div>
    `;
  }

  const LEVEL_UMMI_OPTIONS = ['Jilid 1','Jilid 2','Jilid 3','Jilid 4','Jilid 5','Jilid 6','Gharib/Tajwid',"Al-Qur'an"];

  function openEditSantriModal(id) {
    const s = (state.cache.santriList || []).find(x => String(x.id) === String(id));
    if (!s) return;
    const kelasOptions = (state.cache.kelas || []).map(k =>
      `<option value="${k.id}" ${String(k.id)===String(s.kelas_id)?'selected':''}>${escapeHtml(k.nama_kelas)}</option>`).join('');
    const levelOptions = LEVEL_UMMI_OPTIONS.map(l =>
      `<option ${l===s.level_ummi?'selected':''}>${l}</option>`).join('');
    openModal(`
      <h3>Edit Siswa</h3>
      <div class="tf-field"><label>Nama</label><input id="m-nama" type="text" value="${escapeHtml(s.nama||'')}"></div>
      <div class="tf-grid2">
        <div class="tf-field"><label>NIS</label><input id="m-nis" type="text" value="${escapeHtml(s.nis||'')}"></div>
        <div class="tf-field"><label>Kelas</label><select id="m-kelas">${kelasOptions}</select></div>
      </div>
      <div class="tf-field"><label>Jenis Kelamin</label>
        <select id="m-jk">
          <option ${s.jenis_kelamin==='Laki-laki'?'selected':''}>Laki-laki</option>
          <option ${s.jenis_kelamin==='Perempuan'?'selected':''}>Perempuan</option>
        </select>
      </div>
      <div class="tf-field"><label>Level/Jilid Ummi</label><select id="m-level-ummi">${levelOptions}</select></div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitEditSantri('${s.id}')">Simpan</button>
      </div>
    `);
  }

  async function submitEditSantri(id) {
    const payload = { id, nama: val('m-nama'), nis: val('m-nis'), kelas_id: val('m-kelas'),
      jenis_kelamin: val('m-jk'), level_ummi: val('m-level-ummi') };
    const res = await call('updateSantri', payload);
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('santri','setoran','dashboard'); closeModal(); await render();
  }

  async function deleteSantri(id, nama) {
    if (!confirm(`Hapus siswa "${nama}"? Data setoran terkait tidak ikut terhapus.`)) return;
    const res = await call('deleteSantri', { id });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('santri','setoran','dashboard'); await render();
  }

  function openSantriModal() {
    const kelasOptions = (state.cache.kelas || []).map(k => `<option value="${k.id}">${escapeHtml(k.nama_kelas)}</option>`).join('');
    const levelOptions = LEVEL_UMMI_OPTIONS.map(l => `<option>${l}</option>`).join('');
    openModal(`
      <h3>Tambah Siswa</h3>
      <div class="tf-field"><label>Nama</label><input id="m-nama" type="text"></div>
      <div class="tf-grid2">
        <div class="tf-field"><label>NIS</label><input id="m-nis" type="text"></div>
        <div class="tf-field"><label>Kelas</label><select id="m-kelas">${kelasOptions}</select></div>
      </div>
      <div class="tf-field"><label>Jenis Kelamin</label>
        <select id="m-jk"><option>Laki-laki</option><option>Perempuan</option></select>
      </div>
      <div class="tf-field"><label>Level/Jilid Ummi</label><select id="m-level-ummi">${levelOptions}</select></div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitSantri()">Simpan</button>
      </div>
    `);
  }

  async function submitSantri() {
    const payload = { nama: val('m-nama'), nis: val('m-nis'), kelas_id: val('m-kelas'),
      jenis_kelamin: val('m-jk'), level_ummi: val('m-level-ummi') };
    const res = await call('addSantri', payload);
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('santri','setoran','dashboard'); closeModal(); await render();
  }

  function downloadTemplateSiswa() {
    const contohKelas = (state.cache.kelas && state.cache.kelas[0]) ? state.cache.kelas[0].nama_kelas : 'Nama Kelas';
    const rows = [
      { Nama: 'Contoh Siswa', NIS: '12345', Kelas: contohKelas, 'Jenis Kelamin': 'Laki-laki', 'Level Ummi': 'Jilid 1' }
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const ket = [
      ['Petunjuk Pengisian'],
      ['1. Kolom Kelas harus sama persis dengan nama kelas yang sudah ada di menu Data Kelas.'],
      ['2. Kolom Level Ummi harus salah satu dari: ' + LEVEL_UMMI_OPTIONS.join(', ')],
      ['3. Jangan mengubah nama kolom (header) pada baris pertama sheet Template.']
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ket), 'Petunjuk');
    XLSX.writeFile(wb, 'Template-Data-Siswa.xlsx');
  }

  function uploadSiswa(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const kelasMap = {};
        (state.cache.kelas || []).forEach(k => { kelasMap[String(k.nama_kelas).trim().toLowerCase()] = k.id; });

        const list = []; const skipped = [];
        rows.forEach((r, idx) => {
          const nama = r['Nama'] || r['nama'];
          const kelasNama = String(r['Kelas'] || r['kelas'] || '').trim();
          const kelasId = kelasMap[kelasNama.toLowerCase()];
          if (!nama) { skipped.push('Baris ' + (idx + 2) + ': Nama kosong'); return; }
          if (!kelasId) { skipped.push('Baris ' + (idx + 2) + ': Kelas "' + kelasNama + '" tidak ditemukan di Data Kelas'); return; }
          list.push({
            nama, nis: r['NIS'] || r['nis'] || '', kelas_id: kelasId,
            jenis_kelamin: r['Jenis Kelamin'] || r['jenis_kelamin'] || '',
            level_ummi: r['Level Ummi'] || r['level_ummi'] || ''
          });
        });

        event.target.value = '';
        if (!list.length) { alert('Tidak ada data valid untuk diupload.\n' + skipped.join('\n')); return; }

        const res = await call('addSantriBulk', { list });
        if (!res.ok) { alert(res.error); return; }
        let msg = 'Berhasil menambahkan ' + res.inserted + ' siswa.';
        if (skipped.length) msg += '\n\nDilewati (format tidak valid):\n' + skipped.join('\n');
        if (res.errors && res.errors.length) msg += '\n\nGagal disimpan:\n' + res.errors.join('\n');
        alert(msg);
        render();
      } catch (err) {
        event.target.value = '';
        alert('Gagal membaca file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ---------- KELAS ----------
  async function renderKelas(content) {
    const [res, usersRes, santriRes, binaanRes] = await Promise.all([
      call('getKelas'), call('getUsers'), call('getSantri'), call('getPenyimakSantri', {})
    ]);
    if (!res.ok) { content.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }
    const users = usersRes.ok ? usersRes.data : [];
    state.cache.penyimakList = users.filter(u => u.role === 'penyimak');
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u.nama; });

    // Map santri_id → penyimak nama dari data binaan
    const santriPenyimakMap = {};
    if (binaanRes.ok) {
      binaanRes.data.forEach(b => {
        santriPenyimakMap[String(b.santri_id)] = userMap[b.penyimak_id] || '-';
      });
    }

    // Kelompokkan santri per kelas
    const santriPerKelas = {};
    if (santriRes.ok) {
      santriRes.data.forEach(s => {
        const kid = String(s.kelas_id);
        if (!santriPerKelas[kid]) santriPerKelas[kid] = [];
        santriPerKelas[kid].push(s);
      });
    }

    const dataWithNama = res.data.map(k => Object.assign({}, k, {
      penyimak_nama: k.penyimak_id ? (userMap[k.penyimak_id] || '(tidak ditemukan)') : '-'
    }));
    state.cache.kelasList = dataWithNama;

    content.innerHTML = `
      <h1 class="tf-title">Data Kelas</h1>
      <div class="tf-panel">
        <div class="tf-panel-head">Daftar Kelas
          <button class="tf-add-btn" onclick="TF.openKelasModal()">+ Tambah Kelas</button>
        </div>
        <div class="tf-panel-body" style="padding-bottom:0;">
          <div class="tf-empty" style="margin:0 0 12px;">
            Klik nama kelas untuk melihat daftar siswa dan guru pengampunya.
          </div>
        </div>
        <div class="tf-panel-body tf-table-wrap" style="padding-top:0;" id="tf-table-kelas">
          ${buildTableHtml('kelas')}
        </div>
      </div>

      <!-- Daftar siswa per kelas expandable -->
      <div class="tf-panel">
        <div class="tf-panel-head">Siswa Per Kelas & Guru Pengampu</div>
        <div class="tf-panel-body" style="padding:0;">
          ${dataWithNama.length === 0
            ? '<div class="tf-empty" style="padding:16px;">Belum ada kelas.</div>'
            : dataWithNama.map((k, ki) => {
                const siswaDiKelas = santriPerKelas[String(k.id)] || [];
                return `
                <div class="tf-presensi-group">
                  <div class="tf-presensi-group-head" onclick="TF.togglePresensiGroup('kls-${ki}')">
                    <span>🏫 <b>${escapeHtml(k.nama_kelas)}</b></span>
                    <span class="tf-ps-summary">
                      <span class="tf-ps-chip tf-ps-hadir">${siswaDiKelas.length} siswa</span>
                      <span style="font-size:12px;color:#6b7280;">Guru: ${escapeHtml(k.penyimak_nama)}</span>
                      <span class="tf-ps-toggle">▾</span>
                    </span>
                  </div>
                  <div class="tf-presensi-group-body" id="kls-${ki}" style="display:none;">
                    ${siswaDiKelas.length === 0
                      ? '<div class="tf-empty">Belum ada siswa di kelas ini.</div>'
                      : `<table class="tf-table" style="margin-top:4px;">
                          <thead><tr>
                            <th>#</th>
                            <th>Nama Siswa</th>
                            <th>NIS</th>
                            <th>Level Ummi</th>
                            <th>Guru Pengampu (Binaan)</th>
                          </tr></thead>
                          <tbody>
                            ${siswaDiKelas.map((s, si) => `<tr>
                              <td style="text-align:center;color:#9ca3af;font-size:12px;">${si+1}</td>
                              <td>${escapeHtml(s.nama)}</td>
                              <td>${escapeHtml(s.nis||'-')}</td>
                              <td>${escapeHtml(s.level_ummi||'-')}</td>
                              <td>
                                ${santriPenyimakMap[String(s.id)]
                                  ? `<span style="color:#166534;font-weight:600;">👤 ${escapeHtml(santriPenyimakMap[String(s.id)])}</span>`
                                  : '<span style="color:#9ca3af;font-size:12px;">Belum diatur</span>'}
                              </td>
                            </tr>`).join('')}
                          </tbody>
                        </table>`
                    }
                  </div>
                </div>`;
              }).join('')
          }
        </div>
      </div>
    `;
  }

  function openEditKelasModal(id) {
    const k = (state.cache.kelasList || []).find(x => String(x.id) === String(id));
    if (!k) return;
    const penyimakOptions = (state.cache.penyimakList || [])
      .map(u => `<option value="${u.id}" ${String(u.id)===String(k.penyimak_id)?'selected':''}>${escapeHtml(u.nama)}</option>`).join('');
    openModal(`
      <h3>Edit Kelas</h3>
      <div class="tf-field"><label>Nama Kelas</label><input id="m-nama-kelas" type="text" value="${escapeHtml(k.nama_kelas||'')}"></div>
      <div class="tf-field">
        <label>Penyimak/Guru Pengampu</label>
        <select id="m-penyimak-id">
          <option value="">-- belum ditentukan --</option>
          ${penyimakOptions}
        </select>
      </div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitEditKelas('${k.id}')">Simpan</button>
      </div>
    `);
  }

  async function submitEditKelas(id) {
    const res = await call('updateKelas', { id, nama_kelas: val('m-nama-kelas'), penyimak_id: val('m-penyimak-id') });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('kelas','santri','setoran'); closeModal(); await render();
  }

  async function deleteKelas(id, nama) {
    if (!confirm(`Hapus kelas "${nama}"? Siswa yang terhubung ke kelas ini tidak ikut terhapus.`)) return;
    const res = await call('deleteKelas', { id });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('kelas','santri'); await render();
  }

  function openKelasModal() {
    const penyimakOptions = (state.cache.penyimakList || [])
      .map(u => `<option value="${u.id}">${escapeHtml(u.nama)}</option>`).join('');
    openModal(`
      <h3>Tambah Kelas</h3>
      <div class="tf-field"><label>Nama Kelas</label><input id="m-nama-kelas" type="text" placeholder="Contoh: Kelas 7A"></div>
      <div class="tf-field">
        <label>Penyimak/Guru Pengampu</label>
        <select id="m-penyimak-id">
          <option value="">-- belum ditentukan --</option>
          ${penyimakOptions}
        </select>
        ${!(state.cache.penyimakList || []).length ? '<div class="tf-empty" style="margin-top:6px;">Belum ada akun bertipe "penyimak". Tambahkan dulu di menu Pengguna jika perlu.</div>' : ''}
      </div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitKelas()">Simpan</button>
      </div>
    `);
  }

  async function submitKelas() {
    const res = await call('addKelas', { nama_kelas: val('m-nama-kelas'), penyimak_id: val('m-penyimak-id') });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('kelas','santri'); closeModal(); await render();
  }

  // ---------- PRESENSI ----------
  async function renderPresensi(content) {
    const isAdmin = state.user.role === 'admin';
    const today = new Date().toISOString().slice(0,10);

    // Fetch data sesuai role - tambahkan getKelas untuk kolom kelas siswa
    const fetches = [call('getSantri'), call('getSantri', { binaan_only: !isAdmin }), call('getKelas')];
    if (isAdmin) fetches.push(call('getUsers'));
    const [allSantriRes, binaanRes, kelasRes, usersRes] = await Promise.all(fetches);

    state.cache.santri = allSantriRes.ok ? allSantriRes.data : [];
    state.cache.kelas  = kelasRes.ok ? kelasRes.data : [];
    state.cache.santriPresensi = binaanRes.ok ? binaanRes.data : [];

    const penyimakList = isAdmin && usersRes && usersRes.ok
      ? usersRes.data.filter(u => u.role === 'penyimak' || u.role === 'admin')
      : [];
    if (isAdmin) state.cache.penyimakList = penyimakList;

    const penyimakSelectHtml = isAdmin
      ? `<div class="tf-field">
           <label>Guru Penyimak</label>
           <select id="ps-penyimak" onchange="TF.loadPresensiSiswa()">
             <option value="">-- Pilih Guru --</option>
             ${penyimakList.map(u => `<option value="${u.id}">${escapeHtml(u.nama)}</option>`).join('')}
           </select>
         </div>`
      : `<div class="tf-field" style="padding:10px;background:#f0fdf4;border-radius:8px;border:1px solid #86efac;">
           <strong>👤 ${escapeHtml(state.user.nama)}</strong>
           <span style="font-size:13px;color:#166534;margin-left:8px;">— ${state.cache.santriPresensi.length} siswa binaan</span>
         </div>`;

    const penyimakFilterHtml = isAdmin
      ? `<select id="ps-filter-penyimak" onchange="TF.loadRiwayatPresensi()" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
           <option value="">Semua Guru</option>
           ${penyimakList.map(u => `<option value="${u.id}">${escapeHtml(u.nama)}</option>`).join('')}
         </select>` : '';

    const penyimakRekapFilterHtml = isAdmin
      ? `<select id="ps-rekap-penyimak" onchange="TF.loadRekapPresensi()" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
           <option value="">Semua Guru</option>
           ${penyimakList.map(u => `<option value="${u.id}">${escapeHtml(u.nama)}</option>`).join('')}
         </select>` : '';

    content.innerHTML = `
      <h1 class="tf-title">Presensi</h1>
      <div class="tf-panel">
        <div class="tf-panel-head">Input Presensi</div>
        <div class="tf-panel-body">
          <div class="tf-grid2">
            <div class="tf-field">
              <label>Tanggal</label>
              <input type="date" id="ps-tanggal" value="${today}">
            </div>
            ${penyimakSelectHtml}
          </div>
          <div class="tf-field">
            <label>Materi yang Diajarkan</label>
            <input type="text" id="ps-materi" placeholder="contoh: Jilid 2 hal. 10-12, Surat Al-Mulk">
          </div>
          <div class="tf-field">
            <label>Catatan / Keterangan</label>
            <textarea id="ps-catatan" rows="2" placeholder="catatan kondisi kelas, kejadian khusus, dll."></textarea>
          </div>
          <div id="ps-siswa-table">
            <div class="tf-empty">${isAdmin ? 'Pilih guru untuk menampilkan daftar siswa binaan.' : (state.cache.santriPresensi.length ? 'Klik tombol di bawah untuk memuat daftar siswa.' : 'Belum ada siswa binaan yang diatur oleh admin.')}</div>
          </div>
          <div id="ps-save-area" style="display:none;margin-top:12px;">
            <button class="tf-btn" onclick="TF.submitPresensi()">💾 Simpan Presensi</button>
          </div>
          ${!isAdmin && state.cache.santriPresensi.length
            ? `<button class="tf-btn-sm" style="margin-top:8px;" onclick="TF.loadPresensiSiswa()">📋 Tampilkan Daftar Siswa</button>`
            : ''}
        </div>
      </div>

      <div class="tf-panel">
        <div class="tf-panel-head">Riwayat Presensi
          <div style="display:flex;gap:8px;align-items:center;margin-left:auto;">
            ${penyimakFilterHtml}
            <input type="date" id="ps-filter-mulai" onchange="TF.loadRiwayatPresensi()" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
            <input type="date" id="ps-filter-akhir" onchange="TF.loadRiwayatPresensi()" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
          </div>
        </div>
        <div class="tf-panel-body tf-table-wrap" id="ps-riwayat">
          <div class="tf-empty">Memuat riwayat...</div>
        </div>
      </div>

      <div class="tf-panel">
        <div class="tf-panel-head">Rekap Kehadiran Per Siswa
          <div style="display:flex;gap:8px;align-items:center;margin-left:auto;">
            ${penyimakRekapFilterHtml}
            <input type="date" id="ps-rekap-mulai" onchange="TF.loadRekapPresensi()" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
            <input type="date" id="ps-rekap-akhir" onchange="TF.loadRekapPresensi()" style="padding:5px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
          </div>
        </div>
        <div class="tf-panel-body tf-table-wrap" id="ps-rekap-tabel">
          <div class="tf-empty">Pilih rentang tanggal untuk melihat rekap kehadiran.</div>
        </div>
      </div>
    `;
    loadRiwayatPresensi();
    // Penyimak: langsung tampilkan siswa tanpa perlu klik
    if (!isAdmin && state.cache.santriPresensi.length) loadPresensiSiswa();
  }

  function loadPresensiSiswa() {
    const isAdmin = state.user.role === 'admin';
    let siswa = [];
    if (isAdmin) {
      // Admin: ambil siswa binaan dari penyimak yang dipilih
      const penyimakId = val('ps-penyimak');
      if (!penyimakId) {
        document.getElementById('ps-siswa-table').innerHTML =
          '<div class="tf-empty">Pilih guru untuk menampilkan daftar siswa binaan.</div>';
        return;
      }
      // Cari siswa binaan penyimak yang dipilih dari cache PenyimakSantri
      siswa = state.cache.santriPresensiAdmin && state.cache.santriPresensiAdmin[penyimakId]
        ? state.cache.santriPresensiAdmin[penyimakId]
        : [];
      if (!siswa.length) {
        // Fetch binaan penyimak yang dipilih
        call('getPenyimakSantri', { penyimak_id: penyimakId }).then(binaanRes => {
          const binaanIds = binaanRes.ok ? binaanRes.data.map(b => String(b.santri_id)) : [];
          siswa = (state.cache.santri || []).filter(s => binaanIds.includes(String(s.id)));
          if (!state.cache.santriPresensiAdmin) state.cache.santriPresensiAdmin = {};
          state.cache.santriPresensiAdmin[penyimakId] = siswa;
          renderPresensiSiswaTable(siswa);
        });
        return;
      }
    } else {
      siswa = state.cache.santriPresensi || [];
    }
    renderPresensiSiswaTable(siswa);
  }

  function renderPresensiSiswaTable(siswa) {
    const el = document.getElementById('ps-siswa-table');
    const saveArea = document.getElementById('ps-save-area');
    if (!siswa.length) {
      el.innerHTML = '<div class="tf-empty">Belum ada siswa binaan yang diatur.</div>';
      if (saveArea) saveArea.style.display = 'none';
      return;
    }
    el.innerHTML = `
      <div style="margin:10px 0 6px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <strong>Daftar Siswa Binaan (${siswa.length} orang)</strong>
        <button class="tf-btn-sm" onclick="TF.setAllPresensi('Hadir')">✅ Semua Hadir</button>
        <button class="tf-btn-sm" onclick="TF.setAllPresensi('Alfa')">❌ Semua Alfa</button>
      </div>
      <table class="tf-table">
        <thead><tr><th>#</th><th>Nama Siswa</th><th>Kelas</th><th>Status Kehadiran</th></tr></thead>
        <tbody>
          ${siswa.map((s, i) => {
            const kelasNama = (state.cache.kelas||[]).find(k=>String(k.id)===String(s.kelas_id));
            return `<tr>
              <td style="text-align:center;color:#9ca3af;font-size:12px;">${i+1}</td>
              <td>${escapeHtml(s.nama)}</td>
              <td>${escapeHtml(kelasNama ? kelasNama.nama_kelas : '-')}</td>
              <td>
                <div class="tf-presensi-radio">
                  ${['Hadir','Izin','Sakit','Alfa'].map(st =>
                    `<label class="tf-ps-label tf-ps-${st.toLowerCase()}">
                      <input type="radio" name="ps-${s.id}" value="${st}" ${st==='Hadir'?'checked':''}> ${st}
                    </label>`
                  ).join('')}
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
    if (saveArea) saveArea.style.display = 'block';
  }

  function setAllPresensi(status) {
    document.querySelectorAll('input[type="radio"]').forEach(r => {
      if (r.value === status) r.checked = true;
    });
  }

  async function submitPresensi() {
    const tanggal = val('ps-tanggal');
    const materi  = val('ps-materi');
    const catatan = val('ps-catatan');
    if (!tanggal) { alert('Pilih tanggal terlebih dahulu.'); return; }

    const isAdmin = state.user.role === 'admin';
    // Penyimak: gunakan id dari session; Admin: ambil dari dropdown pilihan guru
    const penyimak_id = isAdmin ? val('ps-penyimak') : (state.user.id || state.user.user_id || '');
    let siswa = [];

    if (isAdmin) {
      if (!penyimak_id) { alert('Pilih guru terlebih dahulu.'); return; }
      siswa = (state.cache.santriPresensiAdmin || {})[penyimak_id] || [];
    } else {
      siswa = state.cache.santriPresensi || [];
    }

    if (!siswa.length) { alert('Tidak ada siswa binaan yang ditampilkan.'); return; }

    const rows = siswa.map(s => {
      const checked = document.querySelector(`input[name="ps-${s.id}"]:checked`);
      return {
        santri_id: s.id,
        kelas_id:  s.kelas_id || '',
        status:    checked ? checked.value : 'Hadir'
      };
    });

    const btn = document.querySelector('#ps-save-area .tf-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Menyimpan...'; }

    const res = await call('savePresensi', { tanggal, penyimak_id, materi, catatan, rows });
    if (!res.ok) {
      alert('Gagal menyimpan: ' + res.error);
      if (btn) { btn.disabled = false; btn.textContent = '💾 Simpan Presensi'; }
      return;
    }

    invalidateCache('presensi');
    alert('Presensi berhasil disimpan!');
    if (btn) { btn.disabled = false; btn.textContent = '💾 Simpan Presensi'; }
    loadRiwayatPresensi();
  }

  async function loadRiwayatPresensi() {
    const el = document.getElementById('ps-riwayat');
    if (!el) return;
    el.innerHTML = '<div class="tf-empty">Memuat...</div>';
    const payload = {};
    const fMulai = val('ps-filter-mulai');
    const fAkhir = val('ps-filter-akhir');
    if (fMulai) payload.tanggal_mulai = fMulai;
    if (fAkhir) payload.tanggal_akhir = fAkhir;
    // Admin: filter per penyimak kalau dipilih
    if (state.user.role === 'admin') {
      const fPenyimak = val('ps-filter-penyimak');
      if (fPenyimak) payload.penyimak_id = fPenyimak;
    }

    const res = await call('getPresensi', payload);
    if (!res.ok) { el.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }

    // Map untuk display
    const userMap = {};
    (state.cache.users||[]).forEach(u => { userMap[u.id] = u.nama; });
    if (state.cache.penyimakList) state.cache.penyimakList.forEach(u => { userMap[u.id] = u.nama; });
    userMap[state.user.id || state.user.user_id] = state.user.nama;
    const santriMap = {};
    (state.cache.santri || []).forEach(s => { santriMap[s.id] = s.nama; });
    const kelasMap = {};
    (state.cache.kelas || []).forEach(k => { kelasMap[k.id] = k.nama_kelas; });

    // Group by tanggal + penyimak_id
    const groups = {};
    res.data.forEach(r => {
      const key = r.tanggal + '|' + r.penyimak_id;
      if (!groups[key]) groups[key] = {
        tanggal: r.tanggal, penyimak_id: r.penyimak_id,
        materi: r.materi, catatan: r.catatan, rows: []
      };
      groups[key].rows.push(r);
    });

    const groupArr = Object.values(groups).sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    if (!groupArr.length) { el.innerHTML = '<div class="tf-empty">Belum ada data presensi.</div>'; return; }

    el.innerHTML = groupArr.map((g, gi) => {
      const hadir = g.rows.filter(r => r.status === 'Hadir').length;
      const izin  = g.rows.filter(r => r.status === 'Izin').length;
      const sakit = g.rows.filter(r => r.status === 'Sakit').length;
      const alfa  = g.rows.filter(r => r.status === 'Alfa').length;
      const guruNama = userMap[g.penyimak_id] || '(Guru)';
      return `<div class="tf-presensi-group">
        <div class="tf-presensi-group-head" onclick="TF.togglePresensiGroup('pg-${gi}')">
          <span>📅 ${g.tanggal} — <b>${escapeHtml(guruNama)}</b></span>
          <span class="tf-ps-summary">
            <span class="tf-ps-chip tf-ps-hadir">H:${hadir}</span>
            <span class="tf-ps-chip tf-ps-izin">I:${izin}</span>
            <span class="tf-ps-chip tf-ps-sakit">S:${sakit}</span>
            <span class="tf-ps-chip tf-ps-alfa">A:${alfa}</span>
            <button class="tf-btn-icon tf-btn-icon-del" onclick="event.stopPropagation();TF.hapusPresensi('${g.tanggal}','${g.penyimak_id}')" title="Hapus">🗑</button>
            <span class="tf-ps-toggle">▾</span>
          </span>
        </div>
        <div class="tf-presensi-group-body" id="pg-${gi}" style="display:none;">
          ${g.materi ? `<p style="margin:4px 8px;font-size:13px;">📖 Materi: <b>${escapeHtml(g.materi)}</b></p>` : ''}
          ${g.catatan ? `<p style="margin:4px 8px;font-size:13px;">📝 Catatan: ${escapeHtml(g.catatan)}</p>` : ''}
          <table class="tf-table" style="margin-top:6px;">
            <thead><tr><th>#</th><th>Nama Siswa</th><th>Kelas</th><th>Status</th></tr></thead>
            <tbody>
              ${g.rows.map((r,i) => `<tr>
                <td style="text-align:center;color:#9ca3af;font-size:12px;">${i+1}</td>
                <td>${escapeHtml(santriMap[r.santri_id]||'-')}</td>
                <td>${escapeHtml(kelasMap[r.kelas_id]||'-')}</td>
                <td><span class="tf-ps-badge tf-ps-${(r.status||'hadir').toLowerCase()}">${r.status||'Hadir'}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }).join('');
  }

  function togglePresensiGroup(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
  }

  async function hapusPresensi(tanggal, penyimak_id) {
    if (!confirm(`Hapus data presensi tanggal ${tanggal}?`)) return;
    const res = await call('deletePresensi', { tanggal, penyimak_id });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('presensi'); loadRiwayatPresensi();
  }

  async function loadRekapPresensi() {
    const el = document.getElementById('ps-rekap-tabel');
    if (!el) return;
    const payload = { show_all: false };
    const fKelas = val('ps-rekap-kelas');
    const fMulai = val('ps-rekap-mulai');
    const fAkhir = val('ps-rekap-akhir');
    if (fKelas) payload.kelas_id = fKelas;
    if (fMulai) payload.tanggal_mulai = fMulai;
    if (fAkhir) payload.tanggal_akhir = fAkhir;
    if (!fMulai && !fAkhir) { el.innerHTML = '<div class="tf-empty">Pilih rentang tanggal untuk melihat rekap kehadiran.</div>'; return; }
    el.innerHTML = '<div class="tf-empty">Memuat...</div>';
    const res = await call('getRekapPresensi', payload);
    if (!res.ok) { el.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }
    if (!res.data.length) { el.innerHTML = '<div class="tf-empty">Tidak ada data kehadiran pada periode ini.</div>'; return; }
    el.innerHTML = `<table class="tf-table"><thead><tr>
      <th>#</th><th>Nama</th><th>Kelas</th><th>Level Ummi</th>
      <th style="text-align:center;color:#16a34a;">H</th>
      <th style="text-align:center;color:#d97706;">I</th>
      <th style="text-align:center;color:#2563eb;">S</th>
      <th style="text-align:center;color:#dc2626;">A</th>
      <th style="text-align:center;">Total</th>
      <th style="text-align:center;">% Hadir</th>
    </tr></thead><tbody>
    ${res.data.map((r,i) => `<tr>
      <td style="text-align:center;color:#9ca3af;font-size:12px;">${i+1}</td>
      <td>${escapeHtml(r.nama)}</td>
      <td>${escapeHtml(r.kelas_nama)}</td>
      <td>${escapeHtml(r.level_ummi)}</td>
      <td style="text-align:center;font-weight:700;color:#16a34a;">${r.hadir}</td>
      <td style="text-align:center;color:#d97706;">${r.izin}</td>
      <td style="text-align:center;color:#2563eb;">${r.sakit}</td>
      <td style="text-align:center;color:#dc2626;">${r.alfa}</td>
      <td style="text-align:center;">${r.total}</td>
      <td style="text-align:center;">
        <span style="color:${r.pct_hadir>=75?'#16a34a':'#dc2626'};font-weight:700;">${r.pct_hadir}%</span>
      </td>
    </tr>`).join('')}
    </tbody></table>`;
  }

  // ---------- STATISTIK ----------
  async function renderStatistik(content) {
    const santriRes = await call('getSantri');
    state.cache.santri = santriRes.ok ? santriRes.data : [];
    const santriOptions = '<option value="all">Semua Siswa</option>' + state.cache.santri.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join('');
    content.innerHTML = `
      <h1 class="tf-title">Statistik Setoran</h1>
      <div class="tf-panel"><div class="tf-panel-body">
        <div class="tf-stat-filter">
          <select id="st-periode" onchange="TF.toggleStatFilter()">
            <option value="harian">Harian</option>
            <option value="pekanan">Pekanan (Mingguan)</option>
            <option value="bulanan" selected>Bulanan</option>
            <option value="tentatif">Tentatif (Rentang Tanggal)</option>
          </select>
          <input id="st-tanggal-ref" type="date" value="${todayStr()}">
          <input id="st-tanggal-mulai" type="date" class="tf-hide">
          <input id="st-tanggal-selesai" type="date" class="tf-hide">
          <select id="st-santri">${santriOptions}</select>
          <button class="tf-btn-sm" onclick="TF.loadStatistik()">Tampilkan</button>
        </div>
        <div id="tf-statistik-result"><div class="tf-empty">Pilih filter lalu klik Tampilkan.</div></div>
      </div></div>
    `;
  }

  function toggleStatFilter() {
    const p = val('st-periode');
    document.getElementById('st-tanggal-ref').classList.toggle('tf-hide', p === 'tentatif');
    document.getElementById('st-tanggal-mulai').classList.toggle('tf-hide', p !== 'tentatif');
    document.getElementById('st-tanggal-selesai').classList.toggle('tf-hide', p !== 'tentatif');
  }

  async function loadStatistik() {
    const periode = val('st-periode');
    const payload = { periode, santri_id: val('st-santri') };
    if (periode === 'tentatif') { payload.tanggal_mulai = val('st-tanggal-mulai'); payload.tanggal_selesai = val('st-tanggal-selesai'); }
    else payload.tanggal_referensi = val('st-tanggal-ref');

    const res = await call('getStatistik', payload);
    const el = document.getElementById('tf-statistik-result');
    if (!res.ok) { el.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }

    const days = Object.keys(res.per_hari).sort();
    const maxCount = Math.max(1, ...Object.values(res.per_hari));
    const bars = days.map(tgl => {
      const c = res.per_hari[tgl];
      return `<div class="tf-bar-row"><span class="tf-bar-label">${tgl}</span>
        <div class="tf-bar-track"><div class="tf-bar-fill" style="width:${(c / maxCount * 100)}%"></div></div>
        <span class="tf-bar-value">${c}</span></div>`;
    }).join('');

    el.innerHTML = `
      <div class="tf-stats">
        <div class="tf-stat-card c-cyan"><div class="label">TOTAL SETORAN</div><div class="value">${res.total_setoran}</div></div>
        <div class="tf-stat-card c-red"><div class="label">RATA-RATA NILAI</div><div class="value">${res.rata_nilai.toFixed(2)}</div></div>
        <div class="tf-stat-card c-green"><div class="label">HAFALAN BARU</div><div class="value">${res.per_jenis['Hafalan Baru'] || 0}</div></div>
        <div class="tf-stat-card c-green2"><div class="label">MUROJAAH</div><div class="value">${res.per_jenis['Murojaah'] || 0}</div></div>
      </div>
      <h3 style="color:var(--green-dark);font-size:15px;">Grafik Setoran per Hari</h3>
      <div class="tf-bar-chart">${bars || '<div class="tf-empty">Tidak ada data pada rentang ini.</div>'}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:18px;">
        <h3 style="color:var(--green-dark);font-size:15px;margin:0;">🏆 Peringkat Capaian Siswa</h3>
        <select id="st-sort-peringkat" onchange="TF.renderPeringkat()">
          <option value="rata_nilai">Urutkan: Rata-rata Nilai Tertinggi</option>
          <option value="total_setoran">Urutkan: Total Setoran Terbanyak</option>
        </select>
      </div>
      <div id="tf-peringkat-result"></div>
    `;
    state.cache.statPeringkat = res.peringkat || [];
    renderPeringkat();
  }

  // Peringkat siswa pada periode/filter statistik yang sedang ditampilkan, bisa diurutkan
  // berdasarkan kategori capaian tertinggi (rata-rata nilai atau total setoran).
  function renderPeringkat() {
    const el = document.getElementById('tf-peringkat-result');
    if (!el) return;
    const sortSel = document.getElementById('st-sort-peringkat');
    const sortBy = sortSel ? sortSel.value : 'rata_nilai';
    const data = (state.cache.statPeringkat || []).slice().sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    if (!data.length) { el.innerHTML = '<div class="tf-empty">Tidak ada data siswa pada filter ini.</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    const rows = data.map((d, i) => `
      <tr>
        <td style="text-align:center;font-weight:700;">${medals[i] || (i + 1)}</td>
        <td>${escapeHtml(d.nama)}</td>
        <td>${escapeHtml(d.kelas_nama)}</td>
        <td>${escapeHtml(d.level_ummi)}</td>
        <td style="text-align:center;${sortBy === 'total_setoran' ? 'font-weight:700;' : ''}">${d.total_setoran}</td>
        <td style="text-align:center;${sortBy === 'rata_nilai' ? 'font-weight:700;' : ''}">${d.rata_nilai}</td>
      </tr>`).join('');
    el.innerHTML = `
      <div class="tf-table-wrap">
        <table class="tf-table">
          <thead><tr><th>#</th><th>Nama</th><th>Kelas</th><th>Level Ummi</th><th>Total Setoran</th><th>Rata-rata Nilai</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }

  // ---------- PROGRESS SISWA ----------
  // Tren nilai + konsistensi kehadiran seorang siswa dari waktu ke waktu,
  // memakai data Setoran & Presensi yang sudah ada (tidak ada skema baru).
  async function renderProgress(content) {
    const isSantri = state.user.role === 'santri';
    let santriOptions = '';
    if (!isSantri) {
      const santriRes = await call('getSantri', { binaan_only: state.user.role === 'penyimak' });
      state.cache.santriProgress = santriRes.ok ? santriRes.data : [];
      santriOptions = state.cache.santriProgress.map(s => `<option value="${s.id}">${escapeHtml(s.nama)}</option>`).join('');
    }
    const today = todayStr();
    const mulaiDefault = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    content.innerHTML = `
      <h1 class="tf-title">Progress Siswa</h1>
      <div class="tf-panel"><div class="tf-panel-body">
        <div class="tf-stat-filter">
          ${isSantri ? '' : `<select id="pg-santri">${santriOptions || '<option value="">Belum ada data siswa</option>'}</select>`}
          <input id="pg-tanggal-mulai" type="date" value="${mulaiDefault}">
          <input id="pg-tanggal-akhir" type="date" value="${today}">
          <button class="tf-btn-sm" onclick="TF.loadProgress()">Tampilkan</button>
        </div>
        <div id="tf-progress-result"><div class="tf-empty">${isSantri ? 'Memuat progress kamu...' : 'Pilih siswa lalu klik Tampilkan.'}</div></div>
      </div></div>
    `;
    if (isSantri) loadProgress();
  }

  async function loadProgress() {
    const el = document.getElementById('tf-progress-result');
    const isSantri = state.user.role === 'santri';
    const payload = {
      tanggal_mulai: val('pg-tanggal-mulai'),
      tanggal_akhir: val('pg-tanggal-akhir')
    };
    if (!isSantri) {
      const santriId = val('pg-santri');
      if (!santriId) { el.innerHTML = '<p class="tf-error">Pilih siswa terlebih dahulu.</p>'; return; }
      payload.santri_id = santriId;
    }
    el.innerHTML = '<div class="tf-empty">Memuat...</div>';

    const res = await call('getProgressSiswa', payload);
    if (!res.ok) { el.innerHTML = '<p class="tf-error">' + escapeHtml(res.error) + '</p>'; return; }

    const trenBadge = res.tren.arah === 'naik'
      ? `<span class="tf-badge" style="background:#dcfce7;color:#166534;">▲ Naik ${res.tren.delta > 0 ? '+' : ''}${res.tren.delta}</span>`
      : res.tren.arah === 'turun'
        ? `<span class="tf-badge" style="background:#fee2e2;color:#991b1b;">▼ Turun ${res.tren.delta}</span>`
        : `<span class="tf-badge" style="background:#f1f5f9;color:#475569;">→ Stabil</span>`;

    const weeks = Object.keys(res.nilai_per_minggu).sort();
    const maxNilai = Math.max(1, ...Object.values(res.nilai_per_minggu));
    const bars = weeks.map(wk => {
      const v = res.nilai_per_minggu[wk];
      return `<div class="tf-bar-row"><span class="tf-bar-label">${wk}</span>
        <div class="tf-bar-track"><div class="tf-bar-fill" style="width:${(v / maxNilai * 100)}%"></div></div>
        <span class="tf-bar-value">${v}</span></div>`;
    }).join('');

    const k = res.kehadiran;
    const kehadiranHtml = k.total > 0
      ? `<div class="tf-stats">
          <div class="tf-stat-card c-green"><div class="label">HADIR</div><div class="value">${k.hadir}</div></div>
          <div class="tf-stat-card c-gold"><div class="label">IZIN/SAKIT</div><div class="value">${k.izin + k.sakit}</div></div>
          <div class="tf-stat-card c-red"><div class="label">ALFA</div><div class="value">${k.alfa}</div></div>
          <div class="tf-stat-card c-cyan"><div class="label">% KEHADIRAN</div><div class="value">${k.pct_hadir}%</div></div>
        </div>`
      : '<div class="tf-empty">Belum ada data presensi pada rentang ini.</div>';

    const trendRows = res.nilai_trend.slice().reverse().map(n => `
      <tr>
        <td>${escapeHtml(n.tanggal)}</td>
        <td><span class="tf-badge ${n.jenis==='Murojaah'?'b-murajaah':n.jenis==='Tilawah'?'b-tilawah':n.jenis==='Setoran Metode Ummi'?'b-ummi':'b-hafalan'}">${escapeHtml(n.jenis||'-')}</span></td>
        <td style="text-align:center;">${n.nilai}</td>
        <td>${escapeHtml(n.predikat||'-')}</td>
      </tr>`).join('');

    el.innerHTML = `
      <h2 style="color:var(--green-dark);font-size:17px;margin:0 0 4px;">
        ${escapeHtml(res.santri.nama)}
        <span style="font-size:13px;font-weight:400;color:#64748b;">— ${escapeHtml(res.santri.kelas_nama)} · Level ${escapeHtml(res.santri.level_ummi)}</span>
      </h2>
      <p style="font-size:12.5px;color:#64748b;margin:0 0 14px;">Rentang: ${res.rentang.mulai} s/d ${res.rentang.akhir}</p>
      <div class="tf-stats">
        <div class="tf-stat-card c-cyan"><div class="label">TOTAL SETORAN</div><div class="value">${res.total_setoran}</div></div>
        <div class="tf-stat-card c-red"><div class="label">RATA-RATA NILAI</div><div class="value">${res.rata_nilai}</div></div>
        <div class="tf-stat-card c-green"><div class="label">TREN NILAI</div><div class="value" style="font-size:16px;">${trenBadge}</div></div>
      </div>
      <h3 style="color:var(--green-dark);font-size:15px;margin-top:18px;">Tren Rata-rata Nilai per Minggu</h3>
      <div class="tf-bar-chart">${bars || '<div class="tf-empty">Belum ada setoran bernilai pada rentang ini.</div>'}</div>
      <h3 style="color:var(--green-dark);font-size:15px;margin-top:18px;">Konsistensi Kehadiran</h3>
      ${kehadiranHtml}
      <h3 style="color:var(--green-dark);font-size:15px;margin-top:18px;">Riwayat Nilai Setoran</h3>
      <div class="tf-table-wrap">
        <table class="tf-table">
          <thead><tr><th>Tanggal</th><th>Jenis</th><th>Nilai</th><th>Predikat</th></tr></thead>
          <tbody>${trendRows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;">Belum ada data</td></tr>'}</tbody>
        </table>
      </div>
    `;
  }

  // ---------- REKAP & RAPOR ----------
  async function renderRekap(content) {
    const kelasRes = await call('getKelas');
    state.cache.kelas = kelasRes.ok ? kelasRes.data : [];
    const kelasOptions = '<option value="">Semua Kelas</option>' + state.cache.kelas.map(k => `<option value="${k.id}">${escapeHtml(k.nama_kelas)}</option>`).join('');
    const now = new Date();
    const defaultSem = now.getMonth() >= 6 ? '1' : '2'; // Jul-Des = sem 1
    content.innerHTML = `
      <h1 class="tf-title">Rekap &amp; Rapor</h1>
      <div class="tf-panel"><div class="tf-panel-body">
        <div class="tf-stat-filter" style="flex-wrap:wrap;gap:8px;">
          <select id="rk-mode" onchange="TF.toggleRekapMode()">
            <option value="semester" selected>Semester</option>
            <option value="bebas">Rentang Bebas</option>
          </select>
          <span id="rk-semester-wrap">
            <select id="rk-semester">
              <option value="1" ${defaultSem==='1'?'selected':''}>Semester 1 (Jul–Des)</option>
              <option value="2" ${defaultSem==='2'?'selected':''}>Semester 2 (Jan–Jun)</option>
            </select>
          </span>
          <input id="rk-tahun" type="number" value="${now.getFullYear()}" style="width:80px">
          <span id="rk-bebas-wrap" style="display:none;gap:6px;align-items:center;">
            <input id="rk-tgl-mulai" type="date" value="${todayStr()}" style="width:140px">
            <span style="font-size:12px;">s/d</span>
            <input id="rk-tgl-akhir" type="date" value="${todayStr()}" style="width:140px">
          </span>
          <select id="rk-kelas">${kelasOptions}</select>
          <button class="tf-btn-sm" onclick="TF.loadRekap()">Tampilkan</button>
          <button class="tf-add-btn" onclick="TF.exportRekapExcel()">⬇ Export Excel</button>
        </div>
        <div id="tf-rekap-result"><div class="tf-empty">Pilih semester lalu klik Tampilkan.</div></div>
      </div></div>
    `;
  }

  function toggleRekapMode() {
    const mode = val('rk-mode');
    document.getElementById('rk-semester-wrap').style.display = mode === 'semester' ? '' : 'none';
    document.getElementById('rk-bebas-wrap').style.display  = mode === 'bebas'     ? 'flex' : 'none';
    const tahunEl = document.getElementById('rk-tahun');
    if (tahunEl) tahunEl.style.display = mode === 'bebas' ? 'none' : '';
  }

  function monthOptions(selected) {
    const names = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return names.map((n, i) => `<option value="${i + 1}" ${i + 1 === selected ? 'selected' : ''}>${n}</option>`).join('');
  }

  async function loadRekap() {
    const mode = val('rk-mode');
    const tahunInput = Number(val('rk-tahun'));  // tahun yg diketik user = tahun awal tahun ajaran
    const kelas_id = val('rk-kelas');
    let payload;
    if (mode === 'semester') {
      const sem = val('rk-semester');
      if (sem === '1') {
        // Semester 1: Juli–Desember tahun yg diinput (misal 2026)
        payload = { bulan_mulai: 7, bulan_akhir: 12, tahun: tahunInput, kelas_id };
      } else {
        // Semester 2: Januari–Juni tahun BERIKUTNYA (misal 2027 untuk TA 2026/2027)
        payload = { bulan_mulai: 1, bulan_akhir: 6, tahun: tahunInput + 1, kelas_id };
      }
    } else {
      payload = { tanggal_mulai: val('rk-tgl-mulai'), tanggal_akhir: val('rk-tgl-akhir'), kelas_id };
    }
    const res = await call('getRekap', payload);
    state.cache.rekap = res.ok ? res.data : [];
    state.cache.rekapMeta = { mode, tahun: tahunInput,
      bulan_mulai: payload.bulan_mulai, bulan_akhir: payload.bulan_akhir,
      tahun_data: payload.tahun,   // tahun aktual data (bisa tahunInput+1 untuk sem 2)
      sem: mode === 'semester' ? val('rk-semester') : null,
      tgl_mulai: payload.tanggal_mulai, tgl_akhir: payload.tanggal_akhir };
    const el = document.getElementById('tf-rekap-result');
    if (!res.ok) { el.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }
    // Simpan rekap ke cache dengan field yang konsisten untuk sorting
    state.cache.rekap = res.data.map(d => Object.assign({}, d, {
      guru_pengampu: d.penyimak_nama || '-'
    }));
    el.innerHTML = res.data.length
      ? `<div class="tf-table-wrap" id="tf-table-rekap">${buildTableHtml('rekap')}</div>`
      : '<div class="tf-empty">Tidak ada data pada periode ini.</div>';
  }

  // ---------- CETAK RAPOR (desain ringkasan v1 + kop resmi + ttd v2) ----------
  function cetakRapor(santriId) {
    const d = (state.cache.rekap || []).find(x => String(x.santri_id) === String(santriId));
    if (!d) return;

    const meta = state.cache.rekapMeta || {};

    // ── Label periode & tahun ajaran ──
    const BN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    let periodeLabel = '', periodeRangLabel = '', tahunAjaranLabel = '';

    function getTahunAjaranFE(tahunAwal) {
      // tahunAwal = tahun awal tahun ajaran (Juli), misal 2026 → "2026/2027"
      return tahunAwal + '/' + (Number(tahunAwal) + 1);
    }

    if (meta.mode === 'semester') {
      const semNum = meta.sem === '1' ? 1 : 2;
      const bM = BN[Number(meta.bulan_mulai)-1];
      const bA = BN[Number(meta.bulan_akhir)-1];
      // tahun awal TA = selalu tahun yg diinput user (meta.tahun)
      // tahun_data = tahun aktual data (meta.tahun untuk sem1, meta.tahun+1 untuk sem2)
      const tahunData = meta.tahun_data || (semNum === 1 ? meta.tahun : Number(meta.tahun) + 1);
      const tahunAwal = semNum === 1 ? meta.tahun : Number(meta.tahun);
      // Label: "Semester 1 (Juli – Desember 2026)"
      periodeLabel     = `Semester ${semNum} (${bM} \u2013 ${bA} ${tahunData})`;
      // Periode di info siswa: "Juli – Desember 2026" (tanpa angka tanggal)
      periodeRangLabel = `${bM} \u2013 ${bA} ${tahunData}`;
      tahunAjaranLabel = 'Tahun Ajaran ' + getTahunAjaranFE(tahunAwal);
    } else {
      const fmtD = v => {
        if (!v) return '';
        const p = v.split('-');
        return `${BN[Number(p[1])-1]} ${p[0]}`;  // "Juli 2026" (tanpa tanggal)
      };
      periodeLabel     = `${fmtD(meta.tgl_mulai)} \u2013 ${fmtD(meta.tgl_akhir)}`;
      periodeRangLabel = periodeLabel;
      tahunAjaranLabel = '';
    }

    // ── Tanggal cetak ──
    const now = new Date();
    const tglCetak = `Blora, ${now.getDate()} ${BN[now.getMonth()]} ${now.getFullYear()}`;

    // ── Nama guru pengampu ──
    const guruNama = d.penyimak_nama || '..............................';

    // ── Agregat per jenis ──
    const jenisAll = ['Setoran Metode Ummi','Hafalan Baru','Murojaah','Tilawah'];
    function avgN(arr) { const ns=arr.map(r=>Number(r.nilai)).filter(n=>!isNaN(n)&&n>0); return ns.length?Math.round(ns.reduce((a,b)=>a+b,0)/ns.length*10)/10:0; }
    function avgF(arr,f) { const ns=arr.map(r=>Number(r[f])).filter(n=>!isNaN(n)&&n>0); return ns.length?Math.round(ns.reduce((a,b)=>a+b,0)/ns.length*10)/10:0; }
    const byJ = {}; jenisAll.forEach(j=>{ byJ[j]=d.detail.filter(r=>r.jenis===j); });

    // ── Hari hadir ──
    const hariHadir = new Set(d.detail.map(r=>String(r.tanggal||'').split('T')[0]).filter(Boolean)).size;

    // ── Predikat umum ──
    function predUmum(n) { if(n>=90)return'Jayyid Jiddan';if(n>=80)return'Jayyid';if(n>=70)return'Maqbul';return'Dhoif'; }

    // ── Blok Penilaian Metode Ummi ──
    const ummiRows = byJ['Setoran Metode Ummi'];
    let ummiBlock = '';
    if (ummiRows.length) {
      const hh = ummiRows.map(r=>[Number(r.halaman_mulai)||0,Number(r.halaman_selesai)||0]).filter(h=>h[0]||h[1]);
      const halAwal  = hh.length?Math.min(...hh.map(h=>h[0])):'—';
      const halAkhir = hh.length?Math.max(...hh.map(h=>h[1])):'—';
      const pFreq={}; ummiRows.forEach(r=>{if(r.predikat)pFreq[r.predikat]=(pFreq[r.predikat]||0)+1;});
      const topP = Object.keys(pFreq).sort((a,b)=>pFreq[b]-pFreq[a])[0]||'—';
      const errs = ummiRows.map(r=>{ const g=UMMI_GRADE_TABLE.find(x=>x.kode===r.predikat||x.label.startsWith(r.predikat||'###')); return g?g.kesalahan:null; }).filter(x=>x!==null);
      const avgErr = errs.length?Math.round(errs.reduce((a,b)=>a+b,0)/errs.length*10)/10:'—';
      ummiBlock = `
        <div class="rp-sec">Penilaian Metode Ummi (Per Halaman)</div>
        <div class="rp-ummi-box">
          <div class="rp-ummi-grid">
            <div class="item"><div class="v">Hal. ${halAwal} → ${halAkhir}</div><div class="l">Progres Halaman</div></div>
            <div class="item"><div class="v">${avgN(ummiRows)}</div><div class="l">Rata-rata Nilai</div></div>
            <div class="item"><div class="v">${topP}</div><div class="l">Nilai Terbanyak</div></div>
            <div class="item"><div class="v">${avgErr}</div><div class="l">Rata-rata Kesalahan</div></div>
          </div>
        </div>`;
    }

    // ── Tabel ringkasan per jenis ──
    // Rata-rata nilai = (tajwid + fashohah + kelancaran) / 3.
    // Jika sub-komponen tidak diisi (0/kosong), gunakan nilai utama sebagai estimasi masing-masing,
    // sehingga rata-rata tetap = nilai (konsisten dengan input guru yang belum mengisi sub-komponen).
    const badgeCls = {'Setoran Metode Ummi':'b-ummi','Hafalan Baru':'b-haf','Murojaah':'b-mur','Tilawah':'b-til'};
    const tabelRows = jenisAll.filter(j=>byJ[j].length).map(j=>{
      const rows=byJ[j], isUmmi=j==='Setoran Metode Ummi';
      const aTajwid     = avgF(rows,'nilai_tajwid');
      const aFashohah   = avgF(rows,'nilai_fashohah');
      const aKelancaran = avgF(rows,'nilai_kelancaran');
      // Jika sub-nilai ada, rata-rata dihitung dari sub-nilai; jika tidak, ambil dari nilai utama
      const subAda = aTajwid > 0 || aFashohah > 0 || aKelancaran > 0;
      const showT = isUmmi ? '—' : (aTajwid     || avgN(rows));
      const showF = isUmmi ? '—' : (aFashohah   || avgN(rows));
      const showK = isUmmi ? '—' : (aKelancaran  || avgN(rows));
      // Rata-rata = avg sub-komponen jika ada, else nilai utama
      const av = isUmmi ? avgN(rows)
        : (subAda ? Math.round(([aTajwid||avgN(rows), aFashohah||avgN(rows), aKelancaran||avgN(rows)]
            .reduce((a,b)=>a+b,0)/3)*10)/10
        : avgN(rows));
      return `<tr>
        <td><span class="badge ${badgeCls[j]}">${j}</span></td>
        <td>${rows.length}</td><td>${av}</td><td>${predUmum(av)}</td>
        <td>${showT}</td><td>${showF}</td><td>${showK}</td>
      </tr>`;
    }).join('');

    // ── Grafik progress bar ──
    const barColors={'Setoran Metode Ummi':'#7c3aed','Hafalan Baru':'#0369a1','Murojaah':'#b96d12','Tilawah':'#1d5d96'};
    const bars = jenisAll.filter(j=>byJ[j].length).map(j=>{
      const v=avgN(byJ[j]), c=barColors[j];
      return `<div class="rp-prog-row">
        <span class="nm" style="color:${c};font-weight:700;">${j}</span>
        <div class="track"><div class="fill" style="width:${v}%;background:${c};"></div></div>
        <span class="num" style="color:${c};">${v}</span>
      </div>`;
    }).join('');

    // ── Catatan deskriptif otomatis berdasarkan capaian siswa ──
    function generateCatatan(d, byJ, hariHadir, periodeLabel) {
      const nama = d.nama.split(' ')[0]; // Panggil dengan nama depan
      const avg = d.rata_nilai;
      const total = d.total_setoran;

      // Predikat keseluruhan
      const predMap = avg >= 90 ? ['sangat baik','Jayyid Jiddan','mempertahankan dan terus meningkatkan kualitas bacaan']
        : avg >= 80 ? ['baik','Jayyid','terus berlatih agar mencapai predikat Jayyid Jiddan']
        : avg >= 70 ? ['cukup','Maqbul','meningkatkan intensitas latihan dan memperbanyak murojaah']
        : ['perlu perhatian','Dhoif','meningkatkan frekuensi setoran dan bimbingan intensif'];

      // Keaktifan
      const aktifKet = hariHadir >= 20 ? 'sangat aktif mengikuti kegiatan setoran'
        : hariHadir >= 15 ? 'cukup aktif mengikuti kegiatan setoran'
        : hariHadir >= 8  ? 'hadir cukup, namun perlu ditingkatkan keaktifannya'
        : 'perlu ditingkatkan kehadirannya dalam kegiatan setoran';

      // Kalimat per jenis
      const kalimatJenis = [];
      const haf = byJ['Hafalan Baru'], mur = byJ['Murojaah'], til = byJ['Tilawah'];
      if (haf.length) {
        const av = avgN(haf);
        kalimatJenis.push(`hafalan baru ${av>=85?'menunjukkan hasil yang memuaskan':'masih perlu ditingkatkan'} dengan rata-rata nilai ${av}`);
      }
      if (mur.length) {
        const av = avgN(mur);
        kalimatJenis.push(`murojaah berjalan ${av>=85?'dengan baik dan lancar':'cukup lancar namun perlu penguatan'} (rata-rata ${av})`);
      }
      if (til.length) {
        const av = avgN(til);
        kalimatJenis.push(`tilawah ${av>=85?'sudah baik':'perlu diperbaiki'} dengan rata-rata nilai ${av}`);
      }

      // Kalimat Ummi
      let ummiKet = '';
      const ummiRows = byJ['Setoran Metode Ummi'];
      if (ummiRows.length) {
        const hh = ummiRows.map(r=>[Number(r.halaman_mulai)||0,Number(r.halaman_selesai)||0]).filter(h=>h[0]||h[1]);
        const halAwal  = hh.length ? Math.min(...hh.map(h=>h[0])) : null;
        const halAkhir = hh.length ? Math.max(...hh.map(h=>h[1])) : null;
        const avU = avgN(ummiRows);
        const naik = halAwal && halAkhir && halAkhir > halAwal;
        ummiKet = `Pada penilaian Metode Ummi, Ananda ${naik?`berhasil menyelesaikan halaman ${halAwal} hingga ${halAkhir}`:`telah mengikuti penilaian Metode Ummi`} dengan rata-rata nilai ${avU} (${avU>=85?'sangat baik':avU>=75?'baik':'perlu penguatan'}). `;
      }

      const jenisKet = kalimatJenis.length ? `Untuk jenis setoran lainnya: ${kalimatJenis.join('; ')}. ` : '';

      return `Ananda ${nama} ${aktifKet} pada ${periodeLabel} dengan total ${total} setoran dan rata-rata nilai ${avg} (predikat: ${predMap[1]}). ${ummiKet}${jenisKet}Secara keseluruhan perkembangan Ananda ${predMap[0]}, dan diharapkan untuk ${predMap[2]}.`;
    }

    const catatanText = generateCatatan(d, byJ, hariHadir, periodeLabel);

    document.getElementById('tf-rapor-print').innerHTML = `
      <div class="tf-rapor-a4">
        <div class="rp-kop">
          <div class="rp-kop-logo">
            <img src="data:image/jpeg;base64,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" alt="Logo SMP Islam Moetiah">
          </div>
          <div class="rp-kop-teks">
            <p class="t1">YAYASAN ENCIK MOETIAH MOELJONO</p>
            <p class="t2">SEKOLAH MENENGAH PERTAMA ISLAM MOETIAH</p>
            <p class="t3">Alamat: Jl. Gunung Lawu Lorong I Nomor 20 Sawahan, Kelurahan Tempelan, Kecamatan Blora<br>
              Kabupaten Blora, Provinsi Jawa Tengah, Kode Pos: 58211, Email: smpIslammoetiah@gmail.com
              &nbsp; Website: yayasanmoetiah.org &nbsp; Telephone: 0851 2103 8591
            </p>
          </div>
        </div>

        <div class="rp-judul">
          <h1>Rapor Perkembangan Pembelajaran Al-Qur'an</h1>
          <p>${tahunAjaranLabel}</p>
          <p>${periodeLabel}</p>
        </div>

        <div class="rp-info-box">
          <div class="rp-info-grid">
            <div class="row"><span class="lbl">Nama Siswa</span><span class="col">:</span><span class="val">${escapeHtml(d.nama)}</span></div>
            <div class="row"><span class="lbl">Kelas</span><span class="col">:</span><span class="val">${escapeHtml(d.kelas_nama)}</span></div>
            <div class="row"><span class="lbl">NIS</span><span class="col">:</span><span class="val">${escapeHtml(d.nis)}</span></div>
            <div class="row"><span class="lbl">Level / Jilid Ummi</span><span class="col">:</span><span class="val">${escapeHtml(d.level_ummi)}</span></div>
            <div class="row"><span class="lbl">Guru Pengampu</span><span class="col">:</span><span class="val">${escapeHtml(guruNama)}</span></div>
            <div class="row"><span class="lbl">Periode</span><span class="col">:</span><span class="val">${periodeRangLabel}</span></div>
          </div>
        </div>

        <div class="rp-sec">Ringkasan Setoran Semester</div>
        <div class="rp-cards">
          <div class="rp-card rp-c1"><div class="v">${d.total_setoran}</div><div class="l">Total Setoran</div></div>
          <div class="rp-card rp-c2"><div class="v">${d.rata_nilai}</div><div class="l">Rata-rata Nilai</div></div>
          <div class="rp-card rp-c3"><div class="v">${hariHadir}</div><div class="l">Hari Hadir Setoran</div></div>
          <div class="rp-card rp-c4"><div class="v">${predUmum(d.rata_nilai)}</div><div class="l">Predikat Umum</div></div>
        </div>

        ${ummiBlock}

        <div class="rp-sec">Ringkasan per Jenis Setoran</div>
        <table class="rp-table">
          <thead><tr>
            <th style="text-align:left;">Jenis Setoran</th>
            <th>Jumlah</th><th>Rata-rata Nilai</th><th>Predikat</th>
            <th>Tajwid</th><th>Fashohah</th><th>Kelancaran</th>
          </tr></thead>
          <tbody>${tabelRows||'<tr><td colspan="7" style="text-align:center;">Tidak ada data.</td></tr>'}</tbody>
        </table>

        <div class="rp-sec" style="margin-top:10px;">Grafik Rata-rata Nilai per Jenis</div>
        <div style="margin-bottom:13px;">${bars}</div>

        <div class="rp-sec">Catatan Guru Pengampu</div>
        <div class="rp-catatan" style="font-style:normal;">${escapeHtml(catatanText)}</div>

        <div class="rp-ttd">
          <div class="rp-ttd-col left">
            <span>Orang Tua/Wali</span>
            <div class="rp-ttd-space"></div>
            <span class="rp-ttd-dots">.................................</span>
          </div>
          <div class="rp-ttd-col mid">
            <span>Mengetahui,</span>
            <span>Kepala Sekolah</span>
            <div class="rp-ttd-space"></div>
            <span class="rp-ttd-name">Ramdhan Machmoed, S.S., M.Pd.</span>
          </div>
          <div class="rp-ttd-col right">
            <span>${tglCetak}</span>
            <span>Guru Pengampu,</span>
            <div class="rp-ttd-space"></div>
            <span class="rp-ttd-name">${escapeHtml(guruNama)}</span>
          </div>
        </div>

        <div class="rp-footer">Dicetak otomatis oleh Sistem Tahfiz SMP Islam Moetiah &mdash; Rapor merupakan rekap ringkas per semester.</div>
      </div>
    `;
    document.getElementById('tf-rapor-print').classList.remove('tf-hide');
    window.print();
    document.getElementById('tf-rapor-print').classList.add('tf-hide');
  }

    function exportRekapExcel() {
    const data = state.cache.rekap || [];
    if (!data.length) { alert('Tidak ada data untuk diexport. Klik Tampilkan dahulu.'); return; }
    const rows = data.map(d => ({
      Nama: d.nama, NIS: d.nis, Kelas: d.kelas_nama, 'Level Ummi': d.level_ummi,
      'Guru Pengampu': d.penyimak_nama || '', 'Total Setoran': d.total_setoran, 'Rata-rata Nilai': d.rata_nilai
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap');
    const meta = state.cache.rekapMeta || {};
    XLSX.writeFile(wb, `Rekap-${meta.tahun||''}.xlsx`);
  }

  // ---------- MUSHAF DIGITAL ----------
  async function renderMushaf(content) {
    const surahOptions = SURAH_PAGES.map(s => `<option value="${s[2]}">${s[0]}. ${s[1]}</option>`).join('');
    content.innerHTML = `
      <h1 class="tf-title">Mushaf Digital</h1>
      <div class="tf-panel"><div class="tf-panel-body">
        <div class="tf-mushaf-toolbar">
          <select id="tf-mushaf-surah" onchange="TF.mushafGotoSurah(this.value)">${surahOptions}</select>
          <button class="tf-btn-sm" onclick="TF.mushafPrev()">‹ Sebelumnya</button>
          <span>Hal. <input id="tf-mushaf-page-input" type="number" min="1" max="604" value="${state.mushafPage}"> / 604</span>
          <button class="tf-btn-sm" onclick="TF.mushafGoto()">Buka</button>
          <button class="tf-btn-sm" onclick="TF.mushafNext()">Berikutnya ›</button>
        </div>
        <div id="tf-mushaf-page" class="tf-mushaf-page">Memuat...</div>
        <div class="tf-mushaf-note">Penomoran halaman mengikuti Mushaf Madinah standar (604 halaman); mungkin berbeda 1-2 halaman dari beberapa cetakan.</div>
      </div></div>
    `;
    await loadMushafPage(state.mushafPage);
  }

  // Ambil teks basmalah "murni" dari ayat global no.1 (Al-Fatihah ayat 1, yang HANYA berisi basmalah,
  // tidak menyambung ayat lain). Dipakai sebagai acuan untuk memisah basmalah dari ayat pertama surah lain.
  async function getBasmalahText() {
    if (state.basmalahText) return state.basmalahText;
    try {
      const res = await fetch('https://api.alquran.cloud/v1/ayah/1/quran-uthmani');
      const json = await res.json();
      if (json.code === 200 && json.data && json.data.text) {
        state.basmalahText = json.data.text.trim();
      }
    } catch (e) { /* abaikan, fallback tanpa pemisahan */ }
    return state.basmalahText;
  }

  async function loadMushafPage(page) {
    state.mushafPage = page;
    const el = document.getElementById('tf-mushaf-page');
    el.innerHTML = 'Memuat halaman ' + page + '...';
    try {
      const basmalahText = await getBasmalahText();
      const res = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`);
      const json = await res.json();
      if (json.code !== 200) { el.innerHTML = 'Gagal memuat halaman.'; return; }
      const ayahs = json.data.ayahs;
      let html = '';
      let lastSurah = null;
      ayahs.forEach(a => {
        if (a.surah.number !== lastSurah) { html += `<div class="tf-surah-head">سورة ${a.surah.name}</div>`; lastSurah = a.surah.number; }
        let ayahText = a.text;
        // Surah selain Al-Fatihah (1) dan At-Taubah (9, tanpa basmalah) menyimpan basmalah
        // menyatu di awal teks ayat pertama. Pisahkan jadi baris sendiri dengan pembatas.
        if (a.numberInSurah === 1 && a.surah.number !== 1 && a.surah.number !== 9
            && basmalahText && ayahText.indexOf(basmalahText) === 0) {
          html += `<div class="tf-basmalah">${basmalahText}</div><div class="tf-basmalah-divider"></div>`;
          ayahText = ayahText.slice(basmalahText.length).trim();
        }
        html += `<span class="tf-ayah">${ayahText}<span class="tf-ayah-num">﴿${toArabicNumber(a.numberInSurah)}﴾</span></span> `;
      });
      el.innerHTML = html;
      const inputEl = document.getElementById('tf-mushaf-page-input');
      if (inputEl) inputEl.value = page;
    } catch (e) {
      el.innerHTML = 'Gagal memuat halaman (periksa koneksi internet).';
    }
  }

  function toArabicNumber(n) {
    const ar = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(n).split('').map(d => ar[d]).join('');
  }
  function mushafPrev() { if (state.mushafPage > 1) loadMushafPage(state.mushafPage - 1); }
  function mushafNext() { if (state.mushafPage < 604) loadMushafPage(state.mushafPage + 1); }
  function mushafGoto() { const p = Number(val('tf-mushaf-page-input')); if (p >= 1 && p <= 604) loadMushafPage(p); }
  function mushafGotoSurah(startPage) { loadMushafPage(Number(startPage)); }

  // ---------- USERS ----------
  async function renderUsers(content) {
    const [res, kelasRes, santriRes] = await Promise.all([call('getUsers'), call('getKelas'), call('getSantri')]);
    if (!res.ok) { content.innerHTML = '<p class="tf-error">' + res.error + '</p>'; return; }
    state.cache.kelas = kelasRes.ok ? kelasRes.data : [];
    state.cache.santri = santriRes.ok ? santriRes.data : [];
    state.cache.users = res.data;
    const kelasMapNama = {};
    state.cache.kelas.forEach(k => { kelasMapNama[k.id] = k.nama_kelas; });

    const rowsHtml = res.data.map((u, idx) => {
      const kelasNama = u.kelas_id ? (kelasMapNama[u.kelas_id] || '(tidak ditemukan)') : '-';
      const roleBadge = `<span class="tf-role-badge tf-role-${u.role}">${escapeHtml(u.role)}</span>`;
      const aksiBinaan = u.role === 'penyimak'
        ? `<button class="tf-btn-sm" onclick="TF.openBinaanModal('${u.id}')">👥 Siswa Binaan</button>`
        : '';
      return `<tr>
        <td>${idx+1}</td>
        <td>${escapeHtml(u.username)}</td>
        <td>${escapeHtml(u.nama)}</td>
        <td>${roleBadge}</td>
        <td style="white-space:nowrap;">
          <button class="tf-btn-icon" title="Edit" onclick="TF.openEditUserModal('${u.id}')">✏️</button>
          <button class="tf-btn-icon" title="Ganti Password" onclick="TF.openChangePasswordModal('${u.id}','${escapeHtml(u.nama)}')">🔑</button>
          <button class="tf-btn-icon tf-btn-icon-del" title="Hapus" onclick="TF.deleteUser('${u.id}','${escapeHtml(u.nama)}')">🗑</button>
          ${aksiBinaan}
        </td>
      </tr>`;
    }).join('');

    content.innerHTML = `
      <h1 class="tf-title">Pengguna</h1>
      <div class="tf-panel">
        <div class="tf-panel-head">Daftar Pengguna
          <button class="tf-add-btn" onclick="TF.openUserModal()">+ Tambah Pengguna</button>
        </div>
        <div class="tf-panel-body tf-table-wrap" id="tf-table-users">
          ${buildTableHtml('users')}
        </div>
      </div>
    `;
  }

  function openEditUserModal(id) {
    const u = (state.cache.users || []).find(x => String(x.id) === String(id));
    if (!u) return;
    const kelasOptions = (state.cache.kelas || []).map(k =>
      `<option value="${k.id}" ${String(k.id)===String(u.kelas_id)?'selected':''}>${escapeHtml(k.nama_kelas)}</option>`).join('');
    openModal(`
      <h3>Edit Pengguna</h3>
      <div class="tf-field"><label>Nama</label><input id="m-u-nama" type="text" value="${escapeHtml(u.nama||'')}"></div>
      <div class="tf-grid2">
        <div class="tf-field"><label>Username</label><input id="m-u-username" type="text" value="${escapeHtml(u.username||'')}"></div>
        <div class="tf-field"><label>Role</label>
          <select id="m-u-role">
            <option value="penyimak" ${u.role==='penyimak'?'selected':''}>Penyimak</option>
            <option value="santri" ${u.role==='santri'?'selected':''}>Santri</option>
            <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
            <option value="tamu" ${u.role==='tamu'?'selected':''}>Tamu (hanya lihat)</option>
          </select>
        </div>
      </div>
      <div class="tf-field"><label>Kelas (opsional)</label>
        <select id="m-u-kelas"><option value="">-- tidak ada --</option>${kelasOptions}</select>
      </div>
      <div class="tf-field"><label>Status</label>
        <select id="m-u-status">
          <option value="aktif" ${u.status==='aktif'?'selected':''}>Aktif</option>
          <option value="nonaktif" ${u.status==='nonaktif'?'selected':''}>Nonaktif</option>
        </select>
      </div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitEditUser('${u.id}')">Simpan</button>
      </div>
    `);
  }

  async function submitEditUser(id) {
    const payload = { id, nama: val('m-u-nama'), username: val('m-u-username'),
      role: val('m-u-role'), kelas_id: val('m-u-kelas'), status: val('m-u-status') };
    const res = await call('updateUser', payload);
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('users'); closeModal(); await render();
  }

  function openChangePasswordModal(id, nama) {
    openModal(`
      <h3>Ganti Password</h3>
      <p style="color:#666;font-size:13px;margin-bottom:12px;">Pengguna: <b>${escapeHtml(nama)}</b></p>
      <div class="tf-field"><label>Password Baru</label>
        <input id="m-new-password" type="text" placeholder="Ketik password baru">
      </div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitChangePassword('${id}')">Simpan</button>
      </div>
    `);
  }

  async function submitChangePassword(id) {
    const pwd = val('m-new-password');
    if (!pwd || pwd.length < 4) { alert('Password minimal 4 karakter'); return; }
    const res = await call('changePassword', { id, password: pwd });
    if (!res.ok) { alert(res.error); return; }
    closeModal();
    alert('Password berhasil diubah.');
    // Tidak perlu re-render — perubahan password tidak mempengaruhi tampilan tabel
  }

  async function deleteUser(id, nama) {
    if (!confirm(`Hapus pengguna "${nama}"?`)) return;
    const res = await call('deleteUser', { id });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('users'); await render();
  }

  function openUserModal() {
    const kelasOptions = (state.cache.kelas || []).map(k => `<option value="${k.id}">${escapeHtml(k.nama_kelas)}</option>`).join('');
    openModal(`
      <h3>Tambah Pengguna</h3>
      <div class="tf-field"><label>Nama</label><input id="m-u-nama" type="text"></div>
      <div class="tf-grid2">
        <div class="tf-field"><label>Username</label><input id="m-u-username" type="text"></div>
        <div class="tf-field"><label>Password</label><input id="m-u-password" type="text" placeholder="default: 123456"></div>
      </div>
      <div class="tf-grid2">
        <div class="tf-field"><label>Role</label>
          <select id="m-u-role"><option value="penyimak">Penyimak</option><option value="santri">Santri</option><option value="admin">Admin</option><option value="tamu">Tamu (hanya lihat)</option></select>
        </div>
        <div class="tf-field"><label>Kelas (khusus role Penyimak/Santri)</label>
          <select id="m-u-kelas"><option value="">-- tidak ada --</option>${kelasOptions}</select>
        </div>
      </div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitUser()">Simpan</button>
      </div>
    `);
  }

  async function submitUser() {
    const payload = { nama: val('m-u-nama'), username: val('m-u-username'), password: val('m-u-password'), role: val('m-u-role'), kelas_id: val('m-u-kelas') };
    const res = await call('addUser', payload);
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('users'); closeModal(); await render();
  }

  // ---------- BINAAN PENYIMAK (siswa lintas kelas & level) ----------
  async function openBinaanModal(penyimakId) {
    const penyimak = (state.cache.users || []).find(u => String(u.id) === String(penyimakId));
    const [binaanRes, kelasRes] = await Promise.all([
      call('getPenyimakSantri', { penyimak_id: penyimakId }),
      Promise.resolve({ ok: true, data: state.cache.kelas || [] })
    ]);
    const binaanIds = binaanRes.ok ? binaanRes.data.map(String) : [];
    const kelasMapNama = {};
    (kelasRes.data || []).forEach(k => { kelasMapNama[k.id] = k.nama_kelas; });

    const santriList = state.cache.santri || [];
    const rowsHtml = santriList.map(s => {
      const checked = binaanIds.indexOf(String(s.id)) !== -1 ? 'checked' : '';
      const kelasNama = kelasMapNama[s.kelas_id] || '(belum ada kelas)';
      return `
        <label style="display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid #eef2ef;">
          <input type="checkbox" class="tf-binaan-toggle" value="${s.id}" ${checked}>
          <span style="flex:1;">${escapeHtml(s.nama)}</span>
          <span style="color:#6b7d72;font-size:0.85em;">${escapeHtml(kelasNama)} · ${escapeHtml(s.level_ummi || '-')}</span>
        </label>`;
    }).join('');

    openModal(`
      <h3>Siswa Binaan — ${escapeHtml(penyimak ? penyimak.nama : '')}</h3>
      <div class="tf-empty" style="margin-bottom:10px;">Pilih siswa yang diampu penyimak ini. Boleh lintas kelas & lintas level.</div>
      <input id="m-binaan-search" type="text" placeholder="Cari nama siswa..." style="width:100%;margin-bottom:8px;padding:8px;border:1px solid #d7ded8;border-radius:8px;" oninput="TF.filterBinaanList(this.value)">
      <div id="m-binaan-list" style="max-height:320px;overflow-y:auto;border:1px solid #e3e9e4;border-radius:8px;padding:4px 8px;">
        ${santriList.length ? rowsHtml : '<div class="tf-empty">Belum ada data siswa.</div>'}
      </div>
      <div class="tf-modal-actions">
        <button class="tf-btn tf-btn-secondary" onclick="TF.closeModal()">Batal</button>
        <button class="tf-btn" onclick="TF.submitBinaan('${penyimakId}')">Simpan</button>
      </div>
    `);
  }

  function filterBinaanList(query) {
    const q = query.trim().toLowerCase();
    document.querySelectorAll('#m-binaan-list label').forEach(label => {
      label.style.display = label.textContent.toLowerCase().includes(q) ? 'flex' : 'none';
    });
  }

  async function submitBinaan(penyimakId) {
    const santriIds = Array.from(document.querySelectorAll('.tf-binaan-toggle:checked')).map(c => c.value);
    const res = await call('setPenyimakSantri', { penyimak_id: penyimakId, santri_ids: santriIds });
    if (!res.ok) { alert(res.error); return; }
    invalidateCache('users','setoran'); delete state.cache.santriSetoran; closeModal(); await render();
  }

  // ---------- utilities ----------
  function val(id) { return document.getElementById(id).value; }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  // Datetime-local butuh string lokal "YYYY-MM-DDTHH:MM" (bukan UTC) supaya jam yang tampil sesuai jam saat ini.
  function nowDateTimeStr() {
    const d = new Date();
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  }
  // Menampilkan tanggal+waktu setoran dengan format yang mudah dibaca, mis. "21 Jun 2026, 14:35".
  function formatTanggalWaktu(value) {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return escapeHtml(String(value));
    const tgl = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const hasWaktu = /\d{2}:\d{2}/.test(String(value));
    if (!hasWaktu) return tgl;
    const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    return `${tgl}, ${jam}`;
  }
  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  // ============================================================
  // SORTING UNIVERSAL - dipakai di semua halaman tabel
  // state.sort = { key, dir } per view
  // ============================================================
  if (!state.sort) state.sort = {};

  function getSortState(view) {
    return state.sort[view] || { key: null, dir: 'asc' };
  }

  function sortData(data, key, dir) {
    if (!key) return data;
    return data.slice().sort((a, b) => {
      let va = a[key], vb = b[key];
      // Angka
      if (!isNaN(parseFloat(va)) && !isNaN(parseFloat(vb))) {
        va = parseFloat(va) || 0; vb = parseFloat(vb) || 0;
      } else {
        va = String(va || '').toLowerCase(); vb = String(vb || '').toLowerCase();
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function sortIcon(view, key) {
    const s = getSortState(view);
    if (s.key !== key) return '<span class="tf-sort-icon">⇅</span>';
    return s.dir === 'asc'
      ? '<span class="tf-sort-icon tf-sort-active">↑</span>'
      : '<span class="tf-sort-icon tf-sort-active">↓</span>';
  }

  function thSort(view, key, label) {
    return `<th class="tf-th-sort" onclick="TF.clickSort('${view}','${key}')">${label} ${sortIcon(view, key)}</th>`;
  }

  function clickSort(view, key) {
    const s = getSortState(view);
    state.sort[view] = { key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' };
    rerenderTable(view);
  }

  function rerenderTable(view) {
    const el = document.getElementById('tf-table-' + view);
    if (!el) return;
    el.innerHTML = buildTableHtml(view);
  }

  function buildTableHtml(view) {
    const s = getSortState(view);
    if (view === 'santri') {
      const canWrite = state.user.role === 'admin' || state.user.role === 'penyimak';
      const data = sortData(state.cache.santriList || [], s.key, s.dir);
      if (!data.length) return '<div class="tf-empty">Belum ada data siswa.</div>';
      return `<table class="tf-table"><thead><tr>
        <th>#</th>
        ${thSort('santri','nama','Nama')}
        ${thSort('santri','nis','NIS')}
        ${thSort('santri','kelas_nama','Kelas')}
        ${thSort('santri','level_ummi','Level Ummi')}
        ${thSort('santri','jenis_kelamin','Jenis Kelamin')}
        ${thSort('santri','guru_pengampu','Guru Pengampu')}
        ${canWrite ? '<th>Aksi</th>' : ''}</tr></thead><tbody>
        ${data.map((s, i) => `<tr>
          <td style="text-align:center;color:#9ca3af;font-size:12px;">${i+1}</td>
          <td>${escapeHtml(s.nama)}</td>
          <td>${escapeHtml(s.nis||'-')}</td>
          <td>${escapeHtml(s.kelas_nama)}</td>
          <td>${escapeHtml(s.level_ummi||'-')}</td>
          <td>${escapeHtml(s.jenis_kelamin||'-')}</td>
          <td>${escapeHtml(s.guru_pengampu||'-')}</td>
          ${canWrite ? `<td style="white-space:nowrap;">
            <button class="tf-btn-icon" title="Edit" onclick="TF.openEditSantriModal('${s.id}')">✏️</button>
            <button class="tf-btn-icon tf-btn-icon-del" title="Hapus" onclick="TF.deleteSantri('${s.id}','${escapeHtml(s.nama)}')">🗑</button>
          </td>` : ''}</tr>`).join('')}
      </tbody></table>`;
    }
    if (view === 'kelas') {
      const data = sortData(state.cache.kelasList || [], s.key, s.dir);
      if (!data.length) return '<div class="tf-empty">Belum ada data kelas.</div>';
      return `<table class="tf-table"><thead><tr>
        <th>#</th>
        ${thSort('kelas','nama_kelas','Nama Kelas')}
        ${thSort('kelas','penyimak_nama','Penyimak/Guru')}
        <th>Aksi</th></tr></thead><tbody>
        ${data.map((k, i) => `<tr>
          <td style="text-align:center;color:#9ca3af;font-size:12px;">${i+1}</td>
          <td>${escapeHtml(k.nama_kelas)}</td>
          <td>${escapeHtml(k.penyimak_nama)}</td>
          <td style="white-space:nowrap;">
            <button class="tf-btn-icon" title="Edit" onclick="TF.openEditKelasModal('${k.id}')">✏️</button>
            <button class="tf-btn-icon tf-btn-icon-del" title="Hapus" onclick="TF.deleteKelas('${k.id}','${escapeHtml(k.nama_kelas)}')">🗑</button>
          </td></tr>`).join('')}
      </tbody></table>`;
    }
    if (view === 'users') {
      const data = sortData(state.cache.users || [], s.key, s.dir);
      if (!data.length) return '<div class="tf-empty">Belum ada pengguna.</div>';
      return `<table class="tf-table"><thead><tr>
        <th>#</th>
        ${thSort('users','username','Username')}
        ${thSort('users','nama','Nama')}
        ${thSort('users','role','Role')}
        <th>Aksi</th></tr></thead><tbody>
        ${data.map((u, idx) => `<tr>
          <td style="text-align:center;color:#9ca3af;font-size:12px;">${idx+1}</td>
          <td>${escapeHtml(u.username)}</td>
          <td>${escapeHtml(u.nama)}</td>
          <td><span class="tf-role-badge tf-role-${u.role}">${escapeHtml(u.role)}</span></td>
          <td style="white-space:nowrap;">
            <button class="tf-btn-icon" title="Edit" onclick="TF.openEditUserModal('${u.id}')">✏️</button>
            <button class="tf-btn-icon" title="Ganti Password" onclick="TF.openChangePasswordModal('${u.id}','${escapeHtml(u.nama)}')">🔑</button>
            <button class="tf-btn-icon tf-btn-icon-del" title="Hapus" onclick="TF.deleteUser('${u.id}','${escapeHtml(u.nama)}')">🗑</button>
            ${u.role === 'penyimak' ? `<button class="tf-btn-sm" onclick="TF.openBinaanModal('${u.id}')">👥 Siswa Binaan</button>` : ''}
          </td></tr>`).join('')}
      </tbody></table>`;
    }
    if (view === 'setoran') {
      const data = sortData(state.cache.setoranList || [], s.key, s.dir);
      if (!data.length) return '<div class="tf-empty">Belum ada setoran.</div>';
      return `<table class="tf-table"><thead><tr>
        <th>#</th>
        ${thSort('setoran','tanggal','Tanggal')}
        ${thSort('setoran','santri_nama','Nama Siswa')}
        ${thSort('setoran','kelas_nama','Kelas')}
        ${thSort('setoran','level_ummi','Level Ummi')}
        ${thSort('setoran','jenis','Jenis')}
        ${thSort('setoran','nilai','Nilai')}
        ${thSort('setoran','predikat','Predikat')}
        <th>Aksi</th></tr></thead><tbody>
        ${data.map((r, i) => `<tr>
          <td style="text-align:center;color:#9ca3af;font-size:12px;">${i+1}</td>
          <td>${escapeHtml(r.tanggal_fmt||r.tanggal||'-')}</td>
          <td>${escapeHtml(r.santri_nama||'-')}</td>
          <td>${escapeHtml(r.kelas_nama||'-')}</td>
          <td>${escapeHtml(r.level_ummi||'-')}</td>
          <td><span class="tf-badge ${r.jenis==='Murojaah'?'b-murajaah':r.jenis==='Tilawah'?'b-tilawah':r.jenis==='Setoran Metode Ummi'?'b-ummi':'b-hafalan'}">${escapeHtml(r.jenis||'-')}</span></td>
          <td style="text-align:center;">${escapeHtml(String(r.nilai||'-'))}</td>
          <td>${escapeHtml(r.predikat||'-')}</td>
          <td style="white-space:nowrap;">
            <button class="tf-btn-icon" onclick="TF.openEditSetoranModal('${r.id}')">✏️</button>
            <button class="tf-btn-icon tf-btn-icon-del" onclick="TF.deleteSetoran('${r.id}')">🗑</button>
          </td></tr>`).join('')}
      </tbody></table>`;
    }
    if (view === 'rekap') {
      const data = sortData(state.cache.rekap || [], s.key, s.dir);
      if (!data.length) return '<div class="tf-empty">Tidak ada data rekap.</div>';
      return `<table class="tf-table"><thead><tr>
        <th>#</th>
        ${thSort('rekap','nama','Nama')}
        ${thSort('rekap','kelas_nama','Kelas')}
        ${thSort('rekap','level_ummi','Level Ummi')}
        ${thSort('rekap','guru_pengampu','Guru Pengampu')}
        ${thSort('rekap','total_setoran','Total Setoran')}
        ${thSort('rekap','rata_nilai','Rata-rata Nilai')}
        ${thSort('rekap','predikat','Predikat')}
        <th>Aksi</th></tr></thead><tbody>
        ${data.map((r, i) => `<tr>
          <td style="text-align:center;">${i+1}</td>
          <td>${escapeHtml(r.nama)}</td>
          <td>${escapeHtml(r.kelas_nama||'-')}</td>
          <td>${escapeHtml(r.level_ummi||'-')}</td>
          <td>${escapeHtml(r.guru_pengampu||'-')}</td>
          <td style="text-align:center;font-weight:700;">${r.total_setoran}</td>
          <td style="text-align:center;">${r.rata_nilai}</td>
          <td>${escapeHtml(r.predikat||'-')}</td>
          <td><button class="tf-btn-sm" onclick="TF.cetakRapor('${r.santri_id}')">🖨 Rapor</button></td>
        </tr>`).join('')}
      </tbody></table>`;
    }
    return '';
  }

  function initSortState() {
    // Reset sort state per view saat halaman pertama kali dirender
  }

  function listToTable(rows, cols) {
    const hasNo = cols.length > 0 && cols[0][0] === 'no';
    let html = '<table class="tf-table"><thead><tr>';
    cols.forEach(c => {
      if (c[0] === 'no') html += `<th>#</th>`;
      else html += `<th>${c[1]}</th>`;
    });
    html += '</tr></thead><tbody>';
    rows.forEach((r, idx) => {
      html += '<tr>';
      cols.forEach(c => {
        if (c[0] === 'no') {
          html += `<td style="text-align:center;color:#9ca3af;font-size:12px;">${idx+1}</td>`;
        } else if (c[0] === 'jenis' && r[c[0]]) {
          const cls = r[c[0]] === 'Murojaah' ? 'b-murajaah' : (r[c[0]] === 'Tilawah' ? 'b-tilawah' : (r[c[0]] === 'Setoran Metode Ummi' ? 'b-ummi' : 'b-hafalan'));
          html += `<td><span class="tf-badge ${cls}">${escapeHtml(r[c[0]])}</span></td>`;
        } else if (c[0] === 'tanggal') {
          html += `<td>${formatTanggalWaktu(r[c[0]])}</td>`;
        } else html += `<td>${escapeHtml(r[c[0]])}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  }
  function openModal(innerHtml) {
    closeModal();
    const bg = document.createElement('div');
    bg.className = 'tf-modal-bg'; bg.id = 'tf-modal-bg';
    bg.innerHTML = `<div class="tf-modal">${innerHtml}</div>`;
    document.body.appendChild(bg);
  }
  function closeModal() { const el = document.getElementById('tf-modal-bg'); if (el) el.remove(); }

  function init() {
    loadSession(); render();
    const yearEl = document.getElementById('tf-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    // Enter di field username → pindah fokus ke password
    document.getElementById('tf-login-username').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('tf-login-password').focus();
    });
    // Enter di field password → langsung login
    document.getElementById('tf-login-password').addEventListener('keydown', e => {
      if (e.key === 'Enter') TF.login();
    });
  }

  return {
    login, logout, setView, render, init, toggleSidebar, closeSidebar,
    loadPresensiSiswa, renderPresensiSiswaTable, setAllPresensi, submitPresensi,
    loadRiwayatPresensi, togglePresensiGroup, hapusPresensi, loadRekapPresensi,
    openEditSantriModal, submitEditSantri, deleteSantri,
    openEditKelasModal, submitEditKelas, deleteKelas,
    openEditUserModal, submitEditUser, deleteUser,
    openChangePasswordModal, submitChangePassword,
    clickSort,
    openSetoranModal, submitSetoran, renderSetoranFields, renderJenisBlocks, onSurahChange,
    openEditSetoranModal, submitEditSetoran, deleteSetoran,
    onUmmiGradeChange, toggleUmmiBlock,
    openSantriModal, submitSantri, downloadTemplateSiswa, uploadSiswa,
    openKelasModal, submitKelas,
    toggleStatFilter, loadStatistik, renderPeringkat, loadProgress,
    loadRekap, cetakRapor, exportRekapExcel, toggleRekapMode,
    mushafPrev, mushafNext, mushafGoto, mushafGotoSurah,
    openUserModal, submitUser, openBinaanModal, filterBinaanList, submitBinaan,
    closeModal
  };
})();

TF.init();
