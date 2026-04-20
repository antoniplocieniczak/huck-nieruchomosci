// Lead magnet section — free ebook for mortgage buyers

function LeadMagnet() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <section style={{ marginTop: 80, padding: '0 48px' }} className="h-main-pad">
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <div
          className="noise-dark lead-magnet-grid"
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 28,
            background: 'linear-gradient(155deg, #303C30 0%, #4E4138 100%)',
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 0,
            minHeight: 460,
          }}
        >
          {/* Outline word */}
          <div
            aria-hidden
            className="outline-text-light"
            style={{
              position: 'absolute',
              fontSize: 'clamp(180px, 20vw, 320px)',
              left: '-2%',
              bottom: '-14%',
              opacity: 0.35,
              whiteSpace: 'nowrap',
              letterSpacing: '-0.05em',
            }}
          >
            PORADNIK
          </div>

          {/* Left: copy */}
          <div className="lead-magnet-copy" style={{ position: 'relative', padding: '56px 48px', color: 'var(--cream)' }}>
            <div className="h-numlabel" style={{ color: 'rgba(244, 239, 233, 0.55)', marginBottom: 18 }}>
              BEZPŁATNY PORADNIK
            </div>
            <h2
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: 'clamp(32px, 3.6vw, 52px)',
                lineHeight: 1.02,
                letterSpacing: '-0.03em',
                color: 'var(--cream)',
              }}
            >
              10 największych błędów <br />
              przy braniu <span style={{ color: 'var(--sage)' }}>kredytu hipotecznego</span>.
            </h2>
            <p style={{ marginTop: 22, fontSize: 16, lineHeight: 1.55, color: 'rgba(244, 239, 233, 0.75)', maxWidth: 520 }}>
              Jak ich uniknąć i zaoszczędzić dziesiątki tysięcy złotych w skali całego kredytu. Praktyczny ebook dla świadomych kupujących, 38 stron konkretów.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '28px 0 0', display: 'grid', gap: 10 }}>
              {[
                'Na czym banki zarabiają, a o czym nie mówią',
                'Jak czytać WIBOR, marżę i prowizje',
                'Kiedy nadpłacać, a kiedy inwestować',
                'Najczęstsze pułapki umów hipotecznych',
              ].map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'baseline', fontSize: 14, color: 'rgba(244, 239, 233, 0.85)' }}>
                  <span style={{ color: 'var(--sage)', fontFamily: 'Clash Display', fontWeight: 700, fontSize: 13, minWidth: 22 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {!submitted ? (
              <form
                onSubmit={(e) => { e.preventDefault(); if (email.includes('@')) setSubmitted(true); }}
                style={{ marginTop: 32, display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: 520 }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Twój adres e-mail"
                  style={{
                    flex: '1 1 240px',
                    background: 'rgba(244, 239, 233, 0.08)',
                    border: '1px solid rgba(244, 239, 233, 0.2)',
                    borderRadius: 999,
                    padding: '14px 22px',
                    color: 'var(--cream)',
                    fontFamily: 'Ubuntu',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
                <button type="submit" className="h-btn h-btn-light" style={{ border: 'none' }}>
                  Pobierz ebook
                  <span className="arrow-circle"><ArrowUpRight size={12} /></span>
                </button>
              </form>
            ) : (
              <div style={{ marginTop: 32, padding: '16px 22px', background: 'rgba(184, 197, 171, 0.18)', borderRadius: 14, color: 'var(--cream)', fontSize: 14, maxWidth: 520 }}>
                Dziękujemy. Link do ebooka wysłaliśmy na <b>{email}</b>.
              </div>
            )}

            <div style={{ fontSize: 11.5, color: 'rgba(244, 239, 233, 0.5)', marginTop: 14, lineHeight: 1.5, maxWidth: 520 }}>
              Wysyłając formularz akceptujesz politykę prywatności. Nie spamujemy.
            </div>
          </div>

          {/* Right: visual — iPad on counter */}
          <div className="lead-magnet-visual" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, #564F3F 0%, #4E4138 100%)' }}>
            {/* SVG scene: kitchen counter + iPad showing ebook */}
            <svg
              viewBox="0 0 600 520"
              preserveAspectRatio="xMidYMid slice"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
            >
              <defs>
                <linearGradient id="counterGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6B5E4E" />
                  <stop offset="100%" stopColor="#3A3128" />
                </linearGradient>
                <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5A5144" />
                  <stop offset="100%" stopColor="#3D362C" />
                </linearGradient>
                <linearGradient id="ipadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="100%" stopColor="#0a0a0a" />
                </linearGradient>
                <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F4EFE9" />
                  <stop offset="100%" stopColor="#E8E1D5" />
                </linearGradient>
                <radialGradient id="lightSpot" cx="0.5" cy="0.3" r="0.6">
                  <stop offset="0%" stopColor="rgba(244, 239, 233, 0.18)" />
                  <stop offset="100%" stopColor="rgba(244, 239, 233, 0)" />
                </radialGradient>
                <filter id="softShadow">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
                </filter>
              </defs>

              {/* Wall */}
              <rect x="0" y="0" width="600" height="380" fill="url(#wallGrad)" />
              {/* Light spot */}
              <rect x="0" y="0" width="600" height="520" fill="url(#lightSpot)" />
              {/* Counter surface */}
              <rect x="0" y="380" width="600" height="140" fill="url(#counterGrad)" />
              <path d="M 0 410 Q 150 395, 300 420 T 600 405" stroke="rgba(244, 239, 233, 0.06)" strokeWidth="1" fill="none" />
              <path d="M 0 460 Q 200 450, 380 480 T 600 465" stroke="rgba(244, 239, 233, 0.05)" strokeWidth="1" fill="none" />

              {/* Ceramic cup (small, back-left) */}
              <ellipse cx="70" cy="400" rx="26" ry="6" fill="rgba(0,0,0,0.35)" filter="url(#softShadow)" />
              <path d="M 48 382 Q 48 402, 70 402 Q 92 402, 92 382 Z" fill="#C5BCAB" />
              <ellipse cx="70" cy="381" rx="22" ry="5" fill="#564F3F" />
              <path d="M 92 386 Q 102 389, 100 396 Q 98 400, 90 399" stroke="#C5BCAB" strokeWidth="2" fill="none" />

              {/* Plant pot (small, back-right) */}
              <rect x="520" y="352" width="42" height="34" rx="3" fill="#3A4538" />
              <path d="M 526 354 Q 532 328, 540 350 Q 546 324, 552 352 Q 560 328, 562 350" stroke="#6B7D5E" strokeWidth="1.5" fill="#5C6E52" />

              {/* iPad shadow — big */}
              <ellipse cx="300" cy="495" rx="250" ry="16" fill="rgba(0,0,0,0.5)" filter="url(#softShadow)" />

              {/* iPad body — big, centered, dominates the frame */}
              <g transform="translate(40, 60) rotate(-2 280 210)">
                <rect x="0" y="0" width="520" height="410" rx="24" fill="url(#ipadGrad)" />
                <rect x="12" y="12" width="496" height="386" rx="14" fill="url(#screenGrad)" />

                {/* Ebook cover on screen */}
                <g transform="translate(34, 32)">
                  <rect x="0" y="0" width="428" height="346" rx="6" fill="#F4EFE9" />
                  {/* Header bar */}
                  <rect x="0" y="0" width="428" height="40" fill="#303C30" />
                  <text x="20" y="26" fontFamily="Ubuntu, sans-serif" fontSize="12" fill="#B8C5AB" letterSpacing="3">
                    HUCK NIERUCHOMOŚCI · PORADNIK
                  </text>
                  {/* Tag */}
                  <rect x="350" y="12" width="64" height="18" rx="9" fill="#B8C5AB" />
                  <text x="382" y="25" fontFamily="Ubuntu, sans-serif" fontSize="9" fontWeight="500" fill="#303C30" textAnchor="middle" letterSpacing="1.5">
                    EBOOK
                  </text>

                  {/* Big number */}
                  <text x="28" y="140" fontFamily="Clash Display, sans-serif" fontSize="92" fontWeight="700" fill="#303C30" letterSpacing="-3">
                    10
                  </text>
                  <text x="28" y="162" fontFamily="Ubuntu, sans-serif" fontSize="10" fill="#564F3F" letterSpacing="1.8">
                    NAJWIĘKSZYCH BŁĘDÓW
                  </text>
                  {/* Title */}
                  <text x="28" y="202" fontFamily="Clash Display, sans-serif" fontSize="22" fontWeight="600" fill="#303C30" letterSpacing="-0.5">
                    przy braniu kredytu
                  </text>
                  <text x="28" y="230" fontFamily="Clash Display, sans-serif" fontSize="22" fontWeight="600" fill="#B8C5AB" letterSpacing="-0.5">
                    hipotecznego.
                  </text>
                  {/* Divider */}
                  <line x1="28" y1="258" x2="400" y2="258" stroke="#DAD1BF" strokeWidth="0.8" />
                  {/* Subtitle */}
                  <text x="28" y="278" fontFamily="Ubuntu, sans-serif" fontSize="11" fill="#564F3F">
                    Jak ich uniknąć i zaoszczędzić
                  </text>
                  <text x="28" y="294" fontFamily="Ubuntu, sans-serif" fontSize="11" fill="#564F3F">
                    dziesiątki tysięcy złotych.
                  </text>
                  {/* Outline "K" decoration */}
                  <text x="310" y="330" fontFamily="Clash Display, sans-serif" fontSize="220" fontWeight="700" stroke="#303C30" strokeWidth="0.9" fill="none" opacity="0.18">
                    K
                  </text>
                  {/* Footer */}
                  <text x="28" y="328" fontFamily="Ubuntu, sans-serif" fontSize="8.5" fill="#564F3F" letterSpacing="1.2">
                    38 STRON · PDF · BEZPŁATNIE
                  </text>
                </g>

                {/* Subtle screen reflection */}
                <path d="M 12 12 L 508 12 L 280 140 L 12 80 Z" fill="rgba(244, 239, 233, 0.05)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

window.LeadMagnet = LeadMagnet;
