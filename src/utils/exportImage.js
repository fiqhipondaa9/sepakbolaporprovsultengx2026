/**
 * Export Utility for Documents, Standings & Bracket
 * PRD: §4.1 DR-06, §4.3 KL-07 Export Dokumen & Gambar
 */

export function exportElementToPrint(elementId, title = 'PORPROV X SULTENG 2026') {
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Harap izinkan pop-up browser untuk mencetak / mengekspor dokumen.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #ffffff;
            padding: 24px;
            margin: 0;
          }
          .print-header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .print-header h1 {
            margin: 0 0 4px 0;
            font-size: 18pt;
            letter-spacing: -0.01em;
          }
          .print-header p {
            margin: 0;
            font-size: 10pt;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            margin-bottom: 16px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 700;
          }
          .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 8pt;
            font-weight: 600;
            border: 1px solid #94a3b8;
          }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .print-footer {
            margin-top: 30px;
            text-align: right;
            font-size: 8pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .match-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px;
            background: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 10px;
          }
          .match-card-meta {
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            font-weight: 700;
            color: #334155;
            margin-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 4px;
          }
          .match-card-teams {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 0;
          }
          .match-team {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 9pt;
            font-weight: 700;
            color: #0f172a;
            flex: 1;
          }
          .match-team.away {
            flex-direction: row-reverse;
            text-align: right;
          }
          .team-badge-circle {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #e2e8f0;
            color: #0f172a;
            font-size: 7pt;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #94a3b8;
          }
          .match-score-box {
            border: 1px solid #cbd5e1;
            padding: 4px 10px;
            border-radius: 4px;
            font-weight: 800;
            font-size: 11pt;
            min-width: 55px;
            text-align: center;
            background: #f8fafc;
            color: #0f172a;
          }
          .match-card-footer {
            margin-top: 6px;
            font-size: 8pt;
            color: #64748b;
            display: flex;
            justify-content: space-between;
            border-top: 1px solid #f1f5f9;
            padding-top: 4px;
          }
          .btn-view-match-detail, .btn-edit-match-slot, .btn-swap-match {
            display: none !important;
          }
          @media print {
            body { padding: 0; }
            button { display: none !important; }
            .btn-view-match-detail, .btn-edit-match-slot, .btn-swap-match { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>PEKAN OLAHRAGA PROVINSI SULAWESI TENGAH KE-X TAHUN 2026</h1>
          <p>CABANG OLAHRAGA SEPAK BOLA PUTRA &bull; DOKUMEN RESMI PANITIA PELAKSANA</p>
        </div>

        <div>
          ${el.innerHTML}
        </div>

        <div class="print-footer">
          Dicetak otomatis dari Sistem Informasi Turnamen Sepak Bola PORPROV X Sulteng &bull; ${new Date().toLocaleString('id-ID')}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function exportTableToCsv(tableElement, filename = 'data_porprov.csv') {
  if (!tableElement) return;

  const rows = Array.from(tableElement.querySelectorAll('tr'));
  const csvContent = rows.map(row => {
    const cols = Array.from(row.querySelectorAll('th, td'));
    return cols.map(col => {
      let text = col.innerText.replace(/"/g, '""').trim();
      return `"${text}"`;
    }).join(',');
  }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportBracketToPrint(matches = [], title = 'JADWAL & BAGAN BABAK GUGUR PORPROV X SULTENG 2026') {
  if (!matches || matches.length === 0) {
    alert('Bagan pertandingan belum tersedia untuk dicetak.');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Harap izinkan pop-up browser untuk mencetak / mengekspor dokumen.');
    return;
  }

  // Format stage label
  const getStageName = (id) => {
    switch (id) {
      case 'qf1': return 'Perempat Final 1 (8 Besar)';
      case 'qf2': return 'Perempat Final 2 (8 Besar)';
      case 'qf3': return 'Perempat Final 3 (8 Besar)';
      case 'qf4': return 'Perempat Final 4 (8 Besar)';
      case 'sf1': return 'Semifinal 1';
      case 'sf2': return 'Semifinal 2';
      case 'bronze': return 'Perebutan Juara 3 (Medali Perunggu)';
      case 'final': return 'Grand Final (Medali Emas & Perak)';
      default: return id?.toUpperCase() || '-';
    }
  };

  // Table rows
  const tableRows = matches.map((m, idx) => {
    const homeName = m.homeTeam?.name || (m.homeTeam?.slot ? `Pemenang/Slot ${m.homeTeam.slot}` : 'TBD');
    const awayName = m.awayTeam?.name || (m.awayTeam?.slot ? `Pemenang/Slot ${m.awayTeam.slot}` : 'TBD');
    const isFinished = m.status === 'FINISHED';
    
    let scoreText = '- : -';
    if (m.homeTeam?.score !== null && m.homeTeam?.score !== undefined && m.awayTeam?.score !== null && m.awayTeam?.score !== undefined) {
      if (m.isPenalty) {
        scoreText = `${m.homeTeam.score} (${m.homeTeam.penaltyScore}) : (${m.awayTeam.penaltyScore}) ${m.awayTeam.score} (Pen)`;
      } else if (m.isExtraTime) {
        scoreText = `${m.homeTeam.extraTimeScore} : ${m.awayTeam.extraTimeScore} (AET)`;
      } else {
        scoreText = `${m.homeTeam.score} : ${m.awayTeam.score}`;
      }
    }

    const winnerName = isFinished && m.winnerTeam ? `Pemenang: <strong>${m.winnerTeam.name}</strong>` : (isFinished ? 'Selesai' : 'Akan Datang');

    return `
      <tr>
        <td class="text-center" style="font-weight: bold;">${idx + 1}</td>
        <td><strong>${m.label || m.id.toUpperCase()}</strong><br><span style="font-size: 8pt; color: #475569;">${getStageName(m.id)}</span></td>
        <td>${m.date || '-'}<br><span class="font-mono" style="font-size: 8.5pt;">${m.time || '16:00 WITA'}</span></td>
        <td><strong>${homeName}</strong> ${m.homeTeam?.slot ? `<span class="badge">${m.homeTeam.slot}</span>` : ''}</td>
        <td class="text-center font-mono font-bold" style="background: #f8fafc; font-size: 10pt;">${scoreText}</td>
        <td><strong>${awayName}</strong> ${m.awayTeam?.slot ? `<span class="badge">${m.awayTeam.slot}</span>` : ''}</td>
        <td>${m.venueName || 'Stadion Utama'}</td>
        <td style="font-size: 8.5pt;">${winnerName}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 landscape;
            margin: 15mm 12mm 15mm 12mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 15px;
            font-size: 9.5pt;
          }
          .print-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2.5px solid #0f172a;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .print-header-text h1 {
            margin: 0 0 4px 0;
            font-size: 15pt;
            font-weight: 800;
            letter-spacing: -0.01em;
            color: #0f172a;
          }
          .print-header-text h2 {
            margin: 0 0 4px 0;
            font-size: 11pt;
            font-weight: 700;
            color: #b45309;
          }
          .print-header-text p {
            margin: 0;
            font-size: 8.5pt;
            color: #475569;
          }
          .rule-box {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            border-left: 4px solid #0d9488;
            padding: 8px 12px;
            font-size: 8.5pt;
            margin-bottom: 14px;
            border-radius: 4px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
            margin-bottom: 18px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            font-weight: 700;
            color: #0f172a;
            text-transform: uppercase;
            font-size: 8pt;
          }
          .badge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 7.5pt;
            font-weight: 600;
            border: 1px solid #94a3b8;
            background: #f1f5f9;
            color: #334155;
          }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .font-bold { font-weight: 700; }
          
          /* Visual Bracket Cards for Print */
          .bracket-summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 16px;
            page-break-inside: avoid;
          }
          .bracket-column {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .bracket-col-header {
            font-size: 8.5pt;
            font-weight: 800;
            padding: 4px 6px;
            background: #e2e8f0;
            text-align: center;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
          }
          .print-match-card {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 6px;
            background: #ffffff;
            font-size: 8pt;
          }
          .print-match-meta {
            display: flex;
            justify-content: space-between;
            font-size: 7pt;
            color: #64748b;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 2px;
            margin-bottom: 4px;
          }
          .print-team-row {
            display: flex;
            justify-content: space-between;
            padding: 2px 0;
          }

          /* Signatures Section */
          .signatures-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-top: 24px;
            page-break-inside: avoid;
          }
          .signature-box {
            text-align: center;
            font-size: 8.5pt;
          }
          .signature-space {
            height: 55px;
          }

          .print-footer {
            margin-top: 20px;
            text-align: right;
            font-size: 7.5pt;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-header-text">
            <h1>PEKAN OLAHRAGA PROVINSI (PORPROV) X SULAWESI TENGAH 2026</h1>
            <h2>JADWAL & BAGAN BABAK GUGUR (KNOCKOUT STAGE) CABANG SEPAK BOLA</h2>
            <p>Diterbitkan Resmi oleh Panitia Pelaksana & Pengawas Pertandingan PSSI Sulawesi Tengah &bull; Kabupaten Morowali 2026</p>
          </div>
        </div>

        <div class="rule-box">
          <strong>ℹ️ Regulasi Penempatan Bagan (Opposite Half Rule - JD-16/17):</strong> 
          Juara (1X) dan Runner-up (2X) dari grup yang sama ditempatkan pada paruh bagan berlawanan (Separuh 1 & Separuh 2) sehingga tidak saling berhadapan di Perempat Final maupun Semifinal, dan hanya dapat bertemu kembali di Partai Final.
        </div>

        <!-- Table of Matches -->
        <table>
          <thead>
            <tr>
              <th style="width: 25px;" class="text-center">No</th>
              <th style="width: 150px;">Laga / Babak</th>
              <th style="width: 120px;">Waktu & Tanggal</th>
              <th>Tim Tuan Rumah (Home)</th>
              <th style="width: 80px;" class="text-center">Skor Akhir</th>
              <th>Tim Tamu (Away)</th>
              <th style="width: 150px;">Stadion / Venue</th>
              <th style="width: 130px;">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <!-- Signatures -->
        <div class="signatures-container">
          <div class="signature-box">
            <div>Technical Delegate (TD) Sepak Bola<br>Asprov PSSI Sulawesi Tengah</div>
            <div class="signature-space"></div>
            <div><strong>( ____________________________ )</strong></div>
          </div>
          <div class="signature-box">
            <div>Koordinator Pertandingan / Panpel<br>PORPROV X Sulteng 2026</div>
            <div class="signature-space"></div>
            <div><strong>( ____________________________ )</strong></div>
          </div>
        </div>

        <div class="print-footer">
          Dicetak otomatis dari Sistem Informasi Manajemen Sepak Bola PORPROV X SULTENG &bull; ${new Date().toLocaleString('id-ID')}
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

