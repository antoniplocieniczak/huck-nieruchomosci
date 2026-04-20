// Shared primitives for the Huck kalkulator

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── Logo ─────────────────────────────────────────────────────────────────────
function HuckLogo({ size = 28 }) {
  // Aspect ratio of source SVG: 3177 × 1013 ≈ 3.136
  const height = size;
  const width = Math.round(height * (3177 / 1013));
  return (
    <img
      src="assets/huck-logo.svg"
      alt="Huck"
      width={width}
      height={height}
      style={{ display: 'block', height, width: 'auto' }}
    />
  );
}

// ── Arrow up-right ───────────────────────────────────────────────────────────
function ArrowUpRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path
        d="M3.5 10.5L10.5 3.5M10.5 3.5H4.5M10.5 3.5V9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Top bar ──────────────────────────────────────────────────────────────────
function TopBar() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '28px 48px',
        borderBottom: '1px solid var(--beige-light)',
      }}
    >
      <div>
        <HuckLogo size={26} />
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.32em',
            color: 'var(--khaki)',
            marginTop: 8,
            fontWeight: 500,
          }}
        >
          NIERUCHOMOŚCI
        </div>
      </div>

      <a className="link-arrow" href="#" onClick={(e) => e.preventDefault()}>
        <span>Wróć do huck.estate</span>
        <span className="arrow-circle">
          <ArrowUpRight size={12} />
        </span>
      </a>
    </header>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ activeTab }) {
  const outlineWord = activeTab === 'refi' ? 'REFINANSOWANIE' : activeTab === 'save' ? 'OSZCZĘDNOŚCI' : 'KREDYT';
  const titles = {
    credit: { a: 'Policz swój', b: 'kredyt hipoteczny.' },
    refi:   { a: 'Zmień swój', b: 'kredyt na lepszy.' },
    save:   { a: 'Zaplanuj swoje', b: 'oszczędności.' },
  };
  const subs = {
    credit: 'Zaplanuj finansowanie zakupu z precyzją. Kalkulator uwzględnia nadpłaty, zmianę oprocentowania w czasie i pełny harmonogram spłat.',
    refi:   'Porównaj swój obecny kredyt z ofertą refinansowania. Zobacz realną oszczędność po uwzględnieniu kosztów zmiany banku.',
    save:   'Sprawdź jak rosną Twoje oszczędności w czasie. Uwzględnij wpłaty cykliczne, kapitalizację odsetek i wybrany okres.',
  };
  const labels = { credit: 'KALKULATOR', refi: 'REFINANSOWANIE', save: 'OSZCZĘDZANIE' };

  return (
    <section
      className="h-hero"
      style={{
        position: 'relative',
        padding: '80px 48px 56px',
        overflow: 'hidden',
      }}
    >
      {/* Outline text decoration */}
      <div
        aria-hidden
        className="outline-text"
        style={{
          position: 'absolute',
          top: '30%',
          right: '-6%',
          fontSize: 'clamp(180px, 26vw, 380px)',
          opacity: 0.18,
          whiteSpace: 'nowrap',
        }}
      >
        {outlineWord}
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 48, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 900 }}>
            <h1
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: 'clamp(48px, 7vw, 96px)',
                lineHeight: 0.98,
                letterSpacing: '-0.035em',
                color: 'var(--forest)',
              }}
            >
              {titles[activeTab].a}{' '}
              <span style={{ color: 'var(--sage)' }}>{titles[activeTab].b}</span>
            </h1>
            <p
              style={{
                marginTop: 28,
                maxWidth: 600,
                fontSize: 17,
                lineHeight: 1.55,
                color: 'var(--khaki)',
              }}
            >
              {subs[activeTab]}
            </p>
          </div>

          <div style={{ textAlign: 'right', minWidth: 160 }}>
            <div className="h-numlabel" style={{ marginBottom: 6 }}>
              {activeTab === 'credit' ? '01 / 03' : activeTab === 'refi' ? '02 / 03' : '03 / 03'}
            </div>
            <div
              className="font-display"
              style={{
                fontSize: 14,
                letterSpacing: '0.22em',
                color: 'var(--forest)',
                fontWeight: 600,
              }}
            >
              {labels[activeTab]}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
function Tabs({ value, onChange }) {
  const tabs = [
    { id: 'credit', label: 'Kalkulator kredytu' },
    { id: 'refi',   label: 'Refinansowanie' },
    { id: 'save',   label: 'Kalkulator oszczędzania' },
  ];
  return (
    <div className="h-tabs-wrap" style={{ padding: '0 48px 48px', display: 'flex', justifyContent: 'center' }}>
      <div className="h-pill" style={{ overflowX: 'auto', maxWidth: '100%' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={value === t.id ? 'active' : ''}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section number label ─────────────────────────────────────────────────────
function SectionHeader({ number, title, onDark = false, accentWord = null }) {
  const titleColor = onDark ? 'var(--cream)' : 'var(--forest)';
  const labelColor = onDark ? 'rgba(244, 239, 233, 0.55)' : 'var(--khaki)';

  let titleNode = title;
  if (accentWord && title.includes(accentWord)) {
    const parts = title.split(accentWord);
    titleNode = (
      <>
        {parts[0]}
        <span style={{ color: 'var(--sage)' }}>{accentWord}</span>
        {parts[1]}
      </>
    );
  }

  return (
    <div>
      <div className="h-numlabel" style={{ color: labelColor, marginBottom: 14 }}>
        {number}
      </div>
      <h2
        className="font-display"
        style={{
          fontWeight: 600,
          fontSize: 32,
          color: titleColor,
          letterSpacing: '-0.02em',
        }}
      >
        {titleNode}
      </h2>
    </div>
  );
}

// ── Labeled slider + number input field ──────────────────────────────────────
function FieldBlock({ label, children, rightAdornment }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span className="h-fieldlabel">{label}</span>
        {rightAdornment}
      </div>
      {children}
    </div>
  );
}

function NumberField({ value, onChange, min, max, step = 1, suffix, size = 24, onDark = false, widthCh }) {
  const color = onDark ? 'var(--cream)' : 'var(--forest)';
  // Calculate needed char width: show full number formatted (with thousands sep), add room
  const rounded = Math.round(Math.abs(value));
  const digits = String(rounded).length;
  const thousandSpaces = Math.max(0, Math.floor((digits - 1) / 3));
  const neededCh = widthCh || Math.max(5, digits + thousandSpaces + 1);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 6,
        background: onDark ? 'rgba(244, 239, 233, 0.08)' : 'transparent',
        border: onDark ? '1px solid rgba(244, 239, 233, 0.18)' : '1px solid var(--beige-light)',
        borderRadius: 10,
        padding: '6px 14px',
        minWidth: 120,
        justifyContent: 'flex-end',
      }}
    >
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.max(min ?? -Infinity, Math.min(max ?? Infinity, v)));
          else onChange(0);
        }}
        className="h-input tnum"
        style={{
          fontSize: size,
          color,
          width: `${neededCh}ch`,
          textAlign: 'right',
          background: 'transparent',
        }}
      />
      {suffix && (
        <span style={{ fontSize: size * 0.55, color: onDark ? 'rgba(244, 239, 233, 0.6)' : 'var(--khaki)', fontFamily: 'Ubuntu', whiteSpace: 'nowrap' }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function Slider({ value, min, max, step = 1, onChange, onDark = false }) {
  return (
    <input
      type="range"
      className={`h-slider${onDark ? ' on-dark' : ''}`}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
    />
  );
}

// ── Animated count-up for financial numbers ──────────────────────────────────
function useCountUp(target, duration = 500) {
  const [v, setV] = React.useState(target);
  const raf = React.useRef(null);
  const start = React.useRef(target);
  React.useEffect(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    start.current = v;
    const from = v;
    const to = target;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (to - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target]);
  return v;
}

function AnimatedPLN({ value, duration = 500, ...rest }) {
  const v = useCountUp(value, duration);
  return <span {...rest}>{formatPLN(v)}</span>;
}
function AnimatedPct({ value, decimals = 2, duration = 400, ...rest }) {
  const v = useCountUp(value, duration);
  return <span {...rest}>{formatPct(v, decimals)}</span>;
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="h-footer" style={{ borderTop: '1px solid var(--beige-light)', padding: '48px', marginTop: 80 }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 560 }}>
          <HuckLogo size={22} />
          <div style={{ fontSize: 13, color: 'var(--khaki)', marginTop: 18, lineHeight: 1.6 }}>
            © 2026 Huck Nieruchomości · KTTPS Sp. z o.o. · Namysłów
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--khaki)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.55, maxWidth: 520 }}>
            Kalkulator ma charakter orientacyjny. Rzeczywiste warunki kredytu ustala bank.
          </div>
        </div>

        <button
          className="h-btn h-btn-light"
          style={{ border: '1px solid var(--beige-light)' }}
          onClick={(e) => e.preventDefault()}
        >
          Umów konsultację
          <span className="arrow-circle"><ArrowUpRight size={12} /></span>
        </button>
      </div>
    </footer>
  );
}

Object.assign(window, {
  HuckLogo,
  ArrowUpRight,
  TopBar,
  Hero,
  Tabs,
  SectionHeader,
  FieldBlock,
  NumberField,
  Slider,
  Footer,
  AnimatedPLN,
  AnimatedPct,
  useCountUp,
});
