function Header({ onSegmentsClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#inwestycja", label: "Inwestycja" },
    { href: "#blizniaki",  label: "Bliźniaki" },
    { href: "#pod-klucz",  label: "Pod klucz" },
    { href: "#lokalizacja",label: "Lokalizacja" },
    { href: "#galeria",    label: "Galeria" },
    { href: "#kontakt",    label: "Kontakt" },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-30 transition-all duration-500 ${scrolled ? "bg-bg/90 backdrop-blur-md border-b hairline" : "bg-ink/20 backdrop-blur-sm"}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <a href="#top" className={`font-display-bold text-2xl leading-none tracking-tight transition-colors ${scrolled ? "text-ink" : "text-bg"}`}>
          Zapolskiej<span className={scrolled ? "text-forest" : "accent-sage"}>.</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className={`mono-label transition-colors ${scrolled ? "text-ink/70 hover:text-ink" : "text-bg/80 hover:text-bg"}`}>{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href={`tel:${INVESTMENT.phoneHref}`} className={`hidden md:inline-flex items-center gap-2 mono-label transition-colors ${scrolled ? "text-ink hover:text-forest" : "text-bg hover:text-sage"}`}>
            <Icon.Phone className="w-4 h-4"/>
            <span>{INVESTMENT.phone}</span>
          </a>
          <a href={`tel:${INVESTMENT.phoneHref}`} aria-label="Zadzwoń" className="md:hidden w-10 h-10 bg-forest text-bg flex items-center justify-center">
            <Icon.Phone className="w-4 h-4"/>
          </a>
          <button onClick={() => setMenuOpen(!menuOpen)} className={`lg:hidden w-10 h-10 flex items-center justify-center transition-colors ${scrolled ? "text-ink" : "text-bg"}`} aria-label="Menu">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4"><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="16" x2="21" y2="16"/></svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-bg border-t hairline">
          <div className="px-6 py-4 flex flex-col gap-4">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="mono-label text-ink/70 hover:text-ink">{l.label}</a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const heroRef = useRef(null);

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (heroRef.current) {
        const el = heroRef.current.querySelector(".hero-media");
        if (el) el.style.transform = `scale(${1 + Math.min(y/3000, 0.06)}) translateY(${y*0.15}px)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={heroRef} id="top" className="relative overflow-hidden"
             style={{ height: "min(100vh, 900px)", minHeight: "640px" }}>

      {/* Hero media */}
      <div className="hero-media absolute inset-0">
        <video autoPlay muted loop playsInline
               poster="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=2400&q=85"
               className="w-full h-full object-cover">
          <source src="uploads/Generowanie_Wideo_Osiedla_Bli%C5%BAniak%C3%B3w.mp4" type="video/mp4"/>
        </video>
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-ink/45"/>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent"/>

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-20 md:pb-28">
        <Reveal delay={100}>
          <div className="mono-label text-bg/80 mb-6">INWESTYCJA DEWELOPERSKA · NAMYSŁÓW</div>
        </Reveal>

        <Reveal delay={200}>
          <h1 className="font-display-bold text-bg leading-[0.92]" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            {INVESTMENT.name}.<br/>
            <span className="accent-sage">Dom z ogrodem.</span><br/>
            Bez kompromisów.
          </h1>
        </Reveal>

        <Reveal delay={400}>
          <p className="text-bg/85 max-w-2xl mt-8 text-lg md:text-xl leading-relaxed">
            16 bliźniaków z ogrodami w sercu Namysłowa.<br className="hidden md:block"/>
            Oddanie {INVESTMENT.completionQuarter}. Standard deweloperski z pompą ciepła.
          </p>
        </Reveal>

        <Reveal delay={600}>
          <div className="flex flex-wrap gap-3 mt-10">
            <a href="#blizniaki" className="group inline-flex items-center gap-3 bg-sage text-forest px-7 py-4 mono-label hover:bg-bg transition-colors duration-500 whitespace-nowrap">
              <span>Zobacz dostępne domy</span>
              <Icon.Arrow className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"/>
            </a>
            <button type="button" onClick={() => window.generateOfferPDF && window.generateOfferPDF()} className="group inline-flex items-center gap-3 border border-bg/50 text-bg px-7 py-4 mono-label hover:bg-bg hover:text-ink transition-colors duration-500 whitespace-nowrap">
              <span>Pobierz ofertę PDF</span>
              <Icon.Arrow className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1"/>
            </button>
          </div>
        </Reveal>
      </div>

      {/* Availability counter bottom right. Na mobile niżej (bottom-2) i mniejsza czcionka,
          żeby nie zachodziła na CTA "Pobierz ofertę PDF". */}
      <div className="absolute bottom-2 md:bottom-8 right-4 md:right-10 text-bg/80 text-right">
        <div className="mono-label" style={{ fontSize: 10 }}>DOSTĘPNYCH SEGMENTÓW</div>
        <div className="font-display text-2xl md:text-4xl leading-none mt-1">
          <Counter to={INVESTMENT.availableUnits}/> <span className="opacity-50">/ {INVESTMENT.totalUnits}</span>
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-bg/70 nudge">
        <span className="mono-label">SCROLL</span>
        <Icon.Down className="w-4 h-4"/>
      </div>
    </section>
  );
}

function PillarsSection() {
  const pillars = [
    { icon: Icon.Pin, title: "Lokalizacja", desc: "7 minut do centrum Namysłowa, 45 minut do węzła A8, godzina do Wrocławia." },
    { icon: Icon.Leaf, title: "Standard deweloperski", desc: "Pompa ciepła, rekuperacja, instalacja pod fotowoltaikę w standardzie." },
    { icon: Icon.Land, title: "Własna działka", desc: "Każdy segment ma wyodrębnioną działkę 300–400 m² z osobną księgą wieczystą." },
    { icon: Icon.Shield, title: "Bezpieczna inwestycja", desc: "Otwarty rachunek powierniczy, pełna zgodność z ustawą deweloperską." },
  ];

  return (
    <section id="inwestycja" className="py-24 md:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-5 md:pr-10">
          <Reveal>
            <div className="mono-label text-muted mb-6">DLACZEGO TU</div>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Życie <span className="accent-sage">w skali</span> człowieka.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 text-lg text-muted leading-relaxed max-w-md">
              Osiedle dla ludzi, którzy wyrośli z mieszkania, ale nie chcą oddać życia w ręce dojazdów.
              Kameralna skala, własna ziemia, codzienność na wyciągnięcie ręki.
            </p>
          </Reveal>
        </div>

        <div className="col-span-12 md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-hairline">
          {pillars.map((p, i) => (
            <Reveal key={i} delay={i * 80} className="bg-bg p-8 md:p-10">
              <p.icon className="w-8 h-8 text-forest"/>
              <h3 className="font-display text-2xl md:text-3xl mt-6 leading-tight">{p.title}</h3>
              <p className="mt-3 text-muted leading-relaxed">{p.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Header, Hero, PillarsSection });
