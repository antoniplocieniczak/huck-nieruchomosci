// Tab 1 orchestrator: Credit calculator

function CreditTab() {
  const [amount, setAmount] = React.useState(500000);
  const [months, setMonths] = React.useState(360);
  const [wibor, setWibor] = React.useState(4);
  const [margin, setMargin] = React.useState(2);
  const [rateMode, setRateMode] = React.useState('equal');
  const [extra, setExtra] = React.useState(0);
  const [extraStrategy, setExtraStrategy] = React.useState('shorten');
  const [unitYears, setUnitYears] = React.useState(false);
  const [previewMonth, setPreviewMonth] = React.useState(1);
  const [overrides, setOverrides] = React.useState({});

  const setOverride = (m, patch) => {
    setOverrides((prev) => ({
      ...prev,
      [m]: { ...(prev[m] || {}), ...patch },
    }));
  };

  // Debounce heavy recompute
  const dAmount = useDebouncedValue(amount, 50);
  const dMonths = useDebouncedValue(months, 50);
  const dWibor  = useDebouncedValue(wibor, 50);
  const dMargin = useDebouncedValue(margin, 50);
  const dExtra  = useDebouncedValue(extra, 50);
  const dOverrides = useDebouncedValue(overrides, 80);

  const startDate = React.useMemo(() => {
    const d = new Date(2026, 4, 1); // maj 2026
    return d;
  }, []);

  const schedule = React.useMemo(() => buildSchedule({
    amount: dAmount,
    months: dMonths,
    annualRatePct: dWibor + dMargin,
    mode: rateMode,
    extraPerMonth: dExtra,
    extraStrategy,
    scheduleOverrides: dOverrides,
    startDate,
  }), [dAmount, dMonths, dWibor, dMargin, rateMode, dExtra, extraStrategy, dOverrides, startDate]);

  // Clamp previewMonth to actual length
  React.useEffect(() => {
    if (previewMonth > schedule.actualMonths) setPreviewMonth(schedule.actualMonths);
    if (previewMonth < 1 && schedule.actualMonths > 0) setPreviewMonth(1);
  }, [schedule.actualMonths]);

  return (
    <div className="h-main-pad" style={{ padding: '0 48px', maxWidth: 1440, margin: '0 auto' }}>
      <div className="h-grid-3">
        <ParamsPanel
          amount={amount} setAmount={setAmount}
          months={months} setMonths={setMonths}
          wibor={wibor} setWibor={setWibor}
          margin={margin} setMargin={setMargin}
          rateMode={rateMode} setRateMode={setRateMode}
          extra={extra} setExtra={setExtra}
          extraStrategy={extraStrategy} setExtraStrategy={setExtraStrategy}
          unitYears={unitYears} setUnitYears={setUnitYears}
        />
        <ResultsCard
          schedule={schedule}
          amount={amount}
          totalMonths={months}
          previewMonth={previewMonth}
          setPreviewMonth={setPreviewMonth}
        />
        <ChartsColumn
          schedule={schedule}
          previewMonth={previewMonth}
          setPreviewMonth={setPreviewMonth}
          amount={amount}
        />
      </div>

      <ScheduleTable schedule={schedule} overrides={overrides} setOverride={setOverride} amount={amount} totalMonths={months} />
    </div>
  );
}

window.CreditTab = CreditTab;
