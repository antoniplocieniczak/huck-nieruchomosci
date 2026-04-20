// Tab 3: Kalkulator oszczędzania

function SavingsTab() {
  const { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } = window.Recharts;

  const [initial, setInitial] = React.useState(20000);
  const [monthly, setMonthly] = React.useState(1500);
  const [rate, setRate] = React.useState(5);
  const [unitYears, setUnitYears] = React.useState(true);
  const [years, setYears] = React.useState(10);
  const [compounding, setCompounding] = React.useState('monthly');

  const months = unitYears ? years * 12 : years;
  const res = calcSavings({ initial, monthly, annualRatePct: rate, months, compounding });

  const contribPct = res.finalBalance > 0 ? (res.totalContrib / res.finalBalance) * 100 : 0;
  const intPct = 100 - contribPct;

  const data = res.rows.map((r) => ({
    month: r.month,
    contributed: r.contributed,
    interest: r.interest,
  }));

  const fmtK = (v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v.toString();

  function Tip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={{ background: 'var(--cream)', border: '1px solid var(--beige-light)', borderRadius: 10, padding: '12px 14px', fontSize: 12, fontFamily: 'Ubuntu' }}>
        <div style={{ marginBottom: 6, color: 'var(--forest)', fontWeight: 500 }}>Miesiąc {label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginTop: 3, color: 'var(--khaki)' }}>
            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: p.color, marginRight: 6 }} />{p.name}</span>
            <span className="font-display tnum" style={{ color: 'var(--forest)', fontWeight: 600 }}>{formatPLN(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-main-pad" style={{ padding: '0 48px', maxWidth: 1440, margin: '0 auto' }}>
      <div className="h-grid-savings">
        {/* Params */}
        <div className="h-card" style={{ padding: 40 }}>
          <SectionHeader number="01" title="Parametry oszczędzania." />

          <FieldBlock label="Kwota początkowa" rightAdornment={<NumberField value={initial} onChange={setInitial} min={0} max={1000000} step={500} suffix="zł" />}>
            <Slider value={initial} min={0} max={500000} step={500} onChange={setInitial} />
          </FieldBlock>

          <FieldBlock label="Miesięczna wpłata" rightAdornment={<NumberField value={monthly} onChange={setMonthly} min={0} max={50000} step={50} suffix="zł" />}>
            <Slider value={monthly} min={0} max={20000} step={50} onChange={setMonthly} />
          </FieldBlock>

          <FieldBlock label="Oprocentowanie roczne" rightAdornment={<NumberField value={rate} onChange={setRate} min={0} max={15} step={0.1} suffix="%" />}>
            <Slider value={rate} min={0} max={15} step={0.1} onChange={setRate} />
          </FieldBlock>

          <FieldBlock label="Okres" rightAdornment={<NumberField value={years} onChange={setYears} min={1} max={unitYears ? 40 : 480} suffix={unitYears ? 'lat' : 'mies'} />}>
            <Slider value={years} min={1} max={unitYears ? 40 : 480} step={1} onChange={setYears} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className={`h-chip${!unitYears ? ' active' : ''}`} onClick={() => { if (unitYears) setYears(years * 12); setUnitYears(false); }}>miesięcy</button>
              <button className={`h-chip${unitYears ? ' active' : ''}`} onClick={() => { if (!unitYears) setYears(Math.max(1, Math.round(years / 12))); setUnitYears(true); }}>lat</button>
            </div>
          </FieldBlock>

          <FieldBlock label="Kapitalizacja odsetek">
            <div className="h-pill">
              <button className={compounding === 'daily' ? 'active' : ''} onClick={() => setCompounding('daily')}>Dziennie</button>
              <button className={compounding === 'monthly' ? 'active' : ''} onClick={() => setCompounding('monthly')}>Miesięcznie</button>
              <button className={compounding === 'yearly' ? 'active' : ''} onClick={() => setCompounding('yearly')}>Rocznie</button>
            </div>
          </FieldBlock>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            className="noise-dark"
            style={{
              position: 'relative',
              background: 'linear-gradient(155deg, #303C30 0%, #564F3F 65%, #4E4138 100%)',
              color: 'var(--cream)',
              borderRadius: 24,
              padding: 40,
              overflow: 'hidden',
            }}
          >
            <div aria-hidden className="outline-text-light" style={{ position: 'absolute', fontSize: 200, right: -30, bottom: -70, opacity: 0.5 }}>H</div>
            <div style={{ position: 'relative' }}>
              <SectionHeader number="02" title="Kwota końcowa." onDark />
              <div className="font-display tnum" style={{ fontWeight: 700, fontSize: 'clamp(48px, 6vw, 76px)', marginTop: 16, letterSpacing: '-0.035em', lineHeight: 1 }}>
                {formatPLN(res.finalBalance)}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(244, 239, 233, 0.7)', marginTop: 12 }}>
                po {unitYears ? `${years} latach` : `${years} miesiącach`} oszczędzania
              </div>

              <div style={{ marginTop: 28 }}>
                <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: 'rgba(244, 239, 233, 0.15)' }}>
                  <div style={{ width: `${contribPct}%`, background: 'var(--sage)', transition: 'width 220ms ease-out' }} />
                  <div style={{ width: `${intPct}%`, background: 'var(--beige)', transition: 'width 220ms ease-out' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
                  <span style={{ color: 'rgba(244, 239, 233, 0.7)' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: 'var(--sage)', marginRight: 8, verticalAlign: 'middle' }} />
                    Wpłacone <span className="tnum">{formatPLN(res.totalContrib)}</span>
                  </span>
                  <span style={{ color: 'rgba(244, 239, 233, 0.7)' }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: 'var(--beige)', marginRight: 8, verticalAlign: 'middle' }} />
                    Zysk z odsetek <span className="tnum">{formatPLN(res.totalInterest)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-card" style={{ padding: 28 }}>
            <SectionHeader number="03" title="Narastanie kapitału w czasie." />
            <div style={{ height: 260, marginTop: 20 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B8C5AB" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#B8C5AB" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="gradInt2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#303C30" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#303C30" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#DAD1BF' }} tick={{ fontSize: 11, fill: '#564F3F' }} interval="preserveStartEnd" />
                  <YAxis tickFormatter={fmtK} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#564F3F' }} width={44} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="contributed" name="Wpłacone" stackId="1" stroke="#B8C5AB" strokeWidth={1.5} fill="url(#gradContrib)" />
                  <Area type="monotone" dataKey="interest" name="Odsetki" stackId="1" stroke="#303C30" strokeWidth={1.5} fill="url(#gradInt2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.SavingsTab = SavingsTab;
