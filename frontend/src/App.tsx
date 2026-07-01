import { useEffect, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";

import { AmbientBackground } from "@/components/shell/AmbientBackground";
import { IntakeCapsule } from "@/components/intake/IntakeCapsule";
import { LoadingState } from "@/components/shell/LoadingState";
import { VideoHeader } from "@/components/shell/VideoHeader";
import { EdgeChips } from "@/components/shell/EdgeChips";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { CommentDetail } from "@/components/shell/CommentDetail";
import { PulsePanel } from "@/components/panels/PulsePanel";
import { VoicesPanel } from "@/components/panels/VoicesPanel";
import { SignalPanel } from "@/components/panels/SignalPanel";
import { LexiconPanel } from "@/components/panels/LexiconPanel";
import { AnalyticsSection } from "@/components/analytics/AnalyticsSection";
import { CenterStage } from "@/components/field/CenterStage";

import { analyzeVideo, AnalyzeError } from "@/api/analyze";
import { useResonanceStore, type PanelId } from "@/store/useResonanceStore";

const PANEL_META: Record<PanelId, { label: string; description: string }> = {
  pulse: { label: "Pulse", description: "Aggregate mood" },
  voices: { label: "Voices", description: "Standout comments" },
  signal: { label: "Signal", description: "Sentiment over time" },
  lexicon: { label: "Lexicon", description: "Words driving the mood" },
};

function App() {
  const {
    phase,
    data,
    errorMessage,
    openPanels,
    commandPaletteOpen,
    selectedComment,
    setLoading,
    setData,
    setError,
    reset,
    togglePanel,
    setCommandPaletteOpen,
    setSelectedComment,
  } = useResonanceStore();

  const mutation = useMutation({
    mutationFn: analyzeVideo,
    onMutate: () => setLoading(),
    onSuccess: (response) => setData(response),
    onError: (err: unknown) => {
      const message = err instanceof AnalyzeError ? err.message : "Unexpected error.";
      setError(message);
    },
  });

  function handleSubmit(url: string) {
    mutation.mutate({ url });
  }

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        if (phase === "field") {
          e.preventDefault();
          setCommandPaletteOpen(!commandPaletteOpen);
        }
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setSelectedComment(null);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [phase, commandPaletteOpen, setCommandPaletteOpen, setSelectedComment]);

  const closedPanels = useMemo(
    () =>
      (Object.keys(openPanels) as PanelId[])
        .filter((id) => !openPanels[id])
        .map((id) => ({ id, label: PANEL_META[id].label })),
    [openPanels]
  );

  const paletteEntries = useMemo(
    () =>
      (Object.keys(PANEL_META) as PanelId[]).map((id) => ({
        id,
        label: PANEL_META[id].label,
        description: PANEL_META[id].description,
        isOpen: openPanels[id],
      })),
    [openPanels]
  );

  const moodScore = phase === "field" && data ? data.breakdown.mood_score : 0;

  return (
    <div className="relative min-h-screen w-full">
      <AmbientBackground moodScore={moodScore} />

      <AnimatePresence mode="wait">
        {phase === "intake" && (
          <IntakeCapsule
            key="intake"
            onSubmit={handleSubmit}
            disabled={mutation.isPending}
            errorMessage={errorMessage}
          />
        )}
        {phase === "loading" && <LoadingState key="loading" />}
        {phase === "error" && (
          <IntakeCapsule key="intake-error" onSubmit={handleSubmit} errorMessage={errorMessage} />
        )}
        {phase === "field" && data && (
          <div key="field" className="relative min-h-screen w-full">
            {/* floating chrome layer */}
            <div className="pointer-events-none relative z-10 flex min-h-screen flex-col items-center gap-6 p-5">
              <VideoHeader
                video={data.video}
                fetchedCommentCount={data.fetched_comment_count}
                onNewAnalysis={reset}
              />

              <div className="grid w-full max-w-7xl flex-1 grid-cols-1 gap-5 lg:grid-cols-[340px_1fr_340px]">
                <div className="pointer-events-none flex flex-col gap-5">
                  {openPanels.pulse && (
                    <PulsePanel breakdown={data.breakdown} onClose={() => togglePanel("pulse")} />
                  )}
                  {openPanels.lexicon && (
                    <LexiconPanel lexicon={data.lexicon} onClose={() => togglePanel("lexicon")} />
                  )}
                </div>

                {/* center column */}
                <div className="pointer-events-none flex flex-col items-center justify-start pt-4">
                  {phase === "field" && data && (
                    <CenterStage
                      video={data.video}
                      breakdown={data.breakdown}
                      moodScore={data.breakdown.mood_score}
                    />
                  )}
                </div>

                <div className="pointer-events-none flex flex-col gap-5">
                  {openPanels.voices && (
                    <VoicesPanel
                      voices={data.voices}
                      onClose={() => togglePanel("voices")}
                      onSelect={setSelectedComment}
                    />
                  )}
                  {openPanels.signal && (
                    <SignalPanel timeline={data.timeline} onClose={() => togglePanel("signal")} />
                  )}
                </div>
              </div>
            </div>

            <EdgeChips closedPanels={closedPanels} onOpen={togglePanel} />
            <CommandPalette
              open={commandPaletteOpen}
              onClose={() => setCommandPaletteOpen(false)}
              panels={paletteEntries}
              onTogglePanel={togglePanel}
            />
            <CommentDetail comment={selectedComment} onClose={() => setSelectedComment(null)} />
            
            {/* Scrollable Analytics Section */}
            <AnalyticsSection />
            
            <footer className="w-full border-t border-white/8 py-8 text-center bg-transparent relative z-20">
              <p className="font-mono-data text-[12px] text-[var(--rs-text-tertiary)]">
                Designed & Built by <span className="transition-colors duration-300 hover:text-[var(--rs-text-secondary)] cursor-pointer">Mohammed Subhan</span>
              </p>
            </footer>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
