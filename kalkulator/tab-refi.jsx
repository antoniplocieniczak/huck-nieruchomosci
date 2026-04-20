// Tab 2: Refinansowanie

function RefinanceTab() {
  const [curAmount, setCurAmount] = React.useState(380000);
  const [curMonthsLeft, setCurMonthsLeft] = React.useState(276);
  const [curRate, setCurRate] = React.useState(7.5);

  const [newRate, setNewRate] = React.useState(6.2);
  const [newMonths, setNewMonths] = React.useState(276);

  const [prowizja, setProwizja] = React.useState(3800);
  const [wycena, setWycena] = React.useState(600);
  const [ubezp, setUbezp] = React.useState(1200);

  const curPayment = annuityPayment(curAmount, curRate, curMonthsLeft);
  const newPayment = annuityPayment(curAmount, newRate, newMonths);
  const diff = newPayment - curPayment; // negative = savings

  const curTotalPaid = curPayment * curMonthsLeft;
  const newTotalPaid = newPayment * newMonths;
  const costs = prowizja + wycena + ubezp;
  const lifetimeSavings = curTotalPaid - newTotalPaid - costs;
  const paybackMonths = diff < 0 ? Math.ceil(costs / Math.abs(diff)) : Infinity;

  return (
    <div className="h-main-pad" style={{ padding: '0 48px', maxWidth: 1440, margin: '0 auto' }}>
      <div className="h-grid-2">
        {/* Current loan */}
        <div className="h-card" style={{ padding: 40 }}>
          <SectionHeader number="01" title="Obecny kredyt." />

          <FieldBlock
            label="Kwota pozostała do spłaty"
            rightAdornment={<NumberField value={curAmount} onChange={setCurAmount} min={10000} max={2000000} step={1000} suffix="zł" />}
          >
            <Slider value={curAmount} min={10000} max={2000000} step={1000} onChange={setCurAmount} />
          </FieldBlock>

          <FieldBlock
            label="Pozostały okres"
            rightAdornment={<NumberField value={curMonthsLeft} onChange={setCurMonthsLeft} min={1} max={420} suffix="mies" />}
          >
            <Slider value={curMonthsLeft} min={1} max={420} step={1} onChange={setCurMonthsLeft} />
          </FieldBlock>

          <FieldBlock
            label="Obecne oprocentowanie"
            rightAdornment={<NumberField value={curRate} onChange={setCurRate} min={0} max={15} step={0.05} suffix="%" />}
          >
            <Slider value={curRate} min={0} max={15} step={0.05} onChange={setCurRate} />
          </FieldBlock>

          <div style={{ marginTop: 32, padding: '20px 22px', background: 'var(--cream-alt)', borderRadius: 14 }}>
            <div className="h-fieldlabel">Obecna rata</div>
            <div className="font-display tnum" style={{ fontWeight: 700, fontSize: 36, color: 'var(--forest)', marginTop: 6 }}>
              {formatPLN(curPayment)}
            </div>
          </div>
        </div>

        {/* New loan - dark */}
        <div
          className="noise-dark"
          style={{
            position: 'relative',
            background: 'linear-gradient(155deg, #303C30 0%, #564F3F 70%, #4E4138 100%)',
            color: 'var(--cream)',
            borderRadius: 24,
            padding: 40,
            overflow: 'hidden',
          }}
        >
          <div aria-hidden className="outline-text-light" style={{ position: 'absolute', fontSize: 200, right: -30, bottom: -60, opacity: 0.5 }}>N</div>
          <div style={{ position: 'relative' }}>
            <SectionHeader number="02" title="Nowy kredyt." onDark />

            <FieldBlock
              label="Nowe oprocentowanie"
              rightAdornment={<NumberField value={newRate} onChange={setNewRate} min={0} max={15} step={0.05} suffix="%" size={22} onDark />}
            >
              <Slider value={newRate} min={0} max={15} step={0.05} onChange={setNewRate} onDark />
            </FieldBlock>

            <FieldBlock
              label="Nowy okres"
              rightAdornment={<NumberField value={newMonths} onChange={setNewMonths} min={1} max={420} suffix="mies" size={22} onDark />}
            >
              <Slider value={newMonths} min={1} max={420} step={1} onChange={setNewMonths} onDark />
            </FieldBlock>

            <div style={{ marginTop: 28 }}>
              <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.55)', marginBottom: 14 }}>Koszty refinansowania</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Prowizja', v: prowizja, s: setProwizja, max: 20000, step: 100 },
                  { label: 'Wycena',   v: wycena,   s: setWycena,   max: 3000,  step: 50 },
                  { label: 'Ubezp.',   v: ubezp,    s: setUbezp,    max: 10000, step: 50 },
                ].map((f, i) => (
                  <div key={i} style={{ background: 'rgba(244, 239, 233, 0.08)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244, 239, 233, 0.6)', marginBottom: 6 }}>{f.label}</div>
                    <input
                      type="number"
                      value={f.v}
                      step={f.step}
                      max={f.max}
                      min={0}
                      onChange={(e) => f.s(parseFloat(e.target.value) || 0)}
                      className="h-input tnum"
                      style={{ fontSize: 20, color: 'var(--cream)', width: '100%', textAlign: 'left' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28, padding: '20px 22px', background: 'rgba(244, 239, 233, 0.1)', borderRadius: 14 }}>
              <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.55)' }}>Nowa rata</div>
              <div className="font-display tnum" style={{ fontWeight: 700, fontSize: 36, marginTop: 6 }}>
                {formatPLN(newPayment)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results banner */}
      <div className="h-refi-banner" style={{ marginTop: 24, position: 'relative', overflow: 'hidden', background: 'var(--sage)', borderRadius: 24, padding: '48px 48px' }}>
        <div aria-hidden className="h-refi-outline" style={{ position: 'absolute', right: -40, bottom: -80, fontSize: 280, WebkitTextStroke: '1px rgba(48, 60, 48, 0.2)', color: 'transparent', fontFamily: 'Clash Display', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 0.85, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          OSZCZĘDNOŚĆ
        </div>
        <div style={{ position: 'relative' }}>
          <SectionHeader number="03" title="Twoja oszczędność." />

          <div className="h-refi-savings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 32 }}>
            <div>
              <div className="h-fieldlabel" style={{ marginBottom: 8 }}>Różnica w racie</div>
              <div className="font-display tnum h-refi-savings-number" style={{ fontWeight: 700, fontSize: 48, color: 'var(--forest)', letterSpacing: '-0.03em' }}>
                {diff <= 0 ? formatPLN(diff) : `+${formatPLN(diff)}`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--khaki)', marginTop: 6 }}>miesięcznie</div>
            </div>
            <div>
              <div className="h-fieldlabel" style={{ marginBottom: 8 }}>Oszczędność łączna</div>
              <div className="font-display tnum h-refi-savings-number" style={{ fontWeight: 700, fontSize: 48, color: 'var(--forest)', letterSpacing: '-0.03em' }}>
                {formatPLN(lifetimeSavings)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--khaki)', marginTop: 6 }}>po uwzględnieniu kosztów ({formatPLN(costs)})</div>
            </div>
            <div>
              <div className="h-fieldlabel" style={{ marginBottom: 8 }}>Okres zwrotu kosztów</div>
              <div className="font-display tnum h-refi-savings-number" style={{ fontWeight: 700, fontSize: 48, color: 'var(--forest)', letterSpacing: '-0.03em' }}>
                {isFinite(paybackMonths) ? `${paybackMonths} mies` : '—'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--khaki)', marginTop: 6 }}>od tego momentu oszczędzasz</div>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <button className="h-btn h-refi-cta" onClick={(e) => e.preventDefault()}>
              Umów konsultację z doradcą kredytowym Huck
              <span className="arrow-circle"><ArrowUpRight size={12} /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

window.RefinanceTab = RefinanceTab;
