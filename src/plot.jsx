// Interactive site plan — 2D top-down + isometric variants
// 16 segments arranged as 8 buildings (each building = 2 mirrored segments A/B)
// Layout: 2 rows of 4 buildings, with central driveway between them

// Building positions: returns [x, y] in a 1200x700 viewBox for 2D, and iso-projected for 3D
const BUILDINGS = [
  { id: 1, row: 0, col: 0 },
  { id: 2, row: 0, col: 1 },
  { id: 3, row: 0, col: 2 },
  { id: 4, row: 0, col: 3 },
  { id: 5, row: 1, col: 0 },
  { id: 6, row: 1, col: 1 },
  { id: 7, row: 1, col: 2 },
  { id: 8, row: 1, col: 3 },
];

function PlotTopDown({ filter, onSelect, hoverId, setHoverId }) {
  // viewBox 1200 x 720
  // Each building = 200 wide x 120 tall, 2 segments A (left) and B (right)
  // Row 0: y = 110, Row 1: y = 490; spacing between buildings x
  const W = 1200, H = 720;
  const bw = 200, bh = 120, gap = 50;
  const rowY = [130, 470];
  const startX = 80;

  const getBuildingPos = (b) => [startX + b.col * (bw + gap), rowY[b.row]];

  const segMap = Object.fromEntries(SEGMENTS.map(s => [s.id, s]));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <defs>
        <pattern id="grass" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#EDE7DC"/>
          <circle cx="2" cy="3" r="0.6" fill="#D5CCBB"/>
          <circle cx="7" cy="6" r="0.6" fill="#D5CCBB"/>
        </pattern>
        <pattern id="road" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#E5DFD6"/>
        </pattern>
      </defs>

      {/* Background plot */}
      <rect x="0" y="0" width={W} height={H} fill="url(#grass)"/>

      {/* Trees / park border */}
      {Array.from({length: 22}).map((_,i) => (
        <circle key={`t1-${i}`} cx={30 + i*55} cy={30} r={14 + (i%3)*2} fill="#C7BFAE" opacity="0.5"/>
      ))}
      {Array.from({length: 22}).map((_,i) => (
        <circle key={`t2-${i}`} cx={30 + i*55} cy={H-30} r={14 + (i%3)*2} fill="#C7BFAE" opacity="0.5"/>
      ))}

      {/* Central driveway */}
      <rect x="40" y="290" width={W-80} height="130" fill="url(#road)"/>
      <line x1="60" y1="355" x2={W-60} y2="355" stroke="#F5F2ED" strokeWidth="1" strokeDasharray="8 10"/>

      {/* Entrance gate marker */}
      <g transform={`translate(${W-40}, 355)`}>
        <circle r="12" fill="#2D3B2E"/>
        <text y="4" textAnchor="middle" fill="#F5F2ED" fontSize="11" fontFamily="JetBrains Mono" fontWeight="600">IN</text>
      </g>

      {/* North arrow */}
      <g transform="translate(60, 60)">
        <circle r="22" fill="none" stroke="#1A1A1A" strokeWidth="1" opacity="0.3"/>
        <path d="M0,-14 L6,6 L0,2 L-6,6 Z" fill="#1A1A1A" opacity="0.6"/>
        <text y="36" textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" letterSpacing="2" fill="#1A1A1A" opacity="0.6">N</text>
      </g>

      {/* Buildings */}
      {BUILDINGS.map(b => {
        const [x, y] = getBuildingPos(b);
        const segA = segMap[`${b.id}A`];
        const segB = segMap[`${b.id}B`];
        // Row 0 segments face south (garden on south = bottom), garden shown below building
        // Row 1 segments face north, garden shown above building
        const isRow0 = b.row === 0;
        const gardenY = isRow0 ? y + bh + 6 : y - 70;
        return (
          <g key={b.id}>
            {/* Gardens (plots) */}
            <rect x={x-10} y={gardenY} width={bw/2 + 5} height={64} fill="#DDE6CC" stroke="#C7D1B5" strokeWidth="0.5"/>
            <rect x={x + bw/2 + 5} y={gardenY} width={bw/2 + 5} height={64} fill="#DDE6CC" stroke="#C7D1B5" strokeWidth="0.5"/>

            {/* Driveways/garages (small squares facing road) */}
            <rect x={x + 30} y={isRow0 ? y - 24 : y + bh + 6} width="30" height="22" fill="#E5DFD6" stroke="#C7BFAE" strokeWidth="0.5"/>
            <rect x={x + bw - 60} y={isRow0 ? y - 24 : y + bh + 6} width="30" height="22" fill="#E5DFD6" stroke="#C7BFAE" strokeWidth="0.5"/>

            {/* Building halves — segment A (left) + segment B (right) */}
            {[segA, segB].map((seg, idx) => {
              if (!seg) return null;
              const active = !filter || filter === "all" || filter === seg.status;
              const meta = STATUS[seg.status];
              const sx = x + idx * (bw/2);
              const isHover = hoverId === seg.id;
              return (
                <g
                  key={seg.id}
                  className="plot-seg cursor-pointer"
                  opacity={active ? 1 : 0.25}
                  onMouseEnter={() => setHoverId(seg.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => active && onSelect(seg)}
                >
                  <rect
                    x={sx}
                    y={y}
                    width={bw/2}
                    height={bh}
                    fill={meta.color}
                    opacity={isHover ? 1 : 0.92}
                    stroke={isHover ? "#1A1A1A" : "#F5F2ED"}
                    strokeWidth={isHover ? 2 : 1.5}
                  />
                  {/* Roof ridge */}
                  <line x1={x + bw/2} y1={y} x2={x + bw/2} y2={y + bh} stroke="#F5F2ED" strokeWidth="2" opacity="0.9"/>
                  {/* Roof chevron */}
                  <path
                    d={`M${sx + 10} ${y + bh/2} L${sx + bw/4} ${y + 10} L${sx + bw/2 - 10} ${y + bh/2}`}
                    fill="none" stroke="#F5F2ED" strokeWidth="1" opacity="0.35"
                  />
                  {/* Segment label */}
                  <text
                    x={sx + bw/4}
                    y={y + bh/2 + 5}
                    textAnchor="middle"
                    fill="#F5F2ED"
                    fontSize="14"
                    fontFamily="JetBrains Mono"
                    fontWeight="600"
                    letterSpacing="1"
                  >{seg.id}</text>
                </g>
              );
            })}

            {/* Building number above */}
            <text
              x={x + bw/2}
              y={isRow0 ? y - 38 : y + bh + 90}
              textAnchor="middle"
              fill="#1A1A1A"
              opacity="0.4"
              fontSize="10"
              fontFamily="JetBrains Mono"
              letterSpacing="3"
            >BUDYNEK {String(b.id).padStart(2,"0")}</text>
          </g>
        );
      })}

      {/* Scale + legend inside plot */}
      <g transform={`translate(80, ${H - 50})`}>
        <line x1="0" y1="0" x2="60" y2="0" stroke="#1A1A1A" strokeWidth="1" opacity="0.5"/>
        <line x1="0" y1="-4" x2="0" y2="4" stroke="#1A1A1A" strokeWidth="1" opacity="0.5"/>
        <line x1="60" y1="-4" x2="60" y2="4" stroke="#1A1A1A" strokeWidth="1" opacity="0.5"/>
        <text x="30" y="18" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" letterSpacing="2" fill="#1A1A1A" opacity="0.5">10 M</text>
      </g>
    </svg>
  );
}

function PlotIsometric({ filter, onSelect, hoverId, setHoverId }) {
  // ViewBox rozszerzony tak, by 4 budynki w rzędzie + ogrody zmieściły się
  // bez obcinania z prawej/dolnej strony (iso rzut generuje szeroki, średnio-wysoki
  // obrys — buildings sięgają ~760 px w poziomie i ~830 px w pionie).
  const W = 1520, H = 900;
  // Isometric projection: angle 30°
  // For each building at (col, row), convert grid to iso
  // Each grid cell = 180 wide x 180 deep in world
  const cellX = 180, cellY = 180;
  const iso = (wx, wy) => {
    const sx = (wx - wy) * 0.866; // cos(30)
    const sy = (wx + wy) * 0.5;
    return [sx, sy];
  };

  const segMap = Object.fromEntries(SEGMENTS.map(s => [s.id, s]));
  // Origin offset — przesuwamy całość trochę w prawo, ale zostawiamy zapas z obu stron
  const ox = 740, oy = 160;

  const drawBuilding = (b) => {
    const segA = segMap[`${b.id}A`];
    const segB = segMap[`${b.id}B`];
    // World position: col spacing and row spacing with a gap for central road
    const wx = b.col * 240;
    const wy = b.row * 360 + (b.row === 1 ? 60 : 0);
    const [bx, by] = iso(wx, wy);
    const footprint = 160; // building width in world
    const depth = 90;
    const height = 85;

    // Compute 3D box corners
    // Building box: from (wx, wy) to (wx+footprint, wy+depth)
    const corners = {
      blf: iso(wx, wy + depth),
      brf: iso(wx + footprint, wy + depth),
      blb: iso(wx, wy),
      brb: iso(wx + footprint, wy),
    };
    const top = {
      blf: [corners.blf[0], corners.blf[1] - height],
      brf: [corners.brf[0], corners.brf[1] - height],
      blb: [corners.blb[0], corners.blb[1] - height],
      brb: [corners.brb[0], corners.brb[1] - height],
    };
    // Roof peak along center of building length
    const roofPeakFront = iso(wx + footprint/2, wy + depth);
    const roofPeakBack = iso(wx + footprint/2, wy);
    const peakY = height + 45;

    return (
      <g key={b.id} transform={`translate(${ox}, ${oy})`}>
        {/* Garden ground plane */}
        {(() => {
          const gWx = wx - 20, gWy = b.row === 0 ? wy + depth : wy - 120;
          const gW = footprint + 40, gD = 120;
          const p1 = iso(gWx, gWy);
          const p2 = iso(gWx + gW, gWy);
          const p3 = iso(gWx + gW, gWy + gD);
          const p4 = iso(gWx, gWy + gD);
          return <polygon points={`${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")}`} fill="#DDE6CC" stroke="#C7D1B5" strokeWidth="0.5"/>;
        })()}

        {/* Segments — draw A and B as two halves */}
        {[segA, segB].map((seg, idx) => {
          if (!seg) return null;
          const active = !filter || filter === "all" || filter === seg.status;
          const meta = STATUS[seg.status];
          const isHover = hoverId === seg.id;

          const halfX0 = wx + idx * (footprint/2);
          const halfX1 = halfX0 + footprint/2;

          // Left face (visible in iso): front face
          const fl = iso(halfX0, wy + depth);
          const fr = iso(halfX1, wy + depth);
          const tl = [fl[0], fl[1] - height];
          const tr = [fr[0], fr[1] - height];
          // Side face on right half
          const bl = iso(halfX0, wy);
          const br = iso(halfX1, wy);
          const tbl = [bl[0], bl[1] - height];
          const tbr = [br[0], br[1] - height];

          // Roof: two sloped planes — front slope from tl,tr up to peak
          const peakFront = iso(halfX0 + (halfX1-halfX0)/2, wy + depth);
          const peakBack = iso(halfX0 + (halfX1-halfX0)/2, wy);
          const pfTop = [peakFront[0], peakFront[1] - height - 45];
          const pbTop = [peakBack[0], peakBack[1] - height - 45];

          const darker = seg.status === "available" ? "#223022" : seg.status === "reserved" ? "#7A5F3B" : "#5A544B";
          const lighter = seg.status === "available" ? "#3B4D3D" : seg.status === "reserved" ? "#9F825A" : "#807870";

          return (
            <g
              key={seg.id}
              className="plot-seg cursor-pointer"
              opacity={active ? 1 : 0.2}
              onMouseEnter={() => setHoverId(seg.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => active && onSelect(seg)}
            >
              {/* Right side face (visible when b.row facing outward) */}
              <polygon points={`${fr.join(",")} ${br.join(",")} ${tbr.join(",")} ${tr.join(",")}`} fill={darker} stroke="#F5F2ED" strokeWidth={isHover ? 1.5 : 0.8}/>
              {/* Left side — only draw for first segment */}
              {idx === 0 && (
                <polygon points={`${fl.join(",")} ${bl.join(",")} ${tbl.join(",")} ${tl.join(",")}`} fill={darker} stroke="#F5F2ED" strokeWidth="0.8"/>
              )}
              {/* Front face (main) */}
              <polygon points={`${fl.join(",")} ${fr.join(",")} ${tr.join(",")} ${tl.join(",")}`} fill={meta.color} stroke={isHover ? "#1A1A1A" : "#F5F2ED"} strokeWidth={isHover ? 2 : 1}/>
              {/* Windows — tylko 2 dolne kwadratowe okna, żeby nie zasłaniały etykiety segmentu.
                  Rysowane polygonami zgodnymi ze slantem fasady w iso. */}
              {(() => {
                const facePt = (t, h) => [
                  fl[0] + t * (fr[0] - fl[0]),
                  fl[1] + t * (fr[1] - fl[1]) - h * height,
                ];
                const pane = (t0, t1, h0, h1) => {
                  const p1 = facePt(t0, h0);
                  const p2 = facePt(t1, h0);
                  const p3 = facePt(t1, h1);
                  const p4 = facePt(t0, h1);
                  return `${p1.join(",")} ${p2.join(",")} ${p3.join(",")} ${p4.join(",")}`;
                };
                return (
                  <>
                    <polygon points={pane(0.14, 0.44, 0.18, 0.46)} fill="#F5F2ED" opacity="0.32"/>
                    <polygon points={pane(0.56, 0.86, 0.18, 0.46)} fill="#F5F2ED" opacity="0.32"/>
                  </>
                );
              })()}

              {/* Roof front slope */}
              <polygon points={`${tl.join(",")} ${tr.join(",")} ${pfTop.join(",")}`} fill={lighter} stroke="#F5F2ED" strokeWidth="0.8"/>
              {/* Roof back slope */}
              <polygon points={`${tbl.join(",")} ${tbr.join(",")} ${pbTop.join(",")}`} fill={darker} stroke="#F5F2ED" strokeWidth="0.8"/>
              {/* Roof side triangle (gable) */}
              <polygon points={`${tr.join(",")} ${tbr.join(",")} ${pbTop.join(",")} ${pfTop.join(",")}`} fill={lighter} opacity="0.85" stroke="#F5F2ED" strokeWidth="0.8"/>
              {idx === 0 && (
                <polygon points={`${tl.join(",")} ${tbl.join(",")} ${pbTop.join(",")} ${pfTop.join(",")}`} fill={darker} stroke="#F5F2ED" strokeWidth="0.8"/>
              )}

              {/* Label */}
              <text
                x={(fl[0] + fr[0]) / 2}
                y={fl[1] - height/2 + 4}
                textAnchor="middle"
                fill="#F5F2ED"
                fontSize="12"
                fontFamily="JetBrains Mono"
                fontWeight="600"
                letterSpacing="1"
                style={{ pointerEvents: "none" }}
              >{seg.id}</text>
            </g>
          );
        })}
      </g>
    );
  };

  // Road path in iso
  const roadPoints = [
    iso(-40, 260), iso(4 * 240 + 20, 260),
    iso(4 * 240 + 20, 360), iso(-40, 360),
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Ground plane */}
      {(() => {
        const p1 = iso(-60, -80);
        const p2 = iso(4 * 240 + 40, -80);
        const p3 = iso(4 * 240 + 40, 2 * 360 + 180);
        const p4 = iso(-60, 2 * 360 + 180);
        return (
          <polygon
            points={`${p1[0]+ox},${p1[1]+oy} ${p2[0]+ox},${p2[1]+oy} ${p3[0]+ox},${p3[1]+oy} ${p4[0]+ox},${p4[1]+oy}`}
            fill="#EDE7DC"
          />
        );
      })()}

      {/* Central road */}
      <polygon
        points={roadPoints.map(p => `${p[0]+ox},${p[1]+oy}`).join(" ")}
        fill="#E5DFD6"
      />

      {BUILDINGS.map(drawBuilding)}

      {/* Trees scattered */}
      {[
        [-40, 80], [-40, 180], [960, 120], [960, 500],
        [ -40, 500], [-40, 620], [960, 640], [400, 280],
        [600, 280], [200, 280], [800, 280],
      ].map(([wx, wy], i) => {
        const [x, y] = iso(wx, wy);
        return (
          <g key={i} transform={`translate(${x+ox}, ${y+oy})`}>
            <ellipse cx="0" cy="-8" rx="12" ry="14" fill="#95A67A"/>
            <ellipse cx="0" cy="-16" rx="9" ry="11" fill="#B0BE96"/>
          </g>
        );
      })}
    </svg>
  );
}

function SegmentTooltip({ seg, x, y }) {
  if (!seg) return null;
  const meta = STATUS[seg.status];
  return (
    <div
      className="pointer-events-none absolute bg-ink text-bg px-4 py-3 shadow-xl z-20"
      style={{ left: x, top: y, transform: "translate(-50%, -110%)", minWidth: 180 }}
    >
      <div className="mono-label" style={{ color: meta.dot }}>SEGMENT {seg.id}</div>
      <div className="font-display text-2xl mt-1">{fmtPLN(seg.price)}</div>
      <div className="mono-data opacity-70 mt-1">{seg.area} m² · {seg.rooms} pokoi · dz. {seg.land} m²</div>
      <div className="mono-label mt-2" style={{ color: meta.dot }}>{meta.label}</div>
    </div>
  );
}

function SegmentPanel({ seg, onClose }) {
  if (!seg) return null;
  const meta = STATUS[seg.status];
  const [tab, setTab] = useState("parter");

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 z-40 transition-opacity duration-500" onClick={onClose}/>
      <aside className="fixed top-0 right-0 h-full w-full md:w-[520px] bg-bg z-50 overflow-y-auto panel-scroll shadow-2xl"
             style={{ animation: "slideIn 0.5s var(--ease)" }}>
        <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>

        <div className="flex items-center justify-between px-8 py-6 border-b hairline">
          <div>
            <div className="mono-label text-muted">SEGMENT</div>
            <h3 className="font-display text-4xl leading-none mt-1">{seg.id}</h3>
          </div>
          <button onClick={onClose} aria-label="Zamknij" className="w-10 h-10 flex items-center justify-center hover:bg-hairline transition-colors">
            <Icon.Close className="w-5 h-5"/>
          </button>
        </div>

        {/* Status pill */}
        <div className="px-8 pt-6">
          <span className="inline-flex items-center gap-2 mono-label px-3 py-1.5" style={{ background: meta.bg, color: meta.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: meta.dot }}/>
            {meta.label}
          </span>
        </div>

        {/* Floor plan tabs */}
        <div className="px-8 pt-6">
          <div className="flex gap-6 border-b hairline">
            {["parter", "piętro"].map(t => (
              <button key={t}
                onClick={() => setTab(t)}
                className={`mono-label pb-3 border-b-2 transition-colors ${tab === t ? "border-forest text-ink" : "border-transparent text-muted hover:text-ink"}`}>
                {t}
              </button>
            ))}
          </div>

          {/* Floor plan SVG */}
          <div className="mt-6 bg-hairline/40 aspect-[4/3] flex items-center justify-center">
            <FloorPlan floor={tab} seg={seg}/>
          </div>
        </div>

        {/* Parameters */}
        <div className="px-8 pt-8">
          <div className="mono-label text-muted mb-4">PARAMETRY</div>
          <dl className="divide-y divide-[#E5DFD6]">
            {[
              ["Powierzchnia użytkowa", `${seg.area} m²`],
              ["Powierzchnia działki", `${seg.land} m²`],
              ["Liczba pokoi", `${seg.rooms}`],
              ["Garaż", `${seg.garage} stanowisko${seg.garage > 1 ? "wy" : "wy"}`],
              ["Ekspozycja ogrodu", seg.facing],
              ["Taras", "tak, 12 m²"],
              ["Standard", "deweloperski"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-3 mono-data">
                <span className="opacity-60">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </dl>
        </div>

        {/* Price */}
        <div className="px-8 pt-8 pb-6 border-t hairline mt-8">
          <div className="mono-label text-muted">CENA</div>
          <div className="font-display text-5xl md:text-6xl leading-none mt-2">{fmtPLN(seg.price)}</div>
          <div className="mono-data text-muted mt-2">{Math.round(seg.price/seg.area).toLocaleString("pl-PL")} zł / m²</div>
        </div>

        {/* CTAs */}
        <div className="px-8 pb-10 space-y-3">
          <PrimaryBtn onClick={() => { onClose(); const el = document.getElementById("kontakt"); if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" }); }} className="w-full justify-between">
            Zarezerwuj termin oglądania
          </PrimaryBtn>
          <GhostBtn onClick={() => window.generateCardPDF && window.generateCardPDF(seg)} className="w-full justify-between">
            Pobierz kartę PDF
          </GhostBtn>
        </div>
      </aside>
    </>
  );
}

// Placeholder floor plan — schematic walls
function FloorPlan({ floor, seg }) {
  if (floor === "parter") {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        {/* Outer walls */}
        <rect x="20" y="20" width="360" height="260" fill="none" stroke="#1A1A1A" strokeWidth="3"/>
        {/* Internal walls */}
        <line x1="20" y1="160" x2="220" y2="160" stroke="#1A1A1A" strokeWidth="1.5"/>
        <line x1="220" y1="20" x2="220" y2="280" stroke="#1A1A1A" strokeWidth="1.5"/>
        <line x1="220" y1="160" x2="380" y2="160" stroke="#1A1A1A" strokeWidth="1"/>
        {/* Door gaps */}
        <line x1="120" y1="160" x2="150" y2="160" stroke="#F5F2ED" strokeWidth="3"/>
        <line x1="220" y1="100" x2="220" y2="130" stroke="#F5F2ED" strokeWidth="3"/>
        {/* Labels */}
        <text x="120" y="90" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">SALON</text>
        <text x="120" y="104" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">32 m²</text>
        <text x="300" y="90" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">KUCHNIA</text>
        <text x="300" y="104" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">11 m²</text>
        <text x="80" y="215" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">HOL</text>
        <text x="170" y="215" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">WC</text>
        <text x="300" y="215" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">GARAŻ</text>
        <text x="300" y="229" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">{seg.garage === 2 ? "22 m²" : "14 m²"}</text>
        {/* N compass */}
        <g transform="translate(370, 270)">
          <circle r="10" fill="none" stroke="#1A1A1A" strokeWidth="0.5"/>
          <path d="M0,-6 L3,3 L0,1 L-3,3 Z" fill="#1A1A1A"/>
          <text y="18" textAnchor="middle" fontSize="8" fontFamily="JetBrains Mono">N</text>
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <rect x="20" y="20" width="360" height="260" fill="none" stroke="#1A1A1A" strokeWidth="3"/>
      <line x1="180" y1="20" x2="180" y2="280" stroke="#1A1A1A" strokeWidth="1.5"/>
      <line x1="180" y1="150" x2="380" y2="150" stroke="#1A1A1A" strokeWidth="1.5"/>
      <line x1="20" y1="180" x2="180" y2="180" stroke="#1A1A1A" strokeWidth="1.5"/>
      <line x1="180" y1="100" x2="180" y2="130" stroke="#F5F2ED" strokeWidth="3"/>
      <text x="100" y="95" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">SYPIALNIA</text>
      <text x="100" y="109" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">18 m²</text>
      <text x="280" y="80" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">MASTER</text>
      <text x="280" y="94" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">22 m²</text>
      <text x="100" y="225" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">POKÓJ</text>
      <text x="100" y="239" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">12 m²</text>
      <text x="280" y="215" textAnchor="middle" fontSize="11" fontFamily="JetBrains Mono" letterSpacing="1" fill="#1A1A1A">ŁAZIENKA</text>
      <text x="280" y="229" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="#1A1A1A" opacity="0.6">8 m²</text>
    </svg>
  );
}

Object.assign(window, { PlotTopDown, PlotIsometric, SegmentTooltip, SegmentPanel });
