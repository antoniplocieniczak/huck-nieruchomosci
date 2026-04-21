const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

// Intersection reveal
function useInView(options = { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, options);
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, as = "div", className = "", ...rest }) {
  const [ref, inView] = useInView();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// Animated counter
function Counter({ to, duration = 1600, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString("pl-PL")}{suffix}</span>;
}

// Minimal icons (Lucide-style hand-drawn)
const Icon = {
  Pin:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Leaf:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 5-8 13-8 0 8-3 13-6 15Z"/><path d="M4 20c3-6 7-10 13-12"/></svg>,
  Land:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 15h18M8 3v18"/></svg>,
  Shield:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>,
  Phone: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.28a2 2 0 0 1 2.1-.45c.9.35 1.85.6 2.81.73A2 2 0 0 1 22 16.92Z"/></svg>,
  Mail:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="5" width="20" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>,
  Arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  Down:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M6 13l6 6 6-6"/></svg>,
  Play:  (p) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7L8 5Z"/></svg>,
  Close: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Plus:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Grid:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>,
  Cube:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" {...p}><path d="m12 3 9 5v8l-9 5-9-5V8l9-5Z"/><path d="m3 8 9 5 9-5M12 13v10"/></svg>,
  IG:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>,
  FB:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3H12V7a1 1 0 0 1 1-1h2V3Z"/></svg>,
  Sun:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>,
  Calc:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16v2"/></svg>,
};

// Formatters
const fmtPLN = (n) => n.toLocaleString("pl-PL") + " zł";
const fmtM2 = (n) => n + " m²";

// Status meta
const STATUS = {
  available: { label: "Dostępny",     color: "#2D3B2E", bg: "rgba(45,59,46,0.08)",  dot: "#2D3B2E" },
  reserved:  { label: "Rezerwacja",   color: "#8B6F47", bg: "rgba(139,111,71,0.1)",  dot: "#C9B896" },
  sold:      { label: "Sprzedany",    color: "#6B6358", bg: "rgba(107,99,88,0.08)",  dot: "#A8A29E" },
};

// Button components
function PrimaryBtn({ children, href, onClick, className = "", ...rest }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-3 bg-forest text-bg px-7 py-4 mono-label hover:bg-[#1F2B20] transition-colors duration-500 ${className}`}
      {...rest}
    >
      <span>{children}</span>
      <Icon.Arrow className="w-4 h-4 -mr-1 transition-transform duration-500 group-hover:translate-x-1" />
    </Tag>
  );
}

function GhostBtn({ children, href, onClick, className = "", ...rest }) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-3 border border-ink/30 text-ink px-7 py-4 mono-label hover:border-ink hover:bg-ink hover:text-bg transition-colors duration-500 ${className}`}
      {...rest}
    >
      <span>{children}</span>
      <Icon.Arrow className="w-4 h-4 -mr-1 transition-transform duration-500 group-hover:translate-x-1" />
    </Tag>
  );
}

Object.assign(window, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext, useInView, Reveal, Counter, Icon, fmtPLN, fmtM2, STATUS, PrimaryBtn, GhostBtn });
