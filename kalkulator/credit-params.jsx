// Credit calculator — parameters input panel (left column)

const { useState: useS1 } = React;

function ParamsPanel(props) {
  const {
    amount, setAmount,
    months, setMonths,
    wibor, setWibor,
    margin, setMargin,
    rateMode, setRateMode, // 'equal' | 'declining'
    extra, setExtra,
    extraStrategy, setExtraStrategy, // 'shorten' | 'reduce'
    unitYears, setUnitYears, // bool
  } = props;

  const rate = wibor + margin;

  return (
    <div className="h-card" style={{ padding: 40, alignSelf: 'start' }}>
      <SectionHeader number="01" title="Parametry kredytu." />

      {/* Kwota kredytu */}
      <FieldBlock
        label="Kwota kredytu"
        rightAdornment={<NumberField value={amount} onChange={setAmount} min={10000} max={2000000} step={1000} suffix="zł" />}
      >
        <Slider value={amount} min={10000} max={2000000} step={1000} onChange={setAmount} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {[300000, 500000, 800000, 1500000].map((v) => (
            <button
              key={v}
              className={`h-chip${amount === v ? ' active' : ''}`}
              onClick={() => setAmount(v)}
            >
              {v >= 1000000 ? `${(v / 1000000).toString().replace('.', ',')} mln` : `${v / 1000}${'\u00A0'}tys`}
            </button>
          ))}
        </div>
      </FieldBlock>

      {/* Okres */}
      <FieldBlock
        label="Okres spłaty"
        rightAdornment={
          <NumberField
            value={unitYears ? Math.round(months / 12) : months}
            onChange={(v) => setMonths(unitYears ? Math.max(1, Math.round(v)) * 12 : Math.max(1, Math.round(v)))}
            min={1}
            max={unitYears ? 35 : 420}
            suffix={unitYears ? 'lat' : 'mies'}
          />
        }
      >
        <Slider value={months} min={12} max={420} step={1} onChange={setMonths} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className={`h-chip${!unitYears ? ' active' : ''}`} onClick={() => setUnitYears(false)}>miesięcy</button>
          <button className={`h-chip${unitYears ? ' active' : ''}`} onClick={() => setUnitYears(true)}>lat</button>
        </div>
      </FieldBlock>

      {/* Oprocentowanie */}
      <FieldBlock
        label="Oprocentowanie"
        rightAdornment={
          <NumberField
            value={Number((wibor + margin).toFixed(2))}
            onChange={(v) => {
              // When editing sum directly, keep current margin constant, adjust WIBOR
              const newWibor = Math.max(0, Math.min(10, v - margin));
              setWibor(Number(newWibor.toFixed(2)));
            }}
            min={0}
            max={16}
            step={0.05}
            suffix="%"
            size={20}
          />
        }
      >
        <div style={{ marginBottom: 16, marginTop: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--khaki)' }}>WIBOR 3M</span>
            <span className="font-display tnum" style={{ fontWeight: 600, fontSize: 16, color: 'var(--forest)' }}>{formatPct(wibor)}</span>
          </div>
          <Slider value={wibor} min={0} max={10} step={0.05} onChange={setWibor} />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--khaki)' }}>Marża banku</span>
            <span className="font-display tnum" style={{ fontWeight: 600, fontSize: 16, color: 'var(--forest)' }}>{formatPct(margin)}</span>
          </div>
          <Slider value={margin} min={0} max={6} step={0.05} onChange={setMargin} />
        </div>
        <div
          style={{
            marginTop: 20,
            padding: '16px 18px',
            background: 'var(--cream-alt)',
            borderRadius: 14,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <div className="h-fieldlabel" style={{ marginBottom: 4 }}>łącznie</div>
            <div style={{ fontSize: 11, color: 'var(--khaki)' }}>
              {formatPct(wibor)} + {formatPct(margin)}
            </div>
          </div>
          <AnimatedPct
            value={rate}
            className="font-display tnum"
            style={{ fontWeight: 700, fontSize: 32, color: 'var(--sage)' }}
          />
        </div>
      </FieldBlock>

      {/* Typ rat */}
      <FieldBlock label="Typ rat">
        <div className="h-pill">
          <button className={rateMode === 'equal' ? 'active' : ''} onClick={() => setRateMode('equal')}>
            Raty stałe
          </button>
          <button className={rateMode === 'declining' ? 'active' : ''} onClick={() => setRateMode('declining')}>
            Raty malejące
          </button>
        </div>
      </FieldBlock>

      {/* Nadpłata */}
      <FieldBlock
        label="Nadpłata miesięczna"
        rightAdornment={<NumberField value={extra} onChange={setExtra} min={0} max={10000} step={50} suffix="zł" />}
      >
        <Slider value={extra} min={0} max={10000} step={50} onChange={setExtra} />

        <div style={{ marginTop: 16 }}>
          <div className="h-fieldlabel" style={{ marginBottom: 8 }}>Strategia nadpłaty</div>
          <div className="h-pill">
            <button
              className={extraStrategy === 'shorten' ? 'active' : ''}
              onClick={() => setExtraStrategy('shorten')}
            >
              Skróć czas
            </button>
            <button
              className={extraStrategy === 'reduce' ? 'active' : ''}
              onClick={() => setExtraStrategy('reduce')}
            >
              Zmniejsz ratę
            </button>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--khaki)', marginTop: 12, lineHeight: 1.5 }}>
            {extraStrategy === 'shorten'
              ? 'Rata pozostaje taka sama, kredyt spłacisz szybciej.'
              : 'Okres kredytu pozostaje, Twoja miesięczna rata maleje.'}
          </div>
        </div>
      </FieldBlock>
    </div>
  );
}

window.ParamsPanel = ParamsPanel;
