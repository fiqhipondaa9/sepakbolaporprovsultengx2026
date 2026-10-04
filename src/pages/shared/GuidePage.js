/**
 * Comprehensive User Guide Page (Buku Panduan Aplikasi)
 * PRD: §7.1 User Guide & Operating Manual for PORPROV X Sulteng 2026 Sepak Bola
 */
import { wrapPublicLayout, wrapAdminLayout } from '../../utils/layoutHelper.js';
import { createBreadcrumb } from '../../components/Breadcrumb.js';
import { exportElementToPrint } from '../../utils/exportImage.js';

export function GuidePage() {
  const crumbs = [
    { label: 'Dashboard', href: '#/admin' },
    { label: 'Panduan Penggunaan', href: null }
  ];

  const content = `
    ${createBreadcrumb(crumbs)}

    <!-- Page Header -->
    <div class="flex items-center justify-between mb-6" style="flex-wrap: wrap; gap: 1rem;">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h1 style="font-size: 1.85rem; margin: 0;">Buku Panduan Aplikasi</h1>
          <span class="badge badge-teal font-bold">Manual Operasional Resmi Panitia</span>
        </div>
        <p class="text-sm text-muted">Petunjuk teknis dan alur operasional Sistem Informasi Sepak Bola PORPROV Sulawesi Tengah X 2026 untuk Panitia Pelaksana.</p>
      </div>

      <div class="flex items-center gap-2" style="flex-wrap: wrap;">
        <button type="button" id="btn-print-guide" class="btn btn-outline btn-sm">
          <span>🖨️ Cetak Panduan (PDF)</span>
        </button>
        <a href="#/admin" class="btn btn-primary btn-sm">&larr; Kembali ke Dashboard</a>
      </div>
    </div>

    <!-- Guide Navigation Tabs -->
    <div class="card mb-6" style="padding: 0.5rem 0.75rem;">
      <div class="flex items-center gap-2" style="flex-wrap: wrap;" id="guide-tabs-container">
        <button type="button" class="btn btn-primary btn-sm guide-tab-btn" data-target="tab-workflow">
          ⚡ Alur Panitia Pelaksana (A-Z)
        </button>
        <button type="button" class="btn btn-ghost btn-sm guide-tab-btn" data-target="tab-regulations">
          ⚖️ Regulasi & Format Turnamen
        </button>
        <button type="button" class="btn btn-ghost btn-sm guide-tab-btn" data-target="tab-public">
          🌐 Panduan Portal Publik
        </button>
        <button type="button" class="btn btn-ghost btn-sm guide-tab-btn" data-target="tab-faq">
          ❓ Tanya Jawab & Troubleshooting
        </button>
      </div>
    </div>

    <!-- Printable Content Container -->
    <div id="guide-printable-content">

      <!-- TAB 1: ALUR PANITIA PELAKSANA (A-Z) -->
      <div id="tab-workflow" class="guide-tab-pane">
        
        <!-- Workflow Overview Card -->
        <div class="card mb-6" style="padding: 1.5rem; border-left: 4px solid var(--color-accent); background: rgba(245, 166, 35, 0.03);">
          <h2 style="font-size: 1.35rem; color: var(--color-accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚡</span>
            Tahapan Operasional Turnamen oleh Panitia Pelaksana
          </h2>
          <p class="text-sm text-muted" style="line-height: 1.6; margin: 0;">
            Aplikasi ini dirancang sesuai urutan alur kerja nyata turnamen sepak bola resmi PSSI/KONI. Ikuti 7 langkah terstruktur di bawah ini mulai dari masa persiapan hingga penutupan turnamen:
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Step 1 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(245, 166, 35, 0.15); color: var(--color-accent); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">1</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Pendaftaran & Verifikasi Tim Kontingen</h3>
                  <span class="text-xs text-muted">Menu: <strong>Panel Admin &rarr; Kelola Tim & Pemain (<code>#/admin/tim</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-gold">Tahap Pra-Turnamen</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li>Sistem telah memuat <strong>13 Tim Kontingen Resmi Kabupaten/Kota se-Sulawesi Tengah</strong> (Kota Palu, Banggai, Tolitoli, Poso, Donggala, Buol, Sigi, Parigi Moutong, Tojo Una-Una, Banggai Kepulauan, Morowali, Banggai Laut, Morowali Utara).</li>
                <li>Tetapkan <strong>4 Tim Unggulan (Seeded)</strong> berdasarkan prestasi PORPROV sebelumnya atau tuan rumah. Tim seeded ini akan otomatis dilindungi agar tidak bertemu dalam satu grup saat pengundian.</li>
                <li>Lakukan verifikasi berkas pemain (nomor punggung, posisi, tanggal lahir, foto) dan official tim.</li>
              </ul>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 191, 166, 0.15); color: var(--color-secondary-light); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">2</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Pengundian Grup Resmi (Drawing Room)</h3>
                  <span class="text-xs text-muted">Menu: <strong>Panel Admin &rarr; Pengundian & Seeded (<code>#/admin/pengundian</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-teal">Tahap Technical Meeting</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li>Buka menu <strong>Pengundian & Seeded</strong> saat sesi *Technical Meeting* bersama manajer tim.</li>
                <li>Klik tombol <strong>"Mulai Pengundian Otomatis"</strong>. Animasi bola undian acak akan berputar dan mendistribusikan tim ke 4 Grup (A, B, C, D) dengan algoritma proteksi tim seeded yang ketat.</li>
                <li>Setelah undian selesai dan disetujui semua perwakilan tim, klik tombol <strong>"Kunci Hasil Undian & Buat Berita Acara"</strong>. Hasil pengundian akan tersimpan permanen ke database dan Berita Acara siap dicetak.</li>
              </ul>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(59, 130, 246, 0.15); color: #60A5FA; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">3</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Penyusunan Jadwal & Manajemen Venue</h3>
                  <span class="text-xs text-muted">Menu: <strong>Panel Admin &rarr; Penyusunan Jadwal (<code>#/admin/jadwal</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-teal">Algoritma Otomatis Fair Play</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li>Atur <strong>Parameter Penjadwalan Fleksibel</strong>: Tanggal Mulai turnamen, Slot Jam Pertandingan (standar 14:00, 16:00, atau 19:30 WITA), <strong>Jeda Istirahat Antarlaga Kontingen</strong> (minimal 1 atau 2 hari kalender), serta <strong>Jeda Istirahat Fase Grup &rarr; 8 Besar</strong>.</li>
                <li>Klik tombol <strong>"⚡ Generate Jadwal Otomatis"</strong>. Sistem akan menyusun seluruh pertandingan penyisihan dengan deteksi anti-konflik venue dan waktu istirahat yang merata sesuai parameter.</li>
                <li>Gunakan fitur <strong>"Tukar Slot"</strong> atau <strong>"Edit Jadwal / Venue"</strong> bila ada penyesuaian khusus (cuaca, kondisi lapangan, atau arahan Pengawas Pertandingan).</li>
                <li>Klik tombol <strong>"🖨️ Cetak Jadwal (JD-07)"</strong> untuk mengunduh lembar jadwal pertandingan resmi berformat PDF.</li>
              </ul>
            </div>
          </div>

          <!-- Step 4 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(34, 197, 94, 0.15); color: var(--color-success); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">4</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Pelaksanaan Laga, Skor, Gol & Sanksi Kartu</h3>
                  <span class="text-xs text-muted">Menu: <strong>Panel Admin &rarr; Input Hasil & Kartu (<code>#/admin/hasil</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-teal">Operasional Match Day</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li>Pilih pertandingan yang sedang atau telah selesai berlangsung, lalu ubah status laga menjadi <strong>LIVE</strong> atau <strong>FINISHED (Selesai)</strong>.</li>
                <li>Input skor akhir serta peristiwa pertandingan yang <strong>langsung terhubung dengan database nama & nomor punggung pemain resmi terdaftar</strong>:
                  <ul style="padding-left: 1.25rem; margin: 0.25rem 0;">
                    <li><strong>Pencetak Gol (HS-04):</strong> Pilih pemain, menit gol, dan tipe gol (normal, penalti, bunuh diri).</li>
                    <li><strong>Sanksi Kartu (HS-05):</strong> Pilih pemain, menit sanksi, dan jenis kartu (kuning, kuning kedua, merah langsung).</li>
                    <li><strong>Pergantian Pemain (HS-06):</strong> Catat pemain keluar, pemain masuk, dan menit pergantian.</li>
                  </ul>
                </li>
                <li>Gunakan tombol <strong>"📋 Rincian / Detail Laga"</strong> untuk meninjau lembar rangkuman pertandingan resmi.</li>
                <li>Klik <strong>"Simpan & Perbarui Klasemen"</strong>. Klasemen babak penyisihan grup otomatis dihitung ulang secara real-time.</li>
              </ul>
            </div>
          </div>

          <!-- Step 5 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.15); color: var(--color-danger); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">5</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Pelacakan Akumulasi Kartu & Skorsing Pemain</h3>
                  <span class="text-xs text-muted">Menu: <strong>Panel Admin &rarr; Akumulasi Kartu (<code>#/admin/kartu</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-teal">Regulasi Disiplin PSSI</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li>Sistem secara otomatis menghitung akumulasi kartu setiap pemain (aturan baku: <strong>2 kartu kuning = skorsing 1 pertandingan berikutnya</strong>).</li>
                <li>Halaman ini menampilkan daftar pemain yang sedang dilarang bermain (*suspended*) sehingga Match Commissioner dan Pengawas Pertandingan dapat mencegah pemain tidak sah masuk ke Daftar Susunan Pemain (DSP).</li>
                <li>Aturan <strong>Pemutihan Kartu</strong> otomatis berlaku saat tim lolos ke babak semifinal (kartu kuning tunggal diputihkan).</li>
              </ul>
            </div>
          </div>

          <!-- Step 6 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(168, 85, 247, 0.15); color: #C084FC; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">6</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Bagan Eliminasi (8 Besar, Semifinal & Final)</h3>
                  <span class="text-xs text-muted">Menu: <strong>Panel Admin &rarr; Bagan Eliminasi (<code>#/admin/bracket</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-teal">Fase Knockout</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li>Setelah fase penyisihan tuntas, klik <strong>"⚡ Generate Bagan Eliminasi Otomatis (JD-08)"</strong>. Sistem memetakan Juara Grup (1A, 1B, 1C, 1D) dan Runner-up (2A, 2B, 2C, 2D) dengan penegakan <strong>Opposite Half Rule (JD-16/17)</strong> sehingga tim dari grup yang sama tidak akan bertemu sebelum Babak Final.</li>
                <li>Input hasil pertandingan eliminasi dilengkapi <strong>4 Menu Lengkap</strong>:
                  <ul style="padding-left: 1.25rem; margin: 0.25rem 0;">
                    <li><strong>⚡ Skor & Waktu:</strong> Skor normal time (HS-01), perpanjangan waktu AET 2x15 menit (HS-02), dan adu penalti (HS-03).</li>
                    <li><strong>⚽ Pencetak Gol (HS-04):</strong> Terhubung langsung dengan daftar pemain masing-masing kontingen.</li>
                    <li><strong>🟨 Sanksi Kartu (HS-05):</strong> Terhubung langsung dengan daftar pemain untuk kalkulasi disiplin.</li>
                    <li><strong>🔄 Pergantian Pemain (HS-06):</strong> Pergantian taktis pemain inti dan cadangan.</li>
                  </ul>
                </li>
                <li>Tim pemenang otomatis melaju ke babak Semifinal dan Grand Final, sementara tim yang kalah di Semifinal otomatis ditempatkan ke Perebutan Juara 3.</li>
                <li>Gunakan tombol <strong>"🖨️ Cetak Jadwal Bagan"</strong> di sudut kanan atas untuk mencetak lembar jadwal dan bagan resmi A4 landscape lengkap dengan kolom legalitas tanda tangan Panpel & TD PSSI.</li>
              </ul>
            </div>
          </div>

          <!-- Step 7 -->
          <div class="card" style="padding: 1.25rem;">
            <div class="flex items-center justify-between mb-3" style="flex-wrap: wrap; gap: 0.5rem;">
              <div class="flex items-center gap-3">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: rgba(234, 179, 8, 0.15); color: #EAB308; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">7</div>
                <div>
                  <h3 style="font-size: 1.15rem; margin: 0;">Backup Data, Pengawasan & Audit Log</h3>
                  <span class="text-xs text-muted">Menu: <strong>Export & Backup (<code>#/admin/export-import</code>) & Audit Log (<code>#/admin/audit-log</code>)</strong></span>
                </div>
              </div>
              <span class="badge badge-teal">Integritas Data</span>
            </div>
            <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
              <ul style="padding-left: 1.25rem; margin: 0;">
                <li><strong>Backup Data:</strong> Unduh file cadangan format JSON setiap hari setelah pertandingan usai sebagai arsip aman data turnamen.</li>
                <li><strong>Audit Log Aktivitas:</strong> Pantau seluruh riwayat aktivitas yang dilakukan oleh operator panitia (kapan login, siapa yang menginput skor, atau mengubah jadwal).</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

      <!-- TAB 2: REGULASI & FORMAT TURNAMEN -->
      <div id="tab-regulations" class="guide-tab-pane" style="display: none;">
        
        <div class="card mb-6" style="padding: 1.5rem;">
          <h2 style="font-size: 1.35rem; color: var(--color-accent); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚖️</span>
            Format Kompetisi & Regulasi Teknis Pertandingan
          </h2>
          <p class="text-sm text-muted mb-4" style="line-height: 1.6;">
            Pedoman teknis cabang olahraga sepak bola Pekan Olahraga Provinsi (PORPROV) Sulawesi Tengah ke-X Tahun 2026 mengacu pada Regulasi PSSI dan Laws of the Game IFAB/FIFA:
          </p>

          <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
            
            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <h4 style="color: var(--color-secondary-light); margin-bottom: 0.5rem;">1. Format Pembagian Grup</h4>
              <ul class="text-sm text-muted" style="padding-left: 1.25rem; line-height: 1.6; margin: 0;">
                <li>Total Peserta: <strong>13 Tim Kabupaten/Kota</strong>.</li>
                <li>Dibagi menjadi <strong>4 Grup (A, B, C, D)</strong>.</li>
                <li>Grup A: 3 Tim &bull; Grup B: 3 Tim &bull; Grup C: 3 Tim &bull; Grup D: 4 Tim.</li>
                <li>Sistem Kompetisi Penyisihan: <strong>Setengah Kompetisi (Single Round Robin)</strong>.</li>
                <li>Tim yang lolos ke Babak 8 Besar: <strong>Juara Grup dan Runner-Up Grup</strong> dari masing-masing grup (total 8 tim).</li>
              </ul>
            </div>

            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <h4 style="color: var(--color-secondary-light); margin-bottom: 0.5rem;">2. Durasi & Pergantian Pemain</h4>
              <ul class="text-sm text-muted" style="padding-left: 1.25rem; line-height: 1.6; margin: 0;">
                <li>Durasi Pertandingan: <strong>2 x 45 Menit</strong> dengan jeda istirahat babak pertama 15 menit.</li>
                <li>Pergantian Pemain: Maksimal <strong>5 pergantian pemain</strong> dalam maksimal <strong>3 kesempatan waktu (slots)</strong> selama pertandingan berlangsung (tidak termasuk pergantian saat jeda babak pertama).</li>
                <li>Daftar Susunan Pemain (DSP): Terdiri dari 11 pemain inti (*starter*) dan maksimal 12 pemain cadangan.</li>
              </ul>
            </div>

            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); grid-column: 1 / -1;">
              <h4 style="color: var(--color-accent); margin-bottom: 0.75rem;">3. Aturan Penentuan Peringkat Klasemen (Tie-Breaker PSSI Resmi)</h4>
              <p class="text-xs text-muted mb-3">Jika terdapat dua tim atau lebih dalam grup yang sama memiliki perolehan poin yang sama, peringkat ditentukan berdasarkan urutan kriteria baku berikut (dihitung otomatis oleh aplikasi):</p>
              
              <div class="grid grid-cols-1 sm-grid-cols-2 md-grid-cols-3 gap-3">
                <div style="padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(245, 166, 35, 0.08); border: 1px solid rgba(245, 166, 35, 0.2);">
                  <strong class="text-gold" style="font-size: 0.85rem;">1. Poin Tertinggi</strong>
                  <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">Menang = 3 poin, Imbang = 1 poin, Kalah = 0 poin.</p>
                </div>
                <div style="padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(0, 191, 166, 0.08); border: 1px solid rgba(0, 191, 166, 0.2);">
                  <strong class="text-teal" style="font-size: 0.85rem;">2. Selisih Gol (SG)</strong>
                  <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">Selisih gol memasukkan dikurangi gol kemasukan di semua laga grup.</p>
                </div>
                <div style="padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.2);">
                  <strong style="color: #60A5FA; font-size: 0.85rem;">3. Produktivitas Gol (GM)</strong>
                  <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">Jumlah total gol yang dicetak di seluruh laga penyisihan grup.</p>
                </div>
                <div style="padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2);">
                  <strong style="color: #C084FC; font-size: 0.85rem;">4. Head-to-Head (H2H)</strong>
                  <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">Hasil pertandingan langsung antara tim yang bernilai sama.</p>
                </div>
                <div style="padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.2);">
                  <strong class="text-success" style="font-size: 0.85rem;">5. Poin Fair Play Kartu</strong>
                  <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">Kuning = -1, Merah Tidak Langsung = -3, Merah Langsung = -3.</p>
                </div>
                <div style="padding: 0.75rem; border-radius: var(--radius-sm); background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2);">
                  <strong class="text-danger" style="font-size: 0.85rem;">6. Undian Panitia</strong>
                  <p class="text-xs text-muted" style="margin: 0.25rem 0 0 0;">Dilakukan oleh Panitia Pengawas bila seluruh kriteria di atas imbang.</p>
                </div>
              </div>
            </div>

            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); grid-column: 1 / -1;">
              <h4 style="color: var(--color-danger); margin-bottom: 0.5rem;">4. Regulasi Kartu & Skorsing Pemain</h4>
              <ul class="text-sm text-muted" style="padding-left: 1.25rem; line-height: 1.6; margin: 0;">
                <li>Pemain yang memperoleh <strong>2 Kartu Kuning</strong> dalam pertandingan berbeda secara otomatis diskorsing 1 pertandingan berikutnya.</li>
                <li>Pemain yang memperoleh <strong>Kartu Merah Langsung</strong> diskorsing minimal 1 pertandingan berikutnya (dan sanksi tambahan bila terdapat pelanggaran disiplin berat).</li>
                <li><strong>Pemutihan Kartu Kuning:</strong> Berlaku otomatis saat memasuki Babak Semifinal bagi pemain yang hanya mengantongi 1 kartu kuning di babak sebelumnya (pemain yang terkena hukuman akumulasi tetap menjalani hukumannya).</li>
              </ul>
            </div>

          </div>
        </div>

      </div>

      <!-- TAB 3: PANDUAN PORTAL PUBLIK -->
      <div id="tab-public" class="guide-tab-pane" style="display: none;">
        
        <div class="card mb-6" style="padding: 1.5rem;">
          <h2 style="font-size: 1.35rem; color: var(--color-accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🌐</span>
            Panduan Penggunaan Bagi Masyarakat, Media & Tim Peserta
          </h2>
          <p class="text-sm text-muted mb-4" style="line-height: 1.6;">
            Seluruh data turnamen disajikan secara terbuka, transparan, dan real-time untuk kemudahan masyarakat, kontingen, dan rekan media:
          </p>

          <div class="grid grid-cols-1 sm-grid-cols-2 gap-4">
            
            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.2rem;">📅</span>
                <strong style="color: var(--text-main);">Memantau Jadwal Pertandingan (<code>#/jadwal</code>)</strong>
              </div>
              <p class="text-xs text-muted" style="line-height: 1.5; margin: 0;">
                Menampilkan jadwal seluruh pertandingan. Anda dapat memfilter berdasarkan Babak (Penyisihan/Final), Grup (A/B/C/D), atau Status (Live/Akan Datang/Selesai). Tersedia tombol <strong>Cetak Jadwal (PDF)</strong> untuk mengunduh jadwal resmi.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.2rem;">🏆</span>
                <strong style="color: var(--text-main);">Melihat Klasemen Sementara (<code>#/klasemen</code>)</strong>
              </div>
              <p class="text-xs text-muted" style="line-height: 1.5; margin: 0;">
                Tabel klasemen 4 grup yang diperbarui otomatis setiap kali laga berakhir. Dilengkapi indikator tim yang lolos ke 8 Besar, rincian Main (Mn), Menang (M), Seri (S), Kalah (K), Gol (GM-GK), Selisih Gol (SG), dan Poin. Tersedia tombol <strong>Cetak Dokumen (KL-07)</strong>.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.2rem;">⚡</span>
                <strong style="color: var(--text-main);">Bagan Gugur Interaktif (<code>#/bracket</code>)</strong>
              </div>
              <p class="text-xs text-muted" style="line-height: 1.5; margin: 0;">
                Visualisasi pohon turnamen dari Perempat Final (8 Besar), Semifinal, hingga Grand Final perebutan Medali Emas dan Medali Perunggu secara dinamis. Dilengkapi tombol <strong>🖨️ Cetak Jadwal Bagan</strong> untuk mengunduh dokumen resmi bagan & jadwal A4 landscape.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <div class="flex items-center gap-2 mb-2">
                <span style="font-size: 1.2rem;">👥</span>
                <strong style="color: var(--text-main);">Profil Tim & Top Skor (<code>#/tim</code> & <code>#/statistik</code>)</strong>
              </div>
              <p class="text-xs text-muted" style="line-height: 1.5; margin: 0;">
                Melihat daftar kontingen daerah, warna jersey utama/cadangan, daftar pemain beserta nomor punggung, serta papan peringkat pencetak gol terbanyak (*Top Scorer*).
              </p>
            </div>

          </div>
        </div>

      </div>

      <!-- TAB 4: TANYA JAWAB & TROUBLESHOOTING -->
      <div id="tab-faq" class="guide-tab-pane" style="display: none;">
        
        <div class="card mb-6" style="padding: 1.5rem;">
          <h2 style="font-size: 1.35rem; color: var(--color-accent); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>❓</span>
            Tanya Jawab (FAQ) & Solusi Kendala Teknis
          </h2>
          <p class="text-sm text-muted mb-4" style="line-height: 1.6;">
            Pertanyaan yang sering diajukan seputar operasional aplikasi dan langkah penanganannya:
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            
            <div class="card" style="margin: 0; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <strong class="text-gold" style="font-size: 0.95rem;">Q: Bagaimana cara masuk ke Panel Admin jika saya panitia pelaksana?</strong>
              <p class="text-sm text-muted" style="margin: 0.35rem 0 0 0; line-height: 1.5;">
                Klik tombol kuning <strong>"Panel Panitia"</strong> di pojok kanan atas navbar (atau akses <code>#/admin/login</code>). Masukkan email: <code>admin.sepakbola@porprovsulteng.id</code> dan password: <code>porprov2026</code>. Anda juga dapat mengklik tombol instan *"⚡ Gunakan Kredensial Panitia Resmi"*.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <strong class="text-teal" style="font-size: 0.95rem;">Q: Mengapa hasil undian grup tidak bisa diubah-ubah setelah Technical Meeting?</strong>
              <p class="text-sm text-muted" style="margin: 0.35rem 0 0 0; line-height: 1.5;">
                Sistem menerapkan fitur <em>Lock Draw Result</em> demi integritas dan transparansi. Begitu Berita Acara Drawing disahkan, tombol undi akan dinonaktifkan agar tidak terjadi manipulasi grup. Jika terjadi keadaan darurat, panitia dapat mereset turnamen melalui menu Pengaturan Turnamen.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <strong class="text-gold" style="font-size: 0.95rem;">Q: Bagaimana cara mencetak jadwal, klasemen, atau bagan gugur untuk dibagikan ke kontingen?</strong>
              <p class="text-sm text-muted" style="margin: 0.35rem 0 0 0; line-height: 1.5;">
                Setiap halaman penting (Jadwal Penyisihan, Klasemen Grup, Bagan Eliminasi, Audit Log, dan Buku Panduan ini) memiliki tombol <strong>"🖨️ Cetak Dokumen / Cetak Jadwal Bagan"</strong>. Saat diklik, sistem membuka lembar cetak standar A4 resmi ber-Kop Panpel yang siap dicetak fisik atau disimpan dalam format PDF.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <strong class="text-teal" style="font-size: 0.95rem;">Q: Bagaimana cara menginput pencetak gol dan sanksi kartu pada babak 8 Besar / Eliminasi?</strong>
              <p class="text-sm text-muted" style="margin: 0.35rem 0 0 0; line-height: 1.5;">
                Buka menu <strong>Bagan Eliminasi (<code>#/admin/bracket</code>)</strong>, lalu klik tombol <strong>"✏️ Input Hasil"</strong> pada kartu pertandingan. Jendela input hasil menyajikan 4 tab navigasi (Skor & Waktu, Pencetak Gol, Sanksi Kartu, Pergantian Pemain) yang otomatis terkoneksi ke data nama pemain masing-masing daerah yang telah didaftarkan.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <strong class="text-gold" style="font-size: 0.95rem;">Q: Di mana seluruh tindakan admin terekam?</strong>
              <p class="text-sm text-muted" style="margin: 0.35rem 0 0 0; line-height: 1.5;">
                Seluruh aksi admin (login, perubahan jadwal, input skor, ubah aturan) secara otomatis tercatat dan dapat dipantau di menu <a href="#/admin/audit-log" class="text-teal font-bold" style="text-decoration: underline;">Audit Log Aktivitas</a> lengkap dengan waktu kejadian dan nama operator.
              </p>
            </div>

            <div class="card" style="margin: 0; padding: 1rem 1.25rem; background: rgba(255, 255, 255, 0.02);">
              <strong class="text-danger" style="font-size: 0.95rem;">Q: Bagaimana jika koneksi internet terputus di stadion?</strong>
              <p class="text-sm text-muted" style="margin: 0.35rem 0 0 0; line-height: 1.5;">
                Aplikasi dilengkapi arsitektur <em>Unified Storage Adapter</em>. Bila jaringan internet terputus, data tetap aman tersimpan di browser secara offline (Local-Sync). Begitu jaringan kembali terhubung, data dapat diekspor atau disinkronkan ke cloud.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  `;

  return {
    html: wrapAdminLayout(content, '#/admin/panduan'),
    init: () => {
      // 1. Print Guide Button
      const printBtn = document.getElementById('btn-print-guide');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          exportElementToPrint('guide-printable-content', 'BUKU PANDUAN APLIKASI SEPAK BOLA PORPROV SULTENG X 2026');
        });
      }

      // 2. Tab switching logic
      const tabBtns = document.querySelectorAll('.guide-tab-btn');
      const tabPanes = document.querySelectorAll('.guide-tab-pane');

      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-target');

          // Update active button styling
          tabBtns.forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-ghost');
          });
          btn.classList.remove('btn-ghost');
          btn.classList.add('btn-primary');

          // Show targeted pane
          tabPanes.forEach(pane => {
            pane.style.display = pane.id === target ? 'block' : 'none';
          });
        });
      });
    }
  };
}
