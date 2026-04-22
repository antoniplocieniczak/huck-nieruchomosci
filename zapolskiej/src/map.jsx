// Interaktywna mapa Mapbox GL JS dla sekcji Lokalizacja.
// Ładowana leniwie (SDK + CSS dociągane dynamicznie przy pierwszym renderze).
// Konsumuje POIS + POI_CATS + INVESTMENT_LOCATION z data.jsx, token z config.jsx.
//
// Obsługuje: fit-bounds do pary (osiedle + POI), rysowanie trasy przez Mapbox
// Directions API (profil walking/driving dobierany z pola unit w poi.time),
// panel info z dystansem/czasem, cache odpowiedzi, debounce, fallback do
// dystansu haversine'a przy błędzie API.

const MAPBOX_VERSION = "3.8.0";
const MAP_STYLE = "mapbox://styles/mapbox/light-v11"; // TODO: można podmienić na custom style z Mapbox Studio
const ROUTE_FIT_PADDING = { top: 80, right: 80, bottom: 200, left: 80 };
const DIRECTIONS_DEBOUNCE_MS = 300;

// --- Helpery ------------------------------------------------------------

function loadMapboxSdk() {
  if (window.mapboxgl) return Promise.resolve(window.mapboxgl);
  if (window.__mapboxLoading) return window.__mapboxLoading;
  window.__mapboxLoading = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-mapbox-css]')) {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.css`;
      css.setAttribute("data-mapbox-css", "1");
      document.head.appendChild(css);
    }
    const s = document.createElement("script");
    s.src = `https://api.mapbox.com/mapbox-gl-js/v${MAPBOX_VERSION}/mapbox-gl.js`;
    s.async = true;
    s.onload = () => resolve(window.mapboxgl);
    s.onerror = () => reject(new Error("Nie udało się załadować Mapbox GL JS"));
    document.head.appendChild(s);
  });
  return window.__mapboxLoading;
}

// Dystans w metrach pomiędzy dwoma punktami WGS84 (haversine). Służy do fallbacku,
// gdy Directions API zwróci błąd - pokazujemy wtedy odległość w linii prostej.
function haversineMeters(a, b) {
  const toRad = (d) => d * Math.PI / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const c = s1 * s1 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(c));
}

function formatDistance(meters) {
  if (meters == null || !isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

function formatDuration(seconds) {
  if (seconds == null || !isFinite(seconds)) return "—";
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}

// Profil Directions wywnioskowany z pola poi.time (np. "4 min pieszo" / "3 min autem").
function inferProfile(poi) {
  const t = (poi && poi.time) || "";
  if (/pieszo/i.test(t)) return "walking";
  return "driving";
}

function ensureMapStyles() {
  if (document.getElementById("namyslow-map-styles")) return;
  const s = document.createElement("style");
  s.id = "namyslow-map-styles";
  s.textContent = `
    .nm-marker {
      cursor: pointer;
      position: relative;
      transition: transform 200ms ease, opacity 200ms ease;
      outline: none;
    }
    .nm-marker:focus-visible { outline: 2px solid #B8C5AB; outline-offset: 3px; border-radius: 50%; }
    .nm-poi {
      width: 14px; height: 14px; border-radius: 50%;
      border: 2px solid rgba(0,0,0,0.1);
      background: #2D3B2E;
      transition: transform 180ms ease, border-color 180ms ease, border-width 180ms ease, opacity 200ms ease;
    }
    .nm-poi.dim { opacity: 0.2; pointer-events: none; }
    .nm-poi.highlight { transform: scale(1.4); border-width: 3px; border-color: rgba(0,0,0,0.25); }
    .nm-home {
      width: 28px; height: 28px; border-radius: 50%;
      background: #2D3B2E;
      border: 4px solid #F5F2ED;
      box-sizing: border-box;
      box-shadow: 0 0 0 0 rgba(45,59,46,0.45);
      animation: nm-home-pulse 2s ease-out infinite;
      position: relative;
    }
    @keyframes nm-home-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(45,59,46,0.55); transform: scale(1); }
      70%  { box-shadow: 0 0 0 18px rgba(45,59,46,0); transform: scale(1.05); }
      100% { box-shadow: 0 0 0 0 rgba(45,59,46,0); transform: scale(1); }
    }
    .mapboxgl-popup.nm-popup .mapboxgl-popup-tip { display: none; }
    .mapboxgl-popup.nm-popup .mapboxgl-popup-content {
      background: #fff;
      color: #1A1A1A;
      border-radius: 4px;
      padding: 10px 14px;
      box-shadow: 0 4px 18px rgba(26,26,26,0.14);
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      line-height: 1.5;
    }
    .nm-popup-name { font-weight: 500; color: #1A1A1A; }
    .nm-popup-time { color: #564F3F; margin-top: 2px; letter-spacing: 0.06em; text-transform: none; font-size: 11px; }
    .mapboxgl-ctrl-group { box-shadow: 0 2px 8px rgba(26,26,26,0.1) !important; border-radius: 0 !important; }
    .mapboxgl-ctrl-group button { border-radius: 0 !important; }
    @media (hover: none) {
      .nm-marker:hover .nm-poi { transform: none; }
    }

    /* Panel informacji o trasie */
    .nm-route-panel {
      position: absolute;
      left: 20px; right: 20px; bottom: 20px;
      max-width: 500px;
      margin: 0 auto;
      background: rgba(255,255,255,0.92);
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 14px 18px;
      display: flex; align-items: center; gap: 14px;
      opacity: 0; transform: translateY(6px);
      transition: opacity 200ms ease, transform 200ms ease;
      pointer-events: none;
      z-index: 5;
    }
    .nm-route-panel.open { opacity: 1; transform: translateY(0); pointer-events: auto; }
    .nm-route-mode {
      width: 32px; height: 32px; border-radius: 50%;
      background: #F4EFE9;
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .nm-route-mode svg { width: 18px; height: 18px; stroke: #303C30; }
    .nm-route-name {
      font-family: 'Clash Display', Georgia, sans-serif;
      font-weight: 600;
      color: #1A1A1A;
      font-size: 15px;
      line-height: 1.2;
    }
    .nm-route-sub {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 11px;
      letter-spacing: 0.08em;
      color: #564F3F;
      margin-top: 2px;
    }
    .nm-route-stats {
      margin-left: auto;
      display: flex; gap: 16px;
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 12px;
      color: #1A1A1A;
    }
    .nm-route-stats .lbl { color: #564F3F; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; display: block; }
    .nm-route-close {
      appearance: none; background: transparent; border: 0; padding: 6px;
      color: #564F3F; cursor: pointer; flex-shrink: 0;
      border-radius: 4px;
    }
    .nm-route-close:hover { color: #1A1A1A; background: rgba(0,0,0,0.04); }
    .nm-route-close:focus-visible { outline: 2px solid #B8C5AB; outline-offset: 2px; }

    @media (max-width: 1023px) {
      .nm-route-panel { max-width: 400px; }
    }
    @media (max-width: 767px) {
      .nm-route-panel {
        left: 16px; right: 16px; bottom: 12px;
        max-width: none;
        flex-wrap: wrap;
        padding: 12px 14px;
        gap: 10px;
      }
      .nm-route-stats { margin-left: 0; width: 100%; justify-content: flex-start; order: 3; gap: 20px; }
      .nm-route-close { order: 2; margin-left: auto; }
    }
  `;
  document.head.appendChild(s);
}

// Placeholder tej samej wysokości co mapa - zapobiega layout shiftowi.
function MapPlaceholder({ tall }) {
  return (
    <div
      className={`w-full ${tall || ""} flex items-center justify-center`}
      style={{ background: "#E5DFD6" }}
      aria-hidden="true"
    >
      <span className="mono-label text-muted">ŁADOWANIE MAPY…</span>
    </div>
  );
}

// Ikony (inline SVG, styl Lucide)
function IconFootprints(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 16v-2.4C4 12.1 5.1 11 6.5 11S9 12.1 9 13.6V16a2 2 0 0 1-4 0 1 1 0 0 0-1-1"/>
      <path d="M4 16c0 1.3 1 2.5 2.5 2.5h.4"/>
      <path d="M15 9v2.4c0 1.5 1.1 2.6 2.5 2.6S20 12.9 20 11.4V9a2 2 0 0 0-4 0 1 1 0 0 1-1 1"/>
      <path d="M20 9c0-1.3-1-2.5-2.5-2.5H17"/>
    </svg>
  );
}
function IconCar(p) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M19 17h2v-5l-2-4H5L3 12v5h2"/>
      <path d="M5 17h14"/>
      <circle cx="7" cy="17" r="2"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  );
}

// --- Komponent mapy -----------------------------------------------------

function NamyslowMap({ activeCategories, hoverPoi, onHoverPoi, onApiReady, heightClass }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({}); // klucz: nazwa POI lub "__home"
  const popupRef = useRef(null);
  const routeCacheRef = useRef({}); // klucz `${poi.name}-${profile}` → { geometry, distance, duration }
  const debounceRef = useRef(null);
  const selectPoiRef = useRef(null); // stabilny wskaźnik dla handlerów markerów
  const resetRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  // route schemat: { poi, profile, loading, distance, duration, isFallback }

  // Dodaje / zastępuje warstwę trasy na mapie. geom to tablica współrzędnych [[lng,lat], ...]
  // lub null (dla stanu loading/error rysujemy prostą linię między osiedlem a POI).
  const drawRoute = useCallback((map, poi, geom, { dashed, color } = {}) => {
    if (!map || !map.isStyleLoaded()) return;
    const mapboxgl = window.mapboxgl;
    const coords = geom && geom.length >= 2
      ? geom
      : [[INVESTMENT_LOCATION.lng, INVESTMENT_LOCATION.lat], [poi.lng, poi.lat]];

    const feature = {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: coords },
    };

    if (map.getSource("route")) {
      map.getSource("route").setData(feature);
      if (map.getLayer("route-line")) {
        map.setPaintProperty("route-line", "line-color", color);
        if (dashed) {
          map.setPaintProperty("route-line", "line-dasharray", Array.isArray(dashed) ? dashed : [2, 2]);
        } else {
          // reset do ciągłej linii
          map.setPaintProperty("route-line", "line-dasharray", [1, 0]);
        }
      }
    } else {
      map.addSource("route", { type: "geojson", data: feature });
      const paint = {
        "line-color": color,
        "line-width": 4,
        "line-opacity": 0.85,
      };
      if (dashed) paint["line-dasharray"] = Array.isArray(dashed) ? dashed : [2, 2];
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint,
      });
    }
  }, []);

  const removeRoute = useCallback((map) => {
    if (!map) return;
    if (map.getLayer("route-line")) map.removeLayer("route-line");
    if (map.getSource("route")) map.removeSource("route");
  }, []);

  const fitBounds = useCallback((map, lngLatArray, opts = {}) => {
    if (!map || !window.mapboxgl) return;
    const bounds = new window.mapboxgl.LngLatBounds();
    lngLatArray.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, {
      padding: opts.padding || ROUTE_FIT_PADDING,
      duration: opts.duration || 1200,
      maxZoom: opts.maxZoom || 15,
      essential: true,
      easing: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, // ease-in-out
    });
  }, []);

  // Reset do widoku "wszystkie POI + osiedle" i zamknięcie panelu/trasy.
  const resetRoute = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      removeRoute(map);
      const all = [
        [INVESTMENT_LOCATION.lng, INVESTMENT_LOCATION.lat],
        ...POIS.map((p) => [p.lng, p.lat]),
      ];
      fitBounds(map, all, { padding: { top: 60, right: 60, bottom: 60, left: 60 }, maxZoom: 14, duration: 1000 });
    }
    setRoute(null);
  }, [fitBounds, removeRoute]);

  // Fetch trasy przez Mapbox Directions API. Zwraca obiekt z geometrią/dystans/czas
  // lub null przy błędzie. Cache'owane w routeCacheRef.
  const fetchDirections = useCallback(async (poi, profile) => {
    const key = `${poi.name}-${profile}`;
    if (routeCacheRef.current[key]) return routeCacheRef.current[key];
    const token = window.MAPBOX_TOKEN;
    const coords = `${INVESTMENT_LOCATION.lng},${INVESTMENT_LOCATION.lat};${poi.lng},${poi.lat}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coords}?geometries=geojson&overview=full&access_token=${token}`;
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`Directions HTTP ${r.status}`);
      const j = await r.json();
      const route = j && j.routes && j.routes[0];
      if (!route) throw new Error("Brak trasy w odpowiedzi");
      const out = {
        geometry: route.geometry.coordinates,
        distance: route.distance,
        duration: route.duration,
      };
      routeCacheRef.current[key] = out;
      return out;
    } catch (e) {
      console.warn("[map] Directions error", e);
      return null;
    }
  }, []);

  // Główny handler wyboru POI - wywoływany z markera na mapie lub z listy POI
  // przez window-level API. Zawsze fituje bounds natychmiast (responsywność),
  // fetch do Directions jest debouncowany 300ms.
  const selectPoi = useCallback((poi) => {
    const map = mapRef.current;
    if (!map || !poi || poi.lng == null) return;

    const profile = inferProfile(poi);
    const color = (POI_CATS[poi.cat] && POI_CATS[poi.cat].color) || "#303C30";

    // 1. Fit bounds natychmiast (osiedle + POI).
    fitBounds(map, [
      [INVESTMENT_LOCATION.lng, INVESTMENT_LOCATION.lat],
      [poi.lng, poi.lat],
    ], { padding: ROUTE_FIT_PADDING, maxZoom: 16 });

    // 2. Od razu narysuj wstępną linię prostą (żeby dać feedback; zostanie podmieniona
    //    przez prawdziwą trasę gdy przyjdzie odpowiedź).
    drawRoute(map, poi, null, { dashed: [2, 2], color });

    // 3. Ustaw stan panelu w trybie "loading".
    setRoute({ poi, profile, loading: true, distance: null, duration: null, isFallback: false });

    // 4. Debounce fetch - kasuje poprzedni pending request.
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const result = await fetchDirections(poi, profile);
      const freshMap = mapRef.current;
      if (!freshMap) return;
      if (result) {
        drawRoute(freshMap, poi, result.geometry, {
          dashed: profile === "walking" ? [2, 2] : null,
          color,
        });
        setRoute({
          poi, profile, loading: false,
          distance: result.distance,
          duration: result.duration,
          isFallback: false,
        });
      } else {
        // Fallback: odległość haversine + szara przerywana linia prosta.
        const d = haversineMeters(INVESTMENT_LOCATION, { lng: poi.lng, lat: poi.lat });
        drawRoute(freshMap, poi, null, { dashed: [4, 4], color: "#6B6358" });
        setRoute({
          poi, profile, loading: false,
          distance: d, duration: null, isFallback: true,
        });
      }
    }, DIRECTIONS_DEBOUNCE_MS);
  }, [drawRoute, fetchDirections, fitBounds]);

  // Refy trzymają aktualne wersje handlerów - używamy ich z addEventListener w markerach
  // (markery tworzymy raz w useEffect[], więc closure musi czytać z refa żeby widzieć nowy stan).
  useEffect(() => { selectPoiRef.current = selectPoi; });
  useEffect(() => { resetRef.current = resetRoute; });

  // Inicjalizacja mapy - raz.
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const token = window.MAPBOX_TOKEN;
    if (!token) {
      setError("Brak tokenu Mapbox (src/config.jsx).");
      return;
    }

    ensureMapStyles();

    let cancelled = false;
    let map;

    loadMapboxSdk().then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.accessToken = token;

      map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [INVESTMENT_LOCATION.lng, INVESTMENT_LOCATION.lat],
        zoom: 14,
        minZoom: 12,
        maxZoom: 17,
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        attributionControl: true,
        preserveDrawingBuffer: true, // stabilny screenshot/preview; minimalny koszt wydajności
      });
      map.touchZoomRotate.disableRotation();
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false, visualizePitch: false }), "top-right");

      mapRef.current = map;

      map.on("load", () => {
        if (cancelled) return;

        // Główny marker (inwestycja). Click = reset trasy / widoku.
        const homeEl = document.createElement("div");
        homeEl.className = "nm-marker";
        homeEl.setAttribute("role", "button");
        homeEl.setAttribute("tabindex", "0");
        homeEl.setAttribute("aria-label", `${INVESTMENT_LOCATION.name} - kliknij żeby wyśrodkować na wszystkich POI`);
        const homeDot = document.createElement("div");
        homeDot.className = "nm-home";
        homeEl.appendChild(homeDot);
        const homeMarker = new mapboxgl.Marker({ element: homeEl, anchor: "center" })
          .setLngLat([INVESTMENT_LOCATION.lng, INVESTMENT_LOCATION.lat])
          .addTo(map);
        const homeClick = (e) => {
          if (e) { e.stopPropagation && e.stopPropagation(); }
          if (resetRef.current) resetRef.current();
        };
        homeEl.addEventListener("click", homeClick);
        homeEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); homeClick(e); }
        });
        markersRef.current.__home = { marker: homeMarker, el: homeEl, dotEl: homeDot, poi: null };

        // Markery POI
        POIS.forEach((poi) => {
          const color = (POI_CATS[poi.cat] && POI_CATS[poi.cat].color) || "#2D3B2E";
          const el = document.createElement("div");
          el.className = "nm-marker";
          el.setAttribute("role", "button");
          el.setAttribute("tabindex", "0");
          el.setAttribute("aria-label", `${poi.name}, ${poi.time}`);
          el.dataset.cat = poi.cat;
          el.dataset.name = poi.name;

          const dot = document.createElement("div");
          dot.className = "nm-poi";
          dot.style.background = color;
          el.appendChild(dot);

          const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat([poi.lng, poi.lat])
            .addTo(map);

          const showPopup = () => {
            if (popupRef.current) popupRef.current.remove();
            popupRef.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 14,
              anchor: "bottom",
              className: "nm-popup",
            })
              .setLngLat([poi.lng, poi.lat])
              .setHTML(`<div class="nm-popup-name">${poi.name}</div><div class="nm-popup-time">${poi.time}</div>`)
              .addTo(map);
          };
          const hidePopup = () => {
            if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
          };

          el.addEventListener("mouseenter", () => { showPopup(); onHoverPoi && onHoverPoi(poi.name); });
          el.addEventListener("mouseleave", () => { hidePopup(); onHoverPoi && onHoverPoi(null); });
          el.addEventListener("focus", showPopup);
          el.addEventListener("blur", hidePopup);

          const handleActivate = (e) => {
            if (e) { e.stopPropagation && e.stopPropagation(); }
            if (selectPoiRef.current) selectPoiRef.current(poi);
          };
          el.addEventListener("click", handleActivate);
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleActivate(e); }
          });

          markersRef.current[poi.name] = { marker, el, dotEl: dot, poi };
        });

        setReady(true);

        // Zewnętrzny interfejs dla LocationSection.
        if (onApiReady) {
          onApiReady({
            selectPoi: (poi) => selectPoiRef.current && selectPoiRef.current(poi),
            reset: () => resetRef.current && resetRef.current(),
          });
        }
      });

      map.on("error", (e) => {
        if (e && e.error && /token/i.test(e.error.message || "")) {
          setError("Błąd tokenu Mapbox - sprawdź URL restrictions.");
        }
      });
    }).catch((err) => {
      if (!cancelled) setError(String(err && err.message || err));
    });

    return () => {
      cancelled = true;
      if (debounceRef.current) { clearTimeout(debounceRef.current); debounceRef.current = null; }
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      Object.values(markersRef.current).forEach((m) => { try { m.marker.remove(); } catch (_) {} });
      markersRef.current = {};
      if (mapRef.current) { try { mapRef.current.remove(); } catch (_) {} mapRef.current = null; }
    };
  }, []);

  // Escape zamyka panel trasy.
  useEffect(() => {
    if (!route) return;
    const onKey = (e) => { if (e.key === "Escape") resetRoute(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route, resetRoute]);

  // Reakcja na zmianę filtrów.
  useEffect(() => {
    if (!ready) return;
    const active = activeCategories && activeCategories.size > 0 ? activeCategories : null;
    Object.entries(markersRef.current).forEach(([key, m]) => {
      if (key === "__home" || !m.dotEl) return;
      const dim = active && !active.has(m.poi.cat);
      m.dotEl.classList.toggle("dim", !!dim);
    });
  }, [activeCategories, ready]);

  // Reakcja na hover POI z listy po prawej.
  useEffect(() => {
    if (!ready) return;
    Object.entries(markersRef.current).forEach(([key, m]) => {
      if (key === "__home" || !m.dotEl) return;
      m.dotEl.classList.toggle("highlight", hoverPoi === key);
    });
  }, [hoverPoi, ready]);

  // Panel JSX
  const panelOpen = !!route;
  const modeIcon = route && route.profile === "walking" ? <IconFootprints/> : <IconCar/>;
  const modeLabel = route && route.profile === "walking" ? "pieszo" : "autem";

  return (
    <div
      className={`relative w-full ${heightClass || "h-[600px]"}`}
      aria-label="Interaktywna mapa Namysłowa z zaznaczonymi punktami użyteczności publicznej w okolicy osiedla"
      role="region"
    >
      <div ref={containerRef} className="w-full h-full" style={{ background: "#E5DFD6" }}/>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#E5DFD6] text-muted mono-label p-6 text-center">
          {error}
        </div>
      )}

      <div
        className={`nm-route-panel ${panelOpen ? "open" : ""}`}
        role="region"
        aria-live="polite"
        aria-label={route ? `Trasa do ${route.poi.name}` : "Panel informacji o trasie"}
      >
        <span className="nm-route-mode" aria-hidden="true">{modeIcon}</span>
        <div className="min-w-0 flex-1">
          <div className="nm-route-name truncate">{route ? route.poi.name : ""}</div>
          <div className="nm-route-sub">{modeLabel}{route && route.isFallback ? " · w linii prostej" : ""}</div>
        </div>
        <div className="nm-route-stats">
          <div>
            <span className="lbl">Dystans</span>
            <span>{route ? (route.loading ? "…" : formatDistance(route.distance)) : "—"}</span>
          </div>
          <div>
            <span className="lbl">Czas</span>
            <span>{route ? (route.loading ? "Obliczam…" : (route.isFallback ? "—" : formatDuration(route.duration))) : "—"}</span>
          </div>
        </div>
        <button
          type="button"
          className="nm-route-close"
          onClick={resetRoute}
          aria-label="Zamknij informacje o trasie"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { NamyslowMap, MapPlaceholder });
