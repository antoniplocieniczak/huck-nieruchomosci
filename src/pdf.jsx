// Branded PDF generator — investment offer + segment card
// Uses jsPDF + html2canvas (loaded via CDN in index.html)
// Renders offscreen HTML pages styled with brand tokens, rasterizes to A4 JPEG pages.

const PDF_BRAND = {
  bg: "#F4EFE9",
  ink: "#1A1A1A",
  forest: "#303C30",
  sage: "#B8C5AB",
  warm: "#564F3F",
  stone: "#C5BCAB",
  sand: "#DAD1BF",
  hairline: "#E5DFD6",
  muted: "#564F3F",
};

const PDF_STATUS = {
  available: { label: "Dostępny",   color: "#2D3B2E", bg: "#E5EADF" },
  reserved:  { label: "Rezerwacja", color: "#8B6F47", bg: "#EFE5D4" },
  sold:      { label: "Sprzedany",  color: "#6B6358", bg: "#E8E4DD" },
};

// A4 @ 96dpi
const A4_W_PX = 794;
const A4_H_PX = 1123;

function pdfPageShell(innerHtml, opts = {}) {
  const bg = opts.bg || PDF_BRAND.bg;
  const color = opts.color || PDF_BRAND.ink;
  return `
    <div class="pdfpage" style="
      width:${A4_W_PX}px; height:${A4_H_PX}px;
      background:${bg}; color:${color};
      font-family:'Ubuntu', system-ui, sans-serif;
      position:relative; overflow:hidden;
      box-sizing:border-box;
      font-size:13px; line-height:1.5;
    ">${innerHtml}</div>
  `;
}

function pdfLogo(colorDot = PDF_BRAND.sage, colorWord = PDF_BRAND.bg) {
  return `
    <div style="font-family:'Clash Display', Georgia, sans-serif; font-weight:700; font-size:22px; letter-spacing:-0.02em; color:${colorWord};">
      HUCK<span style="color:${colorDot};">.</span>
    </div>
  `;
}

function pdfMonoLabel(text, color = PDF_BRAND.muted) {
  return `<span style="font-family:'JetBrains Mono', ui-monospace, monospace; text-transform:uppercase; letter-spacing:0.18em; font-size:10px; font-weight:500; color:${color};">${text}</span>`;
}

function pdfMonoData(text, color = PDF_BRAND.ink) {
  return `<span style="font-family:'JetBrains Mono', ui-monospace, monospace; font-size:11px; letter-spacing:0.06em; color:${color};">${text}</span>`;
}

function pdfBuildOfferPages(inv, segments) {
  const totalAvailable = segments.filter(s => s.status === "available").length;
  const totalReserved = segments.filter(s => s.status === "reserved").length;
  const totalSold = segments.filter(s => s.status === "sold").length;
  const fromArea = Math.min(...segments.map(s => s.area));
  const toArea = Math.max(...segments.map(s => s.area));

  const pages = [];

  // ============ PAGE 1: Cover ============
  pages.push(pdfPageShell(`
    <div style="position:absolute; top:56px; left:56px; right:56px; display:flex; justify-content:space-between; align-items:center;">
      ${pdfLogo(PDF_BRAND.sage, PDF_BRAND.bg)}
      <div>${pdfMonoLabel("Oferta inwestycyjna · " + inv.city.toUpperCase(), "rgba(244,239,233,0.7)")}</div>
    </div>

    <div style="position:absolute; top:260px; left:56px; right:56px;">
      <div style="margin-bottom:28px;">${pdfMonoLabel("Inwestycja deweloperska · Namysłów", "rgba(244,239,233,0.7)")}</div>
      <h1 style="font-family:'Clash Display', Georgia, sans-serif; font-weight:600; letter-spacing:-0.025em; font-size:86px; line-height:0.95; margin:0; color:${PDF_BRAND.bg};">
        ${inv.name}.<br/>
        <span style="color:${PDF_BRAND.sage};">Dom z ogrodem.</span><br/>
        Bez kompromisów.
      </h1>
      <p style="font-size:17px; line-height:1.55; color:rgba(244,239,233,0.85); max-width:560px; margin:32px 0 0;">
        16 bliźniaków z ogrodami w sercu Namysłowa. Oddanie ${inv.completionQuarter}. Standard deweloperski z pompą ciepła.
      </p>
    </div>

    <div style="position:absolute; left:56px; right:56px; bottom:56px; border-top:1px solid rgba(244,239,233,0.2); padding-top:22px; display:flex; justify-content:space-between;">
      <div>
        <div style="margin-bottom:6px;">${pdfMonoLabel("Oddanie", "rgba(244,239,233,0.6)")}</div>
        <div style="font-family:'Clash Display',Georgia,sans-serif; font-size:22px; font-weight:500; color:${PDF_BRAND.bg};">${inv.completionQuarter}</div>
      </div>
      <div>
        <div style="margin-bottom:6px;">${pdfMonoLabel("Cena od", "rgba(244,239,233,0.6)")}</div>
        <div style="font-family:'Clash Display',Georgia,sans-serif; font-size:22px; font-weight:500; color:${PDF_BRAND.bg};">${inv.priceFrom} zł</div>
      </div>
      <div>
        <div style="margin-bottom:6px;">${pdfMonoLabel("Lokalizacja", "rgba(244,239,233,0.6)")}</div>
        <div style="font-family:'Clash Display',Georgia,sans-serif; font-size:22px; font-weight:500; color:${PDF_BRAND.bg};">${inv.city}, ${inv.region.replace("woj. ", "")}</div>
      </div>
      <div>
        <div style="margin-bottom:6px;">${pdfMonoLabel("Segmenty", "rgba(244,239,233,0.6)")}</div>
        <div style="font-family:'Clash Display',Georgia,sans-serif; font-size:22px; font-weight:500; color:${PDF_BRAND.bg};">${totalAvailable}/${inv.totalUnits} wolne</div>
      </div>
    </div>
  `, { bg: PDF_BRAND.forest, color: PDF_BRAND.bg }));

  // ============ PAGE 2: Overview ============
  pages.push(pdfPageShell(`
    <div style="position:absolute; top:56px; left:56px; right:56px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${PDF_BRAND.hairline}; padding-bottom:18px;">
      ${pdfLogo(PDF_BRAND.forest, PDF_BRAND.ink)}
      ${pdfMonoLabel("Inwestycja — fakty")}
    </div>

    <div style="padding:120px 56px 56px;">
      <div style="margin-bottom:14px;">${pdfMonoLabel("O inwestycji", PDF_BRAND.muted)}</div>
      <h2 style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; letter-spacing:-0.02em; font-size:48px; line-height:1.02; margin:0 0 28px; color:${PDF_BRAND.ink};">
        ${inv.nameFull}
      </h2>
      <p style="font-size:15px; line-height:1.65; max-width:560px; margin:0 0 48px; color:${PDF_BRAND.ink};">
        ${inv.nameFull} to kameralne osiedle ${inv.totalUnits} bliźniaków z prywatnymi ogrodami, położone przy ${inv.street} w Namysłowie. Każdy segment ma od ${fromArea} do ${toArea} m² powierzchni użytkowej, własny ogród oraz miejsce parkingowe w garażu. Standard deweloperski obejmuje pompę ciepła, rekuperację i okna z żaluzjami zewnętrznymi.
      </p>

      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap:0; border-top:1px solid ${PDF_BRAND.hairline}; border-bottom:1px solid ${PDF_BRAND.hairline}; padding:24px 0; margin-bottom:48px;">
        <div>
          <div style="margin-bottom:10px;">${pdfMonoLabel("Segmenty", PDF_BRAND.muted)}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:42px; line-height:1; color:${PDF_BRAND.forest};">${inv.totalUnits}</div>
        </div>
        <div>
          <div style="margin-bottom:10px;">${pdfMonoLabel("Dostępne", PDF_BRAND.muted)}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:42px; line-height:1; color:${PDF_BRAND.forest};">${totalAvailable}</div>
        </div>
        <div>
          <div style="margin-bottom:10px;">${pdfMonoLabel("Cena od", PDF_BRAND.muted)}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:32px; line-height:1; color:${PDF_BRAND.forest};">${inv.priceFrom}<span style="font-size:18px;"> zł</span></div>
        </div>
        <div>
          <div style="margin-bottom:10px;">${pdfMonoLabel("Oddanie", PDF_BRAND.muted)}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:22px; line-height:1.1; color:${PDF_BRAND.forest};">${inv.completionQuarter}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:48px;">
        <div>
          <div style="margin-bottom:14px;">${pdfMonoLabel("Standard deweloperski", PDF_BRAND.muted)}</div>
          <ul style="list-style:none; padding:0; margin:0; font-size:13.5px; line-height:1.85;">
            ${[
              "Ściany otynkowane pod malowanie",
              "Podłogi wylane i wyrównane",
              "Okna z żaluzjami zewnętrznymi",
              "Pompa ciepła powietrze–woda",
              "Rekuperacja z odzyskiem ciepła",
              "Dach pod fotowoltaikę",
              "Przyłącza gotowe (prąd, woda, kanalizacja)",
              "Ogród z ogrodzeniem"
            ].map(x => `<li style="padding:4px 0; border-bottom:1px solid ${PDF_BRAND.hairline};"><span style="color:${PDF_BRAND.forest}; margin-right:10px;">—</span>${x}</li>`).join("")}
          </ul>
        </div>
        <div>
          <div style="margin-bottom:14px;">${pdfMonoLabel("Harmonogram", PDF_BRAND.muted)}</div>
          <ul style="list-style:none; padding:0; margin:0; font-size:13.5px; line-height:1.6;">
            ${TIMELINE.map(t => {
              const c = t.status === "done" ? PDF_BRAND.forest : (t.status === "current" ? PDF_BRAND.forest : PDF_BRAND.muted);
              const dot = t.status === "done" ? "●" : (t.status === "current" ? "◉" : "○");
              return `<li style="padding:6px 0; border-bottom:1px solid ${PDF_BRAND.hairline}; display:flex; justify-content:space-between; align-items:center;">
                <span><span style="color:${c}; margin-right:10px; font-size:12px;">${dot}</span>${t.label}</span>
                <span style="font-family:'JetBrains Mono',ui-monospace,monospace; font-size:11px; color:${PDF_BRAND.muted};">${t.date}</span>
              </li>`;
            }).join("")}
          </ul>
        </div>
      </div>
    </div>

    <div style="position:absolute; bottom:32px; left:56px; right:56px; display:flex; justify-content:space-between; color:${PDF_BRAND.muted};">
      ${pdfMonoLabel(inv.nameFull, PDF_BRAND.muted)}
      ${pdfMonoLabel("Strona 2 / 3", PDF_BRAND.muted)}
    </div>
  `));

  // ============ PAGE 3: Segment table + contact ============
  pages.push(pdfPageShell(`
    <div style="position:absolute; top:56px; left:56px; right:56px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid ${PDF_BRAND.hairline}; padding-bottom:18px;">
      ${pdfLogo(PDF_BRAND.forest, PDF_BRAND.ink)}
      ${pdfMonoLabel("Dostępne segmenty")}
    </div>

    <div style="padding:120px 56px 56px;">
      <div style="margin-bottom:14px;">${pdfMonoLabel("Zestawienie", PDF_BRAND.muted)}</div>
      <h2 style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; letter-spacing:-0.02em; font-size:36px; line-height:1.02; margin:0 0 24px; color:${PDF_BRAND.ink};">
        16 segmentów, 8 bliźniaków
      </h2>

      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="border-bottom:2px solid ${PDF_BRAND.ink};">
            ${["Segment","Pow. użytk.","Działka","Pokoje","Garaż","Ekspozycja","Cena","Status"].map(h =>
              `<th style="text-align:left; padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace; text-transform:uppercase; letter-spacing:0.12em; font-size:10px; font-weight:500; color:${PDF_BRAND.muted};">${h}</th>`
            ).join("")}
          </tr>
        </thead>
        <tbody>
          ${segments.map(s => {
            const st = PDF_STATUS[s.status];
            return `<tr style="border-bottom:1px solid ${PDF_BRAND.hairline};">
              <td style="padding:10px 8px; font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:14px; color:${PDF_BRAND.ink};">${s.id}</td>
              <td style="padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace;">${s.area} m²</td>
              <td style="padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace;">${s.land} m²</td>
              <td style="padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace;">${s.rooms}</td>
              <td style="padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace;">${s.garage}</td>
              <td style="padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace;">${s.facing}</td>
              <td style="padding:10px 8px; font-family:'JetBrains Mono',ui-monospace,monospace; font-weight:500;">${s.price.toLocaleString("pl-PL")} zł</td>
              <td style="padding:10px 8px;">
                <span style="display:inline-block; padding:3px 10px; font-family:'JetBrains Mono',ui-monospace,monospace; text-transform:uppercase; letter-spacing:0.12em; font-size:9px; font-weight:500; color:${st.color}; background:${st.bg};">${st.label}</span>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>

      <div style="margin-top:42px; padding:28px; background:${PDF_BRAND.forest}; color:${PDF_BRAND.bg};">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:28px;">
          <div>
            <div style="margin-bottom:10px;">${pdfMonoLabel("Kontakt", "rgba(244,239,233,0.7)")}</div>
            <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:22px; line-height:1.1;">${inv.agentName}</div>
            <div style="font-size:11px; color:rgba(244,239,233,0.7); margin-top:4px;">${inv.agentRole}</div>
            <div style="margin-top:16px; font-size:13px; line-height:1.8;">
              <div>${inv.phone}</div>
              <div>${inv.email}</div>
            </div>
          </div>
          <div>
            <div style="margin-bottom:10px;">${pdfMonoLabel("Biuro sprzedaży", "rgba(244,239,233,0.7)")}</div>
            <div style="font-size:13px; line-height:1.7;">
              <div>${inv.officeAddress}</div>
              <div style="color:rgba(244,239,233,0.7);">${inv.officeHours}</div>
            </div>
            <div style="margin-top:16px;">${pdfMonoLabel("Deweloper", "rgba(244,239,233,0.7)")}</div>
            <div style="font-size:12px; margin-top:6px;">${inv.developer}</div>
          </div>
        </div>
      </div>
    </div>

    <div style="position:absolute; bottom:32px; left:56px; right:56px; display:flex; justify-content:space-between; color:${PDF_BRAND.muted};">
      ${pdfMonoLabel(inv.nameFull, PDF_BRAND.muted)}
      ${pdfMonoLabel("Strona 3 / 3", PDF_BRAND.muted)}
    </div>
  `));

  return pages;
}

function pdfBuildCardPages(inv, seg) {
  const st = PDF_STATUS[seg.status];
  const pricePerM2 = Math.round(seg.price / seg.area);
  return [pdfPageShell(`
    <div style="position:absolute; top:0; left:0; right:0; height:300px; background:${PDF_BRAND.forest}; padding:56px 56px 0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        ${pdfLogo(PDF_BRAND.sage, PDF_BRAND.bg)}
        <div>${pdfMonoLabel("Karta segmentu · " + inv.city.toUpperCase(), "rgba(244,239,233,0.7)")}</div>
      </div>
      <div style="margin-top:54px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div>
          <div style="margin-bottom:14px;">${pdfMonoLabel(inv.nameFull, "rgba(244,239,233,0.7)")}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; letter-spacing:-0.02em; font-size:120px; line-height:0.9; color:${PDF_BRAND.bg};">
            ${seg.id}
          </div>
        </div>
        <div style="text-align:right;">
          <span style="display:inline-block; padding:6px 16px; font-family:'JetBrains Mono',ui-monospace,monospace; text-transform:uppercase; letter-spacing:0.14em; font-size:11px; font-weight:500; color:${st.color}; background:${PDF_BRAND.bg};">${st.label}</span>
          <div style="margin-top:18px; color:rgba(244,239,233,0.85); font-size:13px;">${seg.area} m² · działka ${seg.land} m²</div>
          <div style="color:rgba(244,239,233,0.85); font-size:13px;">${seg.rooms} pokoje · ekspozycja ${seg.facing}</div>
        </div>
      </div>
    </div>

    <div style="position:absolute; top:340px; left:56px; right:56px;">
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:48px;">
        <div>
          <div style="margin-bottom:16px;">${pdfMonoLabel("Specyfikacja", PDF_BRAND.muted)}</div>
          <dl style="margin:0; padding:0;">
            ${[
              ["Powierzchnia użytkowa", `${seg.area} m²`],
              ["Powierzchnia działki", `${seg.land} m²`],
              ["Liczba pokoi", `${seg.rooms}`],
              ["Garaż", `${seg.garage} stanowisko${seg.garage > 1 ? "we" : "we"}`],
              ["Ekspozycja ogrodu", seg.facing],
              ["Taras", "tak, 12 m²"],
              ["Standard", "deweloperski"],
              ["Ogrzewanie", "pompa ciepła"],
              ["Wentylacja", "rekuperacja"],
            ].map(([k,v]) => `
              <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid ${PDF_BRAND.hairline}; font-family:'JetBrains Mono',ui-monospace,monospace; font-size:11.5px;">
                <span style="color:${PDF_BRAND.muted};">${k}</span>
                <span style="color:${PDF_BRAND.ink}; font-weight:500;">${v}</span>
              </div>
            `).join("")}
          </dl>
        </div>

        <div>
          <div style="margin-bottom:16px;">${pdfMonoLabel("Cena", PDF_BRAND.muted)}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; letter-spacing:-0.02em; font-size:52px; line-height:1; color:${PDF_BRAND.ink};">
            ${seg.price.toLocaleString("pl-PL")} <span style="font-size:26px;">zł</span>
          </div>
          <div style="font-family:'JetBrains Mono',ui-monospace,monospace; font-size:12px; color:${PDF_BRAND.muted}; margin-top:10px;">
            ${pricePerM2.toLocaleString("pl-PL")} zł / m²
          </div>

          <div style="margin-top:40px; padding:22px; border:1px solid ${PDF_BRAND.hairline}; background:#FBF8F2;">
            <div style="margin-bottom:10px;">${pdfMonoLabel("W standardzie", PDF_BRAND.muted)}</div>
            <ul style="list-style:none; padding:0; margin:0; font-size:12px; line-height:1.7; color:${PDF_BRAND.ink};">
              ${[
                "Pompa ciepła + rekuperacja",
                "Okna z żaluzjami zewnętrznymi",
                "Dach pod fotowoltaikę",
                "Ogród z ogrodzeniem",
                "Przyłącza gotowe"
              ].map(x => `<li style="padding:3px 0;"><span style="color:${PDF_BRAND.forest}; margin-right:8px;">—</span>${x}</li>`).join("")}
            </ul>
          </div>

          <div style="margin-top:22px;">
            <div style="margin-bottom:10px;">${pdfMonoLabel("Oddanie", PDF_BRAND.muted)}</div>
            <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:500; font-size:18px; color:${PDF_BRAND.ink};">
              ${inv.completionQuarter} · klucze ${inv.handoverBy}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="position:absolute; bottom:56px; left:56px; right:56px; padding:22px 28px; background:${PDF_BRAND.sand};">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="margin-bottom:6px;">${pdfMonoLabel("Kontakt w sprawie segmentu " + seg.id, PDF_BRAND.muted)}</div>
          <div style="font-family:'Clash Display',Georgia,sans-serif; font-weight:600; font-size:18px; color:${PDF_BRAND.ink};">${inv.agentName} — ${inv.phone}</div>
          <div style="font-size:11px; color:${PDF_BRAND.muted}; margin-top:2px;">${inv.email} · ${inv.officeAddress}</div>
        </div>
        <div style="text-align:right;">
          ${pdfMonoLabel(inv.developer, PDF_BRAND.muted)}
        </div>
      </div>
    </div>
  `)];
}

async function pdfWaitForFonts() {
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (_) {}
}

async function pdfRenderPagesToBlob(pagesHtml, filename) {
  if (!window.jspdf || !window.html2canvas) {
    alert("Nie udało się załadować generatora PDF. Odśwież stronę i spróbuj ponownie.");
    return;
  }
  await pdfWaitForFonts();

  // Mount a hidden container
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:fixed; left:-10000px; top:0; width:" + A4_W_PX + "px; z-index:-1;";
  wrap.innerHTML = pagesHtml.join("");
  document.body.appendChild(wrap);

  try {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
    const pageW = 210, pageH = 297;

    const nodes = wrap.querySelectorAll(".pdfpage");
    for (let i = 0; i < nodes.length; i++) {
      const canvas = await window.html2canvas(nodes[i], {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        windowWidth: A4_W_PX,
        windowHeight: A4_H_PX,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH, undefined, "FAST");
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(wrap);
  }
}

async function generateOfferPDF() {
  const pages = pdfBuildOfferPages(INVESTMENT, SEGMENTS);
  const fn = `Oferta-${INVESTMENT.name}-${INVESTMENT.city}.pdf`
    .replace(/\s+/g, "-")
    .replace(/ł/g, "l").replace(/Ł/g, "L")
    .replace(/ó/g, "o").replace(/ś/g, "s").replace(/ż/g, "z").replace(/ź/g, "z")
    .replace(/ń/g, "n").replace(/ć/g, "c").replace(/ę/g, "e").replace(/ą/g, "a");
  await pdfRenderPagesToBlob(pages, fn);
}

async function generateCardPDF(seg) {
  const pages = pdfBuildCardPages(INVESTMENT, seg);
  const fn = `Karta-${seg.id}-${INVESTMENT.name}.pdf`
    .replace(/\s+/g, "-")
    .replace(/ł/g, "l").replace(/Ł/g, "L")
    .replace(/ó/g, "o").replace(/ś/g, "s").replace(/ż/g, "z").replace(/ź/g, "z")
    .replace(/ń/g, "n").replace(/ć/g, "c").replace(/ę/g, "e").replace(/ą/g, "a");
  await pdfRenderPagesToBlob(pages, fn);
}

Object.assign(window, { generateOfferPDF, generateCardPDF });
