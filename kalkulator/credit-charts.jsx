// Credit calculator — charts column + schedule table

const { useMemo: useMemo2 } = React;

function ChartsColumn({ schedule, previewMonth, setPreviewMonth, amount }) {
  const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Legend } = window.Recharts;

  const [chartMode, setChartMode] = React.useState('remaining'); // 'remaining' | 'paid'

  const data = useMemo2(() => {
    return schedule.rows.map((r) => {
      // capital paid so far
      const capitalPaidSoFar = amount - r.remainingAfter;
      return {
        month: r.month,
        capitalRemaining: r.remainingAfter,
        capitalPaid: capitalPaidSoFar,
        principalPart: r.principal + r.extra,
        interestPart: r.interest,
      };
    });
  }, [schedule, amount]);

  const fmtK = (v) => {
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return v.toString();
  };

  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{
        background: 'var(--cream)',
        border: '1px solid var(--beige-light)',
        borderRadius: 10,
        padding: '12px 14px',
        fontFamily: 'Ubuntu',
        fontSize: 12,
        color: 'var(--khaki)',
        boxShadow: '0 8px 24px -12px rgba(48, 60, 48, 0.25)',
      }}>
        <div style={{ marginBottom: 8, color: 'var(--forest)', fontWeight: 500 }}>Miesiąc {label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 4 }}>
            <span>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: p.color, marginRight: 6 }} />
              {p.name}
            </span>
            <span className="font-display tnum" style={{ color: 'var(--forest)', fontWeight: 600 }}>{formatPLN(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="h-card" style={{ padding: 28 }}>
        <SectionHeader number="03" title="Pozostały kapitał w czasie." />
        <div style={{ height: 220, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }}>
              <defs>
                <linearGradient id="gradRemaining" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B8C5AB" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#B8C5AB" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#DAD1BF' }} interval="preserveStartEnd" tick={{ fontSize: 11, fill: '#564F3F' }} />
              <YAxis tickFormatter={fmtK} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#564F3F' }} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={previewMonth} stroke="#303C30" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area
                type="monotone"
                dataKey={chartMode === 'remaining' ? 'capitalRemaining' : 'capitalPaid'}
                name={chartMode === 'remaining' ? 'Pozostały kapitał' : 'Spłacony kapitał'}
                stroke="#303C30"
                strokeWidth={1.5}
                fill="url(#gradRemaining)"
                isAnimationActive={true}
                animationDuration={700}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-pill" style={{ marginTop: 16 }}>
          <button className={chartMode === 'remaining' ? 'active' : ''} onClick={() => setChartMode('remaining')}>Pozostały kredyt</button>
          <button className={chartMode === 'paid' ? 'active' : ''} onClick={() => setChartMode('paid')}>Spłacony kredyt</button>
        </div>
      </div>

      <div className="h-card" style={{ padding: 28 }}>
        <SectionHeader number="04" title="Podział raty w czasie." />
        <div style={{ height: 220, marginTop: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 8 }} stackOffset="none">
              <defs>
                <linearGradient id="gradCap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B8C5AB" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#B8C5AB" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gradInt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4E4138" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#4E4138" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#DAD1BF' }} interval="preserveStartEnd" tick={{ fontSize: 11, fill: '#564F3F' }} />
              <YAxis tickFormatter={fmtK} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#564F3F' }} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={previewMonth} stroke="#303C30" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Area type="monotone" dataKey="interestPart" name="Odsetki" stackId="1" stroke="#4E4138" strokeWidth={1.5} fill="url(#gradInt)" isAnimationActive={true} animationDuration={700} animationEasing="ease-out" />
              <Area type="monotone" dataKey="principalPart" name="Kapitał" stackId="1" stroke="#B8C5AB" strokeWidth={1.5} fill="url(#gradCap)" isAnimationActive={true} animationDuration={700} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function downloadScheduleXLSX(schedule, { amount, totalMonths } = {}) {
  if (!window.XLSX) { alert('Moduł Excel jeszcze się ładuje — spróbuj za chwilę.'); return; }
  const header = [
    ['Huck Nieruchomości — Harmonogram spłat kredytu'],
    ['Kwota kredytu', amount ?? null],
    ['Okres (miesiące)', totalMonths ?? schedule.actualMonths],
    ['Suma do spłaty', Math.round(schedule.totalPaid)],
    ['Suma odsetek', Math.round(schedule.totalInterest)],
    [],
    ['#', 'Data', 'Pozostały kapitał', 'Pozostało do spłaty', 'Spłacone', 'Rata', 'Kapitał', 'Odsetki', 'Oprocent. (%)', 'Nadpłata'],
  ];
  const body = schedule.rows.map((r) => [
    r.month,
    r.date.toISOString().slice(0, 10),
    Math.round(r.remainingAfter),
    Math.round(Math.max(0, schedule.totalPaid - r.paidSoFar)),
    Math.round(r.paidSoFar),
    Math.round(r.payment + r.extra),
    Math.round(r.principal),
    Math.round(r.interest),
    Number(r.ratePct.toFixed(2)),
    Math.round(r.extra),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([...header, ...body]);
  ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Harmonogram');
  XLSX.writeFile(wb, 'harmonogram-kredytu.xlsx');
}

function downloadSchedulePDF(schedule, { amount, totalMonths } = {}) {
  const w = window.open('', '_blank');
  if (!w) { alert('Zezwól na wyskakujące okna, żeby pobrać PDF.'); return; }
  const rowsHtml = schedule.rows.map((r) => `
    <tr>
      <td class="num muted">${r.month}</td>
      <td class="muted">${formatDatePL(r.date)}</td>
      <td class="num">${formatPLN(r.remainingAfter)}</td>
      <td class="num">${formatPLN(Math.max(0, schedule.totalPaid - r.paidSoFar))}</td>
      <td class="num">${formatPLN(r.paidSoFar)}</td>
      <td class="num strong">${formatPLN(r.payment + r.extra)}</td>
      <td class="num">${formatPLN(r.principal)}</td>
      <td class="num muted">${formatPLN(r.interest)}</td>
      <td class="num">${formatPct(r.ratePct)}</td>
      <td class="num">${formatPLN(r.extra)}</td>
    </tr>`).join('');

  w.document.write(`<!doctype html><html lang="pl"><head><meta charset="utf-8">
    <title>Harmonogram spłat — Huck Nieruchomości</title>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap">
    <style>
      @page { size: A4; margin: 14mm; }
      * { box-sizing: border-box; }
      body { font-family: 'Ubuntu', system-ui, sans-serif; color: #303C30; margin: 0; padding: 24px; }
      h1 { font-family: 'Clash Display', 'Ubuntu', sans-serif; font-weight: 700; font-size: 28px; letter-spacing: -0.02em; margin: 0 0 4px; }
      .sub { color: #564F3F; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 24px; }
      .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
      .kv { border: 1px solid #DAD1BF; border-radius: 8px; padding: 10px 14px; }
      .kv .k { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #564F3F; }
      .kv .v { font-weight: 600; font-size: 15px; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      thead th { text-align: right; font-weight: 500; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #564F3F; border-bottom: 1px solid #DAD1BF; padding: 8px 6px; }
      thead th:first-child, thead th:nth-child(2) { text-align: left; }
      tbody td { padding: 6px; border-bottom: 1px solid #EFE8DB; }
      tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
      tbody td.strong { font-weight: 600; }
      tbody td.muted { color: #564F3F; }
      tfoot td { padding-top: 10px; font-weight: 600; font-size: 12px; border-top: 2px solid #303C30; text-align: right; }
      .footer { margin-top: 28px; font-size: 10px; color: #564F3F; font-style: italic; }
    </style></head><body>
    <h1>Harmonogram spłat kredytu</h1>
    <div class="sub">Huck Nieruchomości · Kalkulator</div>
    <div class="summary">
      <div class="kv"><div class="k">Kwota kredytu</div><div class="v">${amount != null ? formatPLN(amount) : '—'}</div></div>
      <div class="kv"><div class="k">Okres</div><div class="v">${totalMonths ?? schedule.actualMonths} mies.</div></div>
      <div class="kv"><div class="k">Suma do spłaty</div><div class="v">${formatPLN(schedule.totalPaid)}</div></div>
      <div class="kv"><div class="k">Suma odsetek</div><div class="v">${formatPLN(schedule.totalInterest)}</div></div>
    </div>
    <table>
      <thead><tr>
        <th>#</th><th>Data</th><th>Pozostały kapitał</th><th>Pozostało do spłaty</th><th>Spłacone</th><th>Rata</th><th>Kapitał</th><th>Odsetki</th><th>Oprocent.</th><th>Nadpłata</th>
      </tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="footer">Kalkulator ma charakter orientacyjny. Rzeczywiste warunki kredytu ustala bank.</div>
    <script>window.addEventListener('load', () => { setTimeout(() => { window.focus(); window.print(); }, 300); });<\/script>
    </body></html>`);
  w.document.close();
}

function ScheduleTable({ schedule, overrides, setOverride, amount, totalMonths }) {
  return (
    <div className="h-card" style={{ padding: 40, marginTop: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <SectionHeader number="05" title="Harmonogram spłat." />
        <div style={{ fontSize: 12.5, color: 'var(--khaki)', maxWidth: 380, lineHeight: 1.5 }}>
          Pola <b style={{ color: 'var(--forest)' }}>oprocentowanie</b> i <b style={{ color: 'var(--forest)' }}>nadpłata</b> są edytowalne. Zmiana przelicza harmonogram od danego miesiąca.
        </div>
      </div>

      <div className="h-scroll-hint-bar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12H20M4 12L8 8M4 12L8 16M20 12L16 8M20 12L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 4V20M12 4L8 8M12 4L16 8M12 20L8 16M12 20L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        </svg>
        <span>Przesuń tabelę w poziomie i pionie, żeby zobaczyć wszystkie kolumny dla każdej raty.</span>
      </div>

      <div className="h-scroll" style={{ maxHeight: 420, overflow: 'auto', marginTop: 16, border: '1px solid var(--beige-light)', borderRadius: 14 }}>
        <table className="h-schedule">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>#</th>
              <th style={{ textAlign: 'left' }}>Data</th>
              <th>Pozostały kapitał</th>
              <th>Pozostało do spłaty</th>
              <th>Spłacone</th>
              <th>Rata</th>
              <th>Kapitał</th>
              <th>Odsetki</th>
              <th>Oprocent.</th>
              <th>Nadpłata</th>
            </tr>
          </thead>
          <tbody>
            {schedule.rows.map((r) => (
              <tr key={r.month}>
                <td className="tnum" style={{ color: 'var(--khaki)' }}>{r.month}</td>
                <td style={{ color: 'var(--khaki)' }}>{formatDatePL(r.date)}</td>
                <td className="tnum">{formatPLN(r.remainingAfter)}</td>
                <td className="tnum">{formatPLN(Math.max(0, schedule.totalPaid - r.paidSoFar))}</td>
                <td className="tnum">{formatPLN(r.paidSoFar)}</td>
                <td className="tnum" style={{ fontWeight: 500 }}>{formatPLN(r.payment + r.extra)}</td>
                <td className="tnum">{formatPLN(r.principal)}</td>
                <td className="tnum" style={{ color: 'var(--khaki)' }}>{formatPLN(r.interest)}</td>
                <td>
                  <input
                    className="inline-edit tnum"
                    type="number"
                    step="0.05"
                    value={overrides[r.month]?.ratePct ?? Number(r.ratePct.toFixed(2))}
                    onChange={(e) => setOverride(r.month, { ratePct: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td>
                  <input
                    className="inline-edit tnum"
                    type="number"
                    step="50"
                    value={overrides[r.month]?.extra ?? Math.round(r.extra)}
                    onChange={(e) => setOverride(r.month, { extra: parseFloat(e.target.value) || 0 })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button className="h-btn h-btn-outline" onClick={() => downloadSchedulePDF(schedule, { amount, totalMonths })}>
          Pobierz PDF
          <span className="arrow-circle"><ArrowUpRight size={12} /></span>
        </button>
        <button className="h-btn h-btn-outline" onClick={() => downloadScheduleXLSX(schedule, { amount, totalMonths })}>
          Pobierz Excel
          <span className="arrow-circle"><ArrowUpRight size={12} /></span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ChartsColumn, ScheduleTable });
