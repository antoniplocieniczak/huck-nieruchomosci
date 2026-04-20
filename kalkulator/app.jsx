// Root App

function App() {
  const [tab, setTab] = React.useState(() => {
    try { return localStorage.getItem('huck-tab') || 'credit'; } catch { return 'credit'; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('huck-tab', tab); } catch {}
  }, [tab]);

  return (
    <>
      <TopBar />
      <Hero activeTab={tab} />
      <Tabs value={tab} onChange={setTab} />

      <main className="fade-in" key={tab}>
        {tab === 'credit' && <CreditTab />}
        {tab === 'refi'   && <RefinanceTab />}
        {tab === 'save'   && <SavingsTab />}
      </main>

      <LeadMagnet />

      <Footer />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
