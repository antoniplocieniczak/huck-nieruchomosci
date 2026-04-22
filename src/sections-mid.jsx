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
          <div ref={containerRef} className="relative" onMouseMove={onMouseMove}>
            <PlotIsometric filter={filter} onSelect={onSelect} hoverId={hoverId} setHoverId={setHoverId}/>
            {hoverSeg && tooltipPos && (
              <SegmentTooltip seg={hoverSeg} x={tooltipPos.x} y={tooltipPos.y}/>
            )}
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
    <section id="galeria" className="py-24 md:py-40 bg-[#EAE3D6]">
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
          <div className="aspect-[21/9] w-full overflow-hidden relative">
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

Object.assign(window, { PlotSection, LocationSection, GallerySection });
