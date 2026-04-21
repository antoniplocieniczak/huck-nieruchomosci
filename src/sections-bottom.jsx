function ScheduleCalcSection({ selectedSeg }) {
  const [price, setPrice] = useState(selectedSeg?.price || 729000);
  const [down, setDown] = useState(20);
  const [years, setYears] = useState(25);
  const [rate, setRate] = useState(7.3);

  useEffect(() => {
    if (selectedSeg) setPrice(selectedSeg.price);
  }, [selectedSeg]);

  const downAmount = price * (down / 100);
  const loan = price - downAmount;
  const months = years * 12;
  const r = rate / 100 / 12;
  const monthly = r === 0 ? loan / months : (loan * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  return (
    <section id="harmonogram" className="py-24 md:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Timeline */}
          <div>
            <Reveal><div className="mono-label text-muted mb-6">HARMONOGRAM BUDOWY</div></Reveal>
            <Reveal delay={100}>
              <h2 className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
                Od pozwolenia <span className="accent-sage">do kluczy.</span>
              </h2>
            </Reveal>

            <div className="mt-12 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-hairline"/>
              {TIMELINE.map((item, i) => (
                <Reveal key={i} delay={i * 80} className="relative pl-10 pb-10 last:pb-0">
                  <div className="absolute left-0 top-1">
                    {item.status === "done" && (
                      <div className="w-[22px] h-[22px] rounded-full bg-forest flex items-center justify-center">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#F5F2ED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4 10-10"/></svg>
                      </div>
                    )}
                    {item.status === "current" && (
                      <div className="w-[22px] h-[22px] rounded-full pulse-ring" style={{ background: "#8B6F47" }}/>
                    )}
                    {item.status === "next" && (
                      <div className="w-[22px] h-[22px] rounded-full bg-bg border-2 border-hairline"/>
                    )}
                  </div>
                  <div className="mono-label text-muted">{item.date}</div>
                  <div className={`font-display text-2xl leading-tight mt-1 ${item.status === "done" ? "text-muted" : ""}`}>{item.label}</div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Calculator */}
          <div>
            <Reveal><div className="mono-label text-muted mb-6 flex items-center gap-2"><Icon.Calc className="w-4 h-4"/> KALKULATOR RATY</div></Reveal>
            <Reveal delay={100}>
              <h2 className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
                Policz <span className="accent-sage">swoją</span> ratę.
              </h2>
            </Reveal>

            <div className="mt-12 bg-[#EFEAE0] p-6 md:p-10 space-y-8">
              <CalcField label="Cena nieruchomości" value={fmtPLN(price)}>
                <input type="range" className="calc-slider" min="500000" max="1000000" step="5000" value={price} onChange={e => setPrice(+e.target.value)}/>
              </CalcField>
              <CalcField label="Wkład własny" value={`${down}% · ${fmtPLN(Math.round(downAmount))}`}>
                <input type="range" className="calc-slider" min="10" max="80" step="1" value={down} onChange={e => setDown(+e.target.value)}/>
              </CalcField>
              <CalcField label="Okres kredytowania" value={`${years} lat`}>
                <input type="range" className="calc-slider" min="5" max="35" step="1" value={years} onChange={e => setYears(+e.target.value)}/>
              </CalcField>
              <CalcField label="Oprocentowanie roczne" value={`${rate.toFixed(2)}%`}>
                <input type="range" className="calc-slider" min="4" max="10" step="0.1" value={rate} onChange={e => setRate(+e.target.value)}/>
              </CalcField>

              <div className="pt-6 border-t hairline">
                <div className="mono-label text-muted">SZACOWANA RATA MIESIĘCZNA</div>
                <div className="font-display leading-none mt-2" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
                  ok. {Math.round(monthly).toLocaleString("pl-PL")} zł
                </div>
                <div className="mono-data text-muted mt-3">/ MIESIĄC · {years} × 12 RAT</div>
              </div>

              <p className="mono-data text-muted opacity-70 leading-relaxed" style={{ fontSize: 11 }}>
                Kalkulacja ma charakter wyłącznie szacunkowy i nie stanowi oferty w rozumieniu art. 66 §1 Kodeksu cywilnego. Rzeczywiste warunki kredytu ustala bank.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CalcField({ label, value, children }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="mono-label text-muted">{label}</div>
        <div className="font-display text-xl">{value}</div>
      </div>
      {children}
    </div>
  );
}

function DeveloperSection() {
  return (
    <section className="py-24 md:py-40 bg-[#EFEAE0]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <div className="aspect-[4/5] bg-hairline overflow-hidden">
              <img src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=85"
                   alt="Zespół dewelopera" loading="lazy" className="w-full h-full object-cover"/>
            </div>
          </Reveal>
          <div className="lg:col-span-7 lg:pt-4">
            <Reveal><div className="mono-label text-muted mb-6">O DEWELOPERZE</div></Reveal>
            <Reveal delay={100}>
              <h2 className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
                Nie pierwsza inwestycja.<br/>
                <span className="accent-sage">Nie ostatnia.</span>
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <div className="mt-10 space-y-4 text-lg text-muted leading-relaxed max-w-xl">
                <p>Od 2011 roku budujemy w Namysłowie i na Opolszczyźnie. Zaczynaliśmy od trzech domów jednorodzinnych na ulicy Braterskiej. Dziś kończymy siódmą inwestycję i pierwszą w modelu osiedlowym.</p>
                <p>Nie robimy marketingu z rabatami i odliczaniem do północy. Robimy domy, w których nasi znajomi chcą mieszkać.</p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t hairline">
                <div>
                  <div className="font-display text-5xl leading-none"><Counter to={15}/></div>
                  <div className="mono-label text-muted mt-2">LAT NA RYNKU</div>
                </div>
                <div>
                  <div className="font-display text-5xl leading-none"><Counter to={7}/></div>
                  <div className="mono-label text-muted mt-2">INWESTYCJI</div>
                </div>
                <div>
                  <div className="font-display text-5xl leading-none"><Counter to={148}/></div>
                  <div className="mono-label text-muted mt-2">ZADOWOLONYCH KLIENTÓW</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Testimonials — 2 portrety + 1 panel ze statystyką. Wszystkie na tę samą wysokość. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 items-stretch">
          {/* Portret 1 */}
          <Reveal className="group relative overflow-hidden bg-forest min-h-[560px] md:min-h-[640px]">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                 alt={TESTIMONIALS[0].author}
                 className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"/>
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent"/>
            <div className="absolute inset-x-0 bottom-0 p-7 md:p-8 text-bg">
              <p className="font-display text-lg md:text-xl leading-snug" style={{ textWrap: "pretty" }}>
                „{TESTIMONIALS[0].quote}"
              </p>
              <div className="mt-6 pt-5 border-t border-bg/25 flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-display-bold text-lg">{TESTIMONIALS[0].author}</div>
                  <div className="mono-label text-bg/65 mt-1">{TESTIMONIALS[0].role.toUpperCase()}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bg/50 flex-shrink-0"><path d="M7 14c-.667-6 3-10 9-10M11 14c-.667-6 3-10 9-10"/></svg>
              </div>
            </div>
          </Reveal>

          {/* Portret 2 */}
          <Reveal delay={120} className="group relative overflow-hidden bg-forest min-h-[560px] md:min-h-[640px]">
            <img src="https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=1000&q=80"
                 alt={TESTIMONIALS[1].author}
                 className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"/>
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/40 to-transparent"/>
            <div className="absolute inset-x-0 bottom-0 p-7 md:p-8 text-bg">
              <p className="font-display text-lg md:text-xl leading-snug" style={{ textWrap: "pretty" }}>
                „{TESTIMONIALS[1].quote}"
              </p>
              <div className="mt-6 pt-5 border-t border-bg/25 flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-display-bold text-lg">{TESTIMONIALS[1].author}</div>
                  <div className="mono-label text-bg/65 mt-1">{TESTIMONIALS[1].role.toUpperCase()}</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bg/50 flex-shrink-0"><path d="M7 14c-.667-6 3-10 9-10M11 14c-.667-6 3-10 9-10"/></svg>
              </div>
            </div>
          </Reveal>

          {/* Panel tekstowy ze statystyką */}
          <Reveal delay={240} className="relative bg-[#EAE3D6] p-8 md:p-10 flex flex-col justify-between min-h-[560px] md:min-h-[640px]">
            <div>
              <div className="mono-label text-muted">NASI KLIENCI</div>
              <div className="mt-6 flex items-baseline gap-2">
                <div className="font-display-bold leading-none" style={{ fontSize: "clamp(5rem, 11vw, 9rem)" }}>
                  <Counter to={148}/>
                </div>
                <div className="font-display-bold accent-sage leading-none" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>+</div>
              </div>
              <p className="mt-5 text-ink leading-relaxed max-w-sm" style={{ textWrap: "pretty" }}>
                rodzin zaufało nam przez ostatnie 15 lat. Bez spektakularnych kampanii — na zasadzie polecenia.
              </p>
            </div>

            <div className="mt-8">
              <p className="font-display text-xl md:text-2xl leading-[1.25]" style={{ textWrap: "pretty" }}>
                „{TESTIMONIALS[2].quote}"
              </p>
              <div className="mt-6 pt-5 border-t hairline">
                <div className="font-display-bold">{TESTIMONIALS[2].author}</div>
                <div className="mono-label text-muted mt-1">{TESTIMONIALS[2].role.toUpperCase()}</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Partnerzy — prawdziwe loga SVG */}
        <div className="mt-20">
          <div className="mono-label text-muted text-center mb-10">PARTNERZY I CERTYFIKATY</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <PartnerLogo variant="pzfd"/>
            <PartnerLogo variant="pekao"/>
            <PartnerLogo variant="iso"/>
            <PartnerLogo variant="pzitb"/>
            <PartnerLogo variant="pa"/>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-24 md:py-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <Reveal><div className="mono-label text-muted mb-6">PYTANIA I ODPOWIEDZI</div></Reveal>
            <Reveal delay={100}>
              <h2 className="font-display-bold leading-[0.95] sticky top-32" style={{ fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
                Najczęściej <span className="accent-sage">pytacie o to.</span>
              </h2>
            </Reveal>
          </div>
          <div className="lg:col-span-8">
            <div className="divide-y divide-[#E5DFD6] border-y hairline">
              {FAQ.map((item, i) => (
                <div key={i} className="py-6">
                  <button
                    onClick={() => setOpen(open === i ? -1 : i)}
                    className="w-full flex items-center justify-between gap-6 text-left group"
                    aria-expanded={open === i}>
                    <span className="font-display text-xl md:text-2xl leading-tight group-hover:text-forest transition-colors">{item.q}</span>
                    <span className={`flex-shrink-0 w-10 h-10 border hairline flex items-center justify-center transition-transform duration-500 ${open === i ? "rotate-45 bg-forest text-bg border-forest" : ""}`}>
                      <Icon.Plus className="w-4 h-4"/>
                    </span>
                  </button>
                  <div className={`grid transition-all duration-500 ${open === i ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0"}`} style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}>
                    <div className="overflow-hidden">
                      <p className="text-muted leading-relaxed max-w-2xl">{item.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", segment: "", message: "", rodo: false });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="kontakt" className="relative bg-forest text-bg overflow-hidden">
      {/* Subtle photo overlay */}
      <div className="absolute inset-0 opacity-15">
        <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
             alt="" loading="lazy" className="w-full h-full object-cover"/>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-40">
        <div className="max-w-4xl">
          <Reveal><div className="mono-label text-bg/70 mb-6">UMÓW PREZENTACJĘ</div></Reveal>
          <Reveal delay={100}>
            <h2 className="font-display-bold leading-[0.95]" style={{ fontSize: "clamp(2.8rem, 7vw, 6.5rem)" }}>
              Zobaczmy się <span className="accent-sage">na miejscu.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-8 text-lg md:text-xl text-bg/80 max-w-xl leading-relaxed">
              Pokażemy działkę, projekt i aktualny etap prac. Spotkanie trwa około 45 minut, zawsze z handlowcem prowadzącym.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 lg:gap-8 mt-20 items-stretch">
          {/* Form - opakowane w glass-card dla czytelności na tle zdjęcia */}
          <Reveal className="lg:col-span-7">
            <div className="glass-card h-full py-7 px-6 md:py-10 md:px-9">
              {submitted ? (
                <div>
                  <div className="font-display text-4xl">Dziękujemy.</div>
                  <p className="mt-4 text-bg/80">Odezwiemy się w ciągu jednego dnia roboczego. Jeśli sprawa pilna — zadzwoń bezpośrednio: {INVESTMENT.phone}.</p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input className="field" placeholder="Imię" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required/>
                    <input className="field" placeholder="Telefon" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required/>
                  </div>
                  <input className="field" placeholder="E-mail" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required/>
                  <select className="field" value={form.segment} onChange={e => setForm({...form, segment: e.target.value})} style={{ colorScheme: "dark" }}>
                    <option value="">Interesuje mnie segment…</option>
                    <option value="">Nie wiem jeszcze</option>
                    {SEGMENTS.filter(s => s.status !== "sold").map(s => (
                      <option key={s.id} value={s.id}>Segment {s.id} · {s.area} m² · {fmtPLN(s.price)}</option>
                    ))}
                  </select>
                  <textarea className="field" placeholder="Wiadomość (opcjonalnie)" rows="4" value={form.message} onChange={e => setForm({...form, message: e.target.value})}/>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="mt-1 accent-stone" checked={form.rodo} onChange={e => setForm({...form, rodo: e.target.checked})} required/>
                    <span className="text-sm text-bg/70 leading-relaxed">
                      Wyrażam zgodę na przetwarzanie moich danych osobowych w celu kontaktu w sprawie oferty {INVESTMENT.nameFull}. Administratorem danych jest {INVESTMENT.developer}.
                    </span>
                  </label>
                  <button type="submit" className="mt-4 inline-flex items-center gap-3 bg-stone text-ink px-8 py-4 mono-label hover:bg-bg transition-colors duration-500">
                    <span>Wyślij zgłoszenie</span>
                    <Icon.Arrow className="w-4 h-4"/>
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Agent card - glass-card tak jak formularz */}
          <Reveal className="lg:col-span-5" delay={200}>
            <div className="glass-card h-full py-7 px-6 md:py-10 md:px-9">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-stone/20 overflow-hidden flex-shrink-0">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
                       alt="" className="w-full h-full object-cover"/>
                </div>
                <div>
                  <div className="font-display text-2xl">{INVESTMENT.agentName}</div>
                  <div className="mono-label text-bg/60 mt-1">{INVESTMENT.agentRole.toUpperCase()}</div>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                <a href={`tel:${INVESTMENT.phoneHref}`} className="block group">
                  <div className="mono-label text-bg/60">TELEFON</div>
                  <div className="font-display text-3xl mt-1 group-hover:text-stone transition-colors">{INVESTMENT.phone}</div>
                </a>
                <a href={`mailto:${INVESTMENT.email}`} className="block group">
                  <div className="mono-label text-bg/60">E-MAIL</div>
                  <div className="font-display text-2xl mt-1 group-hover:text-stone transition-colors">{INVESTMENT.email}</div>
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-stone/20 space-y-3 text-sm">
                <div>
                  <div className="mono-label text-bg/60">GODZINY BIURA</div>
                  <div className="mt-1">{INVESTMENT.officeHours}</div>
                </div>
                <div>
                  <div className="mono-label text-bg/60">ADRES BIURA</div>
                  <div className="mt-1">{INVESTMENT.officeAddress}</div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <a href="#" aria-label="Instagram" className="w-10 h-10 border border-stone/40 flex items-center justify-center hover:bg-stone hover:border-stone hover:text-forest transition-colors">
                  <Icon.IG className="w-4 h-4"/>
                </a>
                <a href="#" aria-label="Facebook" className="w-10 h-10 border border-stone/40 flex items-center justify-center hover:bg-stone hover:border-stone hover:text-forest transition-colors">
                  <Icon.FB className="w-4 h-4"/>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#0F1410] text-bg/80 pt-20 pb-10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-2xl text-bg">{INVESTMENT.name}<span className="text-stone">.</span></div>
            <p className="mt-4 text-sm leading-relaxed text-bg/60 max-w-xs">16 bliźniaków z ogrodami w Namysłowie. Osiedle premium na granicy aglomeracji wrocławskiej.</p>
          </div>
          <div>
            <div className="mono-label text-bg/50 mb-5">NAWIGACJA</div>
            <ul className="space-y-3 text-sm">
              {[["#inwestycja","Inwestycja"],["#blizniaki","Bliźniaki"],["#lokalizacja","Lokalizacja"],["#galeria","Galeria"],["#kontakt","Kontakt"]].map(([h,l]) => (
                <li key={h}><a href={h} className="hover:text-bg transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mono-label text-bg/50 mb-5">DOKUMENTY</div>
            <ul className="space-y-3 text-sm">
              {["Prospekt informacyjny (PDF)", "Miejscowy plan zagospodarowania", "Pozwolenie na budowę", "Rejestr cen (portal rządowy)", "Polityka prywatności", "Regulamin"].map(d => (
                <li key={d}><a href="#" className="hover:text-bg transition-colors">{d}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mono-label text-bg/50 mb-5">DANE FIRMY</div>
            <div className="space-y-1.5 text-sm text-bg/70">
              <div className="text-bg">HUCK NIERUCHOMOŚCI sp. z o.o.</div>
              <div>NIP: 752-124-88-00</div>
              <div>REGON: 364558210</div>
              <div>KRS: 0000612344</div>
              <div>Kap. zakładowy: 5 000 zł</div>
              <div className="pt-2">Oleśnicka 13a/10, 46-100 Namysłów</div>
              <div>+48 669 385 877 · b.huck@huck.estate</div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-bg/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="mono-label text-bg/50">© 2026 HUCK NIERUCHOMOŚCI · WSZELKIE PRAWA ZASTRZEŻONE</div>
          <div className="mono-label text-bg/50 flex items-center gap-2">
            <span>MADE BY</span>
            <span className="text-bg font-display-bold tracking-tight">HUCK NIERUCHOMOŚCI<span className="accent-sage">.</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Video modal
function VideoModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="fixed inset-0 bg-ink/95 z-[60] flex items-center justify-center p-6" onClick={onClose}>
      <button onClick={onClose} aria-label="Zamknij" className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-bg hover:bg-bg/10">
        <Icon.Close className="w-6 h-6"/>
      </button>
      <div className="aspect-video w-full max-w-5xl bg-ink" onClick={(e) => e.stopPropagation()}>
        <video autoPlay controls className="w-full h-full">
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" type="video/mp4"/>
        </video>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 mono-label text-bg/60">
        SPACER PO OSIEDLU · DRON · 2:14
      </div>
    </div>
  );
}

// Partnerzy — loga SVG w neutralnej palecie (#2B2B2B + sage akcent)
function PartnerLogo({ variant }) {
  const inkColor = "#2B2B2B";
  const accentColor = "#8B9A7B";
  const common = {
    className: "w-full h-16 md:h-20 flex items-center justify-center grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition-all duration-500 border hairline px-4 py-3",
  };
  if (variant === "pzfd") {
    return (
      <div {...common}>
        <svg viewBox="0 0 160 40" className="w-full h-full" fill="none">
          <rect x="2" y="8" width="24" height="24" fill={inkColor}/>
          <rect x="8" y="14" width="12" height="4" fill="white"/>
          <rect x="8" y="22" width="8" height="4" fill="white"/>
          <text x="34" y="22" fontFamily="serif" fontSize="14" fontWeight="700" fill={inkColor}>PZFD</text>
          <text x="34" y="32" fontFamily="sans-serif" fontSize="6" letterSpacing="1" fill={inkColor}>POLSKI ZWIĄZEK FIRM DEW.</text>
        </svg>
      </div>
    );
  }
  if (variant === "pekao") {
    return (
      <div {...common}>
        <svg viewBox="0 0 160 40" className="w-full h-full" fill="none">
          <circle cx="16" cy="20" r="10" fill={inkColor}/>
          <path d="M10 20 L14 24 L22 16" stroke="white" strokeWidth="2" fill="none"/>
          <text x="32" y="22" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill={inkColor}>Bank Pekao</text>
          <text x="32" y="32" fontFamily="sans-serif" fontSize="6" letterSpacing="1" fill={inkColor}>RACHUNEK POWIERNICZY</text>
        </svg>
      </div>
    );
  }
  if (variant === "iso") {
    return (
      <div {...common}>
        <svg viewBox="0 0 160 40" className="w-full h-full" fill="none">
          <circle cx="20" cy="20" r="14" stroke={inkColor} strokeWidth="1.5" fill="none"/>
          <text x="20" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill={inkColor}>ISO</text>
          <text x="44" y="18" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill={inkColor}>ISO 9001</text>
          <text x="44" y="30" fontFamily="sans-serif" fontSize="6" letterSpacing="1" fill={inkColor}>SYSTEM ZARZĄDZANIA JAKOŚCIĄ</text>
        </svg>
      </div>
    );
  }
  if (variant === "pzitb") {
    return (
      <div {...common}>
        <svg viewBox="0 0 160 40" className="w-full h-full" fill="none">
          <path d="M8 30 L18 10 L28 30 Z" stroke={inkColor} strokeWidth="1.5" fill="none"/>
          <path d="M13 30 L18 20 L23 30" stroke={accentColor} strokeWidth="1.5" fill="none"/>
          <text x="34" y="20" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill={inkColor}>PZITB</text>
          <text x="34" y="30" fontFamily="sans-serif" fontSize="6" letterSpacing="0.8" fill={inkColor}>INŻYNIEROWIE BUDOWNICTWA</text>
        </svg>
      </div>
    );
  }
  // pa — Pasywny Budynek
  return (
    <div {...common}>
      <svg viewBox="0 0 160 40" className="w-full h-full" fill="none">
        <path d="M6 32 L18 10 L30 32 Z" fill={accentColor}/>
        <path d="M12 32 L18 20 L24 32 L12 32" fill="white"/>
        <text x="36" y="20" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill={inkColor}>BUDYNEK</text>
        <text x="36" y="30" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill={accentColor}>PASYWNY</text>
      </svg>
    </div>
  );
}

Object.assign(window, { ScheduleCalcSection, DeveloperSection, FAQSection, ContactSection, Footer, VideoModal, PartnerLogo });
