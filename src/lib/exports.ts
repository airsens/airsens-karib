// ============================================================
// AirSENS export utilities — CSV and print-PDF
// No external libraries needed.
// ============================================================

const today = () => new Date().toISOString().slice(0, 10);

// ---- CSV ----
export function downloadCsv(rows: (string | number | null | undefined)[][], filename: string) {
  const csv = rows
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${today()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---- Print PDF ----
// Opens a styled print window. The browser's native "Save as PDF" option
// handles the actual PDF generation — no library required, works everywhere.
export function printPdf(title: string, sections: { heading: string; html: string }[]) {
  const body = sections.map(s => `
    <h2>${s.heading}</h2>
    ${s.html}
  `).join('<br/>');

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) { alert('Please allow pop-ups for this site to generate PDF reports.'); return; }

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>AirSENS — ${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1a1a2e; background: #fff; padding: 28px 36px; }
    header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #1a1a2e; padding-bottom: 10px; margin-bottom: 18px; }
    header h1 { font-size: 16pt; font-weight: 800; letter-spacing: -.02em; }
    header .sub { font-size: 9pt; color: #555; text-align: right; line-height: 1.6; }
    h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #1a1a2e; border-left: 3px solid #2fe6e0; padding-left: 8px; margin: 20px 0 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 9.5pt; }
    th { background: #1a1a2e; color: #fff; text-align: left; padding: 6px 10px; font-size: 8.5pt; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
    td { padding: 5px 10px; border-bottom: 1px solid #dde; }
    tr:nth-child(even) td { background: #f6f8ff; }
    .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 8pt; font-weight: 700; text-transform: uppercase; }
    .badge-red { background: #ffe0e4; color: #cc1a2e; }
    .badge-amber { background: #fff3cc; color: #996600; }
    .badge-green { background: #e0f5e9; color: #1a7a40; }
    .badge-blue { background: #e0eaff; color: #1a4acc; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-bottom: 20px; }
    .kpi { border: 1px solid #dde; border-radius: 6px; padding: 12px; }
    .kpi-val { font-size: 22pt; font-weight: 800; color: #1a1a2e; }
    .kpi-lbl { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: .04em; margin-top: 2px; }
    footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #dde; font-size: 8pt; color: #888; display: flex; justify-content: space-between; }
    @media print {
      @page { margin: 18mm 16mm; size: A4; }
      body { padding: 0; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>AirSENS &nbsp;·&nbsp; ${title}</h1>
      <div style="font-size:9pt;color:#555;margin-top:4px;">Karib Aerospace Ltd &nbsp;·&nbsp; Part-CAMO / Part-145</div>
    </div>
    <div class="sub">Generated: ${new Date().toLocaleString()}<br/>Confidential — Internal Use Only</div>
  </header>
  ${body}
  <footer>
    <span>AirSENS by Karib Aerospace &nbsp;·&nbsp; karib.aerospace@outlook.com</span>
    <span>Page 1</span>
  </footer>
  <div style="margin-top:18px;text-align:center;">
    <button onclick="window.print()" style="padding:10px 28px;background:#1a1a2e;color:#fff;border:none;border-radius:6px;font-size:11pt;cursor:pointer;font-weight:600;">
      🖨 Print / Save as PDF
    </button>
  </div>
</body>
</html>`);
  win.document.close();
}
