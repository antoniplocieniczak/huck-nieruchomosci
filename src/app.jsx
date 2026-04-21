function App() {
  const [selectedSeg, setSelectedSeg] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [tweaks, setTweaks] = useState(INVESTMENT);

  // Apply live tweaks back to global INVESTMENT for components reading it
  useEffect(() => {
    Object.assign(INVESTMENT, tweaks);
  }, [tweaks]);

  return (
    <div key={JSON.stringify(tweaks)}>
      <Header/>
      <main>
        <Hero/>
        <PillarsSection/>
        <PlotSection onSelect={setSelectedSeg}/>
        <LocationSection/>
        <GallerySection onPlayVideo={() => setVideoOpen(true)}/>
        <ScheduleCalcSection selectedSeg={selectedSeg}/>
        <DeveloperSection/>
        <FAQSection/>
        <ContactSection/>
      </main>
      <Footer/>

      {selectedSeg && <SegmentPanel seg={selectedSeg} onClose={() => setSelectedSeg(null)}/>}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)}/>}

      <TweaksPanel tweaks={tweaks} setTweaks={setTweaks}/>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
