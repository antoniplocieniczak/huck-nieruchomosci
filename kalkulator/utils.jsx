// Formatting + financial math helpers for Huck kalkulator

const NBSP = '\u00A0';

function formatPLN(n, { showCurrency = true, decimals = 0 } = {}) {
  if (!isFinite(n)) n = 0;
  const rounded = decimals > 0 ? n : Math.round(n);
  const [intPart, decPart] = Math.abs(rounded).toFixed(decimals).split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const sign = n < 0 ? '-' : '';
  const joined = decPart ? `${withSep},${decPart}` : withSep;
  return showCurrency ? `${sign}${joined}${NBSP}zł` : `${sign}${joined}`;
}

function formatPct(n, decimals = 2) {
  if (!isFinite(n)) n = 0;
  return `${n.toFixed(decimals).replace('.', ',')}%`;
}

function formatNumber(n, decimals = 0) {
  if (!isFinite(n)) n = 0;
  const rounded = decimals > 0 ? n : Math.round(n);
  const [intPart, decPart] = Math.abs(rounded).toFixed(decimals).split('.');
  const withSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  const sign = n < 0 ? '-' : '';
  return decPart ? `${sign}${withSep},${decPart}` : `${sign}${withSep}`;
}

const POLISH_MONTHS = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
];
function formatDatePL(date) {
  return `${date.getDate()}${NBSP}${POLISH_MONTHS[date.getMonth()]}${NBSP}${date.getFullYear()}`;
}
function addMonths(date, m) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + m);
  return d;
}

// Annuity (rata stała): R = K * (r * (1+r)^n) / ((1+r)^n - 1)
function annuityPayment(principal, annualRatePct, nMonths) {
  if (nMonths <= 0 || principal <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / nMonths;
  const pow = Math.pow(1 + r, nMonths);
  return principal * (r * pow) / (pow - 1);
}

/**
 * Build schedule.
 * @param opts
 *   amount, months (total), annualRatePct, mode ('equal' | 'declining'),
 *   extraPerMonth, extraStrategy ('shorten' | 'reduce'),
 *   scheduleOverrides: { [monthIndex]: { ratePct?, extra? } } — overrides from schedule editing
 *   startDate: Date
 */
function buildSchedule(opts) {
  const {
    amount,
    months: totalMonths,
    annualRatePct,
    mode = 'equal',
    extraPerMonth = 0,
    extraStrategy = 'shorten',
    scheduleOverrides = {},
    startDate = new Date(),
  } = opts;

  const rows = [];
  let remaining = amount;
  let remainingMonths = totalMonths;
  let currentPayment = annuityPayment(amount, annualRatePct, totalMonths);
  let currentRate = annualRatePct;
  const basePrincipalDeclining = amount / totalMonths;

  const MAX = 600; // hard guard
  let m = 1;
  let paidSoFar = 0;
  while (remaining > 0.5 && m <= MAX) {
    const override = scheduleOverrides[m] || {};
    const rateThisMonth = override.ratePct != null ? override.ratePct : currentRate;
    const extraThisMonth = override.extra != null ? override.extra : extraPerMonth;
    const r = rateThisMonth / 100 / 12;

    // If rate was overridden mid-schedule, recompute payment from remaining
    if (override.ratePct != null && override.ratePct !== currentRate) {
      currentRate = override.ratePct;
      if (mode === 'equal') {
        currentPayment = annuityPayment(remaining, currentRate, remainingMonths);
      }
    }

    const interest = remaining * r;
    let principal;
    let payment;

    if (mode === 'equal') {
      payment = currentPayment;
      principal = payment - interest;
      if (principal < 0) principal = 0;
    } else {
      // declining: principal fixed at base, interest varies
      principal = basePrincipalDeclining;
      payment = principal + interest;
    }

    // Apply extra
    let extra = extraThisMonth;
    // Don't overpay beyond remaining
    if (principal + extra > remaining) {
      extra = Math.max(0, remaining - principal);
    }

    const totalPrincipalThisMonth = principal + extra;
    const newRemaining = remaining - totalPrincipalThisMonth;
    const totalPaidThisMonth = payment + extra;
    paidSoFar += totalPaidThisMonth;

    rows.push({
      month: m,
      date: addMonths(startDate, m - 1),
      remainingBefore: remaining,
      remainingAfter: Math.max(0, newRemaining),
      payment,
      principal,
      interest,
      extra,
      totalPaid: totalPaidThisMonth,
      paidSoFar,
      ratePct: rateThisMonth,
    });

    remaining = newRemaining;
    remainingMonths -= 1;

    // Reduce-rate strategy: if there was extra payment, recompute payment
    if (extra > 0 && extraStrategy === 'reduce' && mode === 'equal' && remaining > 0.5 && remainingMonths > 0) {
      currentPayment = annuityPayment(remaining, currentRate, remainingMonths);
    }

    m++;
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPaid = rows.reduce((s, r) => s + r.totalPaid, 0);
  const totalExtra = rows.reduce((s, r) => s + r.extra, 0);

  return {
    rows,
    totalInterest,
    totalPaid,
    totalExtra,
    actualMonths: rows.length,
    firstPayment: rows[0] || null,
  };
}

// Simple debounce hook
function useDebouncedValue(value, delay = 50) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

// Savings calculator
function calcSavings({ initial, monthly, annualRatePct, months, compounding = 'monthly' }) {
  const rows = [];
  let balance = initial;
  let totalContrib = initial;
  const rAnnual = annualRatePct / 100;
  let perPeriodRate, periodsPerMonth;
  if (compounding === 'daily') { perPeriodRate = rAnnual / 365; periodsPerMonth = 30; }
  else if (compounding === 'yearly') { perPeriodRate = rAnnual; periodsPerMonth = 1/12; }
  else { perPeriodRate = rAnnual / 12; periodsPerMonth = 1; }

  for (let m = 1; m <= months; m++) {
    // Monthly deposit at start of month
    balance += monthly;
    totalContrib += monthly;
    // Apply compound interest for this month
    if (compounding === 'yearly') {
      if (m % 12 === 0) balance *= (1 + perPeriodRate);
    } else {
      balance *= Math.pow(1 + perPeriodRate, periodsPerMonth);
    }
    rows.push({ month: m, balance, contributed: totalContrib, interest: balance - totalContrib });
  }
  return { rows, finalBalance: balance, totalContrib, totalInterest: balance - totalContrib };
}

Object.assign(window, {
  formatPLN,
  formatPct,
  formatNumber,
  formatDatePL,
  addMonths,
  annuityPayment,
  buildSchedule,
  useDebouncedValue,
  calcSavings,
});
