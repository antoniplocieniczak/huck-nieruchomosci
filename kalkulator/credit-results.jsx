// Credit calculator — results card (middle) + charts column (right)

function ResultsCard(props) {
  const {
    schedule, amount, totalMonths, previewMonth, setPreviewMonth,
  } = props;

  const payment = schedule.rows[0]?.payment || 0;
  const firstRow = schedule.firstPayment;
  const totalInterest = schedule.totalInterest;
  const totalPaid = schedule.totalPaid;
  const costPct = amount > 0 ? (totalPaid / amount) * 100 : 0;

  // current month preview
  const row = schedule.rows.find((r) => r.month === previewMonth) || schedule.rows[schedule.rows.length - 1];
  const totalPrincipalPaidByNow = row
    ? amount - row.remainingAfter
    : 0;
  const pctPaid = amount > 0 ? (totalPrincipalPaidByNow / amount) * 100 : 0;

  // Capital vs interest split for first row (to label bar)
  const capInFirst = firstRow ? firstRow.principal : 0;
  const intInFirst = firstRow ? firstRow.interest : 0;
  const totalFirst = capInFirst + intInFirst;
  const capPct = totalFirst > 0 ? (capInFirst / totalFirst) * 100 : 0;
  const intPct = 100 - capPct;

  // total capital vs interest split
  const totalCapPct = totalPaid > 0 ? (amount / totalPaid) * 100 : 0;
  const totalIntPct = 100 - totalCapPct;

  return (
    <div
      className="noise-dark"
      style={{
        position: 'relative',
        background: 'linear-gradient(155deg, #303C30 0%, #564F3F 60%, #4E4138 100%)',
        color: 'var(--cream)',
        borderRadius: 24,
        padding: 40,
        overflow: 'hidden',
        alignSelf: 'start',
      }}
    >
      {/* Outline decoration */}
      <div
        aria-hidden
        className="outline-text-light"
        style={{
          position: 'absolute',
          fontSize: 260,
          right: -40,
          bottom: -80,
          opacity: 0.6,
        }}
      >
        H
      </div>

      <div style={{ position: 'relative' }}>
        <SectionHeader number="02" title="Podsumowanie." onDark />

        {/* Main metric */}
        <div style={{ marginTop: 36 }}>
          <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.55)' }}>
            Rata miesięczna
          </div>
          <div
            className="font-display tnum"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(48px, 6vw, 76px)',
              lineHeight: 1,
              color: 'var(--cream)',
              marginTop: 8,
              letterSpacing: '-0.035em',
            }}
          >
            <AnimatedPLN value={payment} />
          </div>
          <div style={{ fontSize: 13, color: 'rgba(244, 239, 233, 0.65)', marginTop: 12 }}>
            z czego kapitał <AnimatedPLN value={capInFirst} /> · odsetki <AnimatedPLN value={intInFirst} />
          </div>
        </div>

        {/* Stacked bar */}
        <div style={{ marginTop: 28 }}>
          <div
            style={{
              display: 'flex',
              height: 12,
              borderRadius: 999,
              overflow: 'hidden',
              background: 'rgba(244, 239, 233, 0.15)',
            }}
          >
            <div style={{ width: `${capPct}%`, background: 'var(--sage)', transition: 'width 220ms ease-out' }} />
            <div style={{ width: `${intPct}%`, background: 'var(--beige)', transition: 'width 220ms ease-out' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
            <span style={{ color: 'rgba(244, 239, 233, 0.7)' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: 'var(--sage)', marginRight: 8, verticalAlign: 'middle' }} />
              Kapitał <span className="tnum">{capPct.toFixed(0)}%</span>
            </span>
            <span style={{ color: 'rgba(244, 239, 233, 0.7)' }}>
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: 'var(--beige)', marginRight: 8, verticalAlign: 'middle' }} />
              Odsetki <span className="tnum">{intPct.toFixed(0)}%</span>
            </span>
          </div>
        </div>

        {/* Grid 2x2 */}
        <div
          style={{
            marginTop: 32,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(244, 239, 233, 0.15)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'Suma do spłaty',   value: <AnimatedPLN value={totalPaid} /> },
            { label: 'Suma odsetek',     value: <AnimatedPLN value={totalInterest} /> },
            { label: 'Koszt całkowity',  value: <AnimatedPct value={costPct} decimals={1} /> },
            { label: 'Pierwsza rata',    value: firstRow ? formatDatePL(firstRow.date) : '—' },
          ].map((m, i) => (
            <div key={i} style={{ background: 'rgba(48, 60, 48, 0.6)', padding: '16px 18px' }}>
              <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.5)', marginBottom: 6 }}>
                {m.label}
              </div>
              <div className="font-display tnum" style={{ fontSize: 18, fontWeight: 600 }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Month preview slider */}
        <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid rgba(244, 239, 233, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.55)' }}>
              Podgląd miesiąca spłaty
            </span>
            <NumberField
              value={previewMonth}
              onChange={(v) => setPreviewMonth(Math.max(1, Math.min(schedule.actualMonths, v)))}
              min={1}
              max={schedule.actualMonths}
              suffix={`/ ${schedule.actualMonths}`}
              size={18}
              onDark
            />
          </div>
          <Slider
            value={previewMonth}
            min={1}
            max={Math.max(1, schedule.actualMonths)}
            step={1}
            onChange={setPreviewMonth}
            onDark
          />

          {row && (
            <div style={{
              marginTop: 18,
              padding: '18px 20px',
              background: 'rgba(244, 239, 233, 0.08)',
              borderRadius: 14,
            }}>
              <div style={{ fontSize: 13, color: 'rgba(244, 239, 233, 0.7)', marginBottom: 10 }}>
                W miesiącu <span className="tnum">{row.month}</span> ({formatDatePL(row.date)}) płacisz:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.5)' }}>Kapitał</div>
                  <div className="font-display tnum" style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{formatPLN(row.principal)}</div>
                </div>
                <div>
                  <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.5)' }}>Odsetki</div>
                  <div className="font-display tnum" style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{formatPLN(row.interest)}</div>
                </div>
                <div>
                  <div className="h-fieldlabel" style={{ color: 'rgba(244, 239, 233, 0.5)' }}>Zostaje</div>
                  <div className="font-display tnum" style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>{formatPLN(row.remainingAfter)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(244, 239, 233, 0.7)', marginBottom: 6 }}>
              <span>Spłacone <span className="tnum">{pctPaid.toFixed(0)}%</span> kredytu</span>
              <span className="tnum">{formatPLN(totalPrincipalPaidByNow)} / {formatPLN(amount)}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(244, 239, 233, 0.15)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${pctPaid}%`, height: '100%', background: 'var(--sage)', transition: 'width 220ms ease-out' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ResultsCard = ResultsCard;
