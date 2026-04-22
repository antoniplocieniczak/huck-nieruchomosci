// Kolejność sortowania statusów: dostępne najpierw (lepsza konwersja),
// potem rezerwacje, sprzedane na końcu. Dla izometrycznego planu osiedla
// pozycje pinezek są stałe geograficznie - tego nie sortujemy, tylko listę/grid.
const SEGMENT_STATUS_ORDER = { available: 0, reserved: 1, sold: 2 };
// Ile kart dostępnych domyślnie: na mobile i desktop pokazujemy 3 (1 rząd na desktop
// = 3 kolumny × 1 rząd, 3 rzędy × 1 kolumna na mobile). Reszta chowa się pod przyciskiem expand.
const MOBILE_CARD_LIMIT = 3;
const DESKTOP_CARD_LIMIT = 3;

function PlotSection({ onSelect }) {
  const [filter, setFilter] = useState("all");
  const [hoverId, setHoverId] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [listExpanded, setListExpanded] = useState(false);
  const containerRef = useRef(null);
  const expandBtnRef = useRef(null);

  const filters = [
    { key: "all",       label: "Wszystkie", count: SEGMENTS.length },
    { key: "available", label: "Dostępne",  count: SEGMENTS.filter(s => s.status === "available").length },
    { key: "reserved",  label: "Rezerwacja",count: SEGMENTS.filter(s => s.status === "reserved").length },
    { key: "sold",      label: "Sprzedane", count: SEGMENTS.filter(s => s.status === "sold").length },
  ];

  const hoverSeg = hoverId ? SEGMENTS.find(s => s.id === hoverId) : null;

  const onMouseMove = (e) => {
    if (!hoverId || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setTooltipPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  // Sortowanie: najpierw dostępne, potem rezerwacje, sprzedane na końcu.
  // W obrębie grupy porządek naturalny po id (1A, 1B, 2A, 2B, ...).
  // useMemo żeby nie re-sortować przy każdym renderze przy hover/tooltipie.
  const sortedFiltered = useMemo(() => {
    const base = SEGMENTS.filter(s => filter === "all" || s.status === filter);
    base.sort((a, b) => {
      const d = (SEGMENT_STATUS_ORDER[a.status] ?? 99) - (SEGMENT_STATUS_ORDER[b.status] ?? 99);
      if (d !== 0) return d;
      return a.id.localeCompare(b.id, "pl", { numeric: true });
    });
    return base;
  }, [filter]);

  const mobileHiddenCount = Math.max(0, sortedFiltered.length - MOBILE_CARD_LIMIT);
  const desktopHiddenCount = Math.max(0, sortedFiltered.length - DESKTOP_CARD_LIMIT);

  // Po zwinięciu listy (gdy użytkownik przewinął pod kartami), wróć skrollem
  // do przycisku żeby nie został zgubiony pod stopką.
  const handleCollapse = () => {
    setListExpanded(false);
    requestAnimationFrame(() => {
      if (expandBtnRef.current) {
        expandBtnRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        expandBtnRef.current.focus();
      }
    });
  };

  return (
    <section id="blizniaki" className="py-24 md:py-40 bg-[#EAE3D6]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-12 gap-6 mb-12 md:mb-16">
          <div className="col-span-12 md:col-span-7">
            <Reveal>
              <div className="mono-label text-muted mb-6">DOSTĘPNE SEGMENTY · {SEGMENTS.filter(s => s.status === "available").length} Z {SEGMENTS.length}</div>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display-bold leading-[0.92]" style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}>
                Wybierz <span className="accent-sage">swój</span> dom.
              </h2>
            </Reveal>
          </div>
          <div className="col-span-12 md:col-span-5 md:pt-8">
            <Reveal delay={200}>
              <p className="text-muted leading-relaxed">
                Każdy bliźniak z osobnym wjazdem, własną działką i wydzieloną księgą wieczystą.
                Kliknij segment na planie, aby zobaczyć rzut, metraż i cenę.
              </p>
            </Reveal>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button key={f.key}
                onClick={() => { setFilter(f.key); setListExpanded(false); }}
                className={`mono-label px-4 py-2.5 transition-colors ${filter === f.key ? "bg-forest text-bg" : "bg-bg text-ink hover:bg-sand"}`}>
                {f.label} <span className="opacity-50 ml-1">{f.count}</span>
              </button>
            ))}
          </div>
          <div className="mono-label text-muted">
            WIDOK · IZOMETRYCZNY
          </div>
        </div>

        <Reveal className="relative bg-bg border hairline" delay={0}>
          {/* Mobile: przewijany poziomo (drag/scroll) z natywnymi granicami.
              Desktop: widok statyczny, cały plan widoczny w jednym kadrze. */}
          <div className="overflow-x-auto md:overflow-visible no-scrollbar">
            <div ref={containerRef} className="relative min-w-[900px] md:min-w-0" onMouseMove={onMouseMove}>
              <PlotIsometric filter={filter} onSelect={onSelect} hoverId={hoverId} setHoverId={setHoverId}/>
              {hoverSeg && tooltipPos && (
                <SegmentTooltip seg={hoverSeg} x={tooltipPos.x} y={tooltipPos.y}/>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 px-6 py-5 border-t hairline">
            {Object.entries(STATUS).map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-3 h-3" style={{ background: v.dot }}/>
                <span className="mono-label text-muted">{v.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-16">
          <div className="flex items-baseline justify-between mb-6">
            <div className="mono-label text-muted">LISTA SEGMENTÓW</div>
            <div className="mono-label text-muted">{sortedFiltered.length} <span className="hidden md:inline">segmentów</span></div>
          </div>

          {/* Mobile: widoczne pierwsze MOBILE_CARD_LIMIT (3). Desktop: widoczne DESKTOP_CARD_LIMIT (6, 2 rzędy po 3).
              Wszystkie karty są w DOM, reszta schowana Tailwindem i odsłaniana po kliknięciu expand. */}
          <div id="segment-list-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFiltered.map((s, i) => {
              let hideClass = "";
              if (!listExpanded) {
                if (i >= DESKTOP_CARD_LIMIT) hideClass = "hidden";               // schowane wszędzie
                else if (i >= MOBILE_CARD_LIMIT) hideClass = "hidden md:block";  // schowane na mobile, widoczne na desktop
              }
              return (
                <Reveal key={s.id} delay={i * 30} className={hideClass}>
                  <SegmentCard seg={s} onClick={() => onSelect(s)}/>
                </Reveal>
              );
            })}
          </div>

          {/* Przycisk expand/collapse. Jeśli filtr ma >= 4 a <= 6 wyników: tylko mobile widzi (bo desktop ma wszystko).
              Jeśli > 6: widzimy na obu, z różnymi liczbami. */}
          {mobileHiddenCount > 0 && (
            <div className={`mt-8 flex justify-center ${desktopHiddenCount === 0 ? "md:hidden" : ""}`}>
              <button
                ref={expandBtnRef}
                type="button"
                onClick={() => listExpanded ? handleCollapse() : setListExpanded(true)}
                aria-expanded={listExpanded}
                aria-controls="segment-list-grid"
                className="group inline-flex items-center gap-3 border hairline bg-transparent text-ink px-6 py-3.5 mono-label hover:border-forest hover:text-forest transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sage"
              >
                {listExpanded ? (
                  <span>Zwiń listę</span>
                ) : (
                  <>
                    <span className="md:hidden">Pokaż pozostałe {mobileHiddenCount}</span>
                    <span className="hidden md:inline">Pokaż pozostałe {desktopHiddenCount}</span>
                  </>
                )}
                <Icon.Down className={`w-4 h-4 transition-transform duration-300 ${listExpanded ? "rotate-180" : ""}`}/>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SegmentCard({ seg, onClick }) {
  const meta = STATUS[seg.status];
  const disabled = seg.status === "sold";
  const reserved = seg.status === "reserved";
  // Wizualne wzmocnienie: sold = 0.45, reserved = 0.7, available = 1.
  const opacityClass = disabled ? "opacity-[0.45]" : reserved ? "opacity-70" : "";
  const cursorClass = disabled ? "cursor-not-allowed" : "";
  const hoverClass = disabled ? "" : "hover:border-forest hover:-translate-y-0.5";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`group text-left bg-bg border hairline w-full p-6 transition-all duration-500 ${opacityClass} ${cursorClass} ${hoverClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="mono-label text-muted">SEGMENT</div>
          <div className="font-display-bold text-3xl leading-none mt-1">{seg.id}</div>
        </div>
        <span className="inline-flex items-center gap-1.5 mono-label px-2.5 py-1" style={{ background: meta.bg, color: meta.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.dot }}/>
          {meta.label}
        </span>
      </div>

      <div className="aspect-[5/3] bg-[#EAE3D6] mb-5 relative overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Ground */}
          <rect x="0" y="45" width="100" height="15" fill="#B8C5AB"/>
          {/* Wall */}
          <rect x="10" y="20" width="80" height="25" fill={meta.color} opacity="0.9"/>
          {/* Roof */}
          <path d="M8 20 L50 9 L92 20 Z" fill={meta.color}/>
          {/* Windows — 4 equal panes, aligned */}
          <rect x="16" y="27" width="8" height="10" fill="#F4EFE9" opacity="0.55"/>
          <rect x="28" y="27" width="8" height="10" fill="#F4EFE9" opacity="0.55"/>
          <rect x="64" y="27" width="8" height="10" fill="#F4EFE9" opacity="0.55"/>
          <rect x="76" y="27" width="8" height="10" fill="#F4EFE9" opacity="0.55"/>
          {/* Door (centered, touches ground line) */}
          <rect x="46" y="30" width="8" height="15" fill="#F4EFE9" opacity="0.35"/>
        </svg>
      </div>

      <dl className="grid grid-cols-2 gap-2 mono-data text-muted">
        <div><span className="opacity-60 block text-[10px] uppercase tracking-widest">Powierzchnia</span><span className="text-ink">{seg.area} m²</span></div>
        <div><span className="opacity-60 block text-[10px] uppercase tracking-widest">Pokoje</span><span className="text-ink">{seg.rooms}</span></div>
        <div><span className="opacity-60 block text-[10px] uppercase tracking-widest">Działka</span><span className="text-ink">{seg.land} m²</span></div>
        <div><span className="opacity-60 block text-[10px] uppercase tracking-widest">Garaż</span><span className="text-ink">{seg.garage} stan.</span></div>
      </dl>

      <div className="mt-5 pt-5 border-t hairline flex items-end justify-between">
        <div>
          <div className="mono-label text-muted">OD</div>
          <div className={`font-display-bold text-2xl leading-none mt-1 ${disabled ? "line-through text-muted" : ""}`}>{fmtPLN(seg.price)}</div>
        </div>
        {!disabled && <Icon.Arrow className="w-5 h-5 text-muted group-hover:text-forest group-hover:translate-x-1 transition-all"/>}
      </div>
    </button>
  );
}

function LocationSection() {
  // hoverPoi - klucz POI (nazwa) wskazywanego na liście; używany do highlightu pinezki na mapie
  const [hoverPoi, setHoverPoi] = useState(null);
  // activeCategories - Set kluczy kategorii. Pusty = brak filtra (wszystko widoczne)
  const [activeCategories, setActiveCategories] = useState(() => new Set());
  // mapApi - interfejs mapy (flyTo) udostępniony po inicjalizacji; pozwala na kliknięcie wiersza POI
  const [mapApi, setMapApi] = useState(null);
  // Leniwe renderowanie - mapę montujemy dopiero gdy sekcja wejdzie w viewport
  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    let done = false;
    const commit = () => { if (done) return; done = true; setInView(true); };
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { commit(); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(sectionRef.current);
    // Awaryjny fallback: jeśli IntersectionObserver nie wypali przez 2s,
    // mapa i tak się montuje (np. w środowiskach bez wsparcia IO albo gdy sekcja
    // już jest w viewport przy mount z powodu skrolla w deep-linku).
    const fallback = setTimeout(commit, 2000);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  const toggleCat = (key) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const catList = Object.entries(POI_CATS);
  const anyActive = activeCategories.size > 0;

  // Wysokość mapy: mobile 60vh (max 500px), tablet 450px, desktop 600px
  const mapHeightClass = "h-[min(60vh,500px)] md:h-[450px] lg:h-[600px]";

  return (
    <section ref={sectionRef} id="lokalizacja" className="py-24 md:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="mb-12 md:mb-16 max-w-3xl">
          <Reveal><div className="mono-label text-muted mb-6">LOKALIZACJA · NAMYSŁÓW</div></Reveal>
          <Reveal delay={100}>
            <h2 className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              W Namysłowie.<br/>
              <span className="accent-sage">Blisko wszystkiego.</span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-10">
          <Reveal className="col-span-12 lg:col-span-7">
            <div className="border hairline bg-[#EAE3D6] overflow-hidden">
              {inView ? (
                <NamyslowMap
                  activeCategories={activeCategories}
                  hoverPoi={hoverPoi}
                  onHoverPoi={setHoverPoi}
                  onApiReady={setMapApi}
                  heightClass={mapHeightClass}
                />
              ) : (
                <MapPlaceholder tall={mapHeightClass} />
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-6" role="group" aria-label="Filtry kategorii punktów na mapie">
              {catList.map(([key, c]) => {
                const pressed = activeCategories.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={pressed}
                    onClick={() => toggleCat(key)}
                    className={`flex items-center gap-2 px-4 py-2 border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sage ${pressed ? "border-ink bg-ink text-bg" : "hairline bg-transparent text-muted hover:text-ink hover:border-ink/40"}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }}/>
                    <span className="mono-label">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-5" delay={200}>
            <ul className="space-y-0 list-none p-0 m-0">
              {/* Inwestycja (wyróżniona, sage) - kliknięcie resetuje widok mapy do wszystkich POI */}
              <li
                key="__inwestycja"
                onClick={() => { if (mapApi) mapApi.reset(); }}
                className="flex items-center justify-between py-4 px-4 border-b hairline transition-all duration-200 cursor-pointer bg-sage/30 hover:bg-sage/50"
                aria-label="Osiedle Zapolskiej - kliknij aby zobaczyć wszystkie POI w kadrze"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full border-2 border-bg" style={{ background: "#303C30" }}/>
                  <span className="mono-data text-ink font-medium" style={{ fontSize: 13 }}>OSIEDLE ZAPOLSKIEJ</span>
                </div>
                <span className="mono-data text-forest">to tutaj</span>
              </li>

              {/* Biuro sprzedaży Huck - drugie, zaraz pod inwestycją */}
              {(() => {
                const biuro = POIS.find(p => p.cat === "huck");
                if (!biuro) return null;
                const dim = anyActive && !activeCategories.has(biuro.cat);
                const isHover = hoverPoi === biuro.name;
                return (
                  <li
                    key={biuro.name}
                    onMouseEnter={() => !dim && setHoverPoi(biuro.name)}
                    onMouseLeave={() => setHoverPoi(null)}
                    onClick={() => { if (!dim && mapApi) mapApi.selectPoi(biuro); }}
                    className={`flex items-center justify-between py-4 border-b hairline transition-all duration-200 cursor-pointer ${isHover ? "bg-[#EAE3D6]" : ""} ${dim ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ background: POI_CATS[biuro.cat].color }}/>
                      <span className="mono-data text-ink" style={{ fontSize: 13 }}>{biuro.name.toUpperCase()}</span>
                    </div>
                    <span className="mono-data text-muted">{biuro.time}</span>
                  </li>
                );
              })()}

              {/* Pozostałe POI w oryginalnej kolejności */}
              {POIS.filter(p => p.cat !== "huck").map((poi) => {
                const dim = anyActive && !activeCategories.has(poi.cat);
                const isHover = hoverPoi === poi.name;
                return (
                  <li
                    key={poi.name}
                    onMouseEnter={() => !dim && setHoverPoi(poi.name)}
                    onMouseLeave={() => setHoverPoi(null)}
                    onClick={() => { if (!dim && mapApi) mapApi.selectPoi(poi); }}
                    className={`flex items-center justify-between py-4 border-b hairline transition-all duration-200 cursor-pointer ${isHover ? "bg-[#EAE3D6]" : ""} ${dim ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full" style={{ background: POI_CATS[poi.cat].color }}/>
                      <span className="mono-data text-ink" style={{ fontSize: 13 }}>{poi.name.toUpperCase()}</span>
                    </div>
                    <span className="mono-data text-muted">{poi.time}</span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-10 font-display text-2xl md:text-3xl leading-[1.2]">
              Namysłów to nie kompromis.
              <span className="text-muted"> To miasto, które zachowało skalę i spokój, a jednocześnie leży na granicy aglomeracji wrocławskiej.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GallerySection({ onPlayVideo }) {
  const [lightbox, setLightbox] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const openLightbox = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const navLightbox = (dir) => setLightbox(l => (l + dir + GALLERY.length) % GALLERY.length);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navLightbox(1);
      if (e.key === "ArrowLeft") navLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const visibleGallery = expanded ? GALLERY : GALLERY.slice(0, 8);

  // Layout: 2 rzędy x 4 kolumny, wszystkie aspect [4/5] (portretowe), żadnych dziur.
  // Po rozwinięciu: dodatkowe wiersze po 4.
  // Każdy rząd na md+: 1 szerokie (span 2) + 2 wąskie, lub odwrotnie — dla rytmu,
  // ale TE SAME wysokości, więc bez dziur.
  const tileClass = (i) => {
    // W rzędzie 4-elementowym na md+: pattern A: [2-col, 1-col, 1-col] = 4 col total? nie.
    // Prostsza wersja: 4 równych tile'i w rzędzie, każdy md:col-span-3. Mobilnie: 2 na rząd.
    return "col-span-6 md:col-span-3";
  };

  return (
    <section id="galeria" className="pt-24 md:pt-40 bg-[#EAE3D6]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 mb-12 md:mb-16">
        <Reveal><div className="mono-label text-muted mb-6">WIZUALIZACJE I WNĘTRZA</div></Reveal>
        <Reveal delay={100}>
          <h2 className="font-display-bold leading-[0.95] max-w-4xl" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
            Zobacz, jak <span className="accent-sage">będziesz mieszkać.</span>
          </h2>
        </Reveal>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-12 gap-3 md:gap-4">
          {visibleGallery.map((img, i) => (
            <Reveal key={i} delay={i * 50} className={tileClass(i)}>
              <button onClick={() => openLightbox(i)} className="group relative overflow-hidden bg-sand w-full aspect-[4/5]">
                <img src={img.src} alt={img.label} loading="lazy"
                     className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105"/>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                <div className="absolute bottom-4 left-4 right-4 mono-label text-bg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500">
                  {img.label}
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {GALLERY.length > 8 && (
          <div className="mt-10 flex justify-center">
            <button onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              className="group inline-flex items-center gap-3 border border-forest text-forest px-7 py-4 mono-label hover:bg-forest hover:text-bg transition-colors duration-500">
              <span>{expanded ? "Zwiń listę" : `Pokaż wszystkie zdjęcia (${GALLERY.length})`}</span>
              <Icon.Down className={`w-4 h-4 transition-transform duration-500 ${expanded ? "rotate-180" : "group-hover:translate-y-1"}`}/>
            </button>
          </div>
        )}
      </div>

      <div className="mt-16 md:mt-24 relative">
        <button onClick={onPlayVideo} className="group block w-full relative">
          <div className="aspect-[4/5] md:aspect-[21/9] w-full overflow-hidden relative">
            <video autoPlay muted loop playsInline
                   poster="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
                   className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105">
              <source src="uploads/Generowanie_Wideo_Wn%C4%99trz_z_Prompt%C3%B3w.mp4" type="video/mp4"/>
            </video>
          </div>
          <div className="absolute inset-0 bg-forest/35 group-hover:bg-forest/45 transition-colors duration-500"/>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-20 h-20 rounded-full bg-bg flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Icon.Play className="w-7 h-7 text-forest translate-x-0.5"/>
            </span>
          </div>
          <div className="absolute bottom-6 left-6 md:left-10 mono-label text-bg">
            SPACER PO WNĘTRZACH · 1:32
          </div>
        </button>
      </div>

      {lightbox !== null && (
        <div className="fixed inset-0 bg-forest/95 z-[60] flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} aria-label="Zamknij" className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-bg hover:bg-bg/10">
            <Icon.Close className="w-6 h-6"/>
          </button>
          <div className="absolute top-6 left-6 mono-label text-bg/80">
            {lightbox + 1} / {GALLERY.length}
          </div>
          <button onClick={(e) => { e.stopPropagation(); navLightbox(-1); }} className="absolute left-4 md:left-10 text-bg hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1"><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); navLightbox(1); }} className="absolute right-4 md:right-10 text-bg hover:scale-110 transition-transform">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 6l6 6-6 6"/></svg>
          </button>
          <img src={GALLERY[lightbox].src} alt={GALLERY[lightbox].label}
               onClick={(e) => e.stopPropagation()}
               className="max-w-[90vw] max-h-[85vh] object-contain"/>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mono-label text-bg/80">
            {GALLERY[lightbox].label}
          </div>
        </div>
      )}
    </section>
  );
}

// Logo Plocieniczak — wersja inline z pliku Marketing/Logo, fill=currentColor pozwala
// ustawić kolor z zewnątrz (tu: czarny, ten sam co Huck, dla spójności w badge'u).
function LogoPlocieniczak({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 542 79" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M115.91 17.7594C119.421 17.7594 122.423 18.0685 124.897 18.705C127.37 19.3415 129.39 20.4507 130.954 22.0328C132.519 23.633 133.665 25.7606 134.374 28.4156C135.083 31.0705 135.447 34.4347 135.447 38.508V42.2177C135.447 45.8364 135.156 48.9641 134.574 51.5645C133.992 54.1649 132.973 56.3107 131.518 57.9837C130.063 59.6567 128.062 60.9114 125.551 61.7297C123.023 62.548 119.785 62.9663 115.837 62.9663C113.254 62.9663 111.071 62.6571 109.289 62.0207C107.506 61.3842 106.069 60.5841 104.959 59.5839V78.9323H96.2275V38.0898C96.2275 34.1983 96.5914 30.9432 97.3372 28.3246C98.083 25.7242 99.2472 23.633 100.83 22.0691C102.431 20.5053 104.45 19.396 106.924 18.7414C109.398 18.0867 112.381 17.7594 115.91 17.7594ZM115.819 55.8925C118.129 55.8925 119.985 55.7288 121.386 55.4015C122.786 55.0741 123.878 54.4195 124.678 53.4193C125.479 52.4374 125.988 51.0372 126.243 49.2551C126.497 47.473 126.606 45.1272 126.606 42.2177V38.508C126.606 35.4894 126.461 33.089 126.188 31.3069C125.915 29.5248 125.369 28.1428 124.587 27.1972C123.787 26.2334 122.695 25.5969 121.295 25.306C119.894 24.9969 118.075 24.8514 115.819 24.8514C113.564 24.8514 111.817 24.9969 110.38 25.306C108.943 25.6151 107.833 26.2334 106.997 27.1608C106.178 28.0882 105.614 29.4339 105.305 31.1614C104.996 32.889 104.85 35.2166 104.85 38.1261V43.9816C104.85 46.4001 105.014 48.3822 105.341 49.9097C105.669 51.4554 106.251 52.6738 107.069 53.583C107.888 54.4922 109.016 55.1105 110.453 55.4378C111.872 55.7652 113.673 55.9288 115.801 55.9288L115.819 55.8925Z"/>
      <path d="M143.997 0.465942H152.656V61.657H143.997V0.465942Z"/>
      <path d="M181.07 17.7594C184.635 17.7594 187.673 18.0685 190.165 18.705C192.658 19.3415 194.713 20.4325 196.296 21.9964C197.897 23.5603 199.061 25.6515 199.788 28.2519C200.534 30.8523 200.898 34.1437 200.898 38.0898V42.6177C200.898 46.5638 200.534 49.8552 199.788 52.4556C199.043 55.056 197.878 57.1472 196.296 58.7111C194.695 60.2749 192.658 61.3842 190.165 62.0025C187.673 62.6389 184.635 62.9481 181.07 62.9481C177.505 62.9481 174.467 62.6389 171.975 62.0025C169.482 61.366 167.427 60.2749 165.844 58.7111C164.243 57.1472 163.079 55.056 162.333 52.4556C161.587 49.8552 161.224 46.5638 161.224 42.6177V38.0898C161.224 34.1437 161.587 30.8523 162.333 28.2519C163.079 25.6515 164.243 23.5603 165.844 21.9964C167.445 20.4325 169.482 19.3415 171.975 18.705C174.467 18.0685 177.505 17.7594 181.07 17.7594ZM192.112 38.1079C192.112 35.1984 191.966 32.8708 191.657 31.1432C191.348 29.4157 190.802 28.0882 190.002 27.1426C189.201 26.2152 188.092 25.5969 186.673 25.2878C185.236 24.9787 183.38 24.8332 181.07 24.8332C178.76 24.8332 176.904 24.9787 175.467 25.2878C174.03 25.5969 172.92 26.2152 172.138 27.1426C171.338 28.0701 170.792 29.4157 170.483 31.1432C170.174 32.8708 170.028 35.1984 170.028 38.1079V42.6359C170.028 45.5454 170.174 47.8731 170.483 49.6006C170.792 51.3281 171.338 52.6556 172.138 53.6012C172.939 54.5286 174.048 55.1469 175.467 55.456C176.886 55.7652 178.76 55.9106 181.07 55.9106C183.38 55.9106 185.236 55.7652 186.673 55.456C188.092 55.1469 189.22 54.5286 190.002 53.6012C190.802 52.6738 191.348 51.3281 191.657 49.6006C191.966 47.8731 192.112 45.5454 192.112 42.6359V38.1079Z"/>
      <path d="M228.367 26.0698C226.111 26.0698 224.274 26.1971 222.855 26.4335C221.418 26.688 220.308 27.2336 219.471 28.0882C218.653 28.9429 218.089 30.1613 217.78 31.7615C217.47 33.3618 217.325 35.4894 217.325 38.1807V42.545C217.325 45.2363 217.489 47.3821 217.816 48.9641C218.143 50.5644 218.726 51.7827 219.581 52.6374C220.435 53.4921 221.563 54.0376 223 54.2922C224.419 54.5468 226.22 54.6559 228.349 54.6559C231.368 54.6559 233.751 54.6559 235.479 54.6195C237.208 54.6014 238.736 54.5468 240.045 54.4923L238.554 61.657C237.117 61.7115 235.425 61.7479 233.442 61.7843C231.459 61.8206 229.767 61.8206 228.33 61.8206C224.656 61.8206 221.545 61.4933 219.017 60.8387C216.488 60.184 214.451 59.0748 212.886 57.5473C211.322 56.0198 210.194 54.0194 209.503 51.5827C208.811 49.146 208.466 46.1273 208.466 42.5632V38.1989C208.466 34.6347 208.811 31.6161 209.503 29.1793C210.194 26.7426 211.322 24.7423 212.886 23.2148C214.451 21.6873 216.506 20.578 219.017 19.9234C221.545 19.2687 224.638 18.9414 228.33 18.9414C229.931 18.9414 231.75 18.9414 233.806 18.9778C235.861 19.0141 237.881 19.0687 239.863 19.1778L238.372 26.3425C236.116 26.2334 234.224 26.1607 232.696 26.1425C231.15 26.1061 229.695 26.1061 228.33 26.1061L228.367 26.0698Z"/>
      <path d="M258.018 6.46685C258.018 8.39442 257.599 9.77644 256.745 10.6311C255.89 11.4858 254.507 11.904 252.579 11.904C250.651 11.904 249.268 11.4858 248.413 10.6311C247.558 9.77644 247.14 8.39442 247.14 6.46685C247.14 4.53929 247.558 3.15726 248.413 2.30258C249.268 1.44791 250.651 1.02966 252.579 1.02966C254.507 1.02966 255.89 1.44791 256.745 2.30258C257.599 3.15726 258.018 4.53929 258.018 6.46685ZM248.304 19.0688H256.963V61.6389H248.304V19.0688Z"/>
      <path d="M274.171 43.5269C274.171 45.8364 274.298 47.6912 274.535 49.1278C274.79 50.5644 275.281 51.6736 276.026 52.5101C276.772 53.3284 277.791 53.8921 279.119 54.2013C280.429 54.5104 282.193 54.6559 284.394 54.6559H290.452C292.89 54.6559 296.073 54.6013 299.966 54.4922L298.474 61.657C296.764 61.7115 295.309 61.7479 294.108 61.7842C292.908 61.8206 291.78 61.8206 290.779 61.8206H284.394C280.501 61.8206 277.318 61.366 274.88 60.4568C272.443 59.5475 270.515 58.2564 269.114 56.5835C267.713 54.9105 266.767 52.8738 266.276 50.4916C265.785 48.1094 265.53 45.4545 265.53 42.545V37.9261C265.53 34.7983 265.785 31.9797 266.312 29.4884C266.84 26.9972 267.804 24.8696 269.205 23.142C270.606 21.4145 272.552 20.087 275.062 19.1414C277.555 18.214 280.811 17.7412 284.831 17.7412C288.505 17.7412 291.525 18.1595 293.854 19.0141C296.182 19.8688 298.019 21.0144 299.365 22.4692C300.712 23.924 301.639 25.5969 302.131 27.4881C302.622 29.3793 302.876 31.3433 302.876 33.3799V34.6165C302.876 36.5986 302.767 38.1625 302.549 39.3081C302.331 40.4537 301.967 41.363 301.476 41.9812C300.985 42.6177 300.366 43.0178 299.62 43.2178C298.874 43.4178 297.983 43.5088 296.946 43.5088H274.207L274.171 43.5269ZM284.394 24.5786C282.193 24.5786 280.447 24.7423 279.119 25.0696C277.791 25.3969 276.772 26.0152 276.026 26.9244C275.281 27.8336 274.79 29.0884 274.535 30.6704C274.28 32.2707 274.171 34.3255 274.171 36.8532H294.69V34.0528C294.69 32.2343 294.545 30.725 294.236 29.4884C293.926 28.2519 293.381 27.2881 292.58 26.5607C291.78 25.8515 290.725 25.3424 289.415 25.0332C288.105 24.7241 286.414 24.5786 284.394 24.5786Z"/>
      <path d="M311.244 61.657V31.5797C311.244 26.6335 312.772 23.1057 315.81 20.9599C318.866 18.8141 323.614 17.7412 330.108 17.7412C336.603 17.7412 341.35 18.8141 344.407 20.9599C347.463 23.1057 348.972 26.6517 348.972 31.5797V61.6388H340.332V33.3072C340.332 31.9434 340.241 30.725 340.077 29.6885C339.913 28.652 339.495 27.7609 338.84 27.0517C338.185 26.3425 337.167 25.797 335.784 25.4515C334.402 25.0878 332.51 24.9241 330.108 24.9241C327.707 24.9241 325.797 25.106 324.415 25.4515C323.05 25.8152 322.032 26.3425 321.359 27.0517C320.704 27.7609 320.285 28.652 320.122 29.6885C319.958 30.725 319.867 31.9434 319.867 33.3072V61.6388H311.208L311.244 61.657Z"/>
      <path d="M368.255 6.46685C368.255 8.39442 367.837 9.77644 366.982 10.6311C366.127 11.4858 364.744 11.904 362.816 11.904C360.888 11.904 359.505 11.4858 358.65 10.6311C357.795 9.77644 357.377 8.39442 357.377 6.46685C357.377 4.53929 357.795 3.15726 358.65 2.30258C359.505 1.44791 360.888 1.02966 362.816 1.02966C364.744 1.02966 366.127 1.44791 366.982 2.30258C367.837 3.15726 368.255 4.53929 368.255 6.46685ZM358.541 19.0688H367.182V61.6389H358.541V19.0688Z"/>
      <path d="M395.597 26.0698C393.341 26.0698 391.504 26.1971 390.085 26.4335C388.666 26.6699 387.538 27.2336 386.701 28.0882C385.883 28.9429 385.319 30.1613 385.009 31.7615C384.7 33.3618 384.555 35.4894 384.555 38.1807V42.545C384.555 45.2363 384.718 47.3821 385.046 48.9641C385.373 50.5644 385.955 51.7827 386.81 52.6374C387.665 53.4921 388.793 54.0376 390.23 54.2922C391.667 54.5468 393.45 54.6559 395.578 54.6559C398.598 54.6559 400.981 54.6559 402.709 54.6195C404.437 54.6014 405.965 54.5468 407.275 54.4923L405.802 61.657C404.365 61.7115 402.673 61.7479 400.69 61.7843C398.707 61.8206 397.015 61.8206 395.578 61.8206C391.904 61.8206 388.793 61.4933 386.265 60.8387C383.736 60.184 381.699 59.0748 380.134 57.5473C378.57 56.0198 377.442 54.0194 376.751 51.5827C376.059 49.146 375.714 46.1273 375.714 42.5632V38.1989C375.714 34.6347 376.059 31.6161 376.751 29.1793C377.442 26.7426 378.57 24.7423 380.134 23.2148C381.699 21.6873 383.736 20.578 386.265 19.9234C388.793 19.2687 391.886 18.9414 395.578 18.9414C397.179 18.9414 398.998 18.9414 401.054 18.9778C403.109 19.0141 405.129 19.0687 407.111 19.1778L405.638 26.3425C403.382 26.2334 401.49 26.1607 399.944 26.1425C398.398 26.1061 396.943 26.1061 395.578 26.1061L395.597 26.0698Z"/>
      <path d="M424.102 54.4923H450.06L448.569 61.657H413.715V54.9105L438.509 26.2516H413.788L415.279 19.0869H448.805V25.8334L424.084 54.4923H424.102Z"/>
      <path d="M492.718 54.565C492.718 57.2017 492.118 59.0384 490.899 60.0749C489.698 61.1114 487.497 61.6388 484.314 61.6388H471.962C466.196 61.6388 462.066 60.5841 459.556 58.4747C457.064 56.3653 455.809 53.183 455.809 48.9641V47.1457C455.809 42.5268 457.173 39.2354 459.883 37.2715C462.594 35.2893 466.85 34.3074 472.617 34.3074C475.91 34.3074 478.493 34.562 480.366 35.0893C482.24 35.6167 483.604 36.1804 484.478 36.7805V34.3074C484.478 32.9435 484.387 31.7433 484.187 30.725C483.986 29.7067 483.532 28.852 482.786 28.1792C482.04 27.4882 480.967 26.979 479.566 26.6153C478.165 26.2516 476.255 26.0879 473.836 26.0879C471.416 26.0879 469.07 26.0879 466.468 26.1243C463.867 26.1607 461.63 26.197 459.756 26.2516L461.32 19.0869C462.848 19.0323 464.759 18.996 467.014 18.9596C469.27 18.9414 471.544 18.9232 473.854 18.9232C480.494 18.9232 485.314 20.087 488.279 22.4147C491.245 24.7423 492.736 28.1974 492.736 32.7435V54.565H492.718ZM463.885 48.8732C463.885 50.8008 464.468 52.2374 465.614 53.2011C466.76 54.1649 468.888 54.6377 471.962 54.6377H484.478V47.0548C484.478 46.0182 484.368 45.109 484.15 44.3453C483.932 43.5815 483.495 42.9632 482.84 42.4904C482.185 42.0176 481.221 41.6903 479.966 41.4539C478.711 41.2357 477.019 41.1266 474.945 41.1266H473.054C471.235 41.1266 469.743 41.2175 468.56 41.4175C467.378 41.6176 466.45 41.9449 465.759 42.3995C465.068 42.8723 464.595 43.4906 464.322 44.2543C464.049 45.0181 463.904 45.9819 463.904 47.1457V48.8732H463.885Z"/>
      <path d="M510.926 35.7804L528.717 19.0688H539.668L518.985 37.9262L541.797 61.6388H530.427L510.908 41.1266V61.6388H502.268V0.465942H510.908V35.7804H510.926Z"/>
      <path d="M5.14505 42.5632V59.8204C5.14505 60.8205 5.96364 61.6388 6.96414 61.6388H56.6619C57.6624 61.6388 58.481 60.8205 58.481 59.8204V28.9066C58.481 28.4156 58.2809 27.961 57.9535 27.6155L31.3037 0.975106C30.958 0.6296 30.5033 0.447754 30.0121 0.447754H14.8772C13.8767 0.447754 13.0581 1.26606 13.0581 2.26621V12.595C13.0581 13.5952 13.8767 14.4135 14.8772 14.4135H24.2092C24.7003 14.4135 25.1551 14.6135 25.5007 14.9409L43.9646 33.3982C44.3102 33.7437 44.4921 34.1983 44.4921 34.6893V45.8364C44.4921 46.8366 43.6735 47.6549 42.673 47.6549H20.9348C19.9343 47.6549 19.1157 46.8366 19.1157 45.8364V36.7623C19.1157 36.2714 18.9156 35.8168 18.5882 35.4712L11.1481 28.0338C10.4386 27.3246 9.29259 27.3246 8.58314 28.0338L1.27037 35.344C0.560919 36.0532 0.560919 37.1988 1.27037 37.908L4.61751 41.2539C4.96314 41.5994 5.14505 42.0541 5.14505 42.545V42.5632Z"/>
    </svg>
  );
}

// Logo Huck — inline, fill=currentColor; oryginał jest forest green, tu ustawiamy czarny
// przez rodzica (klasa text-ink), żeby oba logotypy partnerów były w jednym kolorze.
function LogoHuck({ className = "", style = {} }) {
  return (
    <svg viewBox="0 0 3177 1013" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={style} aria-hidden="true">
      <path d="M1593.26 283.602V992.642H1409.44V913.266C1366.71 977.086 1292.56 1012.51 1197.09 1012.51C1046.06 1012.51 927.739 907.602 927.739 718.934V283.602H1111.55V696.278C1111.55 792.726 1169.99 842.346 1252.64 842.346C1342.43 842.346 1409.36 789.854 1409.36 666.522V283.602H1593.18H1593.26Z"/>
      <path d="M1724.38 638.114C1724.38 426.791 1883.99 263.73 2100.59 263.73C2240.23 263.73 2361.36 337.443 2419.8 446.655L2261.64 538.795C2233.18 480.639 2171.85 443.783 2099.22 443.783C1989.48 443.783 1908.27 524.595 1908.27 638.035C1908.27 751.475 1989.48 830.851 2099.22 830.851C2173.3 830.851 2234.62 795.431 2263.08 737.275L2422.68 828.059C2361.44 938.627 2240.31 1012.42 2100.67 1012.42C1884.07 1012.42 1724.46 849.359 1724.46 638.035"/>
      <path d="M2962.78 992.64L2703.45 670.748V992.64H2519.55V0H2703.45V595.6L2948.51 283.6H3168L2881.49 633.892L3176.49 992.64H2962.78Z"/>
      <path d="M196.641 0H0V992.64H196.641V488.143L567.158 740.631V992.64H762.356V638.758L196.641 253.206V0Z"/>
      <path d="M567.167 0V270.756L762.366 403.741V0H567.167Z"/>
    </svg>
  );
}

function TurnkeySection() {
  const stages = [
    {
      num: "01",
      icon: Icon.Compass,
      title: "Projekt na miarę",
      body: "Indywidualna aranżacja wnętrz dopasowana do Waszego stylu życia. Projektant prowadzi Was przez kolory, materiały i funkcjonalność każdego pomieszczenia. Otrzymujecie fotorealistyczne wizualizacje przed rozpoczęciem prac.",
    },
    {
      num: "02",
      icon: Icon.Hammer,
      title: "Wykończenie pod klucz",
      body: "Pełne wykończenie zgodne z projektem: podłogi, ściany, łazienki, oświetlenie, drzwi wewnętrzne. Jedna ekipa, jeden harmonogram, jeden kontakt. Żadnego żonglowania podwykonawcami.",
      partner: "huck",
    },
    {
      num: "03",
      icon: Icon.Sofa,
      title: "Meble na wymiar",
      body: (
        <>
          Zabudowa kuchenna, szafy przesuwne, garderoby i meble łazienkowe od{" "}
          <a
            href="https://plocieniczak.pl"
            target="_blank"
            rel="noopener"
            aria-label="Plocieniczak, partner wykończeniowy (otwiera się w nowej karcie)"
            className="underline underline-offset-4 decoration-forest/40 hover:text-forest transition-colors"
          >
            Plocieniczak
          </a>
          {" "}— pracowni z 16+ latami doświadczenia i 2 000 zrealizowanymi projektami.
          Te same ręce, które robiły kuchnie dla Orlen i Nestlé, robią Waszą.
        </>
      ),
      partner: "plocieniczak",
    },
  ];

  const onCta = () => {
    const target = document.getElementById("kontakt");
    if (target) window.scrollTo({ top: target.offsetTop - 40, behavior: "smooth" });
    window.dispatchEvent(new CustomEvent("prefill-contact", { detail: { segment: "Wykończenie pod klucz" } }));
  };

  return (
    <section
      id="pod-klucz"
      aria-labelledby="pod-klucz-heading"
      className="py-24 md:py-40"
      style={{ background: "#EFEBE4" }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="max-w-3xl mb-14 md:mb-20">
          <Reveal><div className="mono-label text-muted mb-6">PAKIET PREMIUM · OPCJONALNIE</div></Reveal>
          <Reveal delay={100}>
            <h2 id="pod-klucz-heading" className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Wprowadź się <span className="accent-sage">z walizkami.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 text-muted leading-relaxed max-w-2xl" style={{ fontSize: 18 }}>
              Zostawiacie projekt, wykończenie i meble nam. Dostajesz dom gotowy do życia od pierwszego dnia.
            </p>
          </Reveal>
        </div>

        {/* 3 etapy — desktop: 3 kolumny obok siebie, mobile: 1 kolumna z numerem po lewej, content po prawej */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-14 md:mb-20">
          {stages.map((s, i) => {
            const IconComp = s.icon;
            return (
              <Reveal key={s.num} delay={i * 120}>
                <div className="group bg-bg border hairline p-7 md:p-9 h-full flex flex-col">
                  {/* Mobile: numer po lewej, ikona po prawej. Na tablet+ tak samo. */}
                  <div className="flex items-start justify-between mb-7">
                    <span className="mono-label accent-sage" style={{ letterSpacing: "0.24em" }}>{s.num}</span>
                    <IconComp aria-hidden="true" className="w-6 h-6 text-forest transition-transform duration-200 group-hover:-translate-y-0.5"/>
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl leading-tight">{s.title}</h3>
                  <p className="mt-4 text-muted leading-relaxed" style={{ fontSize: 17 }}>{s.body}</p>
                  {s.partner && (
                    <div className="mt-auto pt-7">
                      {/* Logo na górze, "PARTNER WYKOŃCZENIOWY" pod spodem — jednolicie dla obu partnerów */}
                      <div className="pt-6 border-t hairline flex flex-col items-start gap-2">
                        {s.partner === "plocieniczak" && (
                          <LogoPlocieniczak className="text-ink" style={{ height: 16, width: "auto" }}/>
                        )}
                        {s.partner === "huck" && (
                          <LogoHuck className="text-ink" style={{ height: 20, width: "auto" }}/>
                        )}
                        <span className="mono-label text-muted" style={{ opacity: 0.7 }}>
                          PARTNER WYKOŃCZENIOWY
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Info box: jak to działa / dla kogo */}
        <Reveal>
          <div className="border hairline bg-bg p-7 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <div>
              <h3 className="font-display text-2xl md:text-3xl leading-tight mb-6">Jak to działa</h3>
              <ul className="space-y-3 text-muted leading-relaxed">
                {[
                  "Dodatkowa opłata do ceny segmentu — wycena indywidualna po spotkaniu",
                  "Czas realizacji: 3–4 miesiące po odbiorze stanu deweloperskiego",
                  "Stały kontakt z project managerem",
                  "Gwarancja jakości na wszystkie prace i meble — 24 miesiące",
                  "Możliwość rozliczenia etapami",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <span aria-hidden="true" className="flex-shrink-0 block w-1.5 h-1.5 rounded-full bg-ink/60" style={{ marginTop: "0.65em" }}/>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-display text-2xl md:text-3xl leading-tight mb-6">Dla kogo</h3>
              <p className="text-muted leading-relaxed">
                Dla rodzin, które chcą skupić się na pracy i życiu, a nie na zarządzaniu remontem.
                Dla inwestorów pod wynajem — dostajesz gotowe mieszkanie do wystawienia od następnego dnia po odbiorze.
                Dla osób z zagranicy kupujących na odległość.
              </p>
            </div>
          </div>
        </Reveal>

        {/* CTA secondary — główny CTA strony to umówienie oglądania; tu oferujemy rozmowę o pakiecie */}
        <Reveal delay={100}>
          <div className="mt-10 md:mt-12 flex justify-center">
            <GhostBtn onClick={onCta}>Porozmawiaj o pakiecie</GhostBtn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

Object.assign(window, { PlotSection, LocationSection, GallerySection, TurnkeySection });
