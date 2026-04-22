// Tweaks panel — wraps edit mode protocol
function TweaksPanel({ tweaks, setTweaks }) {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === "__activate_edit_mode") setOpen(true);
      if (e.data?.type === "__deactivate_edit_mode") setOpen(false);
    };
    window.addEventListener("message", onMessage);
    // Now announce
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    setAvailable(true);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const update = (patch) => {
    setTweaks(t => ({ ...t, ...patch }));
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[70] bg-bg border hairline shadow-2xl w-80 max-h-[80vh] overflow-y-auto panel-scroll">
      <div className="flex items-center justify-between px-5 py-4 border-b hairline">
        <div className="mono-label">TWEAKS</div>
        <button onClick={() => setOpen(false)} aria-label="Zamknij panel" className="w-8 h-8 flex items-center justify-center hover:bg-hairline">
          <Icon.Close className="w-4 h-4"/>
        </button>
      </div>

      <div className="p-5 space-y-6">
        <TweakRow label="Nazwa inwestycji">
          <input type="text" value={tweaks.name} onChange={e => update({ name: e.target.value })}
            className="w-full border hairline px-3 py-2 bg-bg font-display text-lg"/>
        </TweakRow>

        <TweakRow label="Telefon sprzedaży">
          <input type="text" value={tweaks.phone} onChange={e => update({ phone: e.target.value })}
            className="w-full border hairline px-3 py-2 bg-bg mono-data"/>
        </TweakRow>

        <TweakRow label="Cena od (zł)">
          <input type="text" value={tweaks.priceFrom} onChange={e => update({ priceFrom: e.target.value })}
            className="w-full border hairline px-3 py-2 bg-bg mono-data"/>
        </TweakRow>

        <TweakRow label="Dostępnych segmentów">
          <input type="range" min="0" max={tweaks.totalUnits} value={tweaks.availableUnits}
            onChange={e => update({ availableUnits: +e.target.value })}
            className="calc-slider"/>
          <div className="mono-data text-muted mt-2">{tweaks.availableUnits} / {tweaks.totalUnits}</div>
        </TweakRow>

        <TweakRow label="Termin oddania">
          <input type="text" value={tweaks.completionQuarter} onChange={e => update({ completionQuarter: e.target.value })}
            className="w-full border hairline px-3 py-2 bg-bg mono-data"/>
        </TweakRow>

        <div className="mono-label text-muted opacity-60 pt-4 border-t hairline" style={{ fontSize: 10 }}>
          Zmiany zapisują się na żywo w HTML.
        </div>
      </div>
    </div>
  );
}

function TweakRow({ label, children }) {
  return (
    <div>
      <div className="mono-label text-muted mb-2">{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { TweaksPanel });
